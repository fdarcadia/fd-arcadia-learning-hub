"use client";

import type React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Gift,
  Home,
  LockKeyhole,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";

const weeks = [
  {
    week: 1,
    title: "Week 1",
    subtitle: "Assessment, warm-up and first activities",
    badge: "Start Here",
    status: "Completed",
    unlocked: true,
    progress: 100,
    image: "🌱",
    color: "from-yellow-100 to-orange-100",
  },
  {
    week: 2,
    title: "Week 2",
    subtitle: "Continue weekly worksheet and learning files",
    badge: "Learning",
    status: "In Progress",
    unlocked: true,
    progress: 60,
    image: "👧",
    color: "from-sky-100 to-indigo-100",
  },
  {
    week: 3,
    title: "Week 3",
    subtitle: "Practice, games and revision activities",
    badge: "Practice",
    status: "Upcoming",
    unlocked: true,
    progress: 0,
    image: "😊",
    color: "from-emerald-100 to-lime-100",
  },
  {
    week: 4,
    title: "Week 4",
    subtitle: "Review, special activity and progress check",
    badge: "Review",
    status: "Upcoming",
    unlocked: true,
    progress: 0,
    image: "🪥",
    color: "from-pink-100 to-rose-100",
  },
];

const subjectPreview = [
  { title: "Warm Up", icon: "☀️", time: "9:00 AM" },
  { title: "Math", icon: "🔢", time: "10:00 AM" },
  { title: "Science", icon: "🧪", time: "11:00 AM" },
  { title: "Reading", icon: "📖", time: "9:30 AM" },
  { title: "Membaca", icon: "📚", time: "12:00 PM" },
];

const sidebarLinks = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "My Children", href: "/children", icon: Users },
  { title: "Learning Hub", href: "/learning-hub", icon: BookOpenCheck },
  { title: "Freebies", href: "/freebies", icon: Gift },
];

export default function MonthPage() {
  return (
    <ProtectedPage>
      {() => <MonthContent />}
    </ProtectedPage>
  );
}

