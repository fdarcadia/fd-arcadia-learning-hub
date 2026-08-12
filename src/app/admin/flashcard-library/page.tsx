"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Edit,
  Eye,
  FileDown,
  ImageIcon,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";
const STORAGE_BUCKET = "flashcards";

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

type ParentProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type FlashcardAccessRow = {
  parent_id: string;
};

type FlashcardForm = {
  title: string;
  category: string;
  description: string;
  cover_url: string;
  pdf_url: string;
  canva_link: string;
  total_cards: number;
  age_group: string;
  allow_download: boolean;
  display_order: number;
  is_active: boolean;
};

const emptyForm: FlashcardForm = {
  title: "",
  category: "",
  description: "",
  cover_url: "",
  pdf_url: "",
  canva_link: "",
  total_cards: 0,
  age_group: "4-6 Tahun",
  allow_download: true,
  display_order: 1,
  is_active: true,
};

export default function AdminFlashcardLibraryPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <FlashcardAdmin />
        ) : (
          <>
            <Navbar />
            <main className="page-shell py-10">
              <h1 className="text-3xl font-bold text-red-600">
                Access denied
              </h1>
              <p className="mt-2 text-slate-600">
                Only FD Arcadia admin can open this page.
              </p>
            </main>
          </>
        )
      }
    </ProtectedPage>
  );
}

