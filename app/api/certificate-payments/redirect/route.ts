import { NextResponse } from "next/server";
import { processCertificatePaymentReturn } from "@/app/student/certificates/lib/actions";

async function handleRedirect(req: Request) {
  const url = new URL(req.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  try {
    const requestId = url.searchParams.get("requestId");

    console.log("[Certificate Redirect API] Incoming redirect request:", {
      method: req.method,
      url: req.url,
      requestId,
    });

    let body: Record<string, unknown> = {};
    if (req.method === "POST") {
      try {
        const rawBodyText = await req.text();
        console.log(
          "[Certificate Redirect API] Raw body text received:",
          rawBodyText,
        );

        if (rawBodyText) {
          try {
            body = JSON.parse(rawBodyText) as Record<string, unknown>;
          } catch {
            try {
              body = Object.fromEntries(
                new URLSearchParams(rawBodyText).entries(),
              ) as Record<string, unknown>;
            } catch (formErr) {
              console.error(
                "[Certificate Redirect API] Form parsing failed:",
                formErr,
              );
            }
          }
        }
      } catch (bodyErr) {
        console.error(
          "[Certificate Redirect API] Error reading body text:",
          bodyErr,
        );
      }
    }

    const rawResponse =
      (body.response as string | undefined) ||
      (body.resp as string | undefined) ||
      url.searchParams.get("response") ||
      url.searchParams.get("resp") ||
      null;

    console.log("[Certificate Redirect API] Raw Response received:", {
      hasRawResponse: !!rawResponse,
      requestId,
      method: req.method,
    });

    if (!rawResponse) {
      console.warn("[Certificate Redirect API] Missing response ciphertext");
      if (requestId) {
        return NextResponse.redirect(
          new URL(
            `/certificate-payment-success?requestId=${requestId}`,
            appUrl,
          ),
          303,
        );
      }
      return NextResponse.redirect(
        new URL(
          "/certificate-payment-success?error=missing_payload",
          appUrl,
        ),
        303,
      );
    }

    // Fix spaces that may have replaced + signs during transit
    const responseCiphertext = String(rawResponse).trim().includes(" ")
      ? String(rawResponse).trim().replace(/ /g, "+")
      : String(rawResponse).trim();

    const result = await processCertificatePaymentReturn(responseCiphertext, requestId);
    console.log(
      "[Certificate Redirect API] Processed payment return result:",
      result,
    );

    const targetRequestId = requestId || result.requestId;
    console.log("[Certificate Redirect API] Redirect target:", {
      targetRequestId,
      resultStatus: result.status,
      resultPaymentStatus: result.paymentStatus,
      resultSuccess: result.success,
    });

    if (targetRequestId) {
      return NextResponse.redirect(
        new URL(
          `/certificate-payment-success?requestId=${targetRequestId}`,
          appUrl,
        ),
        303,
      );
    }

    return NextResponse.redirect(
      new URL(
        "/certificate-payment-success?error=invalid_payload",
        appUrl,
      ),
      303,
    );
  } catch (error) {
    const err = error as Error;
    console.error(
      "[Certificate Redirect API] Error processing return:",
      err,
    );
    const requestId = url.searchParams.get("requestId");
    if (requestId) {
      return NextResponse.redirect(
        new URL(
          `/certificate-payment-success?requestId=${requestId}&error=${encodeURIComponent(
            err.message || "processing_error",
          )}`,
          appUrl,
        ),
        303,
      );
    }
    return NextResponse.redirect(
      new URL(
        `/certificate-payment-success?error=${encodeURIComponent(err.message || "unknown_error")}`,
        appUrl,
      ),
      303,
    );
  }
}

export async function GET(req: Request) {
  return handleRedirect(req);
}

export async function POST(req: Request) {
  return handleRedirect(req);
}
