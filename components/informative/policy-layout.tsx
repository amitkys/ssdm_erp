import { ChevronRight, FileText, RotateCcw, Shield } from "lucide-react";
import Link from "next/link";
import { SiteFooter } from "@/components/informative/site-footer";
import { SiteHeader } from "@/components/informative/site-header";
import type { CollegeConfig } from "@/lib/college-config";

export function PolicyLayout({
  title,
  subtitle,
  activeSlug,
  config,
  children,
}: {
  title: string;
  subtitle: string;
  activeSlug: "privacy-policy" | "terms-and-conditions" | "refund-policy";
  config: CollegeConfig;
  children: React.ReactNode;
}) {
  const menuItems = [
    {
      label: "Privacy Policy",
      slug: "privacy-policy",
      href: "/privacy-policy",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      label: "Terms & Conditions",
      slug: "terms-and-conditions",
      href: "/terms-and-conditions",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Refund Policy",
      slug: "refund-policy",
      href: "/refund-policy",
      icon: <RotateCcw className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      <SiteHeader collegeName={config.name} />

      <main className="flex-grow">
        {/* Banner */}
        <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute left-1/3 bottom-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-400">
              Legal & Policies
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight capitalize">
              {title}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl font-light">
              {subtitle}
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">
                  Documents
                </h3>
                <nav className="flex flex-col gap-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        item.slug === activeSlug
                          ? "bg-blue-50 text-blue-900 border border-blue-100/50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {item.icon} {item.label}
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-60" />
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-center space-y-3">
                <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-widest">
                  Need Help?
                </h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  If you have queries regarding our policies or payments,
                  contact our support team.
                </p>
                <div className="text-[11px] font-semibold text-blue-900">
                  <a
                    href={`mailto:${config.email}`}
                    className="hover:underline block truncate"
                  >
                    {config.email}
                  </a>
                  <a
                    href={`tel:${config.phone}`}
                    className="hover:underline block mt-1"
                  >
                    {config.phone}
                  </a>
                </div>
              </div>
            </aside>

            {/* Document Content */}
            <article className="lg:col-span-9 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-10 shadow-sm max-w-none text-slate-700">
              {children}
            </article>
          </div>
        </section>
      </main>

      <SiteFooter config={config} />
    </div>
  );
}
