"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Crown,
  Download,
  Eye,
  FileText,
  Gift,
  Home,
  Loader2,
  LockKeyhole,
  Search,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
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

const sidebarLinks = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Flashcard Library", href: "/flashcard-library", icon: BookOpen },
  { title: "Worksheet", href: "/custom-worksheet", icon: FileText },
  { title: "Freebies", href: "/freebies", icon: Gift },
];

function getBookNumber(title: string) {
  const normalizedTitle = title.trim();

  const bookMatch = normalizedTitle.match(/(?:Buku|Book)\s*[-.:]?\s*(\d+)/i);

  if (bookMatch) {
    return Number(bookMatch[1]);
  }

  const endingNumberMatch = normalizedTitle.match(/(\d+)\s*$/);

  return endingNumberMatch ? Number(endingNumberMatch[1]) : Number.MAX_SAFE_INTEGER;
}

function getCategoryEmoji(category: string) {
  const text = category.toLowerCase();

  if (text.includes("kv")) return "🔤";
  if (text.includes("kvk")) return "📘";
  if (text.includes("diftong")) return "🌈";
  if (text.includes("math")) return "🔢";
  if (text.includes("english")) return "📖";
  if (text.includes("science")) return "🧪";

  return "📚";
}

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
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [favoriteBookIds, setFavoriteBookIds] = useState<string[]>([]);

  useEffect(() => {
    const storageKey = `fd-arcadia-flashcard-favorites-${userId}`;
    const savedFavorites = window.localStorage.getItem(storageKey);

    if (!savedFavorites) {
      setFavoriteBookIds([]);
      return;
    }

    try {
      const parsedFavorites = JSON.parse(savedFavorites);

      setFavoriteBookIds(
        Array.isArray(parsedFavorites)
          ? parsedFavorites.filter((id): id is string => typeof id === "string")
          : [],
      );
    } catch {
      setFavoriteBookIds([]);
    }
  }, [userId]);

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
        .eq("is_active", true);

      if (bookError) {
        setError(bookError.message);
        setLoading(false);
        return;
      }

      const sortedBooks = ((bookData || []) as FlashcardBook[]).sort((a, b) => {
        const bookNumberA = getBookNumber(a.title);
        const bookNumberB = getBookNumber(b.title);

        if (bookNumberA !== bookNumberB) {
          return bookNumberA - bookNumberB;
        }

        const displayOrderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
        const displayOrderB = b.display_order ?? Number.MAX_SAFE_INTEGER;

        if (displayOrderA !== displayOrderB) {
          return displayOrderA - displayOrderB;
        }

        return a.title.localeCompare(b.title, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });

      setBooks(sortedBooks);
      setLoading(false);
    }

    loadBooks();
  }, [userId]);

  function toggleFavorite(bookId: string) {
    setFavoriteBookIds((currentFavorites) => {
      const nextFavorites = currentFavorites.includes(bookId)
        ? currentFavorites.filter((id) => id !== bookId)
        : [...currentFavorites, bookId];

      const storageKey = `fd-arcadia-flashcard-favorites-${userId}`;
      window.localStorage.setItem(storageKey, JSON.stringify(nextFavorites));

      return nextFavorites;
    });
  }

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(books.map((book) => book.category).filter(Boolean))
    );

    return ["all", ...unique];
  }, [books]);

  const filteredBooks = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return books.filter((book) => {
      const matchesCategory =
        activeCategory === "all" || book.category === activeCategory;

      const matchesSearch =
        !keyword ||
        book.title.toLowerCase().includes(keyword) ||
        book.category.toLowerCase().includes(keyword) ||
        String(book.description || "").toLowerCase().includes(keyword) ||
        String(book.age_group || "").toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [books, activeCategory, searchText]);

  const totalBooks = books.length;
  const totalCards = books.reduce((sum, book) => sum + (book.total_cards || 0), 0);
  const canvaBooks = books.filter((book) => book.canva_link).length;
  const firstBook = books[0];

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[280px_1fr]">
        <FlashcardSidebar totalBooks={totalBooks} totalCards={totalCards} />

        <section className="px-4 py-6 lg:px-8">
          <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <ArrowLeft size={20} />
                Back Dashboard
              </Link>

              <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                FD ARCADIA FLASHCARD LIBRARY
              </p>

              <h1 className="mt-1 text-4xl font-black text-indigo-700 sm:text-5xl">
                Flashcard Membaca
              </h1>

              <p className="mt-2 max-w-3xl text-slate-600">
                Open your purchased digital flashcard books, PDF files and Canva
                resources assigned by FD Arcadia admin.
              </p>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-7 text-white shadow-xl">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-yellow-200">
                  <BookOpen size={30} />
                </div>

                <div>
                  <p className="text-sm font-black tracking-[0.25em] text-yellow-200">
                    PREMIUM LIBRARY
                  </p>
                  <h2 className="mt-1 text-3xl font-black">
                    Read, practise and revise.
                  </h2>
                </div>
              </div>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-indigo-100">
                Flashcards are organised for early reading, sound recognition,
                word building and practice at home.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <HeroStat label="Books" value={loading ? "..." : String(totalBooks)} />
                <HeroStat label="Cards" value={loading ? "..." : String(totalCards)} />
                <HeroStat label="Canva" value={String(canvaBooks)} />
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                    COLLECTION PROGRESS
                  </p>
                  <h2 className="mt-2 text-4xl font-black text-indigo-700">
                    {loading ? "..." : `${Math.min(100, totalBooks * 12)}%`}
                  </h2>
                </div>

                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Trophy size={34} />
                </div>
              </div>

              <div className="mt-6 h-4 overflow-hidden rounded-full bg-indigo-50">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${Math.min(100, totalBooks * 12)}%` }}
                />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-500">
                {totalBooks > 0
                  ? `${totalBooks} book unlocked with ${totalCards} cards/pages.`
                  : "No flashcard access yet."}
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <ChildProfileCard totalBooks={totalBooks} totalCards={totalCards} />
            <ContinueReadingCard book={firstBook} loading={loading} />
          </section>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 font-bold text-red-700">
              {error}
            </div>
          ) : null}

          <section className="mt-8 rounded-[2rem] border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                  FILTER
                </p>
                <h2 className="mt-1 text-2xl font-black text-indigo-700">
                  My Library
                </h2>
              </div>

              <div className="flex w-full items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 lg:max-w-sm">
                <Search className="text-indigo-600" size={20} />
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search books, category, age..."
                  className="w-full bg-transparent font-bold text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-2xl px-5 py-3 font-black transition ${
                    activeCategory === category
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  {category === "all" ? "All" : category}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                  BOOKS
                </p>
                <h2 className="mt-1 text-3xl font-black text-indigo-700">
                  Flashcard Books
                </h2>
              </div>
            </div>

            {loading ? (
              <LoadingCard />
            ) : !error && books.length === 0 ? (
              <EmptyState />
            ) : filteredBooks.length === 0 ? (
              <NoSearchResult />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {filteredBooks.map((book, index) => (
                  <FlashcardBookCard
                    key={book.id}
                    book={book}
                    index={index}
                    isFavorite={favoriteBookIds.includes(book.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function FlashcardSidebar({
  totalBooks,
  totalCards,
}: {
  totalBooks: number;
  totalCards: number;
}) {
  return (
    <aside className="hidden border-r border-indigo-100 bg-white p-6 xl:block">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-yellow-200 shadow-lg">
          <Sparkles size={26} />
        </div>

        <div>
          <p className="text-xl font-black tracking-[0.18em] text-slate-900">
            FD ARCADIA
          </p>
          <p className="text-sm font-black tracking-[0.25em] text-indigo-600">
            FLASHCARD
          </p>
        </div>
      </Link>

      <nav className="mt-10 space-y-2">
        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const active = item.title === "Flashcard Library";

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3 font-black transition ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-700"
              }`}
            >
              <Icon size={22} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl">
        <Crown className="text-yellow-200" size={30} />
        <p className="mt-4 font-black">Reading Library</p>
        <h3 className="mt-1 text-xl font-black">{totalBooks} Books</h3>
        <p className="mt-2 text-sm text-indigo-100">
          {totalCards} cards/pages unlocked.
        </p>
        <Link
          href="/pricing"
          className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-black text-indigo-700"
        >
          View Package
        </Link>
      </div>
    </aside>
  );
}

