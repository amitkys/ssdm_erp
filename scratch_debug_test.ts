import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const mid = process.env.GETEPAY_MID || "1379045";
const terminalId = process.env.GETEPAY_TERMINAL_ID || "getepay.merchant989958@vvsbbank";
const key = process.env.GETEPAY_KEY || "";
const iv = process.env.GETEPAY_IV || "";

const url = "https://portal.getepay.in:8443/getepayPortal/pg/v2/generateInvoice";

function encryptGCM(plainText: string): string {
  const combined = key + iv;
  const hash = crypto.createHash("sha256").update(combined).digest();
  const mKey = hash.toString("base64");

  const salt = crypto.randomBytes(16);
  const ivBuffer = crypto.randomBytes(12);

  const derivedKey = crypto.pbkdf2Sync(
    mKey,
    salt,
    65535,
    32,
    "sha512"
  );

  const cipher = crypto.createCipheriv("aes-256-gcm", derivedKey, ivBuffer);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, ivBuffer, encrypted, tag]).toString("base64");
}

async function main() {
  const txnId = `TXN-${Date.now()}`;
  const paymentId = "test_payment_id_123456";
  const finalReturnUrl = `https://santsandhyadasmahilacollege.org/api/payments/redirect?paymentId=${paymentId}`;
  const finalCallbackUrl = `https://santsandhyadasmahilacollege.org/api/payments/callback?paymentId=${paymentId}`;

  // Exact payload format from CMS-Backend (no merchantOrderNo, no vpa)
  const payloadCMS = {
    mid: mid.trim(),
    terminalId: terminalId.trim(),
    amount: "1.00",
    merchantTransactionId: txnId,
    transactionDate: new Date().toISOString(),
    ru: finalReturnUrl,
    callbackUrl: finalCallbackUrl,
    currency: "INR",
    paymentMode: "ALL",
    bankId: "455",
    txnType: "single",
    productType: "IPG",
    txnNote: "Test payment CMS-Backend payload",
    udf1: "1234567890",
    udf2: "test@example.com",
    udf3: "Test Student",
    udf4: "", udf5: "", udf6: "", udf7: "", udf8: "", udf9: "", udf10: ""
  };

  const plainText = JSON.stringify(payloadCMS);
  
  try {
    const ciphertext = encryptGCM(plainText);
    
    console.log(`\nTesting Exact CMS GCM Payload on Port 8443...`);
    console.log("Payload:", plainText);

    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        mid: mid.trim(),
        terminalId: terminalId.trim(),
        req: ciphertext
      })
    });

    const resJson = await response.json();
    console.log(`Response Status: ${resJson.status}, Message: ${resJson.message}`);
    console.log(`Response terminalId: ${resJson.terminalId}`);
    if (resJson.status === "SUCCESS") {
      console.log(`🎉 SUCCESS! Response:`, JSON.stringify(resJson, null, 2));
    }
  } catch (err: any) {
    console.log(`❌ Error: ${err.message}`);
  }
}

main().catch(console.error);
