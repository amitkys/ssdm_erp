const crypto = require("node:crypto");

// Load env variables manually
require("dotenv").config();

class GcmPgEncryption {
  constructor(iv, key) {
    this.iv = iv;
    this.key = key;
    this.mKey = null;
  }

  async init() {
    const combined = this.key + this.iv;
    const hash = crypto.createHash("sha256").update(combined).digest();
    this.mKey = Buffer.from(hash).toString("base64");
  }

  async encrypt(plainText) {
    if (!this.mKey) await this.init();

    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);

    const derivedKey = crypto.pbkdf2Sync(
      this.mKey,
      salt,
      65535,
      32,
      "sha512"
    );

    const cipher = crypto.createCipheriv("aes-256-gcm", derivedKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainText, "utf8"),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();
    return Buffer.concat([salt, iv, encrypted, tag]).toString("base64");
  }
}

async function runTest() {
  const mid = process.env.GETEPAY_MID;
  const terminalId = process.env.GETEPAY_TERMINAL_ID;
  const getepayKey = process.env.GETEPAY_KEY;
  const getepayIv = process.env.GETEPAY_IV;
  
  // Try without :443 port
  const getepayUrl = "https://portal.getepay.in/getepayPortal/pg/v2/generateInvoice";

  const paymentId = "test-payment-id";
  const txnId = `TXN-${Date.now()}`;
  const finalReturnUrl = "https://santsandhyadasmahilacollege.org/api/payments/redirect?paymentId=" + paymentId;
  const finalCallbackUrl = "https://santsandhyadasmahilacollege.org/api/payments/callback?paymentId=" + paymentId;
  
  const payloadJson = {
    mid: String(mid).trim(),
    terminalId: String(terminalId).trim(),
    amount: "10500",
    merchantTransactionId: txnId,
    transactionDate: new Date().toISOString(),
    ru: finalReturnUrl,
    callbackUrl: finalCallbackUrl,
    currency: "INR",
    paymentMode: "ALL",
    bankId: "455",
    txnType: "single",
    productType: "IPG",
    txnNote: "Test payment note",
    udf1: "1234567890",
    udf2: "test@example.com",
    udf3: "Test Student",
    udf4: "",
    udf5: "",
    udf6: "",
    udf7: "",
    udf8: "",
    udf9: "",
    udf10: "",
  };

  console.log("Testing URL without port 443...");
  const encryptor = new GcmPgEncryption(getepayIv, getepayKey);
  const ciphertext = await encryptor.encrypt(JSON.stringify(payloadJson));

  try {
    const response = await fetch(getepayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mid: String(mid).trim(),
        terminalId: String(terminalId).trim(),
        req: ciphertext,
      }),
    });

    const resJson = await response.json();
    console.log("Raw Response:", JSON.stringify(resJson, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

runTest();
