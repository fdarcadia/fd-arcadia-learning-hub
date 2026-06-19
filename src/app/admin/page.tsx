"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Calculator,
  CalendarDays,
  FileText,
  Gift,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UploadCloud,
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
  draw_learn_unlocked: boolean;
  sifir_deck_unlocked: boolean;
  package_type: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
};

type AccessField =
  | "learning_hub_unlocked"
  | "custom_worksheet_unlocked"
  | "flashcard_modul_unlocked"
  | "draw_learn_unlocked"
  | "sifir_deck_unlocked";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

const packageOptions = [
  { value: "trial", label: "Trial RM30", weeks: 1 },
  { value: "monthly", label: "Monthly RM50", months: 1 },
  { value: "premium", label: "Premium RM250", months: 6 },
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
    (option) => option.value === packageType
  );

  if (selectedPackage?.weeks) {
    return addDays(startDate, selectedPackage.weeks * 7);
  }

  return addMonths(startDate, selectedPackage?.months ?? 1);
}

export default function AdminPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <AdminContent />
        ) : (
          <>
            <Navbar />

            <main className="page-shell py-10">
              <h1 className="text-3xl font-bold text-red-600">
                Access denied
              </h1>

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

function AdminContent() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
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

  const filteredProfiles = useMemo(() => {
    const keyword = search.toLowerCase();

    return profiles.filter((profile) => {
      return (
        profile.email?.toLowerCase().includes(keyword) ||
        profile.full_name?.toLowerCase().includes(keyword) ||
        profile.user_type?.toLowerCase().includes(keyword) ||
        profile.package_type?.toLowerCase().includes(keyword)
      );
    });
  }, [profiles, search]);

async function toggleAccess(
  id: string,
  field: AccessField,
  currentValue: boolean
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
    current.map((profile) => (profile.id === id ? data : profile))
  );
}

  async function saveSubscription(
    profile: Profile,
    packageType: string,
    startDate: string
  ) {
    if (!startDate) {
      setError("Please choose subscription start date.");
      return;
    }

    const endDate = getEndDate(packageType, startDate);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        package_type: packageType,
        subscription_start: startDate,
        subscription_end: endDate,
        learning_hub_unlocked: true,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setProfiles((current) =>
      current.map((item) =>
        item.id === profile.id
          ? {
              ...item,
              package_type: packageType,
              subscription_start: startDate,
              subscription_end: endDate,
              learning_hub_unlocked: true,
            }
          : item
      )
    );

    setError("");
  }

  return (
    <>
      <AdminHeader />

      <main className="page-shell py-8">
        <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <ShieldCheck size={34} />

            <div>
              <p className="tracking-[0.25em] text-yellow-200">
                ADMIN PANEL
              </p>

              <h1 className="font-display mt-1 text-5xl">Admin Dashboard</h1>

              <p className="mt-2 text-indigo-100">
                Manage users, subscriptions, freebies, sifir deck and monthly
                schedule.
              </p>
            </div>
          </div>
        </section>

        <MonthlyCalendarPreview />

        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AdminQuickLink
            href="/admin/learning-hub"
            icon={BookOpenCheck}
            title="Learning Hub"
            description="Add month, week and Google Drive links."
            color="text-yellow-700"
          />

          <AdminQuickLink
            href="/admin/freebies"
            icon={Gift}
            title="Freebies"
            description="Create folders and upload Google Drive free resources."
            color="text-orange-600"
          />

          <AdminQuickLink
            href="/admin/custom-worksheet"
            icon={UploadCloud}
            title="Worksheet Upload"
            description="Add worksheet links by subject."
            color="text-pink-600"
          />

          <AdminQuickLink
            href="/admin/math-activity"
            icon={Calculator}
            title="Math Activity"
            description="Create math questions and answers."
            color="text-emerald-600"
          />

          <AdminQuickLink
            href="/admin/sifir-deck"
            icon={Star}
            title="Sifir Deck"
            description="Create multiplication card deck."
            color="text-yellow-600"
          />

          <AdminQuickLink
            href="/admin/calendar"
            icon={CalendarDays}
            title="Monthly Schedule"
            description="Create and preview monthly class schedule."
            color="text-indigo-600"
          />

          <AdminQuickLink
            href="/admin/reports"
            icon={FileText}
            title="Reports"
            description="View parent profile and access report."
            color="text-purple-600"
          />
        </section>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white px-4 py-3 shadow-sm">
          <Search className="text-indigo-500" size={22} />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, package or user type..."
            className="w-full bg-transparent text-lg outline-none"
          />
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-8 grid gap-5">
          {filteredProfiles.map((profile) => (
            <UserCard
              key={profile.id}
              profile={profile}
              onToggle={toggleAccess}
              onSaveSubscription={saveSubscription}
            />
          ))}
        </section>
      </main>
    </>
  );
}

function AdminHeader() {
  return (
    <header className="border-b border-indigo-100 bg-white/90 backdrop-blur">
      <div className="page-shell flex items-center justify-between py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white">
            <ShieldCheck size={24} />
          </div>

          <div>
            <p className="font-display text-2xl text-indigo-700">FD Arcadia</p>
            <p className="text-xs font-bold tracking-[0.2em] text-yellow-600">
              ADMIN
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-indigo-50 px-4 py-2 font-bold text-indigo-700 transition hover:bg-indigo-100"
          >
            Dashboard
          </Link>

          <Link
            href="/logout"
            className="rounded-2xl bg-yellow-100 px-4 py-2 font-bold text-yellow-800 transition hover:bg-yellow-200"
          >
            Logout
          </Link>
        </nav>
      </div>
    </header>
  );
}

