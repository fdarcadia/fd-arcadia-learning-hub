"use client";

import { FileText } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import BackToDashboardButton from "@/components/common/BackToDashboardButton";

function CustomWorksheetContent() {
  return (
    <main className="min-h-screen bg-[var(--fd-cream)] px-4 py-5 text-[var(--fd-blue)] md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5">
          <BackToDashboardButton />
        </div>

        <section className="rounded-lg bg-white p-6 shadow-[0_20px_60px_rgba(76,87,169,0.1)] md:p-8">
          <div className="mb-5 grid size-14 place-items-center rounded-lg bg-[#fff8dc] text-[var(--fd-red)]">
            <FileText size={28} aria-hidden="true" />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--fd-green)]">
            Custom Worksheet
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal">Personalised worksheet requests</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[var(--fd-blue)]/70">
            This page is ready for your custom worksheet form, order history, or downloadable files.
          </p>
        </section>
      </div>
    </main>
  );
}

export default function CustomWorksheetPage() {
  return (
    <AuthGuard accessKey="custom_worksheet_access" lockedTitle="Custom Worksheet is locked">
      <CustomWorksheetContent />
    </AuthGuard>
  );
}
