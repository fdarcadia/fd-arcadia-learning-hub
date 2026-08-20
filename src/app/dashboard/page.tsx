"use client";

import { PortalShell } from "@/components/PortalShell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  BookOpenCheck,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Crown,
  FileText,
  Gift,
  Home,
  LockKeyhole,
  LogOut,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UploadCloud,
  UserRound,
  Users,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { type Profile, supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";
const WHATSAPP_NUMBER = "601140731757";

type DashboardProfile = Profile & {
  flashcard_unlocked?: boolean;
  flashcard_modul_unlocked?: boolean;
  math_activity_unlocked?: boolean;
  draw_learn_unlocked?: boolean;
  sifir_deck_unlocked?: boolean;
  freebies_unlocked?: boolean;
  huruf_membaca_unlocked?: boolean;
};

type ParentAccessField =
  | "learning_hub_unlocked"
  | "custom_worksheet_unlocked"
  | "math_activity_unlocked"
  | "draw_learn_unlocked"
  | "sifir_deck_unlocked"
  | "freebies_unlocked"
  | "flashcard_unlocked"
  | "flashcard_modul_unlocked"
  | "huruf_membaca_unlocked";

type ChildProfile = {
  id: string;
  name?: string | null;
  child_name?: string | null;
  full_name?: string | null;
  age?: number | null;
  level?: string | null;
  grade?: string | null;
  school?: string | null;
  avatar_url?: string | null;
  avatar_character?: string | null;
  avatar_skin?: string | null;
};

type ReadingModuleRow = {
  id: string;
  title: string;
  total_pages: number | null;
  display_order: number | null;
  is_active: boolean;
};

type ReadingProgressRow = {
  module_id: string;
  last_page: number | null;
  highest_page: number | null;
  progress_percent: number | null;
  last_opened_at: string | null;
  completed_at: string | null;
};

type ReadingModuleSummary = {
  moduleId: string;
  title: string;
  totalPages: number;
  lastPage: number;
  highestPage: number;
  progressPercent: number;
  lastOpenedAt: string | null;
  completed: boolean;
};

type AvatarAction = "idle" | "sit" | "dance" | "wave" | "clap" | "jump";

const packageLabels: Record<string, string> = {
  math_package: "Math Package RM25",
  learning_hub_weekly: "Learning Hub Weekly RM30",
  learning_hub_monthly: "Learning Hub Monthly RM50",
  learning_hub_6month: "Learning Hub Premium RM210",
  full_package: "Full Package RM250",
  modul_membaca: "Modul Membaca RM45",
  worksheet_trial: "Worksheet Trial RM5",
  worksheet_basic: "Worksheet Basic RM15",
  worksheet_standard: "Worksheet Standard RM25",
  worksheet_premium: "Worksheet Premium RM39",
};

const subjectTabs = [
  { title: "Warm Up", icon: "☀️", progress: 80 },
  { title: "Math", icon: "🔢", progress: 75 },
  { title: "Science", icon: "🧪", progress: 60 },
  { title: "Reading", icon: "📖", progress: 70 },
  { title: "Membaca", icon: "📚", progress: 65 },
];

const weeklyTopics = [
  {
    week: "Week 1",
    status: "Completed",
    title: "Let's Get Started!",
    description: "Getting to know routine and classroom rules.",
    time: "9:00 AM",
    image: "👦",
  },
  {
    week: "Week 2",
    status: "Completed",
    title: "My Body, My Health",
    description: "Learn about body parts and staying healthy.",
    time: "9:15 AM",
    image: "👧",
  },
  {
    week: "Week 3",
    status: "In Progress",
    title: "Feelings & Emotions",
    description: "Understanding and expressing feelings.",
    time: "9:10 AM",
    image: "😊",
  },
  {
    week: "Week 4",
    status: "Upcoming",
    title: "Good Habits",
    description: "Building good daily habits together.",
    time: "-",
    image: "🪥",
  },
];

const dailySchedule = [
  { time: "9:00 AM", title: "Warm Up", icon: "☀️" },
  { time: "9:30 AM", title: "Reading", icon: "📖" },
  { time: "10:00 AM", title: "Math", icon: "🔢" },
  { time: "11:00 AM", title: "Science", icon: "🧪" },
  { time: "12:00 PM", title: "Membaca", icon: "📚" },
];

const moduleCards: {
  title: string;
  href: string;
  field: ParentAccessField | null;
  icon: React.ElementType;
  description: string;
  packageGroup: "learning_hub" | "custom_worksheet" | "flashcard" | "reading" | "math" | "free";
}[] = [
  {
    title: "Learning Hub",
    href: "/learning-hub",
    field: "learning_hub_unlocked",
    icon: BookOpenCheck,
    description: "Monthly schedules, weekly activities and downloads.",
    packageGroup: "learning_hub",
  },
  {
    title: "Math Activity",
    href: "/math-activity",
    field: "math_activity_unlocked",
    icon: Calculator,
    description: "Practice tambah, tolak, darab and bahagi.",
    packageGroup: "math",
  },
  {
    title: "Flashcard Library",
    href: "/flashcard-library",
    field: "flashcard_unlocked",
    icon: BookOpen,
    description: "Digital flashcard books to view online and download.",
    packageGroup: "flashcard",
  },
  {
    title: "Modul Membaca",
    href: "/flashcard-modules",
    field: "flashcard_modul_unlocked",
    icon: BookOpenCheck,
    description: "Interactive flipbooks with writing tools, auto save and reading progress.",
    packageGroup: "reading",
  },
  {
    title: "Huruf & Membaca",
    href: "/huruf-membaca",
    field: "huruf_membaca_unlocked",
    icon: BookOpenCheck,
    description: "Interactive letter, phonics and Bahasa Melayu reading games.",
    packageGroup: "reading",
  },
  {
    title: "Sifir Deck",
    href: "/sifir-deck",
    field: "sifir_deck_unlocked",
    icon: Star,
    description: "Practice multiplication using premium card and keypad game.",
    packageGroup: "math",
  },
  {
    title: "Draw & Learn",
    href: "/worksheet",
    field: "draw_learn_unlocked",
    icon: Palette,
    description: "Interactive worksheet canvas for children.",
    packageGroup: "custom_worksheet",
  },
  {
    title: "Freebies",
    href: "/freebies",
    field: "freebies_unlocked",
    icon: Gift,
    description: "Free worksheets, flashcards, trackers and printable activities.",
    packageGroup: "free",
  },
  {
    title: "Custom Worksheet",
    href: "/custom-worksheet",
    field: "custom_worksheet_unlocked",
    icon: FileText,
    description: "Download custom worksheets by subject.",
    packageGroup: "custom_worksheet",
  },
];

const adminCards = [
  {
    title: "Manage Parents",
    href: "/admin",
    icon: Users,
    description: "Manage subscriptions, access and parent accounts.",
    badge: "Users",
    tone: "indigo",
  },
  {
    title: "Learning Hub",
    href: "/admin/learning-hub",
    icon: BookOpenCheck,
    description: "Upload weekly learning content, activities and resources.",
    badge: "Content",
    tone: "blue",
  },
  {
    title: "Modul Membaca",
    href: "/admin/flashcard-modules",
    icon: BookOpenCheck,
    description: "Upload, arrange and publish image-based interactive reading modules.",
    badge: "3 Books",
    tone: "violet",
  },
  {
    title: "Reading Progress",
    href: "/admin/flashcard-modules/progress",
    icon: BarChart3,
    description: "Monitor parent reading progress, last page and module completion.",
    badge: "Analytics",
    tone: "sky",
  },
  {
    title: "Flashcard Library",
    href: "/admin/flashcard-library",
    icon: BookOpen,
    description: "Manage flashcard books, Canva links and PDF resources.",
    badge: "Library",
    tone: "cyan",
  },
  {
    title: "Worksheet Upload",
    href: "/admin/custom-worksheet",
    icon: UploadCloud,
    description: "Upload custom worksheet resources by subject.",
    badge: "Worksheet",
    tone: "pink",
  },
  {
  title: "Huruf & Membaca",
  href: "/admin/huruf-membaca",
  icon: BookOpenCheck,
  description: "Create, edit and organise letter, phonics and reading activities.",
  badge: "Reading Game",
  tone: "violet",
},
  {
    title: "Bina Perkataan",
    href: "/admin/huruf-membaca/bina-perkataan",
    icon: BookOpenCheck,
    description: "Manage 30 KVKV word-building questions and upload picture clues.",
    badge: "KVKV",
    tone: "cyan",
  },
  {
    title: "Math Activity",
    href: "/admin/math-activity",
    icon: Calculator,
    description: "Create and manage interactive mathematics activities.",
    badge: "Math",
    tone: "emerald",
  },
  {
    title: "Sifir Deck",
    href: "/admin/sifir-deck",
    icon: Star,
    description: "Create multiplication card decks and question sets.",
    badge: "Practice",
    tone: "amber",
  },
  {
    title: "Monthly Calendar",
    href: "/admin/calendar",
    icon: CalendarDays,
    description: "Manage monthly dates, schedule and learning calendar.",
    badge: "Schedule",
    tone: "orange",
  },
  {
    title: "Freebies",
    href: "/admin/freebies",
    icon: Gift,
    description: "Upload and organise free parent learning resources.",
    badge: "Resources",
    tone: "rose",
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    description: "Review parent access, profiles and activity reports.",
    badge: "Insights",
    tone: "sky",
  },
] as const;

export default function DashboardPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <PortalShell role="admin">
            <AdminDashboard email={user.email ?? ""} />
          </PortalShell>
        ) : (
          <ParentDashboard userId={user.id} />
        )
      }
    </ProtectedPage>
  );
}

