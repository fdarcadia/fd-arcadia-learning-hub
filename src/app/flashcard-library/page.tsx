"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";

export default function FlashcardLibraryPage() {
  return (
    <ProtectedPage>
      {() => (
        <>
          <Navbar />

          <main className="page-shell py-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-indigo-700"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>

            <section className="mt-6 rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl">
              <BookOpen size={38} className="text-yellow-200" />

              <h1 className="font-display mt-4 text-5xl">
                Flashcard Library
              </h1>

              <p className="mt-2 text-indigo-100">
                Digital flashcard books will appear here.
              </p>
            </section>
          </main>
        </>
      )}
    </ProtectedPage>
  );
}