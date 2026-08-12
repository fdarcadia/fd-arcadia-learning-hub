"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Crown,
  Download,
  FileText,
  FlaskConical,
  Gift,
  Home,
  Languages,
  Loader2,
  LockKeyhole,
  Palette,
  PencilLine,
  Sparkles,
  Star,
  Trophy,
  UserRound,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type WorksheetItem = {
  id: string;
  subject: string;
  title?: string | null;
  file_name?: string | null;
  file_url?: string | null;
  external_link?: string | null;
  created_at?: string | null;
};

type SubjectCard = {
  value: string;
  title: string;
  href: string;
  icon: React.ElementType;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
};

const subjects: SubjectCard[] = [
  {
    value: "bahasa-melayu",
    title: "Bahasa Melayu",
    href: "/custom-worksheet/bahasa-melayu",
    icon: Languages,
    emoji: "🌸",
    color: "text-pink-700",
    gradient: "from-pink-100 to-rose-100",
    description: "Latihan bahasa, kosa kata, ayat dan pemahaman.",
  },
  {
    value: "english",
    title: "English",
    href: "/custom-worksheet/english",
    icon: BookOpen,
    emoji: "📘",
    color: "text-sky-700",
    gradient: "from-sky-100 to-blue-100",
    description: "Phonics, vocabulary, reading and writing practice.",
  },
  {
    value: "mathematics",
    title: "Mathematics",
    href: "/custom-worksheet/mathematics",
    icon: Calculator,
    emoji: "🔢",
    color: "text-yellow-700",
    gradient: "from-yellow-100 to-orange-100",
    description: "Number sense, addition, subtraction and problem solving.",
  },
  {
    value: "science",
    title: "Science",
    href: "/custom-worksheet/science",
    icon: FlaskConical,
    emoji: "🧪",
    color: "text-emerald-700",
    gradient: "from-emerald-100 to-lime-100",
    description: "Simple science, observation and discovery activities.",
  },
  {
    value: "membaca-3m",
    title: "Membaca 3M",
    href: "/custom-worksheet/membaca-3m",
    icon: PencilLine,
    emoji: "✏️",
    color: "text-purple-700",
    gradient: "from-purple-100 to-violet-100",
    description: "Suku kata, membaca, menulis and early literacy practice.",
  },
];

const sidebarLinks = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Custom Worksheet", href: "/custom-worksheet", icon: FileText },
  { title: "Draw & Learn", href: "/worksheet", icon: Palette },
  { title: "Freebies", href: "/freebies", icon: Gift },
];

export default function CustomWorksheetPage() {
  return (
    <ProtectedPage>
      {() => <CustomWorksheetContent />}
    </ProtectedPage>
  );
}

