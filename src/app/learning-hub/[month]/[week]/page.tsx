"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type LearningHubItem = {
  id: string;
  month_no: number;
  week_no: number;
  day: string;
  category: string;
  title: string;
  time_label: string | null;
  item_type: string | null;
  file_url: string | null;
  file_name: string | null;
  external_link: string | null;
};

function getRouteNumber(value: string | string[] | undefined, prefix: string) {
  const text = Array.isArray(value) ? value[0] : value || "";
  return Number(text.replace(prefix, ""));
}

export default function WeekPage() {
  const params = useParams();

  const monthNo = getRouteNumber(params.month as string, "month-");
  const weekNo = getRouteNumber(params.week as string, "week-");

  const [items, setItems] = useState<LearningHubItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItems() {
      setLoading(true);

      const { data, error } = await supabase
        .from("learning_hub_items")
        .select("*")
        .eq("month_no", monthNo)
        .eq("week_no", weekNo)
        .order("created_at", { ascending: true });

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      setItems((data || []) as LearningHubItem[]);
      setLoading(false);
    }

    if (monthNo && weekNo) {
      loadItems();
    } else {
      setLoading(false);
    }
  }, [monthNo, weekNo]);

  return (
    <ProtectedPage>
      {() => (
        <>
          <Navbar />

          <main className="page-shell py-8">
            <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl">
              <p className="tracking-[0.25em] text-yellow-200">
                FD ARCADIA LEARNING HUB
              </p>

              <h1 className="font-display mt-2 text-5xl">
                Month {monthNo || "-"} - Week {weekNo || "-"}
              </h1>

              <p className="mt-2 text-indigo-100">
                Weekly Learning Schedule
              </p>
            </section>

            {loading ? (
              <div className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-sm">
                <p className="text-slate-500">Loading content...</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm"
                  >
                    <p className="text-slate-500">{item.day}</p>

                    <h2 className="font-display text-3xl text-indigo-700">
                      {item.title}
                    </h2>

                    <p className="text-slate-600">{item.category}</p>

                    <p className="text-slate-400">{item.time_label}</p>

                    {item.item_type ? (
                      <span className="mt-3 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-800">
                        {item.item_type}
                      </span>
                    ) : null}

                    {(item.external_link || item.file_url) && (
                      <a
                        href={item.external_link || item.file_url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white"
                      >
                        <Download size={18} />
                        Open File
                      </a>
                    )}
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
                    <FileText className="mx-auto text-slate-400" size={40} />

                    <h2 className="mt-3 text-2xl font-bold text-slate-600">
                      No Content Yet
                    </h2>

                    <p className="mt-2 text-slate-500">
                      No activities uploaded for this week.
                    </p>
                  </div>
                )}
              </div>
            )}
          </main>
        </>
      )}
    </ProtectedPage>
  );
}