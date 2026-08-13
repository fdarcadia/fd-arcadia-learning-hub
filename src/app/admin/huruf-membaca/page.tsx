"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  CirclePlus,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  Gamepad2,
  ImageIcon,
  Layers3,
  ListFilter,
  Loader2,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Volume2,
  X,
} from "lucide-react";

import { PortalShell } from "@/components/PortalShell";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

type ReadingLevel =
  | "KV"
  | "KVKV"
  | "KVK"
  | "KV+KVK"
  | "KVK+KV"
  | "KVK+KVK"
  | "KV+KV+KV"
  | "KV+KV+KVK"
  | "KVK+KV+KV"
  | "Diftong"
  | "Vokal Berganding"
  | "Digraf";

type GameItem = {
  slug: string;
  title: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
};

type ReadingActivity = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  game_type: string | null;
  difficulty: string | null;
  is_active: boolean | null;
  display_order: number | null;
};

type ReadingQuestion = {
  id: string;
  activity_id: string;
  title: string;
  question_type: string;
  instruction: string | null;
  word: string | null;
  syllable1: string | null;
  syllable2: string | null;
  syllable3: string | null;
  reading_level: ReadingLevel | null;
  letter: string | null;
  answer: string | null;
  options: string[];
  image_url: string | null;
  audio_url: string | null;
  difficulty: string | null;
  is_active: boolean;
  display_order: number;
  created_at?: string | null;
};

type QuestionForm = {
  id: string | null;
  activity_id: string;
  title: string;
  question_type: string;
  instruction: string;
  word: string;
  syllable1: string;
  syllable2: string;
  syllable3: string;
  reading_level: ReadingLevel;
  answer: string;
  image_url: string;
  audio_url: string;
  difficulty: string;
  is_active: boolean;
  display_order: number;
};

const READING_LEVELS: { id: ReadingLevel; label: string }[] = [
  { id: "KV", label: "KV" },
  { id: "KVKV", label: "KVKV" },
  { id: "KVK", label: "KVK" },
  { id: "KV+KVK", label: "KV + KVK" },
  { id: "KVK+KV", label: "KVK + KV" },
  { id: "KVK+KVK", label: "KVK + KVK" },
  { id: "KV+KV+KV", label: "KV + KV + KV" },
  { id: "KV+KV+KVK", label: "KV + KV + KVK" },
  { id: "KVK+KV+KV", label: "KVK + KV + KV" },
  { id: "Diftong", label: "Diftong" },
  { id: "Vokal Berganding", label: "Vokal Berganding" },
  { id: "Digraf", label: "Digraf" },
];

const GAMES: GameItem[] = [
  {
    slug: "baca-perkataan",
    title: "Baca Perkataan",
    description: "Gerakan jari, suku kata dan bacaan perkataan.",
    icon: BookOpenCheck,
    enabled: true,
  },
  {
    slug: "teka-gambar",
    title: "Teka Gambar",
    description: "Pilih perkataan berdasarkan gambar.",
    icon: ImageIcon,
    enabled: false,
  },
  {
    slug: "abc-order",
    title: "Susun ABC",
    description: "Susun huruf mengikut turutan.",
    icon: Layers3,
    enabled: false,
  },
  {
    slug: "vokal-konsonan",
    title: "Vokal & Konsonan",
    description: "Asingkan huruf kepada kumpulan yang betul.",
    icon: ListFilter,
    enabled: false,
  },
  {
    slug: "bunyi-huruf",
    title: "Padankan Bunyi Huruf",
    description: "Dengar bunyi dan pilih huruf.",
    icon: Volume2,
    enabled: false,
  },
  {
    slug: "huruf-besar-kecil",
    title: "Huruf Besar & Kecil",
    description: "Padankan uppercase dan lowercase.",
    icon: Copy,
    enabled: false,
  },
  {
    slug: "bina-perkataan",
    title: "Bina Perkataan",
    description: "Susun huruf / suku kata menjadi perkataan.",
    icon: Gamepad2,
    enabled: false,
  },
  {
    slug: "alphabet-tracing",
    title: "Alphabet Tracing",
    description: "Tracing huruf dengan animasi arah.",
    icon: Edit3,
    enabled: false,
  },
];

const EMPTY_FORM: QuestionForm = {
  id: null,
  activity_id: "",
  title: "",
  question_type: "reading_finger",
  instruction: "Tarik jari dari kiri ke kanan dan baca perkataan.",
  word: "",
  syllable1: "",
  syllable2: "",
  syllable3: "",
  reading_level: "KVKV",
  answer: "",
  image_url: "",
  audio_url: "",
  difficulty: "beginner",
  is_active: true,
  display_order: 1,
};

