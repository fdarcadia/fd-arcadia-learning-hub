"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileText,
  Gift,
  Home,
  LockKeyhole,
  LogOut,
  MoreVertical,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  UploadCloud,
  Users,
  XCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  user_type: string | null;
  avatar_url?: string | null;
  learning_hub_unlocked: boolean;
  custom_worksheet_unlocked: boolean;
  flashcard_unlocked: boolean;
  flashcard_modul_unlocked: boolean;
  math_activity_unlocked: boolean;
  draw_learn_unlocked: boolean;
  sifir_deck_unlocked: boolean;
  freebies_unlocked: boolean;
  package_type: string | null;
  package_note: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
};

type AccessField =
  | "learning_hub_unlocked"
  | "custom_worksheet_unlocked"
  | "flashcard_unlocked"
  | "flashcard_modul_unlocked"
  | "math_activity_unlocked"
  | "draw_learn_unlocked"
  | "sifir_deck_unlocked"
  | "freebies_unlocked";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

const packageOptions = [
  {
    value: "math_package",
    label: "Math Package RM25",
    days: 365,
    note: "Math Activity + Sifir Deck + Freebies",
  },
  {
    value: "learning_hub_weekly",
    label: "Learning Hub Weekly RM30",
    days: 7,
    note: "1 Week Learning Hub",
  },
  {
    value: "learning_hub_monthly",
    label: "Learning Hub Monthly RM50",
    months: 1,
    note: "1 Month Learning Hub",
  },
  {
    value: "learning_hub_6month",
    label: "Learning Hub 6 Months RM210",
    months: 6,
    note: "6 Months Learning Hub",
  },
  {
    value: "full_package",
    label: "Full Package RM250",
    months: 6,
    note: "Learning Hub + Math Activity + Draw & Learn + Sifir Deck + Freebies + Flashcard Library + Modul Membaca",
  },
  {
    value: "worksheet_trial",
    label: "Custom Worksheet Trial RM5",
    days: 365,
    note: "3 Activities",
  },
  {
    value: "worksheet_basic",
    label: "Custom Worksheet Basic RM15",
    days: 365,
    note: "7 Activities",
  },
  {
    value: "worksheet_standard",
    label: "Custom Worksheet Standard RM25",
    days: 365,
    note: "12 Activities",
  },
  {
    value: "worksheet_premium",
    label: "Custom Worksheet Premium RM39",
    days: 365,
    note: "18 Activities",
  },
];

