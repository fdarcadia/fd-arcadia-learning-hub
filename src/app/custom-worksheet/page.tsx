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
    <main className="min-h-screen bg-[#fbfaf7] text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[280px_1fr]">
        <WorksheetSidebar totalWorksheet={totalWorksheet} />

        <section className="px-4 py-6 lg:px-8">
          <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                FD ARCADIA CUSTOM WORKSHEET
              </p>

              <h1 className="mt-1 text-4xl font-black text-indigo-700 sm:text-5xl">
                My Worksheet Library
              </h1>

              <p className="mt-2 max-w-3xl text-slate-600">
                Download purchased worksheets assigned to your account and open
                subject folders prepared by FD Arcadia.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/worksheet"
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Palette size={18} />
                Open Draw & Learn
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-sm transition hover:bg-indigo-50"
              >
                Dashboard
              </Link>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-7 text-white shadow-xl">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-yellow-200">
                  <Sparkles size={30} />
                </div>

                <div>
                  <p className="text-sm font-black tracking-[0.25em] text-yellow-200">
                    WORKSHEET ACCESS
                  </p>
                  <h2 className="mt-1 text-3xl font-black">
                    Organised by subject.
                  </h2>
                </div>
              </div>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-indigo-100">
                Choose a subject folder to view worksheets assigned to your
                account. Use Draw & Learn for interactive worksheet practice.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <HeroStat label="Worksheets" value={loading ? "..." : String(totalWorksheet)} />
                <HeroStat label="Subjects" value={String(activeSubjects)} />
                <HeroStat label="Progress" value={`${overallProgress}%`} />
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                    OVERALL PROGRESS
                  </p>
                  <h2 className="mt-2 text-4xl font-black text-indigo-700">
                    {loading ? "..." : `${overallProgress}%`}
                  </h2>
                </div>

                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Trophy size={34} />
                </div>
              </div>

              <div className="mt-6 h-4 overflow-hidden rounded-full bg-indigo-50">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-500">
                {totalWorksheet > 0
                  ? `${totalWorksheet} worksheet assigned across ${activeSubjects} subject.`
                  : "No worksheet assigned yet. Please contact admin after payment."}
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <ChildProfileCard totalWorksheet={totalWorksheet} activeSubjects={activeSubjects} />
            <ContinueWorksheetCard topSubject={topSubject} loading={loading} />
          </section>

          <section className="mt-8">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                  SUBJECTS
                </p>
                <h2 className="mt-1 text-3xl font-black text-indigo-700">
                  Worksheet Folders
                </h2>
              </div>
            </div>

            {loading ? (
              <LoadingCard />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
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

          <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <RecentWorksheetCard worksheets={recentWorksheets} loading={loading} />
            <QuickAccessCard />
          </section>
        </section>
      </div>
    </main>
  );
}

function WorksheetSidebar({ totalWorksheet }: { totalWorksheet: number }) {
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
            WORKSHEET
          </p>
        </div>
      </Link>

      <nav className="mt-10 space-y-2">
        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const active = item.title === "Custom Worksheet";

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
      </nav>

      <div className="mt-10 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl">
        <Crown className="text-yellow-200" size={30} />
        <p className="mt-4 font-black">Worksheet Library</p>
        <h3 className="mt-1 text-xl font-black">{totalWorksheet} Files</h3>
        <p className="mt-2 text-sm text-indigo-100">
          Your assigned worksheet collection.
        </p>
        <Link
          href="/pricing"
          className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-black text-indigo-700"
        >
          View Package
        </Link>
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
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-sky-100 text-5xl">
          👧
        </div>

        <div>
          <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
            CHILD PROFILE
          </p>
          <h2 className="mt-1 text-3xl font-black text-indigo-700">
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
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
            CONTINUE WORKSHEET
          </p>
          <h2 className="mt-1 text-3xl font-black text-indigo-700">
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

      <div className="mt-5 h-4 overflow-hidden rounded-full bg-indigo-50">
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
      className="group rounded-[2rem] border border-indigo-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className={`rounded-[1.7rem] bg-gradient-to-br ${subject.gradient} p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-white ${subject.color} shadow-sm`}>
            <Icon size={32} />
          </div>

          {hasWorksheet ? (
            <CheckCircle2 className="text-emerald-600" size={26} />
          ) : (
            <LockKeyhole className="text-slate-400" size={26} />
          )}
        </div>

        <div className="mt-6 text-5xl">{subject.emoji}</div>

        <h3 className="mt-4 text-3xl font-black text-indigo-700">
          {subject.title}
        </h3>

        <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
          {subject.description}
        </p>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
            <span>{hasWorksheet ? `${count} worksheet` : "No worksheet"}</span>
            <span>{progress}%</span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-indigo-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-indigo-600 px-4 py-3 font-black text-white transition group-hover:bg-indigo-700">
          Open Folder
          <ChevronRight size={18} />
        </div>
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
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
            RECENT
          </p>
          <h2 className="mt-1 text-2xl font-black text-indigo-700">
            Recent Worksheets
          </h2>
        </div>
        <Clock3 className="text-indigo-600" size={30} />
      </div>

      {loading ? (
        <p className="font-bold text-slate-500">Loading recent worksheets...</p>
      ) : worksheets.length === 0 ? (
        <div className="rounded-2xl bg-indigo-50 p-6 text-center">
          <FileText className="mx-auto text-indigo-400" size={38} />
          <p className="mt-3 font-black text-indigo-700">No worksheet yet</p>
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
                className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-4 transition hover:bg-indigo-100"
              >
                <div>
                  <p className="font-black text-indigo-700">
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
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
          QUICK ACCESS
        </p>
        <h2 className="mt-1 text-2xl font-black text-indigo-700">
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
      className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-4 transition hover:bg-indigo-100"
    >
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-indigo-600">
          {icon}
        </div>
        <div>
          <p className="font-black text-indigo-700">{title}</p>
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
    <div className="rounded-2xl bg-indigo-50 p-4">
      <p className="text-xs font-black tracking-[0.16em] text-yellow-600">
        {label.toUpperCase()}
      </p>
      <p className="mt-1 font-black text-indigo-700">{value}</p>
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
