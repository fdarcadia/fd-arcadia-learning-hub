"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Gift,
  Home,
  Loader2,
  LockKeyhole,
  Pencil,
  PlayCircle,
  RefreshCcw,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

type WeekItem = {
  id: string;
  month_no: number;
  week_no: number;
  day: string;
  subject: string;
  title: string;
  button_type: string | null;
  link_url: string | null;
  is_active: boolean | null;
};

type MonthSummary = {
  month: number;
  title: string;
  theme: string;
  subtitle: string;
  badge: string;
  color: string;
};

const months: MonthSummary[] = [
  {
    month: 1,
    title: "Month 1",
    theme: "Foundation",
    subtitle: "Foundation activities, assessment and weekly learning plan.",
    badge: "Start Here",
    color: "from-yellow-100 to-orange-100",
  },
  {
    month: 2,
    title: "Month 2",
    theme: "Practice",
    subtitle: "Continue with new themes, worksheets and activities.",
    badge: "Month 2",
    color: "from-sky-100 to-indigo-100",
  },
  {
    month: 3,
    title: "Month 3",
    theme: "Explore",
    subtitle: "Practice, games, reading and learning files.",
    badge: "Month 3",
    color: "from-emerald-100 to-lime-100",
  },
  {
    month: 4,
    title: "Month 4",
    theme: "Build",
    subtitle: "More Learning Hub schedules and activities.",
    badge: "Month 4",
    color: "from-pink-100 to-rose-100",
  },
  {
    month: 5,
    title: "Month 5",
    theme: "Revision",
    subtitle: "Revision, enrichment and weekly files.",
    badge: "Month 5",
    color: "from-purple-100 to-violet-100",
  },
  {
    month: 6,
    title: "Month 6",
    theme: "Premium",
    subtitle: "Premium learning content and progress activities.",
    badge: "Premium",
    color: "from-indigo-100 to-blue-100",
  },
];

const sidebarLinks = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Admin Home", href: "/admin", icon: Users },
  { title: "Learning Hub", href: "/admin/learning-hub", icon: BookOpenCheck },
  { title: "Parent Preview", href: "/learning-hub", icon: Gift },
];

export default function AdminLearningHubPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <AdminLearningHubContent email={user.email ?? ""} />
        ) : (
          <AccessDenied />
        )
      }
    </ProtectedPage>
  );
}

function AccessDenied() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-red-600">Access denied</h1>
        <p className="mt-2 text-slate-600">
          This page is only for FD Arcadia admin.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white"
        >
          Back Dashboard
        </Link>
      </div>
    </main>
  );
}

