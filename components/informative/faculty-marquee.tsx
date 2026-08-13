"use client";

import { User } from "lucide-react";
import type { Faculty } from "@/lib/faculty-data";
import { faculties } from "@/lib/faculty-data";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((part) => !["Dr.", "Prof."].includes(part))
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Generate a consistent gradient from the faculty's department
function getDeptStyle(department: string) {
  const styles = [
    {
      gradient: "from-blue-600 to-blue-700",
      light: "bg-blue-50",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-800",
    },
    {
      gradient: "from-violet-600 to-violet-700",
      light: "bg-violet-50",
      text: "text-violet-700",
      badge: "bg-violet-100 text-violet-800",
    },
    {
      gradient: "from-emerald-600 to-emerald-700",
      light: "bg-emerald-50",
      text: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-800",
    },
    {
      gradient: "from-amber-600 to-amber-700",
      light: "bg-amber-50",
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-800",
    },
    {
      gradient: "from-rose-600 to-rose-700",
      light: "bg-rose-50",
      text: "text-rose-700",
      badge: "bg-rose-100 text-rose-800",
    },
    {
      gradient: "from-cyan-600 to-cyan-700",
      light: "bg-cyan-50",
      text: "text-cyan-700",
      badge: "bg-cyan-100 text-cyan-800",
    },
    {
      gradient: "from-indigo-600 to-indigo-700",
      light: "bg-indigo-50",
      text: "text-indigo-700",
      badge: "bg-indigo-100 text-indigo-800",
    },
    {
      gradient: "from-teal-600 to-teal-700",
      light: "bg-teal-50",
      text: "text-teal-700",
      badge: "bg-teal-100 text-teal-800",
    },
  ];
  let hash = 0;
  for (let i = 0; i < department.length; i++) {
    hash = department.charCodeAt(i) + ((hash << 5) - hash);
  }
  return styles[Math.abs(hash) % styles.length];
}

function FacultyCard({ faculty }: { faculty: Faculty }) {
  const style = getDeptStyle(faculty.department);
  const initials = getInitials(faculty.name);

  return (
    <div className="group flex-shrink-0 w-[300px] sm:w-[320px] select-none">
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 border border-slate-100">
        {/* Gradient header with avatar */}
        <div
          className={`relative bg-gradient-to-br ${style.gradient} px-6 pt-8 pb-14`}
        >
          {/* Subtle pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Status indicator */}
          {faculty.status === "ACTIVE" && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-[9px] font-bold text-white/90 uppercase tracking-wider">
                Active
              </span>
            </div>
          )}

          {/* Name and designation on header */}
          <div className="relative z-10">
            <h3 className="text-base font-bold text-white leading-tight">
              {faculty.name}
            </h3>
            <p className="text-white/80 text-xs font-medium mt-1">
              {faculty.designation}
            </p>
          </div>
        </div>

        {/* Avatar overlapping header and body */}
        <div className="relative px-6">
          <div className="absolute -top-10 right-6">
            <div
              className={`w-[72px] h-[72px] rounded-2xl ${style.light} flex items-center justify-center ring-4 ring-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
            >
              <span className={`text-xl font-extrabold ${style.text}`}>
                {initials}
              </span>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="px-6 pt-5 pb-6">
          {/* Department badge */}
          <div className="mb-5">
            <span
              className={`inline-block px-3 py-1 rounded-lg ${style.badge} text-[10px] font-bold uppercase tracking-wider`}
            >
              {faculty.department.replace("Department of ", "")}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 mb-4" />

          {/* Contact details as text */}
          <div className="space-y-3">
            {faculty.email && (
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Email
                </span>
                <a
                  href={`mailto:${faculty.email}`}
                  className="text-xs text-slate-700 hover:text-blue-600 transition-colors font-medium truncate"
                  title={faculty.email}
                  onClick={(e) => e.stopPropagation()}
                >
                  {faculty.email}
                </a>
              </div>
            )}
            {faculty.phone && (
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Phone
                </span>
                <a
                  href={`tel:${faculty.phone}`}
                  className="text-xs text-slate-700 hover:text-emerald-600 transition-colors font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  +91 {faculty.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FacultyMarquee() {
  const activeFaculties = faculties.filter((f) => f.status === "ACTIVE");

  return (
    <section className="py-20 bg-slate-900 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950/50 to-slate-900" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10">
        {/* Section header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <User className="h-3.5 w-3.5" />
              Our Faculty
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 tracking-tight leading-tight uppercase">
              Meet Our Distinguished Faculty
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
              Our dedicated team of professors and educators bring expertise,
              passion, and decades of academic excellence to every classroom.
            </p>
          </div>
        </div>

        {/* Marquee container — pauses on hover anywhere in the track area */}
        <div className="marquee-wrapper relative overflow-hidden">
          {/* Edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-r from-slate-900 to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-l from-slate-900 to-transparent z-20 pointer-events-none" />

          {/* Scrolling track */}
          <div className="flex w-max shrink-0 flex-nowrap gap-6 animate-marquee">
            {/* First set */}
            {activeFaculties.map((faculty) => (
              <FacultyCard key={`first-${faculty.id}`} faculty={faculty} />
            ))}
            {/* Duplicate set for seamless loop */}
            {activeFaculties.map((faculty) => (
              <FacultyCard key={`second-${faculty.id}`} faculty={faculty} />
            ))}
          </div>
        </div>

        {/* Faculty count badge */}
        <div className="flex justify-center mt-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {activeFaculties.length} Active Faculty Members
          </div>
        </div>
      </div>
    </section>
  );
}
