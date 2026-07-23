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
    note: "Learning Hub + Math Activity + Draw & Learn + Sifir Deck + Freebies",
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

  async function loadProfiles() {
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });

    if (profileError) {
      setError(profileError.message);
      return;
    }

    setProfiles((data || []) as Profile[]);
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
      expired: profiles.filter((profile) => isExpired(profile.subscription_end))
        .length,
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
    <main className="min-h-screen bg-[#fbfaf7] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[290px_1fr]">
        <AdminSidebar adminEmail={adminEmail} />

        <section className="px-4 py-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black text-slate-500">
                Admin / Subscriptions /{" "}
                <span className="text-indigo-600">Parents</span>
              </p>
              <h1 className="mt-3 text-4xl font-black text-slate-950">
                Parent Subscriptions
              </h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Manage parent subscription and access to Learning Hub.
              </p>
            </div>

            <Link
              href="#subscription-list"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-black text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
            >
              + Add Subscription
            </Link>
          </div>

          <section className="mt-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
            <StatCard
              icon={Users}
              label="Total Parents"
              value={stats.total}
              note="All registered parents"
              tone="indigo"
            />
            <StatCard
              icon={ShieldCheck}
              label="Trial"
              value={stats.trial}
              note="Trial / Weekly"
              tone="green"
            />
            <StatCard
              icon={CalendarDays}
              label="Monthly"
              value={stats.monthly}
              note="Monthly package"
              tone="blue"
            />
            <StatCard
              icon={Sparkles}
              label="Premium"
              value={stats.premium}
              note="Premium / Full"
              tone="purple"
            />
            <StatCard
              icon={LockKeyhole}
              label="Expired"
              value={stats.expired}
              note="Subscription expired"
              tone="orange"
            />
          </section>

          <section className="mt-6 rounded-[1.5rem] border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
              <label className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white px-4 py-3">
                <Search size={20} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search parent name or email..."
                  className="w-full bg-transparent font-bold text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <select
                value={subscriptionFilter}
                onChange={(event) => setSubscriptionFilter(event.target.value)}
                className="rounded-xl border border-indigo-100 bg-white px-4 py-3 font-bold text-slate-700 outline-none"
              >
                <option value="all">All Subscription</option>
                {packageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-indigo-100 bg-white px-4 py-3 font-bold text-slate-700 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="no_package">No Package</option>
              </select>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[190px_1fr_120px_120px]">
              <select
                value={accessFilter}
                onChange={(event) => setAccessFilter(event.target.value)}
                className="rounded-xl border border-indigo-100 bg-white px-4 py-3 font-bold text-slate-700 outline-none"
              >
                <option value="all">All Access</option>
                <option value="unlocked">Has Access</option>
                <option value="locked">No Access</option>
              </select>

              <div className="hidden items-center gap-3 rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm font-bold text-slate-400 lg:flex">
                Start Date <span className="text-slate-700">to</span> End Date
                <CalendarDays className="ml-auto" size={18} />
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl bg-slate-100 px-4 py-3 font-black text-slate-600 transition hover:bg-slate-200"
              >
                Reset
              </button>

              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-4 py-3 font-black text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
              >
                Filter
              </button>
            </div>
          </section>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
              {error}
            </div>
          ) : null}

          <section
            id="subscription-list"
            className="mt-6 rounded-[1.5rem] border border-indigo-100 bg-white shadow-sm"
          >
            <div className="hidden grid-cols-[1.2fr_0.7fr_1fr_0.7fr_0.7fr_0.6fr] gap-4 border-b border-indigo-100 px-6 py-4 text-xs font-black uppercase tracking-[0.12em] text-indigo-800 xl:grid">
              <p>Parent</p>
              <p>Subscription</p>
              <p>Access</p>
              <p>Start Date</p>
              <p>End Date</p>
              <p>Actions</p>
            </div>

            <div className="divide-y divide-indigo-100">
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

            <div className="flex flex-col gap-4 px-6 py-5 text-sm font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing 1 to {filteredProfiles.length} of {profiles.length}{" "}
                results
              </p>
              <div className="flex items-center gap-2">
                {["‹", "1", "2", "3", "...", "›"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`grid h-9 min-w-9 place-items-center rounded-lg border px-3 ${
                      item === "1"
                        ? "border-indigo-600 text-indigo-700"
                        : "border-indigo-100 text-slate-500"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
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
    <aside className="hidden border-r border-indigo-100 bg-white p-6 xl:flex xl:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-xl bg-indigo-600 text-3xl shadow-lg shadow-indigo-100">
          👑
        </div>
        <div>
          <p className="text-2xl font-black tracking-wide text-slate-950">
            FD ARCADIA
          </p>
          <p className="text-sm font-black tracking-[0.18em] text-indigo-600">
            LEARNING HUB
          </p>
        </div>
      </Link>

      <nav className="mt-10 space-y-2 text-sm font-black text-slate-700">
        <SidebarLink href="/dashboard" icon={Home} label="Dashboard" />
        <SidebarLink href="/admin" icon={Users} label="Parents" active />
        <SidebarLink href="/children" icon={Users} label="Children" />

        <div className="pt-4">
          <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3 text-indigo-700">
            <span className="flex items-center gap-3">
              <FileText size={20} /> Learning Hub Content
            </span>
            <ChevronDown size={18} />
          </div>
          <div className="ml-7 mt-2 space-y-1 border-l border-indigo-100 pl-4">
            <Link
              href="/admin/calendar"
              className="block rounded-lg bg-indigo-50 px-4 py-2 text-indigo-700"
            >
              Week At A Glance
            </Link>
            <Link
              href="/admin/learning-hub"
              className="block rounded-lg px-4 py-2 hover:bg-slate-50"
            >
              All Content
            </Link>
            <Link
              href="/admin/freebies"
              className="block rounded-lg px-4 py-2 hover:bg-slate-50"
            >
              Categories
            </Link>
          </div>
        </div>

        <SidebarLink
          href="/admin"
          icon={CalendarDays}
          label="Subscriptions"
          active
        />
        <SidebarLink href="/admin/reports" icon={FileText} label="Reports" />
        <SidebarLink
          href="/admin/settings"
          icon={Settings}
          label="System Settings"
        />
      </nav>

      <div className="mt-auto rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-600 text-2xl">
          👑
        </div>
        <p className="mt-3 text-sm font-bold text-slate-700">
          You are logged in as
        </p>
        <p className="font-black text-slate-950">Admin</p>
        <p className="mt-2 break-words text-sm text-slate-600">{adminEmail}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white px-4 py-3 font-black text-indigo-700 transition hover:bg-indigo-50"
        >
          <LogOut size={18} /> Logout
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
      className={`flex items-center justify-between rounded-xl px-4 py-3 transition ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "hover:bg-slate-50 hover:text-indigo-700"
      }`}
    >
      <span className="flex items-center gap-3">
        <Icon size={20} /> {label}
      </span>
      {label === "Parents" || label === "Children" ? (
        <ArrowRight size={16} />
      ) : null}
    </Link>
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
    <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`grid h-14 w-14 place-items-center rounded-full ${toneClass}`}
        >
          <Icon size={28} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-600">{label}</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{note}</p>
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

  return (
    <div className="px-5 py-5 transition hover:bg-indigo-50/30">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.7fr_1fr_0.7fr_0.7fr_0.6fr] xl:items-center">
        <div className="flex items-center gap-4">
          <Avatar
            src={profile.avatar_url || null}
            name={profile.full_name || profile.email || "Parent"}
          />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black text-slate-950">
              {profile.full_name || "No name"}
            </h2>
            <p className="truncate text-sm font-bold text-slate-500">
              {profile.email || "No email"}
            </p>
            <p className="text-xs font-bold text-slate-400">
              {profile.user_type || "Not selected"}
            </p>
          </div>
        </div>

        <div>
          <span
            className={`inline-flex rounded-xl px-4 py-2 text-sm font-black ${getPackageBadgeStyle(profile.package_type)}`}
          >
            {formatPackageName(profile.package_type)}
          </span>
          {profile.package_note ? (
            <p className="mt-2 text-xs font-bold text-slate-500">
              {profile.package_note}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 text-sm font-bold text-slate-700">
          <AccessLine
            label="Learning Hub"
            active={profile.learning_hub_unlocked}
          />
          <AccessLine
            label="Custom Worksheet"
            active={profile.custom_worksheet_unlocked}
          />
          <AccessLine
            label="Flashcard & Modul"
            active={profile.flashcard_unlocked}
          />
        </div>

        <div className="text-sm font-bold text-slate-700">
          <p>{profile.subscription_start || "-"}</p>
        </div>

        <div className="text-sm font-bold text-slate-700">
          <p>{profile.subscription_end || "-"}</p>
          <p className={expired ? "text-red-600" : "text-emerald-600"}>
            {getDaysLeft(profile.subscription_end)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-black ${
              active
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${active ? "bg-emerald-600" : "bg-red-600"}`}
            />
            {active ? "Active" : "Expired"}
          </span>
          <button
            type="button"
            onClick={() => setEditing((current) => !current)}
            className="rounded-lg border border-indigo-300 px-4 py-2 font-black text-indigo-700 transition hover:bg-indigo-50"
          >
            Edit
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-indigo-100 text-slate-500 transition hover:bg-slate-50"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-indigo-700">
                Edit Subscription
              </h3>
              <p className="mt-1 text-sm font-bold text-slate-500">
                Choose package, toggle access and save manually after payment
                confirmation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl bg-slate-100 px-4 py-2 font-black text-slate-600"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AccessButton
              label="Learning Hub"
              active={profile.learning_hub_unlocked}
              onClick={() =>
                onToggle(
                  profile.id,
                  "learning_hub_unlocked",
                  profile.learning_hub_unlocked,
                )
              }
            />
            <AccessButton
              label="Math Activity"
              active={profile.math_activity_unlocked}
              onClick={() =>
                onToggle(
                  profile.id,
                  "math_activity_unlocked",
                  profile.math_activity_unlocked,
                )
              }
            />
            <AccessButton
              label="Draw & Learn"
              active={profile.draw_learn_unlocked}
              onClick={() =>
                onToggle(
                  profile.id,
                  "draw_learn_unlocked",
                  profile.draw_learn_unlocked,
                )
              }
            />
            <AccessButton
              label="Sifir Deck"
              active={profile.sifir_deck_unlocked}
              onClick={() =>
                onToggle(
                  profile.id,
                  "sifir_deck_unlocked",
                  profile.sifir_deck_unlocked,
                )
              }
            />
            <AccessButton
              label="Freebies"
              active={profile.freebies_unlocked}
              onClick={() =>
                onToggle(
                  profile.id,
                  "freebies_unlocked",
                  profile.freebies_unlocked,
                )
              }
            />
            <AccessButton
              label="Custom Worksheet"
              active={profile.custom_worksheet_unlocked}
              onClick={() =>
                onToggle(
                  profile.id,
                  "custom_worksheet_unlocked",
                  profile.custom_worksheet_unlocked,
                )
              }
            />
            <AccessButton
              label="Flashcard Page"
              active={profile.flashcard_unlocked}
              onClick={() =>
                onToggle(
                  profile.id,
                  "flashcard_unlocked",
                  profile.flashcard_unlocked,
                )
              }
            />
          </div>

          <div className="mt-5 rounded-2xl bg-indigo-50 p-4">
            <div className="flex items-center gap-2 text-indigo-700">
              <CalendarDays size={20} />
              <p className="font-black">Manual Package Unlock</p>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
              <select
                value={packageType}
                onChange={(event) => setPackageType(event.target.value)}
                className="rounded-xl border border-indigo-100 bg-white px-4 py-3 font-bold outline-none"
              >
                {packageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-xl border border-indigo-100 bg-white px-4 py-3 font-bold outline-none"
              />

              <button
                type="button"
                onClick={() => onSavePackage(profile, packageType, startDate)}
                className="rounded-xl bg-indigo-600 px-4 py-3 font-black text-white transition hover:bg-indigo-700"
              >
                Save Package
              </button>
            </div>

            <div className="mt-3 rounded-xl bg-white p-4 text-sm font-bold text-slate-600">
              <p>Package detail: {selectedPackage?.note}</p>
              <p>End date preview: {previewEndDate}</p>
            </div>

            <button
              type="button"
              onClick={() => onResetAccess(profile)}
              className="mt-4 rounded-xl bg-red-100 px-4 py-3 font-black text-red-700 transition hover:bg-red-200"
            >
              Reset / Lock All Access
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  return (
    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-indigo-100 text-xl font-black text-indigo-700">
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
      className={`flex items-center justify-between rounded-xl border px-4 py-4 text-left font-black transition ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      <span>{label}</span>
      {active ? <CheckCircle2 size={20} /> : <LockKeyhole size={20} />}
    </button>
  );
}
