"use client";

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
};

type ParentAccessField =
  | "learning_hub_unlocked"
  | "custom_worksheet_unlocked"
  | "math_activity_unlocked"
  | "draw_learn_unlocked"
  | "sifir_deck_unlocked"
  | "freebies_unlocked"
  | "flashcard_unlocked"
  | "flashcard_modul_unlocked";

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
};

const packageLabels: Record<string, string> = {
  math_package: "Math Package RM25",
  learning_hub_weekly: "Learning Hub Weekly RM30",
  learning_hub_monthly: "Learning Hub Monthly RM50",
  learning_hub_6month: "Learning Hub Premium RM210",
  full_package: "Full Package RM250",
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
  packageGroup: "learning_hub" | "custom_worksheet" | "flashcard" | "math" | "free";
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
  { title: "Manage Users", href: "/admin", icon: Users },
  { title: "Learning Hub Upload", href: "/admin/learning-hub", icon: BookOpenCheck },
  { title: "Flashcard Library", href: "/admin/flashcard-library", icon: BookOpen },
  { title: "Freebies", href: "/admin/freebies", icon: Gift },
  { title: "Worksheet Upload", href: "/admin/custom-worksheet", icon: UploadCloud },
  { title: "Math Activity", href: "/admin/math-activity", icon: Calculator },
  { title: "Sifir Deck", href: "/admin/sifir-deck", icon: Star },
  { title: "Monthly Calendar", href: "/admin/calendar", icon: CalendarDays },
  { title: "Reports", href: "/admin/reports", icon: BarChart3 },
];

export default function DashboardPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <AdminDashboard email={user.email ?? ""} />
        ) : (
          <ParentDashboard userId={user.id} />
        )
      }
    </ProtectedPage>
  );
}

function AdminDashboard({ email }: { email: string }) {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-8 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
              <ShieldCheck className="text-yellow-200" size={34} />
            </div>
            <div>
              <p className="text-sm font-black tracking-[0.25em] text-yellow-200">
                ADMIN DASHBOARD
              </p>
              <h1 className="mt-1 text-4xl font-black sm:text-5xl">
                FD Arcadia Admin
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-indigo-100">
            Manage users, subscriptions, uploads, learning activities,
            flashcards, calendar and reports.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-2xl bg-white px-4 py-2 font-black text-indigo-700">
              Admin Account
            </span>
            <span className="rounded-2xl bg-yellow-200 px-4 py-2 font-black text-indigo-700">
              {email}
            </span>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {adminCards.map((card) => (
            <AdminCard key={card.title} {...card} />
          ))}
        </section>
      </div>
    </main>
  );
}

