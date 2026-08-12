"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/client";

type ModuleItem = {
  id: string;
  title: string;
  description: string | null;
  display_order: number | null;
  is_active: boolean;
  total_pages: number | null;
};

type ModuleProgress = {
  module_id: string;
  last_page: number;
  highest_page: number;
  progress_percent: number;
  last_opened_at: string | null;
  completed_at: string | null;
};

const moduleTheme = [
  {
    label: "Foundation",
    badge: "Book 1",
    number: "01",
    gradient: "from-slate-950 via-slate-900 to-slate-700",
    soft: "bg-slate-100 text-slate-700",
  },
  {
    label: "Progressive",
    badge: "Book 2",
    number: "02",
    gradient: "from-cyan-950 via-cyan-900 to-cyan-700",
    soft: "bg-cyan-50 text-cyan-800",
  },
  {
    label: "Advanced",
    badge: "Book 3",
    number: "03",
    gradient: "from-violet-950 via-violet-900 to-violet-700",
    soft: "bg-violet-50 text-violet-800",
  },
];

export default function FlashcardModulesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [progressByModule, setProgressByModule] = useState<Record<string, ModuleProgress>>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadModulesAndProgress() {
      try {
        setLoading(true);
        setErrorMessage("");

        const { data: moduleRows, error: moduleError } = await supabase
          .from("flashcard_modules")
          .select(
            "id,title,description,display_order,is_active,total_pages"
          )
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (moduleError) {
          throw moduleError;
        }

        if (!mounted) return;

        const typedModules = (moduleRows ?? []) as ModuleItem[];
        setModules(typedModules);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (!mounted) return;
          setProgressByModule({});
          return;
        }

        const moduleIds = typedModules.map((module) => module.id);

        if (moduleIds.length === 0) {
          setProgressByModule({});
          return;
        }

        const { data: progressRows, error: progressError } = await supabase
          .from("flashcard_module_progress")
          .select(
            "module_id,last_page,highest_page,progress_percent,last_opened_at,completed_at"
          )
          .eq("user_id", user.id)
          .in("module_id", moduleIds);

        if (progressError) {
          throw progressError;
        }

        if (!mounted) return;

        const progressMap: Record<string, ModuleProgress> = {};

        for (const row of progressRows ?? []) {
          progressMap[row.module_id] = row as ModuleProgress;
        }

        setProgressByModule(progressMap);
      } catch (error) {
        console.error("Load flashcard modules error:", error);

        if (!mounted) return;

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load modules."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadModulesAndProgress();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  function getModuleProgress(module: ModuleItem) {
    const saved = progressByModule[module.id];

    const totalPages = Math.max(1, Number(module.total_pages ?? 1));
    const lastPage = Math.max(
      1,
      Math.min(totalPages, Number(saved?.last_page ?? 1))
    );
    const highestPage = Math.max(
      saved ? 1 : 0,
      Math.min(totalPages, Number(saved?.highest_page ?? 0))
    );

    const percent = saved
      ? Math.min(
          100,
          Math.max(
            0,
            Number.isFinite(Number(saved.progress_percent))
              ? Number(saved.progress_percent)
              : Math.round((highestPage / totalPages) * 100)
          )
        )
      : 0;

    const completed = Boolean(saved?.completed_at) || percent >= 100;
    const started = Boolean(saved);

    return {
      saved,
      totalPages,
      lastPage,
      highestPage,
      percent,
      completed,
      started,
    };
  }

  function getContinueModule() {
    const candidates = modules
      .map((module) => ({
        module,
        progress: progressByModule[module.id],
      }))
      .filter((item) => item.progress?.last_opened_at)
      .sort((a, b) => {
        const aTime = new Date(a.progress!.last_opened_at ?? 0).getTime();
        const bTime = new Date(b.progress!.last_opened_at ?? 0).getTime();
        return bTime - aTime;
      });

    if (candidates.length === 0) {
      return null;
    }

    const latest = candidates[0];
    const details = getModuleProgress(latest.module);

    return {
      module: latest.module,
      details,
    };
  }


  function formatLastOpened(value: string | null | undefined) {
    if (!value) return "Not started";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Recently opened";
    }

    return new Intl.DateTimeFormat("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }


  const continueModule = getContinueModule();

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      {/* TOP NAV */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[11px] font-black text-emerald-700 sm:flex">
              <ShieldCheck size={14} />
              Parent Learning Portal
            </div>

            <div className="rounded-full bg-slate-950 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white">
              Modul Membaca
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-6 py-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.2)] md:px-10 md:py-11">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute left-8 top-8 text-white/10">
            <Sparkles size={52} />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/10 text-indigo-200 backdrop-blur">
                  <BookOpen size={24} />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-indigo-300">
                    FD Arcadia Learning Hub
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Interactive Reading Library
                  </p>
                </div>
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight md:text-5xl">
                Modul Membaca
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                Baca, tulis dan sambung semula dari halaman terakhir. Semua
                progress dan tulisan disimpan secara automatik mengikut akaun parent.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <FeatureChip text="Interactive Flip Book" />
                <FeatureChip text="Writing Tools" />
                <FeatureChip text="Auto Save" />
                <FeatureChip text="Phone • iPad • Laptop" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:min-w-[340px]">
              <HeroStat value={String(modules.length || 3)} label="Books" />
              <HeroStat value="24/7" label="Access" />
              <HeroStat value="Auto" label="Save" />
            </div>
          </div>
        </section>

        {/* CONTINUE LEARNING */}
        {!loading && !errorMessage && continueModule && (
          <section className="mt-6 overflow-hidden rounded-[28px] border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                  <PlayCircle size={23} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">
                    Continue Learning
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {continueModule.module.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Resume from Page {continueModule.details.lastPage} of{" "}
                    {continueModule.details.totalPages}.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-[180px]">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <span>Progress</span>
                    <span>{continueModule.details.percent}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${continueModule.details.percent}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/flashcard-modules/${continueModule.module.id}/read`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Continue Reading
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* LIBRARY TITLE */}
        <section className="mb-6 mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-500">
              Reading Library
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950 md:text-3xl">
              Pilih Modul Membaca
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Mulakan daripada Modul 1 dan teruskan mengikut perkembangan bacaan anak.
            </p>
          </div>

          {!loading && modules.length > 0 && (
            <div className="inline-flex self-start items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 shadow-sm sm:self-auto">
              <BookOpen size={15} />
              {modules.length} modul tersedia
            </div>
          )}
        </section>

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] animate-pulse bg-slate-200" />

                <div className="space-y-4 p-6">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                  <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
                  <div className="h-14 w-full animate-pulse rounded-2xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && errorMessage && (
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100">
                !
              </div>

              <div>
                <h3 className="font-bold text-red-900">
                  Modul tidak dapat dimuatkan
                </h3>

                <p className="mt-1 text-sm text-red-700">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !errorMessage && modules.length === 0 && (
          <div className="rounded-[30px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-4xl">
              📚
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">
              Belum ada Modul Membaca
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Modul yang telah diaktifkan oleh admin akan dipaparkan di sini.
            </p>

            <Link
              href="/dashboard"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* MODULE CARDS */}
        {!loading && !errorMessage && modules.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module, index) => {
              const theme = moduleTheme[index % moduleTheme.length];
              const progress = getModuleProgress(module);

              const buttonLabel = progress.completed
                ? "Read Again"
                : progress.started
                  ? "Continue Reading"
                  : "Start Reading";

              const statusLabel = progress.completed
                ? "Completed"
                : progress.started
                  ? "In Progress"
                  : "Not Started";

              return (
                <article
                  key={module.id}
                  className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(15,23,42,0.14)]"
                >
                  <div
                    className={`relative flex min-h-[255px] items-center justify-center overflow-hidden bg-gradient-to-br ${theme.gradient} p-7 text-white`}
                  >
                    <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/[0.08]" />
                    <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-black/[0.12]" />

                    <div className="absolute left-6 top-6 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-black backdrop-blur">
                      {theme.number}
                    </div>

                    <div className="absolute right-6 top-6">
                      {progress.completed ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/15 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-200 backdrop-blur">
                          <CheckCircle2 size={13} />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white/70 backdrop-blur">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Available
                        </span>
                      )}
                    </div>

                    <div className="relative text-center">
                      <div className="mx-auto grid h-20 w-20 place-items-center rounded-[26px] border border-white/15 bg-white/10 text-white shadow-inner backdrop-blur">
                        <BookOpen size={36} />
                      </div>

                      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-white/60">
                        {theme.label}
                      </p>

                      <h3 className="mt-2 text-2xl font-black tracking-tight">
                        {module.title}
                      </h3>

                      <p className="mt-2 text-xs text-white/60">
                        FD Arcadia Reading Series
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Reading Module
                        </p>

                        <h3 className="mt-2 text-xl font-black text-slate-950">
                          {module.title}
                        </h3>
                      </div>

                      <span
                        className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black ${theme.soft}`}
                      >
                        {theme.badge}
                      </span>
                    </div>

                    <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-500">
                      {module.description ||
                        "Modul bacaan interaktif untuk pembelajaran membaca secara berperingkat."}
                    </p>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Reading Progress
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <p className="text-sm font-black text-slate-800">
                              {statusLabel}
                            </p>

                            {progress.completed && (
                              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700">
                                Complete
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-950">
                            {progress.percent}%
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400">
                            complete
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress.completed ? "bg-emerald-500" : "bg-slate-950"
                          }`}
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="font-semibold text-slate-600">
                          {progress.started
                            ? `Last read: Page ${progress.lastPage} / ${progress.totalPages}`
                            : `${progress.totalPages} pages`}
                        </span>

                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Clock3 size={12} />
                          {progress.started
                            ? formatLastOpened(progress.saved?.last_opened_at)
                            : "Ready to start"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <MiniFeature icon="📖" label="Flip Book" />
                      <MiniFeature icon="✏️" label="Write" />
                      <MiniFeature icon="☁️" label="Auto Save" />
                    </div>

                    <Link
                      href={`/flashcard-modules/${module.id}/read`}
                      className="mt-6 flex w-full items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
                    >
                      <div>
                        <p>{buttonLabel}</p>
                        <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                          {progress.completed
                            ? "Review this module anytime"
                            : progress.started
                              ? `Resume from Page ${progress.lastPage}`
                              : "Begin interactive reading"}
                        </p>
                      </div>

                      <ChevronRight
                        size={20}
                        className="transition duration-200 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* INFO SECTION */}
        <section className="mt-12">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
              Interactive Learning
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Belajar terus dalam buku digital
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoCard
              icon="✏️"
              title="Write & Practice"
              text="Tulis terus atas halaman menggunakan jari, mouse, stylus atau Apple Pencil."
            />
            <InfoCard
              icon="☁️"
              title="Auto Save"
              text="Tulisan dan progress disimpan mengikut akaun parent secara automatik."
            />
            <InfoCard
              icon="📱"
              title="Responsive Learning"
              text="Direka untuk phone, iPad, tablet dan laptop dengan paparan yang selesa."
            />
          </div>
        </section>

        {/* FOOTER NOTE */}
        <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            Modul digital ini hanya untuk kegunaan pembelajaran dalam FD Arcadia Learning Hub.
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-black text-slate-800 transition hover:text-indigo-600"
          >
            Return to Dashboard
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}


function FeatureChip({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-slate-200 backdrop-blur">
      {text}
    </span>
  );
}

function HeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 text-center backdrop-blur">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function MiniFeature({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
      <p className="text-lg">{icon}</p>
      <p className="mt-1 text-[10px] font-bold text-slate-500">
        {label}
      </p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        {icon}
      </div>

      <h3 className="mt-4 font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}
