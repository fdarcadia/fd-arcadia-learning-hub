"use client";

import { ArrowRight, Lock, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import BrandLogo from "@/components/common/BrandLogo";
import { accessOptions, emptyUserAccess, getAccountTypeLabel, type UserAccess } from "@/lib/accountAccess";
import { isAdminUser } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

type Profile = {
  account_type: string | null;
  email: string | null;
  full_name: string | null;
};

function DashboardContent() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [access, setAccess] = useState<UserAccess>(emptyUserAccess());

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      if (await isAdminUser(user.id)) {
        window.location.href = "/admin";
        return;
      }

      const [{ data: profileData }, { data: accessData }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, email, account_type")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_access")
          .select(
            "learning_hub_access, custom_worksheet_access, flashcard_modul_access, subscription_status"
          )
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (!isMounted) return;

      setProfile(
        (profileData as Profile | null) || {
          account_type: null,
          email: user.email || null,
          full_name: "Parent",
        }
      );
      setAccess({
        ...emptyUserAccess(),
        ...(accessData || {}),
      } as UserAccess);
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] px-4 py-5 text-[var(--fd-blue)] md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-lg border border-[var(--fd-blue)]/10 bg-white/90 p-4 shadow-[0_18px_48px_rgba(76,87,169,0.08)] md:flex-row md:items-center md:justify-between">
          <Link href="/">
            <BrandLogo imageClassName="h-12 w-24" subtitle="Dashboard" />
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--fd-blue)]/15 bg-white px-4 py-3 text-sm font-black text-[var(--fd-blue)] transition hover:-translate-y-0.5"
            >
              <UserRound size={18} aria-hidden="true" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--fd-red)]/20 bg-white px-4 py-3 text-sm font-black text-[var(--fd-red)] transition hover:-translate-y-0.5 hover:bg-[#fff1ed]"
            >
              <LogOut size={18} aria-hidden="true" />
              Logout
            </button>
          </div>
        </header>

        <section className="mb-6 rounded-lg bg-[var(--fd-blue)] p-6 text-white shadow-[0_24px_70px_rgba(76,87,169,0.22)] md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--fd-yellow)]">
            Welcome back
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal md:text-5xl">
            {profile?.full_name || "Parent"}
          </h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-lg bg-white px-3 py-2 text-sm font-black text-[var(--fd-blue)]">
              {getAccountTypeLabel(profile?.account_type)}
            </span>
            <span className="rounded-lg bg-[#ffec87] px-3 py-2 text-sm font-black text-[var(--fd-blue)]">
              Subscription: {access.subscription_status || "inactive"}
            </span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {accessOptions.map((option) => {
            const Icon = option.icon;
            const isUnlocked = Boolean(access[option.accessKey]);

            if (!isUnlocked) {
              return (
                <article
                  key={option.accountType}
                  className="rounded-lg border border-dashed border-[var(--fd-blue)]/20 bg-white/70 p-5 opacity-85"
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <span className="grid size-12 place-items-center rounded-lg bg-slate-100 text-slate-400">
                      <Icon size={23} aria-hidden="true" />
                    </span>
                    <Lock size={20} className="text-slate-400" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-black text-slate-500">{option.label}</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                    Please purchase to unlock this section.
                  </p>
                </article>
              );
            }

            return (
              <Link
                key={option.accountType}
                href={option.href}
                className="group rounded-lg border border-[var(--fd-blue)]/10 bg-white p-5 shadow-[0_16px_44px_rgba(76,87,169,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--fd-green)]/45"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span className="grid size-12 place-items-center rounded-lg bg-[var(--fd-cream)] text-[var(--fd-blue)]">
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <ArrowRight
                    size={19}
                    className="text-[var(--fd-blue)]/45 transition group-hover:translate-x-1 group-hover:text-[var(--fd-green)]"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-xl font-black">{option.label}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[var(--fd-blue)]/65">
                  {option.description}
                </p>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