function ParentDashboard({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("Warm Up");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        return;
      }

      setProfile(profileData as DashboardProfile);

      const { data: childrenData } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", userId)
        .limit(8);

      setChildren((childrenData || []) as ChildProfile[]);
    }

    loadDashboardData();
  }, [userId]);

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
  const hasFlashcard = Boolean(
    profile?.flashcard_unlocked || profile?.flashcard_modul_unlocked
  );

  const unlockedCount = moduleCards.filter((card) => {
    if (!card.field) return true;
    if (card.field === "flashcard_unlocked" || card.field === "flashcard_modul_unlocked") {
      return hasFlashcard;
    }
    if (card.field === "freebies_unlocked") return hasFreebies;
    return Boolean(profile?.[card.field]);
  }).length;

  const overallProgress = Math.max(
    35,
    Math.round((unlockedCount / moduleCards.length) * 100)
  );

  const shouldShowLearningHubDashboard = hasLearningHub;
  const shouldShowCompactPackageDashboard = !hasLearningHub;

  const whatsappText = encodeURIComponent(
    `Hi FD Arcadia, I would like to subscribe or upgrade my package. My registered email is ${
      profile?.email || ""
    }.`
  );

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[290px_1fr]">
        <ParentSidebar
          packageName={packageName}
          endDate={profile?.subscription_end || "-"}
          hasLearningHub={hasLearningHub}
          hasCustomWorksheet={hasCustomWorksheet}
          hasFlashcard={hasFlashcard}
        />

        <section className="px-4 py-6 lg:px-8">
          <TopHeader displayName={displayName} avatarUrl={profile?.avatar_url || null} />

          {error ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
              {error}
            </div>
          ) : null}

          <section className="rounded-[2rem] border border-indigo-100 bg-white p-5 shadow-sm lg:p-6">
            <div className="grid gap-7 2xl:grid-cols-[0.95fr_1.05fr]">
              <ParentSummaryCard
                displayName={displayName}
                email={profile?.email || "-"}
                avatarUrl={profile?.avatar_url || null}
                packageName={packageName}
                startDate={profile?.subscription_start || "-"}
                endDate={profile?.subscription_end || "-"}
                childrenCount={children.length}
              />

              {shouldShowLearningHubDashboard ? (
                <OverallProgressPanel overallProgress={overallProgress} />
              ) : (
                <CompactAccessPanel
                  hasCustomWorksheet={hasCustomWorksheet}
                  hasFlashcard={hasFlashcard}
                  hasMathActivity={hasMathActivity}
                  hasDrawLearn={hasDrawLearn}
                  hasSifirDeck={hasSifirDeck}
                  hasFreebies={hasFreebies}
                  overallProgress={overallProgress}
                />
              )}
            </div>
          </section>

          <ChildrenMiniSection children={children} />

          {shouldShowLearningHubDashboard ? (
            <>
              <section className="mt-7 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <ContinueLearningCard />
                <TodayScheduleCard />
              </section>

              <section className="mt-7 grid gap-6 xl:grid-cols-[1fr_1fr]">
                <WeekProgressPanel />
                <AchievementPanel />
              </section>

              <section className="mt-8">
                <div className="mb-4">
                  <h2 className="text-2xl font-black text-indigo-700">Subjects</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
                  {subjectTabs.map((subject) => (
                    <button
                      key={subject.title}
                      onClick={() => setSelectedSubject(subject.title)}
                      className={`rounded-2xl border bg-white px-5 py-4 text-left font-black shadow-sm transition hover:-translate-y-1 ${
                        selectedSubject === subject.title
                          ? "border-indigo-500 text-indigo-700 ring-4 ring-indigo-50"
                          : "border-indigo-100 text-slate-600"
                      }`}
                    >
                      <span className="mr-3 text-3xl">{subject.icon}</span>
                      {subject.title}
                    </button>
                  ))}
                </div>
              </section>

              <WeeklyTopicsSection selectedSubject={selectedSubject} />

              <DailyScheduleBar />
            </>
          ) : null}

          {shouldShowCompactPackageDashboard ? (
            <CompactPackageSection
              hasCustomWorksheet={hasCustomWorksheet}
              hasFlashcard={hasFlashcard}
              hasMathActivity={hasMathActivity}
              hasDrawLearn={hasDrawLearn}
              hasSifirDeck={hasSifirDeck}
              hasFreebies={hasFreebies}
            />
          ) : null}

          <LearningResources
            profile={profile}
            hasFlashcard={hasFlashcard}
            hasFreebies={hasFreebies}
            onlyUnlocked={shouldShowCompactPackageDashboard}
          />

          <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <section className="rounded-[2rem] border border-yellow-200 bg-yellow-50 p-6">
              <h2 className="text-2xl font-black text-indigo-700">
                Payment & Access Information
              </h2>
              <p className="mt-3 text-slate-700">
                All package purchases are processed manually by FD Arcadia
                Learning Hub.
              </p>
              <ol className="mt-4 space-y-2 text-slate-700">
                <li>1. Register your account.</li>
                <li>2. Choose your preferred package.</li>
                <li>3. WhatsApp admin with your registered email and payment proof.</li>
                <li>4. Admin will unlock your package after confirmation.</li>
              </ol>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/pricing"
                  className="inline-flex justify-center rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white transition hover:bg-indigo-700"
                >
                  View Packages
                </Link>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center rounded-2xl bg-green-500 px-5 py-3 font-black text-white transition hover:bg-green-600"
                >
                  WhatsApp Admin
                </a>
              </div>
            </section>

            <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-indigo-700">
                Current Package Status
              </h2>
              <div className="mt-4 grid gap-4">
                <StatusBox label="Package" value={packageName} />
                <StatusBox label="Start Date" value={profile?.subscription_start || "-"} />
                <StatusBox label="End Date" value={profile?.subscription_end || "-"} />
              </div>
            </section>
          </section>
        </section>
      </div>
    </main>
  );
}

