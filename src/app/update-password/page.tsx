"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <UpdatePasswordContent />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4">
      <div className="rounded-[22px] border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
        <Loader2 className="mx-auto animate-spin text-indigo-600" size={28} />
        <p className="mt-3 text-sm font-black text-slate-600">
          Loading password page...
        </p>
      </div>
    </main>
  );
}

function UpdatePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function setupRecoverySession() {
      setCheckingSession(true);
      setErrorMessage("");

      const url = new URL(window.location.href);
      const code = searchParams.get("code");
      const error = searchParams.get("error_description");

      if (error) {
        setErrorMessage(error);
        setHasSession(false);
        setCheckingSession(false);
        return;
      }

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          setErrorMessage(
            "Reset link is invalid or expired. Please request a new reset link."
          );
          setHasSession(false);
          setCheckingSession(false);
          return;
        }

        window.history.replaceState({}, document.title, url.pathname);
      }

      const { data } = await supabase.auth.getSession();

      setHasSession(Boolean(data.session));
      setCheckingSession(false);
    }

    setupRecoverySession();
  }, [searchParams]);

  async function handleUpdatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!hasSession) {
      setErrorMessage(
        "Reset session not found. Please request a new reset link."
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password and confirm password do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Password updated successfully. Redirecting to login...");

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[1240px] items-center">
        <section className="grid w-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.13)] lg:grid-cols-[0.92fr_1.08fr]">
          {/* LEFT PREMIUM PANEL */}
          <aside className="relative hidden min-h-[690px] overflow-hidden bg-gradient-to-br from-[#111735] via-[#25265f] to-[#4c3fc9] p-9 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
            <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-indigo-300/10 blur-3xl" />

            <div className="relative">
              <Link href="/" className="inline-flex items-center gap-3">
                {/* Optional custom logo:
                <img
                  src="/fd-arcadia-logo.png"
                  alt="FD Arcadia"
                  className="h-12 w-auto object-contain"
                />
                */}
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/10 text-yellow-300 shadow-sm backdrop-blur">
                  <Sparkles size={24} />
                </div>

                <div>
                  <p className="text-sm font-black tracking-[0.12em]">
                    FD ARCADIA
                  </p>
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-violet-300">
                    Password Recovery
                  </p>
                </div>
              </Link>

              <div className="mt-16 max-w-lg">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-violet-200">
                  <ShieldCheck size={14} />
                  Secure Account Update
                </div>

                <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
                  Create a new password securely.
                </h1>

                <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                  Choose a password you can remember easily, but that is difficult
                  for others to guess.
                </p>
              </div>

              <div className="mt-10 grid gap-3">
                <SecurityTip text="Use at least 6 characters." />
                <SecurityTip text="Mix letters and numbers where possible." />
                <SecurityTip text="Avoid reusing an old password." />
              </div>
            </div>

            <div className="relative rounded-[20px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-emerald-300">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-black">Protected Reset Session</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                    Password updates only work with a valid recovery session.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT FORM PANEL */}
          <section className="p-5 sm:p-8 lg:p-10 xl:p-12">
            <div className="mx-auto flex h-full max-w-[520px] flex-col justify-center">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-indigo-600"
                >
                  <ArrowLeft size={15} />
                  Back to login
                </Link>

                <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-indigo-700">
                  Password Recovery
                </div>
              </div>

              <div className="mt-10">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <KeyRound size={22} />
                </div>

                <p className="mt-5 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
                  Update Password
                </p>

                <h2 className="mt-1 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Set a new password
                </h2>

                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                  Enter your new password below to complete account recovery.
                </p>
              </div>

              {checkingSession ? (
                <div className="mt-7 flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
                  <Loader2 className="animate-spin" size={16} />
                  Checking reset link...
                </div>
              ) : !hasSession ? (
                <div className="mt-7 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-800">
                  Reset session not found. Please request a new reset link from the
                  forgot password page.
                </div>
              ) : null}

              <form onSubmit={handleUpdatePassword} className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-xs font-black text-slate-600">
                    New password
                  </span>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="New password"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black text-slate-600">
                    Confirm password
                  </span>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm password"
                  />
                </label>

                {message ? (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold leading-5 text-emerald-700">
                    {message}
                  </div>
                ) : null}

                {errorMessage ? (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-700">
                    {errorMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading || checkingSession || !hasSession}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <KeyRound size={18} />
                  )}
                  {loading ? "Updating password..." : "Update password"}
                </button>
              </form>

              <div className="mt-7 border-t border-slate-100 pt-6">
                <Link
                  href="/forgot-password"
                  className="block text-center text-xs font-black text-indigo-600 transition hover:text-indigo-700"
                >
                  Request a new reset link
                </Link>
              </div>

              <p className="mt-8 text-center text-[10px] font-semibold leading-5 text-slate-400">
                Your password will only be changed when a valid recovery session
                is available.
              </p>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function SecurityTip({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300">
        <CheckCircle2 size={16} />
      </div>
      <p className="text-[10px] font-semibold leading-5 text-slate-300">
        {text}
      </p>
    </div>
  );
}