function CustomWorksheetContent() {
  const [worksheets, setWorksheets] = useState<WorksheetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorksheets();
  }, []);

  async function loadWorksheets() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setWorksheets([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("custom_worksheet_items")
      .select("*")
      .eq("parent_user_id", user.id)
      .order("created_at", { ascending: false });

    setWorksheets((data || []) as WorksheetItem[]);
    setLoading(false);
  }

  function countBySubject(subjectValue: string) {
    return worksheets.filter((item) => item.subject === subjectValue).length;
  }

  const totalWorksheet = worksheets.length;
  const activeSubjects = subjects.filter((subject) => countBySubject(subject.value) > 0).length;
  const overallProgress = totalWorksheet > 0 ? Math.min(100, Math.max(20, activeSubjects * 18)) : 0;

  const topSubject = useMemo(() => {
    const ranked = subjects
      .map((subject) => ({
        ...subject,
        count: countBySubject(subject.value),
      }))
      .sort((a, b) => b.count - a.count);

    return ranked[0];
  }, [worksheets]);

  const recentWorksheets = worksheets.slice(0, 4);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[250px_1fr]">
        <WorksheetSidebar totalWorksheet={totalWorksheet} />

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          {/* TOP BAR */}
          <header className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-indigo-500">
                FD Arcadia Learning Hub
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Custom Worksheet
              </h1>
              <p className="mt-1 text-sm font-semibold text-slate-400">
                Your personalised worksheet library.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/worksheet"
                className="hidden items-center gap-2 rounded-xl border border-indigo-100 bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
              >
                <Palette size={16} />
                Draw & Learn
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                Dashboard
                <ChevronRight size={15} />
              </Link>
            </div>
          </header>

          <div className="mx-auto mt-5 max-w-[1500px]">
            {/* PREMIUM HERO */}
            <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8 sm:py-8">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-slate-500/15 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-indigo-200">
                      <FileText size={22} />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-300">
                        Worksheet Library
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-400">
                        Assigned especially for your account
                      </p>
                    </div>
                  </div>

                  <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                    Learn by subject, at your own pace.
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                    Open a subject folder to view worksheets prepared by FD Arcadia.
                    Keep everything organised in one simple learning space.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 lg:min-w-[340px]">
                  <PremiumStat
                    label="Worksheets"
                    value={loading ? "..." : String(totalWorksheet)}
                  />
                  <PremiumStat label="Subjects" value={String(activeSubjects)} />
                  <PremiumStat label="Progress" value={`${overallProgress}%`} />
                </div>
              </div>
            </section>

            {/* SECTION TITLE */}
            <section className="mt-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-500">
                    Learning Library
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                    Choose a Subject
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-400">
                    Open a subject to view your assigned worksheets.
                  </p>
                </div>

                {!loading && (
                  <div className="inline-flex self-start items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm sm:self-auto">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    {activeSubjects} active subject{activeSubjects === 1 ? "" : "s"}
                  </div>
                )}
              </div>

              {loading ? (
                <LoadingCard />
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {subjects.map((subject) => (
                    <SubjectFolderCard
                      key={subject.value}
                      subject={subject}
                      count={countBySubject(subject.value)}
                      total={totalWorksheet}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* RECENT + TOOLS */}
            <section className="mt-7 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <RecentWorksheetCard
                worksheets={recentWorksheets}
                loading={loading}
              />
              <QuickAccessCard />
            </section>

            <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-slate-400">
                Need another worksheet? Contact FD Arcadia for additional worksheet access.
              </p>

              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 transition hover:text-slate-950"
              >
                View Packages
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function WorksheetSidebar({ totalWorksheet }: { totalWorksheet: number }) {
  return (
    <aside className="hidden border-r border-slate-200 bg-white px-5 py-6 xl:block">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-indigo-200 shadow-sm">
          <FileText size={21} />
        </div>

        <div>
          <p className="text-sm font-black tracking-[0.16em] text-slate-950">
            FD ARCADIA
          </p>
          <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
            Worksheet
          </p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1.5">
        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const active = item.title === "Custom Worksheet";

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-black transition ${
                active
                  ? "bg-slate-50 text-slate-950"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={18} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
          Your Library
        </p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-black text-slate-950">{totalWorksheet}</p>
            <p className="text-xs font-semibold text-slate-400">worksheet files</p>
          </div>
          <FileText size={24} className="text-indigo-500" />
        </div>
      </div>
    </aside>
  );
}

function ChildProfileCard({
  totalWorksheet,
  activeSubjects,
}: {
  totalWorksheet: number;
  activeSubjects: number;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-sky-100 text-5xl">
          👧
        </div>

        <div>
          <p className="text-sm font-black tracking-[0.2em] text-indigo-500">
            CHILD PROFILE
          </p>
          <h2 className="mt-1 text-3xl font-black text-slate-950">
            Worksheet Access
          </h2>
          <p className="mt-1 text-slate-500">Parent worksheet library</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <MiniInfo label="Worksheets" value={String(totalWorksheet)} />
        <MiniInfo label="Subjects" value={String(activeSubjects)} />
      </div>

      <Link
        href="/children"
        className="mt-5 flex items-center justify-between rounded-2xl bg-orange-500 px-5 py-4 font-black text-white transition hover:bg-orange-600"
      >
        <span>View Children</span>
        <ChevronRight size={20} />
      </Link>
    </section>
  );
}

function ContinueWorksheetCard({
  topSubject,
  loading,
}: {
  topSubject?: SubjectCard & { count: number };
  loading: boolean;
}) {
  const hasWorksheet = Boolean(topSubject && topSubject.count > 0);

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black tracking-[0.2em] text-indigo-500">
            CONTINUE WORKSHEET
          </p>
          <h2 className="mt-1 text-3xl font-black text-slate-950">
            {loading
              ? "Loading..."
              : hasWorksheet
                ? topSubject?.title
                : "No worksheet yet"}
          </h2>
          <p className="mt-2 text-slate-600">
            {hasWorksheet
              ? `${topSubject?.count} worksheet assigned in this subject.`
              : "Once admin assigns worksheets, your latest subject will appear here."}
          </p>
        </div>

        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-yellow-100 text-4xl">
          {hasWorksheet ? topSubject?.emoji : "📁"}
        </div>
      </div>

      <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-50">
        <div
          className="h-full rounded-full bg-indigo-600"
          style={{ width: hasWorksheet ? "65%" : "0%" }}
        />
      </div>

      <Link
        href={hasWorksheet ? topSubject?.href || "/custom-worksheet" : "/pricing"}
        className="mt-5 flex items-center justify-between rounded-2xl bg-indigo-600 px-5 py-4 font-black text-white transition hover:bg-indigo-700"
      >
        <span>{hasWorksheet ? "Open Subject Folder" : "View Package"}</span>
        <ChevronRight size={20} />
      </Link>
    </section>
  );
}

function SubjectFolderCard({
  subject,
  count,
  total,
}: {
  subject: SubjectCard;
  count: number;
  total: number;
}) {
  const Icon = subject.icon;
  const progress = total > 0 ? Math.round((count / total) * 100) : 0;
  const hasWorksheet = count > 0;

  return (
    <Link
      href={subject.href}
      className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${subject.gradient} ${subject.color}`}
        >
          <Icon size={23} />
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] ${
            hasWorksheet
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {hasWorksheet ? `${count} files` : "Locked"}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">
        {subject.title}
      </h3>

      <p className="mt-2 min-h-[44px] text-sm leading-5 text-slate-500">
        {subject.description}
      </p>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${
              hasWorksheet ? "bg-indigo-600" : "bg-slate-200"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-black text-indigo-600">
          {hasWorksheet ? "Open Folder" : "View Folder"}
        </span>
        <ChevronRight
          size={17}
          className="text-indigo-500 transition group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

function RecentWorksheetCard({
  worksheets,
  loading,
}: {
  worksheets: WorksheetItem[];
  loading: boolean;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-black tracking-[0.2em] text-indigo-500">
            RECENT
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">
            Recent Worksheets
          </h2>
        </div>
        <Clock3 className="text-indigo-600" size={30} />
      </div>

      {loading ? (
        <p className="font-bold text-slate-500">Loading recent worksheets...</p>
      ) : worksheets.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-6 text-center">
          <FileText className="mx-auto text-indigo-400" size={38} />
          <p className="mt-3 font-black text-slate-950">No worksheet yet</p>
          <p className="mt-1 text-sm text-slate-500">Waiting for admin assignment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {worksheets.map((item) => {
            const subject = subjects.find((entry) => entry.value === item.subject);

            return (
              <a
                key={item.id}
                href={item.external_link || item.file_url || "#"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
              >
                <div>
                  <p className="font-black text-slate-950">
                    {item.title || item.file_name || "Worksheet"}
                  </p>
                  <p className="text-sm font-bold text-slate-500">
                    {subject?.title || item.subject}
                  </p>
                </div>

                <Download className="text-indigo-600" size={22} />
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}

function QuickAccessCard() {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-black tracking-[0.2em] text-indigo-500">
          QUICK ACCESS
        </p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">
          Worksheet Tools
        </h2>
      </div>

      <div className="grid gap-3">
        <QuickLink
          href="/worksheet"
          icon={<Palette size={24} />}
          title="Draw & Learn Canvas"
          description="Open interactive drawing and worksheet canvas."
        />
        <QuickLink
          href="/freebies"
          icon={<Gift size={24} />}
          title="Freebies"
          description="Open free worksheet and printable resources."
        />
        <QuickLink
          href="/dashboard"
          icon={<BarChart3 size={24} />}
          title="Progress Dashboard"
          description="Return to child learning dashboard."
        />
      </div>
    </section>
  );
}

function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
    >
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-indigo-600">
          {icon}
        </div>
        <div>
          <p className="font-black text-slate-950">{title}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <ChevronRight className="text-indigo-600" size={20} />
    </Link>
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

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black tracking-[0.16em] text-indigo-500">
        {label.toUpperCase()}
      </p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}


function PremiumStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-4 text-center backdrop-blur">
      <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
      <Loader2 className="mx-auto animate-spin text-indigo-600" size={40} />
      <p className="mt-4 font-bold text-slate-500">Loading worksheet folders...</p>
    </div>
  );
}