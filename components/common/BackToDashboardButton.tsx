"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackToDashboardButton() {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-black text-[var(--fd-blue)] shadow-sm transition hover:-translate-y-0.5"
    >
      <ArrowLeft size={18} />
      Back to Dashboard
    </Link>
  );
}