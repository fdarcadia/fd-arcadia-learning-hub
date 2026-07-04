"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
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
    <main className="min-h-screen bg-[#f8f5ef] px-4 py-8 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl place-items-center">
        <section className="grid w-full overflow-hidden rounded-[2.5rem] border border-indigo-100 bg-white shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-10 text-white lg:block">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-200/20 blur-2xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-pink-200/20 blur-2xl" />

            <div className="relative flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-yellow-200 shadow-lg">
                <Sparkles size={30} />
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-200">
                  FD Arcadia
                </p>
                <p className="text-2xl font-black">Learning Hub</p>
              </div>
            </div>

            <div className="relative mt-16">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-yellow-100">
                <BookOpenCheck size={18} />
                Parent learning portal
              </div>

              <h1 className="max-w-xl text-6xl font-black leading-tight">
                Welcome back to your learning space.
              </h1>

              <p className="mt-6 max-w-xl text-xl leading-9 text-indigo-100">
                Sign in to access your dashboard, learning hub, worksheets,
                sifir deck and activities.
              </p>
            </div>

            <div className="relative mt-12 grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 text-emerald-200" size={22} />
                  <div>
                    <p className="font-black text-yellow-100">
                      Parent Dashboard
                    </p>
                    <p className="mt-1 text-indigo-50">
                      View child profile, access and learning progress.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 text-emerald-200" size={22} />
                  <div>
                    <p className="font-black text-yellow-100">
                      Premium Activities
                    </p>
                    <p className="mt-1 text-indigo-50">
                      Open unlocked modules, worksheet canvas and math games.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-xl">
              <Link
                href="/"
                className="mb-8 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
              >
                ← Back to Home
              </Link>

              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-yellow-100 text-yellow-700 shadow-sm">
                <Mail size={38} />
              </div>

              <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-emerald-500">
                Welcome back
              </p>

              <h1 className="mt-3 text-5xl font-black leading-tight text-indigo-700">
                Login
              </h1>

              <p className="mt-4 text-lg leading-8 text-slate-500">
                Sign in with your registered email and password.
              </p>

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
                      className="text-sm font-black text-indigo-600 underline underline-offset-4 hover:text-indigo-700"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-xl font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={22} />
                  ) : (
                    <LockKeyhole size={22} />
                  )}
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="mt-6 text-center text-slate-600">
                New here?{" "}
                <Link className="font-black text-indigo-700" href="/register">
                  Create an account
                </Link>
              </p>

              <Link
                href="/register"
                className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 font-black text-indigo-700 transition hover:bg-indigo-100"
              >
                Register as parent
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}