import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CertificateRequestTable } from "@/lib/db/schema/certificate";
import { subjectTable } from "@/lib/db/schema/department";

function escapeHtml(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function dottedVal(val: string | number | null | undefined): string {
  const safe = escapeHtml(val);
  return `<span class="field-val">${safe || "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"}</span>`;
}

function logoImgTag(extraClass: string = ""): string {
  const className = extraClass ? `logo-img ${extraClass}` : "logo-img";
  return `<img src="/college.png" alt="College Logo" class="${className}" onerror="this.onerror=null;this.src='';this.className='logo-fallback ${extraClass}';" />`;
}

const SHARED_PRINT = `
  @media print {
    @page {
      size: A4 portrait;
      margin: 0;
    }
    body {
      margin: 0;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print {
      display: none !important;
    }
  }
`;

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
        student: {
          with: {
            batch: {
              with: {
                course: {
                  with: {
                    department: true,
                  },
                },
                academicSession: true,
              },
            },
          },
        },
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

    const effectiveType = (requestedType || request.certificate_type || "CLC").toUpperCase();

    let mjcSubject = null;
    if (request.student?.subMJC) {
      mjcSubject = await db.query.subjectTable.findFirst({
        where: eq(subjectTable.id, request.student.subMJC),
      });
    }

    const student = request.student;
    const batch = student?.batch;
    const course = batch?.course;
    const departmentObj = course?.department;
    const sessionObj = batch?.academicSession;

    const departmentName = departmentObj?.name || mjcSubject?.name || "";
    const courseName = course?.name || "B.A";
    const sessionName = sessionObj?.name || "";

    const dateStr = request.updatedAt
      ? new Date(request.updatedAt).toLocaleDateString("en-IN")
      : new Date().toLocaleDateString("en-IN");

    const dobStr = student?.DOB
      ? new Date(student.DOB).toLocaleDateString("en-IN")
      : "";

    const admissionDate = student?.createdAt
      ? new Date(student.createdAt).toLocaleDateString("en-IN")
      : "";

    let completionY = "";
    if (sessionName && sessionName.includes("-")) {
      const parts = sessionName.split("-");
      completionY = parts[parts.length - 1].trim();
    } else if (student?.createdAt) {
      const duration = course?.duration || 3;
      const startYr = new Date(student.createdAt).getFullYear();
      completionY = String(startYr + duration);
    }

    const data = {
      certificateNo: `SSDM/${effectiveType}/${request.id.slice(-6).toUpperCase()}`,
      name: student?.name || "",
      fatherName: student?.fathersName || "",
      motherName: student?.mothersName || "",
      collegeRoll: student?.collegeRoll || "",
      courseName: courseName,
      departmentName: departmentName,
      session: sessionName,
      registrationNo: student?.registrationNumber || "",
      universityRoll: student?.universityRoll || "",
      passingMonth: request.passingMonth || "",
      passingYear: request.passingYear || "",
      semester: `Semester ${student?.currentSemesterCount || 1}`,
    };

    const mother = student?.mothersName || "";
    const department = departmentName;
    const examName = `${courseName} Examination`;
    const examDatePhrase = (d: typeof data) =>
      [d.passingMonth, d.passingYear].filter(Boolean).join(" ") || "Annual Examination";
    const division = request.division || "1st";
    const characterStatus = request.behaviour || "GOOD";
    const rollDisplay = student?.collegeRoll || "";
    const char = request.behaviour || "GOOD";

    let htmlContent = "";

    if (effectiveType === "CLC") {
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CLC</title>
  <style>
    ${SHARED_PRINT}
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 18mm 16mm 16mm;
      font-family: "Times New Roman", Times, serif;
      font-size: 13.5pt;
      line-height: 1.65;
      color: #000;
      position: relative;
      margin: 0 auto;
      box-sizing: border-box;
    }
    .logo-row { text-align: center; margin-bottom: 4mm; }
    .logo-img { width: 22mm; height: 22mm; object-fit: contain; display: inline-block; vertical-align: middle; }
    .logo-fallback {
      width: 22mm; height: 22mm; border: 1.5px solid #333; border-radius: 50%;
      display: inline-block; margin: 0 auto;
    }
    .hi { text-align: center; font-weight: 700; font-size: 12.5pt; margin: 0 0 1mm; }
    .en { text-align: center; font-weight: 700; font-size: 17pt; margin: 0 0 2mm; letter-spacing: 0.02em; }
    .addr { text-align: center; font-size: 11.5pt; margin: 0; }
    .affil { text-align: center; font-size: 10.5pt; margin: 1mm 0 0; }
    .doc-title {
      text-align: center; font-weight: 700; font-size: 13.5pt; margin: 7mm 0 5mm;
      text-decoration: underline; text-transform: uppercase; letter-spacing: 0.03em;
    }
    .meta-row { display: flex; justify-content: space-between; font-size: 12.5pt; margin-bottom: 5mm; }
    .body { text-align: justify; font-size: 13pt; line-height: 1.85; }
    .field-val {
      font-weight: 700;
      border-bottom: 1px dotted #000;
      padding: 0 2px 1px;
    }
    .sig-row { display: flex; justify-content: space-between; margin-top: 14mm; align-items: flex-end; }
    .sig-col { width: 42%; font-size: 11.5pt; text-align: center; }
    .sig-line { border-top: 1px solid #000; margin: 10mm 8mm 2mm; padding-top: 2mm; }
    .sig-label { font-weight: 600; margin-top: 1mm; }
  </style>
</head>
<body>
  <div class="no-print" style="position: fixed; top: 12px; right: 20px; z-index: 9999;">
    <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
      Print / Save as PDF
    </button>
  </div>
  <div class="page">
    <div class="logo-row">${logoImgTag()}</div>
    <p class="en">Sant Sandhya Das Mahila College</p>
    <p class="addr">Barh, Patna - 803213, Bihar</p>
    <p class="affil">(Affiliated to Patliputra University, Patna)</p>

    <div class="doc-title">College Leaving Certificate/Transfer Certificate</div>
    <br>

    <div class="meta-row">
      <span>Certificate No.:- ${escapeHtml(data.certificateNo)}</span>
      <span>Date :- ${escapeHtml(dateStr)}</span>
    </div>
    <br>

    <div class="body">
      <p>
        Certified that Miss ${dottedVal(data.name)}, Son/Daughter of Mr ${dottedVal(data.fatherName)} and Mrs.
        ${dottedVal(mother)} bearing College Roll No ${dottedVal(data.collegeRoll)} has been a student of class
        ${dottedVal(data.courseName)} Hons ${dottedVal(department)} ${dottedVal("PART-3")} in this College in the Session ${dottedVal(data.session)} His/Her University
        Registration No is ${dottedVal(data.registrationNo)} and University Roll No is ${dottedVal(data.universityRoll)}.
        As per the record in the college register his/her date of birth is ${dottedVal(dobStr)} He/She has Passed
        ${dottedVal(examName)} examination held in the ${dottedVal(examDatePhrase(data))} and secured
        ${dottedVal(division)} Div/Class
      </p>
      <p>
        During the period of his/her study in this College his/her character was ${dottedVal(characterStatus)}
      </p>
    </div>
    <br>
    <br>

    <div class="sig-row">
      <div class="sig-col">
        <div class="sig-line"></div>
        <div class="sig-label">Head Assistant :</div>
      </div>
      <div class="sig-col">
        <div class="sig-line"></div>
        <div class="sig-label">Principal/Authorized Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>`;
    } else if (effectiveType === "CHARACTER") {
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Character Certificate</title>
  <style>
    ${SHARED_PRINT}
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 0;
      font-family: "Times New Roman", Times, serif;
      font-size: 13pt;
      line-height: 1.55;
      color: #111;
      margin: 0 auto;
      box-sizing: border-box;
    }
    .bar {
      height: 5mm;
      background: #9a9a9a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .inner {
      padding: 12mm 16mm 14mm;
    }
    .logo-row { text-align: center; margin-bottom: 3mm; position: relative; }
    .logo-img { width: 22mm; height: 22mm; object-fit: contain; }
    .logo-fallback {
      width: 22mm; height: 22mm; border: 1.5px solid #333; border-radius: 50%; margin: 0 auto;
    }
    .hi { text-align: center; font-weight: 700; font-size: 12.5pt; margin: 0; }
    .en { text-align: center; font-weight: 700; font-size: 16.5pt; margin: 2mm 0; }
    .addr { text-align: center; font-size: 11.5pt; margin: 0; }
    .affil { text-align: center; font-size: 10.5pt; margin: 1mm 0 0; }
    .doc-title {
      text-align: center; font-weight: 700; font-size: 14pt; margin: 6mm 0 5mm;
      text-decoration: underline; text-transform: uppercase;
    }
    .meta-row { display: flex; justify-content: space-between; font-size: 12pt; margin-bottom: 6mm; }
    .line { margin: 4mm 0; font-size: 12.5pt; }
    .fill {
      border-bottom: 1px dotted #000;
      display: inline-block;
      min-width: 55%;
      margin: 0 2px;
      font-weight: 700;
      padding: 0 4px 1px;
    }
    .sig-row { display: flex; justify-content: space-between; margin-top: 16mm; }
    .sig-col { width: 40%; text-align: center; font-size: 11pt; }
    .sig-line { border-top: 1px solid #000; margin: 12mm 4mm 3mm; }
    .sig-label { font-weight: 700; margin-top: 2mm; }
    .college-foot { font-size: 10pt; margin-top: 2mm; font-weight: 700; }
  </style>
</head>
<body>
  <div class="no-print" style="position: fixed; top: 12px; right: 20px; z-index: 9999;">
    <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
      Print / Save as PDF
    </button>
  </div>
  <div class="page">
  <br>
  <br>
    <div class="bar"></div>
    <div class="inner">
      <div class="logo-row">
        ${logoImgTag()}
      </div>
      <p class="en">Sant Sandhya Das Mahila College</p>
      <p class="addr">Barh, Patna - 803213, Bihar</p>
      <p class="affil">(Affiliated to Patliputra University, Patna)</p>

      <div class="doc-title">Character Certificate</div>
      <br>
      <br>

      <div class="meta-row">
        <span>Certificate No.:- ${escapeHtml(data.certificateNo)}</span>
        <span>Date :- ${escapeHtml(dateStr)}</span>
      </div>

      <br>

      <p class="line">
      This is to certify that Miss. 
      <span class="fill">${escapeHtml(data.name)}</span>
      Son/Daughter of Mr. 
      <span class="fill">${escapeHtml(data.fatherName)}</span>
      is/was a student of the class 
      <span class="fill">${escapeHtml(data.courseName)} (HONS) ${escapeHtml(data.departmentName)} PART-3 </span>
      degree course bearing roll number 
      <span class="fill">${escapeHtml(rollDisplay)}</span>
      in the session from 
      <span class="fill">${escapeHtml(data.session)}</span>.
      During the period of his/her study in this college his/her character is/was 
      <span class="fill">${escapeHtml(char)}</span>.</p>

      <br>

      <div class="sig-row">
        <div class="sig-col">
          <div class="sig-line"></div>
          <div class="sig-label">Head Assistant :</div>
        </div>
        <div class="sig-col">
          <div class="sig-line"></div>
          <div class="sig-label">Principal/Authorized Signatory :</div>
          <p class="college-foot">S.S.D.M COLLEGE BARH (PATNA)</p>
        </div>
      </div>
    </div>
    <div class="bar"></div>
  </div>
</body>
</html>`;
    } else {
      // BONAFIDE
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Bonafide</title>
  <style>
    ${SHARED_PRINT}
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 14mm 16mm 16mm;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      margin: 0 auto;
      box-sizing: border-box;
    }
    .top-bar {
      display: grid;
      grid-template-columns: 26mm 1fr auto;
      align-items: start;
      gap: 4mm;
      margin-bottom: 5mm;
    }
    .seal {
      text-align: center; font-size: 9pt; line-height: 1.2;
    }
    .seal .est { margin-bottom: 1mm; }
    .logo-img { width: 20mm; height: 20mm; object-fit: contain; display: block; margin: 0 auto; }
    .seal-logo { margin-top: 1mm; }
    .logo-fallback {
      width: 20mm; height: 20mm; border: 1.5px solid #333; border-radius: 50%; margin: 0 auto;
    }
    .head-mid { text-align: center; }
    .head-mid .main { font-weight: 700; font-size: 15pt; margin: 0; letter-spacing: 0.04em; }
    .head-mid .sub { font-size: 12pt; margin: 2mm 0 0; }
    .code { font-size: 11pt; font-weight: 600; padding-top: 2mm; white-space: nowrap; }
    .recogn {
      text-align: center; font-size: 9.5pt; margin: 4mm 0 6mm; line-height: 1.35;
    }
    .doc-title {
      text-align: center; font-weight: 700; font-size: 13pt; margin: 0 0 5mm;
      text-decoration: underline; text-transform: uppercase;
    }
    .meta-row { display: flex; justify-content: space-between; font-size: 11.5pt; margin-bottom: 5mm; }
    .body { text-align: left; font-size: 11.5pt; line-height: 1.65; margin-bottom: 5mm; }
    .field-val { font-weight: 600; border-bottom: 1px dotted #000; padding: 0 2px; }
    .details-title { font-size: 11.5pt; margin: 4mm 0 3mm; }
    .detail-line { font-size: 11.5pt; margin: 2.5mm 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: 2mm; }
    .detail-label { min-width: 220px; }
    .detail-val { flex: 1; border-bottom: 1px dotted #000; min-height: 1.1em; font-weight: 600; }
    .auth {
      margin-top: 10mm; margin-left: auto; width: 58%; text-align: left; font-size: 11pt;
    }
    .auth h4 { margin: 0 0 4mm; font-size: 11pt; text-decoration: underline; font-weight: 700; }
    .auth-row { margin: 2.5mm 0; display: flex; gap: 2mm; }
    .auth-row .k { min-width: 95px; }
    .auth-row .v { flex: 1; border-bottom: 1px dotted #000; min-height: 1em; }
  </style>
</head>
<body>
  <div class="no-print" style="position: fixed; top: 12px; right: 20px; z-index: 9999;">
    <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
      Print / Save as PDF
    </button>
  </div>
  <div class="page">
    <div class="top-bar">
      <div class="seal">
        <div class="est">स्थापित - 1978</div>
        ${logoImgTag('seal-logo')}
      </div>
      <div class="head-mid">
        <p class="main">SANT SANDHYA DAS MAHILA COLLEGE</p>
        <p class="sub">BARH, PATNA</p>
      </div>
      <div class="code">COLLEGE CODE : 435</div>
    </div>
    <p class="recogn">(Recognised by government of Bihar and affiliated to Patliputra University, Patna in the faculties of arts &amp; science up to degree hons. level)</p>

    <div class="doc-title">Bonafide Certificate</div>
    <br>
    <br>
    <div class="meta-row">
      <span>Ref no ${dottedVal(data.certificateNo)}</span>
      <span>Date: ${dottedVal(dateStr)}</span>
    </div>
    <br>

    <div class="body">
      This is to certify that Mr/Ms ${dottedVal(data.name)}, bearing registration No ${dottedVal(data.registrationNo)} is a bonafide student of this
      Institute, studying in the ${dottedVal(data.semester)} (semester/year) ${dottedVal(data.courseName)} course during academic year ${dottedVal(data.session)}.
    </div>

    <p class="details-title">The student details as entered in our institute record are:</p>
    <div class="detail-line"><span class="detail-label">Date of birth :</span><span class="detail-val">${escapeHtml(dobStr)}</span></div>
    <div class="detail-line"><span class="detail-label">Father's name :</span><span class="detail-val">${escapeHtml(data.fatherName || '')}</span></div>
    <div class="detail-line"><span class="detail-label">Mother;s name :</span><span class="detail-val">${escapeHtml(data.motherName || '')}</span></div>
    <div class="detail-line"><span class="detail-label">Date of admission :</span><span class="detail-val">${escapeHtml(admissionDate)}</span></div>
    <div class="detail-line"><span class="detail-label">Expected year of course completion :</span><span class="detail-val">${escapeHtml(completionY)}</span></div>

      <br>
      <br>
      <br>
      <br>

    <div class="auth">

      <h4>Authorized signature with stamp</h4>
      <div class="auth-row"><span class="k">Name :</span><span class="v"></span></div>
      <div class="auth-row"><span class="k">Designation :</span><span class="v"></span></div>
      <div class="auth-row"><span class="k">Mobile :</span><span class="v"></span></div>
      <div class="auth-row"><span class="k">Email :</span><span class="v"></span></div>
    </div>
  </div>
</body>
</html>`;
    }

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
