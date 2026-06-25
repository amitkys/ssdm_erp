"use client";

import { useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PrinterIcon, XIcon } from "lucide-react";
import { numberToWords } from "../lib/number-to-words";

interface ReceiptPrintProps {
  payment: {
    invoiceNumber: string;
    reason: string;
    name: string;
    amount: number;
    address: string;
    purpose: string;
    createdAt: Date;
  };
  onClose: () => void;
}

export function ReceiptPrint({ payment, onClose }: ReceiptPrintProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    // Use a hidden iframe for printing — avoids popup blockers and
    // keeps the same origin so relative image paths work correctly.
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-10000px";
    iframe.style.left = "-10000px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    const logoUrl = `${window.location.origin}/college.png`;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${payment.invoiceNumber}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            color: #1a1a1a;
          }
          .receipt-container {
            width: 100%;
            max-width: 700px;
            margin: 0 auto;
            border: 3px solid #1a1a1a;
            border-radius: 8px;
            padding: 32px;
            position: relative;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo-container {
            width: 80px;
            height: 80px;
            border: 2px solid #333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin: 0 auto 12px auto;
          }
          .logo-container img {
            width: 68px;
            height: 68px;
            object-fit: contain;
          }
          .college-name {
            font-size: 22px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
            color: #1a1a1a;
          }
          .college-address {
            font-size: 13px;
            color: #555;
            margin-bottom: 10px;
          }
          .receipt-title {
            font-size: 17px;
            font-weight: 700;
            border: 2px solid #1a1a1a;
            border-radius: 6px;
            display: inline-block;
            padding: 8px 28px;
            margin-bottom: 14px;
            letter-spacing: 0.5px;
          }
          .invoice-line {
            text-align: center;
            font-size: 14px;
            font-weight: 500;
            margin: 8px 0 18px 0;
            color: #333;
          }
          .body-box {
            border: 2.5px solid #1a3a6e;
            border-radius: 8px;
            padding: 28px 24px;
            margin: 0 12px 28px 12px;
            text-align: center;
            line-height: 1.9;
            font-size: 15px;
          }
          .body-box .amount {
            font-weight: 700;
          }
          .body-box .amount-words {
            font-style: italic;
            font-weight: 600;
          }
          .body-box .name-highlight {
            font-weight: 700;
          }
          .body-box .address-highlight {
            font-weight: 600;
          }
          .body-box .reason-highlight {
            font-weight: 700;
            text-decoration: underline;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 40px;
            padding: 0 12px;
          }
          .footer-left {
            font-size: 16px;
            font-weight: 700;
          }
          .footer-right {
            text-align: right;
          }
          .footer-right .signature {
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 6px;
          }
          .footer-right .date {
            font-size: 14px;
            font-weight: 600;
          }

          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <div class="logo-container">
              <img src="${logoUrl}" alt="College Logo" />
            </div>
            <h1 class="college-name">SANT SANDHYA DAS MAHILA COLLEGE</h1>
            <p class="college-address">BARH, PATNA</p>
            <h2 class="receipt-title">Miscellaneous Payment Receipt</h2>
            <p class="invoice-line">Invoice No. ${payment.invoiceNumber}</p>
          </div>

          <div class="body-box">
            Received a sum of Rs.
            <span class="amount">${payment.amount.toLocaleString("en-IN")}</span>
            (<span class="amount-words">${numberToWords(payment.amount)}</span>)
            from <span class="name-highlight">${payment.name}</span>,
            <span class="address-highlight">${payment.address}</span>
            in the account of
            <span class="reason-highlight">${payment.reason}</span>.
          </div>

          <div class="footer">
            <div class="footer-left">Regards</div>
            <div class="footer-right">
              <p class="signature">Signature of receiver</p>
              <p class="date">Date: ${format(new Date(payment.createdAt), "dd/MM/yyyy")}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    doc.close();

    // Wait for the logo image to load, then trigger print
    const logo = doc.querySelector(".logo-container img") as HTMLImageElement;
    const triggerPrint = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      // Clean up iframe after a short delay
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };

    if (logo?.complete) {
      triggerPrint();
    } else if (logo) {
      logo.onload = triggerPrint;
      logo.onerror = triggerPrint; // Print even if logo fails to load
    } else {
      triggerPrint();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-xl bg-white p-2 shadow-2xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-800">
            Receipt Preview — {payment.invoiceNumber}
          </h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={handlePrint}>
              <PrinterIcon className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Receipt Preview */}
        <div
          ref={receiptRef}
          className="p-8"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          <div className="border-[3px] border-gray-800 rounded-lg p-8">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-20 h-20 border-2 border-gray-600 rounded-full flex items-center justify-center overflow-hidden mx-auto mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/college.png"
                  alt="College Logo"
                  className="w-[68px] h-[68px] object-contain"
                />
              </div>
              <h1 className="text-[22px] font-extrabold uppercase tracking-wide text-gray-900 mb-1">
                SANT SANDHYA DAS MAHILA COLLEGE
              </h1>
              <p className="text-[13px] text-gray-500 mb-3">BARH, PATNA</p>
              <h2 className="text-[17px] font-bold border-2 border-gray-800 rounded-md inline-block px-7 py-2 tracking-wide mb-3">
                Miscellaneous Payment Receipt
              </h2>
              <p className="text-sm font-medium text-gray-600 mt-2">
                Invoice No. {payment.invoiceNumber}
              </p>
            </div>

            {/* Body */}
            <div className="border-[2.5px] border-blue-900 rounded-lg px-6 py-7 mx-3 mb-7 text-center leading-8 text-[15px] text-gray-800">
              Received a sum of Rs.{" "}
              <span className="font-bold">
                {payment.amount.toLocaleString("en-IN")}
              </span>{" "}
              (
              <span className="italic font-semibold">
                {numberToWords(payment.amount)}
              </span>
              ) from{" "}
              <span className="font-bold">{payment.name}</span>,{" "}
              <span className="font-semibold">{payment.address}</span> in the
              account of{" "}
              <span className="font-bold underline">{payment.reason}</span>.
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end mt-10 px-3">
              <div className="text-base font-bold text-gray-900">Regards</div>
              <div className="text-right">
                <p className="text-[15px] font-bold text-gray-900 mb-1">
                  Signature of receiver
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  Date: {format(new Date(payment.createdAt), "dd/MM/yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
