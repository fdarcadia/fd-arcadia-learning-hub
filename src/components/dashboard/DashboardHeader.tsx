"use client";

import Link from "next/link";
import { Bell, LogIn } from "lucide-react";

type DashboardHeaderProps = {
  displayName?: string;
  avatarUrl?: string | null;
  coinCount?: number;
};

export default function DashboardHeader({
  displayName = "Parent",
  avatarUrl,
  coinCount = 0,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-indigo-100/80 bg-[#f9f7ff]/95 px-3 py-3 backdrop-blur-xl sm:px-5 lg:px-6">
      <div className="flex min-h-[64px] items-center justify-between gap-3">
        
        {/* BRAND */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-md">
            <img
              src="/fd-arcadia-logo1.png"
              alt="FD Arcadia Learning Hub"
              className="h-full w-full object-contain p-1"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-violet-500">
              FD Arcadia LearningHub
            </p>

            <h1 className="truncate text-xl font-black text-[#28245d]">
              Home
            </h1>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex shrink-0 items-center gap-2">
          
          {/* COINS */}
          <div className="flex h-10 items-center gap-2 rounded-2xl bg-[#292958] px-3 text-white shadow-sm">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-sm">
              🪙
            </span>

            <span className="text-sm font-black">
              {coinCount}
            </span>

            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-sm">
              +
            </span>
          </div>

          {/* NOTIFICATION */}
          <button
            type="button"
            aria-label="Notifications"
            className="grid h-10 w-10 place-items-center rounded-2xl bg-[#292958] text-white shadow-sm transition hover:-translate-y-0.5"
          >
            <Bell size={19} />
          </button>

          {/* PARENT AVATAR */}
          <Link
            href="/profile"
            aria-label="My Profile"
            className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm transition hover:-translate-y-0.5"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-lg">👤</span>
            )}
          </Link>

          {/* LOGOUT / EXIT */}
          <Link
            href="/login"
            aria-label="Logout"
            className="grid h-10 w-10 place-items-center rounded-2xl bg-[#292958] text-white shadow-sm transition hover:-translate-y-0.5"
          >
            <LogIn size={19} />
          </Link>
        </div>
      </div>
    </header>
  );
}