function AdminDashboard({ email }: { email: string }) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-indigo-500">
                FD Arcadia Control Centre
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm font-semibold text-slate-400">
                Manage content, access and parent-facing resources.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 sm:block">
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Signed in as
                </p>
                <p className="mt-0.5 text-xs font-black text-slate-700">{email}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-black text-red-600 transition hover:bg-red-100"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          <section className="relative mt-5 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#10162f] via-[#24255b] to-[#171c42] px-6 py-6 text-white shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/10 text-yellow-300">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                      Administration Portal
                    </p>
                    <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                      Everything you need, in one place.
                    </h2>
                  </div>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                  Manage parent access, reading modules, worksheets, flashcards,
                  activities, schedules and reports without a crowded interface.
                </p>
              </div>

              <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.06]">
                <AdminHeroStat value={String(adminCards.length)} label="Managers" />
                <AdminHeroStat value="Active" label="Portal" />
                <AdminHeroStat value="Live" label="Parent View" />
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
                  Management Suite
                </p>
                <h2 className="mt-1 text-2xl font-black">Manage FD Arcadia</h2>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  Choose a management area to continue.
                </p>
              </div>

              <Link
                href="/admin"
                className="inline-flex self-start items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800 sm:self-auto"
              >
                <Users size={15} />
                Manage Parents
              </Link>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {adminCards.map((card) => (
                <PremiumAdminCard key={card.title} {...card} />
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Parent Portal Preview
                </p>
                <h2 className="mt-1 text-xl font-black">Quick Preview</h2>
              </div>

              <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:max-w-[720px] lg:grid-cols-4">
                <PreviewCard href="/learning-hub" icon={BookOpenCheck} title="Learning Hub" description="Weekly content." />
                <PreviewCard href="/flashcard-modules" icon={BookOpen} title="Modul Membaca" description="Reading modules." />
                <PreviewCard href="/flashcard-library" icon={BookOpen} title="Flashcards" description="Digital library." />
                <PreviewCard href="/custom-worksheet" icon={FileText} title="Worksheet" description="Assigned files." />
              </div>
            </div>
          </section>
      </section>
    </main>
  );
}

function ParentHeroMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-4 text-center backdrop-blur">
      <div className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white">
        <Icon size={17} />
      </div>
      <p className="mt-2 text-xl font-black sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-indigo-100">{label}</p>
    </div>
  );
}

function AdminHeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-3 py-4 text-center">
      <p className="text-xl font-black sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">{label}</p>
    </div>
  );
}

