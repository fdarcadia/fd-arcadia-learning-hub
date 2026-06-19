"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
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
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-emerald-50 px-4 py-8">
      <div className="page-shell grid min-h-[calc(100vh-4rem)] place-items-center">
        <section className="grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden bg-indigo-600 p-8 text-white lg:block">
            <div className="flex items-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/15">
                <LockKeyhole className="text-yellow-200" size={34} />
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-200">
                  FD Arcadia
                </p>
                <p className="font-display text-3xl">Learning Hub</p>
              </div>
            </div>

            <h1 className="font-display mt-16 text-6xl font-black leading-tight">
              Welcome back to your learning space.
            </h1>

            <p className="mt-6 max-w-xl text-xl leading-9 text-indigo-100">
              Sign in to access your dashboard, learning hub, worksheets,
              sifir deck and activities.
            </p>

            <div className="mt-12 grid gap-4">
              <div className="rounded-3xl bg-white/10 p-5">
                <p className="font-black text-yellow-100">Parent Dashboard</p>
                <p className="mt-1 text-indigo-50">
                  View child profile, access and learning progress.
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-5">
                <p className="font-black text-yellow-100">Premium Activities</p>
                <p className="mt-1 text-indigo-50">
                  Open unlocked modules, worksheet canvas and math games.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mx-auto max-w-xl">
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-yellow-100 text-yellow-700">
                <Mail size={38} />
              </div>

              <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-emerald-500">
                Welcome back
              </p>

              <h1 className="font-display mt-3 text-5xl font-black leading-tight text-indigo-700">
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
                  className="button-shadow flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-xl font-bold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={22} /> : null}
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="mt-6 text-center text-slate-600">
                New here?{" "}
                <Link className="font-bold text-indigo-700" href="/register">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}