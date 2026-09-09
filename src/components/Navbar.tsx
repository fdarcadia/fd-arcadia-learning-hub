"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  UserRound,
  Gift,
  BadgeDollarSign,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? "");
    }

    getUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="border-b border-indigo-100 bg-white/88 backdrop-blur">
      <nav className="page-shell flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* LOGO */}
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/fd-arcadia-logo1.png"
            alt="FD Arcadia Learning Hub"
            width={180}
            height={60}
            className="h-auto w-[180px] object-contain"
            priority
          />
        </Link>

        {/* NAVIGATION */}
        <div className="flex flex-wrap items-center gap-3">
          
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <UserRound size={20} />
            Profile
          </Link>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <BadgeDollarSign size={20} />
            Pricing
          </Link>

          <Link
            href="/freebies"
            className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Gift size={20} />
            Freebies
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-3 text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <LogOut size={20} />
            Logout
          </button>

        </div>
      </nav>
    </header>
  );
}