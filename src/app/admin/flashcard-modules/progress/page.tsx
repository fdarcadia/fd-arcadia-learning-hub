"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/client";

type ModuleRow = {
  id: string;
  title: string;
  total_pages: number | null;
  display_order: number | null;
  is_active: boolean;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  user_type: string | null;
};

type ProgressRow = {
  user_id: string;
  module_id: string;
  last_page: number | null;
  highest_page: number | null;
  progress_percent: number | null;
  last_opened_at: string | null;
  completed_at: string | null;
};

type StatusFilter = "all" | "not-started" | "in-progress" | "completed";
type SortMode = "latest" | "progress-high" | "progress-low" | "parent";

type DisplayRow = {
  key: string;
  userId: string;
  parentName: string;
  email: string;
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  totalPages: number;
  lastPage: number;
  highestPage: number;
  progressPercent: number;
  lastOpenedAt: string | null;
  completedAt: string | null;
  status: Exclude<StatusFilter, "all">;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatDateTime(value: string | null) {
  if (!value) return "Never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatus(progress: number, completedAt: string | null): DisplayRow["status"] {
  if (completedAt || progress >= 100) return "completed";
  if (progress > 0) return "in-progress";
  return "not-started";
}

export default function AdminFlashcardProgressPage() {
  const supabase = useMemo(() => createClient(), []);

  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("latest");

  const loadData = useCallback(
    async (silent = false) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        const [moduleResult, profileResult, progressResult] = await Promise.all([
          supabase
            .from("flashcard_modules")
            .select("id,title,total_pages,display_order,is_active")
            .order("display_order", { ascending: true }),

          supabase
            .from("profiles")
            .select("id,full_name,email,user_type")
            .eq("user_type", "parent")
            .order("full_name", { ascending: true }),

          supabase
            .from("flashcard_module_progress")
            .select(
              "user_id,module_id,last_page,highest_page,progress_percent,last_opened_at,completed_at",
            ),
        ]);

        if (moduleResult.error) throw moduleResult.error;
        if (profileResult.error) throw profileResult.error;
        if (progressResult.error) throw progressResult.error;

        setModules((moduleResult.data ?? []) as ModuleRow[]);
        setProfiles((profileResult.data ?? []) as ProfileRow[]);
        setProgressRows((progressResult.data ?? []) as ProgressRow[]);
      } catch (error) {
        console.error("Admin reading progress load error:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load reading progress.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [supabase],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const allRows = useMemo<DisplayRow[]>(() => {
    const progressMap = new Map(
      progressRows.map((row) => [`${row.user_id}:${row.module_id}`, row]),
    );

    return profiles.flatMap((profile) =>
      modules.map((module) => {
        const progress = progressMap.get(`${profile.id}:${module.id}`);
        const totalPages = Math.max(0, Number(module.total_pages ?? 0));
        const lastPage = clamp(Number(progress?.last_page ?? 0), 0, totalPages || 999999);
        const highestPage = clamp(
          Number(progress?.highest_page ?? lastPage),
          0,
          totalPages || 999999,
        );

        const calculatedPercent =
          totalPages > 0 ? Math.round((highestPage / totalPages) * 100) : 0;

        const progressPercent = clamp(
          Number.isFinite(Number(progress?.progress_percent))
            ? Number(progress?.progress_percent ?? 0)
            : calculatedPercent,
          0,
          100,
        );

        return {
          key: `${profile.id}:${module.id}`,
          userId: profile.id,
          parentName: profile.full_name?.trim() || "Unnamed Parent",
          email: profile.email?.trim() || "No email",
          moduleId: module.id,
          moduleTitle: module.title,
          moduleOrder: Number(module.display_order ?? 999),
          totalPages,
          lastPage,
          highestPage,
          progressPercent,
          lastOpenedAt: progress?.last_opened_at ?? null,
          completedAt: progress?.completed_at ?? null,
          status: getStatus(progressPercent, progress?.completed_at ?? null),
        };
      }),
    );
  }, [modules, profiles, progressRows]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const rows = allRows.filter((row) => {
      const matchesSearch =
        !keyword ||
        row.parentName.toLowerCase().includes(keyword) ||
        row.email.toLowerCase().includes(keyword) ||
        row.moduleTitle.toLowerCase().includes(keyword);

      const matchesModule =
        moduleFilter === "all" || row.moduleId === moduleFilter;

      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;

      return matchesSearch && matchesModule && matchesStatus;
    });

    return [...rows].sort((a, b) => {
      if (sortMode === "progress-high") {
        return b.progressPercent - a.progressPercent;
      }

      if (sortMode === "progress-low") {
        return a.progressPercent - b.progressPercent;
      }

      if (sortMode === "parent") {
        return (
          a.parentName.localeCompare(b.parentName) ||
          a.moduleOrder - b.moduleOrder
        );
      }

      const aTime = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0;
      const bTime = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0;

      return bTime - aTime || a.parentName.localeCompare(b.parentName);
    });
  }, [allRows, moduleFilter, search, sortMode, statusFilter]);

  const stats = useMemo(() => {
    const started = allRows.filter((row) => row.progressPercent > 0);
    const completed = allRows.filter((row) => row.status === "completed");
    const inProgress = allRows.filter((row) => row.status === "in-progress");
    const activeReaders = new Set(started.map((row) => row.userId)).size;

    const average =
      started.length > 0
        ? Math.round(
            started.reduce((sum, row) => sum + row.progressPercent, 0) /
              started.length,
          )
        : 0;

    return {
      activeReaders,
      completed: completed.length,
      inProgress: inProgress.length,
      average,
    };
  }, [allRows]);

  function clearFilters() {
    setSearch("");
    setModuleFilter("all");
    setStatusFilter("all");
    setSortMode("latest");
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/flashcard-modules"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
            >
              <ArrowLeft size={18} />
              Flashcard Modules
            </Link>

            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 md:flex">
              <ShieldCheck size={15} />
              Admin Analytics
            </div>

            <button
              type="button"
              onClick={() => void loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-8 lg:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-6 py-8 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)] lg:px-10 lg:py-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-indigo-200">
                  <BarChart3 size={25} />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-300">
                    FD Arcadia Learning Hub
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Parent Reading Analytics
                  </p>
                </div>
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight lg:text-5xl">
                Reading Progress
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                Monitor parent reading activity, completion and the last page
                reached for every Modul Membaca.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-4 backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Tracking
              </p>
              <p className="mt-1 text-lg font-black">
                {profiles.length} Parent{profiles.length === 1 ? "" : "s"} ·{" "}
                {modules.length} Module{modules.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="mt-7 flex min-h-[320px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-indigo-600" size={30} />
              <p className="mt-3 text-sm font-bold text-slate-500">
                Loading reading progress...
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="mt-7 rounded-[2rem] border border-red-200 bg-red-50 p-6">
            <p className="font-black text-red-700">Unable to load progress</p>
            <p className="mt-2 text-sm leading-6 text-red-600">{errorMessage}</p>
            <button
              type="button"
              onClick={() => void loadData()}
              className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Users}
                label="Active Readers"
                value={String(stats.activeReaders)}
                text={`of ${profiles.length} parents`}
                tone="indigo"
              />
              <StatCard
                icon={TrendingUp}
                label="In Progress"
                value={String(stats.inProgress)}
                text="module sessions"
                tone="amber"
              />
              <StatCard
                icon={CheckCircle2}
                label="Completed"
                value={String(stats.completed)}
                text="module completions"
                tone="emerald"
              />
              <StatCard
                icon={BarChart3}
                label="Average Progress"
                value={`${stats.average}%`}
                text="among started modules"
                tone="violet"
              />
            </section>

            <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
                    Progress Records
                  </p>
                  <h2 className="mt-2 text-2xl font-black">Parent Activity</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Search, filter and sort all reading records.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
                <label className="relative block">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search parent or email..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-indigo-400 focus:bg-white"
                  />
                </label>

                <select
                  value={moduleFilter}
                  onChange={(event) => setModuleFilter(event.target.value)}
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400"
                >
                  <option value="all">All Modules</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400"
                >
                  <option value="all">All Status</option>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400"
                >
                  <option value="latest">Latest Activity</option>
                  <option value="progress-high">Progress: High to Low</option>
                  <option value="progress-low">Progress: Low to High</option>
                  <option value="parent">Parent Name</option>
                </select>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold text-slate-500">
                  Showing{" "}
                  <span className="font-black text-slate-900">
                    {filteredRows.length}
                  </span>{" "}
                  of {allRows.length} records
                </p>

                <div className="flex flex-wrap gap-2 text-[10px] font-black">
                  <StatusPill status="not-started" />
                  <StatusPill status="in-progress" />
                  <StatusPill status="completed" />
                </div>
              </div>

              {filteredRows.length === 0 ? (
                <div className="mt-5 rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                  <BookOpenCheck className="mx-auto text-slate-300" size={34} />
                  <p className="mt-4 font-black text-slate-700">
                    No matching progress records
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Try changing the search or filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-5 hidden overflow-hidden rounded-[1.6rem] border border-slate-200 xl:block">
                    <div className="grid grid-cols-[1.25fr_1fr_1.4fr_0.7fr_1fr_46px] gap-4 border-b border-slate-200 bg-slate-100 px-5 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                      <span>Parent</span>
                      <span>Module</span>
                      <span>Progress</span>
                      <span>Last Page</span>
                      <span>Last Opened</span>
                      <span />
                    </div>

                    <div className="divide-y divide-slate-100">
                      {filteredRows.map((row) => (
                        <DesktopProgressRow key={row.key} row={row} />
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 xl:hidden">
                    {filteredRows.map((row) => (
                      <MobileProgressCard key={row.key} row={row} />
                    ))}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  text,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  text: string;
  tone: "indigo" | "amber" | "emerald" | "violet";
}) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-slate-400">{text}</p>
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: DisplayRow["status"];
}) {
  const config = {
    "not-started": {
      label: "Not Started",
      className: "bg-slate-100 text-slate-600",
    },
    "in-progress": {
      label: "In Progress",
      className: "bg-amber-100 text-amber-700",
    },
    completed: {
      label: "Completed",
      className: "bg-emerald-100 text-emerald-700",
    },
  }[status];

  return (
    <span className={`rounded-full px-3 py-1.5 ${config.className}`}>
      {config.label}
    </span>
  );
}

function DesktopProgressRow({ row }: { row: DisplayRow }) {
  return (
    <div className="grid grid-cols-[1.25fr_1fr_1.4fr_0.7fr_1fr_46px] items-center gap-4 bg-white px-5 py-4 transition hover:bg-indigo-50/30">
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-slate-900">
          {row.parentName}
        </p>
        <p className="mt-1 truncate text-xs text-slate-400">{row.email}</p>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-black text-slate-800">
          {row.moduleTitle}
        </p>
        <div className="mt-1">
          <StatusPill status={row.status} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black text-slate-700">
            {row.progressPercent}%
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            Highest {row.highestPage}
          </span>
        </div>

        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${
              row.status === "completed"
                ? "bg-emerald-500"
                : row.status === "in-progress"
                  ? "bg-indigo-600"
                  : "bg-slate-300"
            }`}
            style={{ width: `${row.progressPercent}%` }}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-black text-slate-800">
          {row.lastPage || 0}
          <span className="font-semibold text-slate-400">
            {" "}
            / {row.totalPages}
          </span>
        </p>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Clock3 size={14} className="shrink-0 text-slate-400" />
          <span className="truncate">{formatDateTime(row.lastOpenedAt)}</span>
        </div>
      </div>

      <Link
        href={`/admin/flashcard-modules/progress/${row.userId}`}
        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        title="View parent progress"
      >
        <ChevronRight size={17} />
      </Link>
    </div>
  );
}

function MobileProgressCard({ row }: { row: DisplayRow }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-black text-slate-900">{row.parentName}</p>
          <p className="mt-1 truncate text-xs text-slate-400">{row.email}</p>
        </div>
        <StatusPill status={row.status} />
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-wider text-indigo-500">
          {row.moduleTitle}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-black text-slate-950">
              {row.progressPercent}%
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Page {row.lastPage || 0} / {row.totalPages}
            </p>
          </div>

          <p className="text-right text-[10px] font-bold leading-5 text-slate-400">
            Highest page
            <br />
            <span className="text-sm font-black text-slate-700">
              {row.highestPage}
            </span>
          </p>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
          <div
            className={`h-full rounded-full ${
              row.status === "completed"
                ? "bg-emerald-500"
                : row.status === "in-progress"
                  ? "bg-indigo-600"
                  : "bg-slate-300"
            }`}
            style={{ width: `${row.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-slate-500">
          <Clock3 size={14} className="shrink-0" />
          <span className="truncate">{formatDateTime(row.lastOpenedAt)}</span>
        </div>

        <Link
          href={`/admin/flashcard-modules/progress/${row.userId}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white"
        >
          View Parent
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}