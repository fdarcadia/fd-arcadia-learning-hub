"use client";

import type React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
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
import { type Profile, supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type LearningHubAccess = {
  id: string;
  parent_id: string;
  month_no: number;
  week_no: number | null;
  unlocked: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type LearningHubWeekItem = {
  id: string;
  month_no: number;
  week_no: number;
  is_active?: boolean | null;
};

type LearningHubItemProgress = {
  item_id: string;
  completed: boolean | null;
  downloaded: boolean | null;
};

type WeekStatus = "Locked" | "Ready" | "In Progress" | "Completed";

type WeekDefinition = {
  week: number;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  color: string;
};

type WeekView = WeekDefinition & {
  unlocked: boolean;
  progress: number;
  status: WeekStatus;
};

/* =========================================================
   STATIC UI DATA
========================================================= */

const WEEK_DEFINITIONS: WeekDefinition[] = [
  {
    week: 1,
    title: "Week 1",
    subtitle: "Assessment, warm-up and first activities",
    badge: "Start Here",
    image: "🌱",
    color: "from-yellow-100 to-orange-100",
  },
  {
    week: 2,
    title: "Week 2",
    subtitle: "Continue weekly worksheet and learning files",
    badge: "Learning",
    image: "👧",
    color: "from-sky-100 to-indigo-100",
  },
  {
    week: 3,
    title: "Week 3",
    subtitle: "Practice, games and revision activities",
    badge: "Practice",
    image: "😊",
    color: "from-emerald-100 to-lime-100",
  },
  {
    week: 4,
    title: "Week 4",
    subtitle: "Review, special activity and progress check",
    badge: "Review",
    image: "🪥",
    color: "from-pink-100 to-rose-100",
  },
];

const SUBJECT_PREVIEW = [
  { title: "Warm Up", icon: "☀️", time: "9:00 AM" },
  { title: "Math", icon: "🔢", time: "10:00 AM" },
  { title: "Science", icon: "🧪", time: "11:00 AM" },
  { title: "Reading", icon: "📖", time: "9:30 AM" },
  { title: "Membaca", icon: "📚", time: "12:00 PM" },
];

const SIDEBAR_LINKS = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "My Children", href: "/children", icon: Users },
  { title: "Learning Hub", href: "/learning-hub", icon: BookOpenCheck },
  { title: "Freebies", href: "/freebies", icon: Gift },
];

/* =========================================================
   ACCESS HELPERS
========================================================= */

function getRouteNumber(
  value: string | string[] | undefined,
  prefix: string,
) {
  const text = Array.isArray(value) ? value[0] : value || "";
  const number = Number(text.replace(prefix, ""));
  return Number.isFinite(number) ? number : 0;
}

function normalizeDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : null;
}