export default function AdminHurufMembacaPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <PortalShell role="admin">
            <AdminHurufMembacaContent />
          </PortalShell>
        ) : (
          <main className="min-h-screen bg-[#f6f7ff] p-8">
            <div className="mx-auto max-w-3xl rounded-[28px] border border-red-100 bg-white p-8 shadow-sm">
              <h1 className="text-3xl font-black text-red-600">Access denied</h1>
            </div>
          </main>
        )
      }
    </ProtectedPage>
  );
}

function AdminHurufMembacaContent() {
  const [activities, setActivities] = useState<ReadingActivity[]>([]);
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [selectedGame, setSelectedGame] = useState("baca-perkataan");
  const [selectedLevel, setSelectedLevel] = useState<ReadingLevel>("KVKV");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<QuestionForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<ReadingQuestion | null>(null);

  const selectedActivity = useMemo(
    () => activities.find((item) => item.slug === selectedGame) || null,
    [activities, selectedGame],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: activityData, error: activityError } = await supabase
      .from("reading_game_activities")
      .select(
        "id,title,slug,description,game_type,difficulty,is_active,display_order",
      )
      .order("display_order", { ascending: true });

    if (activityError) {
      setError(activityError.message);
      setLoading(false);
      return;
    }

    const nextActivities = (activityData || []) as ReadingActivity[];
    setActivities(nextActivities);

    const bacaActivity = nextActivities.find(
      (item) => item.slug === "baca-perkataan",
    );

    if (!bacaActivity) {
      setQuestions([]);
      setError(
        'Activity "baca-perkataan" belum wujud dalam reading_game_activities.',
      );
      setLoading(false);
      return;
    }

    const { data: questionData, error: questionError } = await supabase
      .from("reading_game_questions")
      .select(
        `
          id,
          activity_id,
          title,
          question_type,
          instruction,
          word,
          syllable1,
          syllable2,
          syllable3,
          reading_level,
          letter,
          answer,
          options,
          image_url,
          audio_url,
          difficulty,
          is_active,
          display_order,
          created_at
        `,
      )
      .eq("activity_id", bacaActivity.id)
      .order("display_order", { ascending: true });

    if (questionError) {
      setQuestions([]);
      setError(
        `${questionError.message}. Jika error berkaitan reading_level / syllable3, run SQL migration yang diberi.`,
      );
      setLoading(false);
      return;
    }

    setQuestions(
      (questionData || []).map((item) => ({
        ...item,
        options: Array.isArray(item.options) ? item.options.map(String) : [],
      })) as ReadingQuestion[],
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredQuestions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesLevel = question.reading_level === selectedLevel;
      const matchesSearch =
        !keyword ||
        question.word?.toLowerCase().includes(keyword) ||
        question.title?.toLowerCase().includes(keyword) ||
        question.syllable1?.toLowerCase().includes(keyword) ||
        question.syllable2?.toLowerCase().includes(keyword) ||
        question.syllable3?.toLowerCase().includes(keyword);

      return matchesLevel && matchesSearch;
    });
  }, [questions, search, selectedLevel]);

  const levelCount = useMemo(() => {
    const result = new Map<ReadingLevel, number>();
    READING_LEVELS.forEach((level) => result.set(level.id, 0));

    questions.forEach((question) => {
      if (question.reading_level && result.has(question.reading_level)) {
        result.set(
          question.reading_level,
          (result.get(question.reading_level) || 0) + 1,
        );
      }
    });

    return result;
  }, [questions]);

  function openNewQuestion() {
    if (!selectedActivity) {
      setError('Activity "baca-perkataan" belum tersedia.');
      return;
    }

    const maxOrder = questions.reduce(
      (max, question) => Math.max(max, question.display_order || 0),
      0,
    );

    setForm({
      ...EMPTY_FORM,
      activity_id: selectedActivity.id,
      reading_level: selectedLevel,
      display_order: maxOrder + 1,
    });
    setEditorOpen(true);
    setError("");
    setSuccess("");
  }

  function openEditQuestion(question: ReadingQuestion) {
    setForm({
      id: question.id,
      activity_id: question.activity_id,
      title: question.title || "",
      question_type: question.question_type || "reading_finger",
      instruction:
        question.instruction ||
        "Tarik jari dari kiri ke kanan dan baca perkataan.",
      word: question.word || "",
      syllable1: question.syllable1 || "",
      syllable2: question.syllable2 || "",
      syllable3: question.syllable3 || "",
      reading_level: question.reading_level || "KVKV",
      answer: question.answer || question.word || "",
      image_url: question.image_url || "",
      audio_url: question.audio_url || "",
      difficulty: question.difficulty || "beginner",
      is_active: Boolean(question.is_active),
      display_order: question.display_order || 1,
    });
    setEditorOpen(true);
    setError("");
    setSuccess("");
  }

  async function saveQuestion() {
    if (!form.activity_id) {
      setError("Activity belum dipilih.");
      return;
    }

    if (!form.word.trim()) {
      setError("Masukkan perkataan.");
      return;
    }

    if (!form.syllable1.trim()) {
      setError("Masukkan Suku Kata 1.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      activity_id: form.activity_id,
      title: form.title.trim() || form.word.trim(),
      question_type: form.question_type,
      instruction: form.instruction.trim(),
      word: form.word.trim().toLowerCase(),
      syllable1: form.syllable1.trim().toLowerCase(),
      syllable2: form.syllable2.trim().toLowerCase() || null,
      syllable3: form.syllable3.trim().toLowerCase() || null,
      reading_level: form.reading_level,
      answer: form.answer.trim().toLowerCase() || form.word.trim().toLowerCase(),
      image_url: form.image_url.trim() || null,
      audio_url: form.audio_url.trim() || null,
      difficulty: form.difficulty,
      is_active: form.is_active,
      display_order: Number(form.display_order) || 1,
      options: [],
    };

    if (form.id) {
      const { error: updateError } = await supabase
        .from("reading_game_questions")
        .update(payload)
        .eq("id", form.id);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      setSuccess("Soalan berjaya dikemaskini.");
    } else {
      const { error: insertError } = await supabase
        .from("reading_game_questions")
        .insert(payload);

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }

      setSuccess("Soalan baru berjaya disimpan.");
    }

    setEditorOpen(false);
    setSaving(false);
    await loadData();
  }

  async function toggleQuestion(question: ReadingQuestion) {
    setError("");
    const nextValue = !question.is_active;

    const { error: updateError } = await supabase
      .from("reading_game_questions")
      .update({ is_active: nextValue })
      .eq("id", question.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setQuestions((current) =>
      current.map((item) =>
        item.id === question.id ? { ...item, is_active: nextValue } : item,
      ),
    );
  }

  async function deleteQuestion() {
    if (!deleteTarget) return;

    setSaving(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("reading_game_questions")
      .delete()
      .eq("id", deleteTarget.id);

    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
    }

    setQuestions((current) =>
      current.filter((item) => item.id !== deleteTarget.id),
    );
    setDeleteTarget(null);
    setSaving(false);
    setSuccess("Soalan telah dipadam.");
  }

  async function moveQuestion(question: ReadingQuestion, direction: "up" | "down") {
    const sameLevel = questions
      .filter((item) => item.reading_level === question.reading_level)
      .sort((a, b) => a.display_order - b.display_order);

    const currentPosition = sameLevel.findIndex((item) => item.id === question.id);
    const targetPosition =
      direction === "up" ? currentPosition - 1 : currentPosition + 1;

    if (targetPosition < 0 || targetPosition >= sameLevel.length) return;

    const target = sameLevel[targetPosition];

    const { error: firstError } = await supabase
      .from("reading_game_questions")
      .update({ display_order: target.display_order })
      .eq("id", question.id);

    if (firstError) {
      setError(firstError.message);
      return;
    }

    const { error: secondError } = await supabase
      .from("reading_game_questions")
      .update({ display_order: question.display_order })
      .eq("id", target.id);

    if (secondError) {
      setError(secondError.message);
      return;
    }

    await loadData();
  }

  return (
    <main className="min-h-screen bg-[#f5f6fb] px-4 py-5 text-[#111936] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#101735] via-[#191f54] to-[#3d347e] p-6 text-white shadow-[0_24px_70px_rgba(20,27,73,0.22)] md:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-violet-200">
                <Sparkles size={15} />
                FD Arcadia Control Centre
              </div>

              <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                Huruf & Membaca
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                Urus permainan literasi, tahap membaca dan question library
                untuk parent portal.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black backdrop-blur"
              >
                <RefreshCcw size={17} />
                Refresh
              </button>

              <button
                type="button"
                onClick={openNewQuestion}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-violet-700 shadow-lg"
              >
                <Plus size={18} />
                Add Question
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
          {/* GAME SIDEBAR */}
          <aside className="h-fit overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm xl:sticky xl:top-5">
            <div className="border-b border-slate-100 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">
                Pilihan Game
              </p>
              <h2 className="mt-1 text-2xl font-black">Game Library</h2>
            </div>

            <div className="max-h-[650px] space-y-1 overflow-y-auto p-3">
              {GAMES.map((game) => {
                const Icon = game.icon;
                const active = selectedGame === game.slug;

                return (
                  <button
                    key={game.slug}
                    type="button"
                    onClick={() => game.enabled && setSelectedGame(game.slug)}
                    className={`w-full rounded-2xl p-3 text-left transition ${
                      active
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-100"
                        : game.enabled
                          ? "text-slate-700 hover:bg-violet-50"
                          : "cursor-not-allowed text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                          active
                            ? "bg-white/15"
                            : game.enabled
                              ? "bg-violet-50 text-violet-600"
                              : "bg-slate-100"
                        }`}
                      >
                        <Icon size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-black">
                            {game.title}
                          </p>

                          {game.enabled ? (
                            <ChevronRight size={15} />
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black uppercase text-slate-400">
                              Soon
                            </span>
                          )}
                        </div>

                        <p
                          className={`mt-1 line-clamp-1 text-[10px] ${
                            active ? "text-violet-100" : "text-slate-400"
                          }`}
                        >
                          {game.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* MAIN */}
          <section className="min-w-0">
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">
                      Baca Perkataan
                    </p>
                    <h2 className="mt-1 text-3xl font-black">
                      Question Library
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Pilih tahap, kemudian tambah atau edit perkataan.
                    </p>
                  </div>

                  <div className="relative w-full lg:w-[320px]">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari perkataan..."
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50"
                    />
                  </div>
                </div>
              </div>

              {/* LEVEL SELECTOR */}
              <div className="border-b border-slate-100 bg-[#fafaff] p-4 sm:p-5">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {READING_LEVELS.map((level) => {
                    const active = selectedLevel === level.id;
                    const count = levelCount.get(level.id) || 0;

                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setSelectedLevel(level.id)}
                        className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${
                          active
                            ? "border-violet-600 bg-violet-600 text-white shadow-md"
                            : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="whitespace-nowrap text-xs font-black">
                            {level.label}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                              active
                                ? "bg-white/15 text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LIST */}
              {loading ? (
                <div className="flex min-h-[360px] items-center justify-center">
                  <div className="text-center">
                    <Loader2
                      size={30}
                      className="mx-auto animate-spin text-violet-600"
                    />
                    <p className="mt-3 text-sm font-bold text-slate-400">
                      Loading questions...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5">
                  <div className="overflow-hidden rounded-[22px] border border-slate-200">
                    <div className="grid grid-cols-[48px_minmax(0,1.2fr)_minmax(120px,.7fr)_90px_72px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                      <span>#</span>
                      <span>Perkataan</span>
                      <span>Suku Kata</span>
                      <span>Status</span>
                      <span className="text-right">Action</span>
                    </div>

                    {filteredQuestions.length === 0 ? (
                      <div className="p-10 text-center">
                        <CirclePlus
                          size={34}
                          className="mx-auto text-violet-200"
                        />
                        <h3 className="mt-3 text-lg font-black text-slate-700">
                          Belum ada soalan {selectedLevel}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Tambah perkataan pertama untuk tahap ini.
                        </p>
                        <button
                          type="button"
                          onClick={openNewQuestion}
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white"
                        >
                          <Plus size={16} />
                          Add Question
                        </button>
                      </div>
                    ) : (
                      filteredQuestions.map((question, index) => (
                        <QuestionRow
                          key={question.id}
                          question={question}
                          index={index}
                          onEdit={() => openEditQuestion(question)}
                          onToggle={() => toggleQuestion(question)}
                          onDelete={() => setDeleteTarget(question)}
                          onUp={() => moveQuestion(question, "up")}
                          onDown={() => moveQuestion(question, "down")}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {editorOpen ? (
        <QuestionEditor
          form={form}
          setForm={setForm}
          saving={saving}
          onClose={() => setEditorOpen(false)}
          onSave={saveQuestion}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteDialog
          question={deleteTarget}
          saving={saving}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={deleteQuestion}
        />
      ) : null}
    </main>
  );
}

function QuestionRow({
  question,
  index,
  onEdit,
  onToggle,
  onDelete,
  onUp,
  onDown,
}: {
  question: ReadingQuestion;
  index: number;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onUp: () => void;
  onDown: () => void;
}) {
  const syllables = [
    question.syllable1,
    question.syllable2,
    question.syllable3,
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-[48px_minmax(0,1.2fr)_minmax(120px,.7fr)_90px_72px] gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-[#fcfcff]">
      <div className="flex items-center text-xs font-black text-slate-300">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-base font-black text-[#111936]">
            {question.word || question.title}
          </p>
          <span className="rounded-full bg-violet-50 px-2 py-1 text-[8px] font-black text-violet-600">
            {question.reading_level}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[10px] text-slate-400">
          {question.title || "Baca perkataan"}
        </p>
      </div>

      <div className="flex items-center">
        <span className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">
          {syllables.join(" + ") || "-"}
        </span>
      </div>

      <div className="flex items-center">
        <button
          type="button"
          onClick={onToggle}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-black ${
            question.is_active
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {question.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
          {question.is_active ? "Active" : "Hidden"}
        </button>
      </div>

      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={onUp}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-violet-600"
          title="Move up"
        >
          <ArrowUp size={14} />
        </button>

        <button
          type="button"
          onClick={onDown}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-violet-600"
          title="Move down"
        >
          <ArrowDown size={14} />
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="grid h-8 w-8 place-items-center rounded-lg text-blue-500 hover:bg-blue-50"
          title="Edit"
        >
          <Edit3 size={14} />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function QuestionEditor({
  form,
  setForm,
  saving,
  onClose,
  onSave,
}: {
  form: QuestionForm;
  setForm: React.Dispatch<React.SetStateAction<QuestionForm>>;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[#0b1026]/55 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="max-h-[95vh] w-full max-w-[760px] overflow-y-auto rounded-t-[30px] bg-white shadow-2xl sm:rounded-[30px]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">
              Baca Perkataan
            </p>
            <h2 className="mt-1 text-2xl font-black">
              {form.id ? "Edit Question" : "Add Question"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tahap Membaca">
              <select
                value={form.reading_level}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reading_level: event.target.value as ReadingLevel,
                  }))
                }
                className={inputClass}
              >
                {READING_LEVELS.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Display Order">
              <input
                type="number"
                min={1}
                value={form.display_order}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    display_order: Number(event.target.value) || 1,
                  }))
                }
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Perkataan *">
              <input
                value={form.word}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    word: event.target.value,
                    answer: current.answer || event.target.value,
                    title: current.title || event.target.value,
                  }))
                }
                placeholder="Contoh: baju"
                className={inputClass}
              />
            </Field>

            <Field label="Tajuk">
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Contoh: Baju"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Suku Kata 1 *">
              <input
                value={form.syllable1}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    syllable1: event.target.value,
                  }))
                }
                placeholder="ba"
                className={inputClass}
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
                placeholder="ju"
                className={inputClass}
              />
            </Field>

            <Field label="Suku Kata 3">
              <input
                value={form.syllable3}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    syllable3: event.target.value,
                  }))
                }
                placeholder="kan"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Arahan">
            <textarea
              rows={3}
              value={form.instruction}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  instruction: event.target.value,
                }))
              }
              className={`${inputClass} min-h-[96px] py-3`}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Audio URL">
              <div className="relative">
                <Volume2
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400"
                />
                <input
                  value={form.audio_url}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      audio_url: event.target.value,
                    }))
                  }
                  placeholder="/audio/reading/baju.mp3"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </Field>

            <Field label="Image URL (optional)">
              <div className="relative">
                <ImageIcon
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400"
                />
                <input
                  value={form.image_url}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      image_url: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className={`${inputClass} pl-11`}
                />
              </div>
            </Field>
          </div>

          <div className="rounded-[22px] border border-violet-100 bg-violet-50/70 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-800">Status</p>
                <p className="mt-1 text-xs text-slate-500">
                  Hidden tidak akan dipaparkan pada parent game.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    is_active: !current.is_active,
                  }))
                }
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black ${
                  form.is_active
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {form.is_active ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <EyeOff size={16} />
                )}
                {form.is_active ? "Active" : "Hidden"}
              </button>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-500"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={onSave}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-black text-white shadow-lg disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {form.id ? "Update Question" : "Save Question"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteDialog({
  question,
  saving,
  onCancel,
  onConfirm,
}: {
  question: ReadingQuestion;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#0b1026]/55 p-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
          <Trash2 size={24} />
        </div>

        <h2 className="mt-4 text-center text-2xl font-black">Delete Question?</h2>

        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          Perkataan <span className="font-black text-slate-800">{question.word}</span>{" "}
          akan dipadam secara kekal.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-500"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={onConfirm}
            className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
          >
            {saving ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
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
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50";