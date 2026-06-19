import type { Metadata } from "next";
import { PolicyLayout } from "@/components/informative/policy-layout";
import { getCollegeConfig } from "@/lib/college-config";

export const metadata: Metadata = {
  title: "Refund Policy | SANT SANDHYA DAS MAHILA COLLEGE",
  description:
    "Read the Refund & Cancellation Policy for SSDM College admissions and payments.",
};

export default function RefundPolicyPage() {
  const config = getCollegeConfig();

  return (
    <PolicyLayout
      title="Refund Policy"
      subtitle="Conditions and procedures related to fee refunds for students."
      activeSlug="refund-policy"
      config={config}
    >
      <div className="space-y-6">
        <p className="text-sm text-slate-500 leading-relaxed">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <p className="text-sm text-slate-600 leading-relaxed">
          At {config.name}, we strive to provide transparent, reliable, and
          student-focused services. This Refund Policy outlines the conditions
          and procedures related to fee refunds for student admissions,
          bonafides, CLC (College Leaving Certificate), and related programs.
        </p>

        <hr className="border-slate-100" />

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">1.</span> General
            Refund Policy
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            By enrolling in any academic program or training module, users
            acknowledge and agree to the following default terms:
          </p>
          <ul className="list-disc list-inside pl-4 text-sm text-slate-600 space-y-1.5">
            <li>
              All payments made for internships, training programs, workshops,
              admissions, or related college services are non-refundable by
              default.
            </li>
            <li>
              Refunds, if applicable, will be considered only after a detailed
              verification process and audit by our Accounts Department and the
              concerned transaction bank.
            </li>
            <li>
              No automatic or immediate refund will be issued under any
              circumstances.
            </li>
            <li>
              A refund request must be verified as valid, justified, and
              supported with appropriate transaction and academic documentation.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">2.</span> Eligibility
            for Refund Consideration
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            A refund request may be reviewed for eligibility check only in the
            following specific cases:
          </p>
          <ul className="list-disc list-inside pl-4 text-sm text-slate-600 space-y-1.5">
            <li>
              <strong className="text-slate-800">Duplicate payment:</strong>{" "}
              Multiple payments made for the same program or admission form due
              to portal errors.
            </li>
            <li>
              <strong className="text-slate-800">Technical issue:</strong>{" "}
              Gateway failures or bank server timeout issues where the amount
              was debited twice.
            </li>
            <li>
              <strong className="text-slate-800">
                Administrative oversight:
              </strong>{" "}
              Ineligibility mismatch parameters caused directly by
              administrative errors.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">3.</span> Refund
            Request Procedure
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            To formally submit a refund request, you must follow the steps
            below:
          </p>
          <ol className="list-decimal list-inside pl-4 text-sm text-slate-600 space-y-1.5">
            <li>
              Submit a written request via our official college email address or
              hand in a physical application at the Office of the Principal,
              accompanied by valid supporting documents (payment receipts, bank
              statements).
            </li>
            <li>
              Specify your full registered name, enrolled email ID, registered
              mobile number, and the unique transaction ID/UTR.
            </li>
            <li>
              Provide your complete bank account number with the IFSC code,
              along with a justified reason for the refund.
            </li>
            <li>
              Our administrative team will verify the credentials and forward
              the case to the Accounts Department for review and action.
            </li>
          </ol>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">4.</span> Mode of
            Refund
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Approved refunds will be processed{" "}
            <strong className="text-slate-900">
              ONLY via offline methods or bank transfer
            </strong>
            . No instant digital refund or automated instant wallet reversals
            are supported.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            The refund will be issued via bank transfer (NEFT/RTGS), cheque, or
            an equivalent offline payment mode deemed suitable by the Accounts
            Department.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">5.</span>{" "}
            Non-Transferable Payments
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Payments made for a specific program, admission batch, or course
            cannot be transferred to another student, course, or batch. Academic
            fees cannot be adjusted against any other administrative purposes.
          </p>
        </section>

        {/* Final Note */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 mt-8">
          <h3 className="font-extrabold text-sm text-slate-800">Final Note</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            By proceeding with the payment transaction on this website, you
            acknowledge that you have read and agreed to the terms and
            conditions of our Refund Policy. SSDM College aims to ensure
            complete fairness while maintaining a transparent and
            student-friendly environment.
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}
