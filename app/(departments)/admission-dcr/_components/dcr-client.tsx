"use client";

import {
  Calendar,
  FileSpreadsheet,
  Filter,
  IndianRupee,
  Layers,
  Printer,
  RefreshCw,
  Search,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { getDCRReport } from "../lib/action";

interface StatItem {
  amount: number;
  count: number;
}

interface DCRStats {
  today: StatItem;
  month: StatItem;
  total: StatItem;
}

interface FilterOptions {
  departments: { id: string; name: string }[];
  courses: { id: string; name: string; departmentId: string }[];
  batches: { id: string; courseId: string; name: string }[];
}

interface DCRRecord {
  id: string;
  transactionId: string;
  amount: number;
  paymentMode: string;
  createdAt: string;
  studentName: string;
  uan: string;
  courseName: string;
  sessionName: string;
}

interface DCRClientProps {
  initialStats: DCRStats;
  initialReport: DCRRecord[];
  filterOptions: FilterOptions;
}

export default function DCRClient({
  initialStats,
  initialReport,
  filterOptions,
}: DCRClientProps) {
  const stats = initialStats;
  const [report, setReport] = useState<DCRRecord[]>(initialReport);
  const [isPending, startTransition] = useTransition();

  // Filters State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [semester, setSemester] = useState("all"); // Default to All Semesters
  const [departmentId, setDepartmentId] = useState("all");
  const [courseId, setCourseId] = useState("all");
  const [batchId, setBatchId] = useState("all");

  // Dynamic cascades
  const filteredCourses = useMemo(() => {
    if (departmentId === "all") {
      return filterOptions.courses;
    }
    return filterOptions.courses.filter((c) => c.departmentId === departmentId);
  }, [departmentId, filterOptions.courses]);

  const filteredBatches = useMemo(() => {
    if (courseId === "all") {
      // If a department is selected but no course, filter batches by courses in that department
      if (departmentId !== "all") {
        const depCourseIds = new Set(filteredCourses.map((c) => c.id));
        return filterOptions.batches.filter((b) =>
          depCourseIds.has(b.courseId),
        );
      }
      return filterOptions.batches;
    }
    return filterOptions.batches.filter((b) => b.courseId === courseId);
  }, [courseId, departmentId, filteredCourses, filterOptions.batches]);

  const handleDepartmentChange = (val: string) => {
    setDepartmentId(val);
    setCourseId("all");
    setBatchId("all");
  };

  const handleCourseChange = (val: string) => {
    setCourseId(val);
    setBatchId("all");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await getDCRReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        semester: semester === "all" ? undefined : semester,
        departmentId: departmentId === "all" ? undefined : departmentId,
        courseId: courseId === "all" ? undefined : courseId,
        batchId: batchId === "all" ? undefined : batchId,
      });

      if (res.success && res.report) {
        setReport(res.report);
      } else {
        alert(res.message || "Failed to retrieve report.");
      }
    });
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    if (report.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      "S.No",
      "Transaction ID",
      "Student Name",
      "UAN Reference",
      "Course / Batch",
      "Payment Mode",
      "Amount (INR)",
      "Transaction Date",
    ];

    const csvRows = [headers.join(",")];

    for (let i = 0; i < report.length; i++) {
      const p = report[i];
      const dateStr = `${new Date(p.createdAt).toLocaleDateString(
        "en-IN",
      )} ${new Date(p.createdAt).toLocaleTimeString("en-IN")}`;
      const courseBatch = `${p.courseName} - ${p.sessionName}`;

      const row = [
        i + 1,
        `"${p.transactionId}"`,
        `"${p.studentName.replace(/"/g, '""')}"`,
        `"${p.uan}"`,
        `"${courseBatch.replace(/"/g, '""')}"`,
        `"${p.paymentMode}"`,
        p.amount,
        `"${dateStr}"`,
      ];
      csvRows.push(row.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `SSDM_Admission_DCR_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Summary counts for filtered range
  const totalFilteredAmount = report.reduce((sum, p) => sum + p.amount, 0);
  const totalFilteredCount = report.length;

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Admission Daily Collection Report (DCR)
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-normal">
            Monitor and audit online admission collections, apply advanced
            filters, export data, and generate printable reports.
          </p>
        </div>
      </div>

      {/* Stats Cards Row (Hidden when printing) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        {/* Today Card */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-blue-950 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-white/5 rounded-full" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <Calendar className="h-4 w-4" /> Today's Collection
            </div>
            <p className="text-3xl font-black mt-2">
              ₹{stats.today.amount.toLocaleString("en-IN")}
            </p>
          </div>
          <p className="text-[11px] text-blue-200 mt-4 border-t border-blue-800/60 pt-2 font-medium">
            {stats.today.count} successful transactions
          </p>
        </div>

        {/* Month Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-md border border-slate-900 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-white/5 rounded-full" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="h-4 w-4" /> This Month's Collection
            </div>
            <p className="text-3xl font-black mt-2">
              ₹{stats.month.amount.toLocaleString("en-IN")}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 border-t border-slate-800/60 pt-2 font-medium">
            {stats.month.count} successful transactions
          </p>
        </div>

        {/* Total Card */}
        <div className="bg-white text-slate-850 rounded-2xl p-6 shadow-md border border-slate-200/80 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-slate-50 rounded-full -z-10" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <IndianRupee className="h-4 w-4 text-blue-900" /> Total Collection
            </div>
            <p className="text-3xl font-black mt-2 text-slate-900">
              ₹{stats.total.amount.toLocaleString("en-IN")}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 border-t border-slate-100 pt-2 font-medium">
            {stats.total.count} successful transactions overall
          </p>
        </div>
      </div>

      {/* Filter Options Panel (Hidden when printing) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 print:hidden">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider pb-2 border-b border-slate-100">
          <Filter className="h-4 w-4 text-blue-950" /> Filter parameters
        </h3>

        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4"
        >
          {/* Department Filter */}
          <div className="space-y-1">
            <label
              htmlFor="dcr-dept"
              className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block"
            >
              Department
            </label>
            <select
              id="dcr-dept"
              value={departmentId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl outline-none focus:border-slate-800 transition cursor-pointer"
            >
              <option value="all">All Departments</option>
              {filterOptions.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div className="space-y-1">
            <label
              htmlFor="dcr-course"
              className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block"
            >
              Course
            </label>
            <select
              id="dcr-course"
              value={courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl outline-none focus:border-slate-800 transition cursor-pointer"
            >
              <option value="all">All Courses</option>
              {filteredCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div className="space-y-1">
            <label
              htmlFor="dcr-batch"
              className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block"
            >
              Batch
            </label>
            <select
              id="dcr-batch"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl outline-none focus:border-slate-800 transition cursor-pointer"
            >
              <option value="all">All Batches</option>
              {filteredBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="space-y-1">
            <label
              htmlFor="dcr-semester"
              className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block"
            >
              Semester
            </label>
            <select
              id="dcr-semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl outline-none focus:border-slate-800 transition cursor-pointer"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={String(s)}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label
              htmlFor="dcr-start"
              className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block"
            >
              Start Date
            </label>
            <input
              id="dcr-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-slate-800 transition"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label
              htmlFor="dcr-end"
              className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block"
            >
              End Date
            </label>
            <input
              id="dcr-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-slate-800 transition"
            />
          </div>

          {/* Search Button (Spans full width on mobile, aligned on right in desktop) */}
          <div className="sm:col-span-2 lg:col-span-6 flex justify-end pt-2 border-t border-slate-50">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Querying...
                </>
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" /> Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* DCR Report Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden print:shadow-none print:border-none print:p-0 print:m-0">
        {/* Header containing title and buttons (Buttons hidden when printing) */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:pb-4 print:mb-6">
          {/* Printable Header Details */}
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 print:hidden" />
              Admission Daily Collection Report
            </h2>
            <p className="text-[11px] text-slate-500">
              Filtered Semester:{" "}
              {semester === "all" ? "All Semesters" : `Semester ${semester}`} |
              Range:{" "}
              {startDate
                ? new Date(startDate).toLocaleDateString("en-IN")
                : "Inception"}{" "}
              to{" "}
              {endDate
                ? new Date(endDate).toLocaleDateString("en-IN")
                : "Today"}
            </p>
          </div>

          {/* DCR Actions Bar */}
          <div className="flex items-center gap-2.5 print:hidden">
            <button
              onClick={handleExportCSV}
              type="button"
              className="px-4 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-700" /> Export
              CSV
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-900/10"
            >
              <Printer className="h-4 w-4" /> Print DCR
            </button>
          </div>
        </div>

        {/* DCR Table */}
        <div className="overflow-x-auto">
          {report.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[9px] print:bg-slate-100">
                  <th className="p-4 text-center w-12">S.No.</th>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Candidate Name</th>
                  <th className="p-4 text-center">UAN Reference</th>
                  <th className="p-4">Course / Session</th>
                  <th className="p-4 text-center">Payment Mode</th>
                  <th className="p-4 text-right pr-6">Amount (INR)</th>
                  <th className="p-4 text-center">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {report.map((p, i) => {
                  const dateObject = new Date(p.createdAt);
                  const dateStr = dateObject.toLocaleDateString("en-IN");
                  const timeStr = dateObject.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-slate-50 hover:bg-slate-50/40 text-slate-650 font-medium transition-colors last:border-0"
                    >
                      <td className="p-4 text-center text-slate-400 font-bold">
                        {i + 1}
                      </td>
                      <td className="p-4 font-mono text-slate-800 font-bold select-all">
                        {p.transactionId}
                      </td>
                      <td className="p-4 text-slate-900 font-extrabold capitalize">
                        {p.studentName}
                      </td>
                      <td className="p-4 text-center font-mono select-all text-slate-800">
                        {p.uan}
                      </td>
                      <td className="p-4 text-slate-500 font-medium">
                        {p.courseName}
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Session: {p.sessionName}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6 font-bold text-slate-900 text-xs">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 text-center text-slate-450 whitespace-nowrap">
                        <span>{dateStr}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {timeStr}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* Summary Totals Row */}
                <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                  <td
                    className="p-4 text-right pr-4 uppercase tracking-wider text-[9px]"
                    colSpan={6}
                  >
                    Total Collection in Range
                  </td>
                  <td className="p-4 text-right pr-6 text-sm text-blue-900 font-black">
                    ₹{totalFilteredAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 text-center text-[10px] text-slate-500 uppercase tracking-widest">
                    {totalFilteredCount} Successful Txns
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-xs">
                No Records Found
              </h4>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                No successful admission transactions matching the current
                filters were found in this date range.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
