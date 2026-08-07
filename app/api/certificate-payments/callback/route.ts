import { eq, inArray, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CertificateRequestTable } from "@/lib/db/schema/certificate";
import { GcmPgEncryption } from "@/lib/getepay-encrypt";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    let requestId = url.searchParams.get("requestId");

    console.log("[Certificate Callback API] Incoming callback request:", {
      method: req.method,
      url: req.url,
      requestId,
    });

    // Parse body if it exists
    let body: any = {};
    try {
      body = await req.json();
    } catch {
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

    console.log("[Certificate Callback API] Raw response extraction:", {
      hasRawResponse: !!rawResponse,
      requestId,
    });

    if (!rawResponse) {
      console.warn("[Certificate Callback API] Missing response ciphertext");
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
    const decrypted = JSON.parse(decryptedText);

    console.log(
      "[Certificate Callback API] Decrypted Callback Payload:",
      decrypted,
    );

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
    const responseRequestId = decrypted.merchantOrderNo;
    if (!requestId && responseRequestId) {
      requestId = responseRequestId;
    }

    console.log("[Certificate Callback API] Extracted fields:", {
      responseRequestId,
      requestId,
    });

    if (!requestId) {
      throw new Error(
        "Unable to identify certificate request records (missing requestId).",
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

    const txnAmount = decrypted.txnAmount || decrypted.totalAmount || null;

    console.log("[Certificate Callback API] Transaction details:", {
      txnStatus,
      bankTxnNo,
      txnAmount,
    });

    const lookupIds = [requestId, responseRequestId].filter(Boolean) as string[];

    const existingRequest = await db.query.CertificateRequestTable.findFirst({
      where: or(
        inArray(CertificateRequestTable.id, lookupIds),
        inArray(CertificateRequestTable.transactionId, lookupIds),
      ),
      with: { certificate: true },
    });

    if (!existingRequest) {
      throw new Error(
        `Certificate request record ${requestId} not found in database.`,
      );
    }

    requestId = existingRequest.id;

    console.log("[Certificate Callback API] Found certificate request:", {
      requestId: existingRequest.id,
      certificateType: existingRequest.certificate?.certificate_type,
      currentStatus: existingRequest.status,
      currentPaymentStatus: existingRequest.paymentStatus,
    });

    // IDEMPOTENCY: Don't overwrite a successful payment
    if (existingRequest.paymentStatus === "SUCCESS") {
      return NextResponse.json({
        status: "success",
        message: "Payment already processed successfully (idempotent)",
      });
    }

    const isSuccess = txnStatus === "SUCCESS";

    // Amount verification (matching admission callback)
    if (isSuccess && txnAmount !== null) {
      const expectedAmount = Number(existingRequest.certificate.fee);
      const receivedAmount = Number(String(txnAmount).replace(/,/g, ""));
      if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
        console.error(
          `[Certificate Callback API] Amount mismatch: Expected ${expectedAmount}, Received ${receivedAmount}`,
        );
        await db
          .update(CertificateRequestTable)
          .set({ paymentStatus: "FAILED", updatedAt: new Date() })
          .where(eq(CertificateRequestTable.id, requestId));

        return NextResponse.json(
          { status: "error", message: "Amount mismatch" },
          { status: 400 },
        );
      }
    }

    const status = isSuccess ? "PENDING" : existingRequest.status;
    const paymentStatus = isSuccess ? "SUCCESS" : "FAILED";

    const finalAmount = isSuccess
      ? txnAmount
        ? Number(String(txnAmount).replace(/,/g, ""))
        : existingRequest.certificate.fee
      : null;

    await db
      .update(CertificateRequestTable)
      .set({
        status,
        paymentStatus,
        amount: finalAmount,
        transactionId: bankTxnNo || (isSuccess ? `CERT-TXN-${Date.now()}` : existingRequest.transactionId),
        updatedAt: new Date(),
      })
      .where(eq(CertificateRequestTable.id, requestId));

    console.log("[Certificate Callback API] Payment updated successfully:", {
      requestId,
      status,
      paymentStatus,
      isSuccess,
      finalAmount,
      transactionId: bankTxnNo,
    });

    return NextResponse.json({
      status: "success",
      message: "Certificate payment callback processed successfully",
    });
  } catch (error: any) {
    console.error("[Certificate Callback API] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Something went wrong while processing certificate callback.",
      },
      { status: 500 },
    );
  }
}