function addDays(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function addMonths(dateString: string, months: number) {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function getEndDate(packageType: string, startDate: string) {
  const selectedPackage = packageOptions.find(
    (option) => option.value === packageType,
  );

  if (!selectedPackage) return startDate;

  if (selectedPackage.days) return addDays(startDate, selectedPackage.days);

  return addMonths(startDate, selectedPackage.months ?? 1);
}

function getPackageUnlocks(packageType: string) {
  const base = {
    learning_hub_unlocked: false,
    custom_worksheet_unlocked: false,
    flashcard_unlocked: false,
    flashcard_modul_unlocked: false,
    math_activity_unlocked: false,
    draw_learn_unlocked: false,
    sifir_deck_unlocked: false,
    freebies_unlocked: false,
  };

  switch (packageType) {
    case "math_package":
      return {
        ...base,
        math_activity_unlocked: true,
        sifir_deck_unlocked: true,
        freebies_unlocked: true,
      };

    case "learning_hub_weekly":
    case "learning_hub_monthly":
    case "learning_hub_6month":
      return {
        ...base,
        learning_hub_unlocked: true,
      };

    case "full_package":
      return {
        ...base,
        learning_hub_unlocked: true,
        math_activity_unlocked: true,
        draw_learn_unlocked: true,
        sifir_deck_unlocked: true,
        freebies_unlocked: true,
        flashcard_unlocked: true,
        flashcard_modul_unlocked: true,
      };

    case "worksheet_trial":
    case "worksheet_basic":
    case "worksheet_standard":
    case "worksheet_premium":
      return {
        ...base,
        custom_worksheet_unlocked: true,
      };

    default:
      return base;
  }
}

function formatPackageName(packageType: string | null) {
  if (!packageType) return "No Package";
  return (
    packageOptions.find((option) => option.value === packageType)?.label ||
    packageType.replaceAll("_", " ")
  );
}

function getPackageBadgeStyle(packageType: string | null) {
  if (!packageType) return "bg-slate-100 text-slate-600";
  if (
    packageType.includes("premium") ||
    packageType.includes("6month") ||
    packageType === "full_package"
  ) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (packageType.includes("monthly")) return "bg-blue-100 text-blue-700";
  if (packageType.includes("weekly") || packageType.includes("trial")) {
    return "bg-orange-100 text-orange-700";
  }
  return "bg-indigo-100 text-indigo-700";
}

function isExpired(endDate: string | null) {
  if (!endDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return endDate < today;
}

function getDaysLeft(endDate: string | null) {
  if (!endDate) return "-";
  const today = new Date();
  const end = new Date(endDate);
  const diff = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) return "Expired";
  if (diff === 0) return "Ends today";
  return `${diff} days left`;
}

export default function AdminPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <AdminContent adminEmail={user.email ?? ADMIN_EMAIL} />
        ) : (
          <>
            <Navbar />
            <main className="page-shell py-10">
              <h1 className="text-3xl font-bold text-red-600">Access denied</h1>
              <p className="mt-2 text-slate-600">
                Only FD Arcadia admin can open this page.
              </p>
            </main>
          </>
        )
      }
    </ProtectedPage>
  );
}

