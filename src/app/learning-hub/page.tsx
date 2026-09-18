"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BarChart3, BookOpenCheck, CalendarDays, CheckCircle2,
  ChevronRight, Clock3, Gift, Home, LockKeyhole, Sparkles, Star, Trophy, Users,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { type Profile, supabase } from "@/lib/supabase";

type LearningHubAccess = {
  id: string; parent_id: string; month_no: number; week_no: number | null;
  unlocked: boolean; created_at?: string | null; updated_at?: string | null;
};
type LearningHubWeekItem = { id: string; month_no: number; week_no: number; is_active?: boolean | null; };
type LearningHubItemProgress = { item_id: string; completed: boolean | null; downloaded: boolean | null; };
type MonthStatus = "locked" | "available" | "in-progress" | "completed";
type MonthCard = {
  month: number; title: string; subtitle: string; description: string; icon: string;
  color: string; iconBg: string; status: MonthStatus; unlockedWeeks: number;
  completedWeeks: number; progress: number;
};

const SIDEBAR_LINKS = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "My Children", href: "/children", icon: Users },
  { title: "Learning Hub", href: "/learning-hub", icon: BookOpenCheck },
  { title: "Freebies", href: "/freebies", icon: Gift },
];

const MONTH_DEFINITIONS = [
  { month: 1, title: "Getting Started", subtitle: "Month 1", description: "Build confidence and begin the learning routine.", icon: "☀️", color: "bg-yellow-50 border-yellow-200", iconBg: "bg-yellow-100" },
  { month: 2, title: "Growing Skills", subtitle: "Month 2", description: "More practice, new skills and gentle challenges.", icon: "🌱", color: "bg-sky-50 border-sky-200", iconBg: "bg-sky-100" },
  { month: 3, title: "Building Independence", subtitle: "Month 3", description: "Explore, practise and do more independently.", icon: "🌈", color: "bg-emerald-50 border-emerald-200", iconBg: "bg-emerald-100" },
  { month: 4, title: "Expanding Knowledge", subtitle: "Month 4", description: "Discover new topics through engaging activities.", icon: "⭐", color: "bg-rose-50 border-rose-200", iconBg: "bg-rose-100" },
  { month: 5, title: "Becoming Confident", subtitle: "Month 5", description: "Apply what has been learned in creative ways.", icon: "💡", color: "bg-violet-50 border-violet-200", iconBg: "bg-violet-100" },
  { month: 6, title: "Ready for What's Next", subtitle: "Month 6", description: "Review, celebrate progress and keep going.", icon: "🏆", color: "bg-orange-50 border-orange-200", iconBg: "bg-orange-100" },
];

function normalizeDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : null;
}

function isSubscriptionActive(profile: Profile | null) {
  if (!profile || !profile.learning_hub_unlocked) return false;
  if (!profile.subscription_start && !profile.subscription_end) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = profile.subscription_start
    ? new Date(`${normalizeDate(profile.subscription_start)}T00:00:00`) : null;
  const end = profile.subscription_end
    ? new Date(`${normalizeDate(profile.subscription_end)}T00:00:00`) : null;

  if (start && today < start) return false;
  if (end && today > end) return false;
  return true;
}

function isLearningHubPackage(packageType: string | null) {
  return ["learning_hub_weekly", "learning_hub_monthly", "learning_hub_6month", "full_package"].includes(packageType || "");
}

function isWeeklyPackage(packageType: string | null) {
  return packageType === "learning_hub_weekly";
}

/*
 * ACCESS RULES:
 * - No active Learning Hub subscription/admin unlock => everything locked.
 * - Weekly package => Month 1 / Week 1 only by default.
 * - Monthly/6-month/full => nothing opens automatically; admin must unlock.
 * - Exact week access overrides month access.
 * - A true week override can expose that week even if the month is not globally unlocked.
 * - A false exact week override stays locked even if the month is unlocked.
 */
