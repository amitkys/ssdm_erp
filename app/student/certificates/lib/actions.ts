"use server";

import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray, or } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CertificateMetaDataTable,
  CertificateRequestTable,
} from "@/lib/db/schema/certificate";
import { AdmittedStudentTable } from "@/lib/db/schema/student";
import { GcmPgEncryption } from "@/lib/getepay-encrypt";
import { safeJsonParse, sanitizeForGateway } from "@/lib/sanitize-for-gateway";

// ─── HELPERS ────────────────────────────────────────────────────────────────────

async function getAuthenticatedStudent() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "student") {
    return null;
  }

  const email = session.user.email;

  let student = await db.query.AdmittedStudentTable.findFirst({
    where: eq(AdmittedStudentTable.email, email),
  });

  // Fallback: UAN-based email format
  if (!student && email.endsWith("@student.ssdm.local")) {
    const uan = email.split("@")[0].toUpperCase();
    student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.UAN, uan),
    });
  }

  return student;
}

// ─── GET CERTIFICATE TYPES ──────────────────────────────────────────────────────

export async function getCertificateTypes() {
  try {
    const types = await db
      .select()
      .from(CertificateMetaDataTable)
      .orderBy(CertificateMetaDataTable.certificate_type);

    return { success: true, data: types };
  } catch (error) {
    console.error("[getCertificateTypes] Error:", error);
    return { success: false, message: "Failed to fetch certificate types." };
  }
}

// ─── GET STUDENT CERTIFICATE REQUESTS ───────────────────────────────────────────

export async function getStudentCertificateRequests() {
  try {
    const student = await getAuthenticatedStudent();
    if (!student) {
      return { success: false, message: "Unauthorized" };
    }

    const requests = await db.query.CertificateRequestTable.findMany({
      where: eq(CertificateRequestTable.studentId, student.id),
      with: { certificate: true },
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });

    return { success: true, data: requests, student };
  } catch (error) {
    console.error("[getStudentCertificateRequests] Error:", error);
    return { success: false, message: "Failed to fetch certificate requests." };
  }
}

// ─── REQUEST CERTIFICATE ────────────────────────────────────────────────────────

export async function requestCertificate(params: {
  certificateId: string;
  certificate_type: string;
  purpose: string;
  passingMonth: string;
  passingYear: string;
}) {
  try {
    const student = await getAuthenticatedStudent();
    if (!student) {
      return { success: false, message: "Unauthorized" };
    }

    const {
      certificateId,
      certificate_type,
      purpose,
      passingMonth,
      passingYear,
    } = params;

    // Validate certificate type
    if (!["CLC", "CHARACTER", "BONAFIDE", "TEST"].includes(certificate_type)) {
      return { success: false, message: "Invalid certificate type." };
    }

    // Check for duplicate: no existing INITIATE or PENDING for same student + certificate_type
    const existing = await db.query.CertificateRequestTable.findFirst({
      where: and(
        eq(CertificateRequestTable.studentId, student.id),
        eq(CertificateRequestTable.certificate_type, certificate_type),
        inArray(CertificateRequestTable.status, ["INITIATE", "PENDING"]),
      ),
    });

    if (existing) {
      return {
        success: false,
        message: `You already have a pending or initiated ${certificate_type} certificate request. Please complete or cancel it before creating a new one.`,
      };
    }

    // Verify the certificateId exists
    const certMeta = await db.query.CertificateMetaDataTable.findFirst({
      where: eq(CertificateMetaDataTable.id, certificateId),
    });

    if (!certMeta) {
      return { success: false, message: " metadata." };
    }

    const requestId = createId();

    await db
      .insert(CertificateRequestTable)
      .values({
        id: requestId,
        studentId: student.id,
        certificateId,
        certificate_type,
        purpose,
        passingMonth,
        passingYear,
        status: "INITIATE",
        amount: null,
        transactionId: null,
      });

    return { success: true, requestId };
  } catch (error) {
    console.error("[requestCertificate] Error:", error);
    return {
      success: false,
      message: "Something went wrong while creating certificate request.",
    };
  }
}

// ─── CANCEL CERTIFICATE REQUEST ─────────────────────────────────────────────────

export async function cancelCertificateRequest(requestId: string) {
  try {
    const student = await getAuthenticatedStudent();
    if (!student) {
      return { success: false, message: "Unauthorized" };
    }

    const request = await db.query.CertificateRequestTable.findFirst({
      where: and(
        eq(CertificateRequestTable.id, requestId),
        eq(CertificateRequestTable.studentId, student.id),
        eq(CertificateRequestTable.status, "INITIATE"),
      ),
    });

    if (!request) {
      return {
        success: false,
        message: "Request not found or cannot be cancelled.",
      };
    }

    await db
      .update(CertificateRequestTable)
      .set({ status: "CANCELLED", updatedAt: new Date() })
      .where(eq(CertificateRequestTable.id, requestId));

    return { success: true };
  } catch (error) {
    console.error("[cancelCertificateRequest] Error:", error);
    return {
      success: false,
      message: "Something went wrong while cancelling request.",
    };
  }
}

