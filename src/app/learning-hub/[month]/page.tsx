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

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[290px_1fr]">
        <aside className="hidden border-r border-indigo-100 bg-white p-6 xl:block">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-yellow-200 shadow-lg">
              <Sparkles size={26} />
            </div>

            <div>
              <p className="text-xl font-black tracking-[0.18em] text-slate-900">
                FD ARCADIA
              </p>
              <p className="text-sm font-black tracking-[0.25em] text-indigo-600">
                LEARNING HUB
              </p>
            </div>
          </Link>

          <nav className="mt-10 space-y-2">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const active = item.title === "Learning Hub";

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-3 font-black transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-indigo-700"
                  }`}
                >
                  <Icon size={22} />
                  {item.title}
                </Link>
              );
            })}

            <p className="mb-2 mt-6 text-xs font-black tracking-[0.2em] text-slate-400">
              MONTH {monthNo}
            </p>

            {weeks.map((item) => (
              <Link
                key={item.week}
                href={`/learning-hub/${monthParam}/week-${item.week}`}
                className="flex items-center justify-between rounded-2xl px-4 py-3 font-black text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                <span>{item.title}</span>
                {item.status === "Completed" ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : item.status === "In Progress" ? (
                  <span className="h-3 w-3 rounded-full bg-indigo-600" />
                ) : (
                  <Clock3 size={18} className="text-yellow-600" />
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl">
            <Trophy className="text-yellow-200" size={30} />
            <p className="mt-4 font-black">Month {monthNo}</p>
            <h3 className="mt-1 text-xl font-black">{totalProgress}% Completed</h3>
            <p className="mt-2 text-sm text-indigo-100">
              Complete weekly learning activities to increase progress.
            </p>
            <Link
              href="/learning-hub"
              className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-black text-indigo-700"
            >
              Back Months
            </Link>
          </div>
        </aside>

        <section className="px-4 py-6 lg:px-8">
          <header className="mb-8 flex items-center justify-between gap-4">
            <div>
              <Link
                href="/learning-hub"
                className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <ArrowLeft size={20} />
                Back to Months
              </Link>

              <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                FD ARCADIA LEARNING HUB
              </p>

              <h1 className="mt-1 text-4xl font-black text-indigo-700 sm:text-5xl">
                Month {monthNo}
              </h1>

              <p className="mt-2 max-w-3xl text-slate-600">
                Choose a week to view schedule, worksheet links, videos and activities.
              </p>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-7 text-white shadow-xl">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-yellow-200">
                  <Sparkles size={30} />
                </div>

                <div>
                  <p className="text-sm font-black tracking-[0.25em] text-yellow-200">
                    MONTHLY LEARNING PLAN
                  </p>
                  <h2 className="mt-1 text-3xl font-black">
                    Month {monthNo} learning journey.
                  </h2>
                </div>
              </div>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-indigo-100">
                Each week contains subject activities, worksheet links and learning
                files uploaded by FD Arcadia admin.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <HeroStat label="Weeks" value="4" />
                <HeroStat label="Subjects" value="5" />
                <HeroStat label="Progress" value={`${totalProgress}%`} />
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                    MONTH PROGRESS
                  </p>
                  <h2 className="mt-2 text-4xl font-black text-indigo-700">
                    {totalProgress}%
                  </h2>
                </div>

                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Trophy size={34} />
                </div>
              </div>

              <div className="mt-6 h-4 overflow-hidden rounded-full bg-indigo-50">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2">
                {weeks.map((item) => (
                  <div
                    key={item.week}
                    className="rounded-xl bg-indigo-50 px-2 py-3 text-center"
                  >
                    <p className="text-sm font-black text-indigo-700">
                      W{item.week}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {item.progress}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-5">
              <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                WEEK SELECTION
              </p>
              <h2 className="mt-1 text-3xl font-black text-indigo-700">
                Choose Your Week
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
              {weeks.map((item) => (
                <Link
                  key={item.week}
                  href={item.unlocked ? `/learning-hub/${monthParam}/week-${item.week}` : "#"}
                  className={`group rounded-[2rem] border border-indigo-100 bg-white p-5 shadow-sm transition ${
                    item.unlocked
                      ? "hover:-translate-y-1 hover:shadow-xl"
                      : "cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className={`rounded-[1.7rem] bg-gradient-to-br ${item.color} p-5`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-indigo-700 shadow-sm">
                        <CalendarDays size={32} />
                      </div>

                      {item.unlocked ? (
                        <CheckCircle2 className="text-emerald-600" size={26} />
                      ) : (
                        <LockKeyhole className="text-slate-400" size={26} />
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <span className="inline-block rounded-full bg-white px-3 py-1 text-sm font-black text-indigo-700">
                        {item.badge}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          item.status === "Completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="mt-4 text-3xl font-black text-indigo-700">
                      {item.title}
                    </h3>

                    <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                      {item.subtitle}
                    </p>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
                        <span>Progress</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-indigo-600"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 text-6xl">{item.image}</div>

                    <div className="mt-5 flex items-center justify-between rounded-2xl bg-indigo-600 px-4 py-3 font-black text-white transition group-hover:bg-indigo-700">
                      Open schedule and files
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-purple-100 text-purple-700">
                  <Sparkles size={28} />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-indigo-700">
                    Weekly Flow
                  </h2>

                  <p className="mt-2 leading-7 text-slate-600">
                    Choose one week to open the schedule, topics, worksheets and
                    activities. Each week can include different subject links.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <InfoPill icon={<CalendarDays size={18} />} text="Choose Week" />
                    <InfoPill icon={<FileText size={18} />} text="Open Files" />
                    <InfoPill icon={<CheckCircle2 size={18} />} text="Complete" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-yellow-100 text-yellow-700">
                  <Star size={28} />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-black text-indigo-700">
                    Subject Preview
                  </h2>

                  <p className="mt-2 leading-7 text-slate-600">
                    Weekly pages are organised by subject and activity time.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {subjectPreview.map((subject) => (
                      <div
                        key={subject.title}
                        className="rounded-2xl bg-indigo-50 px-4 py-3 font-black text-indigo-700"
                      >
                        <span className="mr-2 text-xl">{subject.icon}</span>
                        {subject.title}
                        <span className="ml-2 text-xs text-slate-500">
                          {subject.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4 text-white backdrop-blur">
      <p className="text-3xl font-black text-yellow-200">{value}</p>
      <p className="mt-1 text-sm font-bold text-indigo-100">{label}</p>
    </div>
  );
}

function InfoPill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 font-black text-indigo-700">
      {icon}
      {text}
    </div>
  );
}