function MonthlyCalendarPreview() {
  const [activeIndex, setActiveIndex] = useState(0);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const monthTitle = today.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - startDay + 1;
    const isCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
    const isToday = isCurrentMonth && dayNumber === today.getDate();

    return {
      key: index,
      dayNumber: isCurrentMonth ? dayNumber : "",
      isToday,
      isCurrentMonth,
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % calendarCells.length);
    }, 700);

    return () => clearInterval(timer);
  }, [calendarCells.length]);

  return (
    <Link
      href="/admin/calendar"
      className="mt-6 block overflow-hidden rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-500" size={24} />

            <p className="tracking-[0.2em] text-sm font-bold text-yellow-600">
              MONTHLY CALENDAR PREVIEW
            </p>
          </div>

          <h2 className="mt-2 text-4xl font-bold text-indigo-700">
            {monthTitle}
          </h2>

          <p className="mt-2 text-slate-600">
            Tap here to edit monthly schedule by date.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white">
          Open Calendar
          <ArrowRight size={20} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-xs font-bold text-slate-400">
            {day}
          </div>
        ))}

        {calendarCells.map((cell, index) => {
          const isMoving = index === activeIndex && cell.isCurrentMonth;

          return (
            <div
              key={cell.key}
              className={`grid h-11 place-items-center rounded-2xl text-sm font-bold transition-all duration-500 ${
                cell.isToday
                  ? "scale-105 bg-indigo-600 text-white shadow-lg"
                  : isMoving
                  ? "scale-105 bg-yellow-200 text-indigo-700 shadow-md"
                  : cell.isCurrentMonth
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-slate-50 text-slate-300"
              }`}
            >
              {cell.dayNumber}
            </div>
          );
        })}
      </div>
    </Link>
  );
}

function AdminQuickLink({
  href,
  icon: Icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[2rem] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <Icon className={color} size={34} />

      <h2 className="mt-4 text-2xl font-bold text-indigo-700">{title}</h2>

      <p className="mt-2 text-slate-600">{description}</p>
    </Link>
  );
}

function UserCard({
  profile,
  onToggle,
  onSaveSubscription,
}: {
  profile: Profile;
  onToggle: (id: string, field: AccessField, currentValue: boolean) => void;
  onSaveSubscription: (
    profile: Profile,
    packageType: string,
    startDate: string
  ) => void;
}) {
  const [packageType, setPackageType] = useState(
    profile.package_type || "trial"
  );

  const [startDate, setStartDate] = useState(
    profile.subscription_start || new Date().toISOString().slice(0, 10)
  );

  const previewEndDate = startDate ? getEndDate(packageType, startDate) : "-";

  return (
    <div className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-indigo-700">
            {profile.full_name || "No name"}
          </h2>

          <p className="text-slate-600">{profile.email}</p>

          <p className="text-sm text-slate-500">
            Type: {profile.user_type || "Not selected"}
          </p>
        </div>

        <div className="rounded-2xl bg-yellow-100 px-4 py-2 font-bold text-yellow-800">
          {profile.package_type
            ? profile.package_type.toUpperCase()
            : "NO PACKAGE"}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-yellow-50 p-4 text-sm text-slate-700">
        <p>Package: {profile.package_type || "Not set"}</p>
        <p>Start: {profile.subscription_start || "-"}</p>
        <p>End: {profile.subscription_end || "-"}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <AccessButton
          label="Learning Hub"
          active={profile.learning_hub_unlocked}
          onClick={() =>
            onToggle(
              profile.id,
              "learning_hub_unlocked",
              profile.learning_hub_unlocked
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
              profile.custom_worksheet_unlocked
            )
          }
        />

        <AccessButton
          label="Flashcard"
          active={profile.flashcard_modul_unlocked}
          onClick={() =>
            onToggle(
              profile.id,
              "flashcard_modul_unlocked",
              profile.flashcard_modul_unlocked
            )
          }
        />

        <AccessButton
          label="Draw & Learn"
          active={profile.draw_learn_unlocked}
          onClick={() =>
            onToggle(profile.id, "draw_learn_unlocked", profile.draw_learn_unlocked)
          }
        />

        <AccessButton
          label="Sifir Deck"
          active={profile.sifir_deck_unlocked}
          onClick={() =>
            onToggle(
              profile.id,
              "sifir_deck_unlocked",
              profile.sifir_deck_unlocked
            )
          }
        />
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-indigo-100 bg-indigo-50 p-4">
        <div className="flex items-center gap-2 text-indigo-700">
          <CalendarDays size={20} />

          <p className="font-bold">Learning Hub Subscription</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <select
            value={packageType}
            onChange={(event) => setPackageType(event.target.value)}
            className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 outline-none"
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
            className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 outline-none"
          />

          <button
            onClick={() => onSaveSubscription(profile, packageType, startDate)}
            className="rounded-2xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700"
          >
            Save Subscription
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          End date preview: {previewEndDate}
        </p>
      </div>
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
      onClick={onClick}
      className={`rounded-2xl px-4 py-4 font-bold transition ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {label}: {active ? "Unlocked" : "Locked"}
    </button>
  );
}