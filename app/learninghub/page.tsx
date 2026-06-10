"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LearningHubPage() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [subscriptionType, setSubscriptionType] =
    useState("trial");

  useEffect(() => {
    loadWeek();
  }, []);

  const loadWeek = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/";
      return;
    }

    const { data, error } = await supabase
      .from("parents")
      .select(
        "current_week, subscription_type, package_type"
      )
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return;
    }

    if (
      data.package_type &&
      data.package_type !== "learninghub"
    ) {
      window.location.href = "/dashboard";
      return;
    }

    setCurrentWeek(
      data.current_week || 1
    );

    setSubscriptionType(
      data.subscription_type || "trial"
    );
  };

  const progress = Math.round(
    (currentWeek / 4) * 100
  );

  const weekCard =
    "bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer";

  const lockedCard =
    "bg-gray-200 rounded-3xl p-8 text-gray-500 cursor-not-allowed";

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] p-8">
      <div className="max-w-7xl mx-auto">

        <div className="bg-[var(--fd-blue)] text-white rounded-3xl p-8 shadow-2xl mb-8">
          <h1 className="text-5xl font-bold">
            📚 Learning Hub
          </h1>

          <p className="mt-3 text-lg">
            Access your weekly worksheets and activities
          </p>

          <div className="flex gap-3 mt-4">
            <div className="bg-white text-[var(--fd-blue)] px-4 py-2 rounded-full font-bold">
              Week {currentWeek}
            </div>

            <div className="bg-white text-[var(--fd-mauve)] px-4 py-2 rounded-full font-bold uppercase">
              {subscriptionType}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl mb-8">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-bold">
              Learning Progress
            </h2>

            <span className="font-bold">
              {progress}%
            </span>
          </div>

          <div className="w-full bg-gray-200 h-6 rounded-full">
            <div
              className="bg-[var(--fd-blue)] h-6 rounded-full"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-6">
          Monthly Worksheets
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <Link
            href="/learninghub/week1"
            className={weekCard}
          >
            <div>
              <h3 className="text-3xl font-bold">
                📚 Week 1
              </h3>
            </div>
          </Link>

          {currentWeek >= 2 ? (
            <Link
              href="/learninghub/week2"
              className={weekCard}
            >
              <div>
                <h3 className="text-3xl font-bold">
                  📚 Week 2
                </h3>
              </div>
            </Link>
          ) : (
            <div className={lockedCard}>
              🔒 Week 2 Locked
            </div>
          )}

          {currentWeek >= 3 ? (
            <Link
              href="/learninghub/week3"
              className={weekCard}
            >
              <div>
                <h3 className="text-3xl font-bold">
                  📚 Week 3
                </h3>
              </div>
            </Link>
          ) : (
            <div className={lockedCard}>
              🔒 Week 3 Locked
            </div>
          )}

          {currentWeek >= 4 ? (
            <Link
              href="/learninghub/week4"
              className={weekCard}
            >
              <div>
                <h3 className="text-3xl font-bold">
                  📚 Week 4
                </h3>
              </div>
            </Link>
          ) : (
            <div className={lockedCard}>
              🔒 Week 4 Locked
            </div>
          )}

        </div>

      </div>
    </main>
  );
}