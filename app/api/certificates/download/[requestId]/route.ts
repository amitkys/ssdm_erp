import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CertificateRequestTable } from "@/lib/db/schema/certificate";
import { getCollegeConfig } from "@/lib/college-config";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await params;
    const url = new URL(req.url);
    const requestedType = url.searchParams.get("type"); // Optional override e.g. for CLC special case ('CLC' or 'CHARACTER')

    const request = await db.query.CertificateRequestTable.findFirst({
      where: eq(CertificateRequestTable.id, requestId),
      with: {
        student: true,
        certificate: true,
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Certificate request not found" },
        { status: 404 },
      );
    }

    if (request.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Certificate is not approved yet" },
        { status: 400 },
      );
    }

    // Role check: admin/superAdmin or matching student
    const isStaff =
      session.user.role === "admin" || session.user.role === "superAdmin";
    const isOwner =
      session.user.role === "student" &&
      (request.student.email === session.user.email ||
        session.user.email.startsWith(request.student.UAN));

    if (!isStaff && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const college = getCollegeConfig();
    const effectiveType = requestedType || request.certificate_type;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${effectiveType} Certificate - ${request.student?.name || "Student"}</title>
  <style>
    @page { size: A4 landscape; margin: 20mm; }
    body {
      font-family: 'Times New Roman', Times, serif;
      margin: 0;
      padding: 40px;
      background: #fdfbf7;
      color: #1a1a1a;
    }
    .cert-border {
      border: 8px double #1e293b;
      padding: 30px;
      position: relative;
      background: #ffffff;
      box-shadow: 0 0 20px rgba(0,0,0,0.05);
    }
    .cert-header {
      text-align: center;
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .college-name {
      font-size: 28px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #0f172a;
      margin: 0;
    }
    .college-address {
      font-size: 14px;
      color: #475569;
      margin-top: 5px;
    }
    .cert-title {
      font-size: 24px;
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
      text-align: center;
      margin: 25px 0;
      color: #1e3a8a;
    }
    .cert-body {
      font-size: 18px;
      line-height: 2;
      text-align: justify;
      margin: 30px 0;
    }
    .highlight {
      font-weight: bold;
      border-bottom: 1px dotted #000;
      padding: 0 5px;
    }
    .cert-footer {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .sign-box {
      text-align: center;
      width: 200px;
      border-top: 1px solid #000;
      padding-top: 5px;
      font-size: 14px;
      font-weight: bold;
    }
    .no-print {
      margin-bottom: 20px;
      text-align: center;
    }
    .btn-print {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
    }
    @media print {
      .no-print { display: none; }
      body { padding: 0; background: #fff; }
    }
  </style>
</head>
<body>
  <div className="no-print">
    <button onclick="window.print()" class="btn-print">Print / Save as PDF</button>
  </div>
  <div class="cert-border">
    <div class="cert-header">
      <h1 class="college-name">${college.name}</h1>
      <div class="college-address">${college.address}, ${college.city}, ${college.state} - ${college.pincode}</div>
    </div>

    <div class="cert-title">
      ${effectiveType === "CLC" ? "COLLEGE LEAVING CERTIFICATE (CLC)" : effectiveType === "CHARACTER" ? "CHARACTER CERTIFICATE" : "BONAFIDE CERTIFICATE"}
    </div>

    <div class="cert-body">
      This is to certify that <span class="highlight">${request.student?.name || "N/A"}</span>, 
      Daughter/Son of <span class="highlight">${request.student?.fathersName || "N/A"}</span>, 
      College Roll No. <span class="highlight">${request.student?.collegeRoll || "N/A"}</span>, 
      was a bona fide student of this institution. 
      He/She passed the examination held in <span class="highlight">${request.passingMonth || ""} ${request.passingYear || ""}</span> 
      securing <span class="highlight">${request.division || "N/A"}</span>.
      <br><br>
      During his/her period of study in this college, his/her conduct and moral character have been found to be 
      <span class="highlight">${request.behaviour || "Good"}</span>.
      <br>
      Purpose of Issuance: <span class="highlight">${request.purpose}</span>.
    </div>

    <div class="cert-footer">
      <div>
        <p style="font-size: 14px; color: #475569;">Date of Issue: ${new Date(request.updatedAt).toLocaleDateString()}</p>
      </div>
      <div class="sign-box">
        Head of Institution / Principal
      </div>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[Certificate Download API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
