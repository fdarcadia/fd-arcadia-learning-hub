"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Baby,
  BarChart3,
  BookOpenCheck,
  Calculator,
  CalendarDays,
  Crown,
  FileText,
  Gift,
  Layers3,
  LockKeyhole,
  Palette,
  ShieldCheck,
  Star,
  Unlock,
  UploadCloud,
  UserRound,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { type Profile, supabase, userTypeLabels } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

type ParentAccessField =
  | "learning_hub_unlocked"
  | "custom_worksheet_unlocked"
  | "flashcard_modul_unlocked"
  | "draw_learn_unlocked"
  | "sifir_deck_unlocked";

const parentFeatureCards: {
  title: string;
  href: string;
  field: ParentAccessField | null;
  icon: React.ElementType;
  color: string;
  description: string;
}[] = [
  {
    title: "Learning Hub",
    href: "/learning-hub",
    field: "learning_hub_unlocked",
    icon: BookOpenCheck,
    color: "bg-yellow-100 text-yellow-700",
    description: "Monthly schedules, weekly activities and downloads.",
  },
  {
    title: "🎁 Freebies",
    href: "/freebies",
    field: null,
    icon: Gift,
    color: "bg-orange-100 text-orange-700",
    description: "Free worksheets, flashcards, trackers and printable activities.",
  },
  {
    title: "Draw & Learn",
    href: "/worksheet",
    field: "draw_learn_unlocked",
    icon: Palette,
    color: "bg-purple-100 text-purple-700",
    description: "Interactive worksheet canvas for children.",
  },
  {
    title: "Math Activity",
    href: "/math-activity",
    field: null,
    icon: Calculator,
    color: "bg-emerald-100 text-emerald-700",
    description: "Practice tambah, tolak, darab and bahagi.",
  },
  {
    title: "Sifir Deck",
    href: "/sifir-deck",
    field: "sifir_deck_unlocked",
    icon: Star,
    color: "bg-yellow-100 text-yellow-700",
    description: "Practice multiplication using premium card and keypad game.",
  },
  {
    title: "Flashcard & Modul",
    href: "/flashcard-modul",
    field: "flashcard_modul_unlocked",
    icon: Layers3,
    color: "bg-sky-100 text-sky-700",
    description: "Access flashcards and learning modules.",
  },
  {
    title: "Custom Worksheet",
    href: "/custom-worksheet",
    field: "custom_worksheet_unlocked",
    icon: FileText,
    color: "bg-pink-100 text-pink-700",
    description: "Download custom worksheets by subject.",
  },
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
    <>
      <Navbar />

      <main className="page-shell py-8">
        <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-yellow-200" size={36} />
            <p className="tracking-[0.25em] text-yellow-200">
              ADMIN DASHBOARD
            </p>
          </div>

          <h1 className="font-display mt-4 text-5xl sm:text-6xl">
            FD Arcadia Admin
          </h1>

          <p className="mt-3 text-lg text-indigo-100">
            Manage users, subscriptions, uploads and learning activities.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-2xl bg-white px-4 py-2 font-bold text-indigo-700">
              Admin Account
            </span>

            <span className="rounded-2xl bg-yellow-200 px-4 py-2 font-bold text-indigo-700">
              {email}
            </span>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <AdminCard
            title="Manage Users"
            href="/admin"
            icon={Users}
            color="text-emerald-600"
            description="Unlock, lock and manage parent package access."
          />

          <AdminCard
            title="Learning Hub Upload"
            href="/admin/learning-hub"
            icon={BookOpenCheck}
            color="text-yellow-700"
            description="Add month, week, schedule and Google Drive links."
          />

          <AdminCard
            title="Freebies"
            href="/admin/freebies"
            icon={Gift}
            color="text-orange-600"
            description="Create folders and upload Google Drive free resources."
          />

          <AdminCard
            title="Worksheet Upload"
            href="/admin/custom-worksheet"
            icon={UploadCloud}
            color="text-pink-600"
            description="Add custom worksheet links by subject."
          />

          <AdminCard
            title="Math Activity"
            href="/admin/math-activity"
            icon={Calculator}
            color="text-emerald-600"
            description="Create math questions with answer options."
          />

          <AdminCard
            title="Sifir Deck"
            href="/admin/sifir-deck"
            icon={Star}
            color="text-yellow-600"
            description="Create and edit multiplication card deck."
          />

          <AdminCard
            title="Monthly Calendar"
            href="/admin/calendar"
            icon={CalendarDays}
            color="text-orange-600"
            description="Edit monthly calendar schedule preview by date."
          />

          <AdminCard
            title="Preview Learning Hub"
            href="/learning-hub"
            icon={BookOpenCheck}
            color="text-indigo-600"
            description="View parent Learning Hub page."
          />

          <AdminCard
            title="Preview Worksheet"
            href="/custom-worksheet"
            icon={FileText}
            color="text-pink-600"
            description="View parent custom worksheet page."
          />

          <AdminCard
            title="Draw & Learn"
            href="/worksheet"
            icon={Palette}
            color="text-purple-600"
            description="Open interactive worksheet canvas."
          />

          <AdminCard
            title="Reports"
            href="/admin/reports"
            icon={BarChart3}
            color="text-sky-600"
            description="View parent profile and access overview."
          />
        </section>
      </main>
    </>
  );
}

