"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpenCheck,
  FileText,
  Layers3,
  Search,
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
              <h1 className="text-3xl font-bold text-red-600">
                Access denied
              </h1>
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

  return (
    <>
      <Navbar />

      <main className="page-shell py-8">
        <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl">
          <p className="tracking-[0.25em] text-yellow-200">
            ADMIN REPORTS
          </p>

          <h1 className="font-display mt-2 text-5xl">
            Parent Reports
          </h1>

          <p className="mt-2 text-indigo-100">
            View parent profile, subscription and access overview.
          </p>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-sm"
          >
            Back to Admin Dashboard
          </Link>

          <Link
            href="/admin"
            className="rounded-2xl bg-white px-5 py-3 font-bold text-indigo-700 shadow-sm"
          >
            Manage Users
          </Link>
        </div>

        <section className="mt-8 grid gap-5 md:grid-cols-4">
          <StatCard
            title="Total Parents"
            value={totalParents}
            icon={Users}
            color="text-indigo-600"
          />

          <StatCard
            title="Learning Hub"
            value={learningHubCount}
            icon={BookOpenCheck}
            color="text-yellow-700"
          />

          <StatCard
            title="Custom Worksheet"
            value={customWorksheetCount}
            icon={FileText}
            color="text-pink-600"
          />

          <StatCard
            title="Flashcard"
            value={flashcardCount}
            icon={Layers3}
            color="text-sky-600"
          />
        </section>

        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white px-4 py-3 shadow-sm">
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
            <div
              key={profile.id}
              className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-indigo-700">
                    {profile.full_name || "No name"}
                  </h2>

                  <p className="text-slate-600">{profile.email}</p>

                  <p className="mt-2 text-sm text-slate-500">
                    Type: {profile.user_type || "Not selected"}
                  </p>
                </div>

                <div className="rounded-2xl bg-yellow-100 px-4 py-2 font-bold text-yellow-800">
                  {profile.package_type
                    ? profile.package_type.toUpperCase()
                    : "NO PACKAGE"}
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-indigo-50 p-4 text-sm text-slate-700">
                <p>Package: {profile.package_type || "-"}</p>
                <p>Start: {profile.subscription_start || "-"}</p>
                <p>End: {profile.subscription_end || "-"}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
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
          ))}

          {filteredProfiles.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-slate-600">
                No parent profile found.
              </h2>
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <Icon className={color} size={32} />

      <h2 className="mt-3 text-4xl font-bold text-indigo-700">
        {value}
      </h2>

      <p className="mt-1 text-slate-600">{title}</p>
    </div>
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
      className={`rounded-2xl px-4 py-2 font-bold ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {label}: {active ? "Unlocked" : "Locked"}
    </span>
  );
}