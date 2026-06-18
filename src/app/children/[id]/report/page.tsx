"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";

export default function ChildReportPage() {
  return (
    <ProtectedPage>
      {() => (
        <main className="page-shell py-8">
          <Link
            href="/children"
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white"
          >
            <ArrowLeft size={20} />
            Back to Children
          </Link>

          <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-indigo-700">
              Child Report
            </h1>

            <p className="mt-2 text-slate-600">
              This report page is ready. You can add report content later.
            </p>
          </section>
        </main>
      )}
    </ProtectedPage>
  );
}