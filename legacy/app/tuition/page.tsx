"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type TuitionChild = {
  age?: number | null;
  child_name?: string | null;
  id: string;
  level?: string | null;
  points?: number | null;
};

export default function TuitionPage() {
  const [children, setChildren] = useState<TuitionChild[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadChildren() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/";
      return;
    }

    const { data: parent } = await supabase
      .from("parents")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!parent) {
      window.location.href = "/dashboard";
      return;
    }

    // Access Control
    if (
      parent.package_type !== "tuition" &&
      parent.package_type !== "combo"
    ) {
      window.location.href = "/dashboard";
      return;
    }

    const { data } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", parent.id);

    setChildren(data || []);
    setLoading(false);
  }

  useEffect(() => {
    // Tuition children are loaded once from Supabase when the portal opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadChildren();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">
          Loading...
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] p-8">
      <div className="max-w-7xl mx-auto">

        {/* Hero */}
        <div className="bg-[var(--fd-blue)] text-white rounded-3xl p-8 shadow-2xl mb-8">
          <h1 className="text-5xl font-bold">
            🎓 Tuition Portal
          </h1>

          <p className="mt-3 text-lg">
            Track learning progress and submit worksheets.
          </p>
        </div>

        {/* Quick Menu */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">

          <Link href="/tuition/upload">
            <div className="bg-white p-6 rounded-3xl shadow-xl text-center hover:shadow-2xl transition cursor-pointer">
              📤 Upload Worksheet
            </div>
          </Link>

          <Link href="/tuition/report">
            <div className="bg-white p-6 rounded-3xl shadow-xl text-center hover:shadow-2xl transition cursor-pointer">
              📊 Progress Report
            </div>
          </Link>

          <Link href="/tuition/attendance">
            <div className="bg-white p-6 rounded-3xl shadow-xl text-center hover:shadow-2xl transition cursor-pointer">
              📅 Attendance
            </div>
          </Link>

          <Link href="/tuition/rewards">
            <div className="bg-white p-6 rounded-3xl shadow-xl text-center hover:shadow-2xl transition cursor-pointer">
              ⭐ Reward Points
            </div>
          </Link>

<Link href="/tuition/submissions">
  <div className="bg-white p-6 rounded-3xl shadow-xl text-center hover:shadow-2xl">
    📂 Submission History
  </div>
</Link>
          

        </div>

        {/* Students */}
        <h2 className="text-3xl font-bold mb-5">
          My Students
        </h2>

        <div className="grid md:grid-cols-2 gap-5">

          {children.map((child) => (
            <div
              key={child.id}
              className="bg-white rounded-3xl p-6 shadow-xl"
            >
              <h3 className="text-2xl font-bold">
                {child.child_name}
              </h3>

              <p className="mt-2">
                🎂 Age: {child.age}
              </p>

              <p>
                📚 Level: {child.level}
              </p>

              <p>
                ⭐ Points: {child.points || 0}
              </p>

              <div className="grid grid-cols-3 gap-3 mt-5">

                <Link
                  href={`/tuition/report/${child.id}`}
                  className="bg-blue-500 text-white py-2 rounded-xl text-center"
                >
                  Report
                </Link>

                <Link
                  href={`/tuition/upload/${child.id}`}
                  className="bg-green-500 text-white py-2 rounded-xl text-center"
                >
                  Upload
                </Link>

                <Link
                  href={`/tuition/progress/${child.id}`}
                  className="bg-[var(--fd-blue)] text-white py-2 rounded-xl text-center"
                >
                  Progress
                </Link>

              </div>

            </div>
          ))}

        </div>

      </div>
    </main>
  );
}
