"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";

const weeks = [
  {
    week: 1,
    title: "Week 1",
    subtitle: "Assessment, warm-up and first activities",
    badge: "Start Here",
    unlocked: true,
  },
  {
    week: 2,
    title: "Week 2",
    subtitle: "Continue weekly worksheet and learning files",
    badge: "Learning",
    unlocked: true,
  },
  {
    week: 3,
    title: "Week 3",
    subtitle: "Practice, games and revision activities",
    badge: "Practice",
    unlocked: true,
  },
  {
    week: 4,
    title: "Week 4",
    subtitle: "Review, special activity and progress check",
    badge: "Review",
    unlocked: true,
  },
];

export default function MonthPage() {
  const params = useParams();
  const monthParam = String(params.month || "month-1");
  const monthNo = monthParam.replace("month-", "");

  return (
    <ProtectedPage>
      {() => (
        <>
          <Navbar />

          <main className="page-shell py-8">
            <Link
              href="/learning-hub"
              className="mb-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <ArrowLeft size={20} />
              Back to Months
            </Link>

            <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl sm:p-8">
              <div className="flex items-center gap-3">
                <Sparkles className="text-yellow-200" size={32} />
                <p className="tracking-[0.25em] text-yellow-200">
                  FD ARCADIA LEARNING HUB
                </p>
              </div>

              <h1 className="font-display mt-3 text-5xl sm:text-6xl">
                Month {monthNo}
              </h1>

              <p className="mt-3 text-lg text-indigo-100">
                Choose a week to view schedule, worksheet links and activities.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-2xl bg-white px-4 py-2 font-bold text-indigo-700">
                  4 Weeks
                </span>

                <span className="rounded-2xl bg-yellow-200 px-4 py-2 font-bold text-indigo-700">
                  Monthly Learning Plan
                </span>
              </div>
            </section>

            <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {weeks.map((item) => (
                <Link
                  key={item.week}
                  href={`/learning-hub/${monthParam}/week-${item.week}`}
                  className={`rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                    item.unlocked ? "" : "opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-100 text-indigo-700">
                      <CalendarDays size={32} />
                    </div>

                    {item.unlocked ? (
                      <CheckCircle2 className="text-emerald-600" size={26} />
                    ) : (
                      <LockKeyhole className="text-slate-400" size={26} />
                    )}
                  </div>

                  <span className="mt-6 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-800">
                    {item.badge}
                  </span>

                  <h2 className="mt-4 text-3xl font-bold text-indigo-700">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-slate-600">{item.subtitle}</p>

                  <div className="mt-5 flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 font-bold text-indigo-700">
                    <FileText size={20} />
                    Open schedule and files
                  </div>
                </Link>
              ))}
            </section>
          </main>
        </>
      )}
    </ProtectedPage>
  );
}