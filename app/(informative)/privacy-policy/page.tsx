import type { Metadata } from "next";
import { PolicyLayout } from "@/components/informative/policy-layout";
import { getCollegeConfig } from "@/lib/college-config";

export const metadata: Metadata = {
  title: "Privacy Policy | SANT SANDHYA DAS MAHILA COLLEGE",
  description:
    "Learn how SSDM College collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  const config = getCollegeConfig();

  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and safeguard the information you share with us."
      activeSlug="privacy-policy"
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
          {config.name} ("SSDM College", "we", "us", or "our") values your
          privacy and is committed to protecting your personal information. This
          Privacy Policy explains how we collect, use, and safeguard the
          information you share with us.
        </p>

        <hr className="border-slate-100" />

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">1.</span> Information
            We Collect
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We may collect the following types of information when you interact
            with our website or services:
          </p>
          <ul className="list-disc list-inside pl-4 text-sm text-slate-600 space-y-1.5">
            <li>
              <strong className="text-slate-800">Personal details:</strong>{" "}
              Name, email address, phone number, physical address, and
              parent/guardian details.
            </li>
            <li>
              <strong className="text-slate-800">Academic information:</strong>{" "}
              Course choice, college registration, marks, and area of
              specialization.
            </li>
            <li>
              <strong className="text-slate-800">Payment details:</strong>{" "}
              Transaction reference IDs, invoice amounts, and related payment
              status (all processed securely via authorized payment gateways; we
              do not store raw card/banking credentials).
            </li>
            <li>
              <strong className="text-slate-800">Usage data:</strong> Pages
              visited, time spent, browser type, device information, and IP
              addresses.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">2.</span> How We Use
            Your Information
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your information is used solely to facilitate educational and
            administrative services:
          </p>
          <ul className="list-disc list-inside pl-4 text-sm text-slate-600 space-y-1.5">
            <li>
              Process program registrations, semester admissions, and fee
              payments.
            </li>
            <li>
              Improve website functionality, academic portals, and overall user
              experience.
            </li>
            <li>
              Communicate critical updates, exam schedules, events, and academic
              announcements.
            </li>
            <li>
              Verify student identity and validate eligibility mismatch
              parameters.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">3.</span> Data
            Protection & Security
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We implement appropriate technical and administrative security
            measures to protect your data from unauthorized access, loss,
            misuse, or disclosure.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed bg-blue-50/50 border border-blue-100 rounded-xl p-4">
            <strong>Important Security Notice:</strong> While we strive to
            safeguard your data, no internet-based platform or digital system is
            100% secure. Users hold the vital responsibility of keeping their
            student credentials, login passwords, and portal tokens
            confidential.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">4.</span> Cookies &
            Tracking
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our website may use cookies and similar session management
            technologies to:
          </p>
          <ul className="list-disc list-inside pl-4 text-sm text-slate-600 space-y-1.5">
            <li>
              Enhance your browsing experience and remember preference
              parameters.
            </li>
            <li>Analyze website performance metrics and traffic patterns.</li>
            <li>Improve student portal reliability and service quality.</li>
          </ul>
          <p className="text-sm text-slate-600 leading-relaxed">
            You may choose to disable cookies in your browser settings, though
            doing so might cause some interactive portal features to function
            incorrectly.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">5.</span> User Rights
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Depending on eligibility guidelines and university norms, you may
            request:
          </p>
          <ul className="list-disc list-inside pl-4 text-sm text-slate-600 space-y-1.5">
            <li>
              Access to the personal data we store in our academic database.
            </li>
            <li>
              Correction of incorrect or outdated academic and personal records.
            </li>
            <li>
              Removal of your voluntary information, subject to institutional
              regulatory policies.
            </li>
          </ul>
          <p className="text-sm text-slate-600 leading-relaxed">
            To make any request, please contact us via our official college
            email address.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">6.</span> Data
            Retention
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We retain your data only for as long as is necessary to serve:
          </p>
          <ul className="list-disc list-inside pl-4 text-sm text-slate-600 space-y-1.5">
            <li>Core educational and academic record-keeping purposes.</li>
            <li>
              Certification, degree, and examination verification tracking.
            </li>
            <li>
              Compliance with university laws, guidelines, and legal
              requirements.
            </li>
            <li>Improving college services and portal diagnostics.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">7.</span> Children’s
            Privacy
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our educational services are intended for students generally above
            18 years of age. We do not knowingly collect personal details from
            children below this age without parental or guardian consent.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-900 font-extrabold">8.</span> Policy
            Updates
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We reserve the right to revise this Privacy Policy periodically. Any
            updated versions will be posted directly on this page with the
            revised date parameters.
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}
