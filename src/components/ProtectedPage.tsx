"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ProtectedPageProps = {
  children: (user: User) => React.ReactNode;
};

export function ProtectedPage({ children }: ProtectedPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!active) return;

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setUser(data.user);
      setLoading(false);
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="soft-card flex items-center gap-3 rounded-3xl px-6 py-5 text-indigo-700">
          <Loader2 className="animate-spin" size={22} />
          Loading your portal...
        </div>
      </main>
    );
  }

  return <>{children(user)}</>;
}
