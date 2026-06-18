"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Download, FileText, Palette } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type WorksheetItem = {
  id: string;
  subject: string;
  title: string;
  description: string | null;
  external_link: string;
};

const subjectLabels: Record<string, string> = {
  "bahasa-melayu": "Bahasa Melayu",
  english: "English",
  mathematics: "Mathematics",
  science: "Science",
  "membaca-3m": "Membaca 3M",
};

export default function SubjectWorksheetPage() {
  const params = useParams();
  const subject = params.subject as string;
  const label = subjectLabels[subject] || subject;

  const [items, setItems] = useState<WorksheetItem[]>([]);

  useEffect(() => {
    async function loadItems() {
      const { data } = await supabase
        .from("custom_worksheet_items")
        .select("*")
        .eq("subject", subject)
        .order("created_at", { ascending: false });

      setItems((data || []) as WorksheetItem[]);
    }

    loadItems();
  }, [subject]);

  return (
    <ProtectedPage>
      {() => (
        <>
          <Navbar />

          <main className="page-shell py-8">
            <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl">
              <p className="tracking-[0.25em] text-yellow-200">CUSTOM WORKSHEET</p>
              <h1 className="font-display mt-2 text-5xl">{label}</h1>
              <p className="mt-2 text-indigo-100">
                Download your worksheet files or complete online activities.
              </p>
            </section>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/custom-worksheet"
                className="rounded-2xl bg-white px-5 py-3 font-bold text-indigo-700 shadow-sm"
              >
                Back to Subjects
              </Link>

              <Link
                href="/worksheet"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-sm"
              >
                <Palette size={20} />
                Draw & Learn Canvas
              </Link>
            </div>

            <section className="mt-8 grid gap-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm"
                >
                  <FileText className="text-indigo-600" size={34} />

                  <h2 className="mt-4 text-3xl font-bold text-indigo-700">
                    {item.title}
                  </h2>

                  {item.description ? (
                    <p className="mt-2 text-slate-600">{item.description}</p>
                  ) : null}

                  <a
                    href={item.external_link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white"
                  >
                    <Download size={18} />
                    Download / Open File
                  </a>
                </div>
              ))}

              {items.length === 0 && (
                <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
                  <FileText className="mx-auto text-slate-400" size={42} />
                  <h2 className="mt-3 text-2xl font-bold text-slate-600">
                    No worksheet uploaded yet.
                  </h2>
                </div>
              )}
            </section>
          </main>
        </>
      )}
    </ProtectedPage>
  );
}