function getWeekUnlocked(monthNo: number, weekNo: number, profile: Profile | null, rows: LearningHubAccess[]) {
  if (!profile || !isLearningHubPackage(profile.package_type) || !isSubscriptionActive(profile)) return false;

  const exact = rows.find(r => r.month_no === monthNo && r.week_no === weekNo);
  if (exact) return Boolean(exact.unlocked);

  const month = rows.find(r => r.month_no === monthNo && r.week_no === null);
  if (month) return Boolean(month.unlocked);

  return isWeeklyPackage(profile.package_type) && monthNo === 1 && weekNo === 1;
}

function getMonthUnlocked(monthNo: number, profile: Profile | null, rows: LearningHubAccess[]) {
  if (!profile || !isLearningHubPackage(profile.package_type) || !isSubscriptionActive(profile)) return false;

  const month = rows.find(r => r.month_no === monthNo && r.week_no === null);

  if (month?.unlocked === true) return true;

  if (month?.unlocked === false) {
    return [1, 2, 3, 4].some(w =>
      rows.some(r => r.month_no === monthNo && r.week_no === w && r.unlocked === true)
    );
  }

  if ([1, 2, 3, 4].some(w =>
    rows.some(r => r.month_no === monthNo && r.week_no === w && r.unlocked === true)
  )) return true;

  return isWeeklyPackage(profile.package_type) && monthNo === 1;
}

function getPackageLabel(packageType: string | null) {
  switch (packageType) {
    case "learning_hub_weekly": return "Weekly Learning Hub";
    case "learning_hub_monthly": return "Monthly Learning Hub";
    case "learning_hub_6month": return "6-Month Learning Hub";
    case "full_package": return "Full Package";
    default: return "Learning Hub";
  }
}

export default function LearningHubHomePage() {
  return <ProtectedPage>{() => <LearningHubHomeContent />}</ProtectedPage>;
}

