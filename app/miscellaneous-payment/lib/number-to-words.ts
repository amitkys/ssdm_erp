const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertBelowThousand(n: number): string {
  if (n === 0) return "";

  if (n < 20) return ones[n];

  if (n < 100) {
    const remainder = n % 10;
    return tens[Math.floor(n / 10)] + (remainder ? ` ${ones[remainder]}` : "");
  }

  const remainder = n % 100;
  return (
    `${ones[Math.floor(n / 100)]} Hundred` +
    (remainder ? ` and ${convertBelowThousand(remainder)}` : "")
  );
}

/**
 * Converts a positive integer to its Indian English word representation.
 * Supports values up to 99,99,99,999 (99 crore).
 * Example: 15000 → "Fifteen Thousand Only"
 */
export function numberToWords(num: number): string {
  if (num === 0) return "Zero Only";
  if (num < 0) return `Minus ${numberToWords(-num)}`;

  const n = Math.floor(num);
  const parts: string[] = [];

  // Crore (1,00,00,000)
  const crore = Math.floor(n / 10000000);
  if (crore > 0) {
    parts.push(`${convertBelowThousand(crore)} Crore`);
  }

  // Lakh (1,00,000)
  const lakh = Math.floor((n % 10000000) / 100000);
  if (lakh > 0) {
    parts.push(`${convertBelowThousand(lakh)} Lakh`);
  }

  // Thousand (1,000)
  const thousand = Math.floor((n % 100000) / 1000);
  if (thousand > 0) {
    parts.push(`${convertBelowThousand(thousand)} Thousand`);
  }

  // Remainder below 1000
  const remainder = n % 1000;
  if (remainder > 0) {
    parts.push(convertBelowThousand(remainder));
  }

  return `${parts.join(" ")} Only`;
}
