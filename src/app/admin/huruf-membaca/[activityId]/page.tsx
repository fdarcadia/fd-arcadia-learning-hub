"use client";

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  FileAudio,
  ImageIcon,
  Layers3,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Volume2,
  X,
} from "lucide-react";

import { PortalShell } from "@/components/PortalShell";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

/* =========================================================
   TYPES
========================================================= */

type QuestionType =
  | "reading_finger"
  | "trace_letter"
  | "build_word"
  | "picture_guess"
  | "abc_order"
  | "vowel_consonant"
  | "letter_sound"
  | "uppercase_lowercase"
  | "syllable_builder"
  | "memory_match";

type Difficulty = "beginner" | "intermediate" | "advanced";

type ReadingActivity = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  game_type: QuestionType;
  difficulty: Difficulty;
  is_active: boolean;
  display_order: number;
};

type ReadingQuestion = {
  id: string;
  activity_id: string;

  title: string;
  question_type: QuestionType;

  instruction: string | null;

  word: string | null;

  syllable1: string | null;
  syllable2: string | null;

  letter: string | null;

  answer: string | null;

  options: string[];

  image_url: string | null;
  audio_url: string | null;

  difficulty: Difficulty;

  is_active: boolean;

  display_order: number;

  created_at: string;
  updated_at: string;
};

type QuestionForm = {
  title: string;
  questionType: QuestionType;

  instruction: string;

  word: string;

  syllable1: string;
  syllable2: string;

  letter: string;

  answer: string;

  optionsText: string;

  imageUrl: string;
  audioUrl: string;

  difficulty: Difficulty;

  isActive: boolean;
};

/* =========================================================
   OPTIONS
========================================================= */

const questionTypes: {
  value: QuestionType;
  label: string;
  description: string;
}[] = [
  {
    value: "reading_finger",
    label: "Baca + Gerakan Jari",
    description:
      "Tarik jari, pecahkan suku kata dan dengar bacaan.",
  },
  {
    value: "trace_letter",
    label: "Trace Huruf",
    description:
      "Trace huruf besar atau kecil mengikut bentuk huruf.",
  },
  {
    value: "build_word",
    label: "Bina Perkataan",
    description:
      "Susun huruf untuk menghasilkan perkataan yang betul.",
  },
  {
    value: "picture_guess",
    label: "Teka Gambar",
    description:
      "Lihat gambar dan pilih perkataan yang betul.",
  },
  {
    value: "abc_order",
    label: "Susunan ABC",
    description:
      "Susun huruf mengikut turutan alfabet.",
  },
  {
    value: "vowel_consonant",
    label: "Vokal / Konsonan",
    description:
      "Kenal pasti dan asingkan huruf vokal serta konsonan.",
  },
  {
    value: "letter_sound",
    label: "Bunyi Huruf",
    description:
      "Dengar bunyi fonik dan padankan dengan huruf.",
  },
  {
    value: "uppercase_lowercase",
    label: "Huruf Besar & Kecil",
    description:
      "Padankan huruf besar dengan huruf kecil.",
  },
  {
    value: "syllable_builder",
    label: "Bina Suku Kata",
    description:
      "Gabungkan bahagian untuk menghasilkan suku kata.",
  },
  {
    value: "memory_match",
    label: "Memory Match",
    description:
      "Padankan pasangan huruf, gambar atau perkataan.",
  },
];

function createEmptyForm(
  type: QuestionType = "reading_finger"
): QuestionForm {
  return {
    title: "",
    questionType: type,

    instruction:
      type === "reading_finger"
        ? "Tarik jari dari kiri ke kanan dan baca perkataan."
        : "",

    word: "",

    syllable1: "",
    syllable2: "",

    letter: "",

    answer: "",

    optionsText: "",

    imageUrl: "",
    audioUrl: "",

    difficulty: "beginner",

    isActive: true,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminReadingQuestionsPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <PortalShell role="admin">
            <QuestionManager />
          </PortalShell>
        ) : (
          <main className="min-h-screen bg-[#f7f8fc] p-8">
            <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-100 bg-white p-8 shadow-sm">
              <h1 className="text-3xl font-black text-red-600">
                Access denied
              </h1>

              <p className="mt-2 font-semibold text-slate-500">
                Admin access only.
              </p>
            </div>
          </main>
        )
      }
    </ProtectedPage>
  );
}