function isSubscriptionActive(profile: Profile | null) {
  if (!profile) return false;

  /*
   * Parent must have Learning Hub explicitly unlocked by admin.
   */
  if (!profile.learning_hub_unlocked) {
    return false;
  }

  /*
   * Backwards compatibility:
   * admin-created accounts may have unlock=true without dates.
   */
  if (!profile.subscription_start && !profile.subscription_end) {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = profile.subscription_start
    ? new Date(`${normalizeDate(profile.subscription_start)}T00:00:00`)
    : null;

  const end = profile.subscription_end
    ? new Date(`${normalizeDate(profile.subscription_end)}T00:00:00`)
    : null;

  if (start && today < start) return false;
  if (end && today > end) return false;

  return true;
}

function isLearningHubPackage(packageType: string | null) {
  return (
    packageType === "learning_hub_weekly" ||
    packageType === "learning_hub_monthly" ||
    packageType === "learning_hub_6month" ||
    packageType === "full_package"
  );
}

function isWeeklyPackage(packageType: string | null) {
  return packageType === "learning_hub_weekly";
}

/*
 * SINGLE SOURCE OF TRUTH FOR WEEK ACCESS
 *
 * 1. No profile / wrong package / inactive subscription:
 *       ALL weeks locked.
 *
 * 2. Exact week row exists:
 *       its unlocked value wins.
 *
 * 3. Otherwise, month-level row exists:
 *       its unlocked value controls all weeks.
 *
 * 4. Weekly package:
 *       ONLY Month 1 / Week 1 is automatic.
 *
 * 5. Monthly / 6-month / full:
 *       nothing is automatic; admin must unlock it.
 *
 * This prevents accidentally opening all 4 weeks just because
 * the parent has a Learning Hub package.
 */
function calculateWeekAccess(
  weekNo: number,
  monthNo: number,
  profile: Profile | null,
  accessRows: LearningHubAccess[],
) {
  if (!profile) return false;
  if (!isLearningHubPackage(profile.package_type)) return false;
  if (!isSubscriptionActive(profile)) return false;

  const exactWeekOverride = accessRows.find(
    (row) =>
      row.month_no === monthNo &&
      row.week_no === weekNo,
  );

  if (exactWeekOverride) {
    return Boolean(exactWeekOverride.unlocked);
  }

  const monthOverride = accessRows.find(
    (row) =>
      row.month_no === monthNo &&
      row.week_no === null,
  );

  if (monthOverride) {
    return Boolean(monthOverride.unlocked);
  }

  /*
   * Weekly package starts with Month 1 / Week 1 only.
   * No other week is opened automatically.
   */
  if (isWeeklyPackage(profile.package_type)) {
    return monthNo === 1 && weekNo === 1;
  }

  /*
   * Monthly / 6-month / full package:
   * admin must explicitly unlock.
   */
  return false;
}

function getWeekStatus(
  unlocked: boolean,
  progress: number,
): WeekStatus {
  if (!unlocked) return "Locked";
  if (progress >= 100) return "Completed";
  if (progress > 0) return "In Progress";
  return "Ready";
}

function getPackageLabel(packageType: string | null) {
  switch (packageType) {
    case "learning_hub_weekly":
      return "Weekly Learning Hub";

    case "learning_hub_monthly":
      return "Monthly Learning Hub";

    case "learning_hub_6month":
      return "6-Month Learning Hub";

    case "full_package":
      return "Full Package";

    default:
      return "Learning Hub";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function MonthPage() {
  return (
    <ProtectedPage>
      {() => <MonthContent />}
    </ProtectedPage>
  );
}

/* =========================================================
   MAIN CONTENT
========================================================= */

function MonthContent() {
  const params = useParams();

  const monthParam = String(params.month || "1");

  const monthNo = Number(params.month) || 1;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [accessRows, setAccessRows] = useState<LearningHubAccess[]>([]);
  const [weekItems, setWeekItems] = useState<LearningHubWeekItem[]>([]);
  const [progressRows, setProgressRows] = useState<
    LearningHubItemProgress[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Load:
   * - parent profile/subscription
   * - ONLY this month's access rows
   * - active week items for this month
   * - real completion rows for this parent
   */
  useEffect(() => {
    let mounted = true;

    async function loadMonthData() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          window.location.href = "/login";
          return;
        }

        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select(`
              id,
              email,
              full_name,
              user_type,
              learning_hub_unlocked,
              package_type,
              package_note,
              subscription_start,
              subscription_end
            `)
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        /*
         * IMPORTANT:
         * Access is read for this parent only and this month only.
         * There is NO fallback that opens the month.
         */
        const { data: accessData, error: accessError } =
          await supabase
            .from("learning_hub_access")
            .select(`
              id,
              parent_id,
              month_no,
              week_no,
              unlocked,
              created_at,
              updated_at
            `)
            .eq("parent_id", user.id)
            .eq("month_no", monthNo);

        if (accessError) {
          throw accessError;
        }

        /*
         * Actual Learning Hub content.
         * Keep the table name/fields used by the portal.
         */
        const { data: itemsData, error: itemsError } =
          await supabase
            .from("learning_hub_week_items")
            .select("id,month_no,week_no,is_active")
            .eq("month_no", monthNo)
            .eq("is_active", true)
            .gte("week_no", 1)
            .lte("week_no", 4);

        if (itemsError) {
          throw itemsError;
        }

        const items = (itemsData || []) as LearningHubWeekItem[];

        let progressData: LearningHubItemProgress[] = [];

        if (items.length > 0) {
          /*
           * Real progress only.
           * Do NOT create fake 60% / 100% values.
           */
          /*
           * Progress source:
           * The current Learning Hub schema uses
           * learning_hub_week_item_progress(user_id, item_id).
           *
           * If that table is not yet available in the connected Supabase
           * project, fall back to the legacy progress table so the month
           * page still loads. This fallback affects progress display only;
           * it NEVER changes subscription/admin access.
           */
          const {
            data: savedProgress,
            error: progressError,
          } = await supabase
            .from("learning_hub_week_item_progress")
            .select("item_id,completed,downloaded")
            .eq("user_id", user.id)
            .in(
              "item_id",
              items.map((item) => item.id),
            );

          if (!progressError) {
            progressData =
              (savedProgress || []) as LearningHubItemProgress[];
          } else {
            const {
              data: legacyProgress,
              error: legacyProgressError,
            } = await supabase
              .from("learning_hub_item_progress")
              .select("item_id,completed,downloaded")
              .eq("parent_id", user.id)
              .in(
                "item_id",
                items.map((item) => item.id),
              );

            if (!legacyProgressError) {
              progressData =
                (legacyProgress || []) as LearningHubItemProgress[];
            } else {
              /*
               * Progress is optional for page access. If both progress
               * sources are unavailable, keep progress at 0% and do not
               * block the Learning Hub page.
               */
              console.warn("Learning Hub progress unavailable.", {
                current: progressError.message,
                legacy: legacyProgressError.message,
              });
            }
          }
        }

        if (!mounted) return;

        setProfile(profileData as Profile | null);
        setAccessRows(
          (accessData || []) as LearningHubAccess[],
        );
        setWeekItems(items);
        setProgressRows(progressData);
      } catch (loadError) {
        console.error(
          "Learning Hub month load error:",
          loadError,
        );

        if (!mounted) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this Learning Hub month.",
        );

        setProfile(null);
        setAccessRows([]);
        setWeekItems([]);
        setProgressRows([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMonthData();

    return () => {
      mounted = false;
    };
  }, [monthNo]);

  /*
   * Quick lookup for actual item completion.
   */
  const progressMap = useMemo(() => {
    const map = new Map<
      string,
      LearningHubItemProgress
    >();

    progressRows.forEach((row) => {
      map.set(row.item_id, row);
    });

    return map;
  }, [progressRows]);

  /*
   * Build the four weeks using ADMIN ACCESS + SUBSCRIPTION.
   * The old hard-coded unlocked/status/progress values are gone.
   */
  const weeks = useMemo<WeekView[]>(() => {
    return WEEK_DEFINITIONS.map((definition) => {
      const unlocked = calculateWeekAccess(
        definition.week,
        monthNo,
        profile,
        accessRows,
      );

      const itemsForWeek = weekItems.filter(
        (item) => item.week_no === definition.week,
      );

      const completedItems = itemsForWeek.filter(
        (item) =>
          progressMap.get(item.id)?.completed === true,
      );

      /*
       * If no actual content exists yet, show 0%.
       * Never invent progress.
       */
      const progress =
        itemsForWeek.length > 0
          ? Math.round(
              (completedItems.length /
                itemsForWeek.length) *
                100,
            )
          : 0;

      return {
        ...definition,
        unlocked,
        progress,
        status: getWeekStatus(unlocked, progress),
      };
    });
  }, [
    accessRows,
    monthNo,
    profile,
    progressMap,
    weekItems,
  ]);

  /*
   * Month progress is calculated only from UNLOCKED weeks.
   *
   * Example:
   * Week 1 unlocked = 100%
   * Week 2 locked
   * Week 3 locked
   * Week 4 locked
   *
   * Month progress = 100%, not 25%.
   *
   * This prevents locked weeks from unfairly lowering progress.
   */
  const unlockedWeeks = useMemo(
    () => weeks.filter((week) => week.unlocked),
    [weeks],
  );

  const completedWeeks = useMemo(
    () =>
      unlockedWeeks.filter(
        (week) => week.progress >= 100,
      ).length,
    [unlockedWeeks],
  );

  const totalProgress = useMemo(() => {
    if (unlockedWeeks.length === 0) {
      return 0;
    }

    return Math.round(
      unlockedWeeks.reduce(
        (sum, week) => sum + week.progress,
        0,
      ) / unlockedWeeks.length,
    );
  }, [unlockedWeeks]);

  const subscriptionActive =
    isSubscriptionActive(profile);

  /*
   * Safety check for invalid routes.
   */
  const validMonth = monthNo >= 1 && monthNo <= 6;

  if (loading) {
    return <MonthLoading />;
  }

  if (!validMonth) {
    return <InvalidMonth />;
  }

  return (
    <main className="min-h-screen bg-[#f7f4ff] text-[#171a3b]">
      <div className="grid min-h-screen xl:grid-cols-[270px_1fr]">
        <MonthSidebar
          monthParam={monthParam}
          monthNo={monthNo}
          weeks={weeks}
          totalProgress={totalProgress}
        />

        <section className="min-w-0 bg-[radial-gradient(circle_at_top_right,_rgba(139,92,246,0.14),_transparent_30%),linear-gradient(180deg,#fbfaff_0%,#f4f1ff_100%)] px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-[1580px]">
            <header className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/55 p-2 backdrop-blur-xl">
              <div>
                <Link
                  href="/learning-hub"
                  className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-white bg-white/90 px-5 py-3 font-black text-[#5E587F] shadow-sm transition hover:-translate-y-0.5 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <ArrowLeft size={20} />
                  Back to Months
                </Link>

                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#7B739F]">
                  FD ARCADIA LEARNING HUB
                </p>

                <h1 className="mt-1 text-4xl font-black tracking-tight text-[#25285a] sm:text-5xl">
                  Month {monthNo}
                </h1>

                <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
                  Choose a week to view schedule, worksheet links,
                  videos and activities.
                </p>
              </div>

              <div className="hidden rounded-2xl border border-white bg-white/85 px-5 py-3 text-right shadow-sm backdrop-blur lg:block">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  ACCESS
                </p>
                <p className="mt-1 text-sm font-black text-[#5E587F]">
                  {getPackageLabel(
                    profile?.package_type || null,
                  )}
                </p>
              </div>
            </header>

            {error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 px-5 py-4 text-sm font-bold text-red-700 shadow-sm">
                {error}
              </div>
            ) : null}

            {!subscriptionActive ? (
              <LockedMonthHero monthNo={monthNo} />
            ) : (
              <>
                <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="relative overflow-hidden rounded-[34px] border border-white/20 bg-gradient-to-br from-[#EEEAF8] via-[#E6E3F3] to-[#D9DDF0] text-[#25284D] p-7 text-[#25284D] shadow-[0_24px_70px_rgba(50,55,95,0.12)] sm:p-8">
                    <div className="flex items-center gap-3">
                      <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-white/65 text-[#6D63A6] shadow-sm">
                        <Sparkles size={30} />
                      </div>

                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#6D63A6]">
                          MONTHLY LEARNING PLAN
                        </p>
                        <h2 className="mt-1 text-3xl font-black tracking-tight text-[#25284D] sm:text-4xl">
                          Month {monthNo} learning journey.
                        </h2>
                      </div>
                    </div>

                    <p className="mt-5 max-w-3xl text-sm font-medium leading-7 text-[#66708C] sm:text-base">
                      Each week contains subject activities,
                      worksheet links and learning files uploaded by
                      FD Arcadia admin.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <HeroStat label="Weeks" value="4" />
                      <HeroStat label="Available" value={`${unlockedWeeks.length}`} />
                      <HeroStat label="Progress" value={`${totalProgress}%`} />
                    </div>
                  </div>

                  <div className="rounded-[32px] border border-white bg-white/90 p-6 shadow-[0_14px_45px_rgba(60,50,120,0.08)] backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#7B739F]">
                          MONTH PROGRESS
                        </p>
                        <h2 className={`mt-2 text-4xl font-black ${getProgressColors(totalProgress).text}`}>
                          {totalProgress}%
                        </h2>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {completedWeeks} of {unlockedWeeks.length} unlocked
                          {unlockedWeeks.length === 1 ? " week" : " weeks"} completed
                        </p>
                      </div>

                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <Trophy size={34} />
                      </div>
                    </div>

                    <div className={`mt-6 h-4 overflow-hidden rounded-full ${getProgressColors(totalProgress).track}`}>
                      <div
                        className={`h-full rounded-full transition-all ${getProgressColors(totalProgress).bar}`}
                        style={{ width: `${totalProgress}%` }}
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-2">
                      {weeks.map((item) => (
                        <div
                          key={item.week}
                          className={`rounded-xl px-2 py-3 text-center ${
                            item.unlocked
                              ? "bg-indigo-50"
                              : "bg-slate-50"
                          }`}
                        >
                          <p
                            className={`text-sm font-black ${
                              item.unlocked
                                ? "text-indigo-700"
                                : "text-slate-300"
                            }`}
                          >
                            W{item.week}
                          </p>
                          <p
                            className={`mt-1 text-xs font-bold ${
                              item.unlocked
                                ? "text-slate-500"
                                : "text-slate-300"
                            }`}
                          >
                            {item.unlocked
                              ? `${item.progress}%`
                              : "Locked"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="mt-7">
                  <div className="mb-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#7B739F]">
                      WEEK SELECTION
                    </p>
                    <h2 className="mt-1 text-3xl font-black tracking-tight text-[#20234d] sm:text-4xl">
                      Choose Your Week
                    </h2>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                      Only weeks activated for this subscription are
                      available to open.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {weeks.map((item) => (
                      <WeekCard
                        key={item.week}
                        monthParam={monthParam}
                        item={item}
                      />
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
                          Choose one unlocked week to open the schedule,
                          topics, worksheets and activities. Locked weeks
                          become available when FD Arcadia admin activates
                          them.
                        </p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          <InfoPill
                            icon={<CalendarDays size={18} />}
                            text="Choose Week"
                          />
                          <InfoPill
                            icon={<FileText size={18} />}
                            text="Open Files"
                          />
                          <InfoPill
                            icon={<CheckCircle2 size={18} />}
                            text="Complete"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F1EBDD] text-yellow-700">
                        <Star size={28} />
                      </div>

                      <div className="flex-1">
                        <h2 className="text-2xl font-black text-indigo-700">
                          Subject Preview
                        </h2>

                        <p className="mt-2 leading-7 text-slate-600">
                          Weekly pages are organised by subject and activity
                          time.
                        </p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          {SUBJECT_PREVIEW.map((subject) => (
                            <div
                              key={subject.title}
                              className="rounded-2xl bg-indigo-50 px-4 py-3 font-black text-indigo-700"
                            >
                              <span className="mr-2 text-xl">
                                {subject.icon}
                              </span>
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
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   WEEK CARD
========================================================= */

function WeekCard({
  monthParam,
  item,
}: {
  monthParam: string;
  item: WeekView;
}) {
  const href = `/learning-hub/${monthParam}/week-${item.week}`;
  const locked = !item.unlocked;
  const completed = item.status === "Completed";
  const inProgress = item.status === "In Progress";
  const progressColors = getProgressColors(item.progress);

  const card = (
    <article
      className={`group relative overflow-hidden rounded-[24px] border p-3.5 shadow-[0_10px_32px_rgba(60,50,120,0.07)] transition-all duration-300 sm:p-4 ${
        locked
          ? "cursor-not-allowed border-slate-200/80 bg-white/60"
          : "border-white bg-white/90 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(70,55,150,0.13)]"
      }`}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-100/60 blur-2xl" />

      <div
        className={`relative overflow-hidden rounded-[19px] bg-gradient-to-br ${item.color} p-4`}
      >
        <div className="flex items-center justify-between gap-2">
          <div
            className={`grid h-12 w-12 place-items-center rounded-[16px] border border-white/80 shadow-sm ${
              locked
                ? "bg-white/65 text-slate-400"
                : "bg-white text-[#5E587F]"
            }`}
          >
            <CalendarDays size={23} />
          </div>

          <WeekStatusBadge status={item.status} />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex rounded-full bg-white/85 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-[#5E587F] shadow-sm">
              {item.badge}
            </span>

            <span className="text-2xl leading-none">
              {item.image}
            </span>
          </div>

          <h3 className="mt-3 text-[25px] font-black tracking-tight text-[#25285a]">
            {item.title}
          </h3>

          <p className="mt-1.5 min-h-[42px] text-[12px] font-medium leading-5 text-slate-600">
            {item.subtitle}
          </p>
        </div>

        <div className="mt-4 rounded-[16px] border border-white/80 bg-white/55 p-2.5">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-black">
            <span className="text-slate-500">Progress</span>
            <span className={locked ? "text-slate-400" : progressColors.text}>
              {locked ? "Locked" : `${item.progress}%`}
            </span>
          </div>
          <div className={`h-1.5 overflow-hidden rounded-full ${locked ? "bg-white/80" : progressColors.track}`}>
            {!locked ? (
              <div
                className={`h-full rounded-full transition-all ${progressColors.bar}`}
                style={{ width: `${item.progress}%` }}
              />
            ) : null}
          </div>
        </div>

        <div
          className={`mt-3 flex min-h-10 items-center justify-between rounded-[15px] px-3 py-2 text-[11px] font-black ${
            locked
              ? "bg-slate-200/75 text-slate-400"
              : "bg-[#2D3157] text-white shadow-md shadow-slate-900/10"
          }`}
        >
          <span>
            {locked
              ? "Locked by admin"
              : completed
                ? "Review week"
                : inProgress
                  ? "Continue learning"
                  : "Open week"}
          </span>

          {locked ? <LockKeyhole size={15} /> : <ChevronRight size={16} />}
        </div>
      </div>
    </article>
  );

  if (locked) {
    return (
      <div aria-disabled="true" title="This week has not been unlocked.">
        {card}
      </div>
    );
  }

  return (
    <Link href={href} className="block" aria-label={`Open ${item.title}`}>
      {card}
    </Link>
  );
}

/* =========================================================
   PROGRESS COLORS
========================================================= */

function getProgressColors(progress: number) {
  const value = Math.max(0, Math.min(100, Math.round(progress)));

  if (value === 100) {
    return {
      text: "text-[#648A72]",
      bar: "bg-[#78A98B]",
      track: "bg-[#EAF3EE]",
    };
  }

  if (value >= 50) {
    return {
      text: "text-[#747FB5]",
      bar: "bg-[#747FB5]",
      track: "bg-[#E9ECF7]",
    };
  }

  if (value >= 1) {
    return {
      text: "text-[#9B95C5]",
      bar: "bg-[#9B95C5]",
      track: "bg-[#EFEDF7]",
    };
  }

  return {
    text: "text-[#C8C5DB]",
    bar: "bg-[#C8C5DB]",
    track: "bg-[#F2F1F7]",
  };
}

/* =========================================================
   STATUS BADGE
========================================================= */

function WeekStatusBadge({
  status,
}: {
  status: WeekStatus;
}) {
  if (status === "Completed") {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
        Completed
      </span>
    );
  }

  if (status === "In Progress") {
    return (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
        In Progress
      </span>
    );
  }

  if (status === "Ready") {
    return (
      <span className="rounded-full bg-[#F1EBDD] px-3 py-1 text-xs font-black text-yellow-700">
        Ready
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-500">
      Locked
    </span>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function MonthSidebar({
  monthParam,
  monthNo,
  weeks,
  totalProgress,
}: {
  monthParam: string;
  monthNo: number;
  weeks: WeekView[];
  totalProgress: number;
}) {
  return (
    <aside className="hidden min-h-screen border-r border-white/10 bg-gradient-to-b from-[#0c1237] via-[#121846] to-[#090f30] p-4 text-white xl:block">
      <Link href="/dashboard" className="block">
        <div className="flex h-[70px] items-center justify-center overflow-hidden rounded-[22px] border border-white/80 bg-white px-3 shadow-[0_14px_35px_rgba(0,0,0,0.20)]">
          <img
            src="/fd-arcadia-logo1.png"
            alt="FD Arcadia"
            className="h-full w-full object-contain"
            draggable={false}
          />
        </div>
      </Link>

      <div className="mt-5 rounded-[24px] border border-violet-300/15 bg-white/[0.07] p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#666B96] shadow-lg">
            <BookOpenCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-200/70">
              FD Arcadia
            </p>
            <p className="mt-1 text-sm font-black">Learning Hub</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 space-y-1.5">
        {SIDEBAR_LINKS.map((item) => {
          const Icon = item.icon;
          const active = item.title === "Learning Hub";

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-black transition ${
                active
                  ? "bg-[#4B4F79] text-white shadow-lg shadow-violet-900/30"
                  : "text-[#66708C]/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={19} />
              {item.title}
              {active ? (
                <span className="ml-auto h-2 w-2 rounded-full bg-emerald-300" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-7">
        <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/45">
          Month {monthNo}
        </p>

        <div className="space-y-1">
          {weeks.map((item) => {
            const link = `/learning-hub/${monthParam}/week-${item.week}`;

            if (!item.unlocked) {
              return (
                <div
                  key={item.week}
                  className="flex cursor-not-allowed items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#66708C]/25"
                  aria-disabled="true"
                >
                  <span>{item.title}</span>
                  <LockKeyhole size={15} />
                </div>
              );
            }

            return (
              <Link
                key={item.week}
                href={link}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#66708C]/75 transition hover:bg-white/10 hover:text-white"
              >
                <span>{item.title}</span>
                {item.status === "Completed" ? (
                  <CheckCircle2 size={15} className="text-emerald-300" />
                ) : item.status === "In Progress" ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-300" />
                ) : (
                  <Clock3 size={15} className="text-[#8B86A8]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-10 rounded-[25px] border border-violet-300/15 bg-gradient-to-br from-[#44486D]/80 to-[#262A4B]/80 p-5 text-white shadow-[0_18px_45px_rgba(0,0,0,0.20)]">
        <div className="flex items-center justify-between">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
            <Trophy className="text-[#8B86A8]" size={22} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-100/70">
            Progress
          </span>
        </div>

        <p className="mt-4 text-base font-black">Month {monthNo}</p>
        <h3 className={`mt-1 text-2xl font-black ${getProgressColors(totalProgress).text}`}>{totalProgress}%</h3>
        <p className="mt-2 text-xs font-medium leading-5 text-[#66708C]/60">
          Complete activities from your unlocked weeks to increase progress.
        </p>

        <Link
          href="/learning-hub"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-[#5E587F] transition hover:bg-[#F0EDF8]"
        >
          <ArrowLeft size={14} />
          Back to Months
        </Link>
      </div>
    </aside>
  );
}

/* =========================================================
   LOCKED HERO
========================================================= */

function LockedMonthHero({
  monthNo,
}: {
  monthNo: number;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-white bg-white/90 shadow-[0_18px_60px_rgba(60,50,120,0.08)]">
      <div className="relative bg-gradient-to-br from-slate-100 via-indigo-50 to-violet-50 p-7 sm:p-10">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#D5D2E5]/30 blur-3xl" />

        <div className="relative">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
            <LockKeyhole size={32} />
          </div>

          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            FD Arcadia · Month {monthNo}
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight text-[#20234d] sm:text-4xl">
            This month is locked
          </h2>

          <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
            Your Learning Hub subscription is not currently active, or Learning
            Hub access has not been activated for this account.
          </p>

          <Link
            href="/learning-hub"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#4B4F79] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
          >
            Back to Months
            <ArrowLeft size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const progressValue =
    label === "Progress" ? Number.parseInt(value, 10) || 0 : 0;
  const valueClass =
    label === "Progress"
      ? getProgressColors(progressValue).text
      : "text-[#8B86A8]";

  return (
    <div className="rounded-[22px] border border-white/70 bg-white/55 p-4 text-[#25284D] shadow-sm backdrop-blur-xl">
      <p className={`text-3xl font-black ${valueClass} sm:text-4xl`}>
        {value}
      </p>
      <p className="mt-1 text-xs font-bold text-[#66708C]">
        {label}
      </p>
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

function MonthLoading() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] animate-pulse">
        <div className="h-11 w-48 rounded-2xl bg-slate-200" />
        <div className="mt-4 h-12 w-56 rounded-xl bg-slate-200" />
        <div className="mt-2 h-5 w-96 max-w-full rounded bg-slate-100" />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="h-72 rounded-[2.5rem] bg-indigo-100" />
          <div className="h-72 rounded-[2.5rem] bg-white" />
        </div>

        <div className="mt-8 h-8 w-64 rounded bg-slate-200" />

        <div className="mt-5 grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[430px] rounded-[2rem] bg-white shadow-sm"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function InvalidMonth() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] p-6">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <LockKeyhole size={30} />
        </div>

        <h1 className="mt-5 text-2xl font-black text-slate-900">
          Month not found
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Please return to Learning Hub and choose one of the available
          months.
        </p>

        <Link
          href="/learning-hub"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-black text-white"
        >
          <ArrowLeft size={17} />
          Back to Learning Hub
        </Link>
      </div>
    </main>
  );
}
