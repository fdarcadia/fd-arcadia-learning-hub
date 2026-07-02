"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Eye,
  FileText,
  LockKeyhole,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type FlashcardBook = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  canva_link: string | null;
  total_cards: number | null;
  age_group: string | null;
  allow_download: boolean;
  display_order: number | null;
  is_active: boolean;
};

type FlashcardAccess = {
  flashcard_id: string;
};

export default function FlashcardLibraryPage() {
  return (
    <ProtectedPage>
      {(user) => <FlashcardLibrary userId={user.id} />}
    </ProtectedPage>
  );
}

function FlashcardLibrary({ userId }: { userId: string }) {
  const [books, setBooks] = useState<FlashcardBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBooks() {
      setLoading(true);
      setError("");

      const { data: accessData, error: accessError } = await supabase
        .from("flashcard_access")
        .select("flashcard_id")
        .eq("parent_id", userId);

      if (accessError) {
        setError(accessError.message);
        setLoading(false);
        return;
      }

      const accessRows = (accessData || []) as FlashcardAccess[];
      const flashcardIds = accessRows.map((item) => item.flashcard_id);

      if (flashcardIds.length === 0) {
        setBooks([]);
        setLoading(false);
        return;
      }

      const { data: bookData, error: bookError } = await supabase
        .from("flashcard_library")
        .select("*")
        .in("id", flashcardIds)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (bookError) {
        setError(bookError.message);
        setLoading(false);
        return;
      }

      setBooks((bookData || []) as FlashcardBook[]);
      setLoading(false);
    }

    loadBooks();
  }, [userId]);

  return (
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
          <BookOpen size={40} className="text-yellow-200" />

          <h1 className="font-display mt-4 text-5xl sm:text-6xl">
            Flashcard Library
          </h1>

          <p className="mt-2 text-indigo-100">
            Your purchased digital flashcard books.
          </p>
        </section>

        {loading ? (
          <div className="mt-8 rounded-[2rem] bg-white p-6 text-slate-600 shadow-sm">
            Loading flashcards...
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        ) : null}

        {!loading && !error && books.length === 0 ? (
          <section className="mt-8 rounded-[2rem] bg-white p-8 text-center shadow-sm">
            <LockKeyhole className="mx-auto text-slate-400" size={44} />

            <h2 className="mt-4 text-3xl font-bold text-indigo-700">
              No Flashcard Access Yet
            </h2>

            <p className="mt-2 text-slate-600">
              Admin belum assign flashcard book kepada akaun ini.
            </p>
          </section>
        ) : null}

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div
              key={book.id}
              className="rounded-[2rem] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="h-56 w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="grid h-56 place-items-center rounded-2xl bg-indigo-50 text-5xl">
                  📚
                </div>
              )}

              <h2 className="mt-4 text-3xl font-bold text-indigo-700">
                {book.title}
              </h2>

              <p className="text-lg text-slate-600">{book.category}</p>

              <p className="mt-2 text-slate-500">
                {book.total_cards || 0} cards/pages • {book.age_group || "-"}
              </p>

              {book.description ? (
                <p className="mt-3 text-slate-600">{book.description}</p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                {book.pdf_url ? (
                  <a
                    href={book.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700"
                  >
                    <FileText size={18} />
                    View PDF
                  </a>
                ) : null}

                {book.allow_download && book.pdf_url ? (
                  <a
                    href={book.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-2 rounded-2xl bg-yellow-100 px-5 py-3 font-bold text-yellow-800 transition hover:bg-yellow-200"
                  >
                    <Download size={18} />
                    Download
                  </a>
                ) : null}

                {book.canva_link ? (
                  <a
                    href={book.canva_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-purple-100 px-5 py-3 font-bold text-purple-700 transition hover:bg-purple-200"
                  >
                    <Eye size={18} />
                    Canva
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}