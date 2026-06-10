"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminPage() {
  const [parentCount, setParentCount] = useState(0);
  const [childCount, setChildCount] = useState(0);
  const [parents, setParents] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { count: parentsCount } = await supabase
      .from("parents")
      .select("*", { count: "exact", head: true });

    const { count: childrenCount } = await supabase
      .from("children")
      .select("*", { count: "exact", head: true });

    const { data: parentData } = await supabase
      .from("parents")
      .select("*");

    setParentCount(parentsCount || 0);
    setChildCount(childrenCount || 0);
    setParents(parentData || []);
  };

  const updateWeek = async (
    parentId: string,
    week: number
  ) => {
    const { error } = await supabase
      .from("parents")
      .update({
        current_week: week,
      })
      .eq("id", parentId);

    if (error) {
      alert(error.message);
      return;
    }

    loadData();
  };

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] p-8">

      <div className="max-w-7xl mx-auto">

        {/* HERO */}

        <div className="bg-[var(--fd-blue)] text-white rounded-3xl p-10 shadow-2xl mb-8">

          <h1 className="text-5xl font-bold">
            FD Arcadia Admin
          </h1>

          <p className="mt-3 text-lg">
            Manage subscriptions, worksheets and learning access.
          </p>

        </div>

        {/* STATS */}

        <div className="grid md:grid-cols-4 gap-6 mb-10">

          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="font-bold text-gray-500">
              👨‍👩‍👧 Parents
            </h3>

            <p className="text-5xl font-bold mt-4 text-[var(--fd-blue)]">
              {parentCount}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="font-bold text-gray-500">
              👶 Children
            </h3>

            <p className="text-5xl font-bold mt-4 text-[var(--fd-mauve)]">
              {childCount}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="font-bold text-gray-500">
              📚 Worksheets
            </h3>

            <p className="text-5xl font-bold mt-4 text-blue-600">
              0
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="font-bold text-gray-500">
              💰 Revenue
            </h3>

            <p className="text-5xl font-bold mt-4 text-green-600">
              RM0
            </p>
          </div>

        </div>

        {/* QUICK ACTIONS */}

<div className="grid md:grid-cols-4 gap-6 mb-10">

  <div className="bg-white rounded-3xl shadow-xl p-6">
    <h3 className="text-2xl font-bold">
      📚 Worksheets
    </h3>

    <p className="mt-2 text-gray-600">
      Upload and manage worksheets.
    </p>
  </div>

  <div className="bg-white rounded-3xl shadow-xl p-6">
    <h3 className="text-2xl font-bold">
      🎁 Freebies
    </h3>

    <p className="mt-2 text-gray-600">
      Manage free downloadable resources.
    </p>
  </div>

  <div className="bg-white rounded-3xl shadow-xl p-6">
    <h3 className="text-2xl font-bold">
      ⭐ Rewards
    </h3>

    <p className="mt-2 text-gray-600">
      Manage points and achievements.
    </p>
  </div>

  <Link href="/admin/submissions">
    <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition cursor-pointer">

      <h3 className="text-2xl font-bold">
        📤 Tuition Submissions
      </h3>

      <p className="mt-2 text-gray-600">
        Review uploaded tuition worksheets.
      </p>

    </div>
  </Link>

</div>

        {/* PARENTS */}

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <h2 className="text-4xl font-bold mb-8">
            Registered Parents
          </h2>

          <div className="space-y-5">

            {parents.map((parent) => (

              <div
                key={parent.id}
                className="bg-gradient-to-r from-[#f7f1fb] to-[#fff8dc] border border-[var(--fd-purple)]/20 rounded-3xl p-6"
              >

                <div className="flex flex-col md:flex-row md:justify-between">

                  <div>

                    <h3 className="text-2xl font-bold">
                      👤 {parent.full_name || parent.name}
                    </h3>

                    <p className="mt-2">
                      📞 {parent.phone}
                    </p>

                    <div className="flex gap-3 mt-3 flex-wrap">

                      <span className="bg-[#efedff] text-[var(--fd-blue)] px-3 py-1 rounded-full">
                        Week {parent.current_week || 1}
                      </span>

                      <span className="bg-[#f8e9f2] text-[var(--fd-mauve)] px-3 py-1 rounded-full">
                        {parent.subscription_type || "trial"}
                      </span>

                    </div>

                  </div>

                </div>

                <div className="flex flex-wrap gap-3 mt-6">

                  <button
                    onClick={() => updateWeek(parent.id, 1)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl"
                  >
                    Week 1
                  </button>

                  <button
                    onClick={() => updateWeek(parent.id, 2)}
                    className="bg-green-500 text-white px-4 py-2 rounded-xl"
                  >
                    Week 2
                  </button>

                  <button
                    onClick={() => updateWeek(parent.id, 3)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-xl"
                  >
                    Week 3
                  </button>

                  <button
                    onClick={() => updateWeek(parent.id, 4)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl"
                  >
                    Week 4
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </main>
  );
}