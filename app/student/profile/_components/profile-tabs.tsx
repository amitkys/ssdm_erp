"use client";

import {
  IconCertificate,
  IconMail,
  IconSchool,
  IconUser,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StudentProfile } from "../lib/types";
import { ProfileInfoRow, ProfileSectionHeader } from "./profile-info-row";

interface ProfileTabsProps {
  student: StudentProfile;
}

export function ProfileTabs({ student }: ProfileTabsProps) {
  const prev = student.previousAcademicRecord;

  return (
    <Card className="flex-1 min-w-0 py-0 gap-0">
      <Tabs defaultValue="personal" className="gap-0">
        <TabsList
          variant="line"
          className="w-full justify-start rounded-none border-b border-border px-4 pt-2 h-auto flex-wrap"
        >
          <TabsTrigger value="personal" className="gap-1.5 text-xs sm:text-sm">
            <IconUser className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="admission" className="gap-1.5 text-xs sm:text-sm">
            <IconSchool className="h-4 w-4" />
            Admission
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5 text-xs sm:text-sm">
            <IconMail className="h-4 w-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-1.5 text-xs sm:text-sm">
            <IconCertificate className="h-4 w-4" />
            Education
          </TabsTrigger>
        </TabsList>

        {/* ─── PERSONAL TAB ──────────────────────────── */}
        <TabsContent value="personal" className="p-5 sm:p-6">
          <ProfileSectionHeader title="Personal Information" />
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <ProfileInfoRow label="Full Name" value={student.name} />
            <ProfileInfoRow label="Gender" value={student.gender} />
            <ProfileInfoRow
              label="Date of Birth"
              value={
                student.DOB
                  ? format(new Date(student.DOB), "dd MMMM yyyy")
                  : null
              }
            />
            <ProfileInfoRow
              label="Aadhar Number"
              value={student.AadharNumber}
            />
            <ProfileInfoRow label="Religion" value={student.religion} />
            <ProfileInfoRow label="Caste" value={student.caste} />
            <ProfileInfoRow label="Reservation" value={student.reservation} />
            <ProfileInfoRow
              label="Minority Status"
              value={null}
              badge={
                student.isMinority
                  ? { variant: "default", label: "Yes" }
                  : { variant: "secondary", label: "No" }
              }
            />
          </div>
        </TabsContent>

        {/* ─── ADMISSION TAB ─────────────────────────── */}
        <TabsContent value="admission" className="p-5 sm:p-6">
          <ProfileSectionHeader title="Admission Information" />
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <ProfileInfoRow
              label="Course / Program"
              value={student.batch?.course?.name}
            />
            <ProfileInfoRow
              label="Course Code"
              value={student.batch?.course?.code}
            />
            <ProfileInfoRow
              label="Course Type"
              value={student.batch?.course?.type}
            />
            <ProfileInfoRow
              label="Department"
              value={student.batch?.course?.department?.name}
            />
            <ProfileInfoRow
              label="Academic Session"
              value={student.batch?.academicSession?.name}
            />
            <ProfileInfoRow
              label="Admission Type"
              value={student.admissionType}
            />
            <ProfileInfoRow
              label="Current Semester"
              value={`${student.currentSemesterCount} of ${(student.batch?.course?.duration ?? 0) * 2}`}
            />
            <ProfileInfoRow label="College Roll" value={student.collegeRoll} />
          </div>

          <ProfileSectionHeader title="Identifiers" className="mt-4" />
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <ProfileInfoRow label="UAN" value={student.UAN} />
            <ProfileInfoRow
              label="Registration No."
              value={student.registrationNumber}
            />
            <ProfileInfoRow
              label="University Roll"
              value={student.universityRoll}
            />
            <ProfileInfoRow
              label="Admission No."
              value={student.admissionNumber}
            />
            <ProfileInfoRow label="ABC ID" value={student.ABCID} />
          </div>
        </TabsContent>

        {/* ─── CONTACT TAB ───────────────────────────── */}
        <TabsContent value="contact" className="p-5 sm:p-6">
          <ProfileSectionHeader title="Contact Information" />
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <ProfileInfoRow label="Mobile Number" value={student.phone} />
            <ProfileInfoRow label="Email Address" value={student.email} />
          </div>

          <ProfileSectionHeader title="Address" className="mt-4" />
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <ProfileInfoRow label="City" value={student.city} />
            <ProfileInfoRow label="District" value={student.district} />
            <ProfileInfoRow label="State" value={student.state} />
            <ProfileInfoRow
              label="Pin Code"
              value={student.pinCode?.toString()}
            />
          </div>

          <ProfileSectionHeader title="Parents / Guardian" className="mt-4" />
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <ProfileInfoRow label="Father's Name" value={student.fathersName} />
            <ProfileInfoRow label="Mother's Name" value={student.mothersName} />
          </div>
        </TabsContent>

        {/* ─── EDUCATION TAB ─────────────────────────── */}
        <TabsContent value="education" className="p-5 sm:p-6">
          <ProfileSectionHeader title="Education Qualification" />

          {!prev ? (
            <div className="mt-6 text-center py-10">
              <IconCertificate className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">
                No previous academic records found.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 12th Std Card */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-2.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Higher Secondary / 12th Std
                  </h4>
                </div>
                <div className="p-4">
                  <ProfileInfoRow label="School Name" value={prev.schoolName} />
                  <ProfileInfoRow label="Board" value={prev.board} />
                  <ProfileInfoRow label="Roll No." value={prev.rollNo} />
                  <ProfileInfoRow label="Roll Code" value={prev.rollCode} />
                  <ProfileInfoRow
                    label="Obtained Marks"
                    value={prev.obtainedMarks?.toString()}
                  />
                  <ProfileInfoRow
                    label="Total Marks"
                    value={prev.totalMarks?.toString()}
                  />
                  <ProfileInfoRow
                    label="Percentage"
                    value={
                      prev.percentage != null ? `${prev.percentage}%` : null
                    }
                  />
                  <ProfileInfoRow label="City" value={prev.city} />
                  <ProfileInfoRow label="District" value={prev.district} />
                  <ProfileInfoRow label="State" value={prev.state} />
                  <ProfileInfoRow label="Pin Code" value={prev.pinCode} />
                </div>
              </div>

              {/* UG Card (only if UG data exists) */}
              {(prev.ugInstituteName || prev.ugUniversityName) && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/90 to-primary/70 px-4 py-2.5">
                    <h4 className="text-xs font-bold text-primary-foreground uppercase tracking-wider">
                      Undergraduate (UG)
                    </h4>
                  </div>
                  <div className="p-4">
                    <ProfileInfoRow
                      label="Institute Name"
                      value={prev.ugInstituteName}
                    />
                    <ProfileInfoRow
                      label="University"
                      value={prev.ugUniversityName}
                    />
                    <ProfileInfoRow label="Roll No." value={prev.ugRollNo} />
                    <ProfileInfoRow
                      label="Obtained Marks"
                      value={prev.ugObtainedMarks?.toString()}
                    />
                    <ProfileInfoRow
                      label="Total Marks"
                      value={prev.ugTotalMarks?.toString()}
                    />
                    <ProfileInfoRow
                      label="Percentage"
                      value={
                        prev.ugPercentage != null
                          ? `${prev.ugPercentage}%`
                          : null
                      }
                    />
                    <ProfileInfoRow label="City" value={prev.ugCity} />
                    <ProfileInfoRow label="District" value={prev.ugDistrict} />
                    <ProfileInfoRow label="State" value={prev.ugState} />
                    <ProfileInfoRow label="Pin Code" value={prev.ugPinCode} />
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
