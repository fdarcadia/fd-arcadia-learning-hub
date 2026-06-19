"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-emerald-50 px-4">
      <div className="rounded-[2rem] bg-white p-8 text-center font-black text-slate-700 shadow-xl">
        Loading password page...
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
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-emerald-50 px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden rounded-[2.5rem] bg-indigo-600 p-8 text-white shadow-2xl lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/15">
              <ShieldCheck className="text-yellow-200" size={34} />
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-200">
                FD Arcadia
              </p>
              <p className="font-display text-3xl">Learning Hub</p>
            </div>
          </div>

          <h1 className="font-display mt-16 text-6xl font-black leading-tight">
            Create your new password.
          </h1>

          <p className="mt-6 max-w-xl text-xl leading-9 text-indigo-100">
            Use a secure password that is easy for you to remember but hard for
            others to guess.
          </p>

          <div className="mt-12 rounded-3xl bg-white/10 p-5">
            <p className="font-black text-yellow-100">Password tip</p>
            <p className="mt-1 text-indigo-50">
              Use at least 6 characters. A mix of letters and numbers is better.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl rounded-[2.5rem] border border-white/80 bg-white/90 p-6 shadow-2xl sm:p-8">
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-slate-50 px-5 py-3 font-black text-slate-700 shadow-sm"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back to login
          </Link>

          <div className="mt-8">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-yellow-100 text-yellow-700">
              <KeyRound size={38} />
            </div>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-emerald-500">
              Password Recovery
            </p>

            <h1 className="font-display mt-3 text-5xl font-black leading-tight text-slate-900">
              Update password
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-500">
              Create your new password below.
            </p>
          </div>

          {checkingSession ? (
            <div className="mt-8 rounded-3xl bg-yellow-50 p-5 text-sm font-bold text-yellow-700">
              Checking reset link...
            </div>
          ) : !hasSession ? (
            <div className="mt-8 rounded-3xl bg-yellow-50 p-5 text-sm font-bold leading-7 text-yellow-700">
              Reset session not found. Please request a new reset link from the
              forgot password page.
            </div>
          ) : null}

          <form onSubmit={handleUpdatePassword} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-black text-slate-600">
                New password
              </span>
              <input
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-lg font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New password"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-slate-600">
                Confirm password
              </span>
              <input
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-lg font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm password"
              />
            </label>

            {message && (
              <div className="rounded-3xl bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-700">
                {message}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-3xl bg-red-50 p-4 text-sm font-bold leading-6 text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || checkingSession || !hasSession}
              className="w-full rounded-3xl bg-indigo-600 px-6 py-4 text-lg font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating password..." : "Update password"}
            </button>
          </form>

          <Link
            href="/forgot-password"
            className="mt-6 block text-center text-sm font-black text-indigo-600 underline"
          >
            Request new reset link
          </Link>
        </section>
      </div>
    </main>
  );
}