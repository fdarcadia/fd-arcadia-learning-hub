"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

export default function AdminLearningHubMonthPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <main className="page-shell py-8">
            <Link
              href="/admin/learning-hub"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white"
            >
              <ArrowLeft size={20} />
              Back
            </Link>

            <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm">
              <h1 className="text-3xl font-bold text-indigo-700">
                Admin Learning Hub Month
              </h1>

              <p className="mt-2 text-slate-600">
                This page is ready. You can edit month content here later.
              </p>
            </section>
          </main>
        ) : (
          <main className="page-shell py-10">
            <h1 className="text-3xl font-bold text-red-600">Access denied</h1>
          </main>
        )
      }
    </ProtectedPage>
  );
}