/* =========================================================
   QUESTION MANAGER
========================================================= */

function QuestionManager() {
  const params = useParams();

  const activityId = String(params.activityId || "");

  const [activity, setActivity] =
    useState<ReadingActivity | null>(null);

  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [filterType, setFilterType] = useState<"all" | QuestionType>(
    "all"
  );

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<QuestionForm>(
    createEmptyForm()
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = useCallback(async () => {
    if (!activityId) return;

    try {
      setLoading(true);
      setError("");

      const {
        data: activityData,
        error: activityError,
      } = await supabase
        .from("reading_game_activities")
        .select(
          "id,title,slug,description,game_type,difficulty,is_active,display_order"
        )
        .eq("id", activityId)
        .single();

      if (activityError) {
        throw activityError;
      }

      const loadedActivity = activityData as ReadingActivity;

      setActivity(loadedActivity);

      const {
        data: questionData,
        error: questionError,
      } = await supabase
        .from("reading_game_questions")
        .select("*")
        .eq("activity_id", activityId)
        .order("display_order", {
          ascending: true,
        });

      if (questionError) {
        throw questionError;
      }

      const cleanedQuestions = (questionData || []).map((item) => ({
        ...item,

        options: Array.isArray(item.options)
          ? item.options.map(String)
          : [],
      })) as ReadingQuestion[];

      setQuestions(cleanedQuestions);
    } catch (loadError) {
      console.error("Load questions error:", loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load activity."
      );
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const sortedQuestions = useMemo(() => {
    return [...questions].sort(
      (a, b) => a.display_order - b.display_order
    );
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return sortedQuestions.filter((question) => {
      const matchesSearch =
        !keyword ||
        question.title.toLowerCase().includes(keyword) ||
        question.word?.toLowerCase().includes(keyword) ||
        question.letter?.toLowerCase().includes(keyword) ||
        question.answer?.toLowerCase().includes(keyword);

      const matchesType =
        filterType === "all" ||
        question.question_type === filterType;

      return matchesSearch && matchesType;
    });
  }, [sortedQuestions, search, filterType]);

  const activeCount = questions.filter(
    (question) => question.is_active
  ).length;

  const draftCount = questions.length - activeCount;

  /* =========================================================
     FORM HELPERS
  ========================================================= */

  function updateForm<K extends keyof QuestionForm>(
    key: K,
    value: QuestionForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetForm() {
    setEditingId(null);

    setForm(
      createEmptyForm(
        activity?.game_type || "reading_finger"
      )
    );

    setShowForm(false);
  }

  function openNewQuestion() {
    setEditingId(null);

    setForm(
      createEmptyForm(
        activity?.game_type || "reading_finger"
      )
    );

    setShowForm(true);

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     CREATE / UPDATE
  ========================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!activityId) return;

    if (!form.title.trim()) {
      setError("Question title is required.");
      return;
    }

    const options = form.optionsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      setSaving(true);

      setError("");
      setSuccess("");

      const payload = {
        activity_id: activityId,

        title: form.title.trim(),

        question_type: form.questionType,

        instruction: form.instruction.trim() || null,

        word: form.word.trim() || null,

        syllable1: form.syllable1.trim() || null,
        syllable2: form.syllable2.trim() || null,

        letter: form.letter.trim() || null,

        answer: form.answer.trim() || null,

        options,

        image_url: form.imageUrl.trim() || null,

        audio_url: form.audioUrl.trim() || null,

        difficulty: form.difficulty,

        is_active: form.isActive,

        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("reading_game_questions")
          .update(payload)
          .eq("id", editingId)
          .eq("activity_id", activityId);

        if (updateError) {
          throw updateError;
        }

        setSuccess("Question updated successfully.");
      } else {
        const nextOrder =
          questions.length === 0
            ? 1
            : Math.max(
                ...questions.map(
                  (question) => question.display_order
                )
              ) + 1;

        const { error: insertError } = await supabase
          .from("reading_game_questions")
          .insert({
            ...payload,
            display_order: nextOrder,
          });

        if (insertError) {
          throw insertError;
        }

        setSuccess("New question added.");
      }

      resetForm();

      await loadData();
    } catch (submitError) {
      console.error("Save question error:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save question."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     EDIT
  ========================================================= */

  function editQuestion(question: ReadingQuestion) {
    setEditingId(question.id);

    setForm({
      title: question.title,

      questionType: question.question_type,

      instruction: question.instruction || "",

      word: question.word || "",

      syllable1: question.syllable1 || "",
      syllable2: question.syllable2 || "",

      letter: question.letter || "",

      answer: question.answer || "",

      optionsText: question.options.join(", "),

      imageUrl: question.image_url || "",

      audioUrl: question.audio_url || "",

      difficulty: question.difficulty,

      isActive: question.is_active,
    });

    setShowForm(true);

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     TOGGLE
  ========================================================= */

  async function toggleQuestion(question: ReadingQuestion) {
    try {
      setError("");
      setSuccess("");

      const { error: toggleError } = await supabase
        .from("reading_game_questions")
        .update({
          is_active: !question.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", question.id);

      if (toggleError) {
        throw toggleError;
      }

      setQuestions((current) =>
        current.map((item) =>
          item.id === question.id
            ? {
                ...item,
                is_active: !question.is_active,
              }
            : item
        )
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Failed to update question status."
      );
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async function deleteQuestion(question: ReadingQuestion) {
    const confirmed = window.confirm(
      `Delete "${question.title}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const { error: deleteError } = await supabase
        .from("reading_game_questions")
        .delete()
        .eq("id", question.id);

      if (deleteError) {
        throw deleteError;
      }

      setSuccess("Question deleted.");

      await loadData();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete question."
      );
    }
  }

  /* =========================================================
     DUPLICATE
  ========================================================= */

  async function duplicateQuestion(question: ReadingQuestion) {
    try {
      setError("");
      setSuccess("");

      const nextOrder =
        questions.length === 0
          ? 1
          : Math.max(
              ...questions.map(
                (item) => item.display_order
              )
            ) + 1;

      const { error: duplicateError } = await supabase
        .from("reading_game_questions")
        .insert({
          activity_id: question.activity_id,

          title: `${question.title} Copy`,

          question_type: question.question_type,

          instruction: question.instruction,

          word: question.word,

          syllable1: question.syllable1,
          syllable2: question.syllable2,

          letter: question.letter,

          answer: question.answer,

          options: question.options,

          image_url: question.image_url,

          audio_url: question.audio_url,

          difficulty: question.difficulty,

          is_active: false,

          display_order: nextOrder,
        });

      if (duplicateError) {
        throw duplicateError;
      }

      setSuccess("Question duplicated as draft.");

      await loadData();
    } catch (duplicateError) {
      setError(
        duplicateError instanceof Error
          ? duplicateError.message
          : "Failed to duplicate question."
      );
    }
  }

  /* =========================================================
     REORDER
  ========================================================= */

  async function moveQuestion(
    question: ReadingQuestion,
    direction: "up" | "down"
  ) {
    const ordered = [...sortedQuestions];

    const currentIndex = ordered.findIndex(
      (item) => item.id === question.id
    );

    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= ordered.length
    ) {
      return;
    }

    const currentItem = ordered[currentIndex];
    const targetItem = ordered[targetIndex];

    try {
      setError("");

      const { error: currentError } = await supabase
        .from("reading_game_questions")
        .update({
          display_order: targetItem.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentItem.id);

      if (currentError) {
        throw currentError;
      }

      const { error: targetError } = await supabase
        .from("reading_game_questions")
        .update({
          display_order: currentItem.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetItem.id);

      if (targetError) {
        throw targetError;
      }

      await loadData();
    } catch (moveError) {
      setError(
        moveError instanceof Error
          ? moveError.message
          : "Failed to reorder questions."
      );
    }
  }

  /* =========================================================
     AUDIO PREVIEW
  ========================================================= */

  function playAudio(url: string | null) {
    if (!url) return;

    try {
      const audio = new Audio(url);

      audio.play().catch(() => {
        setError("Audio could not be played.");
      });
    } catch {
      setError("Audio could not be played.");
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] px-4 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2
              size={32}
              className="mx-auto animate-spin text-indigo-600"
            />

            <p className="mt-3 text-sm font-black text-slate-500">
              Loading question library...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     PAGE UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        {/* HEADER */}

        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/admin/huruf-membaca"
              className="inline-flex items-center gap-2 text-xs font-black text-indigo-600"
            >
              <ArrowLeft size={15} />
              Huruf & Membaca
            </Link>

            <p className="mt-5 text-[9px] font-black uppercase tracking-[0.22em] text-indigo-500">
              FD Arcadia · Question Manager
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
              {activity?.title || "Manage Questions"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-400">
              {activity?.description ||
                "Create and manage learning content for this activity."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm"
            >
              <RefreshCcw size={15} />
              Refresh
            </button>

            {activity ? (
              <Link
                href={`/huruf-membaca/${activity.slug}`}
                target="_blank"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-indigo-100 bg-white px-4 text-xs font-black text-indigo-700 shadow-sm"
              >
                <Eye size={16} />
                Preview Game
              </Link>
            ) : null}

            <button
              type="button"
              onClick={openNewQuestion}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-xs font-black text-white shadow-lg shadow-indigo-100"
            >
              <Plus size={17} />
              New Question
            </button>
          </div>
        </header>

        {/* HERO */}

        <section className="relative mt-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#10162f] via-[#25275f] to-[#171c42] px-6 py-6 text-white shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-pink-500/10 blur-3xl" />

          <div className="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-yellow-300">
                <Layers3 size={25} />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">
                  Content Builder
                </p>

                <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                  {activity?.title || "Reading Activity"}
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  <HeroBadge>
                    {getQuestionTypeLabel(
                      activity?.game_type || "reading_finger"
                    )}
                  </HeroBadge>

                  <HeroBadge>
                    {activity?.difficulty || "beginner"}
                  </HeroBadge>

                  <HeroBadge>
                    {activity?.is_active ? "Active" : "Draft"}
                  </HeroBadge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.06]">
              <HeroStat
                value={String(questions.length)}
                label="Questions"
              />

              <HeroStat
                value={String(activeCount)}
                label="Active"
              />

              <HeroStat
                value={String(draftCount)}
                label="Draft"
              />
            </div>
          </div>
        </section>

        {/* MESSAGES */}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={17} />
            {success}
          </div>
        ) : null}

        {/* QUESTION BUILDER */}

        {showForm ? (
          <section className="mt-5 overflow-hidden rounded-[26px] border border-indigo-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 px-5 py-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
                  Question Builder
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {editingId
                    ? "Edit Question"
                    : "Create New Question"}
                </h2>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 p-5 lg:grid-cols-2"
            >
              {/* BASIC */}

              <div className="lg:col-span-2">
                <SectionTitle
                  icon={<Sparkles size={16} />}
                  title="Basic Information"
                />
              </div>

              <Field label="Question Title">
                <input
                  value={form.title}
                  onChange={(event) =>
                    updateForm("title", event.target.value)
                  }
                  required
                  placeholder="Contoh: Baju"
                  className={inputClass}
                />
              </Field>

              <Field label="Game Type">
                <select
                  value={form.questionType}
                  onChange={(event) =>
                    updateForm(
                      "questionType",
                      event.target.value as QuestionType
                    )
                  }
                  className={inputClass}
                >
                  {questionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                  <p className="text-xs font-black text-violet-700">
                    {getQuestionTypeLabel(form.questionType)}
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    {
                      questionTypes.find(
                        (item) => item.value === form.questionType
                      )?.description
                    }
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <Field label="Instruction">
                  <input
                    value={form.instruction}
                    onChange={(event) =>
                      updateForm(
                        "instruction",
                        event.target.value
                      )
                    }
                    placeholder="Arahan yang akan dilihat oleh kanak-kanak..."
                    className={inputClass}
                  />
                </Field>
              </div>

              {/* DYNAMIC FIELDS */}

              {form.questionType === "reading_finger" ? (
                <>
                  <div className="mt-2 lg:col-span-2">
                    <SectionTitle
                      icon={<BookOpen size={16} />}
                      title="Reading Content"
                    />
                  </div>

                  <Field label="Perkataan">
                    <input
                      value={form.word}
                      onChange={(event) =>
                        updateForm("word", event.target.value)
                      }
                      placeholder="baju"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Jawapan">
                    <input
                      value={form.answer}
                      onChange={(event) =>
                        updateForm("answer", event.target.value)
                      }
                      placeholder="baju"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Suku Kata 1">
                    <input
                      value={form.syllable1}
                      onChange={(event) =>
                        updateForm(
                          "syllable1",
                          event.target.value
                        )
                      }
                      placeholder="ba"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Suku Kata 2">
                    <input
                      value={form.syllable2}
                      onChange={(event) =>
                        updateForm(
                          "syllable2",
                          event.target.value
                        )
                      }
                      placeholder="ju"
                      className={inputClass}
                    />
                  </Field>
                </>
              ) : null}

              {form.questionType === "trace_letter" ? (
                <>
                  <Field label="Huruf">
                    <input
                      value={form.letter}
                      onChange={(event) =>
                        updateForm("letter", event.target.value)
                      }
                      placeholder="A"
                      maxLength={2}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Jawapan / Label">
                    <input
                      value={form.answer}
                      onChange={(event) =>
                        updateForm("answer", event.target.value)
                      }
                      placeholder="A"
                      className={inputClass}
                    />
                  </Field>
                </>
              ) : null}

              {form.questionType === "build_word" ||
              form.questionType === "picture_guess" ||
              form.questionType === "memory_match" ? (
                <>
                  <Field label="Perkataan / Jawapan">
                    <input
                      value={form.word}
                      onChange={(event) =>
                        updateForm("word", event.target.value)
                      }
                      placeholder="bola"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Correct Answer">
                    <input
                      value={form.answer}
                      onChange={(event) =>
                        updateForm("answer", event.target.value)
                      }
                      placeholder="bola"
                      className={inputClass}
                    />
                  </Field>
                </>
              ) : null}

              {form.questionType === "abc_order" ? (
                <>
                  <Field label="Huruf / Sequence">
                    <input
                      value={form.word}
                      onChange={(event) =>
                        updateForm("word", event.target.value)
                      }
                      placeholder="A, B, C, D"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Correct Order">
                    <input
                      value={form.answer}
                      onChange={(event) =>
                        updateForm("answer", event.target.value)
                      }
                      placeholder="A, B, C, D"
                      className={inputClass}
                    />
                  </Field>
                </>
              ) : null}

              {form.questionType === "vowel_consonant" ? (
                <>
                  <Field label="Huruf">
                    <input
                      value={form.letter}
                      onChange={(event) =>
                        updateForm("letter", event.target.value)
                      }
                      placeholder="A"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Kategori Jawapan">
                    <select
                      value={form.answer}
                      onChange={(event) =>
                        updateForm("answer", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">Pilih...</option>
                      <option value="vokal">Vokal</option>
                      <option value="konsonan">Konsonan</option>
                    </select>
                  </Field>
                </>
              ) : null}

              {form.questionType === "letter_sound" ? (
                <>
                  <Field label="Huruf">
                    <input
                      value={form.letter}
                      onChange={(event) =>
                        updateForm("letter", event.target.value)
                      }
                      placeholder="B"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Correct Answer">
                    <input
                      value={form.answer}
                      onChange={(event) =>
                        updateForm("answer", event.target.value)
                      }
                      placeholder="B"
                      className={inputClass}
                    />
                  </Field>
                </>
              ) : null}

              {form.questionType === "uppercase_lowercase" ? (
                <>
                  <Field label="Huruf Utama">
                    <input
                      value={form.letter}
                      onChange={(event) =>
                        updateForm("letter", event.target.value)
                      }
                      placeholder="A"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Pasangan Jawapan">
                    <input
                      value={form.answer}
                      onChange={(event) =>
                        updateForm("answer", event.target.value)
                      }
                      placeholder="a"
                      className={inputClass}
                    />
                  </Field>
                </>
              ) : null}

              {form.questionType === "syllable_builder" ? (
                <>
                  <Field label="Bahagian 1">
                    <input
                      value={form.syllable1}
                      onChange={(event) =>
                        updateForm(
                          "syllable1",
                          event.target.value
                        )
                      }
                      placeholder="b"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Bahagian 2">
                    <input
                      value={form.syllable2}
                      onChange={(event) =>
                        updateForm(
                          "syllable2",
                          event.target.value
                        )
                      }
                      placeholder="a"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Jawapan Suku Kata">
                    <input
                      value={form.answer}
                      onChange={(event) =>
                        updateForm("answer", event.target.value)
                      }
                      placeholder="ba"
                      className={inputClass}
                    />
                  </Field>
                </>
              ) : null}

              {/* OPTIONS */}

              {needsOptions(form.questionType) ? (
                <div className="lg:col-span-2">
                  <Field label="Pilihan Jawapan">
                    <input
                      value={form.optionsText}
                      onChange={(event) =>
                        updateForm(
                          "optionsText",
                          event.target.value
                        )
                      }
                      placeholder="bola, baju, buku, susu"
                      className={inputClass}
                    />

                    <p className="mt-2 text-[10px] font-semibold text-slate-400">
                      Pisahkan setiap pilihan dengan koma.
                    </p>
                  </Field>
                </div>
              ) : null}

              {/* MEDIA */}

              <div className="mt-2 lg:col-span-2">
                <SectionTitle
                  icon={<ImageIcon size={16} />}
                  title="Media"
                />
              </div>

              <Field label="Image URL">
                <div className="relative">
                  <ImageIcon
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={form.imageUrl}
                    onChange={(event) =>
                      updateForm(
                        "imageUrl",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </Field>

              <Field label="Audio URL">
                <div className="relative">
                  <FileAudio
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={form.audioUrl}
                    onChange={(event) =>
                      updateForm(
                        "audioUrl",
                        event.target.value
                      )
                    }
                    placeholder="/audio/reading/baju.mp3"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </Field>

              {/* SETTINGS */}

              <div className="mt-2 lg:col-span-2">
                <SectionTitle
                  icon={<Layers3 size={16} />}
                  title="Settings"
                />
              </div>

              <Field label="Difficulty">
                <select
                  value={form.difficulty}
                  onChange={(event) =>
                    updateForm(
                      "difficulty",
                      event.target.value as Difficulty
                    )
                  }
                  className={inputClass}
                >
                  <option value="beginner">
                    Beginner
                  </option>

                  <option value="intermediate">
                    Intermediate
                  </option>

                  <option value="advanced">
                    Advanced
                  </option>
                </select>
              </Field>

              <Field label="Status">
                <button
                  type="button"
                  onClick={() =>
                    updateForm(
                      "isActive",
                      !form.isActive
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                    form.isActive
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-black ${
                        form.isActive
                          ? "text-emerald-700"
                          : "text-slate-600"
                      }`}
                    >
                      {form.isActive
                        ? "Active"
                        : "Draft"}
                    </p>

                    <p className="mt-1 text-[10px] font-semibold text-slate-400">
                      Active questions boleh digunakan dalam game.
                    </p>
                  </div>

                  {form.isActive ? (
                    <ToggleRight
                      size={30}
                      className="text-emerald-500"
                    />
                  ) : (
                    <ToggleLeft
                      size={30}
                      className="text-slate-400"
                    />
                  )}
                </button>
              </Field>

              {/* BUTTONS */}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row lg:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-sm font-black text-white shadow-lg shadow-indigo-100 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Question"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="min-h-[48px] rounded-2xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {/* SEARCH */}

        <section className="mt-5 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search
                size={18}
                className="shrink-0 text-indigo-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search question, word or letter..."
                className="w-full bg-transparent text-sm font-bold outline-none"
              />
            </div>

            <select
              value={filterType}
              onChange={(event) =>
                setFilterType(
                  event.target.value as
                    | "all"
                    | QuestionType
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none"
            >
              <option value="all">
                All Question Types
              </option>

              {questionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* LIBRARY */}

        <section className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
                Question Library
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Questions
              </h2>
            </div>

            <p className="text-xs font-black text-slate-400">
              {filteredQuestions.length} shown
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {filteredQuestions.map((question, index) => (
              <QuestionRow
                key={question.id}
                question={question}
                index={index}
                total={filteredQuestions.length}
                onEdit={() => editQuestion(question)}
                onDelete={() => deleteQuestion(question)}
                onDuplicate={() =>
                  duplicateQuestion(question)
                }
                onToggle={() =>
                  toggleQuestion(question)
                }
                onMoveUp={() =>
                  moveQuestion(question, "up")
                }
                onMoveDown={() =>
                  moveQuestion(question, "down")
                }
                onPlayAudio={() =>
                  playAudio(question.audio_url)
                }
              />
            ))}

            {filteredQuestions.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-500">
                  <BookOpen size={25} />
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-700">
                  No questions yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-400">
                  Tambah content pertama untuk activity{" "}
                  {activity?.title || "ini"}.
                </p>

                <button
                  type="button"
                  onClick={openNewQuestion}
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-black text-white"
                >
                  <Plus size={16} />
                  Add First Question
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   QUESTION ROW
========================================================= */

function QuestionRow({
  question,
  index,
  total,
  onEdit,
  onDelete,
  onDuplicate,
  onToggle,
  onMoveUp,
  onMoveDown,
  onPlayAudio,
}: {
  question: ReadingQuestion;
  index: number;
  total: number;

  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onPlayAudio: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center">
        {/* CONTENT */}

        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 font-black text-indigo-700">
            {String(question.display_order).padStart(2, "0")}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-slate-950">
                {question.title}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] ${
                  question.is_active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {question.is_active ? "Active" : "Draft"}
              </span>
            </div>

            <p className="mt-1 text-xs font-black text-indigo-600">
              {getQuestionTypeLabel(question.question_type)}
            </p>

            {question.word ? (
              <p className="mt-2 text-xl font-black tracking-wide text-violet-600">
                {question.word}
              </p>
            ) : null}

            {question.letter ? (
              <p className="mt-2 text-3xl font-black text-violet-600">
                {question.letter}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              {question.syllable1 ? (
                <MiniBadge>
                  {question.syllable1}
                </MiniBadge>
              ) : null}

              {question.syllable2 ? (
                <MiniBadge>
                  {question.syllable2}
                </MiniBadge>
              ) : null}

              {question.answer ? (
                <MiniBadge>
                  Answer: {question.answer}
                </MiniBadge>
              ) : null}

              <MiniBadge>
                {question.difficulty}
              </MiniBadge>

              {question.image_url ? (
                <MiniBadge>Image</MiniBadge>
              ) : null}

              {question.audio_url ? (
                <MiniBadge>Audio</MiniBadge>
              ) : null}
            </div>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move up"
            className={iconButton}
          >
            <ArrowUp size={16} />
          </button>

          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Move down"
            className={iconButton}
          >
            <ArrowDown size={16} />
          </button>

          {question.audio_url ? (
            <button
              type="button"
              onClick={onPlayAudio}
              title="Play audio"
              className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700 transition hover:bg-amber-100"
            >
              <Volume2 size={16} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={onToggle}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-black ${
              question.is_active
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {question.is_active ? (
              <ToggleRight size={17} />
            ) : (
              <ToggleLeft size={17} />
            )}

            {question.is_active ? "Active" : "Draft"}
          </button>

          <button
            type="button"
            onClick={onEdit}
            title="Edit"
            className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 transition hover:bg-blue-100"
          >
            <Edit3 size={16} />
          </button>

          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate"
            className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700 transition hover:bg-violet-100"
          >
            <Copy size={16} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            title="Delete"
            className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getQuestionTypeLabel(type: QuestionType) {
  return (
    questionTypes.find((item) => item.value === type)?.label ||
    type
  );
}

function needsOptions(type: QuestionType) {
  return [
    "picture_guess",
    "abc_order",
    "letter_sound",
    "uppercase_lowercase",
    "memory_match",
  ].includes(type);
}

function HeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="px-3 py-4 text-center">
      <p className="text-xl font-black sm:text-2xl">
        {value}
      </p>

      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function HeroBadge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-200">
      {children}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-slate-600">
        {label}
      </span>

      {children}
    </label>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <p className="text-sm font-black text-slate-800">
        {title}
      </p>
    </div>
  );
}

function MiniBadge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.06em] text-slate-500">
      {children}
    </span>
  );
}

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50";

const iconButton =
  "grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30";