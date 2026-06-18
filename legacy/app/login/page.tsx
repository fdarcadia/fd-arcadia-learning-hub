"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BrandLogo from "@/components/common/BrandLogo";
import { isAdminUser } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    const userId = data.user?.id;
    const redirectPath = userId && (await isAdminUser(userId)) ? "/admin" : "/dashboard";

    window.location.href = redirectPath;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--fd-cream)] px-5 py-10 text-[var(--fd-blue)]">
      <section className="w-full max-w-md rounded-lg border border-[var(--fd-blue)]/10 bg-white p-6 shadow-[0_24px_70px_rgba(76,87,169,0.14)] md:p-8">
        <BrandLogo
          className="mb-7 justify-center"
          imageClassName="h-20 w-40"
          label="FD Arcadia"
          subtitle="Learning Hub"
        />

        <div className="mb-7 text-center">
          <h1 className="text-3xl font-black">Sign in</h1>
          <p className="mt-2 text-sm font-semibold text-[var(--fd-blue)]/65">
            Continue to your family dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-sm font-black">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--fd-blue)]/15 bg-[var(--fd-cream)] px-4 py-3 font-semibold outline-none transition focus:border-[var(--fd-blue)]"
              placeholder="parent@email.com"
            />
          </label>

          <label className="block text-sm font-black">
            Password
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--fd-blue)]/15 bg-[var(--fd-cream)] px-4 py-3 font-semibold outline-none transition focus:border-[var(--fd-blue)]"
              placeholder="Your password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--fd-blue)] px-5 py-4 font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : null}
            Sign in
            {!loading ? <ArrowRight size={18} aria-hidden="true" /> : null}
          </button>
        </form>

        <div className="mt-6 border-t border-[var(--fd-blue)]/10 pt-5 text-center text-sm font-semibold">
          New to FD Arcadia?{" "}
          <Link href="/register" className="font-black text-[var(--fd-red)]">
            Create an account
          </Link>
        </div>
      </section>
    </main>
  );
}
