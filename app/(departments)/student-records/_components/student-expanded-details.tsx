"use client";

import { format } from "date-fns";
import { EditStudentDialog } from "./edit-student-dialog";

interface StudentExpandedDetailsProps {
  student: any;
}

export function StudentExpandedDetails({
  student,
}: StudentExpandedDetailsProps) {
  const formattedDOB = student.DOB
    ? format(new Date(student.DOB), "PPP")
    : "N/A";

  return (
    <div className="p-4 bg-muted/30 border rounded-lg gap-6 flex flex-col animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Detailed Profile
          </h3>
          <p className="text-xs text-muted-foreground">
            Detailed personal, academic, and contact records.
          </p>
        </div>
        <EditStudentDialog student={student} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Details Card */}
        <div className="space-y-3 bg-card p-3 rounded-md border shadow-sm">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-1.5">
            Personal Details
          </h4>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <span className="text-muted-foreground">Father's Name:</span>
            <span className="font-medium text-foreground">
              {student.fathersName || "N/A"}
            </span>

            <span className="text-muted-foreground">Mother's Name:</span>
            <span className="font-medium text-foreground">
              {student.mothersName || "N/A"}
            </span>

            <span className="text-muted-foreground">Date of Birth:</span>
            <span className="font-medium text-foreground">{formattedDOB}</span>

            <span className="text-muted-foreground">Gender:</span>
            <span className="font-medium text-foreground">
              {student.gender || "N/A"}
            </span>

            <span className="text-muted-foreground">Aadhar Number:</span>
            <span className="font-medium font-mono text-foreground">
              {student.AadharNumber || "N/A"}
            </span>

            <span className="text-muted-foreground">Religion:</span>
            <span className="font-medium text-foreground">
              {student.religion || "N/A"}
            </span>

            <span className="text-muted-foreground">Caste / Category:</span>
            <span className="font-medium text-foreground">
              {student.caste || "N/A"}
            </span>

            <span className="text-muted-foreground">Minority:</span>
            <span className="font-medium text-foreground">
              {student.isMinority ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* Contact Details Card */}
        <div className="space-y-3 bg-card p-3 rounded-md border shadow-sm">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-1.5">
            Contact Details
          </h4>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <span className="text-muted-foreground">Phone:</span>
            <span className="font-medium text-foreground">
              {student.phone || "N/A"}
            </span>

            <span className="text-muted-foreground">Email:</span>
            <span
              className="font-medium text-foreground truncate block max-w-[150px]"
              title={student.email}
            >
              {student.email || "N/A"}
            </span>

            <span className="text-muted-foreground">City:</span>
            <span className="font-medium text-foreground">
              {student.city || "N/A"}
            </span>

            <span className="text-muted-foreground">District:</span>
            <span className="font-medium text-foreground">
              {student.district || "N/A"}
            </span>

            <span className="text-muted-foreground">State:</span>
            <span className="font-medium text-foreground">
              {student.state || "N/A"}
            </span>

            <span className="text-muted-foreground">Pin Code:</span>
            <span className="font-medium text-foreground">
              {student.pinCode || "N/A"}
            </span>
          </div>
        </div>

        {/* Academic Details Card */}
        <div className="space-y-3 bg-card p-3 rounded-md border shadow-sm">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-1.5">
            Academic & Identity Records
          </h4>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <span className="text-muted-foreground">UAN:</span>
            <span className="font-medium font-mono text-foreground">
              {student.UAN || "N/A"}
            </span>

            <span className="text-muted-foreground">Admission Type:</span>
            <span className="font-medium text-foreground">
              {student.admissionType || "N/A"}
            </span>

            <span className="text-muted-foreground">ABC ID:</span>
            <span className="font-medium font-mono text-foreground">
              {student.ABCID || "N/A"}
            </span>

            <span className="text-muted-foreground">Reg Number:</span>
            <span className="font-medium font-mono text-foreground">
              {student.registrationNumber || "N/A"}
            </span>

            <span className="text-muted-foreground">Univ Roll:</span>
            <span className="font-medium font-mono text-foreground">
              {student.universityRoll || "N/A"}
            </span>

            <span className="text-muted-foreground">College Roll:</span>
            <span className="font-medium font-mono text-foreground">
              {student.collegeRoll || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
