"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
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

    router.push("/dashboard");
  };

  return (
    <button
      type="button"
      onClick={handleLoginClick}
      className="inline-flex items-center gap-2 rounded-lg bg-[var(--fd-blue)] px-4 py-2.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(23,32,51,0.18)] transition hover:-translate-y-0.5"
    >
      Login
      <ArrowRight size={16} aria-hidden="true" />
    </button>
  );
}