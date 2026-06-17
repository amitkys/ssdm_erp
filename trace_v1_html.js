const crypto = require("node:crypto");
require("dotenv").config();

class CbcPgEncryption {
  constructor(iv, key) {
    this.iv = iv;
    this.key = key;
    this.md5Iv = crypto.createHash("md5").update(iv).digest("hex");
  }

  encrypt(plainText) {
    const iv = Buffer.from(this.md5Iv, "hex");
    const key = Buffer.from(this.key, "base64");
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    cipher.setAutoPadding(true);
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted.toUpperCase();
  }
}

async function runTest() {
  const mid = process.env.GETEPAY_MID;
  const terminalId = process.env.GETEPAY_TERMINAL_ID;
  const getepayKey = process.env.GETEPAY_KEY;
  const getepayIv = process.env.GETEPAY_IV;
  const getepayUrl = "https://portal.getepay.in/getepayPortal/pg/generateTxn";

  const paymentId = "test-payment-id";
  const txnId = `TXN-${Date.now()}`;
  const finalReturnUrl = "https://santsandhyadasmahilacollege.org/api/payments/redirect?paymentId=" + paymentId;
  const finalCallbackUrl = "https://santsandhyadasmahilacollege.org/api/payments/callback?paymentId=" + paymentId;

  const pad = (num) => String(num).padStart(2, "0");
  const date = new Date();
  const transactionDate = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

  const payloadJson = {
    mid: String(mid).trim(),
    terminalId: String(terminalId).trim(),
    amount: "10500.00",
    merchantTransactionId: txnId,
    transactionDate: transactionDate,
    ru: finalReturnUrl,
    callbackUrl: finalCallbackUrl,
    currency: "INR",
    paymentMode: "ALL",
    txnType: "single",
    productType: "PAYMENT",
    vpa: String(terminalId).trim(),
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

  const encryptor = new CbcPgEncryption(getepayIv, getepayKey);
  const ciphertext = encryptor.encrypt(JSON.stringify(payloadJson));

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

    const text = await response.text();
    require('fs').writeFileSync('v1_response.html', text, 'utf8');
    console.log("Successfully wrote v1_response.html");
  } catch (err) {
    console.error("Error:", err);
  }
}

runTest();