function LearningHubHomeContent() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accessRows, setAccessRows] = useState<LearningHubAccess[]>([]);
  const [weekItems, setWeekItems] = useState<LearningHubWeekItem[]>([]);
  const [progressRows, setProgressRows] = useState<LearningHubItemProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) { window.location.href = "/login"; return; }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(`id,email,full_name,user_type,learning_hub_unlocked,package_type,package_note,subscription_start,subscription_end`)
          .eq("id", user.id)
          .maybeSingle();
        if (profileError) throw profileError;

        const { data: accessData, error: accessError } = await supabase
          .from("learning_hub_access")
          .select("id,parent_id,month_no,week_no,unlocked,created_at,updated_at")
          .eq("parent_id", user.id);
        if (accessError) throw accessError;

        const { data: itemData, error: itemError } = await supabase
          .from("learning_hub_week_items")
          .select("id,month_no,week_no,is_active")
          .eq("is_active", true)
          .gte("month_no", 1)
          .lte("month_no", 6);
        if (itemError) throw itemError;

        const items = (itemData || []) as LearningHubWeekItem[];

        /*
         * IMPORTANT:
         * The home page must never fail just because the optional
         * progress table/RLS is unavailable. Access is controlled
         * separately by profiles + learning_hub_access.
         *
         * Real item progress is loaded on the Month/Week pages.
         * Therefore the home page starts at 0% instead of making
         * a failing progress request here.
         */
        const progress: LearningHubItemProgress[] = [];
        if (cancelled) return;
        setProfile(profileData as Profile | null);
        setAccessRows((accessData || []) as LearningHubAccess[]);
        setWeekItems(items);
        setProgressRows(progress);
      } catch (e) {
        console.error("Learning Hub home load error:", e);
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unable to load Learning Hub.");
          setProfile(null); setAccessRows([]); setWeekItems([]); setProgressRows([]);
        }
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const progressMap = useMemo(() => {
    const map = new Map<string, LearningHubItemProgress>();
    progressRows.forEach(row => map.set(row.item_id, row));
    return map;
  }, [progressRows]);

  const monthCards = useMemo<MonthCard[]>(() => MONTH_DEFINITIONS.map(def => {
    const unlocked = getMonthUnlocked(def.month, profile, accessRows);
    const monthItems = weekItems.filter(i => i.month_no === def.month);
    const unlockedWeeks = [1,2,3,4].filter(w => getWeekUnlocked(def.month, w, profile, accessRows)).length;
    const completedWeeks = [1,2,3,4].filter(w => {
      const items = monthItems.filter(i => i.week_no === w);
      return items.length > 0 && items.every(i => progressMap.get(i.id)?.completed === true);
    }).length;
    const availableItems = monthItems.filter(i => getWeekUnlocked(def.month, i.week_no, profile, accessRows));
    const completedItems = availableItems.filter(i => progressMap.get(i.id)?.completed === true);
    const progress = availableItems.length ? Math.round((completedItems.length / availableItems.length) * 100) : 0;
    let status: MonthStatus = "locked";
    if (unlocked) status = progress >= 100 && availableItems.length ? "completed" : progress > 0 ? "in-progress" : "available";
    return { ...def, status, unlockedWeeks, completedWeeks, progress };
  }), [accessRows, profile, progressMap, weekItems]);

  const unlockedMonths = monthCards.filter(m => m.status !== "locked");
  const completedMonths = monthCards.filter(m => m.status === "completed");
  const totalUnlockedItems = monthCards.reduce((sum, month) => {
    if (month.status === "locked") return sum;
    return sum + weekItems.filter(i => i.month_no === month.month && getWeekUnlocked(month.month, i.week_no, profile, accessRows)).length;
  }, 0);
  const totalCompletedItems = progressRows.filter(r => r.completed === true).length;
  const overallProgress = totalUnlockedItems ? Math.min(100, Math.round((totalCompletedItems / totalUnlockedItems) * 100)) : 0;
  const firstUnlockedMonth = unlockedMonths[0]?.month ?? null;

  if (loading) return <LearningHubLoading />;

  return (
    <main className="min-h-screen bg-[#f7f4ff] text-[#171a3b]">
      <div className="min-h-screen xl:grid xl:grid-cols-[255px_minmax(0,1fr)]">
        <PremiumSidebar monthCards={monthCards} overallProgress={overallProgress} profile={profile} />

        <section className="min-w-0 bg-[radial-gradient(circle_at_top_right,_rgba(139,92,246,0.13),_transparent_32%),linear-gradient(180deg,#fbfaff_0%,#f4f1ff_100%)]">
          <div className="mx-auto max-w-[1580px] px-4 pb-10 sm:px-6 lg:px-8 xl:px-10">
            <PremiumTopBar profile={profile} />
            {error ? <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}

            {!isSubscriptionActive(profile) ? <NoAccessHero /> : <>
              <PremiumHero
                packageLabel={getPackageLabel(profile?.package_type || null)}
                firstUnlockedMonth={firstUnlockedMonth}
                unlockedMonths={unlockedMonths.length}
                completedMonths={completedMonths.length}
                overallProgress={overallProgress}
              />

              <PremiumStats
                unlockedMonths={unlockedMonths.length}
                completedMonths={completedMonths.length}
                overallProgress={overallProgress}
                totalUnlockedItems={totalUnlockedItems}
              />

              <section className="mt-9">
                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-violet-500">Month Selection</p>
                    <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Choose Your Month</h2>
                    <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">Six carefully structured months of activities, worksheets and subject learning resources.</p>
                  </div>
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-2 text-xs font-black text-violet-700 shadow-sm backdrop-blur">
                    <CalendarDays size={15} /> 4 Weeks in Every Month
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {monthCards.map(month => <PremiumMonthCard key={month.month} month={month} />)}
                </div>
              </section>

              <PremiumProgressStrip overallProgress={overallProgress} unlockedMonths={unlockedMonths.length} completedMonths={completedMonths.length} />
            </>}
          </div>
        </section>
      </div>
    </main>
  );
}

