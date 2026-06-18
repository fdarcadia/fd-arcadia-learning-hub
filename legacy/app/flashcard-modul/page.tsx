"use client";

import { Layers3 } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import BackToDashboardButton from "@/components/common/BackToDashboardButton";

function FlashcardModulContent() {
  return (
    <main className="min-h-screen bg-[var(--fd-cream)] px-4 py-5 text-[var(--fd-blue)] md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5">
          <BackToDashboardButton />
        </div>

        <section className="rounded-lg bg-white p-6 shadow-[0_20px_60px_rgba(76,87,169,0.1)] md:p-8">
          <div className="mb-5 grid size-14 place-items-center rounded-lg bg-[#f0f7e6] text-[var(--fd-green)]">
            <Layers3 size={28} aria-hidden="true" />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--fd-green)]">
            Flashcard & Modul
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal">Practice cards and modules</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[var(--fd-blue)]/70">
            This protected area is ready for your flashcards, modules, and practice sets.
          </p>
        </section>
      </div>
    </main>
  );
}

export default function FlashcardModulPage() {
  return (
    <AuthGuard accessKey="flashcard_modul_access" lockedTitle="Flashcard & Modul is locked">
      <FlashcardModulContent />
    </AuthGuard>
  );
}
