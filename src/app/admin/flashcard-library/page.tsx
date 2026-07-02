"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Edit,
  Eye,
  FileDown,
  Plus,
  Save,
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
          <BookOpen size={38} className="text-yellow-200" />
          <h1 className="font-display mt-4 text-5xl">Flashcard Library</h1>
          <p className="mt-2 text-indigo-100">
            Upload PDF flashcards and assign access to selected parents only.
          </p>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-bold text-indigo-700">
            {editingId ? "Edit Book" : "Add New Book"}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
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
            className="mt-4 w-full rounded-2xl border border-indigo-200 p-4 outline-none focus:border-indigo-500"
            placeholder="Description"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 font-bold text-slate-700">
              <input
                type="checkbox"
                checked={form.allow_download}
                onChange={(event) =>
                  setForm({ ...form, allow_download: event.target.checked })
                }
              />
              Allow Download
            </label>

            <label className="flex items-center gap-2 font-bold text-slate-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm({ ...form, is_active: event.target.checked })
                }
              />
              Active
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={saveBook}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              {loading ? "Saving..." : editingId ? "Update Book" : "Save Book"}
            </button>

            {editingId ? (
              <button
                onClick={cancelEdit}
                className="rounded-2xl bg-slate-100 px-6 py-3 font-bold text-slate-600"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>

          {message ? <p className="mt-4 text-indigo-700">{message}</p> : null}
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div key={book.id} className="rounded-[2rem] bg-white p-5 shadow-sm">
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

              <h3 className="mt-4 text-2xl font-bold text-indigo-700">
                {book.title}
              </h3>

              <p className="text-slate-600">{book.category}</p>

              <p className="mt-2 text-sm text-slate-500">
                {book.total_cards || 0} cards/pages • {book.age_group}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {book.pdf_url ? (
                  <a
                    href={book.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-100 px-4 py-2 text-indigo-700"
                  >
                    <FileDown size={16} />
                    PDF
                  </a>
                ) : null}

                {book.canva_link ? (
                  <a
                    href={book.canva_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl bg-purple-100 px-4 py-2 text-purple-700"
                  >
                    <Eye size={16} />
                    Canva
                  </a>
                ) : null}

                <button
                  onClick={() => openAssign(book)}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-4 py-2 text-emerald-700"
                >
                  <Users size={16} />
                  Assign Parent
                </button>

                <button
                  onClick={() => editBook(book)}
                  className="inline-flex items-center gap-1 rounded-xl bg-yellow-100 px-4 py-2 text-yellow-700"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={() => deleteBook(book.id)}
                  className="inline-flex items-center gap-1 rounded-xl bg-red-100 px-4 py-2 text-red-700"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>

        {assignBook ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
            <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-indigo-700">
                    Assign Parent
                  </h2>
                  <p className="mt-1 text-slate-600">{assignBook.title}</p>
                </div>

                <button
                  onClick={() => setAssignBook(null)}
                  className="rounded-2xl bg-slate-100 px-4 py-2 font-bold text-slate-600"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                {parents.map((parent) => {
                  const checked = assignedParentIds.includes(parent.id);

                  return (
                    <button
                      key={parent.id}
                      onClick={() => toggleParentAccess(parent.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        checked
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      <p className="font-bold">
                        {checked ? "✅ " : "⬜ "}
                        {parent.full_name || "No name"}
                      </p>
                      <p className="text-sm">{parent.email}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </>
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
      className="rounded-2xl border border-indigo-200 p-4 outline-none focus:border-indigo-500"
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
    <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 p-4 text-indigo-700 transition hover:bg-indigo-100">
      <span className="flex items-center gap-2 font-bold">
        <UploadCloud size={20} />
        {label}
      </span>

      <span className="text-sm text-slate-500">
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