"use client";

import Link from "next/link";
import { BookOpen, Calculator, FlaskConical, Languages, PencilLine } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";

const subjects = [
  { title: "Bahasa Melayu", href: "/custom-worksheet/bahasa-melayu", icon: Languages, color: "bg-pink-100 text-pink-700" },
  { title: "English", href: "/custom-worksheet/english", icon: BookOpen, color: "bg-sky-100 text-sky-700" },
  { title: "Mathematics", href: "/custom-worksheet/mathematics", icon: Calculator, color: "bg-yellow-100 text-yellow-700" },
  { title: "Science", href: "/custom-worksheet/science", icon: FlaskConical, color: "bg-emerald-100 text-emerald-700" },
  { title: "Membaca 3M", href: "/custom-worksheet/membaca-3m", icon: PencilLine, color: "bg-purple-100 text-purple-700" },
];

export default function CustomWorksheetPage() {
  return (
    <ProtectedPage>
      {() => (
        <>
          <Navbar />

          <main className="page-shell py-8">
            <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl">
              <p className="tracking-[0.25em] text-yellow-200">CUSTOM WORKSHEET</p>
              <h1 className="font-display mt-2 text-5xl">Choose Subject</h1>
              <p className="mt-2 text-indigo-100">
                Download purchased worksheets or complete activities online.
              </p>
            </section>

            <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => {
                const Icon = subject.icon;

                return (
                  <Link
                    key={subject.title}
                    href={subject.href}
                    className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className={`grid h-16 w-16 place-items-center rounded-2xl ${subject.color}`}>
                      <Icon size={30} />
                    </div>

                    <h2 className="mt-6 text-3xl font-bold text-indigo-700">
                      {subject.title}
                    </h2>

                    <p className="mt-2 text-slate-600">
                      Open worksheet files and learning activities.
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
        </>
      )}
    </ProtectedPage>
  );
}