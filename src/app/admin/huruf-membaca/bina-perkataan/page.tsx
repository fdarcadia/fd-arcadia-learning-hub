"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Eye,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { PortalShell } from "@/components/PortalShell";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";
const STORAGE_BUCKET = "word-build-images";

type WordQuestion = {
  id: string;
  level: string;
  word: string;
  syllable_1: string;
  syllable_2: string;
  letter_pool: string[];
  image_url: string | null;
  image_alt: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type FormState = {
  id: string | null;
  level: string;
  word: string;
  syllable1: string;
  syllable2: string;
  letterPool: string;
  imageUrl: string;
  imageAlt: string;
  displayOrder: number;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  level: "KVKV",
  word: "",
  syllable1: "",
  syllable2: "",
  letterPool: "",
  imageUrl: "",
  imageAlt: "",
  displayOrder: 1,
  isActive: true,
};

export default function AdminBinaPerkataanPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <PortalShell role="admin">
            <AdminBinaPerkataan />
          </PortalShell>
        ) : (
          <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
            <div className="max-w-md rounded-[28px] border border-red-100 bg-white p-6 text-center shadow-sm">
              <h1 className="text-xl font-black text-slate-900">
                Admin Access Only
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                This page is only available to the FD Arcadia admin account.
              </p>
              <Link
                href="/dashboard"
                className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white"
              >
                Back to Dashboard
              </Link>
            </div>
          </main>
        )
      }
    </ProtectedPage>
  );
}