function MonthContent() {
  const params = useParams();
  const monthParam = String(params.month || "month-1");
  const monthNo = monthParam.replace("month-", "") || "1";

  const totalProgress = Math.round(
    weeks.reduce((sum, item) => sum + item.progress, 0) / weeks.length
  );

  const completedWeeks = weeks.filter((item) => item.status === "Completed").length;
  const activeWeek = weeks.find((item) => item.status === "In Progress") || weeks[0];

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[250px_minmax(0,1fr)]">
        <MonthSidebar monthNo={monthNo} monthParam={monthParam} totalProgress={totalProgress} />

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/learning-hub"
                className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 transition hover:text-indigo-700"
              >
                <ArrowLeft size={14} />
                Back to Learning Hub
              </Link>

              <p className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
                FD Arcadia Learning Hub
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Month {monthNo}
              </h1>

              <p className="mt-1 text-sm font-semibold text-slate-400">
                Choose a week and continue the monthly learning plan.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex self-start items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 sm:self-auto"
            >
              <Home size={15} />
              Dashboard
            </Link>
          </header>

          <section className="relative mt-5 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#5b50d6] via-[#5158c6] to-[#36539b] px-5 py-6 text-white shadow-[0_18px_50px_rgba(79,70,229,0.18)] sm:px-6">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative grid gap-6 xl:grid-cols-[1fr_auto] xl:items-center">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-yellow-200">
                    <BookOpenCheck size={21} />
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-100">
                      Monthly Learning Plan
                    </p>
                    <h2 className="mt-0.5 text-2xl font-black sm:text-3xl">
                      Month {monthNo} learning journey
                    </h2>
                  </div>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-indigo-100">
                  Four structured weeks with schedules, worksheets and subject
                  activities prepared by FD Arcadia.
                </p>
              </div>

              <div className="grid min-w-[320px] grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.07]">
                <MonthHeroStat value="4" label="Weeks" />
                <MonthHeroStat value={`${completedWeeks}/4`} label="Completed" />
                <MonthHeroStat value={`${totalProgress}%`} label="Progress" />
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.72fr]">
            <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
                    Continue Learning
                  </p>
                  <h2 className="mt-1 text-xl font-black">
                    {activeWeek.title}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    {activeWeek.subtitle}
                  </p>
                </div>

                <StatusBadge status={activeWeek.status} />
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-[10px] font-black text-slate-400">
                  <span>Progress</span>
                  <span>{activeWeek.progress}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    style={{ width: `${activeWeek.progress}%` }}
                  />
                </div>
              </div>

              <Link
                href={`/learning-hub/${monthParam}/week-${activeWeek.week}`}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800"
              >
                Continue Week {activeWeek.week}
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Month Progress
                  </p>
                  <h2 className="mt-1 text-xl font-black">{totalProgress}%</h2>
                </div>
                <Trophy size={20} className="text-violet-500" />
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {weeks.map((item) => (
                  <div
                    key={item.week}
                    className="rounded-xl bg-slate-50 px-2 py-3 text-center"
                  >
                    <p className="text-[9px] font-black uppercase text-slate-400">
                      W{item.week}
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-800">
                      {item.progress}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
                  Weekly Path
                </p>
                <h2 className="mt-1 text-2xl font-black">Choose Your Week</h2>
              </div>

              <div className="hidden items-center gap-2 text-[10px] font-black text-slate-400 sm:flex">
                <Clock3 size={14} className="text-indigo-500" />
                Week 1–4
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {weeks.map((item) => (
                <WeekCard key={item.week} item={item} monthParam={monthParam} />
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Weekly Flow</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Select a week to open the daily schedule, worksheet links,
                    videos and activity resources.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <SmallStep number="1" text="Choose week" />
                    <SmallStep number="2" text="Open resources" />
                    <SmallStep number="3" text="Complete activity" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Subjects
                  </p>
                  <h3 className="mt-1 text-sm font-black text-slate-900">
                    Weekly Learning
                  </h3>
                </div>
                <Star size={17} className="text-violet-500" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {subjectPreview.map((subject) => (
                  <span
                    key={subject.title}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-600"
                  >
                    <span>{subject.icon}</span>
                    {subject.title}
                    <span className="font-semibold text-slate-400">
                      {subject.time}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function MonthSidebar({
  monthNo,
  monthParam,
  totalProgress,
}: {
  monthNo: string;
  monthParam: string;
  totalProgress: number;
}) {
  return (
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-4 py-6 text-white xl:flex xl:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <BookOpenCheck size={21} />
        </div>
        <div>
          <p className="text-sm font-black tracking-[0.08em]">FD ARCADIA</p>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-300">
            LEARNING HUB
          </p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1.5">
        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const active = item.title === "Learning Hub";

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-black transition ${
                active
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-7">
        <p className="px-3 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
          Month {monthNo}
        </p>

        <div className="mt-2 space-y-1">
          {weeks.map((item) => (
            <Link
              key={item.week}
              href={`/learning-hub/${monthParam}/week-${item.week}`}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              <span>{item.title}</span>
              {item.status === "Completed" ? (
                <CheckCircle2 size={13} className="text-emerald-400" />
              ) : item.status === "In Progress" ? (
                <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
              ) : (
                <Clock3 size={13} className="text-slate-500" />
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-[18px] border border-white/10 bg-white/[0.05] p-4">
        <div className="flex items-center gap-2 text-yellow-300">
          <Trophy size={16} />
          <p className="text-xs font-black">Month {monthNo}</p>
        </div>

        <p className="mt-3 text-2xl font-black">{totalProgress}%</p>
        <p className="mt-1 text-[10px] font-semibold text-slate-400">
          Overall month progress
        </p>

        <Link
          href="/learning-hub"
          className="mt-3 inline-flex items-center text-[10px] font-black text-violet-300 transition hover:text-white"
        >
          Back to months
          <ChevronRight size={13} className="ml-1" />
        </Link>
      </div>
    </aside>
  );
}

function WeekCard({
  item,
  monthParam,
}: {
  item: (typeof weeks)[number];
  monthParam: string;
}) {
  return (
    <Link
      href={item.unlocked ? `/learning-hub/${monthParam}/week-${item.week}` : "#"}
      className={`group rounded-[22px] border bg-white p-5 shadow-sm transition ${
        item.unlocked
          ? "border-slate-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          : "cursor-not-allowed border-slate-100 opacity-55"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${item.color} text-lg`}
          >
            {item.image}
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-indigo-500">
              {item.badge}
            </p>
            <h3 className="mt-0.5 text-base font-black text-slate-900">
              {item.title}
            </h3>
          </div>
        </div>

        <StatusBadge status={item.status} />
      </div>

      <p className="mt-4 min-h-10 text-xs leading-5 text-slate-500">
        {item.subtitle}
      </p>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[9px] font-black text-slate-400">
          <span>Progress</span>
          <span>{item.progress}%</span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${
              item.progress === 100
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-violet-500 to-indigo-500"
            }`}
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-[10px] font-black text-indigo-600">
          Open Week
        </span>

        <ChevronRight
          size={14}
          className="text-indigo-500 transition group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes =
    status === "Completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "In Progress"
        ? "bg-indigo-50 text-indigo-700"
        : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-wide ${classes}`}
    >
      {status}
    </span>
  );
}

function MonthHeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="px-3 py-4 text-center">
      <p className="text-xl font-black sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-indigo-100">
        {label}
      </p>
    </div>
  );
}

function SmallStep({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 py-1.5 pl-1.5 pr-3 text-[10px] font-black text-slate-600">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-600 text-[9px] text-white">
        {number}
      </span>
      {text}
    </span>
  );
}