function FlashcardAdmin() {
  const [books, setBooks] = useState<FlashcardBook[]>([]);
  const [parents, setParents] = useState<ParentProfile[]>([]);
  const [assignedParentIds, setAssignedParentIds] = useState<string[]>([]);
  const [assignBook, setAssignBook] = useState<FlashcardBook | null>(null);

  const [form, setForm] = useState<FlashcardForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchText, setSearchText] = useState("");

  async function loadBooks() {
    const { data, error } = await supabase
      .from("flashcard_library")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setBooks((data || []) as FlashcardBook[]);
  }

  async function loadParents() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .neq("email", ADMIN_EMAIL)
      .order("full_name", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setParents((data || []) as ParentProfile[]);
  }

  useEffect(() => {
    loadBooks();
    loadParents();
  }, []);

  async function uploadFile(file: File, folder: string) {
    const fileExt = file.name.split(".").pop();
    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();

    const filePath = `${folder}/${Date.now()}-${safeName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function saveBook() {
    try {
      setLoading(true);
      setMessage("");

      let coverUrl = form.cover_url;
      let pdfUrl = form.pdf_url;

      if (coverFile) {
        coverUrl = await uploadFile(coverFile, "covers");
      }

      if (pdfFile) {
        pdfUrl = await uploadFile(pdfFile, "pdfs");
      }

      const payload = {
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        cover_url: coverUrl,
        pdf_url: pdfUrl,
        canva_link: form.canva_link.trim(),
        total_cards: Number(form.total_cards),
        age_group: form.age_group.trim(),
        allow_download: form.allow_download,
        display_order: Number(form.display_order),
        is_active: form.is_active,
      };

      if (!payload.title || !payload.category) {
        setMessage("Please fill in title and category.");
        setLoading(false);
        return;
      }

      const result = editingId
        ? await supabase
            .from("flashcard_library")
            .update(payload)
            .eq("id", editingId)
        : await supabase.from("flashcard_library").insert(payload);

      if (result.error) {
        setMessage(result.error.message);
        setLoading(false);
        return;
      }

      setForm(emptyForm);
      setEditingId(null);
      setCoverFile(null);
      setPdfFile(null);
      setMessage("Saved successfully.");
      await loadBooks();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  function editBook(book: FlashcardBook) {
    setEditingId(book.id);
    setCoverFile(null);
    setPdfFile(null);

    setForm({
      title: book.title || "",
      category: book.category || "",
      description: book.description || "",
      cover_url: book.cover_url || "",
      pdf_url: book.pdf_url || "",
      canva_link: book.canva_link || "",
      total_cards: book.total_cards || 0,
      age_group: book.age_group || "4-6 Tahun",
      allow_download: Boolean(book.allow_download),
      display_order: book.display_order || 1,
      is_active: Boolean(book.is_active),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteBook(id: string) {
    const confirmDelete = confirm("Delete this book?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("flashcard_library")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadBooks();
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setCoverFile(null);
    setPdfFile(null);
    setMessage("");
  }

  async function openAssign(book: FlashcardBook) {
    setAssignBook(book);
    setMessage("");

    const { data, error } = await supabase
      .from("flashcard_access")
      .select("parent_id")
      .eq("flashcard_id", book.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    const accessRows = (data || []) as FlashcardAccessRow[];
    setAssignedParentIds(accessRows.map((item) => item.parent_id));
  }

  async function toggleParentAccess(parentId: string) {
    if (!assignBook) return;

    const alreadyAssigned = assignedParentIds.includes(parentId);

    if (alreadyAssigned) {
      const { error } = await supabase
        .from("flashcard_access")
        .delete()
        .eq("flashcard_id", assignBook.id)
        .eq("parent_id", parentId);

      if (error) {
        setMessage(error.message);
        return;
      }

      setAssignedParentIds((current) =>
        current.filter((id) => id !== parentId)
      );
    } else {
      const { error } = await supabase.from("flashcard_access").insert({
        flashcard_id: assignBook.id,
        parent_id: parentId,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setAssignedParentIds((current) => [...current, parentId]);
    }
  }

  const activeBooks = books.filter((book) => book.is_active).length;
  const downloadableBooks = books.filter((book) => book.allow_download).length;
  const totalCards = books.reduce(
    (sum, book) => sum + (book.total_cards || 0),
    0
  );

  const filteredBooks = books.filter((book) => {
    const haystack = `${book.title} ${book.category} ${book.age_group || ""}`.toLowerCase();
    return haystack.includes(searchText.trim().toLowerCase());
  });


  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[250px_minmax(0,1fr)]">
        <FlashcardSidebar />

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 transition hover:text-indigo-700"
              >
                <ArrowLeft size={15} />
                Back to Admin
              </Link>

              <p className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
                Content Management
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Flashcard Library
              </h1>

              <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-400">
                Upload, organise and assign flashcard books to selected parents.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setCoverFile(null);
                  setPdfFile(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                <Plus size={15} />
                New Book
              </button>
            </div>
          </header>

          <section className="relative mt-5 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#111735] via-[#25265f] to-[#5145a6] p-5 text-white shadow-[0_20px_55px_rgba(15,23,42,0.16)] sm:p-6">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />

            <div className="relative grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-yellow-300">
                  <BookOpen size={21} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                    Premium Resource Manager
                  </p>
                  <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                    Build your flashcard collection.
                  </h2>
                  <p className="mt-2 max-w-xl text-xs leading-5 text-slate-300">
                    Manage covers, PDFs, Canva links, download access and parent assignments.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.06]">
                <HeroStat value={books.length} label="Books" />
                <HeroStat value={activeBooks} label="Active" />
                <HeroStat value={downloadableBooks} label="Download" />
                <HeroStat value={totalCards} label="Cards" />
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 2xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
                    {editingId ? "Edit Resource" : "New Resource"}
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    {editingId ? "Edit Flashcard Book" : "Add Flashcard Book"}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Add the book details, cover and PDF file.
                  </p>
                </div>

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  {editingId ? <Edit size={18} /> : <Plus size={18} />}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Input
                  label="Title"
                  value={form.title}
                  onChange={(value) => setForm({ ...form, title: value })}
                />

                <Input
                  label="Category"
                  value={form.category}
                  onChange={(value) => setForm({ ...form, category: value })}
                />

                <FileInput
                  label="Upload Cover Image"
                  accept="image/*"
                  file={coverFile}
                  onChange={setCoverFile}
                />

                <FileInput
                  label="Upload PDF"
                  accept="application/pdf"
                  file={pdfFile}
                  onChange={setPdfFile}
                />

                <Input
                  label="Canva Link Optional"
                  value={form.canva_link}
                  onChange={(value) => setForm({ ...form, canva_link: value })}
                />

                <Input
                  label="Age Group"
                  value={form.age_group}
                  onChange={(value) => setForm({ ...form, age_group: value })}
                />

                <Input
                  label="Total Cards / Pages"
                  type="number"
                  value={String(form.total_cards)}
                  onChange={(value) =>
                    setForm({ ...form, total_cards: Number(value) })
                  }
                />

                <Input
                  label="Display Order"
                  type="number"
                  value={String(form.display_order)}
                  onChange={(value) =>
                    setForm({ ...form, display_order: Number(value) })
                  }
                />
              </div>

              <textarea
                className="mt-3 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                placeholder="Description"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ToggleCard
                  label="Allow Download"
                  description="Parents can download the PDF file."
                  checked={form.allow_download}
                  onChange={(checked) =>
                    setForm({ ...form, allow_download: checked })
                  }
                  tone="emerald"
                />

                <ToggleCard
                  label="Active"
                  description="Show this resource in the library."
                  checked={form.is_active}
                  onChange={(checked) =>
                    setForm({ ...form, is_active: checked })
                  }
                  tone="violet"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveBook}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-xs font-black text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
                >
                  {editingId ? <Save size={16} /> : <Plus size={16} />}
                  {loading ? "Saving..." : editingId ? "Update Book" : "Save Book"}
                </button>

                {editingId ? (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>

              {message ? (
                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs font-bold text-indigo-700">
                  {message}
                </div>
              ) : null}
            </section>

            <section>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Resource Library
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">
                      Your Flashcard Books
                    </h2>
                  </div>

                  <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:max-w-xs">
                    <Search size={15} className="text-slate-400" />
                    <input
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                      placeholder="Search books..."
                      className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {filteredBooks.map((book) => (
                  <FlashcardBookCard
                    key={book.id}
                    book={book}
                    onAssign={openAssign}
                    onEdit={editBook}
                    onDelete={deleteBook}
                  />
                ))}

                {filteredBooks.length === 0 ? (
                  <div className="sm:col-span-2 rounded-[22px] border border-dashed border-slate-300 bg-white p-10 text-center">
                    <BookOpen className="mx-auto text-slate-300" size={34} />
                    <p className="mt-3 text-sm font-black text-slate-700">
                      No flashcard books found.
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </section>

          {assignBook ? (
            <AssignParentModal
              book={assignBook}
              parents={parents}
              assignedParentIds={assignedParentIds}
              onToggle={toggleParentAccess}
              onClose={() => setAssignBook(null)}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}


function FlashcardSidebar() {
  return (
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-4 py-6 text-white xl:flex xl:flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <Sparkles size={20} />
        </div>
        <div>
          <p className="text-sm font-black tracking-[0.08em]">FD ARCADIA</p>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-300">
            FLASHCARD ADMIN
          </p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1.5 text-xs font-black">
        <SideItem href="/dashboard" label="Dashboard" />
        <SideItem href="/admin" label="Parent Manage" />
        <SideItem href="/admin/calendar" label="Calendar Diary" />
        <SideItem href="/admin/learning-hub" label="Learning Hub" />
        <SideItem href="/admin/freebies" label="Freebies" />
        <SideItem href="/admin/flashcard-library" label="Flashcard Library" active />
      </nav>

      <div className="mt-auto rounded-[20px] border border-violet-400/20 bg-gradient-to-br from-violet-600/35 to-indigo-500/15 p-4">
        <BookOpen className="text-yellow-300" size={18} />
        <p className="mt-3 text-xs font-black">Flashcard Manager</p>
        <p className="mt-1 text-[10px] leading-5 text-indigo-200">
          Upload, organise and assign learning resources.
        </p>
      </div>
    </aside>
  );
}

function SideItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-xl px-3 py-3 transition ${
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function HeroStat({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="px-3 py-4 text-center">
      <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ToggleCard({
  label,
  description,
  checked,
  onChange,
  tone,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tone: "emerald" | "violet";
}) {
  const activeClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50"
      : "border-violet-200 bg-violet-50";

  return (
    <label
      className={`flex cursor-pointer items-center justify-between rounded-[16px] border p-4 transition ${
        checked ? activeClass : "border-slate-200 bg-slate-50"
      }`}
    >
      <div>
        <p className="text-xs font-black text-slate-800">{label}</p>
        <p className="mt-1 text-[9px] font-semibold text-slate-400">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-indigo-600"
      />
    </label>
  );
}

function FlashcardBookCard({
  book,
  onAssign,
  onEdit,
  onDelete,
}: {
  book: FlashcardBook;
  onAssign: (book: FlashcardBook) => void;
  onEdit: (book: FlashcardBook) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <div className="relative bg-gradient-to-br from-violet-50 via-indigo-50 to-white p-3">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-52 w-full rounded-[16px] object-cover"
          />
        ) : (
          <div className="grid h-52 place-items-center rounded-[16px] bg-white text-violet-500 shadow-inner">
            <ImageIcon size={38} />
          </div>
        )}

        <div className="absolute left-5 top-5 flex gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[8px] font-black ${
              book.is_active
                ? "bg-emerald-500 text-white"
                : "bg-slate-700 text-white"
            }`}
          >
            {book.is_active ? "ACTIVE" : "INACTIVE"}
          </span>

          {book.allow_download ? (
            <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-black text-indigo-700 shadow-sm">
              DOWNLOAD
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-violet-500">
          {book.category}
        </p>
        <h3 className="mt-1 line-clamp-1 text-lg font-black text-slate-950">
          {book.title}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
          {book.description || "No description added."}
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-black">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            {book.total_cards || 0} cards/pages
          </span>
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
            {book.age_group || "Age not set"}
          </span>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
            Order {book.display_order || 0}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {book.pdf_url ? (
            <a
              href={book.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2.5 text-[10px] font-black text-indigo-700"
            >
              <FileDown size={14} />
              PDF
            </a>
          ) : (
            <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-center text-[10px] font-black text-slate-400">
              No PDF
            </div>
          )}

          {book.canva_link ? (
            <a
              href={book.canva_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-50 px-3 py-2.5 text-[10px] font-black text-violet-700"
            >
              <Eye size={14} />
              Canva
            </a>
          ) : (
            <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-center text-[10px] font-black text-slate-400">
              No Canva
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => onAssign(book)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2.5 text-[10px] font-black text-emerald-700 transition hover:bg-emerald-100"
          >
            <Users size={14} />
            Assign
          </button>

          <button
            type="button"
            onClick={() => onEdit(book)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2.5 text-[10px] font-black text-amber-700 transition hover:bg-amber-100"
          >
            <Edit size={14} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(book.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2.5 text-[10px] font-black text-rose-700 transition hover:bg-rose-100"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

function AssignParentModal({
  book,
  parents,
  assignedParentIds,
  onToggle,
  onClose,
}: {
  book: FlashcardBook;
  parents: ParentProfile[];
  assignedParentIds: string[];
  onToggle: (parentId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-[26px] border border-white/50 bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-[#111735] via-[#25265f] to-[#5145a6] p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-300">
                Parent Access
              </p>
              <h2 className="mt-1 text-2xl font-black">Assign Parent</h2>
              <p className="mt-1 text-xs text-slate-300">{book.title}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white"
            >
              Close
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-white/[0.07] px-3 py-2 text-[10px] font-black text-violet-200">
            {assignedParentIds.length} parent(s) assigned
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          <div className="grid gap-2">
            {parents.map((parent) => {
              const checked = assignedParentIds.includes(parent.id);

              return (
                <button
                  key={parent.id}
                  type="button"
                  onClick={() => onToggle(parent.id)}
                  className={`flex items-center justify-between rounded-[16px] border p-4 text-left transition ${
                    checked
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                  }`}
                >
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {parent.full_name || "No name"}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-400">
                      {parent.email}
                    </p>
                  </div>

                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full ${
                      checked
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {checked ? <CheckCircle2 size={15} /> : <Users size={14} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}



function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
    />
  );
}

function FileInput({
  label,
  accept,
  file,
  onChange,
}: {
  label: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col gap-2 rounded-[16px] border-2 border-dashed border-violet-200 bg-violet-50/50 p-4 text-violet-700 transition hover:border-violet-300 hover:bg-violet-50">
      <span className="flex items-center gap-2 font-bold">
        <UploadCloud size={20} />
        {label}
      </span>

      <span className="text-[10px] font-semibold text-slate-400">
        {file ? file.name : "Click to choose file"}
      </span>

      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
    </label>
  );
}