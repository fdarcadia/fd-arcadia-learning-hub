"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  Calculator,
  ChevronRight,
  FileText,
  Gift,
  Home,
  Layers3,
  LogOut,
  Star,
  UserRound,
  Users,
  X,
} from "lucide-react";

type PortalRole = "admin" | "parent";

type PortalSidebarProps = {
  role: PortalRole;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const adminMenu: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    label: "Manage Parents",
    href: "/admin/manage-parents",
    icon: Users,
  },
  {
    label: "Reading Modules",
    href: "/admin/learning-hub",
    icon: BookOpenCheck,
  },
  {
    label: "Reading Progress",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    label: "Flashcard Library",
    href: "/admin/flashcard-library",
    icon: Layers3,
  },
  {
    label: "Custom Worksheet",
    href: "/admin/custom-worksheet",
    icon: FileText,
  },
  {
    label: "Math Activity",
    href: "/admin/math-activity",
    icon: Calculator,
  },
  {
    label: "Sifir Deck",
    href: "/admin/sifir-deck",
    icon: Star,
  },
  {
    label: "Calendar",
    href: "/admin/calendar",
    icon: CalendarDays,
  },
  {
    label: "Freebies",
    href: "/admin/freebies",
    icon: Gift,
  },
];

const parentMenu: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Children",
    href: "/children",
    icon: Users,
  },
  {
    label: "Learning Hub",
    href: "/learning-hub",
    icon: BookOpenCheck,
  },
  {
    label: "Math Activity",
    href: "/math-activity",
    icon: Calculator,
  },
  {
    label: "Sifir Deck",
    href: "/sifir-deck",
    icon: Star,
  },
  {
    label: "Flashcard Library",
    href: "/flashcard-library",
    icon: Layers3,
  },
  {
    label: "Custom Worksheet",
    href: "/custom-worksheet",
    icon: FileText,
  },
  {
    label: "Freebies",
    href: "/freebies",
    icon: Gift,
  },
  {
    label: "Schedule",
    href: "/schedule",
    icon: CalendarDays,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: UserRound,
  },
];

export function PortalSidebar({
  role,
  mobileOpen = false,
  onMobileClose,
}: PortalSidebarProps) {
  const pathname = usePathname();

  const menu = role === "admin" ? adminMenu : parentMenu;

  const portalLabel =
    role === "admin" ? "ADMIN PORTAL" : "PARENT PORTAL";

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[290px] flex-col
          bg-[#111735] text-white
          shadow-2xl
          transition-transform duration-300 ease-out

          lg:sticky lg:top-0 lg:z-20
          lg:h-screen lg:w-[280px]
          lg:translate-x-0 lg:shadow-none

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* BRAND */}
        <div className="border-b border-white/10 px-6 pb-6 pt-7">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={role === "admin" ? "/admin" : "/dashboard"}
              onClick={onMobileClose}
              className="flex min-w-0 items-center gap-4"
            >
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg">
                <img
                  src="/icon.png"
                  alt="FD Arcadia"
                  className="h-full w-full object-contain p-1"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xl font-black tracking-[0.08em] text-white">
                  FD ARCADIA
                </p>

                <p className="mt-1 text-xs font-black tracking-[0.2em] text-violet-300">
                  {portalLabel}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={onMobileClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15 lg:hidden"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-1.5">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={`
                    group flex min-h-[54px] items-center
                    gap-3 rounded-2xl px-4 py-3
                    transition-all duration-200

                    ${
                      active
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-950/20"
                        : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                    }
                  `}
                >
                  <div
                    className={`
                      grid h-9 w-9 shrink-0 place-items-center rounded-xl
                      transition

                      ${
                        active
                          ? "bg-white/15 text-white"
                          : "text-slate-300 group-hover:bg-white/[0.07] group-hover:text-white"
                      }
                    `}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>

                  <span className="min-w-0 flex-1 truncate text-[15px] font-bold">
                    {item.label}
                  </span>

                  <ChevronRight
                    size={17}
                    className={`
                      shrink-0 transition
                      ${
                        active
                          ? "opacity-80"
                          : "opacity-0 group-hover:opacity-50"
                      }
                    `}
                  />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* BOTTOM */}
        <div className="border-t border-white/10 p-4">
          <Link
            href="/logout"
            onClick={onMobileClose}
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06]">
              <LogOut size={19} />
            </div>

            <span className="font-bold">Logout</span>
          </Link>

          <p className="mt-4 px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            FD Arcadia Learning Hub
          </p>
        </div>
      </aside>
    </>
  );
}