function AdminPremiumSidebar() {
  const links = [
    { title: "Dashboard", href: "/dashboard", icon: Home },
    { title: "Manage Parents", href: "/admin", icon: Users },
    { title: "Reading Modules", href: "/admin/flashcard-modules", icon: BookOpenCheck },
    { title: "Reading Progress", href: "/admin/flashcard-modules/progress", icon: BarChart3 },
    { title: "Flashcard Library", href: "/admin/flashcard-library", icon: BookOpen },
    { title: "Custom Worksheet", href: "/admin/custom-worksheet", icon: FileText },
    { title: "Math Activity", href: "/admin/math-activity", icon: Calculator },
    { title: "Sifir Deck", href: "/admin/sifir-deck", icon: Star },
    { title: "Calendar", href: "/admin/calendar", icon: CalendarDays },
    { title: "Freebies", href: "/admin/freebies", icon: Gift },
  ];

  return (
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-4 py-6 text-white xl:flex xl:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <ShieldCheck size={21} />
        </div>
        <div>
          <p className="text-sm font-black tracking-[0.08em]">FD ARCADIA</p>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-300">ADMIN PORTAL</p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1.5">
        {links.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-black transition ${
                index === 0
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[20px] border border-violet-400/20 bg-white/[0.05] p-4">
        <div className="flex items-center gap-2 text-yellow-300">
          <Crown size={17} />
          <p className="text-xs font-black">Admin Access</p>
        </div>
        <p className="mt-2 text-[10px] leading-5 text-indigo-200">
          Full management access to FD Arcadia portal.
        </p>
      </div>
    </aside>
  );
}

function HeroQuickButton({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-w-[120px] items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-yellow-200">
        <Icon size={20} />
      </div>

      <span className="text-sm font-black">
        {label}
      </span>
    </Link>
  );
}

function AdminMetric({
  icon: Icon,
  title,
  value,
  description,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  tone: "indigo" | "violet" | "blue" | "emerald";
}) {
  const toneStyles = {
    indigo: "bg-indigo-50 text-indigo-700",
    violet: "bg-violet-50 text-violet-700",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
  }[tone];

  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${toneStyles}`}
        >
          <Icon size={23} />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function PremiumAdminCard({
  title,
  href,
  icon: Icon,
  description,
  badge,
  tone,
}: {
  title: string;
  href: string;
  icon: React.ElementType;
  description: string;
  badge: string;
  tone:
    | "indigo"
    | "blue"
    | "violet"
    | "cyan"
    | "pink"
    | "emerald"
    | "amber"
    | "orange"
    | "rose"
    | "sky";
}) {
  const theme = {
    indigo: {
      icon: "bg-indigo-50 text-indigo-700",
      badge: "bg-indigo-50 text-indigo-700",
      hover: "hover:border-indigo-200",
    },
    blue: {
      icon: "bg-blue-50 text-blue-700",
      badge: "bg-blue-50 text-blue-700",
      hover: "hover:border-blue-200",
    },
    violet: {
      icon: "bg-violet-50 text-violet-700",
      badge: "bg-violet-50 text-violet-700",
      hover: "hover:border-violet-200",
    },
    cyan: {
      icon: "bg-cyan-50 text-cyan-700",
      badge: "bg-cyan-50 text-cyan-700",
      hover: "hover:border-cyan-200",
    },
    pink: {
      icon: "bg-pink-50 text-pink-700",
      badge: "bg-pink-50 text-pink-700",
      hover: "hover:border-pink-200",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-700",
      badge: "bg-emerald-50 text-emerald-700",
      hover: "hover:border-emerald-200",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      badge: "bg-amber-50 text-amber-700",
      hover: "hover:border-amber-200",
    },
    orange: {
      icon: "bg-orange-50 text-orange-700",
      badge: "bg-orange-50 text-orange-700",
      hover: "hover:border-orange-200",
    },
    rose: {
      icon: "bg-rose-50 text-rose-700",
      badge: "bg-rose-50 text-rose-700",
      hover: "hover:border-rose-200",
    },
    sky: {
      icon: "bg-sky-50 text-sky-700",
      badge: "bg-sky-50 text-sky-700",
      hover: "hover:border-sky-200",
    },
  }[tone];

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.10)] ${theme.hover}`}
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-slate-50 transition duration-300 group-hover:scale-125" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`grid h-13 w-13 place-items-center rounded-2xl p-3 ${theme.icon}`}
          >
            <Icon size={26} />
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${theme.badge}`}
          >
            {badge}
          </span>
        </div>

        <h3 className="mt-5 text-xl font-black text-slate-950">
          {title}
        </h3>

        <p className="mt-2 min-h-[52px] text-sm leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm font-black text-slate-700">
            Open Manager
          </span>

          <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-white transition group-hover:translate-x-1">
            <ChevronRight size={17} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PreviewCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50"
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-indigo-700 shadow-sm">
        <Icon size={21} />
      </div>

      <h3 className="mt-4 font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-1 text-xs font-black text-indigo-700">
        Preview
        <ChevronRight
          size={14}
          className="transition group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

function ParentDashboard({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [readingModules, setReadingModules] = useState<ReadingModuleRow[]>([]);
  const [readingProgress, setReadingProgress] = useState<ReadingProgressRow[]>([]);
  const [readingLoading, setReadingLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("Warm Up");
  const [error, setError] = useState("");
  const [avatarAction, setAvatarAction] = useState<AvatarAction>("idle");
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  useEffect(() => {
    async function loadDashboardData() {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setReadingLoading(false);
        return;
      }

      setProfile(profileData as DashboardProfile);

      const { data: childrenData } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", userId)
        .limit(8);

      const loadedChildren = (childrenData || []) as ChildProfile[];

      setChildren(loadedChildren);

      if (loadedChildren.length > 0) {
        const savedChildId =
          typeof window !== "undefined"
            ? window.localStorage.getItem("fd-arcadia-selected-child")
            : null;

        const savedChildExists = loadedChildren.some(
          (child) => child.id === savedChildId
        );

        setSelectedChildId(
          savedChildId && savedChildExists
            ? savedChildId
            : loadedChildren[0].id
        );
      } else {
        setSelectedChildId("");
      }

      try {
        setReadingLoading(true);

        const { data: moduleData, error: moduleError } = await supabase
          .from("flashcard_modules")
          .select("id,title,total_pages,display_order,is_active")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (moduleError) {
          throw moduleError;
        }

        const modules = (moduleData || []) as ReadingModuleRow[];
        setReadingModules(modules);

        if (modules.length > 0) {
          const { data: progressData, error: progressError } = await supabase
            .from("flashcard_module_progress")
            .select(
              "module_id,last_page,highest_page,progress_percent,last_opened_at,completed_at"
            )
            .eq("user_id", userId)
            .in(
              "module_id",
              modules.map((module) => module.id)
            );

          if (progressError) {
            throw progressError;
          }

          setReadingProgress((progressData || []) as ReadingProgressRow[]);
        } else {
          setReadingProgress([]);
        }
      } catch (readingError) {
        console.error("Reading dashboard load error:", readingError);
      } finally {
        setReadingLoading(false);
      }
    }

    loadDashboardData();
  }, [userId]);

  useEffect(() => {
    if (avatarAction === "idle" || avatarAction === "sit") return;

    const duration = avatarAction === "dance" ? 1800 : 1050;
    const timer = window.setTimeout(() => {
      setAvatarAction("idle");
    }, duration);

    return () => window.clearTimeout(timer);
  }, [avatarAction]);

  const displayName = useMemo(() => {
    return profile?.full_name?.trim() || "Parent";
  }, [profile?.full_name]);

  const packageName = profile?.package_type
    ? packageLabels[profile.package_type] || profile.package_type
    : "No Active Package";

  const hasLearningHub = Boolean(profile?.learning_hub_unlocked);
  const hasCustomWorksheet = Boolean(profile?.custom_worksheet_unlocked);
  const hasMathActivity = Boolean(profile?.math_activity_unlocked);
  const hasDrawLearn = Boolean(profile?.draw_learn_unlocked);
  const hasSifirDeck = Boolean(profile?.sifir_deck_unlocked);
  const hasFreebies = profile?.freebies_unlocked !== false;
  const hasFlashcardLibrary = Boolean(profile?.flashcard_unlocked);
  const hasReadingModules = Boolean(profile?.flashcard_modul_unlocked);
  const hasHurufMembaca = Boolean(profile?.huruf_membaca_unlocked);

  // Virtual World is available only for Learning Hub, Custom Worksheet,
  // or Digital Reading Module subscribers.
  const hasVirtualWorld =
    hasLearningHub || hasCustomWorksheet || hasReadingModules;

  const unlockedCount = moduleCards.filter((card) => {
    if (!card.field) return true;
    if (card.field === "flashcard_unlocked") return hasFlashcardLibrary;
    if (card.field === "flashcard_modul_unlocked") return hasReadingModules;
    if (card.field === "huruf_membaca_unlocked") return hasHurufMembaca;
    if (card.field === "freebies_unlocked") return hasFreebies;
    return Boolean(profile?.[card.field]);
  }).length;

  const overallProgress = Math.max(
    35,
    Math.round((unlockedCount / moduleCards.length) * 100)
  );

  const readingSummaries = useMemo<ReadingModuleSummary[]>(() => {
    const progressMap = new Map(
      readingProgress.map((row) => [row.module_id, row])
    );

    return readingModules.map((module) => {
      const saved = progressMap.get(module.id);
      const totalPages = Math.max(1, Number(module.total_pages || 1));
      const lastPage = Math.max(
        1,
        Math.min(totalPages, Number(saved?.last_page || 1))
      );
      const highestPage = Math.max(
        saved ? 1 : 0,
        Math.min(totalPages, Number(saved?.highest_page || 0))
      );
      const progressPercent = saved
        ? Math.max(
            0,
            Math.min(
              100,
              Number.isFinite(Number(saved.progress_percent))
                ? Number(saved.progress_percent)
                : Math.round((highestPage / totalPages) * 100)
            )
          )
        : 0;

      return {
        moduleId: module.id,
        title: module.title,
        totalPages,
        lastPage,
        highestPage,
        progressPercent,
        lastOpenedAt: saved?.last_opened_at || null,
        completed: Boolean(saved?.completed_at) || progressPercent >= 100,
      };
    });
  }, [readingModules, readingProgress]);

  const latestReadingModule = useMemo(() => {
    const started = readingSummaries.filter((item) => item.progressPercent > 0);

    if (started.length === 0) {
      return readingSummaries[0] || null;
    }

    return [...started].sort((a, b) => {
      const aTime = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0;
      const bTime = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0;
      return bTime - aTime;
    })[0];
  }, [readingSummaries]);

  const readingAverageProgress = useMemo(() => {
    const started = readingSummaries.filter((item) => item.progressPercent > 0);

    if (started.length === 0) return 0;

    return Math.round(
      started.reduce((sum, item) => sum + item.progressPercent, 0) /
        started.length
    );
  }, [readingSummaries]);

  const readingCompletedCount = readingSummaries.filter(
    (item) => item.completed
  ).length;

  const shouldShowLearningHubDashboard = hasLearningHub;
  const shouldShowCompactPackageDashboard = !hasLearningHub;

  const whatsappText = encodeURIComponent(
    `Hi FD Arcadia, I would like to subscribe or upgrade my package. My registered email is ${
      profile?.email || ""
    }.`
  );

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

  const primaryChild =
  children.find((child) => child.id === selectedChildId) ||
  children[0] ||
  null;
  const primaryChildName =
    primaryChild?.name ||
    primaryChild?.child_name ||
    primaryChild?.full_name ||
    displayName;

  const primaryChildLevel =
    primaryChild?.level || primaryChild?.grade || "Learning Profile";

  const primaryChildAge = primaryChild?.age
    ? `Age ${primaryChild.age}`
    : children.length > 0
      ? "Age not set"
      : "Parent Overview";

  const dashboardModules = moduleCards.filter((card) => {
    if (card.field === "flashcard_unlocked") return hasFlashcardLibrary;
    if (card.field === "flashcard_modul_unlocked") return hasReadingModules;
    if (card.field === "huruf_membaca_unlocked") return hasHurufMembaca;
    if (card.field === "freebies_unlocked") return hasFreebies;
    return card.field ? Boolean(profile?.[card.field]) : true;
  });

  const visibleDashboardModules = dashboardModules.slice(0, 6);
  const levelNumber = (() => {
    const raw = String(primaryChildLevel || "");
    const match = raw.match(/\d+/);
    return match ? Number(match[0]) : 1;
  })();

  const xpCurrent = Math.min(1000, Math.max(0, overallProgress * 10));
  const xpPercent = Math.min(100, Math.round((xpCurrent / 1000) * 100));
  const coinCount = unlockedCount * 70;
  const starCount = Math.max(readingCompletedCount * 20, Math.round(overallProgress * 1.2));
  const gemCount = Math.max(0, Math.floor(readingCompletedCount * 3));

  const gameAvatar = primaryChild?.avatar_character?.trim() || "boy_01";
  const gameAvatarIdleImage = `/avatars/${gameAvatar}/idle.png`;

  function changeSelectedChild(childId: string) {
    setSelectedChildId(childId);
    setAvatarAction("idle");

    if (typeof window !== "undefined") {
      window.localStorage.setItem("fd-arcadia-selected-child", childId);
    }
  }

  function playAvatarAction(action: AvatarAction) {
    if (action === "sit") {
      setAvatarAction((current) => (current === "sit" ? "idle" : "sit"));
      return;
    }

    // Reset first so repeated taps can replay the same animation cleanly.
    setAvatarAction("idle");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setAvatarAction(action));
    });
  }

  return (
    <main className="min-h-screen bg-[#090d2c] text-slate-950 xl:h-screen xl:overflow-hidden">
      <style>{`
        @keyframes fdAvatarIdle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.01); }
        }

        @keyframes fdAvatarJump {
          0% { transform: translateY(0) scale(1); }
          18% { transform: translateY(5px) scaleX(1.05) scaleY(0.95); }
          50% { transform: translateY(-78px) scaleX(0.98) scaleY(1.04); }
          76% { transform: translateY(-14px) scale(1); }
          90% { transform: translateY(4px) scaleX(1.05) scaleY(0.95); }
          100% { transform: translateY(0) scale(1); }
        }

        @keyframes fdAvatarDance {
          0% { transform: translateX(0) translateY(0) rotate(0deg); }
          12% { transform: translateX(-18px) translateY(-8px) rotate(-7deg); }
          25% { transform: translateX(18px) translateY(0) rotate(7deg); }
          38% { transform: translateX(-14px) translateY(-10px) rotate(-6deg); }
          50% { transform: translateX(14px) translateY(0) rotate(6deg); }
          63% { transform: translateX(-12px) translateY(-8px) rotate(-5deg); }
          76% { transform: translateX(12px) translateY(0) rotate(5deg); }
          88% { transform: translateX(-6px) translateY(-5px) rotate(-2deg); }
          100% { transform: translateX(0) translateY(0) rotate(0deg); }
        }

        @keyframes fdAvatarWave {
          0%, 100% { transform: rotate(0deg) translateX(0); }
          20% { transform: rotate(-5deg) translateX(-4px); }
          40% { transform: rotate(5deg) translateX(4px); }
          60% { transform: rotate(-5deg) translateX(-4px); }
          80% { transform: rotate(4deg) translateX(3px); }
        }

        @keyframes fdAvatarClap {
          0%, 100% { transform: scale(1) translateY(0); }
          20% { transform: scale(1.06) translateY(-5px); }
          40% { transform: scale(0.98) translateY(0); }
          60% { transform: scale(1.06) translateY(-5px); }
          80% { transform: scale(0.98) translateY(0); }
        }

        .fd-avatar-idle { animation: fdAvatarIdle 2.8s ease-in-out infinite; }
        .fd-avatar-jump { animation: fdAvatarJump .95s ease-in-out both; }
        .fd-avatar-dance { animation: fdAvatarDance 1.7s ease-in-out both; }
        .fd-avatar-wave { animation: fdAvatarWave .95s ease-in-out both; }
        .fd-avatar-clap { animation: fdAvatarClap .85s ease-in-out both; }

        @media (prefers-reduced-motion: reduce) {
          .fd-avatar-idle,
          .fd-avatar-jump,
          .fd-avatar-dance,
          .fd-avatar-wave,
          .fd-avatar-clap {
            animation: none !important;
          }
        }
      `}</style>
      <div className="mx-auto min-h-screen w-full max-w-[1920px] xl:grid xl:h-screen xl:grid-cols-[230px_minmax(0,1fr)]">
        {/* DESKTOP PLAYER SIDEBAR */}
        <aside className="hidden min-h-0 border-r border-white/10 bg-gradient-to-b from-[#0c1238] via-[#111744] to-[#0b1032] px-4 py-5 text-white xl:flex xl:flex-col">
          <Link href="/dashboard" className="flex items-center gap-3 px-2">
            <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-gradient-to-br from-violet-400 to-indigo-600 text-2xl shadow-lg shadow-violet-950/30">
              🏠
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-black tracking-tight">FD Arcadia</p>
              <p className="text-[9px] font-black tracking-[0.15em] text-violet-200">LEARNINGHUB</p>
            </div>
          </Link>

          <div className="mt-5 rounded-[28px] border border-violet-300/20 bg-white/[0.07] p-4 text-center shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur">
            <Link href="/children/avatar" className="relative mx-auto block h-24 w-24" title="Change avatar">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-white/80 bg-gradient-to-br from-violet-300 to-indigo-500 shadow-lg">
                {primaryChild ? (
                  <img
                    src={gameAvatarIdleImage}
                    alt={primaryChildName}
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                ) : profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <UserRound size={42} className="text-white" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-[#111744] bg-white text-indigo-600">✎</span>
            </Link>

            <h2 className="mt-3 truncate text-2xl font-black">{primaryChildName}</h2>
            <span className="mt-1 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-3 py-1 text-[10px] font-black">
              Level {levelNumber}
            </span>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400" style={{ width: `${xpPercent}%` }} />
            </div>
            <p className="mt-1 text-[9px] font-bold text-indigo-100">{xpCurrent} / 1000 XP</p>

            <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-white/[0.06] p-2">
              <MiniCurrency emoji="🪙" value={coinCount} label="Coins" />
              <MiniCurrency emoji="⭐" value={starCount} label="Stars" />
              <MiniCurrency emoji="💎" value={gemCount} label="Gems" />
            </div>
          </div>

          <nav className="mt-4 space-y-1.5">
            <GameSideLink href="/dashboard" icon={Home} label="Home" active />
            <GameSideLink href="/learning-hub" icon={BookOpenCheck} label="Learning" show={hasLearningHub} />
            <GameSideLink href="/virtual-world" icon={Sparkles} label="Virtual World" show={hasVirtualWorld} />
            <GameSideLink href="/flashcard-modules" icon={BarChart3} label="Progress" show={hasReadingModules} />
            <GameSideLink href="/profile" icon={UserRound} label="Profile" />
          </nav>

          <div className="mt-auto rounded-[22px] border border-violet-300/25 bg-gradient-to-br from-violet-600/35 to-fuchsia-500/15 p-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎁</div>
              <div>
                <p className="text-xs font-black">Daily Reward</p>
                <p className="mt-1 text-[9px] font-semibold text-violet-100">Come back every day!</p>
              </div>
            </div>
            <Link href="/freebies" className="mt-3 flex w-full items-center justify-center rounded-xl bg-white/10 px-3 py-2 text-[10px] font-black text-white transition hover:bg-white/15">
              Open Rewards
            </Link>
          </div>
        </aside>

        {/* MAIN GAME DASHBOARD */}
        <div className="min-w-0 bg-gradient-to-b from-[#f7f3ff] via-[#f9f7ff] to-[#eeeaff] xl:overflow-y-auto">
          {/* TOP BAR */}
          <header className="sticky top-0 z-40 border-b border-indigo-100/80 bg-[#f9f7ff]/90 px-3 py-3 backdrop-blur-xl sm:px-5 lg:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xl text-white shadow-md xl:hidden">🏠</div>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-violet-500">FD Arcadia LearningHub</p>
                  <h1 className="truncate text-lg font-black text-[#28245d] sm:text-xl">Home</h1>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <TopCurrency emoji="🪙" value={coinCount} />
                <TopCurrency emoji="⭐" value={starCount} className="hidden sm:flex" />
                <TopCurrency emoji="💎" value={gemCount} className="hidden md:flex" />
                <Link href="/profile" className="grid h-10 w-10 place-items-center rounded-2xl bg-[#292958] text-white shadow-sm transition hover:-translate-y-0.5">
                  <UserRound size={18} />
                </Link>
                <LogoutGameButton />
              </div>
            </div>
          </header>

          <div className="p-3 pb-24 sm:p-5 sm:pb-24 lg:p-6 lg:pb-24 xl:pb-8">
            {error ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
            ) : null}

            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-4">
                {/* HOME HERO - SELECTED CHILD */}
                <section className="relative isolate overflow-hidden rounded-[30px] border border-white/70 bg-gradient-to-br from-[#f6ded3] via-[#ded5fb] to-[#bab6f1] p-5 shadow-[0_22px_70px_rgba(66,53,140,0.18)] sm:p-7">
                  <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
                  <div className="absolute -bottom-24 left-[20%] h-48 w-48 rounded-full bg-violet-300/25 blur-3xl" />

                  <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600">
                        Today&apos;s Home
                      </p>
                      <h2 className="mt-1 text-2xl font-black text-[#2b285c] sm:text-3xl">
                        Hi {primaryChildName}! 👋
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        Here&apos;s your learning overview for today.
                      </p>

                      {children.length > 1 ? (
                        <div className="mt-5">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-500">
                              Choose Child
                            </p>
                            <p className="text-[9px] font-bold text-slate-400">
                              Home follows the selected child
                            </p>
                          </div>

                          <div className="flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {children.map((child) => {
                              const childName =
                                child.name ||
                                child.child_name ||
                                child.full_name ||
                                "Child";

                              const childAvatar =
                                child.avatar_character?.trim() || "boy_01";

                              const active = child.id === primaryChild?.id;

                              return (
                                <button
                                  key={child.id}
                                  type="button"
                                  onClick={() => changeSelectedChild(child.id)}
                                  className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-black transition-all ${
                                    active
                                      ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                                      : "border-white/80 bg-white/80 text-[#373267] hover:-translate-y-0.5 hover:border-violet-300 hover:bg-white"
                                  }`}
                                >
                                  <span
                                    className={`grid h-10 w-10 place-items-center overflow-hidden rounded-full ${
                                      active ? "bg-white/20" : "bg-violet-50"
                                    }`}
                                  >
                                    <img
                                      src={`/avatars/${childAvatar}/idle.png`}
                                      alt={childName}
                                      className="h-full w-full object-contain"
                                      draggable={false}
                                    />
                                  </span>

                                  <span>{childName}</span>
                                  {active ? <span>✓</span> : null}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-5 flex flex-wrap gap-2">
                        {hasReadingModules ? (
                          <Link
                            href="/flashcard-modules"
                            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-700"
                          >
                            <BookOpenCheck size={16} />
                            Continue Learning
                          </Link>
                        ) : null}

                        {hasVirtualWorld ? (
                          <Link
                            href="/virtual-world"
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/85 px-4 py-3 text-xs font-black text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                          >
                            <Sparkles size={16} />
                            Enter Virtual World
                          </Link>
                        ) : null}

                        <Link
                          href="/children/avatar"
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/60 px-4 py-3 text-xs font-black text-[#484172] transition hover:bg-white"
                        >
                          <UserRound size={16} />
                          Change Avatar
                        </Link>
                      </div>
                    </div>

                    <div className="relative mx-auto flex h-[250px] w-[210px] items-end justify-center sm:h-[300px] sm:w-[250px]">
                      <div className="absolute bottom-2 h-7 w-36 rounded-full bg-indigo-950/15 blur-md" />

                      {primaryChild ? (
                        <img
                          src={gameAvatarIdleImage}
                          alt={primaryChildName}
                          className="relative z-10 max-h-full max-w-full select-none object-contain drop-shadow-[0_20px_22px_rgba(43,40,92,0.22)]"
                          draggable={false}
                        />
                      ) : (
                        <UserRound size={90} className="mb-16 text-violet-400" />
                      )}
                    </div>
                  </div>
                </section>

                {/* CONTENT CARDS: ORIGINAL MODULE CONTENT, NEW GAME LOOK */}
                <div className={`grid gap-4 ${hasReadingModules ? "xl:grid-cols-[0.85fr_1.15fr]" : "xl:grid-cols-1"}`}>
                  {hasReadingModules ? (
                  <section className="rounded-[26px] border border-indigo-100 bg-white p-5 shadow-[0_14px_40px_rgba(65,54,131,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-500">Continue Learning</p>
                        <h2 className="mt-1 text-xl font-black text-[#302c67]">Modul Membaca</h2>
                      </div>
                      <div className="text-4xl">📘</div>
                    </div>

                    {readingLoading ? (
                      <div className="mt-5 rounded-2xl bg-violet-50 p-4 text-xs font-black text-violet-600">Loading reading progress...</div>
                    ) : latestReadingModule ? (
                      <>
                        <div className="mt-5 rounded-[20px] border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
                          <p className="text-sm font-black text-slate-900">{latestReadingModule.title}</p>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">Page {latestReadingModule.lastPage} / {latestReadingModule.totalPages}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${latestReadingModule.progressPercent}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-violet-600">{latestReadingModule.progressPercent}%</span>
                          </div>
                        </div>
                        <Link href="/flashcard-modules" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5">
                          Continue Adventure <ChevronRight size={15} />
                        </Link>
                      </>
                    ) : (
                      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-500">No reading module available yet.</div>
                    )}
                  </section>
                  ) : null}

                  <section className="rounded-[26px] border border-indigo-100 bg-white p-5 shadow-[0_14px_40px_rgba(65,54,131,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-indigo-500">Learning Access</p>
                        <h2 className="mt-1 text-xl font-black text-[#302c67]">My Learning Modules</h2>
                      </div>
                      <Link href="/pricing" className="rounded-xl bg-violet-50 px-3 py-2 text-[10px] font-black text-violet-700">View Plans</Link>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {visibleDashboardModules.map((card) => {
                        const Icon = card.icon;
                        const isReading = card.title === "Modul Membaca";
                        const progressValue = isReading ? readingAverageProgress : 100;
                        return (
                          <Link key={card.title} href={card.href} className="group rounded-[20px] border border-indigo-100 bg-gradient-to-b from-white to-[#faf8ff] p-3 text-center transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg">
                            <div className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] bg-gradient-to-br from-violet-100 to-indigo-100 text-indigo-600 shadow-inner">
                              <Icon size={25} />
                            </div>
                            <p className="mt-3 line-clamp-2 min-h-[34px] text-[11px] font-black text-[#312e68]">{card.title}</p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${progressValue}%` }} />
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    {dashboardModules.length === 0 ? (
                      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-500">No premium module unlocked yet. View plans to choose your learning package.</div>
                    ) : null}
                  </section>
                </div>

                {/* ORIGINAL READING PROGRESS */}
                {hasReadingModules ? (
                  <ReadingProgressDashboard
                    loading={readingLoading}
                    modules={readingSummaries}
                    latestModule={latestReadingModule}
                    averageProgress={readingAverageProgress}
                    completedCount={readingCompletedCount}
                  />
                ) : null}

                {/* ORIGINAL TODAY'S SCHEDULE */}
                {hasLearningHub ? (
                  <section className="rounded-[26px] border border-indigo-100 bg-white p-5 shadow-[0_14px_40px_rgba(65,54,131,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-indigo-500">Daily Learning</p>
                        <h2 className="mt-1 text-xl font-black text-[#302c67]">Today&apos;s Schedule</h2>
                      </div>
                      <Link href="/learning-hub" className="text-[10px] font-black text-indigo-600">View Full Schedule</Link>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                      {dailySchedule.map((item, index) => (
                        <div key={item.title} className="flex items-center gap-3 rounded-[18px] border border-violet-100 bg-violet-50/60 px-3 py-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-xl shadow-sm">{item.icon}</div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-black text-slate-400">{item.time}</p>
                            <p className="truncate text-xs font-black text-slate-800">{item.title}</p>
                          </div>
                          {index < 2 ? <CheckCircle2 size={14} className="ml-auto text-emerald-500" /> : <Clock3 size={14} className="ml-auto text-indigo-400" />}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {/* ORIGINAL CHILDREN CONTENT */}
                <section className="rounded-[26px] border border-indigo-100 bg-white p-5 shadow-[0_14px_40px_rgba(65,54,131,0.08)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Family</p>
                      <h2 className="mt-1 text-xl font-black text-[#302c67]">My Children</h2>
                    </div>
                    <Link href="/children" className="rounded-xl bg-[#28265d] px-3 py-2 text-[10px] font-black text-white">Manage</Link>
                  </div>
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {children.length > 0 ? children.map((child) => {
                      const childName = child.name || child.child_name || child.full_name || "Child Profile";
                      return (
                        <Link key={child.id} href="/children" className="flex min-w-[230px] items-center gap-3 rounded-[18px] border border-indigo-100 bg-violet-50/60 p-3">
                          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-indigo-100 text-indigo-500">
                            {child.avatar_url ? <img src={child.avatar_url} alt={childName} className="h-full w-full object-cover" /> : <UserRound size={20} />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black">{childName}</p>
                            <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">{child.level || child.grade || "Level not set"}{child.age ? ` • Age ${child.age}` : ""}</p>
                          </div>
                        </Link>
                      );
                    }) : (
                      <Link href="/children" className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-xs font-black text-slate-500">+ Add your first child profile</Link>
                    )}
                  </div>
                </section>

                {/* ORIGINAL CURRENT PLAN CONTENT */}
                <section className="flex flex-col gap-3 rounded-[22px] border border-indigo-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Current Plan</p>
                    <p className="mt-1 text-sm font-black text-slate-800">{packageName}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">Valid until {profile?.subscription_end || "-"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/pricing" className="inline-flex items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-xs font-black text-indigo-700">View Plans</Link>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-white">WhatsApp Admin</a>
                  </div>
                </section>
              </div>

              {/* RIGHT MISSION PANEL */}
              <div className="space-y-4 2xl:sticky 2xl:top-[84px] 2xl:self-start">
                <section className="rounded-[26px] border border-indigo-100 bg-white p-5 shadow-[0_14px_40px_rgba(65,54,131,0.10)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-[#312e68]">Today&apos;s Tasks</h2>
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {dailySchedule.slice(0, 3).map((item, index) => {
                      const completed = index === 0;
                      const current = index === 0 ? 1 : index === 1 ? 4 : 0;
                      const total = index === 1 ? 5 : 1;
                      const pct = Math.round((current / total) * 100);
                      return (
                        <div key={item.title} className="rounded-[18px] border border-slate-100 bg-[#fbfaff] p-3">
                          <div className="flex items-center gap-3">
                            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-violet-400 bg-white text-violet-500"}`}>
                              {completed ? <CheckCircle2 size={18} /> : <span className="text-[10px] font-black">{current}</span>}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-black text-slate-800">{item.title}</p>
                              <p className="mt-0.5 text-[10px] font-bold text-slate-400">{current} / {total}</p>
                            </div>
                            <span className="text-[10px] font-black text-amber-500">+{10 + index * 5} 🪙</span>
                          </div>
                          {!completed ? (
                            <div className="mt-2 ml-12 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  {hasLearningHub ? (
                    <Link href="/learning-hub" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-xs font-black text-white">Go to Learning <ChevronRight size={15} /></Link>
                  ) : null}
                </section>

                {hasLearningHub ? (
                  <section className="rounded-[26px] border border-indigo-100 bg-white p-5 shadow-[0_14px_40px_rgba(65,54,131,0.10)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-500">This Week</p>
                        <h2 className="mt-1 text-lg font-black text-[#312e68]">Weekly Progress</h2>
                      </div>
                      <span className="text-4xl">🏆</span>
                    </div>
                    <p className="mt-4 text-2xl font-black text-[#312e68]">{Math.round(subjectTabs.reduce((sum, item) => sum + item.progress, 0) / subjectTabs.length)}%</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-violet-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-violet-500" style={{ width: `${Math.round(subjectTabs.reduce((sum, item) => sum + item.progress, 0) / subjectTabs.length)}%` }} />
                    </div>
                    <div className="mt-5 space-y-3">
                      {subjectTabs.map((subject) => (
                        <div key={subject.title}>
                          <div className="mb-1 flex items-center justify-between text-[10px] font-black">
                            <span className="text-slate-700">{subject.icon} {subject.title}</span>
                            <span className="text-slate-400">{subject.progress}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${subject.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="rounded-[26px] border border-indigo-100 bg-white p-5 shadow-[0_14px_40px_rgba(65,54,131,0.10)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-500">Reward</p>
                      <h2 className="mt-1 text-lg font-black text-[#312e68]">Daily Reward</h2>
                    </div>
                    <span className="text-5xl">🎁</span>
                  </div>
                  <div className="mt-4 rounded-[22px] bg-gradient-to-br from-[#2d245b] via-violet-700 to-fuchsia-600 p-5 text-center text-white shadow-inner">
                    <div className="text-6xl">🎁</div>
                    <p className="mt-2 text-xs font-black">Come back every day!</p>
                    <p className="mt-1 text-[10px] font-semibold text-violet-100">Claim your reward and continue learning.</p>
                  </div>
                  <Link href="/freebies" className="mt-4 flex w-full items-center justify-center rounded-2xl bg-violet-100 px-4 py-3 text-xs font-black text-violet-700">Open Rewards</Link>
                </section>
              </div>
            </div>
          </div>

          {/* MOBILE/TABLET BOTTOM NAV */}
          <nav className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-[760px] items-center justify-around rounded-[24px] border border-white/15 bg-[#15183d]/95 p-2 text-white shadow-[0_20px_60px_rgba(13,10,48,0.35)] backdrop-blur-xl xl:hidden">
            <BottomGameLink href="/dashboard" icon={Home} label="Home" active />
            <BottomGameLink href="/learning-hub" icon={BookOpenCheck} label="Learning" show={hasLearningHub} />
            <BottomGameLink href="/virtual-world" icon={Sparkles} label="Virtual World" show={hasVirtualWorld} />
            <BottomGameLink href="/flashcard-modules" icon={BarChart3} label="Progress" show={hasReadingModules} />
            <BottomGameLink href="/profile" icon={UserRound} label="Profile" />
          </nav>
        </div>
      </div>
    </main>
  );
}

function MiniCurrency({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div className="min-w-0">
      <div className="text-lg">{emoji}</div>
      <p className="truncate text-[11px] font-black">{value}</p>
      <p className="truncate text-[8px] font-semibold text-indigo-200">{label}</p>
    </div>
  );
}

function TopCurrency({ emoji, value, className = "flex" }: { emoji: string; value: number; className?: string }) {
  return (
    <div className={`${className} h-10 items-center gap-2 rounded-2xl bg-[#292958] px-3 text-white shadow-sm`}>
      <span className="text-lg">{emoji}</span>
      <span className="text-xs font-black sm:text-sm">{value}</span>
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white/15 text-sm font-black">+</span>
    </div>
  );
}

function GameSideLink({ href, icon: Icon, label, active = false, show = true }: { href: string; icon: React.ElementType; label: string; active?: boolean; show?: boolean }) {
  if (!show) return null;
  return (
    <Link href={href} className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-xs font-black transition ${active ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-950/25" : "text-indigo-100 hover:bg-white/[0.07] hover:text-white"}`}>
      <Icon size={17} />
      <span>{label}</span>
    </Link>
  );
}

function BottomGameLink({ href, icon: Icon, label, active = false, show = true }: { href: string; icon: React.ElementType; label: string; active?: boolean; show?: boolean }) {
  if (!show) return null;
  return (
    <Link href={href} className={`flex min-w-[54px] flex-col items-center justify-center rounded-[16px] px-2 py-2 text-[9px] font-black transition sm:min-w-[88px] sm:flex-row sm:gap-2 sm:px-3 sm:text-[10px] ${active ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white" : "text-indigo-100 hover:bg-white/10"}`}>
      <Icon size={18} />
      <span className="mt-1 sm:mt-0">{label}</span>
    </Link>
  );
}

function LogoutGameButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} title="Logout" aria-label="Logout" className="grid h-10 w-10 place-items-center rounded-2xl bg-[#292958] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-500">
      <LogOut size={17} />
    </button>
  );
}

function ParentSidebar({
  packageName,
  endDate,
  hasLearningHub,
  hasCustomWorksheet,
  hasFlashcardLibrary,
  hasReadingModules,
  hasHurufMembaca,
}: {
  packageName: string;
  endDate: string;
  hasLearningHub: boolean;
  hasCustomWorksheet: boolean;
  hasFlashcardLibrary: boolean;
  hasReadingModules: boolean;
  hasHurufMembaca: boolean;
}) {
  const links = [
    { title: "Dashboard", href: "/dashboard", icon: Home, show: true },
    { title: "Learning Hub", href: "/learning-hub", icon: BookOpenCheck, show: hasLearningHub },
    { title: "Flashcard Library", href: "/flashcard-library", icon: BookOpen, show: hasFlashcardLibrary },
    { title: "Modul Membaca", href: "/flashcard-modules", icon: BookOpenCheck, show: hasReadingModules },
    { title: "Huruf & Membaca", href: "/huruf-membaca", icon: BookOpenCheck, show: hasHurufMembaca },
    { title: "Math Activity", href: "/math-activity", icon: Calculator, show: true },
    { title: "Custom Worksheet", href: "/custom-worksheet", icon: FileText, show: hasCustomWorksheet },
    { title: "Draw & Learn", href: "/worksheet", icon: Palette, show: true },
    { title: "Sifir Deck", href: "/sifir-deck", icon: Star, show: true },
    { title: "Freebies", href: "/freebies", icon: Gift, show: true },
  ].filter((item) => item.show);

  return (
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-4 py-6 text-white xl:flex xl:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <BookOpen size={22} />
        </div>
        <div>
          <p className="text-sm font-black tracking-[0.08em]">FD ARCADIA</p>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-300">PARENT PORTAL</p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1.5">
        {links.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-black transition ${
                index === 0
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[20px] border border-violet-400/20 bg-gradient-to-br from-violet-600/35 to-indigo-500/15 p-4">
        <div className="flex items-center gap-2 text-yellow-300">
          <Crown size={17} />
          <p className="text-xs font-black">Your Plan</p>
        </div>
        <p className="mt-3 line-clamp-2 text-sm font-black text-white">{packageName}</p>
        <p className="mt-1 text-[10px] font-semibold text-indigo-200">Valid until {endDate}</p>
        <Link href="/pricing" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-3 py-2.5 text-xs font-black text-indigo-700">
          View Plans
        </Link>
      </div>
    </aside>
  );
}

function TopHeader({
  displayName,
  avatarUrl,
}: {
  displayName: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const today = new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    weekday: "long",
  }).format(new Date());

  return (
    <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">Parent Dashboard</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
          Good morning, {displayName}! 👋
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-400">
          Here&apos;s your learning overview for today.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-600 shadow-sm md:flex">
          <CalendarDays size={15} className="text-indigo-500" />
          {today}
        </div>

        <Link
  href="/profile"
  title="My Profile"
  aria-label="Open My Profile"
  className="
    group relative
    grid h-11 w-11
    place-items-center
    overflow-visible
    rounded-xl
    border border-slate-200
    bg-white
    shadow-sm
    transition-all duration-200
    hover:-translate-y-0.5
    hover:border-indigo-300
    hover:shadow-md
    focus:outline-none
    focus:ring-4
    focus:ring-indigo-100
  "
>
  <div className="h-full w-full overflow-hidden rounded-xl">
    {avatarUrl ? (
      <img
        src={avatarUrl}
        alt={displayName}
        className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
      />
    ) : (
      <div className="grid h-full w-full place-items-center">
        <UserRound size={18} className="text-slate-500" />
      </div>
    )}
  </div>

  {/* Active indicator */}
  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />

  {/* Tooltip */}
  <span
    className="
      pointer-events-none
      absolute right-0 top-[52px] z-[100]
      whitespace-nowrap rounded-lg
      bg-slate-950 px-2.5 py-1.5
      text-[10px] font-black text-white
      opacity-0 shadow-lg
      transition
      group-hover:opacity-100
    "
  >
    My Profile
  </span>
</Link>

        <Link
          href="/pricing"
          className="hidden h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-xs font-black text-white shadow-sm sm:inline-flex"
        >
          <Crown size={15} />
          View Plans
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="grid h-11 w-11 place-items-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
          title="Logout"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}

function ParentSummaryCard({
  displayName,
  email,
  avatarUrl,
  packageName,
  startDate,
  endDate,
  childrenCount,
}: {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  packageName: string;
  startDate: string;
  endDate: string;
  childrenCount: number;
}) {
  return (
    <div className="rounded-[1.7rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-6 text-white shadow-lg">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[2rem] bg-white/15 text-6xl">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>👩</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black tracking-[0.22em] text-yellow-200">
            PARENT ACCOUNT
          </p>
          <h2 className="mt-1 break-words text-4xl font-black sm:text-5xl">
            {displayName}
          </h2>
          <p className="mt-2 break-words text-sm font-bold text-indigo-100">
            {email}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ParentInfoMini label="Package" value={packageName} />
        <ParentInfoMini label="Children" value={`${childrenCount} profile${childrenCount === 1 ? "" : "s"}`} />
        <ParentInfoMini label="Start Date" value={startDate} />
        <ParentInfoMini label="End Date" value={endDate} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/profile"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 transition hover:bg-indigo-50"
        >
          <UserRound size={18} />
          Edit Parent Profile
        </Link>
        <Link
          href="/children"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-200 px-5 py-3 font-black text-indigo-800 transition hover:bg-yellow-300"
        >
          <Users size={18} />
          Manage Children
        </Link>
      </div>
    </div>
  );
}

function ParentInfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
      <p className="text-xs font-black tracking-[0.18em] text-yellow-200">
        {label.toUpperCase()}
      </p>
      <p className="mt-1 break-words font-black text-white">{value}</p>
    </div>
  );
}

function ChildrenMiniSection({ children }: { children: ChildProfile[] }) {
  return (
    <section className="mt-7 rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
            CHILD PROFILES
          </p>
          <h2 className="mt-1 text-2xl font-black text-indigo-700">
            My Children
          </h2>
          <p className="mt-2 text-slate-600">
            Child profiles are shown smaller because this dashboard is for parents.
          </p>
        </div>

        <Link
          href="/children"
          className="inline-flex justify-center rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white transition hover:bg-indigo-700"
        >
          + Add / Edit Child
        </Link>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {children.length > 0 ? (
          children.map((child) => {
            const childName =
              child.name || child.child_name || child.full_name || "Child Profile";
            const childAge = child.age ? `${child.age} years old` : "Age not set";
            const childLevel = child.level || child.grade || "Level not set";
            const childSchool = child.school || "FD Arcadia Learning Hub";

            return (
              <Link
                key={child.id}
                href="/children"
                className="rounded-[1.5rem] border border-indigo-100 bg-indigo-50 p-4 transition hover:-translate-y-1 hover:bg-indigo-100"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sky-100 text-4xl">
                    {child.avatar_url ? (
                      <img
                        src={child.avatar_url}
                        alt={childName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>👧</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xl font-black text-indigo-700">
                      {childName}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-slate-600">
                      {childLevel} • {childAge}
                    </p>
                  </div>
                </div>

                <p className="mt-3 truncate text-sm font-bold text-slate-500">
                  {childSchool}
                </p>

                <div className="mt-4 flex items-center justify-between font-black text-indigo-700">
                  <span>Open Profile</span>
                  <ChevronRight size={18} />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="rounded-2xl bg-yellow-50 p-5 text-slate-700 md:col-span-2 2xl:col-span-4">
            No child profile yet. Click Add / Edit Child to add your child profile.
          </div>
        )}
      </div>
    </section>
  );
}

function OverallProgressPanel({ overallProgress }: { overallProgress: number }) {
  return (
    <div className="rounded-[1.7rem] border border-indigo-100 p-6">
      <div className="grid gap-6 2xl:grid-cols-[330px_1fr]">
        <div>
          <h3 className="text-2xl font-black text-slate-900">
            Overall Progress This Month
          </h3>

          <div className="mt-7 flex flex-col gap-7 sm:flex-row sm:items-center">
            <div className="relative grid h-40 w-40 place-items-center rounded-full bg-indigo-50">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#4f46e5 ${overallProgress}%, #eef2ff 0)`,
                }}
              />
              <div className="relative grid h-28 w-28 place-items-center rounded-full bg-white">
                <div className="text-center">
                  <p className="text-4xl font-black text-slate-900">
                    {overallProgress}%
                  </p>
                  <p className="text-sm font-bold text-slate-500">Completed</p>
                </div>
              </div>
            </div>

            <div className="w-full space-y-3">
              {subjectTabs.map((subject) => (
                <div
                  key={subject.title}
                  className="flex items-center justify-between gap-5 text-sm font-bold"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{subject.icon}</span>
                    {subject.title}
                  </span>
                  <span>{subject.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-indigo-100 pt-6 2xl:border-l 2xl:border-t-0 2xl:pl-8 2xl:pt-0">
          <h3 className="text-xl font-black text-slate-900">Weekly Progress</h3>

          <div className="mt-8 space-y-5">
            {[45, 62, 70, 82].map((point, index) => (
              <div key={index}>
                <div className="mb-2 flex justify-between text-sm font-bold text-slate-500">
                  <span>Week {index + 1}</span>
                  <span>{point}%</span>
                </div>
                <div className="h-3 rounded-full bg-indigo-50">
                  <div
                    className="h-3 rounded-full bg-indigo-600"
                    style={{ width: `${point}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactAccessPanel({
  hasCustomWorksheet,
  hasFlashcardLibrary,
  hasReadingModules,
  hasMathActivity,
  hasDrawLearn,
  hasSifirDeck,
  hasFreebies,
  overallProgress,
}: {
  hasCustomWorksheet: boolean;
  hasFlashcardLibrary: boolean;
  hasReadingModules: boolean;
  hasMathActivity: boolean;
  hasDrawLearn: boolean;
  hasSifirDeck: boolean;
  hasFreebies: boolean;
  overallProgress: number;
}) {
  const accessRows = [
    { title: "Custom Worksheet", unlocked: hasCustomWorksheet, icon: "📝" },
    { title: "Flashcard Library", unlocked: hasFlashcardLibrary, icon: "🗂️" },
    { title: "Modul Membaca", unlocked: hasReadingModules, icon: "📚" },
    { title: "Math Activity", unlocked: hasMathActivity, icon: "🔢" },
    { title: "Draw & Learn", unlocked: hasDrawLearn, icon: "🎨" },
    { title: "Sifir Deck", unlocked: hasSifirDeck, icon: "⭐" },
    { title: "Freebies", unlocked: hasFreebies, icon: "🎁" },
  ];

  return (
    <div className="rounded-[1.7rem] border border-indigo-100 p-6">
      <h3 className="text-2xl font-black text-slate-900">
        Your Package Access
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Learning Hub progress is hidden because this account does not have
        Learning Hub subscription.
      </p>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[220px_1fr]">
        <div className="relative grid h-40 w-40 place-items-center rounded-full bg-indigo-50">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#4f46e5 ${overallProgress}%, #eef2ff 0)`,
            }}
          />
          <div className="relative grid h-28 w-28 place-items-center rounded-full bg-white">
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900">
                {overallProgress}%
              </p>
              <p className="text-sm font-bold text-slate-500">Access</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {accessRows.map((row) => (
            <div
              key={row.title}
              className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3 font-black text-slate-700"
            >
              <span>
                <span className="mr-2">{row.icon}</span>
                {row.title}
              </span>
              {row.unlocked ? (
                <CheckCircle2 className="text-emerald-600" size={22} />
              ) : (
                <LockKeyhole className="text-slate-400" size={22} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDashboardReadingDate(value: string | null) {
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

function ReadingProgressDashboard({
  loading,
  modules,
  latestModule,
  averageProgress,
  completedCount,
}: {
  loading: boolean;
  modules: ReadingModuleSummary[];
  latestModule: ReadingModuleSummary | null;
  averageProgress: number;
  completedCount: number;
}) {
  if (loading) {
    return (
      <section className="mt-7 overflow-hidden rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-3 w-36 rounded-full bg-slate-200" />
          <div className="mt-3 h-7 w-52 rounded-xl bg-slate-200" />
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-36 rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-7 overflow-hidden rounded-[2rem] border border-indigo-100 bg-white shadow-sm">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-6 py-7 text-white lg:px-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-indigo-200">
                <BookOpenCheck size={22} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-indigo-300">
                  Modul Membaca
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Interactive Reading Progress
                </p>
              </div>
            </div>

            <h2 className="mt-5 text-2xl font-black sm:text-3xl">
              Continue Your Reading
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Writing, last page and completion progress are saved automatically.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <ReadingHeroStat
              value={`${averageProgress}%`}
              label="Average"
            />
            <ReadingHeroStat
              value={`${completedCount}/${modules.length || 3}`}
              label="Completed"
            />
            <ReadingHeroStat
              value={latestModule ? `P${latestModule.lastPage}` : "—"}
              label="Last Page"
            />
          </div>
        </div>
      </div>

      <div className="p-5 lg:p-6">
        {latestModule ? (
          <div className="rounded-[1.6rem] border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                  <BookOpen size={22} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">
                    {latestModule.progressPercent > 0
                      ? "Continue Reading"
                      : "Start Reading"}
                  </p>

                  <h3 className="mt-1 text-xl font-black text-slate-950">
                    {latestModule.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {latestModule.progressPercent > 0
                      ? `Resume from Page ${latestModule.lastPage} of ${latestModule.totalPages}`
                      : `${latestModule.totalPages} pages ready to read`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-[180px]">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <span>Progress</span>
                    <span>{latestModule.progressPercent}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        latestModule.completed ? "bg-emerald-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${latestModule.progressPercent}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/flashcard-modules/${latestModule.moduleId}/read`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  {latestModule.completed
                    ? "Read Again"
                    : latestModule.progressPercent > 0
                      ? "Continue"
                      : "Start"}
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <BookOpenCheck className="mx-auto text-slate-300" size={30} />
            <p className="mt-3 font-black text-slate-700">
              Reading modules are being prepared
            </p>
          </div>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.moduleId}
              href={`/flashcard-modules/${module.moduleId}/read`}
              className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {module.title}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-slate-400">
                    {module.completed
                      ? "Completed"
                      : module.progressPercent > 0
                        ? `Page ${module.lastPage} / ${module.totalPages}`
                        : "Not Started"}
                  </p>
                </div>

                {module.completed ? (
                  <CheckCircle2 size={19} className="shrink-0 text-emerald-600" />
                ) : (
                  <ChevronRight
                    size={17}
                    className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-600"
                  />
                )}
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    module.completed ? "bg-emerald-500" : "bg-indigo-600"
                  }`}
                  style={{ width: `${module.progressPercent}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-bold text-slate-400">
                <span>{module.progressPercent}% complete</span>
                <span>{formatDashboardReadingDate(module.lastOpenedAt)}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <Link
            href="/flashcard-modules"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
          >
            Open Reading Library
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ReadingHeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="min-w-[78px] rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-3 text-center backdrop-blur">
      <p className="text-lg font-black sm:text-xl">{value}</p>
      <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function CompactPackageSection({
  hasCustomWorksheet,
  hasFlashcardLibrary,
  hasReadingModules,
  hasMathActivity,
  hasDrawLearn,
  hasSifirDeck,
  hasFreebies,
}: {
  hasCustomWorksheet: boolean;
  hasFlashcardLibrary: boolean;
  hasReadingModules: boolean;
  hasMathActivity: boolean;
  hasDrawLearn: boolean;
  hasSifirDeck: boolean;
  hasFreebies: boolean;
}) {
  const quickCards = [
    {
      title: "Custom Worksheet",
      description: "Open your purchased worksheet library.",
      href: "/custom-worksheet",
      icon: FileText,
      unlocked: hasCustomWorksheet,
    },
    {
      title: "Flashcard Library",
      description: "Open your assigned reading flashcards.",
      href: "/flashcard-library",
      icon: BookOpen,
      unlocked: hasFlashcardLibrary,
    },
    {
      title: "Modul Membaca",
      description: "Continue your interactive reading books and saved progress.",
      href: "/flashcard-modules",
      icon: BookOpenCheck,
      unlocked: hasReadingModules,
    },
    {
      title: "Math Activity",
      description: "Practice math activities and games.",
      href: "/math-activity",
      icon: Calculator,
      unlocked: hasMathActivity,
    },
    {
      title: "Draw & Learn",
      description: "Open the interactive worksheet canvas.",
      href: "/worksheet",
      icon: Palette,
      unlocked: hasDrawLearn || hasCustomWorksheet,
    },
    {
      title: "Sifir Deck",
      description: "Practice multiplication with keypad game.",
      href: "/sifir-deck",
      icon: Star,
      unlocked: hasSifirDeck,
    },
    {
      title: "Freebies",
      description: "Open free resources and printables.",
      href: "/freebies",
      icon: Gift,
      unlocked: hasFreebies,
    },
  ].filter((card) => card.unlocked);

  return (
    <section className="mt-7 rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
          YOUR UNLOCKED RESOURCES
        </p>
        <h2 className="mt-1 text-2xl font-black text-indigo-700">
          Open Your Package
        </h2>
        <p className="mt-2 text-slate-600">
          Only modules included in your package are shown here.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {quickCards.length > 0 ? (
          quickCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-[1.7rem] bg-indigo-50 p-5 transition hover:-translate-y-1 hover:bg-indigo-100"
              >
                <Icon className="text-indigo-600" size={34} />
                <h3 className="mt-4 text-2xl font-black text-indigo-700">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {card.description}
                </p>
              </Link>
            );
          })
        ) : (
          <div className="rounded-2xl bg-yellow-50 p-5 text-slate-700">
            No premium resource unlocked yet. Please WhatsApp admin after payment.
          </div>
        )}
      </div>
    </section>
  );
}

function ContinueLearningCard() {
  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
        CONTINUE LEARNING
      </p>
      <div className="mt-5 flex gap-5 rounded-[1.5rem] bg-gradient-to-br from-yellow-50 to-indigo-50 p-5">
        <div className="grid h-28 w-28 shrink-0 place-items-center rounded-2xl bg-white text-6xl shadow-sm">
          📖
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-indigo-700">
            Reading - Week 2
          </h2>
          <p className="mt-1 text-sm font-bold text-slate-600">KV + KVK</p>
          <div className="mt-4 h-3 rounded-full bg-white">
            <div className="h-3 w-[60%] rounded-full bg-indigo-600" />
          </div>
          <p className="mt-2 text-sm font-bold text-slate-500">60%</p>
        </div>
      </div>
      <Link
        href="/learning-hub"
        className="mt-5 flex items-center justify-between rounded-2xl bg-indigo-600 px-5 py-4 font-black text-white transition hover:bg-indigo-700"
      >
        Resume Learning
        <ChevronRight size={18} />
      </Link>
    </section>
  );
}

function TodayScheduleCard() {
  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
            TODAY'S SCHEDULE
          </p>
          <h2 className="mt-1 text-2xl font-black text-indigo-700">
            Daily Learning
          </h2>
        </div>
        <Link href="/learning-hub" className="text-sm font-black text-indigo-600">
          View Full Schedule
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-5">
        {dailySchedule.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-center"
          >
            <div className="text-4xl">{item.icon}</div>
            <p className="mt-2 font-black text-indigo-700">{item.title}</p>
            <p className="mt-1 text-sm font-bold text-slate-500">{item.time}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WeekProgressPanel() {
  const weeks = [
    { title: "Week 1", status: "Completed", color: "emerald" },
    { title: "Week 2", status: "Completed", color: "emerald" },
    { title: "Week 3", status: "In Progress", color: "blue" },
    { title: "Week 4", status: "Upcoming", color: "yellow" },
  ];

  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
        WEEK PROGRESS
      </p>
      <h2 className="mt-1 text-2xl font-black text-indigo-700">
        Month 1 Journey
      </h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {weeks.map((week) => (
          <div key={week.title} className="rounded-2xl bg-indigo-50 p-4">
            <p className="font-black text-indigo-700">{week.title}</p>
            <p
              className={`mt-2 inline-flex rounded-xl px-3 py-1 text-xs font-black ${
                week.color === "emerald"
                  ? "bg-emerald-100 text-emerald-700"
                  : week.color === "blue"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {week.status}
            </p>
            <div className="mt-4 flex justify-center">
              {week.status === "Completed" ? (
                <CheckCircle2 className="text-emerald-600" />
              ) : week.status === "Upcoming" ? (
                <Clock3 className="text-yellow-600" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-indigo-600" />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AchievementPanel() {
  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
            ACHIEVEMENTS
          </p>
          <h2 className="mt-1 text-2xl font-black text-indigo-700">
            Learning Awards
          </h2>
        </div>
        <Link href="/profile" className="text-sm font-black text-indigo-600">
          View All
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {["⭐", "🏆", "🛡️", "🔟"].map((badge, index) => (
          <div
            key={index}
            className="grid h-20 place-items-center rounded-2xl bg-indigo-50 text-4xl"
          >
            {badge}
          </div>
        ))}
      </div>
    </section>
  );
}

function WeeklyTopicsSection({ selectedSubject }: { selectedSubject: string }) {
  return (
    <section className="mt-7 border-t border-indigo-100 pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-indigo-700">
          {selectedSubject} - Weekly Topics
        </h2>

        <div className="hidden gap-2 sm:flex">
          <button className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500">
            ‹
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-slate-600">
            ›
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        {weeklyTopics.map((topic) => (
          <div
            key={topic.week}
            className="rounded-[1.7rem] border border-indigo-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-indigo-50 px-4 py-2 font-black text-indigo-700">
                {topic.week}
              </span>

              <span
                className={`rounded-xl px-4 py-2 text-xs font-black ${
                  topic.status === "Completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : topic.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {topic.status}
              </span>
            </div>

            <div className="mt-5 flex min-h-32 gap-3">
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900">
                  {topic.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {topic.description}
                </p>
              </div>

              <div className="self-end text-6xl">{topic.image}</div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-500">
              <Clock3 size={16} />
              Time Added: {topic.time}
            </div>

            <Link
              href="/learning-hub"
              className={`mt-4 flex items-center justify-between rounded-2xl px-5 py-3 font-black ${
                topic.status === "Upcoming"
                  ? "bg-slate-100 text-slate-400"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              }`}
            >
              View Activities
              <ChevronRight size={18} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function DailyScheduleBar() {
  return (
    <section className="mt-7 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-indigo-600 text-indigo-600">
            <Clock3 size={24} />
          </div>

          <div>
            <h3 className="font-black text-indigo-700">Daily Schedule</h3>
            <p className="text-sm text-slate-500">
              Each subject is scheduled with specific times. Tap on any topic to
              see detailed activities and resources.
            </p>
          </div>
        </div>

        <Link
          href="/learning-hub"
          className="inline-flex justify-center rounded-2xl border border-indigo-300 px-5 py-3 font-black text-indigo-700"
        >
          View Full Schedule
        </Link>
      </div>
    </section>
  );
}

function LearningResources({
  profile,
  hasFlashcardLibrary,
  hasReadingModules,
  hasFreebies,
  onlyUnlocked,
}: {
  profile: DashboardProfile | null;
  hasFlashcardLibrary: boolean;
  hasReadingModules: boolean;
  hasFreebies: boolean;
  onlyUnlocked: boolean;
}) {
  const cardsToShow = onlyUnlocked
    ? moduleCards.filter((card) => {
        if (!card.field) return true;
        if (card.field === "flashcard_unlocked") {
          return hasFlashcardLibrary;
        }
        if (card.field === "flashcard_modul_unlocked") {
          return hasReadingModules;
        }
        if (card.field === "freebies_unlocked") return hasFreebies;
        return Boolean(profile?.[card.field]);
      })
    : moduleCards;

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-black text-indigo-700">Learning Resources</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {cardsToShow.map((card) => {
          const unlocked =
            card.field === "flashcard_unlocked"
              ? hasFlashcardLibrary
              : card.field === "flashcard_modul_unlocked"
                ? hasReadingModules
                : card.field === "freebies_unlocked"
                  ? hasFreebies
                  : card.field
                    ? Boolean(profile?.[card.field])
                    : true;

          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={unlocked ? card.href : "/pricing"}
              className="rounded-[1.7rem] border border-indigo-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-700">
                  <Icon size={28} />
                </div>
                {unlocked ? (
                  <CheckCircle2 className="text-emerald-600" />
                ) : (
                  <LockKeyhole className="text-slate-400" />
                )}
              </div>

              <h3 className="mt-5 text-2xl font-black text-indigo-700">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {unlocked ? card.description : "Locked. View pricing to unlock access."}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function AdminCard({
  title,
  href,
  icon: Icon,
}: {
  title: string;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <Icon className="text-indigo-600" size={34} />
      <h2 className="mt-5 text-2xl font-black text-indigo-700">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Open admin management page.
      </p>
    </Link>
  );
}

function StatusBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-indigo-50 p-4">
      <p className="text-sm font-black tracking-[0.18em] text-yellow-600">
        {label.toUpperCase()}
      </p>

      <p className="mt-2 break-words text-lg font-black text-indigo-700">
        {value}
      </p>
    </div>
  );
}