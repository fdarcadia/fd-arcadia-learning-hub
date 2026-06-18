"use client";

import { Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { type AccessKey, emptyUserAccess, type UserAccess } from "@/lib/accountAccess";
import { supabase } from "@/lib/supabase";

type AuthGuardProps = {
  accessKey?: AccessKey;
  children: React.ReactNode;
  lockedTitle?: string;
};

export default function AuthGuard({ accessKey, children, lockedTitle = "This section is locked" }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("user_access")
        .select(
          "learning_hub_access, custom_worksheet_access, flashcard_modul_access, subscription_status"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      const nextAccess = {
        ...emptyUserAccess(),
        ...(data || {}),
      } as UserAccess;

      if (!isMounted) return;

      setIsAllowed(accessKey ? Boolean(nextAccess[accessKey]) : true);
      setLoading(false);
    }

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [accessKey]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--fd-cream)] px-6 text-[var(--fd-blue)]">
        <div className="flex items-center gap-3 rounded-lg bg-white px-5 py-4 text-sm font-black shadow-lg">
          <Loader2 className="animate-spin" size={20} aria-hidden="true" />
          Loading your learning space
        </div>
      </main>
    );
  }

  if (!isAllowed) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--fd-cream)] px-6 text-[var(--fd-blue)]">
        <section className="w-full max-w-md rounded-lg border border-[var(--fd-blue)]/10 bg-white p-7 text-center shadow-[0_20px_60px_rgba(76,87,169,0.12)]">
          <div className="mx-auto grid size-14 place-items-center rounded-lg bg-[#fff8dc] text-[var(--fd-red)]">
            <Lock size={26} aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-black">{lockedTitle}</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-[var(--fd-blue)]/70">
            Please purchase to unlock this section.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[var(--fd-blue)] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
          >
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return children;
}