function AdminCard({
  title,
  href,
  icon: Icon,
  color,
  description,
}: {
  title: string;
  href: string;
  icon: React.ElementType;
  color: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[2rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <Icon className={color} size={36} />

      <h2 className="mt-5 text-3xl font-bold text-indigo-700">{title}</h2>

      <p className="mt-2 text-slate-600">{description}</p>
    </Link>
  );
}

function ParentDashboard({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [childrenCount, setChildrenCount] = useState(0);
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

      setProfile(profileData as Profile);

      const { count: childCount } = await supabase
        .from("children")
        .select("*", { count: "exact", head: true })
        .eq("parent_id", userId);

      setChildrenCount(childCount || 0);
    }

    loadDashboardData();
  }, [userId]);

  const displayName = useMemo(() => {
    return profile?.full_name?.trim() || "Parent";
  }, [profile?.full_name]);

  const packageName = profile?.package_type
    ? profile.package_type.toUpperCase()
    : "NO PACKAGE";

  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const miniCalendarDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      isToday: date.toDateString() === today.toDateString(),
    };
  });

  return (
    <>
      <Navbar />

      <main className="page-shell py-8">
        <section className="overflow-hidden rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex items-center gap-3">
            <Crown className="text-yellow-200" size={34} />
            <p className="tracking-[0.25em] text-yellow-200">WELCOME BACK</p>
          </div>

          <h1 className="font-display mt-4 break-words text-5xl sm:text-6xl">
            {displayName}
          </h1>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-2xl bg-white px-4 py-2 text-indigo-700">
              {profile?.user_type
                ? userTypeLabels[profile.user_type]
                : "Parent"}
            </span>

            <span className="rounded-2xl bg-yellow-200 px-4 py-2 text-indigo-700">
              Package: {packageName}
            </span>

            <span className="rounded-2xl bg-emerald-100 px-4 py-2 text-emerald-700">
              {profile?.subscription_start || "-"} →{" "}
              {profile?.subscription_end || "-"}
            </span>
          </div>
        </section>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            href="/children"
            className="rounded-[2rem] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <Baby className="text-orange-600" size={30} />

            <h3 className="mt-3 text-2xl font-bold text-indigo-700">
              {childrenCount} Child
            </h3>

            <p className="mt-2 text-slate-600">
              Child profiles added to your account.
            </p>
          </Link>

          <Link
            href="/profile"
            className="rounded-[2rem] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <UserRound className="text-pink-600" size={30} />

            <h3 className="mt-3 text-2xl font-bold text-indigo-700">
              My Profile
            </h3>

            <p className="mt-2 text-slate-600">
              Update name and profile picture.
            </p>
          </Link>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="tracking-[0.2em] text-sm font-bold text-yellow-600">
                WEEKLY CALENDAR
              </p>

              <h2 className="mt-1 text-3xl font-bold text-indigo-700">
                This Week
              </h2>
            </div>

            <CalendarDays className="text-indigo-600" size={34} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {miniCalendarDays.map((item) => (
              <div
                key={`${item.day}-${item.date}-${item.month}`}
                className={`rounded-[1.5rem] p-4 text-center transition hover:-translate-y-1 ${
                  item.isToday
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-indigo-50 text-indigo-700"
                }`}
              >
                <p className="font-bold">{item.day}</p>
                <p className="mt-2 text-3xl font-bold">{item.date}</p>
                <p className="text-sm">{item.month}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="tracking-[0.2em] text-sm font-bold text-yellow-600">
                CHILD LEARNING PROFILE
              </p>

              <h2 className="mt-1 text-3xl font-bold text-indigo-700">
                Manage Child Profiles
              </h2>

              <p className="mt-2 text-slate-600">
                Add child name, age, avatar and selected subjects.
              </p>
            </div>

            <Link
              href="/children"
              className="rounded-2xl bg-orange-500 px-6 py-4 font-bold text-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              Add / View Children
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {parentFeatureCards.map((card) => {
            const unlocked = card.field ? Boolean(profile?.[card.field]) : true;
            const Icon = card.icon;

            const content = (
              <div
                className={`soft-card min-h-72 rounded-[2rem] p-6 transition ${
                  unlocked
                    ? "hover:-translate-y-1 hover:shadow-2xl"
                    : "border-dashed opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`grid h-16 w-16 place-items-center rounded-2xl ${card.color}`}
                  >
                    <Icon size={30} />
                  </div>

                  {unlocked ? (
                    <Unlock className="text-emerald-600" size={26} />
                  ) : (
                    <LockKeyhole className="text-slate-400" size={26} />
                  )}
                </div>

                <h2 className="mt-10 text-3xl font-bold text-indigo-700">
                  {card.title}
                </h2>

                <p className="mt-4 text-lg leading-8 text-slate-600">
                  {unlocked
                    ? card.description
                    : "Please purchase to unlock this section."}
                </p>

                {unlocked ? (
                  <p className="mt-4 rounded-2xl bg-yellow-100 px-4 py-2 text-yellow-800">
                    Tap to open
                  </p>
                ) : null}
              </div>
            );

            return unlocked ? (
              <Link key={card.title} href={card.href} className="block">
                {content}
              </Link>
            ) : (
              <div key={card.title}>{content}</div>
            );
          })}
        </section>
      </main>
    </>
  );
}