// ─── INITIATE CERTIFICATE PAYMENT ───────────────────────────────────────────────
// Mirrors initiatePayment from admission payment module

export async function initiateCertificatePayment(requestId: string) {
  try {
    const student = await getAuthenticatedStudent();
    if (!student) {
      return { success: false, message: "Unauthorized" };
    }

    // Fetch the request
    const request = await db.query.CertificateRequestTable.findFirst({
      where: and(
        eq(CertificateRequestTable.id, requestId),
        eq(CertificateRequestTable.studentId, student.id),
        eq(CertificateRequestTable.status, "INITIATE"),
      ),
    });

    if (!request) {
      return {
        success: false,
        message: "Request not found or payment already initiated.",
      };
    }

    // Fetch fee from CertificateMetaDataTable
    const certMeta = await db.query.CertificateMetaDataTable.findFirst({
      where: eq(CertificateMetaDataTable.id, request.certificateId),
    });

    if (!certMeta) {
      return { success: false, message: "Certificate metadata not found." };
    }

    const totalAmount = certMeta.fee;

    // Setup GetEpay configurations (same env vars as admission)
    const mid = process.env.GETEPAY_MID;
    const terminalId = process.env.GETEPAY_TERMINAL_ID;
    const getepayKey = process.env.GETEPAY_KEY;
    const getepayIv = process.env.GETEPAY_IV;
    const getepayUrl = process.env.GETEPAY_URL;
    // Derive base URL from dedicated env vars, then NEXT_PUBLIC_APP_URL
    const getBaseUrl = () => {
      // If GETEPAY_RETURN_URL is set, extract its origin (most reliable in production)
      if (process.env.GETEPAY_RETURN_URL) {
        try {
          const u = new URL(process.env.GETEPAY_RETURN_URL);
          return u.origin;
        } catch { /* fall through */ }
      }
      return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    };
    const appUrl = getBaseUrl();

    const returnUrl = `${appUrl}/api/certificate-payments/redirect`;
    const callbackUrl = `${appUrl}/api/certificate-payments/callback`;

    if (!mid || !terminalId || !getepayKey || !getepayIv || !getepayUrl) {
      return {
        success: false,
        message:
          "GetEpay credentials are not properly configured in the system environment.",
      };
    }

    // Generate transaction ID (same pattern as admission)
    const txnId = `CERT-TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Update request with generated transaction ID
    await db
      .update(CertificateRequestTable)
      .set({
        transactionId: txnId,
        paymentStatus: "PENDING",
        updatedAt: new Date(),
      })
      .where(eq(CertificateRequestTable.id, requestId));

    // Build return and callback URLs with requestId
    const buildUrlWithId = (baseUrl: string, id: string) => {
      try {
        const u = new URL(baseUrl);
        u.searchParams.set("requestId", id);
        return u.toString();
      } catch {
        return `${baseUrl}?requestId=${id}`;
      }
    };

    const finalReturnUrl = buildUrlWithId(returnUrl, requestId);
    const finalCallbackUrl = buildUrlWithId(callbackUrl, requestId);

    // Sanitize student details for gateway compatibility (strip non-ASCII)
    const safeName = sanitizeForGateway(student.name || "Student");
    const safePhone = sanitizeForGateway(student.phone || "");
    const safeEmail = sanitizeForGateway(student.email || "");

    // Prepare payload for GetEpay (identical structure to admission)
    const payloadJson = {
      mid: String(mid).trim(),
      terminalId: String(terminalId).trim(),
      amount: String(totalAmount.toFixed(2)),
      merchantTransactionId: txnId,
      merchantOrderNo: requestId,
      transactionDate: new Date().toISOString(),
      ru: finalReturnUrl,
      callbackUrl: finalCallbackUrl,
      currency: "INR",
      paymentMode: "ALL",
      bankId: "455",
      txnType: "single",
      productType: "IPG",
      txnNote: `Certificate Payment for ${safeName} - ${requestId}`,
      udf1: safePhone,
      udf2: safeEmail,
      udf3: safeName,
      udf4: "",
      udf5: "",
      udf6: "",
      udf7: "",
      udf8: "",
      udf9: "",
      udf10: "",
    };

    console.log("[initiateCertificatePayment] GetEpay Payload:", payloadJson);

    // Encrypt payload
    const isProduction = process.env.NODE_ENV === "production";
    const encryptor = new GcmPgEncryption(getepayIv, getepayKey, isProduction);
    const ciphertext = await encryptor.encrypt(JSON.stringify(payloadJson));

    // POST to GetEpay generateInvoice
    const response = await fetch(getepayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mid: String(mid).trim(),
        terminalId: String(terminalId).trim(),
        req: ciphertext,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `GetEpay invoice request failed with HTTP ${response.status}`,
      );
    }

    const resJson = await response.json();
    console.log(
      "[initiateCertificatePayment] GetEpay API Raw Response:",
      resJson,
    );

    const isSuccessStatus = (status: any) =>
      String(status || "")
        .trim()
        .toLowerCase() === "success";

    if (resJson && isSuccessStatus(resJson.status) && resJson.response) {
      const decryptedText = await encryptor.decrypt(resJson.response);
      const decrypted = safeJsonParse(decryptedText);
      console.log(
        "[initiateCertificatePayment] Decrypted GetEpay Response:",
        decrypted,
      );

      if (decrypted && decrypted.paymentUrl) {
        return { success: true, paymentUrl: decrypted.paymentUrl, requestId };
      } else {
        if (!isProduction) {
          console.warn(
            "[initiateCertificatePayment] GetEpay Sandbox returned validation error. Redirecting to Sandbox Bypass Checkout.",
          );
          return {
            success: true,
            paymentUrl: `/student/certificates/mock-checkout?requestId=${requestId}`,
            requestId,
            isMock: true,
          };
        }
        return {
          success: false,
          message:
            decrypted.message || "GetEpay returned an error in the response.",
        };
      }
    } else {
      if (!isProduction) {
        console.warn(
          "[initiateCertificatePayment] GetEpay Sandbox API failed. Redirecting to Sandbox Bypass Checkout.",
        );
        return {
          success: true,
          paymentUrl: `/student/certificates/mock-checkout?requestId=${requestId}`,
          requestId,
          isMock: true,
        };
      }
      return {
        success: false,
        message:
          resJson.message || "Failed to initiate payment invoice request.",
      };
    }
  } catch (error) {
    console.error("[initiateCertificatePayment] Error:", error);
    return {
      success: false,
      message: "Something went wrong while initiating payment.",
    };
  }
}

// ─── SIMULATE CERTIFICATE CALLBACK (Dev/Sandbox Only) ───────────────────────────
// Mirrors simulateCallback from admission payment module

export async function simulateCertificateCallback(params: {
  requestId: string;
  status: "SUCCESS" | "FAILED";
}) {
  try {
    const { requestId, status } = params;

    const request = await db.query.CertificateRequestTable.findFirst({
      where: eq(CertificateRequestTable.id, requestId),
      with: { certificate: true },
    });

    if (!request) {
      return { success: false, message: "Certificate request not found." };
    }

    const mid = process.env.GETEPAY_MID || "108";
    const getepayKey = process.env.GETEPAY_KEY;
    const getepayIv = process.env.GETEPAY_IV;

    if (!getepayKey || !getepayIv) {
      throw new Error(
        "Missing GetEpay encryption keys in system configuration.",
      );
    }

    const mockResponse = {
      mid,
      merchantOrderNo: requestId,
      txnStatus: status,
      getepayTxnId: `CERT-BANK-MOCK-${Date.now()}`,
      paymentMode: "Online",
      txnAmount: String(Number(request.certificate.fee).toFixed(2)),
    };

    const isProduction = process.env.NODE_ENV === "production";
    const encryptor = new GcmPgEncryption(getepayIv, getepayKey, isProduction);
    const encryptedText = await encryptor.encrypt(JSON.stringify(mockResponse));

    // Send callback to local route
    // Derive base URL from dedicated env vars, then NEXT_PUBLIC_APP_URL
    const getBaseUrl = () => {
      if (process.env.GETEPAY_RETURN_URL) {
        try {
          const u = new URL(process.env.GETEPAY_RETURN_URL);
          return u.origin;
        } catch { /* fall through */ }
      }
      return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    };
    const appUrl = getBaseUrl();
    const callbackUrl = `${appUrl}/api/certificate-payments/callback?requestId=${requestId}`;

    const res = await fetch(callbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: encryptedText }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Callback handler failed with HTTP ${res.status}: ${text}`,
      );
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("[simulateCertificateCallback] Error:", error);
    return {
      success: false,
      message: "Something went wrong during callback simulation.",
    };
  }
}

