"use client";

import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { PortalSidebar } from "@/components/PortalSidebar";

type PortalRole = "admin" | "parent";

type PortalShellProps = {
  role: PortalRole;
  children: ReactNode;
};

export function PortalShell({
  role,
  children,
}: PortalShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* SIDEBAR */}
        <PortalSidebar
          role={role}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* PAGE AREA */}
        <div className="min-w-0">
          {/* MOBILE / TABLET HEADER */}
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#111735] text-white shadow-sm transition active:scale-95"
                  aria-label="Open menu"
                >
                  <Menu size={21} />
                </button>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black tracking-[0.08em] text-slate-950">
                    FD ARCADIA
                  </p>

                  <p className="truncate text-[9px] font-black uppercase tracking-[0.18em] text-violet-600">
                    {role === "admin"
                      ? "Admin Portal"
                      : "Parent Portal"}
                  </p>
                </div>
              </div>

              <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <img
                  src="/icon.png"
                  alt="FD Arcadia"
                  className="h-full w-full object-contain p-0.5"
                />
              </div>
            </div>
          </header>

          {/* ACTUAL PAGE */}
          <div className="min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}