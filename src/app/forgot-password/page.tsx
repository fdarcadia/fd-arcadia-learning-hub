"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");
    setLoading(true);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/update-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Reset link sent. Please check your email inbox or spam folder.");
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
                  Secure Reset
                </div>

                <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
                  Reset your password safely.
                </h1>

                <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                  Enter your registered email and we&apos;ll send a secure link
                  so you can create a new password.
                </p>
              </div>

              <div className="mt-10 grid gap-3">
                <RecoveryStep number="1" text="Enter your registered email." />
                <RecoveryStep number="2" text="Open the reset link from your email." />
                <RecoveryStep number="3" text="Create and confirm your new password." />
              </div>
            </div>

            <div className="relative rounded-[20px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-emerald-300">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-black">Secure Recovery Flow</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                    Password reset links are sent through your registered email.
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
                  <Mail size={22} />
                </div>

                <p className="mt-5 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
                  Forgot Password
                </p>

                <h2 className="mt-1 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Reset your password
                </h2>

                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                  Enter your registered email address and we&apos;ll send you a
                  reset link.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-xs font-black text-slate-600">
                    Email
                  </span>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="yourname@email.com"
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
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Mail size={18} />
                  )}
                  {loading ? "Sending reset link..." : "Send reset link"}
                </button>
              </form>

              <div className="mt-7 rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={16} />
                  <p className="text-[10px] font-semibold leading-5 text-slate-500">
                    Please check both your inbox and spam folder. The reset link
                    may expire after some time.
                  </p>
                </div>
              </div>

              <p className="mt-8 text-center text-[10px] font-semibold leading-5 text-slate-400">
                If you no longer have access to your registered email, contact
                FD Arcadia admin for assistance.
              </p>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function RecoveryStep({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-[10px] font-black text-violet-200">
        {number}
      </div>
      <p className="text-[10px] font-semibold leading-5 text-slate-300">
        {text}
      </p>
    </div>
  );
}