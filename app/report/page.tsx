"use client";

import Link from "next/link";

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-900">
        Student Report
      </h1>

      <p className="mt-4 text-gray-600">
        View student reports and progress summaries here.
      </p>

      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-bold text-white"
      >
        Back to Dashboard
      </Link>
    </main>
  );
}