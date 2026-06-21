"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Languages,
  Loader2,
  PencilLine,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const subjects = [
  {
    value: "bahasa-melayu",
    title: "Bahasa Melayu",
    href: "/custom-worksheet/bahasa-melayu",
    icon: Languages,
    color: "bg-pink-100 text-pink-700",
  },
  {
    value: "english",
    title: "English",
    href: "/custom-worksheet/english",
    icon: BookOpen,
    color: "bg-sky-100 text-sky-700",
  },
  {
    value: "mathematics",
    title: "Mathematics",
    href: "/custom-worksheet/mathematics",
    icon: Calculator,
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "science",
    title: "Science",
    href: "/custom-worksheet/science",
    icon: FlaskConical,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    value: "membaca-3m",
    title: "Membaca 3M",
    href: "/custom-worksheet/membaca-3m",
    icon: PencilLine,
    color: "bg-purple-100 text-purple-700",
  },
];

type WorksheetItem = {
  id: string;
  subject: string;
};

export default function CustomWorksheetPage() {
  return (
    <ProtectedPage>
      {() => (
        <>
          <Navbar />
          <CustomWorksheetContent />
        </>
      )}
    </ProtectedPage>
  );
}

function CustomWorksheetContent() {
  const [worksheets, setWorksheets] = useState<WorksheetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorksheets();
  }, []);

  async function loadWorksheets() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setWorksheets([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("custom_worksheet_items")
      .select("id, subject")
      .eq("parent_user_id", user.id);

    setWorksheets((data || []) as WorksheetItem[]);
    setLoading(false);
  }

  function countBySubject(subjectValue: string) {
    return worksheets.filter((item) => item.subject === subjectValue).length;
  }

  const totalWorksheet = worksheets.length;

  return (
    <main className="page-shell py-8">
      <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl">
        <p className="tracking-[0.25em] text-yellow-200">
          CUSTOM WORKSHEET
        </p>

        <h1 className="font-display mt-2 text-5xl">
          Choose Subject
        </h1>

        <p className="mt-2 text-indigo-100">
          Download purchased worksheets assigned to your account.
        </p>

        <div className="mt-5 inline-flex rounded-full bg-white/15 px-5 py-3 font-bold text-white">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              Loading worksheets...
            </span>
          ) : (
            <span>{totalWorksheet} worksheet available</span>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          const Icon = subject.icon;
          const count = countBySubject(subject.value);

          return (
            <Link
              key={subject.value}
              href={subject.href}
              className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`grid h-16 w-16 place-items-center rounded-2xl ${subject.color}`}
              >
                <Icon size={30} />
              </div>

              <h2 className="mt-6 text-3xl font-bold text-indigo-700">
                {subject.title}
              </h2>

              <p className="mt-2 text-slate-600">
                {count > 0
                  ? `${count} worksheet assigned`
                  : "No worksheet assigned yet"}
              </p>
            </Link>
          );
        })}
      </section>

      <Link
        href="/worksheet"
        className="mt-8 inline-flex rounded-2xl bg-emerald-600 px-6 py-4 font-bold text-white shadow-md"
      >
        Open Draw & Learn Canvas
      </Link>
    </main>
  );
}