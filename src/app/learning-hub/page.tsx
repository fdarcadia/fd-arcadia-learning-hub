"use client";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Crown,
  FileText,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";

const months = [
  {
    month: 1,
    title: "Month 1",
    subtitle: "Foundation activities, assessment and weekly learning plan.",
    badge: "Start Here",
    unlocked: true,
  },
  {
    month: 2,
    title: "Month 2",
    subtitle: "Continue with new themes, worksheets and activities.",
    badge: "Month 2",
    unlocked: true,
  },
  {
    month: 3,
    title: "Month 3",
    subtitle: "Practice, games, reading and learning files.",
    badge: "Month 3",
    unlocked: true,
  },
  {
    month: 4,
    title: "Month 4",
    subtitle: "More learning hub schedules and activities.",
    badge: "Month 4",
    unlocked: true,
  },
  {
    month: 5,
    title: "Month 5",
    subtitle: "Revision, enrichment and weekly files.",
    badge: "Month 5",
    unlocked: true,
  },
  {
    month: 6,
    title: "Month 6",
    subtitle: "Premium learning content and progress activities.",
    badge: "Premium",
    unlocked: true,
  },
];

export default function LearningHubPage() {
  return (
    <ProtectedPage>
      {() => (
        <>
          <Navbar />

          <main className="page-shell py-8">
            <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl sm:p-8">
              <div className="flex items-center gap-3">
                <Crown className="text-yellow-200" size={34} />
                <p className="tracking-[0.25em] text-yellow-200">
                  FD ARCADIA LEARNING HUB
                </p>
              </div>

              <h1 className="font-display mt-4 text-5xl sm:text-6xl">
                Choose Your Month
              </h1>

              <p className="mt-3 text-lg text-indigo-100">
                Open monthly learning schedules, weekly activities, worksheets,
                videos, games and learning files.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-2xl bg-white px-4 py-2 font-bold text-indigo-700">
                  Monthly Schedule
                </span>

                <span className="rounded-2xl bg-yellow-200 px-4 py-2 font-bold text-indigo-700">
                  Week 1 - Week 4
                </span>

                <span className="rounded-2xl bg-emerald-100 px-4 py-2 font-bold text-emerald-700">
                  Google Drive Files
                </span>
              </div>
            </section>

            <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {months.map((item) => (
                <Link
                  key={item.month}
                  href={
                    item.unlocked
                      ? `/learning-hub/month-${item.month}`
                      : "#"
                  }
                  className={`rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm transition ${
                    item.unlocked
                      ? "hover:-translate-y-1 hover:shadow-xl"
                      : "cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-yellow-100 text-yellow-700">
                      <CalendarDays size={32} />
                    </div>

                    {item.unlocked ? (
                      <CheckCircle2 className="text-emerald-600" size={26} />
                    ) : (
                      <LockKeyhole className="text-slate-400" size={26} />
                    )}
                  </div>

                  <span className="mt-6 inline-block rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
                    {item.badge}
                  </span>

                  <h2 className="mt-4 text-3xl font-bold text-indigo-700">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-slate-600">
                    {item.subtitle}
                  </p>

                  <div className="mt-5 flex items-center gap-2 rounded-2xl bg-yellow-100 px-4 py-3 font-bold text-yellow-800">
                    <FileText size={20} />
                    Open Month Content
                  </div>
                </Link>
              ))}
            </section>

            <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-purple-100 text-purple-700">
                  <Sparkles size={28} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-indigo-700">
                    How it works
                  </h2>

                  <p className="mt-2 text-slate-600">
                    Choose a month, then choose Week 1, Week 2, Week 3 or Week
                    4. Each week contains schedules, worksheets and activity
                    links uploaded by FD Arcadia admin.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </>
      )}
    </ProtectedPage>
  );
}