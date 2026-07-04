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
    <main className="min-h-screen bg-[#f8f5ef] px-4 py-8 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-10 text-white shadow-2xl lg:block">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-200/20 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-pink-200/20 blur-2xl" />

          <div className="relative flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-yellow-200">
              <Sparkles size={30} />
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-200">
                FD Arcadia
              </p>
              <p className="text-2xl font-black">Learning Hub</p>
            </div>
          </div>

          <h1 className="relative mt-16 text-6xl font-black leading-tight">
            Reset your password safely.
          </h1>

          <p className="relative mt-6 max-w-xl text-xl leading-9 text-indigo-100">
            Enter your registered email. We will send a secure reset link so you
            can create a new password.
          </p>

          <div className="relative mt-12 grid gap-4">
            {[
              "Submit your email address.",
              "Open the reset link from your email.",
              "Create your new password.",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 text-emerald-200" size={22} />
                  <div>
                    <p className="font-black text-yellow-100">
                      Step {index + 1}
                    </p>
                    <p className="mt-1 text-indigo-50">{step}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl rounded-[2.5rem] border border-indigo-100 bg-white p-6 shadow-2xl sm:p-8">
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-indigo-50 px-5 py-3 font-black text-indigo-700 transition hover:bg-indigo-100"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back to login
          </Link>

          <div className="mt-8">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-yellow-100 text-yellow-700 shadow-sm">
              <Mail size={38} />
            </div>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-emerald-500">
              Password Recovery
            </p>

            <h1 className="mt-3 text-5xl font-black leading-tight text-indigo-700">
              Forgot password?
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-500">
              No worries. Enter your registered email and we will send a reset
              password link.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-black text-slate-600">Email</span>
              <input
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-lg font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="yourname@email.com"
              />
            </label>

            {message && (
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-700">
                {message}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-bold leading-6 text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-3xl bg-indigo-600 px-6 py-4 text-lg font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : null}
              {loading ? "Sending reset link..." : "Send reset link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-bold leading-6 text-slate-400">
            Please check your inbox and spam folder. The reset link may expire
            after some time.
          </p>
        </section>
      </div>
    </main>
  );
}