"use client";

import { useParams } from "next/navigation";

export default function ChildProgressPage() {
  const params = useParams();
  const childId = params.childId as string;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-900">
        Child Progress
      </h1>

      <p className="mt-4 text-gray-600">
        Progress page for child ID: {childId}
      </p>
    </main>
  );
}