function AdminLearningHubContent({ email }: { email: string }) {
  const [items, setItems] = useState<WeekItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadItems() {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("learning_hub_week_items")
      .select("id, month_no, week_no, day, subject, title, button_type, link_url, is_active")
      .order("month_no", { ascending: true })
      .order("week_no", { ascending: true })
      .order("display_order", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setItems((data || []) as WeekItem[]);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  const stats = useMemo(() => {
    const active = items.filter((item) => item.is_active !== false);
    const links = items.filter((item) => item.link_url);
    const videos = items.filter((item) =>
      String(item.button_type || "").toLowerCase().includes("play")
    );

    return {
      total: items.length,
      active: active.length,
      links: links.length,
      videos: videos.length,
    };
  }, [items]);

  function monthItems(month: number) {
    return items.filter((item) => item.month_no === month);
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[280px_1fr]">
        <AdminSidebar email={email} />

        <section className="px-4 py-6 lg:px-8">
          <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <ArrowLeft size={20} />
                Back Dashboard
              </Link>

              <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                ADMIN CMS
              </p>

              <h1 className="mt-1 text-4xl font-black text-indigo-700 sm:text-5xl">
                Learning Hub Manager
              </h1>

              <p className="mt-2 max-w-3xl text-slate-600">
                Manage monthly Learning Hub content, choose Month 1 to Month 6,
                open Week 1 to Week 4, and edit Week At A Glance activities.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/learning-hub"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white shadow-sm transition hover:bg-indigo-700"
              >
                <ExternalLink size={18} />
                Preview Parent Hub
              </Link>

              <button
                type="button"
                onClick={loadItems}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-sm transition hover:bg-indigo-50"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>
          </header>

          {error ? (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 font-bold text-red-700">
              {error}
            </div>
          ) : null}

          <section className="grid gap-4 md:grid-cols-4">
            <StatCard label="Total Items" value={String(stats.total)} />
            <StatCard label="Active Items" value={String(stats.active)} />
            <StatCard label="With Link" value={String(stats.links)} />
            <StatCard label="Video / Play" value={String(stats.videos)} />
          </section>

          <section className="mt-6 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-7 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-yellow-200">
                <Sparkles size={30} />
              </div>

              <div>
                <p className="text-sm font-black tracking-[0.25em] text-yellow-200">
                  FD ARCADIA LEARNING HUB
                </p>
                <h2 className="mt-1 text-3xl font-black">
                  Choose month to manage weekly content.
                </h2>
              </div>
            </div>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-indigo-100">
              Each month contains Week 1 to Week 4. Inside each week, you can add
              day, subject, title, time, thumbnail, button type and Google Drive
              or YouTube link.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <HeroStat label="Months" value="6" />
              <HeroStat label="Weeks" value="24" />
              <HeroStat label="Editable Boxes" value={String(stats.total)} />
            </div>
          </section>

          {loading ? (
            <LoadingState />
          ) : (
            <section className="mt-8">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                    MONTHS
                  </p>
                  <h2 className="mt-1 text-3xl font-black text-indigo-700">
                    Monthly Content Dashboard
                  </h2>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {months.map((month) => {
                  const data = monthItems(month.month);
                  const activeCount = data.filter(
                    (item) => item.is_active !== false
                  ).length;
                  const linkCount = data.filter((item) => item.link_url).length;
                  const videoCount = data.filter((item) =>
                    String(item.button_type || "").toLowerCase().includes("play")
                  ).length;
                  const progress = data.length
                    ? Math.round((linkCount / data.length) * 100)
                    : 0;

                  return (
                    <MonthAdminCard
                      key={month.month}
                      month={month}
                      total={data.length}
                      active={activeCount}
                      links={linkCount}
                      videos={videoCount}
                      progress={progress}
                    />
                  );
                })}
              </div>
            </section>
          )}

          <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-purple-100 text-purple-700">
                  <Pencil size={28} />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-indigo-700">
                    Admin flow
                  </h2>

                  <p className="mt-2 leading-7 text-slate-600">
                    Click Manage Month, choose Week 1 to Week 4, then open the
                    Week At A Glance editor to add or update each activity box.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <InfoPill icon={<CalendarDays size={18} />} text="Choose Month" />
                    <InfoPill icon={<FileText size={18} />} text="Choose Week" />
                    <InfoPill icon={<CheckCircle2 size={18} />} text="Edit Boxes" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-yellow-100 text-yellow-700">
                  <Trophy size={28} />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-black text-indigo-700">
                    Quick actions
                  </h2>

                  <div className="mt-5 grid gap-3">
                    <Link
                      href="/admin/learning-hub/month-1"
                      className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3 font-black text-indigo-700"
                    >
                      Manage Month 1
                      <ChevronRight size={18} />
                    </Link>

                    <Link
                      href="/admin/learning-hub?month=1&week=1"
                      className="flex items-center justify-between rounded-2xl bg-yellow-50 px-4 py-3 font-black text-yellow-800"
                    >
                      Edit Month 1 Week 1
                      <ChevronRight size={18} />
                    </Link>

                    <Link
                      href="/learning-hub/month-1/week-1"
                      target="_blank"
                      className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 font-black text-emerald-700"
                    >
                      Preview Parent Week 1
                      <ExternalLink size={18} />
                    </Link>
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

function AdminSidebar({ email }: { email: string }) {
  return (
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
            ADMIN CMS
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

        {months.map((month) => (
          <Link
            key={month.month}
            href={`/admin/learning-hub/month-${month.month}`}
            className="flex items-center justify-between rounded-2xl px-4 py-3 font-black text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
          >
            <span>{month.title}</span>
            <ChevronRight size={16} className="text-slate-300" />
          </Link>
        ))}
      </nav>

      <div className="mt-10 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl">
        <Pencil className="text-yellow-200" size={30} />
        <p className="mt-4 font-black">Admin Mode</p>
        <h3 className="mt-1 text-xl font-black">Learning Hub</h3>
        <p className="mt-2 break-words text-sm text-indigo-100">{email}</p>
      </div>
    </aside>
  );
}

function MonthAdminCard({
  month,
  total,
  active,
  links,
  videos,
  progress,
}: {
  month: MonthSummary;
  total: number;
  active: number;
  links: number;
  videos: number;
  progress: number;
}) {
  return (
    <article className="rounded-[2rem] border border-indigo-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className={`rounded-[1.7rem] bg-gradient-to-br ${month.color} p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-indigo-700 shadow-sm">
            <CalendarDays size={32} />
          </div>

          {total > 0 ? (
            <CheckCircle2 className="text-emerald-600" size={26} />
          ) : (
            <Clock3 className="text-yellow-600" size={26} />
          )}
        </div>

        <span className="mt-6 inline-block rounded-full bg-white px-3 py-1 text-sm font-black text-indigo-700">
          {month.badge}
        </span>

        <h3 className="mt-4 text-3xl font-black text-indigo-700">
          {month.title}
        </h3>

        <p className="mt-1 font-black text-slate-700">{month.theme}</p>

        <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
          {month.subtitle}
        </p>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
            <span>Link Ready</span>
            <span>{progress}%</span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-indigo-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <MiniStat label="Items" value={String(total)} />
          <MiniStat label="Active" value={String(active)} />
          <MiniStat label="Links" value={String(links)} />
          <MiniStat label="Videos" value={String(videos)} />
        </div>

        <div className="mt-5 grid gap-3">
          <Link
            href={`/admin/learning-hub/month-${month.month}`}
            className="flex items-center justify-between rounded-2xl bg-indigo-600 px-4 py-3 font-black text-white transition hover:bg-indigo-700"
          >
            Manage Month
            <ChevronRight size={18} />
          </Link>

          <Link
            href={`/learning-hub/month-${month.month}`}
            target="_blank"
            className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 font-black text-indigo-700 transition hover:bg-indigo-50"
          >
            Preview Parent Month
            <ExternalLink size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-indigo-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-black tracking-[0.18em] text-yellow-600">
        {label.toUpperCase()}
      </p>

      <p className="mt-2 text-3xl font-black text-indigo-700">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-3 text-center">
      <p className="text-xl font-black text-indigo-700">{value}</p>
      <p className="text-xs font-bold text-slate-500">{label}</p>
    </div>
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

function LoadingState() {
  return (
    <div className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-sm">
      <Loader2 className="mx-auto animate-spin text-indigo-600" size={36} />
      <p className="mt-4 font-bold text-slate-500">Loading Learning Hub...</p>
    </div>
  );
}
