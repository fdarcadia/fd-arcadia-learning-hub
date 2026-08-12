"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { TextInput } from "@/components/TextInput";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[1240px] items-center">
        <section className="grid w-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.13)] lg:grid-cols-[0.92fr_1.08fr]">
          {/* LEFT PREMIUM PANEL */}
          <aside className="relative hidden min-h-[720px] overflow-hidden bg-gradient-to-br from-[#111735] via-[#25265f] to-[#4c3fc9] p-9 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
            <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-indigo-300/10 blur-3xl" />

            <div className="relative">
              <Link href="/" className="inline-flex items-center gap-3">
                {/* 
                  OPTIONAL CUSTOM LOGO:
                  Put your logo file in /public, e.g. /public/fd-arcadia-logo.png
                  Then replace the div below with:
                  <img
                    src="/fd-arcadia-logo.png"
                    alt="FD Arcadia"
                    className="h-12 w-auto object-contain"
                  />
                */}
                <img
  src="/fd-arcadia-logo.png"
  alt="FD Arcadia"
  className="h-12 w-auto object-contain"
/>

                <div>
                  <p className="text-sm font-black tracking-[0.12em]">
                    FD ARCADIA
                  </p>
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-violet-300">
                    Learning Hub
                  </p>
                </div>
              </Link>

              <div className="mt-16 max-w-lg">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-violet-200">
                  <BookOpenCheck size={14} />
                  Parent Learning Portal
                </div>

                <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
                  Welcome back to your child&apos;s learning space.
                </h1>

                <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                  Access learning modules, worksheets, flashcards, activities
                  and progress from one simple portal.
                </p>
              </div>

              <div className="mt-10 grid gap-3">
                <FeatureLine
                  title="Learning Dashboard"
                  description="Access your child&apos;s learning tools and profile."
                />

                <FeatureLine
                  title="Premium Resources"
                  description="Open unlocked modules, worksheets and activities."
                />

                <FeatureLine
                  title="Secure Parent Access"
                  description="Your account and child learning data stay private."
                />
              </div>
            </div>

            <div className="relative rounded-[20px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-emerald-300">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-black">Secure Login</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                    Powered by FD Arcadia Parent Portal
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT LOGIN FORM */}
          <section className="p-5 sm:p-8 lg:p-10 xl:p-12">
            <div className="mx-auto flex h-full max-w-[520px] flex-col justify-center">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-indigo-600"
                >
                  <ArrowLeft size={15} />
                  Back to Home
                </Link>

                <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700">
                  Parent Access
                </div>
              </div>

              <div className="mt-10">
                {/* MOBILE LOGO */}
                <div className="mb-8 flex items-center gap-3 lg:hidden">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-yellow-300">
                    <Sparkles size={21} />
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-[0.1em]">
                      FD ARCADIA
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-indigo-500">
                      Learning Hub
                    </p>
                  </div>
                </div>

                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Mail size={22} />
                </div>

                <p className="mt-5 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
                  Welcome Back
                </p>

                <h2 className="mt-1 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Sign in
                </h2>

                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                  Enter your registered email and password to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <TextInput
                  label="Email"
                  type="email"
                  value={email}
                  required
                  placeholder="parent@email.com"
                  onChange={setEmail}
                />

                <div>
                  <TextInput
                    label="Password"
                    type="password"
                    value={password}
                    required
                    placeholder="Your password"
                    onChange={setPassword}
                  />

                  <div className="mt-3 flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-xs font-black text-indigo-600 transition hover:text-indigo-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {error}
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
                    <LockKeyhole size={18} />
                  )}
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-7 border-t border-slate-100 pt-6">
                <p className="text-center text-sm font-semibold text-slate-500">
                  New to FD Arcadia?{" "}
                  <Link
                    href="/register"
                    className="font-black text-indigo-600 transition hover:text-indigo-700"
                  >
                    Create an account
                  </Link>
                </p>

                <Link
                  href="/register"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
                >
                  Register as Parent
                  <ArrowRight size={16} />
                </Link>
              </div>

              <p className="mt-8 text-center text-[10px] font-semibold leading-5 text-slate-400">
                By signing in, you&apos;ll access the learning resources assigned
                to your FD Arcadia account.
              </p>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function FeatureLine({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300">
        <CheckCircle2 size={16} />
      </div>

      <div>
        <p className="text-xs font-black text-white">{title}</p>
        <p className="mt-1 text-[10px] leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}