function AdminBinaPerkataan() {
  const [questions, setQuestions] = useState<WordQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("word_build_questions")
        .select(
          "id,level,word,syllable_1,syllable_2,letter_pool,image_url,image_alt,display_order,is_active,created_at,updated_at"
        )
        .eq("level", "KVKV")
        .order("display_order", { ascending: true });

      if (error) {
        throw error;
      }

      setQuestions((data || []) as WordQuestion[]);
    } catch (error) {
      console.error("Load word questions error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load Bina Perkataan questions."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredQuestions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return questions.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.word.toLowerCase().includes(keyword) ||
        item.syllable_1.toLowerCase().includes(keyword) ||
        item.syllable_2.toLowerCase().includes(keyword);

      const matchesStatus =
        activeFilter === "all" ||
        (activeFilter === "active" && item.is_active) ||
        (activeFilter === "inactive" && !item.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [questions, search, activeFilter]);

  const totalWithImages = questions.filter((item) => item.image_url).length;
  const activeCount = questions.filter((item) => item.is_active).length;

  function resetForm() {
    setForm({
      ...EMPTY_FORM,
      displayOrder:
        questions.length > 0
          ? Math.max(...questions.map((item) => item.display_order || 0)) + 1
          : 1,
    });
    setMessage("");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function editQuestion(item: WordQuestion) {
    setForm({
      id: item.id,
      level: item.level || "KVKV",
      word: item.word || "",
      syllable1: item.syllable_1 || "",
      syllable2: item.syllable_2 || "",
      letterPool: (item.letter_pool || []).join(", "),
      imageUrl: item.image_url || "",
      imageAlt: item.image_alt || "",
      displayOrder: item.display_order || 1,
      isActive: item.is_active,
    });

    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function normaliseLetterPool(raw: string) {
    return raw
      .split(/[,\s]+/)
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  function autoGenerateLetterPool() {
    const letters = form.word
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .split("");

    setForm((current) => ({
      ...current,
      letterPool: [...letters]
        .sort(() => Math.random() - 0.5)
        .join(", "),
    }));
  }

  async function handleImageUpload(file: File) {
    if (!file) return;

    try {
      setUploading(true);
      setErrorMessage("");
      setMessage("");

      const extension = file.name.split(".").pop()?.toLowerCase() || "png";
      const cleanWord = (form.word || "question")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const objectPath = `kvkv/${cleanWord || "question"}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(objectPath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(objectPath);

      const publicUrl = data.publicUrl;

      setForm((current) => ({
        ...current,
        imageUrl: publicUrl,
        imageAlt:
          current.imageAlt ||
          (current.word ? `Gambar ${current.word}` : "Gambar petunjuk"),
      }));

      setMessage("Gambar berjaya dimuat naik.");
    } catch (error) {
      console.error("Image upload error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Gambar gagal dimuat naik."
      );
    } finally {
      setUploading(false);
    }
  }

  async function saveQuestion() {
    const word = form.word.trim().toLowerCase();
    const syllable1 = form.syllable1.trim().toLowerCase();
    const syllable2 = form.syllable2.trim().toLowerCase();
    const letters = normaliseLetterPool(form.letterPool);

    if (!word || !syllable1 || !syllable2) {
      setErrorMessage("Isi perkataan, Suku Kata 1 dan Suku Kata 2 dahulu.");
      return;
    }

    if (letters.length === 0) {
      setErrorMessage("Masukkan huruf rawak atau tekan Auto Huruf.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setMessage("");

      const payload = {
        level: "KVKV",
        word,
        syllable_1: syllable1,
        syllable_2: syllable2,
        letter_pool: letters,
        image_url: form.imageUrl.trim() || null,
        image_alt:
          form.imageAlt.trim() || (word ? `Gambar ${word}` : "Gambar petunjuk"),
        display_order: Number(form.displayOrder) || 1,
        is_active: form.isActive,
        updated_at: new Date().toISOString(),
      };

      if (form.id) {
        const { error } = await supabase
          .from("word_build_questions")
          .update(payload)
          .eq("id", form.id);

        if (error) throw error;

        setMessage("Soalan berjaya dikemas kini.");
      } else {
        const { error } = await supabase
          .from("word_build_questions")
          .insert(payload);

        if (error) throw error;

        setMessage("Soalan baru berjaya ditambah.");
      }

      await loadQuestions();
      resetForm();
    } catch (error) {
      console.error("Save word question error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Soalan gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleQuestion(item: WordQuestion) {
    try {
      const { error } = await supabase
        .from("word_build_questions")
        .update({
          is_active: !item.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;

      setQuestions((current) =>
        current.map((question) =>
          question.id === item.id
            ? {
                ...question,
                is_active: !question.is_active,
              }
            : question
        )
      );
    } catch (error) {
      console.error("Toggle question error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Status gagal dikemas kini."
      );
    }
  }

  async function deleteQuestion(item: WordQuestion) {
    const confirmed = window.confirm(
      `Padam soalan "${item.word}"? Tindakan ini tidak boleh dibatalkan.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      setErrorMessage("");

      const { error } = await supabase
        .from("word_build_questions")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      setQuestions((current) =>
        current.filter((question) => question.id !== item.id)
      );

      if (form.id === item.id) {
        resetForm();
      }

      setMessage(`Soalan "${item.word}" telah dipadam.`);
    } catch (error) {
      console.error("Delete word question error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Soalan gagal dipadam."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <Link
              href="/dashboard"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
                Huruf & Membaca Manager
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Bina Perkataan
              </h1>

              <p className="mt-1 max-w-2xl text-sm font-semibold text-slate-400">
                Urus 30 soalan KVKV dan gambar petunjuk untuk aktiviti parent.
                Parent dashboard lain tidak diubah.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <MetricPill label="Soalan" value={questions.length} />
            <MetricPill label="Ada Gambar" value={totalWithImages} />
            <MetricPill label="Aktif" value={activeCount} />
          </div>
        </header>

        {errorMessage ? (
          <div className="mt-5 flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="grid h-7 w-7 place-items-center rounded-lg hover:bg-red-100"
            >
              <X size={15} />
            </button>
          </div>
        ) : null}

        {message ? (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            <Check size={17} />
            {message}
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 2xl:grid-cols-[420px_minmax(0,1fr)]">
          {/* EDITOR */}
          <section className="self-start rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] 2xl:sticky 2xl:top-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-500">
                  Question Editor
                </p>
                <h2 className="mt-1 text-xl font-black">
                  {form.id ? "Edit Soalan" : "Tambah Soalan"}
                </h2>
              </div>

              {form.id ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600"
                >
                  <Plus size={14} />
                  Baru
                </button>
              ) : null}
            </div>

            <div className="mt-5 space-y-4">
              <Field label="Perkataan">
                <input
                  value={form.word}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      word: event.target.value,
                    }))
                  }
                  placeholder="Contoh: batu"
                  className="admin-input"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Suku Kata 1">
                  <input
                    value={form.syllable1}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        syllable1: event.target.value,
                      }))
                    }
                    placeholder="ba"
                    className="admin-input"
                  />
                </Field>

                <Field label="Suku Kata 2">
                  <input
                    value={form.syllable2}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        syllable2: event.target.value,
                      }))
                    }
                    placeholder="tu"
                    className="admin-input"
                  />
                </Field>
              </div>

              <Field label="Huruf Rawak">
                <div className="flex gap-2">
                  <input
                    value={form.letterPool}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        letterPool: event.target.value,
                      }))
                    }
                    placeholder="u, t, a, b"
                    className="admin-input min-w-0 flex-1"
                  />

                  <button
                    type="button"
                    onClick={autoGenerateLetterPool}
                    className="shrink-0 rounded-xl border border-violet-200 bg-violet-50 px-3 text-xs font-black text-violet-700"
                  >
                    Auto Huruf
                  </button>
                </div>

                <p className="mt-1 text-[10px] font-semibold text-slate-400">
                  Boleh pisahkan menggunakan koma atau ruang.
                </p>
              </Field>

              <div className="grid grid-cols-[1fr_120px] gap-3">
                <Field label="Susunan">
                  <input
                    type="number"
                    min={1}
                    value={form.displayOrder}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        displayOrder: Number(event.target.value),
                      }))
                    }
                    className="admin-input"
                  />
                </Field>

                <Field label="Status">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        isActive: !current.isActive,
                      }))
                    }
                    className={`h-12 w-full rounded-xl border text-xs font-black transition ${
                      form.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    }`}
                  >
                    {form.isActive ? "Aktif" : "Tidak Aktif"}
                  </button>
                </Field>
              </div>

              {/* IMAGE */}
              <Field label="Gambar Petunjuk">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleImageUpload(file);
                    }
                  }}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex min-h-[120px] w-full items-center justify-center overflow-hidden rounded-[20px] border-2 border-dashed border-violet-200 bg-violet-50/50 transition hover:border-violet-400 hover:bg-violet-50 disabled:opacity-60"
                >
                  {form.imageUrl ? (
                    <div className="grid w-full grid-cols-[110px_1fr] items-center gap-4 p-3 text-left">
                      <div className="grid h-[95px] w-[110px] place-items-center overflow-hidden rounded-2xl bg-white">
                        <img
                          src={form.imageUrl}
                          alt={form.imageAlt || form.word}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-black text-slate-800">
                          Tukar gambar
                        </p>
                        <p className="mt-1 text-[10px] font-semibold leading-5 text-slate-400">
                          PNG/JPG/WebP. Gambar transparent PNG paling kemas.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      {uploading ? (
                        <Loader2
                          size={26}
                          className="mx-auto animate-spin text-violet-600"
                        />
                      ) : (
                        <ImagePlus
                          size={28}
                          className="mx-auto text-violet-600"
                        />
                      )}

                      <p className="mt-2 text-xs font-black text-violet-700">
                        {uploading ? "Uploading..." : "Upload Gambar"}
                      </p>

                      <p className="mt-1 text-[10px] font-semibold text-slate-400">
                        PNG / JPG / WebP
                      </p>
                    </div>
                  )}
                </button>
              </Field>

              <Field label="Alt Text">
                <input
                  value={form.imageAlt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      imageAlt: event.target.value,
                    }))
                  }
                  placeholder="Gambar batu"
                  className="admin-input"
                />
              </Field>

              {/* MINI PREVIEW */}
              <div className="rounded-[22px] border border-violet-100 bg-[#faf8ff] p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-violet-500">
                  Parent Preview
                </p>

                <div className="mt-3 flex items-center gap-4">
                  <div className="grid h-24 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm">
                    {form.imageUrl ? (
                      <img
                        src={form.imageUrl}
                        alt={form.imageAlt || form.word}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <ImagePlus size={25} className="text-slate-300" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      KVKV
                    </p>
                    <p className="mt-1 truncate text-2xl font-black text-slate-900">
                      {form.word || "batu"}
                    </p>
                    <p className="mt-1 text-sm font-black text-violet-600">
                      {(form.syllable1 || "ba") + " + " + (form.syllable2 || "tu")}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void saveQuestion()}
                disabled={saving || uploading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                {form.id ? "Update Soalan" : "Simpan Soalan"}
              </button>
            </div>
          </section>

          {/* QUESTION LIBRARY */}
          <section className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-600">
                  KVKV Question Library
                </p>
                <h2 className="mt-1 text-2xl font-black">30 Soalan</h2>
              </div>

              <button
                type="button"
                onClick={() => void loadQuestions()}
                className="inline-flex h-10 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 xl:self-auto"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px]">
              <label className="relative block">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari batu, buku, baju..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </label>

              <label className="relative block">
                <select
                  value={activeFilter}
                  onChange={(event) =>
                    setActiveFilter(
                      event.target.value as "all" | "active" | "inactive"
                    )
                  }
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-black text-slate-600 outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </label>
            </div>

            {loading ? (
              <div className="grid min-h-[420px] place-items-center">
                <div className="text-center">
                  <Loader2
                    size={34}
                    className="mx-auto animate-spin text-violet-600"
                  />
                  <p className="mt-3 text-sm font-black text-slate-500">
                    Loading questions...
                  </p>
                </div>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <ImagePlus size={34} className="mx-auto text-slate-300" />
                <p className="mt-3 font-black text-slate-700">
                  Tiada soalan dijumpai
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredQuestions.map((item) => (
                  <QuestionCard
                    key={item.id}
                    item={item}
                    deleting={deletingId === item.id}
                    onEdit={() => editQuestion(item)}
                    onToggle={() => void toggleQuestion(item)}
                    onDelete={() => void deleteQuestion(item)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <style jsx global>{`
        .admin-input {
          height: 48px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 0 14px;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          outline: none;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease,
            background 150ms ease;
        }

        .admin-input:focus {
          border-color: #c4b5fd;
          background: white;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }
      `}</style>
    </main>
  );
}

function MetricPill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-[100px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function QuestionCard({
  item,
  deleting,
  onEdit,
  onToggle,
  onDelete,
}: {
  item: WordQuestion;
  deleting: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className={`group flex h-full min-h-[430px] flex-col overflow-hidden rounded-[24px] border bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,23,42,0.09)] ${
        item.is_active
          ? "border-slate-200"
          : "border-slate-200 opacity-70"
      }`}
    >
      {/* IMAGE AREA */}
      <div className="relative flex h-[175px] shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-white to-cyan-50 px-5 py-4">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.image_alt || item.word}
            className="max-h-[145px] max-w-[88%] object-contain drop-shadow-[0_8px_16px_rgba(15,23,42,0.10)]"
            draggable={false}
          />
        ) : (
          <div className="text-center">
            <ImagePlus
              size={30}
              className="mx-auto text-slate-300"
            />

            <p className="mt-2 text-[10px] font-black text-slate-400">
              Belum Upload Gambar
            </p>
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full border border-violet-100 bg-white/95 px-2.5 py-1 text-[9px] font-black text-violet-600 shadow-sm">
          #{item.display_order}
        </span>

        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-black ${
            item.is_active
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          {item.is_active ? "ACTIVE" : "HIDDEN"}
        </span>
      </div>

      {/* CONTENT AREA */}
      <div className="flex flex-1 flex-col border-t border-slate-100 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[28px] leading-none text-slate-900">
              {item.word}
            </h3>

            <p className="mt-2 text-lg text-violet-600">
              {item.syllable_1} + {item.syllable_2}
            </p>
          </div>

          <span className="shrink-0 rounded-xl bg-cyan-50 px-2.5 py-1.5 text-[10px] font-black text-cyan-700">
            KVKV
          </span>
        </div>

        <div className="mt-4">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
            Huruf Rawak
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {(item.letter_pool || []).map((letter, index) => (
              <span
                key={`${item.id}-${letter}-${index}`}
                className="grid h-10 min-w-10 place-items-center rounded-xl border border-violet-100 bg-violet-50 px-3 text-lg text-violet-700"
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* ACTIONS stay pinned to bottom */}
        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-violet-50 text-xs font-black text-violet-700 transition hover:bg-violet-100"
          >
            <Pencil size={14} />
            Edit
          </button>

          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-100 text-xs font-black text-slate-600 transition hover:bg-slate-200"
          >
            <Eye size={14} />
            {item.is_active ? "Hide" : "Show"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-red-50 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={14} />
            )}

            Delete
          </button>
        </div>
      </div>
    </article>
  );
}