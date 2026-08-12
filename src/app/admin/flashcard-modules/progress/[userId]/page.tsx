"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/client";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  user_type: string | null;
};

type ModuleRow = {
  id: string;
  title: string;
  description: string | null;
  total_pages: number | null;
  display_order: number | null;
  is_active: boolean;
};

type ProgressRow = {
  module_id: string;
  last_page: number | null;
  highest_page: number | null;
  progress_percent: number | null;
  last_opened_at: string | null;
  completed_at: string | null;
};

type ModuleProgressView = {
  module: ModuleRow;
  lastPage: number;
  highestPage: number;
  progressPercent: number;
  lastOpenedAt: string | null;
  completedAt: string | null;
  status: "not-started" | "in-progress" | "completed";
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatDateTime(value: string | null) {
  if (!value) return "Never";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatus(
  progressPercent: number,
  completedAt: string | null,
): ModuleProgressView["status"] {
  if (completedAt || progressPercent >= 100) {
    return "completed";
  }

  if (progressPercent > 0) {
    return "in-progress";
  }

  return "not-started";
}

export default function AdminParentReadingProgressPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetTarget, setResetTarget] = useState<ModuleProgressView | null>(null);
  const [resetAllOpen, setResetAllOpen] = useState(false);
  const [resettingProgress, setResettingProgress] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const loadData = useCallback(
    async (silent = false) => {
      if (!userId) return;

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        const [profileResult, moduleResult, progressResult] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("id,full_name,email,user_type")
              .eq("id", userId)
              .single(),

            supabase
              .from("flashcard_modules")
              .select(
                "id,title,description,total_pages,display_order,is_active",
              )
              .order("display_order", { ascending: true }),

            supabase
              .from("flashcard_module_progress")
              .select(
                "module_id,last_page,highest_page,progress_percent,last_opened_at,completed_at",
              )
              .eq("user_id", userId),
          ]);

        if (profileResult.error) throw profileResult.error;
        if (moduleResult.error) throw moduleResult.error;
        if (progressResult.error) throw progressResult.error;

        setProfile(profileResult.data as ProfileRow);
        setModules((moduleResult.data ?? []) as ModuleRow[]);
        setProgressRows((progressResult.data ?? []) as ProgressRow[]);
      } catch (error) {
        console.error("Load parent reading progress error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load parent progress.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [supabase, userId],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const moduleProgress = useMemo<ModuleProgressView[]>(() => {
    const progressMap = new Map(
      progressRows.map((row) => [row.module_id, row]),
    );

    return modules.map((module) => {
      const progress = progressMap.get(module.id);
      const totalPages = Math.max(0, Number(module.total_pages ?? 0));

      const lastPage = clamp(
        Number(progress?.last_page ?? 0),
        0,
        totalPages || 999999,
      );

      const highestPage = clamp(
        Number(progress?.highest_page ?? lastPage),
        0,
        totalPages || 999999,
      );

      const calculatedPercent =
        totalPages > 0
          ? Math.round((highestPage / totalPages) * 100)
          : 0;

      const progressPercent = clamp(
        Number.isFinite(Number(progress?.progress_percent))
          ? Number(progress?.progress_percent ?? 0)
          : calculatedPercent,
        0,
        100,
      );

      const completedAt =
        progress?.completed_at ?? null;

      return {
        module,
        lastPage,
        highestPage,
        progressPercent,
        lastOpenedAt:
          progress?.last_opened_at ?? null,
        completedAt,
        status: getStatus(
          progressPercent,
          completedAt,
        ),
      };
    });
  }, [modules, progressRows]);

  const summary = useMemo(() => {
    const started = moduleProgress.filter(
      (item) => item.progressPercent > 0,
    );

    const completed = moduleProgress.filter(
      (item) => item.status === "completed",
    );

    const average =
      started.length > 0
        ? Math.round(
            started.reduce(
              (sum, item) =>
                sum + item.progressPercent,
              0,
            ) / started.length,
          )
        : 0;

    const latestTimestamp =
      moduleProgress.reduce(
        (latest, item) => {
          if (!item.lastOpenedAt) return latest;

          const time = new Date(
            item.lastOpenedAt,
          ).getTime();

          return Math.max(
            latest,
            Number.isFinite(time)
              ? time
              : 0,
          );
        },
        0,
      );

    return {
      started: started.length,
      completed: completed.length,
      average,
      latestOpened:
        latestTimestamp > 0
          ? new Date(
              latestTimestamp,
            ).toISOString()
          : null,
    };
  }, [moduleProgress]);

  async function resetAllReadingProgress() {
    if (!profile || resettingProgress) return;

    try {
      setResettingProgress(true);
      setResetMessage("");

      const { error } = await supabase
        .from("flashcard_module_progress")
        .delete()
        .eq("user_id", profile.id);

      if (error) throw error;

      setProgressRows([]);
      setResetAllOpen(false);

      setResetMessage(
        `All reading progress has been reset for ${
          profile.full_name || "this parent"
        }. Notes and annotations were not deleted.`,
      );
    } catch (error) {
      console.error("Reset all reading progress error:", error);

      setResetMessage(
        error instanceof Error
          ? `Unable to reset all progress: ${error.message}`
          : "Unable to reset all progress. Please try again.",
      );
    } finally {
      setResettingProgress(false);
    }
  }

  async function resetModuleProgress() {
    if (!resetTarget || !profile || resettingProgress) return;

    try {
      setResettingProgress(true);
      setResetMessage("");

      const { error } = await supabase
        .from("flashcard_module_progress")
        .delete()
        .eq("user_id", profile.id)
        .eq("module_id", resetTarget.module.id);

      if (error) throw error;

      setProgressRows((current) =>
        current.filter(
          (row) => row.module_id !== resetTarget.module.id,
        ),
      );

      setResetMessage(
        `${resetTarget.module.title} reading progress has been reset for ${
          profile.full_name || "this parent"
        }. Notes and annotations were not deleted.`,
      );

      setResetTarget(null);
    } catch (error) {
      console.error("Reset module progress error:", error);

      setResetMessage(
        error instanceof Error
          ? `Unable to reset progress: ${error.message}`
          : "Unable to reset progress. Please try again.",
      );
    } finally {
      setResettingProgress(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F5F7FB] px-4">
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-4 text-sm font-black text-slate-700">
            Loading parent progress...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !profile) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F5F7FB] px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-red-200 bg-white p-7 text-center shadow-xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-xl font-black text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-950">
            Parent progress unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {errorMessage ||
              "Unable to find this parent."}
          </p>

          <Link
            href="/admin/flashcard-modules/progress"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            Back to Reading Progress
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/flashcard-modules/progress"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
            >
              <ArrowLeft size={18} />
              Reading Progress
            </Link>

            <Link
              href="/admin/flashcard-modules"
              className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
            >
              Flashcard Modules
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 md:flex">
              <ShieldCheck size={15} />
              Admin View
            </div>

            <button
              type="button"
              onClick={() => {
                setResetMessage("");
                setResetAllOpen(true);
              }}
              disabled={summary.started === 0 || resettingProgress}
              className="hidden items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-300 sm:inline-flex"
            >
              <Trash2 size={16} />
              Reset All Progress
            </button>

            <button
              type="button"
              onClick={() =>
                void loadData(true)
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
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
                    Parent Reading Profile
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    FD Arcadia Learning Hub
                  </p>
                </div>
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight lg:text-5xl">
                {profile.full_name ||
                  "Unnamed Parent"}
              </h1>

              <p className="mt-3 text-sm text-slate-300">
                {profile.email ||
                  "No email available"}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
                  {summary.started} Module
                  {summary.started === 1
                    ? ""
                    : "s"}{" "}
                  Started
                </span>

                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
                  {summary.completed} Completed
                </span>

                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
                  {summary.average}% Average
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-4 backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Last Reading Activity
              </p>

              <div className="mt-2 flex items-center gap-2 text-sm font-black text-white">
                <Clock3 size={16} />

                {formatDateTime(
                  summary.latestOpened,
                )}
              </div>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={() => {
            setResetMessage("");
            setResetAllOpen(true);
          }}
          disabled={summary.started === 0 || resettingProgress}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-300 sm:hidden"
        >
          <Trash2 size={16} />
          Reset All Reading Progress
        </button>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={BookOpenCheck}
            label="Modules Started"
            value={`${summary.started}/${modules.length}`}
            text="reading modules"
            tone="indigo"
          />

          <SummaryCard
            icon={CheckCircle2}
            label="Completed"
            value={String(
              summary.completed,
            )}
            text="finished modules"
            tone="emerald"
          />

          <SummaryCard
            icon={TrendingUp}
            label="Average Progress"
            value={`${summary.average}%`}
            text="among started modules"
            tone="violet"
          />

          <SummaryCard
            icon={Clock3}
            label="Last Active"
            value={
              summary.latestOpened
                ? "Active"
                : "—"
            }
            text={formatDateTime(
              summary.latestOpened,
            )}
            tone="amber"
          />
        </section>

        <section className="mt-7">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
              Module Breakdown
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Reading Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Detailed progress for each Modul Membaca.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {moduleProgress.map(
              (item, index) => (
                <ModuleProgressCard
                  key={item.module.id}
                  item={item}
                  index={index}
                  onReset={() => {
                    setResetMessage("");
                    setResetTarget(item);
                  }}
                />
              ),
            )}
          </div>
        </section>
      </div>

      {resetAllOpen && (
        <div className="fixed inset-0 z-[210] grid place-items-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.4)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600">
                  <Trash2 size={21} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
                    Important Admin Action
                  </p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">
                    Reset all reading progress?
                  </h3>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm leading-6 text-slate-600">
                This will reset every Modul Membaca for{" "}
                <span className="font-black text-slate-900">
                  {profile.full_name || "this parent"}
                </span>{" "}
                back to <span className="font-black">Not Started</span>.
              </p>

              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-700">
                Reading percentage, last page, highest page and completion status
                for all modules will be removed.
              </div>

              <div className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-bold leading-5 text-emerald-700">
                Notes and annotations are safe and will not be deleted.
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setResetAllOpen(false)}
                  disabled={resettingProgress}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void resetAllReadingProgress()}
                  disabled={resettingProgress}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {resettingProgress ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {resettingProgress ? "Resetting..." : "Reset All"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {resetTarget && (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600">
                  <Trash2 size={21} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
                    Admin Action
                  </p>

                  <h3 className="mt-1 text-xl font-black text-slate-950">
                    Reset reading progress?
                  </h3>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm leading-6 text-slate-600">
                Reset <span className="font-black text-slate-900">{resetTarget.module.title}</span>{" "}
                for <span className="font-black text-slate-900">{profile.full_name || "this parent"}</span>.
                The module will return to <span className="font-black">Not Started</span>.
              </p>

              <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-bold leading-5 text-emerald-700">
                Parent notes and annotations will stay saved. Only reading progress,
                last page and completion status will be reset.
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  disabled={resettingProgress}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void resetModuleProgress()}
                  disabled={resettingProgress}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {resettingProgress ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}

                  {resettingProgress ? "Resetting..." : "Reset Progress"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {resetMessage && (
        <div className="fixed bottom-5 left-1/2 z-[190] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950 px-5 py-3 text-center text-xs font-bold leading-5 text-white shadow-2xl">
          {resetMessage}
        </div>
      )}
    </main>
  );
}

function SummaryCard({
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
  tone:
    | "indigo"
    | "emerald"
    | "violet"
    | "amber";
}) {
  const tones = {
    indigo:
      "bg-indigo-50 text-indigo-700",
    emerald:
      "bg-emerald-50 text-emerald-700",
    violet:
      "bg-violet-50 text-violet-700",
    amber:
      "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`grid h-11 w-11 place-items-center rounded-2xl ${tones[tone]}`}
      >
        <Icon size={20} />
      </div>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-400">
        {text}
      </p>
    </div>
  );
}

function ModuleProgressCard({
  item,
  index,
  onReset,
}: {
  item: ModuleProgressView;
  index: number;
  onReset: () => void;
}) {
  const gradients = [
    "from-slate-950 via-slate-900 to-slate-700",
    "from-cyan-950 via-cyan-900 to-cyan-700",
    "from-violet-950 via-violet-900 to-violet-700",
  ];

  const gradient =
    gradients[index % gradients.length];

  const statusConfig = {
    "not-started": {
      label: "Not Started",
      badge:
        "bg-slate-100 text-slate-600",
      bar: "bg-slate-300",
    },

    "in-progress": {
      label: "In Progress",
      badge:
        "bg-amber-100 text-amber-700",
      bar: "bg-indigo-600",
    },

    completed: {
      label: "Completed",
      badge:
        "bg-emerald-100 text-emerald-700",
      bar: "bg-emerald-500",
    },
  }[item.status];

  return (
    <article className="overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)]">
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${gradient} px-6 py-6 text-white`}
      >
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/[0.06]" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
              Book {item.module.display_order ?? index + 1}
            </p>

            <h3 className="mt-2 text-xl font-black">
              {item.module.title}
            </h3>
          </div>

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10">
            <BookOpenCheck size={21} />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${statusConfig.badge}`}
            >
              {statusConfig.label}
            </span>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              {item.module.description ||
                "Interactive reading module."}
            </p>
          </div>

          <p className="text-3xl font-black text-slate-950">
            {item.progressPercent}%
          </p>
        </div>

        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${statusConfig.bar}`}
            style={{
              width: `${item.progressPercent}%`,
            }}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <ProgressInfo
            label="Last Page"
            value={`${item.lastPage} / ${item.module.total_pages ?? 0}`}
          />

          <ProgressInfo
            label="Highest Page"
            value={String(
              item.highestPage,
            )}
          />
        </div>

        <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Last Opened
          </p>

          <p className="mt-1 text-xs font-bold text-slate-700">
            {formatDateTime(
              item.lastOpenedAt,
            )}
          </p>
        </div>

        {item.completedAt && (
          <div className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              Completed
            </p>

            <p className="mt-1 text-xs font-bold text-emerald-700">
              {formatDateTime(
                item.completedAt,
              )}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onReset}
          disabled={item.status === "not-started"}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-300"
        >
          <Trash2 size={15} />
          {item.status === "not-started"
            ? "No Progress to Reset"
            : "Reset Reading Progress"}
        </button>

        <Link
          href={`/flashcard-modules/${item.module.id}/read`}
          className="group mt-3 flex w-full items-center justify-between rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
        >
          Open Module

          <ChevronRight
            size={17}
            className="transition group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
}

function ProgressInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}