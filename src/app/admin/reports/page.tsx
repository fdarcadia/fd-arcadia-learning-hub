"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  FileText,
  Gift,
  Home,
  Layers3,
  LockKeyhole,
  Search,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  user_type: string | null;
  learning_hub_unlocked: boolean;
  custom_worksheet_unlocked: boolean;
  flashcard_modul_unlocked: boolean;
  package_type: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
};

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

export default function AdminReportsPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <ReportsContent />
        ) : (
          <>
            <Navbar />
            <main className="page-shell py-10">
              <h1 className="text-3xl font-bold text-red-600">Access denied</h1>
            </main>
          </>
        )
      }
    </ProtectedPage>
  );
}

function ReportsContent() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
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

    loadProfiles();
  }, []);

  const filteredProfiles = useMemo(() => {
    const keyword = search.toLowerCase();

    return profiles.filter((profile) => {
      return (
        profile.full_name?.toLowerCase().includes(keyword) ||
        profile.email?.toLowerCase().includes(keyword) ||
        profile.user_type?.toLowerCase().includes(keyword) ||
        profile.package_type?.toLowerCase().includes(keyword)
      );
    });
  }, [profiles, search]);

  const totalParents = profiles.length;
  const learningHubCount = profiles.filter(
    (profile) => profile.learning_hub_unlocked
  ).length;
  const customWorksheetCount = profiles.filter(
    (profile) => profile.custom_worksheet_unlocked
  ).length;
  const flashcardCount = profiles.filter(
    (profile) => profile.flashcard_modul_unlocked
  ).length;

  const activePackageCount = profiles.filter(
    (profile) => Boolean(profile.package_type)
  ).length;

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[250px_minmax(0,1fr)]">
        <ReportsSidebar />

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
                Admin Reports
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Parent Reports
              </h1>

              <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-400">
                View parent profiles, package status and learning access from one
                premium overview.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={15} />
                Manage Users
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                Dashboard
              </Link>
            </div>
          </header>

          <section className="relative mt-5 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#111735] via-[#25265f] to-[#5145a6] p-5 text-white shadow-[0_20px_55px_rgba(15,23,42,0.16)] sm:p-6">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />

            <div className="relative grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-yellow-300">
                  <BarChart3 size={21} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                    Parent Analytics
                  </p>

                  <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                    See every parent account clearly.
                  </h2>

                  <p className="mt-2 max-w-xl text-xs leading-5 text-slate-300">
                    Track parent access, subscriptions and learning modules without
                    opening each account separately.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <HeroStat label="Parents" value={totalParents} />
                <HeroStat label="Packages" value={activePackageCount} />
                <HeroStat label="Learning Hub" value={learningHubCount} />
                <HeroStat label="Flashcard" value={flashcardCount} />
              </div>
            </div>
          </section>

          <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Parents"
              value={totalParents}
              icon={Users}
              tone="violet"
              note="Registered profiles"
            />

            <StatCard
              title="Learning Hub"
              value={learningHubCount}
              icon={BookOpenCheck}
              tone="amber"
              note="Unlocked accounts"
            />

            <StatCard
              title="Custom Worksheet"
              value={customWorksheetCount}
              icon={FileText}
              tone="rose"
              note="Unlocked accounts"
            />

            <StatCard
              title="Flashcard"
              value={flashcardCount}
              icon={Layers3}
              tone="sky"
              note="Unlocked accounts"
            />
          </section>

          <section className="mt-5 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Parent Directory
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Search & Review
                </h2>
              </div>

              <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 lg:max-w-md">
                <Search className="text-slate-400" size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email, package or user type..."
                  className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
            </div>

            <div className="mt-3 border-t border-slate-100 pt-3 text-[10px] font-black text-slate-400">
              Showing {filteredProfiles.length} of {profiles.length} parent profiles
            </div>
          </section>

          {error ? (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
              {error}
            </div>
          ) : null}

          <section className="mt-5 grid gap-4">
            {filteredProfiles.map((profile) => (
              <ParentReportCard key={profile.id} profile={profile} />
            ))}

            {filteredProfiles.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                <Users className="mx-auto text-slate-300" size={34} />
                <h2 className="mt-3 text-lg font-black text-slate-700">
                  No parent profile found.
                </h2>
              </div>
            ) : null}
          </section>

          <footer className="mt-6 border-t border-slate-200 py-5 text-center text-[10px] font-semibold text-slate-400">
            FD Arcadia Admin Reports
          </footer>
        </section>
      </div>
    </main>
  );
}

