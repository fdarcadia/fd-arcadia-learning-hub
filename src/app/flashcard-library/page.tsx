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
        activeCategory === "all" ||
        (activeCategory === "favorites"
          ? favoriteBookIds.includes(book.id)
          : book.category === activeCategory);

      const matchesSearch =
        !keyword ||
        book.title.toLowerCase().includes(keyword) ||
        book.category.toLowerCase().includes(keyword) ||
        String(book.description || "").toLowerCase().includes(keyword) ||
        String(book.age_group || "").toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [books, activeCategory, searchText, favoriteBookIds]);

  const totalBooks = books.length;
  const totalCards = books.reduce((sum, book) => sum + (book.total_cards || 0), 0);
  const canvaBooks = books.filter((book) => book.canva_link).length;
  const firstBook = books[0];

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[250px_minmax(0,1fr)]">
        <FlashcardSidebar totalBooks={totalBooks} totalCards={totalCards} />

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          {/* HEADER */}
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={18} />
              </Link>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-indigo-500">
                  FD Arcadia
                </p>
                <h1 className="mt-0.5 text-3xl font-black tracking-tight sm:text-4xl">
                  Flashcard Library
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  All your unlocked flashcard books in one place.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm lg:w-[300px]">
                <Search size={17} className="shrink-0 text-slate-400" />
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search flashcards..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  setActiveCategory((current) =>
                    current === "favorites" ? "all" : "favorites",
                  )
                }
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-black shadow-sm transition ${
                  activeCategory === "favorites"
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100"
                }`}
              >
                <Star
                  size={16}
                  fill={activeCategory === "favorites" ? "currentColor" : "none"}
                />
                My Favourites
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    activeCategory === "favorites"
                      ? "bg-white/20 text-white"
                      : "bg-white text-violet-700"
                  }`}
                >
                  {favoriteBookIds.length}
                </span>
              </button>
            </div>
          </header>

          {/* PREMIUM HERO */}
          <section className="relative mt-5 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#10162f] via-[#25245a] to-[#171c42] px-5 py-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.16)] sm:px-6">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-indigo-400/10 blur-3xl" />

            <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-yellow-300">
                  <Trophy size={30} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">
                    Premium Learning Library
                  </p>
                  <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                    Keep Learning, Keep Growing!
                  </h2>
                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-300">
                    Build reading confidence with your unlocked FD Arcadia
                    flashcards and practise at your own pace.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.06]">
                <HeroStat
                  label="Books"
                  value={loading ? "..." : String(totalBooks)}
                />
                <HeroStat
                  label="Cards"
                  value={loading ? "..." : String(totalCards)}
                />
                <HeroStat
                  label="Favourites"
                  value={String(favoriteBookIds.length)}
                />
              </div>
            </div>
          </section>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          ) : null}

          {/* FILTERS */}
          <section className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
                    activeCategory === category
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
                  }`}
                >
                  {category === "all" ? "All" : category}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setActiveCategory("favorites")}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
                  activeCategory === "favorites"
                    ? "border-pink-500 bg-pink-500 text-white"
                    : "border-pink-100 bg-pink-50 text-pink-600 hover:bg-pink-100"
                }`}
              >
                ★ Favourites
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-400">
                {filteredBooks.length}{" "}
                {filteredBooks.length === 1 ? "book" : "books"}
              </span>
              <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500 shadow-sm">
                Sort: Book Number
              </span>
            </div>
          </section>

          {/* BOOK GRID */}
          <section className="mt-4">
            {loading ? (
              <LoadingCard />
            ) : !error && books.length === 0 ? (
              <EmptyState />
            ) : filteredBooks.length === 0 ? (
              <NoSearchResult />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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

          <footer className="mt-7 border-t border-slate-200 py-5 text-center text-xs font-semibold text-slate-400">
            ✨ Practice today, master tomorrow. 💜
          </footer>
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
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-4 py-6 text-white xl:flex xl:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <BookOpen size={22} />
        </div>

        <div>
          <p className="text-sm font-black tracking-[0.08em]">FD ARCADIA</p>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-300">
            FLASHCARDS
          </p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1.5">
        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const active = item.title === "Flashcard Library";

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-black transition ${
                active
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.title}
            </Link>
          );
        })}

        <Link
          href="/worksheet"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-black text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
        >
          <Sparkles size={18} />
          Draw & Learn
        </Link>
      </nav>

      <div className="mt-auto rounded-[20px] border border-violet-400/20 bg-gradient-to-br from-violet-600/35 to-indigo-500/15 p-4">
        <div className="flex items-center gap-2 text-yellow-300">
          <Crown size={18} />
          <p className="text-xs font-black">Premium Access</p>
        </div>

        <p className="mt-2 text-xs leading-5 text-indigo-100">
          Your assigned flashcard collection is ready to use.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/10 px-3 py-2">
            <p className="text-lg font-black">{totalBooks}</p>
            <p className="text-[9px] font-bold text-indigo-200">Books</p>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2">
            <p className="text-lg font-black">{totalCards}</p>
            <p className="text-[9px] font-bold text-indigo-200">Cards</p>
          </div>
        </div>
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
    <article className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(15,23,42,0.10)]">
      <div className="relative overflow-hidden bg-slate-50">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="aspect-[4/3] w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-indigo-50 via-violet-50 to-white">
            <div className="text-center">
              <div className="text-5xl">{emoji}</div>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-indigo-500">
                {book.category}
              </p>
            </div>
          </div>
        )}

        {featured ? (
          <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-white shadow-sm">
            Featured
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-indigo-600 shadow-sm backdrop-blur">
            Premium
          </span>
        )}

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
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border shadow-sm backdrop-blur transition hover:scale-105 ${
            isFavorite
              ? "border-rose-100 bg-white text-rose-500"
              : "border-white/70 bg-white/90 text-slate-400 hover:text-rose-500"
          }`}
        >
          <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-black text-slate-950">
          {book.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-slate-400">
          {book.category}
          {book.age_group ? ` • ${book.age_group}` : ""}
        </p>

        {book.description ? (
          <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
            {book.description}
          </p>
        ) : (
          <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
            Digital flashcard book prepared by FD Arcadia.
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-[10px] font-black text-slate-500">
            {book.total_cards || 0} cards/pages
          </span>

          {book.pdf_url || book.canva_link ? (
            <a
              href={book.pdf_url || book.canva_link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
              title="Open flashcard"
            >
              <Eye size={16} />
            </a>
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-400">
              <LockKeyhole size={15} />
            </span>
          )}
        </div>

        {(book.allow_download && book.pdf_url) || book.canva_link ? (
          <div className="mt-2 flex gap-2">
            {book.allow_download && book.pdf_url ? (
              <a
                href={book.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-black text-slate-600 transition hover:bg-slate-50"
              >
                <Download size={13} />
                Download
              </a>
            ) : null}

            {book.canva_link ? (
              <a
                href={book.canva_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-violet-100 bg-violet-50 px-2 py-2 text-[10px] font-black text-violet-600 transition hover:bg-violet-100"
              >
                <Sparkles size={13} />
                Canva
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-3 py-4 text-center">
      <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
      <p className="mt-1 truncate text-[8px] font-black uppercase tracking-[0.1em] text-slate-400 sm:text-[9px]">
        {label}
      </p>
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
    <div className="grid min-h-[280px] place-items-center rounded-[20px] border border-slate-200 bg-white">
      <div className="text-center">
        <Loader2 className="mx-auto animate-spin text-indigo-600" size={30} />
        <p className="mt-3 text-xs font-black text-slate-400">Loading library...</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <LockKeyhole className="mx-auto text-slate-300" size={34} />
      <h2 className="mt-4 text-xl font-black text-slate-950">
        No Flashcard Access Yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Flashcard books assigned by FD Arcadia admin will appear here.
      </p>
    </section>
  );
}

function NoSearchResult() {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <Search className="mx-auto text-slate-300" size={34} />
      <h2 className="mt-4 text-xl font-black text-slate-950">
        No flashcard found
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Try another search keyword or category.
      </p>
    </section>
  );
}