// ─── PROCESS CERTIFICATE PAYMENT RETURN ─────────────────────────────────────────
// Mirrors processPaymentReturn from admission payment module

export async function processCertificatePaymentReturn(
  responseCiphertext: string,
  urlRequestId?: string | null,
) {
  try {
    const getepayKey = process.env.GETEPAY_KEY;
    const getepayIv = process.env.GETEPAY_IV;

    if (!getepayKey || !getepayIv) {
      throw new Error(
        "Missing GetEpay encryption keys in system configuration.",
      );
    }

    const cleanCiphertext = String(responseCiphertext).trim().includes(" ")
      ? String(responseCiphertext).trim().replace(/ /g, "+")
      : String(responseCiphertext).trim();

    const isProduction = process.env.NODE_ENV === "production";
    const encryptor = new GcmPgEncryption(getepayIv, getepayKey, isProduction);
    const decryptedText = await encryptor.decrypt(cleanCiphertext);
    const decrypted = safeJsonParse(decryptedText);

    console.log(
      "[processCertificatePaymentReturn] Decrypted return payload:",
      decrypted,
    );

    // Validate gateway credentials
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
    let requestId = decrypted.merchantOrderNo;
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
    const errorMessage = decrypted.message || decrypted.errorMessage || null;
    const txnAmount = decrypted.txnAmount || decrypted.totalAmount || null;

    // GetEpay often returns merchantTransactionId in merchantOrderNo field
    if (urlRequestId && requestId && requestId !== urlRequestId) {
      console.warn(
        "[processCertificatePaymentReturn] merchantOrderNo mismatch — GetEpay returned txnId instead of requestId:",
        { merchantOrderNo: requestId, urlRequestId },
      );
    }

    console.log("[processCertificatePaymentReturn] Extracted fields:", {
      requestId,
      urlRequestId,
      txnStatus,
      bankTxnNo,
      txnAmount,
    });

    const lookupIds = Array.from(
      new Set(
        [
          urlRequestId,
          decrypted.merchantOrderNo,
          decrypted.merchantTransactionId,
          decrypted.getepayTxnId,
          decrypted.bankTxnNo,
        ].filter(
          (id): id is string => typeof id === "string" && id.trim().length > 0,
        ),
      ),
    );

    if (lookupIds.length === 0) {
      throw new Error(
        "Missing merchantOrderNo or requestId in response payload.",
      );
    }

    const existingRequest = await db.query.CertificateRequestTable.findFirst({
      where: or(
        inArray(CertificateRequestTable.id, lookupIds),
        inArray(CertificateRequestTable.transactionId, lookupIds),
      ),
      with: { certificate: true },
    });

    if (!existingRequest) {
      throw new Error("Certificate request record not found in system.");
    }

    requestId = existingRequest.id;

    // IDEMPOTENCY: Don't overwrite a successful payment
    if (existingRequest.paymentStatus === "SUCCESS") {
      return {
        success: true,
        requestId,
        status: existingRequest.status,
        paymentStatus: "SUCCESS",
        amount: existingRequest.amount ?? existingRequest.certificate.fee,
        txnId: existingRequest.transactionId || null,
        errorMessage: null,
      };
    }

    const isSuccess = txnStatus === "SUCCESS";

    if (isSuccess) {
      const amount = txnAmount
        ? Number(String(txnAmount).replace(/,/g, ""))
        : existingRequest.certificate.fee;

      await db
        .update(CertificateRequestTable)
        .set({
          status: "PENDING",
          paymentStatus: "SUCCESS",
          transactionId:
            bankTxnNo ||
            existingRequest.transactionId ||
            `CERT-TXN-${Date.now()}`,
          amount,
          updatedAt: new Date(),
        })
        .where(eq(CertificateRequestTable.id, requestId));

      console.log("[processCertificatePaymentReturn] DB updated to SUCCESS:", {
        requestId,
        status: "PENDING",
        paymentStatus: "SUCCESS",
        amount,
        transactionId: bankTxnNo,
      });
    } else {
      await db
        .update(CertificateRequestTable)
        .set({
          paymentStatus: "FAILED",
          // status stays "INITIATE" — student can retry payment
          updatedAt: new Date(),
        })
        .where(eq(CertificateRequestTable.id, requestId));

      console.log("[processCertificatePaymentReturn] DB updated to FAILED:", {
        requestId,
        paymentStatus: "FAILED",
        txnStatus,
      });
    }

    return {
      success: true,
      requestId,
      status: isSuccess ? "PENDING" : "INITIATE",
      paymentStatus: isSuccess ? "SUCCESS" : "FAILED",
      amount: isSuccess
        ? txnAmount
          ? Number(String(txnAmount).replace(/,/g, ""))
          : existingRequest.certificate.fee
        : null,
      txnId: bankTxnNo || null,
      errorMessage: isSuccess ? null : errorMessage,
    };
  } catch (error) {
    console.error("[processCertificatePaymentReturn] Error:", error);
    return {
      success: false,
      message: "Something went wrong during payment processing.",
    };
  }
}