function ReportsSidebar() {
  return (
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-4 py-6 text-white xl:flex xl:flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <Sparkles size={20} />
        </div>

        <div>
          <p className="text-sm font-black tracking-[0.08em]">FD ARCADIA</p>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-300">
            ADMIN PORTAL
          </p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1.5 text-xs font-black">
        <SidebarItem href="/dashboard" icon={Home} label="Dashboard" />
        <SidebarItem href="/admin" icon={Users} label="Parent Manage" />
        <SidebarItem href="/children" icon={Users} label="Children Manage" />
        <SidebarItem href="/admin/calendar" icon={CalendarDays} label="Calendar Diary" />
        <SidebarItem href="/admin/learning-hub" icon={BookOpen} label="Learning Hub" />
        <SidebarItem href="/admin/freebies" icon={Gift} label="Freebies" />
        <SidebarItem href="/admin/reports" icon={BarChart3} label="Reports" active />
        <SidebarItem href="/admin/settings" icon={Settings} label="Settings" />
      </nav>

      <div className="mt-auto rounded-[20px] border border-violet-400/20 bg-gradient-to-br from-violet-600/35 to-indigo-500/15 p-4">
        <BarChart3 className="text-yellow-300" size={18} />
        <p className="mt-3 text-xs font-black">Reports Overview</p>
        <p className="mt-1 text-[10px] leading-5 text-indigo-200">
          Review access and package status across parent accounts.
        </p>
      </div>
    </aside>
  );
}

function SidebarItem({
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
      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <Icon size={17} />
      {label}
    </Link>
  );
}

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-[105px] rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-center">
      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  tone,
  note,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  tone: "violet" | "amber" | "rose" | "sky";
  note: string;
}) {
  const toneClass = {
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    sky: "bg-sky-50 text-sky-700 border-sky-100",
  }[tone];

  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl border ${toneClass}`}>
          <Icon size={18} />
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-500">{title}</p>
          <p className="mt-0.5 text-2xl font-black text-slate-950">{value}</p>
          <p className="text-[9px] font-semibold text-slate-400">{note}</p>
        </div>
      </div>
    </div>
  );
}

function ParentReportCard({ profile }: { profile: Profile }) {
  const accessCount = [
    profile.learning_hub_unlocked,
    profile.custom_worksheet_unlocked,
    profile.flashcard_modul_unlocked,
  ].filter(Boolean).length;

  return (
    <article className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(240px,1.2fr)_minmax(180px,.8fr)_minmax(260px,1fr)] xl:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-sm font-black text-violet-700">
              {(profile.full_name || profile.email || "P")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-black text-slate-950">
                {profile.full_name || "No name"}
              </h2>
              <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">
                {profile.email || "No email"}
              </p>
              <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-black uppercase text-slate-500">
                {profile.user_type || "Not selected"}
              </span>
            </div>
          </div>
        </div>

        <div>
          <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-[9px] font-black text-amber-700">
            {profile.package_type
              ? profile.package_type.replaceAll("_", " ").toUpperCase()
              : "NO PACKAGE"}
          </span>

          <div className="mt-3 grid gap-1 text-[10px] font-semibold text-slate-500">
            <p>
              Start:{" "}
              <span className="font-black text-slate-700">
                {profile.subscription_start || "-"}
              </span>
            </p>
            <p>
              End:{" "}
              <span className="font-black text-slate-700">
                {profile.subscription_end || "-"}
              </span>
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                Learning Access
              </p>
              <p className="mt-1 text-xs font-black text-slate-700">
                {accessCount}/3 modules unlocked
              </p>
            </div>

            <div className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-black text-indigo-700">
              {Math.round((accessCount / 3) * 100)}%
            </div>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
              style={{ width: `${(accessCount / 3) * 100}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <AccessBadge
              label="Learning Hub"
              active={profile.learning_hub_unlocked}
            />
            <AccessBadge
              label="Custom Worksheet"
              active={profile.custom_worksheet_unlocked}
            />
            <AccessBadge
              label="Flashcard"
              active={profile.flashcard_modul_unlocked}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function AccessBadge({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-black ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {active ? <CheckCircle2 size={12} /> : <LockKeyhole size={12} />}
      {label}
    </span>
  );
}