function ChildProfileCard({
  totalBooks,
  totalCards,
}: {
  totalBooks: number;
  totalCards: number;
}) {
  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-sky-100 text-5xl">
          👧
        </div>

        <div>
          <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
            CHILD PROFILE
          </p>
          <h2 className="mt-1 text-3xl font-black text-indigo-700">
            Reading Access
          </h2>
          <p className="mt-1 text-slate-500">Flashcard collection</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <MiniInfo label="Books" value={String(totalBooks)} />
        <MiniInfo label="Cards" value={String(totalCards)} />
      </div>

      <Link
        href="/children"
        className="mt-5 flex items-center justify-between rounded-2xl bg-orange-500 px-5 py-4 font-black text-white transition hover:bg-orange-600"
      >
        <span>View Children</span>
        <ChevronRight size={20} />
      </Link>
    </section>
  );
}

function ContinueReadingCard({
  book,
  loading,
}: {
  book?: FlashcardBook;
  loading: boolean;
}) {
  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
            CONTINUE READING
          </p>
          <h2 className="mt-1 text-3xl font-black text-indigo-700">
            {loading ? "Loading..." : book ? book.title : "No book yet"}
          </h2>
          <p className="mt-2 text-slate-600">
            {book
              ? `${book.category} • ${book.total_cards || 0} cards/pages`
              : "Once admin assigns flashcard access, your first book will appear here."}
          </p>
        </div>

        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-yellow-100 text-4xl">
          {book ? getCategoryEmoji(book.category) : "📚"}
        </div>
      </div>

      <div className="mt-5 h-4 overflow-hidden rounded-full bg-indigo-50">
        <div
          className="h-full rounded-full bg-indigo-600"
          style={{ width: book ? "65%" : "0%" }}
        />
      </div>

      {book?.pdf_url || book?.canva_link ? (
        <a
          href={book.pdf_url || book.canva_link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-between rounded-2xl bg-indigo-600 px-5 py-4 font-black text-white transition hover:bg-indigo-700"
        >
          <span>Open Book</span>
          <ChevronRight size={20} />
        </a>
      ) : (
        <Link
          href="/pricing"
          className="mt-5 flex items-center justify-between rounded-2xl bg-indigo-600 px-5 py-4 font-black text-white transition hover:bg-indigo-700"
        >
          <span>View Package</span>
          <ChevronRight size={20} />
        </Link>
      )}
    </section>
  );
}

