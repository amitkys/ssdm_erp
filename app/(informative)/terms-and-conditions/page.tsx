import type { Metadata } from "next";
import { PolicyLayout } from "@/components/informative/policy-layout";
import { getCollegeConfig } from "@/lib/college-config";

export const metadata: Metadata = {
  title: "Terms & Conditions | SANT SANDHYA DAS MAHILA COLLEGE",
  description:
    "Read the Terms & Conditions of Payments and Services for SSDM College.",
};

export default function TermsAndConditionsPage() {
  const config = getCollegeConfig();

  return (
    <PolicyLayout
      title="Terms & Conditions"
      subtitle="Terms and conditions governing payments, enrollments, and website usage."
      activeSlug="terms-and-conditions"
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

        <p className="text-sm text-slate-600 leading-relaxed font-semibold">
          Welcome to {config.name}. By accessing, browsing, enrolling, or using
          our website, services, internship programs, or training modules, you
          agree to abide by the Terms & Conditions outlined below. Please read
          them carefully before proceeding.
        </p>

        {/* Highlight Section for Bank Compliance */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider">
            Important Payment Gateway Terms
          </h3>
          <ul className="list-disc list-inside text-xs text-amber-800 space-y-1.5 pl-1">
            <li>
              Transaction fee charges will not be refunded or reversed under any
              circumstances for any refund, reversal, chargeback, or other
              reasons.
            </li>
            <li>
              All transaction fees charged by banks or payment service providers
              will be borne solely by the cardholder/payer for any transaction.
            </li>
          </ul>
        </div>

        <hr className="border-slate-100" />

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">1.</span> Acceptance
            of Terms
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            By using our platform, you acknowledge that you have read,
            understood, and agreed to all the terms stated here. If you do not
            agree, you must discontinue the use of our services immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">2.</span> User
            Responsibilities
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            As a user/student of this platform, you must:
          </p>
          <ul className="list-disc list-inside pl-4 text-sm text-slate-600 space-y-1.5">
            <li>
              Provide accurate, complete, and authentic personal and academic
              information.
            </li>
            <li>
              Use the website and portals for lawful, educational, and official
              college purposes only.
            </li>
            <li>
              Not misuse, copy, modify, redistribute, or plagiarize our digital
              contents without written permission.
            </li>
            <li>
              Maintain absolute confidentiality of your portal login
              credentials.
            </li>
            <li>
              Ensure timely completion of tasks, assignments, or fee schedules
              required for certifications and academic compliance.
            </li>
          </ul>
          <p className="text-sm text-slate-600 leading-relaxed">
            Any misuse or policy violation may lead to immediate removal from
            the platform, suspension, or appropriate legal action where
            necessary.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">3.</span> Program
            Enrollment
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            By enrolling in any program, training session, or academic course:
          </p>
          <ul className="list-disc list-inside pl-4 text-sm text-slate-600 space-y-1.5">
            <li>
              You agree to adhere to the designated program guidelines,
              timelines, and academic requirements.
            </li>
            <li>
              Completion certificates are issued only after verification of
              successful completion of tasks, assessments, or project work as
              defined.
            </li>
            <li>
              SSDM College reserves the right to modify, update, or discontinue
              any course, module, or program as required by university
              standards.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">4.</span> Payments &
            Refunds
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            All payments made are non-refundable by default. Refunds, if any,
            are considered only under exceptional circumstances, processed
            exclusively in offline mode or bank transfer, and are subject to
            detailed review. Users must thoroughly verify their eligibility and
            course details before making any payment.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Refer to our full{" "}
            <a
              href="/refund-policy"
              className="text-blue-900 font-bold hover:underline"
            >
              Refund Policy
            </a>{" "}
            page for detailed conditions and guidelines.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">5.</span> Content
            Ownership
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            All materials on this website — including text, graphics, logos,
            videos, design elements, modules, documents, and assessments — are
            the intellectual property of SSDM College and may not be reproduced,
            copied, or shared without written consent.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">6.</span> External
            Links
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our website may include links to third-party portals (such as
            university websites, boards, or payment processors). SSDM College is
            not responsible for the content, privacy policies, or actions of
            external websites.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">7.</span> Limitation
            of Liability
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            SSDM College is not liable for:
          </p>
          <ul className="list-disc list-inside pl-4 text-sm text-slate-600 space-y-1.5">
            <li>
              Technical issues such as server downtime, network connectivity
              failures, or user device compatibility.
            </li>
            <li>
              Loss of credentials or personal data due to student/user
              negligence.
            </li>
            <li>
              Any misunderstanding between students and partner/external
              training organizations.
            </li>
          </ul>
          <p className="text-sm text-slate-600 leading-relaxed">
            All educational services and digital portals are provided on an
            "as-is" basis.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">8.</span> Changes to
            Terms
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            SSDM College reserves the right to update or modify these Terms &
            Conditions at any time. Users are encouraged to review this page
            periodically to stay updated on changes.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            9. Contact Information
          </h2>
          <div className="text-sm text-slate-600 space-y-1 bg-slate-50 border border-slate-100 rounded-2xl p-5">
            <p className="font-extrabold text-slate-800">{config.name}</p>
            <p>
              <strong className="text-slate-700">Address:</strong>{" "}
              {config.address}, {config.city}, {config.state} – {config.pincode}
            </p>
            <p>
              <strong className="text-slate-700">Phone:</strong>{" "}
              <a href={`tel:${config.phone}`} className="hover:underline">
                {config.phone}
              </a>
            </p>
            <p>
              <strong className="text-slate-700">Email:</strong>{" "}
              <a href={`mailto:${config.email}`} className="hover:underline">
                {config.email}
              </a>
            </p>
          </div>
        </section>
      </div>
    </PolicyLayout>
  );
}