function AdminContent({ adminEmail }: { adminEmail: string }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProfiles() {
    setLoading(true);
    setError("");

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setProfiles((data || []) as Profile[]);
    setLoading(false);
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  const stats = useMemo(() => {
    return {
      total: profiles.length,
      trial: profiles.filter(
        (profile) =>
          String(profile.package_type || "").includes("trial") ||
          String(profile.package_type || "").includes("weekly"),
      ).length,
      monthly: profiles.filter((profile) =>
        String(profile.package_type || "").includes("monthly"),
      ).length,
      premium: profiles.filter(
        (profile) =>
          String(profile.package_type || "").includes("6month") ||
          profile.package_type === "full_package",
      ).length,
      active: profiles.filter(
        (profile) => Boolean(profile.package_type) && !isExpired(profile.subscription_end),
      ).length,
      expired: profiles.filter((profile) => isExpired(profile.subscription_end))
        .length,
      expiringSoon: profiles.filter((profile) => {
        if (!profile.subscription_end || isExpired(profile.subscription_end)) return false;
        const days = Math.ceil(
          (new Date(profile.subscription_end).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return days >= 0 && days <= 7;
      }).length,
    };
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    const keyword = search.toLowerCase();

    return profiles.filter((profile) => {
      const matchesKeyword =
        profile.email?.toLowerCase().includes(keyword) ||
        profile.full_name?.toLowerCase().includes(keyword) ||
        profile.user_type?.toLowerCase().includes(keyword) ||
        profile.package_type?.toLowerCase().includes(keyword);

      const matchesSubscription =
        subscriptionFilter === "all" ||
        profile.package_type === subscriptionFilter;

      const expired = isExpired(profile.subscription_end);
      const hasPackage = Boolean(profile.package_type);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && hasPackage && !expired) ||
        (statusFilter === "expired" && expired) ||
        (statusFilter === "no_package" && !hasPackage);

      const accessValues = [
        profile.learning_hub_unlocked,
        profile.custom_worksheet_unlocked,
        profile.flashcard_unlocked,
        profile.flashcard_modul_unlocked,
        profile.math_activity_unlocked,
        profile.draw_learn_unlocked,
        profile.sifir_deck_unlocked,
        profile.freebies_unlocked,
      ];

      const matchesAccess =
        accessFilter === "all" ||
        (accessFilter === "unlocked" && accessValues.some(Boolean)) ||
        (accessFilter === "locked" && accessValues.every((value) => !value));

      return (
        matchesKeyword && matchesSubscription && matchesStatus && matchesAccess
      );
    });
  }, [profiles, search, subscriptionFilter, statusFilter, accessFilter]);

  async function toggleAccess(
    id: string,
    field: AccessField,
    currentValue: boolean,
  ) {
    setError("");

    const nextValue = !Boolean(currentValue);

    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({ [field]: nextValue })
      .eq("id", id)
      .select()
      .single<Profile>();

    if (updateError || !data) {
      setError(updateError?.message ?? "Unable to update access.");
      return;
    }

    setProfiles((current) =>
      current.map((profile) => (profile.id === id ? data : profile)),
    );
  }

  async function savePackage(
    profile: Profile,
    packageType: string,
    startDate: string,
  ) {
    if (!startDate) {
      setError("Please choose package start date.");
      return;
    }

    const selectedPackage = packageOptions.find(
      (option) => option.value === packageType,
    );

    const endDate = getEndDate(packageType, startDate);
    const unlocks = getPackageUnlocks(packageType);

    const updatePayload = {
      package_type: packageType,
      package_note: selectedPackage?.note ?? "",
      subscription_start: startDate,
      subscription_end: endDate,
      ...unlocks,
    };

    const { data, error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", profile.id)
      .select()
      .single<Profile>();

    if (updateError || !data) {
      setError(updateError?.message ?? "Unable to save package.");
      return;
    }

    setProfiles((current) =>
      current.map((item) => (item.id === profile.id ? data : item)),
    );

    setError("");
  }

  async function resetAccess(profile: Profile) {
    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({
        package_type: null,
        package_note: null,
        subscription_start: null,
        subscription_end: null,
        learning_hub_unlocked: false,
        custom_worksheet_unlocked: false,
        flashcard_unlocked: false,
        flashcard_modul_unlocked: false,
        math_activity_unlocked: false,
        draw_learn_unlocked: false,
        sifir_deck_unlocked: false,
        freebies_unlocked: false,
      })
      .eq("id", profile.id)
      .select()
      .single<Profile>();

    if (updateError || !data) {
      setError(updateError?.message ?? "Unable to reset access.");
      return;
    }

    setProfiles((current) =>
      current.map((item) => (item.id === profile.id ? data : item)),
    );
  }

  function resetFilters() {
    setSearch("");
    setSubscriptionFilter("all");
    setStatusFilter("all");
    setAccessFilter("all");
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[255px_minmax(0,1fr)]">
        <AdminSidebar adminEmail={adminEmail} />

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
                Admin Workspace · Parent Management
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Parent Subscriptions
              </h1>
              <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-400">
                Manage packages, access permissions and subscription status from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadProfiles}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>

              <Link
                href="/admin/flashcard-modules/progress"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                <BookOpenCheck size={15} />
                Reading Progress
              </Link>
            </div>
          </header>

          {/* PREMIUM SUMMARY */}
          <section className="relative mt-5 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#111735] via-[#25265f] to-[#5145a6] p-5 text-white shadow-[0_20px_55px_rgba(15,23,42,0.16)] sm:p-6">
            <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-violet-200">
                    <Users size={21} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                      Parent Control Centre
                    </p>
                    <h2 className="mt-1 text-2xl font-black">
                      {stats.total} registered parents
                    </h2>
                  </div>
                </div>
                <p className="mt-3 max-w-xl text-xs leading-5 text-slate-300">
                  Quickly spot active subscriptions, expiring accounts and parents who need access updates.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <MiniStat label="Active" value={stats.active} tone="emerald" />
                <MiniStat label="Premium" value={stats.premium} tone="violet" />
                <MiniStat label="Expiring ≤7d" value={stats.expiringSoon} tone="amber" />
                <MiniStat label="Expired" value={stats.expired} tone="rose" />
              </div>
            </div>
          </section>

          {/* COLOURFUL STATS */}
          <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            <StatCard icon={Users} label="Total Parents" value={stats.total} note="Registered accounts" tone="indigo" />
            <StatCard icon={ShieldCheck} label="Trial / Weekly" value={stats.trial} note="Short-term access" tone="green" />
            <StatCard icon={CalendarDays} label="Monthly" value={stats.monthly} note="Monthly package" tone="blue" />
            <StatCard icon={Sparkles} label="Premium" value={stats.premium} note="6 months / full" tone="purple" />
            <StatCard icon={LockKeyhole} label="Expired" value={stats.expired} note="Needs review" tone="orange" />
          </section>

          {/* SMART FILTERS */}
          <section className="mt-5 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_220px_170px_160px_auto]">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <Search size={16} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search parent, email or package..."
                  className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <select
                value={subscriptionFilter}
                onChange={(event) => setSubscriptionFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">All Packages</option>
                {packageOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="no_package">No Package</option>
              </select>

              <select
                value={accessFilter}
                onChange={(event) => setAccessFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">All Access</option>
                <option value="unlocked">Has Access</option>
                <option value="locked">No Access</option>
              </select>

              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-200"
              >
                Reset
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setStatusFilter("active")} className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">
                  Active {stats.active}
                </button>
                <button type="button" onClick={() => setSubscriptionFilter("full_package")} className="rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-black text-violet-700">
                  Full Package
                </button>
                <button type="button" onClick={() => setStatusFilter("expired")} className="rounded-full bg-rose-50 px-3 py-1.5 text-[10px] font-black text-rose-700">
                  Expired {stats.expired}
                </button>
              </div>

              <p className="text-[10px] font-black text-slate-400">
                Showing {filteredProfiles.length} of {profiles.length} parents
              </p>
            </div>
          </section>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
              {error}
            </div>
          ) : null}

          {/* PARENT LIST */}
          <section id="subscription-list" className="mt-5 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Parent Directory
                </p>
                <h2 className="mt-1 text-lg font-black text-slate-950">
                  Manage Access & Packages
                </h2>
              </div>
              <div className="hidden rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-black text-indigo-700 sm:block">
                Live Supabase Data
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm font-bold text-slate-400">
                Loading parent accounts...
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="p-10 text-center">
                <Users className="mx-auto text-slate-300" size={34} />
                <p className="mt-3 text-sm font-black text-slate-700">No parents found</p>
                <p className="mt-1 text-xs text-slate-400">Try changing your search or filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredProfiles.map((profile) => (
                  <UserCard
                    key={profile.id}
                    profile={profile}
                    onToggle={toggleAccess}
                    onSavePackage={savePackage}
                    onResetAccess={resetAccess}
                  />
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-4 py-6 text-white xl:flex xl:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <ShieldCheck size={21} />
        </div>
        <div>
          <p className="text-sm font-black tracking-[0.08em]">FD ARCADIA</p>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-300">ADMIN</p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1.5">
        <SidebarLink href="/dashboard" icon={Home} label="Dashboard" />
        <SidebarLink href="/admin" icon={Users} label="Parents" active />
        <SidebarLink href="/admin/flashcard-modules/progress" icon={BookOpenCheck} label="Reading Progress" />
        <SidebarLink href="/children" icon={Users} label="Children" />

        <p className="px-3 pb-1 pt-5 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
          Content
        </p>
        <SidebarLink href="/admin/calendar" icon={CalendarDays} label="Week At A Glance" />
        <SidebarLink href="/admin/learning-hub" icon={BookOpen} label="Learning Hub" />
        <SidebarLink href="/admin/freebies" icon={Gift} label="Freebies" />

        <p className="px-3 pb-1 pt-5 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
          System
        </p>
        <SidebarLink href="/admin/reports" icon={FileText} label="Reports" />
        <SidebarLink href="/admin/settings" icon={Settings} label="Settings" />
      </nav>

      <div className="mt-auto rounded-[20px] border border-violet-400/20 bg-white/[0.05] p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/20 text-violet-200">
            <ShieldCheck size={17} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-violet-300">Administrator</p>
            <p className="truncate text-[10px] font-bold text-slate-300">{adminEmail}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-xs font-black text-slate-200 transition hover:bg-white/[0.1]"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-xl px-3 py-3 text-xs font-black transition ${
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <span className="flex items-center gap-3">
        <Icon size={18} /> {label}
      </span>
      {label === "Parents" || label === "Children" ? (
        <ArrowRight size={16} />
      ) : null}
    </Link>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "violet" | "amber" | "rose";
}) {
  const toneClass = {
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-200",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  }[tone];

  return (
    <div className={`min-w-[105px] rounded-2xl border px-3 py-3 ${toneClass}`}>
      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em]">
        {label}
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  note: string;
  tone: "indigo" | "green" | "blue" | "purple" | "orange";
}) {
  const toneClass = {
    indigo: "bg-indigo-100 text-indigo-700",
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
  }[tone];

  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-500">{label}</p>
          <div className="mt-0.5 flex items-end gap-2">
            <p className="text-2xl font-black text-slate-950">{value}</p>
            <p className="pb-1 text-[9px] font-bold text-slate-400">{note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserCard({
  profile,
  onToggle,
  onSavePackage,
  onResetAccess,
}: {
  profile: Profile;
  onToggle: (id: string, field: AccessField, currentValue: boolean) => void;
  onSavePackage: (
    profile: Profile,
    packageType: string,
    startDate: string,
  ) => void;
  onResetAccess: (profile: Profile) => void;
}) {
  const [packageType, setPackageType] = useState(
    profile.package_type || "math_package",
  );
  const [startDate, setStartDate] = useState(
    profile.subscription_start || new Date().toISOString().slice(0, 10),
  );
  const [editing, setEditing] = useState(false);

  const selectedPackage = packageOptions.find(
    (option) => option.value === packageType,
  );

  const previewEndDate = startDate ? getEndDate(packageType, startDate) : "-";
  const expired = isExpired(profile.subscription_end);
  const active = Boolean(profile.package_type) && !expired;

  const accessValues = [
    profile.learning_hub_unlocked,
    profile.custom_worksheet_unlocked,
    profile.flashcard_unlocked,
    profile.flashcard_modul_unlocked,
    profile.math_activity_unlocked,
    profile.draw_learn_unlocked,
    profile.sifir_deck_unlocked,
    profile.freebies_unlocked,
  ];
  const accessCount = accessValues.filter(Boolean).length;

  return (
    <article className="px-4 py-4 transition hover:bg-slate-50/70 sm:px-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(230px,1.25fr)_minmax(170px,.8fr)_130px_135px_170px] xl:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={profile.avatar_url || null} name={profile.full_name || profile.email || "Parent"} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-black text-slate-950">
                {profile.full_name || "No name"}
              </h3>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black uppercase text-slate-500">
                {profile.user_type || "Parent"}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">
              {profile.email || "No email"}
            </p>
          </div>
        </div>

        <div>
          <span className={`inline-flex rounded-full px-3 py-1.5 text-[9px] font-black ${getPackageBadgeStyle(profile.package_type)}`}>
            {formatPackageName(profile.package_type)}
          </span>
          <p className="mt-1 line-clamp-1 text-[9px] font-semibold text-slate-400">
            {profile.package_note || "No package assigned"}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between text-[9px] font-black text-slate-500">
            <span>Access</span>
            <span>{accessCount}/8</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              style={{ width: `${(accessCount / 8) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-[10px] font-bold text-slate-500">
          <p>{profile.subscription_end || "No end date"}</p>
          <p className={`mt-1 font-black ${expired ? "text-rose-600" : "text-emerald-600"}`}>
            {getDaysLeft(profile.subscription_end)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 xl:justify-end">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-black ${
            active ? "bg-emerald-50 text-emerald-700" : profile.package_type ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-500"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : profile.package_type ? "bg-rose-500" : "bg-slate-400"}`} />
            {active ? "Active" : profile.package_type ? "Expired" : "No Package"}
          </span>

          <button
            type="button"
            onClick={() => setEditing((current) => !current)}
            className={`rounded-xl px-3 py-2 text-[10px] font-black transition ${
              editing
                ? "bg-violet-100 text-violet-700"
                : "bg-slate-950 text-white hover:bg-slate-800"
            }`}
          >
            {editing ? "Close" : "Manage"}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 overflow-hidden rounded-[20px] border border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-indigo-50/60">
          <div className="flex flex-col gap-3 border-b border-violet-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-500">
                Access Control
              </p>
              <h4 className="mt-1 text-base font-black text-slate-950">
                Manage {profile.full_name || "Parent"}
              </h4>
            </div>
            <div className="rounded-full bg-white px-3 py-1.5 text-[9px] font-black text-violet-700 shadow-sm">
              {accessCount} of 8 features unlocked
            </div>
          </div>

          <div className="p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <AccessButton label="Learning Hub" active={profile.learning_hub_unlocked} onClick={() => onToggle(profile.id, "learning_hub_unlocked", profile.learning_hub_unlocked)} />
              <AccessButton label="Math Activity" active={profile.math_activity_unlocked} onClick={() => onToggle(profile.id, "math_activity_unlocked", profile.math_activity_unlocked)} />
              <AccessButton label="Draw & Learn" active={profile.draw_learn_unlocked} onClick={() => onToggle(profile.id, "draw_learn_unlocked", profile.draw_learn_unlocked)} />
              <AccessButton label="Sifir Deck" active={profile.sifir_deck_unlocked} onClick={() => onToggle(profile.id, "sifir_deck_unlocked", profile.sifir_deck_unlocked)} />
              <AccessButton label="Freebies" active={profile.freebies_unlocked} onClick={() => onToggle(profile.id, "freebies_unlocked", profile.freebies_unlocked)} />
              <AccessButton label="Custom Worksheet" active={profile.custom_worksheet_unlocked} onClick={() => onToggle(profile.id, "custom_worksheet_unlocked", profile.custom_worksheet_unlocked)} />
              <AccessButton label="Flashcard Library" active={profile.flashcard_unlocked} onClick={() => onToggle(profile.id, "flashcard_unlocked", profile.flashcard_unlocked)} />
              <AccessButton label="Modul Membaca" active={profile.flashcard_modul_unlocked} onClick={() => onToggle(profile.id, "flashcard_modul_unlocked", profile.flashcard_modul_unlocked)} />
            </div>

            <div className="mt-4 grid gap-3 rounded-[18px] border border-slate-200 bg-white p-4 lg:grid-cols-[minmax(240px,1fr)_170px_150px]">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                  Package
                </label>
                <select
                  value={packageType}
                  onChange={(event) => setPackageType(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
                >
                  {packageOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => onSavePackage(profile, packageType, startDate)}
                className="self-end rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:opacity-90"
              >
                Save Package
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-3 rounded-[16px] bg-slate-950 px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[10px]">
                <p className="font-black text-violet-300">{selectedPackage?.note}</p>
                <p className="mt-1 text-slate-400">End date preview: {previewEndDate}</p>
              </div>

              <button
                type="button"
                onClick={() => onResetAccess(profile)}
                className="shrink-0 rounded-xl bg-rose-500/15 px-3 py-2 text-[10px] font-black text-rose-300 transition hover:bg-rose-500/25"
              >
                Reset & Lock All
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-black text-indigo-700 ring-2 ring-white shadow-sm">
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </div>
  );
}

function AccessLine({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {active ? (
        <CheckCircle2 className="text-emerald-600" size={16} />
      ) : (
        <XCircle className="text-red-500" size={16} />
      )}
      <span>{label}</span>
    </div>
  );
}

function AccessButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left text-[10px] font-black transition ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
          : "border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:bg-violet-50/40"
      }`}
    >
      <span>{label}</span>
      {active ? <CheckCircle2 size={16} /> : <LockKeyhole size={15} />}
    </button>
  );
}