function PremiumSidebar({ monthCards, overallProgress, profile }: { monthCards: MonthCard[]; overallProgress: number; profile: Profile | null }) {
  return (
    <aside className="hidden min-h-screen border-r border-white/10 bg-gradient-to-b from-[#0d1238] via-[#111746] to-[#0a1030] px-4 py-5 text-white xl:flex xl:flex-col">
      <Link href="/dashboard" className="px-1">
        <div className="flex h-[66px] w-full items-center justify-center overflow-hidden rounded-[20px] border border-white/80 bg-white px-3 shadow-[0_12px_35px_rgba(0,0,0,0.22)]">
          <img src="/fd-arcadia-logo1.png" alt="FD Arcadia Learning Hub" className="h-full w-full object-contain" draggable={false} />
        </div>
      </Link>

      <div className="mt-5 rounded-[25px] border border-violet-300/20 bg-white/[0.07] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 shadow-lg"><BookOpenCheck size={23} /></div>
          <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-200">Learning Access</p><p className="mt-1 truncate text-sm font-black">{getPackageLabel(profile?.package_type || null)}</p></div>
        </div>
      </div>

      <nav className="mt-6 space-y-1.5">
        {SIDEBAR_LINKS.map(item => {
          const Icon = item.icon;
          const active = item.title === "Learning Hub";
          return <Link key={item.title} href={item.href} className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-black transition ${active ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/30" : "text-indigo-100/75 hover:bg-white/10 hover:text-white"}`}><Icon size={19} />{item.title}{active ? <span className="ml-auto h-2 w-2 rounded-full bg-emerald-300" /> : null}</Link>;
        })}
      </nav>

      <div className="mt-7">
        <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/55">Your Learning Journey</p>
        <div className="space-y-1">
          {monthCards.map(month => {
            const locked = month.status === "locked";
            return <Link key={month.month} href={locked ? "#" : `/learning-hub/${month.month}`} onClick={e => { if (locked) e.preventDefault(); }} aria-disabled={locked} className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold transition ${locked ? "cursor-not-allowed text-indigo-100/25" : "text-indigo-100/75 hover:bg-white/10 hover:text-white"}`}><span>Month {month.month}</span>{locked ? <LockKeyhole size={15} /> : month.status === "completed" ? <CheckCircle2 size={15} className="text-emerald-300" /> : <span className="h-2.5 w-2.5 rounded-full bg-violet-300" />}</Link>;
          })}
        </div>
      </div>

      <div className="mt-auto rounded-[24px] border border-violet-300/20 bg-gradient-to-br from-violet-600/40 to-fuchsia-500/15 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><Trophy className="text-yellow-200" size={21} /></div><span className="text-[10px] font-black text-violet-100">PROGRESS</span></div>
        <p className="mt-3 text-lg font-black">Small Steps, Big Progress</p>
        <p className="mt-1 text-[10px] leading-5 text-indigo-100/70">{overallProgress}% of unlocked activities completed.</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-300 to-fuchsia-300" style={{ width: `${overallProgress}%` }} /></div>
      </div>
    </aside>
  );
}

function PremiumTopBar({ profile }: { profile: Profile | null }) {
  return <header className="sticky top-0 z-30 -mx-4 mb-7 border-b border-violet-100/80 bg-[#fbfaff]/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10"><div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-500">FD ARCADIA LEARNING HUB</p><p className="mt-0.5 text-lg font-black tracking-tight text-[#25285a]">Learning Journey</p></div><div className="flex items-center gap-2"><span className="hidden rounded-full border border-violet-100 bg-white px-3 py-2 text-xs font-black text-violet-700 shadow-sm sm:inline-flex">{getPackageLabel(profile?.package_type || null)}</span><Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-3.5 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:text-violet-700"><Home size={16} /> Dashboard</Link></div></div></header>;
}

function PremiumHero({ packageLabel, firstUnlockedMonth, unlockedMonths, completedMonths, overallProgress }: { packageLabel: string; firstUnlockedMonth: number | null; unlockedMonths: number; completedMonths: number; overallProgress: number }) {
  return <section className="relative overflow-hidden rounded-[32px] border border-white/80 bg-gradient-to-br from-[#f7e8ff] via-[#ece8ff] to-[#dcd9ff] p-5 shadow-[0_22px_70px_rgba(89,72,190,0.14)] sm:p-7 lg:p-9"><div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" /><div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-fuchsia-200/30 blur-3xl" /><div className="relative grid gap-7 xl:grid-cols-[1fr_390px] xl:items-center">
    <div className="max-w-3xl"><div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-violet-700 shadow-sm"><Sparkles size={14} /> Today&apos;s Learning Journey</div><h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-tight text-[#1c204b] sm:text-5xl lg:text-6xl">Six Months.<br /><span className="text-violet-600">A Brighter Tomorrow.</span></h1><p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-[#55587b] sm:text-base sm:leading-7">Structured activities, worksheets and joyful learning experiences prepared by FD Arcadia to support your child&apos;s progress month by month.</p><div className="mt-5 flex flex-wrap items-center gap-2"><span className="rounded-full bg-white/80 px-3 py-2 text-xs font-black text-violet-700 shadow-sm">{packageLabel}</span><span className="rounded-full bg-white/70 px-3 py-2 text-xs font-bold text-slate-600">{unlockedMonths} of 6 months available</span></div>{firstUnlockedMonth ? <Link href={`/learning-hub/${firstUnlockedMonth}`} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-xl">Start Learning <ArrowRight size={17} /></Link> : <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/70 px-5 py-3.5 text-sm font-black text-slate-500"><LockKeyhole size={16} /> Waiting for admin access</div>}</div>
    <div className="relative hidden min-h-[250px] xl:block"><div className="absolute inset-5 rounded-[30px] border border-white/70 bg-white/35 shadow-inner backdrop-blur-sm" /><div className="absolute right-8 top-4 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-lg"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-500">Small Steps</p><p className="mt-1 text-lg font-black text-[#35376b]">Big Progress ✨</p></div><div className="absolute bottom-3 left-8 grid h-28 w-28 place-items-center rounded-[28px] bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-2xl shadow-violet-500/30"><BarChart3 size={58} /><span className="absolute -bottom-5 rounded-full bg-white px-3 py-1 text-[10px] font-black text-violet-700 shadow">{overallProgress}% progress</span></div><div className="absolute bottom-4 right-8 flex items-end gap-3"><div className="h-16 w-10 rounded-t-2xl bg-violet-300/70" /><div className="h-24 w-10 rounded-t-2xl bg-violet-400/80" /><div className="h-36 w-10 rounded-t-2xl bg-violet-600 shadow-lg" /></div><div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[90px] drop-shadow-xl">🌱</div></div>
  </div></section>;
}

function PremiumStats({ unlockedMonths, completedMonths, overallProgress, totalUnlockedItems }: { unlockedMonths: number; completedMonths: number; overallProgress: number; totalUnlockedItems: number }) {
  const stats = [
    { label: "Available", value: unlockedMonths, sub: "months", icon: CalendarDays, cls: "bg-violet-50 text-violet-600" },
    { label: "Completed", value: completedMonths, sub: "months", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" },
    { label: "Progress", value: `${overallProgress}%`, sub: "overall", icon: BarChart3, cls: "bg-blue-50 text-blue-600" },
    { label: "Activities", value: totalUnlockedItems, sub: "unlocked", icon: BookOpenCheck, cls: "bg-amber-50 text-amber-600" },
  ];
  return <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map(s => { const Icon=s.icon; return <div key={s.label} className="rounded-[22px] border border-white bg-white/85 p-4 shadow-[0_10px_35px_rgba(60,50,120,0.07)] backdrop-blur"><div className="flex items-center gap-3"><div className={`grid h-11 w-11 place-items-center rounded-2xl ${s.cls}`}><Icon size={21}/></div><div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{s.label}</p><p className="mt-0.5 text-2xl font-black text-[#20234d]">{s.value}</p><p className="text-[10px] font-bold text-slate-400">{s.sub}</p></div></div></div>})}</section>;
}

function PremiumMonthCard({ month }: { month: MonthCard }) {
  const locked = month.status === "locked";
  const completed = month.status === "completed";
  const inProgress = month.status === "in-progress";
  const content = <article className={`group relative overflow-hidden rounded-[28px] border p-5 shadow-[0_12px_40px_rgba(60,50,120,0.07)] transition-all duration-300 sm:p-6 ${locked ? "border-slate-200/80 bg-white/65" : `${month.color} hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(70,55,150,0.13)]`}`}>
    <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/25 blur-2xl" />
    <div className="relative flex items-start justify-between gap-3"><div className={`grid h-14 w-14 place-items-center rounded-[20px] border border-white/70 text-3xl shadow-sm ${locked ? "bg-slate-100 grayscale" : month.iconBg}`}>{month.icon}</div><div className={`rounded-full px-2.5 py-1 text-[10px] font-black ${locked ? "bg-slate-100 text-slate-400" : completed ? "bg-emerald-100 text-emerald-700" : "bg-white/70 text-violet-700"}`}>{locked ? "🔒 Locked" : completed ? "✓ Completed" : "● Available"}</div></div>
    <div className="relative mt-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-500">Month {month.month}</p><h3 className="mt-1 text-2xl font-black tracking-tight text-[#20234d]">{month.title}</h3><p className="mt-2 min-h-12 text-sm font-medium leading-6 text-slate-500">{month.description}</p></div>
    <div className="relative mt-5 rounded-2xl border border-white/70 bg-white/55 p-3.5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-violet-600 shadow-sm"><CalendarDays size={17}/></div><div><p className="text-xs font-black text-[#2b2e58]">4 Weeks</p><p className="text-[10px] font-bold text-slate-400">Structured learning plan</p></div></div><span className="text-xs font-black text-violet-600">{month.unlockedWeeks}/4</span></div>{!locked ? <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{width:`${month.progress}%`}}/></div> : null}</div>
    <div className={`relative mt-4 flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black ${locked ? "bg-slate-200/80 text-slate-400" : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20"}`}>{locked ? "Locked" : inProgress ? `Continue · ${month.progress}%` : completed ? "View Completed Month" : `View Month ${month.month}`}{locked ? <LockKeyhole size={17}/> : <ChevronRight size={17}/>}</div>
  </article>;
  if (locked) return <div aria-disabled="true" title="This month has not been unlocked.">{content}</div>;
  return <Link href={`/learning-hub/${month.month}`} className="block">{content}</Link>;
}

function PremiumProgressStrip({ overallProgress, unlockedMonths, completedMonths }: { overallProgress: number; unlockedMonths: number; completedMonths: number }) {
  return <section className="mt-6 overflow-hidden rounded-[25px] border border-white bg-white/90 p-5 shadow-[0_12px_40px_rgba(60,50,120,0.07)]"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-600"><BarChart3 size={23}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-base font-black text-[#20234d]">Track Progress</h3><p className="text-xs font-medium text-slate-500">All completed activities are saved and reflected in your dashboard.</p></div><span className="text-xl font-black text-violet-600">{overallProgress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-50"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{width:`${overallProgress}%`}}/></div><div className="mt-2 flex gap-4 text-[10px] font-bold text-slate-400"><span>{unlockedMonths} months available</span><span>{completedMonths} completed</span></div></div><Link href="/dashboard" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-xs font-black text-violet-700 transition hover:bg-violet-100">Go to Dashboard <ArrowRight size={15}/></Link></div></section>;
}

function NoAccessHero() {
  return <section className="rounded-[32px] border border-white bg-white/90 p-7 shadow-[0_18px_60px_rgba(60,50,120,0.08)] sm:p-10"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-500"><LockKeyhole size={27}/></div><h2 className="mt-5 text-3xl font-black text-[#20234d]">Your Learning Hub is locked</h2><p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">Learning Hub access has not been activated for this account yet, or the subscription is outside its active period.</p><div className="mt-5 rounded-2xl bg-violet-50 p-4 text-sm font-bold text-slate-600">Please contact FD Arcadia admin to activate your subscribed Learning Hub package.</div></section>;
}

function LearningHubLoading() {
  return <main className="min-h-screen bg-[#f7f4ff] p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-[1500px] animate-pulse"><div className="h-16 w-72 rounded-2xl bg-white"/><div className="mt-6 h-72 rounded-[32px] bg-violet-100"/><div className="mt-5 grid gap-3 sm:grid-cols-4">{Array.from({length:4}).map((_,i)=><div key={i} className="h-24 rounded-2xl bg-white"/>)}</div><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="h-72 rounded-[28px] bg-white"/>)}</div></div></main>;
}
