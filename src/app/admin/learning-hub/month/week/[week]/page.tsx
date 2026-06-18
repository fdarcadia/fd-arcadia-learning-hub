"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";

type LearningHubItem = {
  id: string;
  day: string;
  time_label: string;
  category: string;
  title: string;
  item_type: string;
  file_url: string | null;
  file_name: string | null;
};

export default function WeekPage() {
  const params = useParams();

  const month = Number(params.month);
  const week = Number(params.week);

  const [items, setItems] = useState<LearningHubItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [month, week]);

  async function loadItems() {
    const { data } = await supabase
      .from("learning_hub_items")
      .select("*")
      .eq("month_no", month)
      .eq("week_no", week)
      .order("day");

    setItems((data || []) as LearningHubItem[]);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="page-shell py-10">
        Loading...
      </main>
    );
  }

  return (
    <main className="page-shell py-8">
      <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl">
        <h1 className="font-display text-5xl">
          Month {month} - Week {week}
        </h1>

        <p className="mt-2 text-indigo-100">
          Weekly Learning Schedule
        </p>
      </section>

      <div className="mt-8 grid gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {item.day}
                </p>

                <h2 className="font-display text-3xl text-indigo-700">
                  {item.title}
                </h2>

                <p className="text-slate-600">
                  {item.category}
                </p>

                <p className="text-slate-400">
                  {item.time_label}
                </p>

                <span className="mt-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                  {item.item_type}
                </span>
              </div>

              {item.file_url && (
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white"
                >
                  <Download size={18} />
                  Open File
                </a>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
            <FileText
              size={40}
              className="mx-auto mb-4 text-slate-400"
            />

            <h2 className="text-2xl font-bold text-slate-600">
              No Content Yet
            </h2>

            <p className="mt-2 text-slate-500">
              Admin has not uploaded content for this week.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}