function ParentSidebar({
  packageName,
  endDate,
  hasLearningHub,
  hasCustomWorksheet,
  hasFlashcard,
}: {
  packageName: string;
  endDate: string;
  hasLearningHub: boolean;
  hasCustomWorksheet: boolean;
  hasFlashcard: boolean;
}) {
  const sidebarLinks = [
    { title: "Dashboard", href: "/dashboard", icon: Home, section: "main", show: true },
    { title: "My Children", href: "/children", icon: Users, section: "main", show: true },

    { title: "Month 1", href: "/learning-hub/month-1", icon: CalendarDays, section: "hub", show: hasLearningHub },
    { title: "Month 2", href: "/learning-hub/month-2", icon: CalendarDays, section: "hub", show: hasLearningHub },
    { title: "Month 3", href: "/learning-hub/month-3", icon: CalendarDays, section: "hub", show: hasLearningHub },
    { title: "Month 4", href: "/learning-hub/month-4", icon: CalendarDays, section: "hub", show: hasLearningHub },
    { title: "Month 5", href: "/learning-hub/month-5", icon: CalendarDays, section: "hub", show: hasLearningHub },
    { title: "Month 6", href: "/learning-hub/month-6", icon: CalendarDays, section: "hub", show: hasLearningHub },

    { title: "Custom Worksheet", href: "/custom-worksheet", icon: FileText, section: "extra", show: hasCustomWorksheet },
    { title: "Flashcard Library", href: "/flashcard-library", icon: BookOpen, section: "extra", show: hasFlashcard },
    { title: "Freebies", href: "/freebies", icon: Gift, section: "extra", show: true },
    { title: "Progress Reports", href: "/profile", icon: BarChart3, section: "extra", show: true },
  ];

  const visibleLinks = sidebarLinks.filter((item) => item.show);

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
            LEARNING HUB
          </p>
        </div>
      </Link>

      <nav className="mt-10 space-y-2">
        {visibleLinks.map((item, index) => {
          const Icon = item.icon;
          const active = index === 0 || (hasLearningHub && item.title === "Month 1");
          const showLabel =
            index === 2 || (index > 1 && visibleLinks[index - 1].section !== item.section);

          return (
            <div key={item.title}>
              {showLabel ? (
                <p className="mb-2 mt-6 text-xs font-black tracking-[0.2em] text-slate-400">
                  {item.section === "hub" ? "LEARNING HUB" : "MORE"}
                </p>
              ) : null}

              <Link
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
            </div>
          );
        })}
      </nav>

      <div className="mt-10 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl">
        <Crown className="text-yellow-200" size={30} />
        <p className="mt-4 font-black">You're on</p>
        <h3 className="mt-1 text-xl font-black">{packageName}</h3>
        <p className="mt-2 text-sm text-indigo-100">Valid until {endDate}</p>
        <Link
          href="/pricing"
          className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-black text-indigo-700"
        >
          View Plan
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

  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <div className="xl:hidden">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-yellow-200">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-lg font-black tracking-[0.16em]">FD ARCADIA</p>
            <p className="text-xs font-black tracking-[0.22em] text-indigo-600">
              LEARNING HUB
            </p>
          </div>
        </Link>
      </div>

      <div className="hidden xl:block">
        <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
          PARENT DASHBOARD
        </p>
        <h1 className="text-3xl font-black text-indigo-700">
          Good Morning, {displayName} 👋
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <Bell size={22} />
          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-xs font-black text-white">
            3
          </span>
        </div>
        <Link
          href="/profile"
          className="hidden rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-sm sm:block"
        >
          Parent
        </Link>
        <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-yellow-100 text-3xl">
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

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-black text-white shadow-sm transition hover:bg-red-600"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
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
  hasFlashcard,
  hasMathActivity,
  hasDrawLearn,
  hasSifirDeck,
  hasFreebies,
  overallProgress,
}: {
  hasCustomWorksheet: boolean;
  hasFlashcard: boolean;
  hasMathActivity: boolean;
  hasDrawLearn: boolean;
  hasSifirDeck: boolean;
  hasFreebies: boolean;
  overallProgress: number;
}) {
  const accessRows = [
    { title: "Custom Worksheet", unlocked: hasCustomWorksheet, icon: "📝" },
    { title: "Flashcard Library", unlocked: hasFlashcard, icon: "📚" },
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

function CompactPackageSection({
  hasCustomWorksheet,
  hasFlashcard,
  hasMathActivity,
  hasDrawLearn,
  hasSifirDeck,
  hasFreebies,
}: {
  hasCustomWorksheet: boolean;
  hasFlashcard: boolean;
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
      unlocked: hasFlashcard,
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
  hasFlashcard,
  hasFreebies,
  onlyUnlocked,
}: {
  profile: DashboardProfile | null;
  hasFlashcard: boolean;
  hasFreebies: boolean;
  onlyUnlocked: boolean;
}) {
  const cardsToShow = onlyUnlocked
    ? moduleCards.filter((card) => {
        if (!card.field) return true;
        if (card.field === "flashcard_unlocked" || card.field === "flashcard_modul_unlocked") {
          return hasFlashcard;
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
            card.field === "flashcard_unlocked" || card.field === "flashcard_modul_unlocked"
              ? hasFlashcard
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
