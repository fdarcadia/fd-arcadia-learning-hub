"use client";

import Link from "next/link";
import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Crown,
  FileText,
  Home,
  LockKeyhole,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";

const months = [
  {
    month: 1,
    title: "Month 1",
    theme: "Foundation",
    subtitle: "Foundation activities, assessment and weekly learning plan.",
    badge: "Start Here",
    unlocked: true,
    progress: 75,
    color: "from-yellow-100 to-orange-100",
  },
  {
    month: 2,
    title: "Month 2",
    theme: "Practice",
    subtitle: "Continue with new themes, worksheets and activities.",
    badge: "Month 2",
    unlocked: true,
    progress: 40,
    color: "from-sky-100 to-indigo-100",
  },
  {
    month: 3,
    title: "Month 3",
    theme: "Explore",
    subtitle: "Practice, games, reading and learning files.",
    badge: "Month 3",
    unlocked: true,
    progress: 20,
    color: "from-emerald-100 to-lime-100",
  },
  {
    month: 4,
    title: "Month 4",
    theme: "Build",
    subtitle: "More learning hub schedules and activities.",
    badge: "Month 4",
    unlocked: true,
    progress: 0,
    color: "from-pink-100 to-rose-100",
  },
  {
    month: 5,
    title: "Month 5",
    theme: "Revision",
    subtitle: "Revision, enrichment and weekly files.",
    badge: "Month 5",
    unlocked: true,
    progress: 0,
    color: "from-purple-100 to-violet-100",
  },
  {
    month: 6,
    title: "Month 6",
    theme: "Premium",
    subtitle: "Premium learning content and progress activities.",
    badge: "Premium",
    unlocked: true,
    progress: 0,
    color: "from-indigo-100 to-blue-100",
  },
];

const subjectPreview = [
  { title: "Warm Up", icon: "☀️" },
  { title: "Math", icon: "🔢" },
  { title: "Science", icon: "🧪" },
  { title: "Reading", icon: "📖" },
  { title: "Membaca", icon: "📚" },
];

const sidebarLinks = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "My Children", href: "/children", icon: Users },
  { title: "Learning Hub", href: "/learning-hub", icon: BookOpenCheck },
];

export default function LearningHubPage() {
  return (
    <ProtectedPage>
      {() => <LearningHubContent />}
    </ProtectedPage>
  );
}
function LearningHubContent() {
  const totalProgress = Math.round(
    months.reduce((sum, item) => sum + item.progress, 0) / months.length
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
              MONTHS
            </p>

            {months.map((item) => (
              <Link
                key={item.month}
                href={`/learning-hub/month-${item.month}`}
                className="flex items-center justify-between rounded-2xl px-4 py-3 font-black text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                <span>{item.title}</span>
                {item.unlocked ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <LockKeyhole size={18} className="text-slate-400" />
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl">
            <Crown className="text-yellow-200" size={30} />
            <p className="mt-4 font-black">Learning Hub</p>
            <h3 className="mt-1 text-xl font-black">Month 1 - Month 6</h3>
            <p className="mt-2 text-sm text-indigo-100">
              Open weekly activities, worksheet links, videos and learning files.
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-black text-indigo-700"
            >
              Back Dashboard
            </Link>
          </div>
        </aside>

        <section className="px-4 py-6 lg:px-8">
          <header className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                FD ARCADIA LEARNING HUB
              </p>

              <h1 className="mt-1 text-4xl font-black text-indigo-700 sm:text-5xl">
                Choose Your Month
              </h1>

              <p className="mt-2 max-w-3xl text-slate-600">
                Open monthly learning schedules, weekly activities, worksheets,
                videos, games and learning files.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="hidden rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-sm transition hover:bg-indigo-50 sm:inline-flex"
            >
              Dashboard
            </Link>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-7 text-white shadow-xl">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-yellow-200">
                  <Sparkles size={30} />
                </div>

                <div>
                  <p className="text-sm font-black tracking-[0.25em] text-yellow-200">
                    MONTHLY JOURNEY
                  </p>
                  <h2 className="mt-1 text-3xl font-black">
                    Learning made structured and simple.
                  </h2>
                </div>
              </div>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-indigo-100">
                Each month contains Week 1 to Week 4 with subjects such as Warm
                Up, Math, Science, Reading and Membaca.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <HeroStat label="Months" value="6" />
                <HeroStat label="Weeks" value="24" />
                <HeroStat label="Subjects" value="5" />
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                    OVERALL PROGRESS
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

              <p className="mt-4 text-sm font-bold text-slate-500">
                Progress will increase as child completes weekly activities.
              </p>
            </div>
          </section>
                    <section className="mt-8">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                  MONTHS
                </p>
                <h2 className="mt-1 text-3xl font-black text-indigo-700">
                  Monthly Learning Path
                </h2>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {months.map((item) => (
                <Link
                  key={item.month}
                  href={item.unlocked ? `/learning-hub/month-${item.month}` : "#"}
                  className={`group rounded-[2rem] border border-indigo-100 bg-white p-5 shadow-sm transition ${
                    item.unlocked
                      ? "hover:-translate-y-1 hover:shadow-xl"
                      : "cursor-not-allowed opacity-60"
                  }`}
                >
                  <div
                    className={`rounded-[1.7rem] bg-gradient-to-br ${item.color} p-5`}
                  >
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

                    <span className="mt-6 inline-block rounded-full bg-white px-3 py-1 text-sm font-black text-indigo-700">
                      {item.badge}
                    </span>

                    <h3 className="mt-4 text-3xl font-black text-indigo-700">
                      {item.title}
                    </h3>

                    <p className="mt-1 font-black text-slate-700">
                      {item.theme}
                    </p>

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

                    <div className="mt-5 grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((week) => (
                        <div
                          key={week}
                          className="rounded-xl bg-white px-2 py-2 text-center text-xs font-black text-indigo-700"
                        >
                          W{week}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-2xl bg-indigo-600 px-4 py-3 font-black text-white transition group-hover:bg-indigo-700">
                      Open Month Content
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
                    How it works
                  </h2>

                  <p className="mt-2 leading-7 text-slate-600">
                    Choose a month, then choose Week 1, Week 2, Week 3 or Week
                    4. Each week contains schedules, worksheets and activity
                    links uploaded by FD Arcadia admin.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <InfoPill icon={<CalendarDays size={18} />} text="Choose Month" />
                    <InfoPill icon={<FileText size={18} />} text="Open Week" />
                    <InfoPill icon={<CheckCircle2 size={18} />} text="Complete Activity" />
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
                    Every week can include different subjects and activity
                    links.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {subjectPreview.map((subject) => (
                      <div
                        key={subject.title}
                        className="rounded-2xl bg-indigo-50 px-4 py-3 font-black text-indigo-700"
                      >
                        <span className="mr-2 text-xl">{subject.icon}</span>
                        {subject.title}
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