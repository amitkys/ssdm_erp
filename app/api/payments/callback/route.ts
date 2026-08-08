import { eq, inArray, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  EnrolledStudentTable,
  StudentFeePaymentTable,
} from "@/lib/db/schema/student";
import { GcmPgEncryption } from "@/lib/getepay-encrypt";
import { safeJsonParse } from "@/lib/sanitize-for-gateway";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    let paymentId = url.searchParams.get("paymentId");

    console.log("[Callback API] Incoming callback request:", {
      method: req.method,
      url: req.url,
      paymentId,
    });

    // Parse body if it exists
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is not JSON, might be url-encoded or empty
      try {
        const formData = await req.formData();
        body = Object.fromEntries(formData.entries());
      } catch {
        // Fallback
      }
    }

    const rawResponse =
      body.response ||
      body.resp ||
      url.searchParams.get("response") ||
      url.searchParams.get("resp") ||
      null;

    console.log("[Callback API] Raw response extraction:", {
      hasRawResponse: !!rawResponse,
      paymentId,
    });

    if (!rawResponse) {
      console.warn("[Callback API] Missing response ciphertext");
      return NextResponse.json(
        { status: "error", message: "Missing response payload" },
        { status: 400 },
      );
    }

    const responseCiphertext = String(rawResponse).trim().includes(" ")
      ? String(rawResponse).trim().replace(/ /g, "+")
      : String(rawResponse).trim();

    const getepayKey = process.env.GETEPAY_KEY;
    const getepayIv = process.env.GETEPAY_IV;

    if (!getepayKey || !getepayIv) {
      throw new Error(
        "Missing GetEpay encryption keys in system configuration.",
      );
    }

    const isProduction = process.env.NODE_ENV === "production";
    const encryptor = new GcmPgEncryption(getepayIv, getepayKey, isProduction);
    const decryptedText = await encryptor.decrypt(responseCiphertext);
    const decrypted = safeJsonParse(decryptedText);

    console.log("[Callback API] Decrypted Callback Payload:", decrypted);

    // Validate gateway credentials in response
    const configuredMid = String(process.env.GETEPAY_MID || "").trim();
    const responseMid =
      decrypted?.mid || decrypted?.merchantId || decrypted?.merchantCode || "";

    if (
      configuredMid &&
      responseMid &&
      String(responseMid).trim() !== configuredMid
    ) {
      throw new Error("Merchant ID mismatch in gateway response.");
    }

    // Extract fields
    const responsePaymentId = decrypted.merchantOrderNo;
    if (!paymentId && responsePaymentId) {
      paymentId = responsePaymentId;
    }

    if (!paymentId) {
      throw new Error(
        "Unable to identify payment records (missing paymentId).",
      );
    }

    const txnStatus = String(
      decrypted.txnStatus || decrypted.paymentStatus || decrypted.status || "",
    )
      .trim()
      .toUpperCase();

    const bankTxnNo =
      decrypted.getepayTxnId ||
      decrypted.bankTxnNo ||
      decrypted.referenceNo ||
      null;

    const paymentMode = decrypted.paymentMode || "Online";
    const txnAmount = decrypted.txnAmount || decrypted.totalAmount || null;

    console.log("[Callback API] Extracted fields:", {
      responsePaymentId,
      paymentId,
      txnStatus,
      bankTxnNo,
      txnAmount,
    });

    // Build robust lookup IDs to handle GetEpay's merchantOrderNo field swap
    const lookupIds = Array.from(
      new Set(
        [
          paymentId,
          responsePaymentId,
          decrypted.merchantTransactionId,
        ].filter(
          (id): id is string => typeof id === "string" && id.trim().length > 0,
        ),
      ),
    );

    const existingPayment = await db.query.StudentFeePaymentTable.findFirst({
      where: or(
        inArray(StudentFeePaymentTable.id, lookupIds),
        inArray(StudentFeePaymentTable.transactionId, lookupIds),
      ),
    });

    if (!existingPayment) {
      throw new Error(`Payment record not found for IDs: ${lookupIds.join(", ")}`);
    }

    // Set paymentId to the actual database CUID
    paymentId = existingPayment.id;

    console.log("[Callback API] Found payment record:", {
      paymentId: existingPayment.id,
      currentStatus: existingPayment.status,
      studentId: existingPayment.studentId,
    });

    // IDEMPOTENCY: Don't overwrite a successful payment
    if (existingPayment.status === "Success") {
      return NextResponse.json({
        status: "success",
        message: "Payment already processed successfully (idempotent)",
      });
    }

    // Verify amount mismatch
    if (txnStatus === "SUCCESS" && txnAmount !== null) {
      const expectedAmount = Number(existingPayment.amount);
      const receivedAmount = Number(String(txnAmount).replace(/,/g, ""));
      if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
        console.error(
          `[Callback API] Amount mismatch: Expected ${expectedAmount}, Received ${receivedAmount}`,
        );
        await db
          .update(StudentFeePaymentTable)
          .set({ status: "Failed", updatedAt: new Date() })
          .where(eq(StudentFeePaymentTable.id, paymentId));

        return NextResponse.json(
          { status: "error", message: "Amount mismatch" },
          { status: 400 },
        );
      }
    }

    const isSuccess = txnStatus === "SUCCESS";
    const status = isSuccess ? "Success" : "Failed";

    // Update payment record in database
    await db
      .update(StudentFeePaymentTable)
      .set({
        status,
        paymentMode,
        transactionId: bankTxnNo || existingPayment.transactionId,
        updatedAt: new Date(),
      })
      .where(eq(StudentFeePaymentTable.id, paymentId));

    if (isSuccess) {
      // Find the admitted student and set isFeePaid = true in EnrolledStudentTable
      const student = await db.query.AdmittedStudentTable.findFirst({
        where: eq(AdmittedStudentTable.id, existingPayment.studentId),
      });

      if (student) {
        // Promote currentSemesterCount by 1 if payment is for student's next semester
        if (
          existingPayment.semesterCount ===
          student.currentSemesterCount + 1
        ) {
          await db
            .update(AdmittedStudentTable)
            .set({
              currentSemesterCount: existingPayment.semesterCount,
              updatedAt: new Date(),
            })
            .where(eq(AdmittedStudentTable.id, student.id));
        }

        await db
          .update(EnrolledStudentTable)
          .set({ isFeePaid: true, updatedAt: new Date() })
          .where(eq(EnrolledStudentTable.UAN, student.UAN));
      }
    }

    console.log("[Callback API] Payment updated successfully:", {
      paymentId,
      status,
      isSuccess,
      transactionId: bankTxnNo,
    });

    return NextResponse.json({
      status: "success",
      message: "Callback processed successfully",
    });
  } catch (error: any) {
    console.error("[Callback API] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Something went wrong while processing callback.",
      },
      { status: 500 },
    );
  }
}
