"use client";

import { ArrowRight, BookOpenCheck, Palette } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import BackToDashboardButton from "@/components/common/BackToDashboardButton";

function LearningHubContent() {
  return (
    <main className="min-h-screen bg-[var(--fd-cream)] px-4 py-5 text-[var(--fd-blue)] md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5">
          <BackToDashboardButton />
        </div>

        <section className="mb-6 rounded-lg bg-[var(--fd-blue)] p-6 text-white shadow-[0_24px_70px_rgba(76,87,169,0.22)] md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--fd-yellow)]">
            Learning Hub
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal md:text-5xl">
            Worksheets and guided activities
          </h1>
          <p className="mt-3 max-w-2xl text-white/80">
            A cheerful space for children to practise, draw, write, and complete learning tasks.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/worksheet-activity"
            className="group rounded-lg border border-[var(--fd-blue)]/10 bg-white p-6 shadow-[0_18px_48px_rgba(76,87,169,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--fd-green)]/45"
          >
            <div className="mb-5 flex items-start justify-between">
              <span className="grid size-12 place-items-center rounded-lg bg-[#fff8dc] text-[var(--fd-red)]">
                <Palette size={24} aria-hidden="true" />
              </span>
              <ArrowRight size={20} className="transition group-hover:translate-x-1" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-black">Worksheet Activity Canvas</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--fd-blue)]/65">
              Draw with finger, mouse, or stylus. Upload a worksheet image or PDF and save work as PNG or PDF.
            </p>
          </Link>

          <article className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-6 shadow-[0_18px_48px_rgba(76,87,169,0.08)]">
            <div className="mb-5 grid size-12 place-items-center rounded-lg bg-[var(--fd-cream)] text-[var(--fd-blue)]">
              <BookOpenCheck size={24} aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-black">Monthly worksheet library</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--fd-blue)]/65">
              Add your weekly worksheet links or downloadable packs here as your content grows.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}

export default function LearningHubPage() {
  return (
    <AuthGuard accessKey="learning_hub_access" lockedTitle="Learning Hub is locked">
      <LearningHubContent />
    </AuthGuard>
  );
}
