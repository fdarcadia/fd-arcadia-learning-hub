"use client";

import Link from "next/link";
import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] flex items-center justify-center p-8">
      <div className="w-full max-w-md">

        <div className="mb-6 rounded-3xl bg-white p-6 text-center shadow-2xl">
          <BrandLogo
            className="justify-center"
            imageClassName="h-24 w-44"
            label="FD Arcadia"
            subtitle="Learn • Play • Grow"
          />
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">

          <h2 className="text-3xl font-bold mb-6 text-center">
            Parent Login
          </h2>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border p-4 rounded-xl mb-4"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border p-4 rounded-xl mb-6"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-[var(--fd-blue)] text-white py-4 rounded-xl font-bold hover:opacity-90"
          >
            Login
          </button>

          <Link href="/">
            <button className="w-full mt-4 bg-[var(--fd-cream)] py-4 rounded-xl hover:bg-[#fff8dc]">
              Back to Home
            </button>
          </Link>

          <div className="mt-6 border-t pt-6 text-center">

            <p className="text-gray-500">
              New Parent?
            </p>

            <Link href="/register">
              <button className="mt-3 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:opacity-90">
                Create New Account
              </button>
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}