function FlashcardBookCard({
  book,
  index,
  isFavorite,
  onToggleFavorite,
}: {
  book: FlashcardBook;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (bookId: string) => void;
}) {
  const featured = index === 0;
  const emoji = getCategoryEmoji(book.category);

  return (
    <article className="group rounded-[2rem] border border-indigo-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="rounded-[1.7rem] bg-gradient-to-br from-yellow-100 to-indigo-100 p-5">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="h-64 w-full object-cover object-top"
            />
          ) : (
            <div className="grid h-64 place-items-center bg-indigo-50 text-7xl">
              {emoji}
            </div>
          )}

          <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-black text-indigo-700 shadow-sm">
            {featured ? "FEATURED" : "PREMIUM"}
          </div>

          <button
            type="button"
            aria-label={
              isFavorite
                ? `Remove ${book.title} from favourites`
                : `Add ${book.title} to favourites`
            }
            aria-pressed={isFavorite}
            title={isFavorite ? "Remove from favourites" : "Add to favourites"}
            onClick={() => onToggleFavorite(book.id)}
            className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full shadow-sm transition hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-200 ${
              isFavorite
                ? "bg-yellow-300 text-yellow-900"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            }`}
          >
            <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="mt-5">
          <h3 className="text-3xl font-black text-indigo-700">
            {book.title}
          </h3>

          <p className="mt-1 font-black text-slate-700">{book.category}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge text={`${book.total_cards || 0} cards/pages`} />
            <Badge text={book.age_group || "All ages"} />
            {book.allow_download ? <Badge text="Download" green /> : null}
          </div>

          {book.description ? (
            <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">
              {book.description}
            </p>
          ) : (
            <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">
              Digital flashcard book prepared by FD Arcadia.
            </p>
          )}

          <div className="mt-5 grid gap-2">
            {book.pdf_url ? (
              <a
                href={book.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-black text-white transition hover:bg-indigo-700"
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
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-200 px-4 py-3 font-black text-yellow-900 transition hover:bg-yellow-300"
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
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-100 px-4 py-3 font-black text-purple-700 transition hover:bg-purple-200"
              >
                <Eye size={18} />
                Open Canva
              </a>
            ) : null}

            {!book.pdf_url && !book.canva_link ? (
              <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-black text-slate-500">
                <LockKeyhole size={18} />
                No link uploaded yet
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4 text-white backdrop-blur">
      <p className="text-3xl font-black text-yellow-200">{value}</p>
      <p className="mt-1 text-sm font-bold text-indigo-100">{label}</p>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-indigo-50 p-4">
      <p className="text-xs font-black tracking-[0.16em] text-yellow-600">
        {label.toUpperCase()}
      </p>
      <p className="mt-1 font-black text-indigo-700">{value}</p>
    </div>
  );
}

function Badge({
  text,
  green,
}: {
  text: string;
  green?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        green
          ? "bg-emerald-100 text-emerald-700"
          : "bg-white text-indigo-700"
      }`}
    >
      {text}
    </span>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
      <Loader2 className="mx-auto animate-spin text-indigo-600" size={40} />
      <p className="mt-4 font-bold text-slate-500">Loading flashcards...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
      <LockKeyhole className="mx-auto text-slate-400" size={44} />

      <h2 className="mt-4 text-3xl font-black text-indigo-700">
        No Flashcard Access Yet
      </h2>

      <p className="mt-2 text-slate-600">
        Admin belum assign flashcard book kepada akaun ini.
      </p>
    </section>
  );
}

function NoSearchResult() {
  return (
    <section className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
      <Search className="mx-auto text-slate-400" size={44} />

      <h2 className="mt-4 text-3xl font-black text-indigo-700">
        No book found
      </h2>

      <p className="mt-2 text-slate-600">
        Try another search keyword or category.
      </p>
    </section>
  );
}
