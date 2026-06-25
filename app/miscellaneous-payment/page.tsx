import type { Metadata } from "next";
import MiscPaymentMain from "./main";

export const metadata: Metadata = {
  title: "Miscellaneous Payment - SSDM College",
  description: "Record and manage miscellaneous payments with receipt generation",
};

export default function MiscellaneousPaymentPage() {
  return <MiscPaymentMain />;
}
