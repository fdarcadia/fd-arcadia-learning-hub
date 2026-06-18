"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { isAdminUser } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

export default function LoginRedirectButton() {
  const router = useRouter();

  const handleLoginClick = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      router.push("/login");
      return;
    }

    router.push((await isAdminUser(user.id)) ? "/admin" : "/dashboard");
  };

  return (
    <button
      type="button"
      onClick={handleLoginClick}
      className="premium-button-shadow font-kindergarten inline-flex items-center gap-2 rounded-lg bg-[var(--fd-blue)] px-5 py-3 text-lg text-white transition hover:-translate-y-0.5"
    >
      Login
      <ArrowRight size={16} aria-hidden="true" />
    </button>
  );
}
