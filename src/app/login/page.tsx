"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
      email,
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
    <main className="page-shell grid min-h-screen place-items-center py-10">
      <section className="soft-card w-full max-w-xl rounded-[2rem] p-6 sm:p-8">
        <p className="text-emerald-700">Welcome back</p>
        <h1 className="font-display mt-2 text-5xl text-indigo-700">Login</h1>
        <p className="mt-3 text-lg text-slate-600">
          Sign in with your email and password.
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
          <TextInput
            label="Password"
            type="password"
            value={password}
            required
            placeholder="Your password"
            onChange={setPassword}
          />

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="button-shadow flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-xl font-bold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={22} /> : null}
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-slate-600">
          New here?{" "}
          <Link className="font-bold text-indigo-700" href="/register">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
