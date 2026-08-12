"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Grid3X3,
  HelpCircle,
  Layers3,
  Lightbulb,
  ListChecks,
  Lock,
  MoreVertical,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Type,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

type Topic = "addition" | "subtraction" | "multiplication" | "division";
type ItemType = "box" | "line" | "arrow" | "text" | "operator";

type LayoutItem = {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  text?: string;
  editable?: boolean;

  width?: number;
  height?: number;
  size?: number;
  rotation?: number;

  direction?: "down" | "right";

  borderColor?: string;
  bgColor?: string;
  textColor?: string;
  lineColor?: string;
  operator?: "+" | "-" | "×" | "÷";
  borderWidth?: number;
};

type MathQuestion = {
  id: string;
  topic: Topic;
  title: string;
  title_en: string;
  title_bm: string;
  mode_label: string;
  is_active: boolean;
  layout_json: { items: LayoutItem[] };
  answer_json: Record<string, string>;
};

const topics: { id: Topic; en: string; bm: string; bg: string }[] = [
  { id: "addition", en: "Addition", bm: "Tambah", bg: "bg-purple-100" },
  { id: "subtraction", en: "Subtraction", bm: "Tolak", bg: "bg-pink-100" },
  { id: "multiplication", en: "Multiplication", bm: "Darab", bg: "bg-yellow-100" },
  { id: "division", en: "Division", bm: "Bahagi", bg: "bg-green-100" },
];

export default function AdminMathActivityPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <Content />
        ) : (
          <>
            <Navbar />
            <main className="p-10">
              <h1 className="text-3xl font-bold text-red-600">Access denied</h1>
            </main>
          </>
        )
      }
    </ProtectedPage>
  );
}

function Content() {
  const [savedQuestions, setSavedQuestions] = useState<MathQuestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [topic, setTopic] = useState<Topic>("addition");
  const [titleEn, setTitleEn] = useState("Addition");
  const [titleBm, setTitleBm] = useState("Tambah");
  const [modeLabel, setModeLabel] = useState("2-Digit by 1-Digit");
  const [isActive, setIsActive] = useState(true);

  const [items, setItems] = useState<LayoutItem[]>([]);
  const [answerJson, setAnswerJson] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState("");
  const [history, setHistory] = useState<LayoutItem[][]>([]);

  // Question Library UI state only. No database structure is changed.
  const [libraryTopic, setLibraryTopic] = useState<"all" | Topic>("all");
  const [libraryStatus, setLibraryStatus] = useState<"all" | "active" | "locked">("all");
  const [librarySearch, setLibrarySearch] = useState("");
  const [librarySort, setLibrarySort] = useState<"latest" | "az">("latest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dragging, setDragging] = useState<{
    id: string;
    startX: number;
    startY: number;
    itemX: number;
    itemY: number;
  } | null>(null);

  useEffect(() => {
    loadQuestions();
    makeTemplate("addition");
  }, []);

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from("math_activity_questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setSavedQuestions((data || []) as MathQuestion[]);
  };

  const saveHistory = () => {
    setHistory((prev) => [...prev.slice(-20), JSON.parse(JSON.stringify(items))]);
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setItems(last);
    setHistory((prev) => prev.slice(0, -1));
    setSelectedId("");
  };

  const makeBox = (
    id: string,
    x: number,
    y: number,
    text = "",
    editable = false
  ): LayoutItem => ({
    id,
    type: "box",
    x,
    y,
    text,
    editable,
    width: 80,
    height: 80,
    rotation: 0,
    borderColor: editable ? "#818cf8" : "#cbd5e1",
    bgColor: "#ffffff",
    textColor: "#0f172a",
  });

  const makeTemplate = (selectedTopic: Topic) => {
    setEditingId(null);
    setSelectedId("");
    setAnswerJson({});
    setHistory([]);
    setTopic(selectedTopic);

    if (selectedTopic === "addition") {
      setTitleEn("Addition");
      setTitleBm("Tambah");
      setModeLabel("2-Digit by 1-Digit");
      setItems([
        { id: "op", type: "text", x: 120, y: 270, text: "+", size: 64, rotation: 0, textColor: "#0f172a" },
        { id: "line1", type: "line", x: 250, y: 390, width: 580, height: 5, rotation: 0, lineColor: "#3b82f6" },
        makeBox("carry1", 430, 35, "", true),
        makeBox("carry2", 530, 35, "", true),
        makeBox("top1", 430, 150, "1", false),
        makeBox("top2", 530, 150, "7", false),
        makeBox("bottom1", 430, 260, "", false),
        makeBox("bottom2", 530, 260, "4", false),
        makeBox("answer1", 430, 430, "", true),
        makeBox("answer2", 530, 430, "", true),
      ]);
    }

    if (selectedTopic === "subtraction") {
      setTitleEn("Subtraction");
      setTitleBm("Tolak");
      setModeLabel("2-Digit by 1-Digit");
      setItems([
        { id: "op", type: "text", x: 120, y: 270, text: "-", size: 64, rotation: 0, textColor: "#0f172a" },
        { id: "line1", type: "line", x: 250, y: 390, width: 580, height: 5, rotation: 0, lineColor: "#3b82f6" },
        makeBox("borrow1", 430, 35, "", true),
        makeBox("borrow2", 530, 35, "", true),
        makeBox("top1", 430, 150, "2", false),
        makeBox("top2", 530, 150, "7", false),
        makeBox("bottom1", 430, 260, "", false),
        makeBox("bottom2", 530, 260, "9", false),
        makeBox("answer1", 430, 430, "", true),
        makeBox("answer2", 530, 430, "", true),
      ]);
    }

    if (selectedTopic === "multiplication") {
      setTitleEn("Multiplication");
      setTitleBm("Darab");
      setModeLabel("2-Digit by 1-Digit");
      setItems([
        { id: "op", type: "text", x: 120, y: 270, text: "×", size: 64, rotation: 0, textColor: "#0f172a" },
        { id: "line1", type: "line", x: 250, y: 390, width: 580, height: 5, rotation: 0, lineColor: "#3b82f6" },
        { id: "arrow1", type: "arrow", x: 650, y: 270, direction: "down", size: 60, rotation: 0, textColor: "#0f172a" },
        makeBox("carry1", 430, 35, "", true),
        makeBox("carry2", 530, 35, "", true),
        makeBox("top1", 430, 150, "2", false),
        makeBox("top2", 530, 150, "4", false),
        makeBox("bottom1", 530, 260, "3", false),
        makeBox("answer1", 430, 430, "", true),
        makeBox("answer2", 530, 430, "", true),
        makeBox("answer3", 630, 430, "", true),
      ]);
    }

    if (selectedTopic === "division") {
      setTitleEn("Division");
      setTitleBm("Bahagi");
      setModeLabel("4-Digit by 1-Digit");
      setItems([
        { id: "op", type: "text", x: 90, y: 230, text: "÷", size: 60, rotation: 0, textColor: "#0f172a" },
        { id: "line1", type: "line", x: 250, y: 145, width: 590, height: 5, rotation: 0, lineColor: "#3b82f6" },
        { id: "line2", type: "line", x: 220, y: 320, width: 620, height: 5, rotation: 0, lineColor: "#3b82f6" },
        { id: "line3", type: "line", x: 220, y: 480, width: 620, height: 5, rotation: 0, lineColor: "#3b82f6" },
        { id: "arrow1", type: "arrow", x: 520, y: 340, direction: "down", size: 60, rotation: 0, textColor: "#0f172a" },
        { id: "arrow2", type: "arrow", x: 680, y: 340, direction: "down", size: 60, rotation: 0, textColor: "#0f172a" },
        makeBox("answer1", 330, 35, "", true),
        makeBox("answer2", 430, 35, "", true),
        makeBox("answer3", 530, 35, "", true),
        makeBox("answer4", 630, 35, "", true),
        makeBox("divisor", 120, 165, "8", false),
        makeBox("q1", 330, 175, "2", false),
        makeBox("q2", 430, 175, "4", false),
        makeBox("q3", 530, 175, "6", false),
        makeBox("q4", 630, 175, "2", false),
        makeBox("q5", 730, 175, "4", false),
        makeBox("work1", 430, 360, "", true),
        makeBox("work2", 530, 360, "", true),
        makeBox("work3", 430, 520, "", true),
        makeBox("work4", 530, 520, "", true),
      ]);
    }
  };

  const updateItem = (id: string, update: Partial<LayoutItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...update } : item))
    );
  };

  const addItem = (type: ItemType) => {
    saveHistory();
    const id = `${type}_${Date.now()}`;

    const newItem: LayoutItem =
      type === "box"
        ? {
            id,
            type,
            x: 300,
            y: 300,
            text: "",
            editable: true,
            width: 80,
            height: 80,
            rotation: 0,
            borderColor: "#818cf8",
            bgColor: "#ffffff",
            textColor: "#0f172a",
          }
        : type === "line"
        ? {
            id,
            type,
            x: 250,
            y: 350,
            width: 500,
            height: 5,
            rotation: 0,
            lineColor: "#3b82f6",
          }
        : type === "arrow"
        ? {
            id,
            type,
            x: 400,
            y: 300,
            direction: "down",
            size: 60,
            rotation: 0,
            textColor: "#0f172a",
          }
        : {
            id,
            type,
            x: 300,
            y: 300,
            text: "Text",
            size: 40,
            rotation: 0,
            textColor: "#0f172a",
          };

    setItems((prev) => [...prev, newItem]);
    setSelectedId(id);
  };

  const addOperator = (operator: "+" | "-" | "×" | "÷") => {
    saveHistory();
    const id = `operator-${operator}-${Date.now()}`;
    const item: LayoutItem = {
      id,
      type: "operator",
      x: 140,
      y: 250,
      rotation: 0,
      operator,
      text: operator,
      size: 64,
      width: 72,
      height: 72,
      textColor: "#0f172a",
      bgColor: "#ffffff",
      borderColor: "#8b5cf6",
      borderWidth: 3,
    };
    setItems((prev) => [...prev, item]);
    setSelectedId(id);
  };

  const duplicateSelected = () => {
    const selected = items.find((item) => item.id === selectedId);
    if (!selected) return;

    saveHistory();

    const copy: LayoutItem = {
      ...selected,
      id: `${selected.type}_${Date.now()}`,
      x: selected.x + 30,
      y: selected.y + 30,
    };

    setItems((prev) => [...prev, copy]);

    if (selected.editable && answerJson[selected.id]) {
      setAnswerJson((prev) => ({
        ...prev,
        [copy.id]: prev[selected.id],
      }));
    }

    setSelectedId(copy.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    saveHistory();

    setItems((prev) => prev.filter((item) => item.id !== selectedId));

    setAnswerJson((prev) => {
      const copy = { ...prev };
      delete copy[selectedId];
      return copy;
    });

    setSelectedId("");
  };

  const startDrag = (e: React.PointerEvent, item: LayoutItem) => {
    e.preventDefault();
    e.stopPropagation();

    saveHistory();
    setSelectedId(item.id);

    setDragging({
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      itemX: item.x,
      itemY: item.y,
    });
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;

    updateItem(dragging.id, {
      x: Math.round(dragging.itemX + e.clientX - dragging.startX),
      y: Math.round(dragging.itemY + e.clientY - dragging.startY),
    });
  };

  const selectedItem = items.find((item) => item.id === selectedId);

  const saveQuestion = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      topic,
      title: titleEn,
      title_en: titleEn,
      title_bm: titleBm,
      mode_label: modeLabel,
      is_active: isActive,
      layout_json: { items },
      answer_json: answerJson,
    };

    const { error } = editingId
      ? await supabase.from("math_activity_questions").update(payload).eq("id", editingId)
      : await supabase.from("math_activity_questions").insert(payload);

    if (error) {
      alert(error.message);
      return;
    }

    alert(editingId ? "Question updated!" : "Question saved!");
    setEditingId(null);
    await loadQuestions();
  };

  const editQuestion = (item: MathQuestion) => {
    setEditingId(item.id);
    setTopic(item.topic);
    setTitleEn(item.title_en);
    setTitleBm(item.title_bm);
    setModeLabel(item.mode_label || "");
    setIsActive(item.is_active);
    setItems(item.layout_json?.items || []);
    setAnswerJson(item.answer_json || {});
    setSelectedId("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await supabase.from("math_activity_questions").delete().eq("id", id);
    await loadQuestions();
  };

  const toggleActive = async (item: MathQuestion) => {
    await supabase
      .from("math_activity_questions")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);
    await loadQuestions();
  };

  const topicBg = topics.find((t) => t.id === topic)?.bg || "bg-purple-100";

  const activeQuestions = savedQuestions.filter((q) => q.is_active).length;
  const totalSavedItems = savedQuestions.reduce(
    (sum, q) => sum + (q.layout_json?.items?.length || 0),
    0
  );
  const totalSavedAnswers = savedQuestions.reduce(
    (sum, q) => sum + Object.keys(q.answer_json || {}).length,
    0
  );

  const topicCount = (topicId: Topic) =>
    savedQuestions.filter((q) => q.topic === topicId).length;

  const filteredQuestions = savedQuestions
    .filter((q) => libraryTopic === "all" || q.topic === libraryTopic)
    .filter((q) => {
      if (libraryStatus === "active") return q.is_active;
      if (libraryStatus === "locked") return !q.is_active;
      return true;
    })
    .filter((q) => {
      const query = librarySearch.trim().toLowerCase();
      if (!query) return true;
      return [q.title_en, q.title_bm, q.mode_label, q.topic]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => {
      if (librarySort === "az") {
        return (a.title_en || "").localeCompare(b.title_en || "");
      }
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleQuestions = filteredQuestions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const resetBuilder = () => {
    makeTemplate(topic);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
        <div className="mx-auto max-w-[1800px] px-3 py-4 sm:px-5 lg:px-6">
          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            {/* Premium header */}
            <section className="relative overflow-hidden bg-gradient-to-r from-[#081331] via-[#101a48] to-[#1f2368] px-5 py-5 text-white sm:px-7 lg:px-8">
              <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-4">
                  <Link
                    href="/admin"
                    className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                    aria-label="Back to admin"
                  >
                    <ArrowLeft size={18} />
                  </Link>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-300">
                      FD Arcadia Admin
                    </p>
                    <h1 className="mt-1 flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
                      Math Activity Builder
                      <Sparkles className="text-violet-300" size={22} />
                    </h1>
                    <p className="mt-1.5 text-sm font-medium text-slate-300">
                      Create interactive math activities for students.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <MetricCard icon={<FileText size={18} />} label="Total Questions" value={savedQuestions.length} note="All time" tone="violet" />
                  <MetricCard icon={<CheckCircle2 size={18} />} label="Active Questions" value={activeQuestions} note="Published" tone="emerald" />
                  <MetricCard icon={<Layers3 size={18} />} label="Total Items" value={totalSavedItems} note="Elements" tone="blue" />
                  <MetricCard icon={<ListChecks size={18} />} label="Total Answers" value={totalSavedAnswers} note="Editable boxes" tone="orange" />
                </div>
              </div>
            </section>

            {/* Question metadata */}
            <section className="border-b border-slate-200 bg-white p-4 sm:p-5 lg:p-6">
              <div className="grid gap-3 lg:grid-cols-[1.05fr_1.15fr_1.15fr_1fr_.8fr]">
                <FieldShell label="Topic">
                  <select
                    value={topic}
                    onChange={(e) => makeTemplate(e.target.value as Topic)}
                    className="w-full bg-transparent text-sm font-black text-indigo-800 outline-none"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>{t.en} / {t.bm}</option>
                    ))}
                  </select>
                </FieldShell>

                <FieldShell label="Title (English)">
                  <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" />
                </FieldShell>

                <FieldShell label="Title (BM)">
                  <input value={titleBm} onChange={(e) => setTitleBm(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" />
                </FieldShell>

                <FieldShell label="Mode / Folder">
                  <input value={modeLabel} onChange={(e) => setModeLabel(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" />
                </FieldShell>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Status</p>
                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-black text-slate-700">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="peer sr-only" />
                    <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-violet-600 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
                    {isActive ? "Active" : "Locked"}
                  </label>
                </div>
              </div>
            </section>

            <form onSubmit={saveQuestion}>
              <div className="grid gap-0 xl:grid-cols-[560px_minmax(0,1fr)]">
                {/* QUESTION LIBRARY */}
                <aside className="min-w-0 border-b border-slate-200 bg-[#fbfcff] p-4 sm:p-5 xl:border-b-0 xl:border-r">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black tracking-tight text-[#101735]">QUESTION LIBRARY</p>
                      <p className="mt-1 text-xs font-medium text-slate-400">Manage all saved math activity questions</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">{savedQuestions.length} Questions</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                      <Search size={15} className="shrink-0 text-slate-400" />
                      <input
                        value={librarySearch}
                        onChange={(e) => { setLibrarySearch(e.target.value); setPage(1); }}
                        placeholder="Search questions..."
                        className="min-w-0 flex-1 bg-transparent text-xs font-semibold outline-none placeholder:text-slate-400"
                      />
                    </label>
                    <button type="button" onClick={() => { makeTemplate(topic); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-violet-700">
                      <Plus size={15} /> New
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <select value={libraryStatus} onChange={(e) => { setLibraryStatus(e.target.value as "all" | "active" | "locked"); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 outline-none">
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="locked">Locked</option>
                    </select>
                    <select value={librarySort} onChange={(e) => setLibrarySort(e.target.value as "latest" | "az")} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 outline-none">
                      <option value="latest">Latest First</option>
                      <option value="az">A–Z</option>
                    </select>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[160px_minmax(0,1fr)] xl:grid-cols-[160px_minmax(0,1fr)]">
                    <div>
                      <LibraryTopicButton active={libraryTopic === "all"} label="All Topics" count={savedQuestions.length} tone="violet" onClick={() => { setLibraryTopic("all"); setPage(1); }} />
                      <LibraryTopicButton active={libraryTopic === "addition"} label="Addition / Tambah" count={topicCount("addition")} tone="violet" onClick={() => { setLibraryTopic("addition"); setPage(1); }} />
                      <LibraryTopicButton active={libraryTopic === "subtraction"} label="Subtraction / Tolak" count={topicCount("subtraction")} tone="rose" onClick={() => { setLibraryTopic("subtraction"); setPage(1); }} />
                      <LibraryTopicButton active={libraryTopic === "multiplication"} label="Multiplication / Darab" count={topicCount("multiplication")} tone="amber" onClick={() => { setLibraryTopic("multiplication"); setPage(1); }} />
                      <LibraryTopicButton active={libraryTopic === "division"} label="Division / Bahagi" count={topicCount("division")} tone="emerald" onClick={() => { setLibraryTopic("division"); setPage(1); }} />

                      <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3">
                        <div className="flex items-center gap-2 text-indigo-700"><Lightbulb size={15} /><p className="text-xs font-black">Tips</p></div>
                        <ul className="mt-2 space-y-2 text-[10px] font-semibold leading-4 text-slate-500">
                          <li>• Drag items on canvas to reposition them.</li>
                          <li>• Click an item to edit its properties.</li>
                          <li>• Editable boxes are student answers.</li>
                          <li>• Set every correct answer before saving.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <div className="grid grid-cols-[28px_minmax(110px,1fr)_72px_62px_24px] gap-1 border-b border-slate-100 bg-slate-50 px-2 py-2 text-[9px] font-black uppercase tracking-wide text-slate-400">
                        <span>#</span><span>Question</span><span className="text-center">Mode</span><span className="text-center">Status</span><span />
                      </div>

                      {visibleQuestions.length ? visibleQuestions.map((q, index) => (
                        <div key={q.id} className={`grid grid-cols-[28px_minmax(110px,1fr)_72px_62px_24px] items-center gap-2 border-b border-slate-100 px-2.5 py-2.5 last:border-b-0 ${editingId === q.id ? "bg-violet-50" : "bg-white"}`}>
                          <span className="text-[10px] font-black text-slate-400">{String((safePage - 1) * pageSize + index + 1).padStart(2, "0")}</span>
                          <button type="button" onClick={() => editQuestion(q)} className="min-w-0 overflow-hidden text-left">
                            <p className="truncate text-[11px] font-black leading-4 text-indigo-950">{q.title_en}</p>
                            <p className="truncate text-[9px] font-semibold leading-3 text-slate-400">{q.title_bm}</p>
                          </button>
                          <span className="block w-full truncate rounded-md bg-violet-50 px-1.5 py-1.5 text-center text-[8px] font-black text-violet-700" title={q.mode_label}>{compactMode(q.mode_label)}</span>
                          <button type="button" onClick={() => toggleActive(q)} className={`w-full rounded-full px-1 py-1.5 text-center text-[8px] font-black ${q.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{q.is_active ? "Active" : "Locked"}</button>
                          <button type="button" onClick={() => deleteQuestion(q.id)} className="grid h-6 w-6 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" title="Delete question"><MoreVertical size={14} /></button>
                        </div>
                      )) : (
                        <div className="p-6 text-center"><BookOpen className="mx-auto text-slate-300" size={24} /><p className="mt-2 text-xs font-black text-slate-500">No questions found</p></div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-500">
                    <div className="flex items-center gap-2">Show
                      <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 outline-none">
                        <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
                      </select>
                      per page
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"><ChevronLeft size={13} /></button>
                      <span className="grid h-7 min-w-7 place-items-center rounded-lg bg-violet-600 px-2 text-white">{safePage}</span>
                      <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"><ChevronRight size={13} /></button>
                    </div>
                  </div>
                </aside>

                {/* BUILDER WORKSPACE */}
                <section className="min-w-0 bg-white p-4 sm:p-5">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                          Builder Tools
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <ToolButton label="Box" icon={<Box size={16} />} tone="violet" onClick={() => addItem("box")} />
                          <ToolButton label="Line" icon={<span className="text-lg leading-none">―</span>} tone="blue" onClick={() => addItem("line")} />
                          <ToolButton label="Arrow" icon={<ArrowRight size={16} />} tone="emerald" onClick={() => addItem("arrow")} />
                          <ToolButton label="Text" icon={<Type size={16} />} tone="orange" onClick={() => addItem("text")} />

                          <details className="group relative">
                            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] font-black text-violet-700 transition hover:bg-violet-100">
                              <Plus size={16} />
                              Add Icon
                            </summary>

                            <div className="absolute left-0 top-[44px] z-50 w-52 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                                Basic Operators
                              </p>

                              <div className="mt-2 grid grid-cols-4 gap-2">
                                {[
                                  { symbol: "+", label: "Plus" },
                                  { symbol: "-", label: "Minus" },
                                  { symbol: "×", label: "Multiply" },
                                  { symbol: "÷", label: "Divide" },
                                ].map((operator) => (
                                  <button
                                    key={operator.symbol}
                                    type="button"
                                    onClick={() =>
                                      addOperator(
                                        operator.symbol as "+" | "-" | "×" | "÷"
                                      )
                                    }
                                    title={operator.label}
                                    className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-2xl font-black text-slate-950 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                                  >
                                    {operator.symbol}
                                  </button>
                                ))}
                              </div>

                              <div className="mt-3 flex items-start gap-2 rounded-xl bg-indigo-50 px-3 py-2">
                                <HelpCircle size={14} className="mt-0.5 shrink-0 text-indigo-600" />
                                <p className="text-[9px] font-semibold leading-4 text-slate-500">
                                  Click an operator to add it to the canvas, then drag it anywhere.
                                </p>
                              </div>
                            </div>
                          </details>

                          <ToolButton label="Duplicate" icon={<Copy size={16} />} tone="violet" onClick={duplicateSelected} />
                          <ToolButton label="Undo" icon={<RotateCcw size={16} />} tone="blue" onClick={undo} />
                          <ToolButton label="Clear" icon={<Trash2 size={16} />} tone="rose" onClick={deleteSelected} />
                        </div>
                      </div>

                      <div className="flex max-w-[290px] items-start gap-2 rounded-xl bg-violet-50 px-3 py-2.5">
                        <HelpCircle size={17} className="mt-0.5 shrink-0 text-violet-600" />
                        <div>
                          <p className="text-[10px] font-black text-violet-700">
                            How to use
                          </p>
                          <p className="mt-0.5 text-[9px] font-semibold leading-4 text-slate-500">
                            Add elements to the canvas, drag them into position, then edit their properties.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 2xl:grid-cols-[minmax(0,1fr)_230px]">
                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-[#fbfcff] p-3 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">Canvas Editor</p><p className="mt-0.5 text-[9px] font-semibold text-slate-400">Drag & drop items to build your math activity</p></div>
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-500">Canvas: 950 × 650</span>
                      </div>

                      <div className={`overflow-auto rounded-xl border border-slate-200 p-3 ${topicBg}`}>
                        <div
                          className="relative mx-auto h-[650px] w-[950px] rounded-xl bg-white shadow-inner ring-1 ring-slate-100"
                          onPointerMove={onMove}
                          onPointerUp={() => setDragging(null)}
                          onPointerLeave={() => setDragging(null)}
                        >
                          {items.map((item) => (
                            <LayoutPreview key={item.id} item={item} selected={selectedId === item.id} onPointerDown={startDrag} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      {selectedItem ? (
                        <SelectedEditor
                          item={selectedItem}
                          answerJson={answerJson}
                          updateItem={updateItem}
                          setAnswerJson={setAnswerJson}
                          deleteSelected={deleteSelected}
                          duplicateSelected={duplicateSelected}
                        />
                      ) : (
                        <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] p-4 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Selected Item</p>
                          <div className="mt-8 text-center"><Grid3X3 className="mx-auto text-slate-300" size={26} /><p className="mt-2 text-xs font-black text-slate-500">Nothing selected</p><p className="mt-1 text-[10px] font-semibold leading-4 text-slate-400">Click an item on the canvas to edit its properties.</p></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-700">Correct Answers <span className="normal-case text-slate-400">(Editable Boxes)</span></p>
                        <p className="mt-0.5 text-[9px] font-semibold text-slate-400">Set the correct answer for each editable box.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {items.filter((item) => item.type === "box" && item.editable).map((item) => (
                            <label key={item.id} className="min-w-[92px] flex-1 sm:max-w-[120px]">
                              <span className="block truncate text-[9px] font-black text-violet-700">{item.id}</span>
                              <input value={answerJson[item.id] || ""} onChange={(e) => setAnswerJson((prev) => ({ ...prev, [item.id]: e.target.value }))} className="mt-1 w-full rounded-lg border border-violet-200 bg-white px-2.5 py-2 text-xs font-black outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                            </label>
                          ))}
                          {!items.some((item) => item.type === "box" && item.editable) && <p className="text-xs font-semibold text-slate-400">No editable answer boxes yet.</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col justify-end gap-2 sm:flex-row">
                    <button type="button" onClick={resetBuilder} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-violet-700 shadow-sm transition hover:bg-slate-50"><RotateCcw size={16} /> Reset All</button>
                    <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"><Save size={16} /> {editingId ? "Update Question" : "Save Question"}</button>
                  </div>
                </section>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}


function MetricCard({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  note: string;
  tone: "violet" | "emerald" | "blue" | "orange";
}) {
  const toneClass = {
    violet: "bg-violet-100 text-violet-700",
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
  }[tone];

  return (
    <div className="min-w-[125px] rounded-2xl border border-white/10 bg-white p-3 text-slate-900 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${toneClass}`}>{icon}</div>
        <div className="min-w-0">
          <p className="truncate text-[9px] font-black text-slate-500">{label}</p>
          <p className="text-xl font-black leading-6">{value}</p>
          <p className="text-[8px] font-semibold text-slate-400">{note}</p>
        </div>
      </div>
    </div>
  );
}

function FieldShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 transition focus-within:border-violet-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-50">
      <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function LibraryTopicButton({
  active,
  label,
  count,
  tone,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  tone: "violet" | "rose" | "amber" | "emerald";
  onClick: () => void;
}) {
  const dot = { violet: "bg-violet-500", rose: "bg-rose-500", amber: "bg-amber-500", emerald: "bg-emerald-500" }[tone];
  return (
    <button type="button" onClick={onClick} className={`mb-1 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition ${active ? "bg-violet-50 text-violet-800" : "text-slate-600 hover:bg-slate-50"}`}>
      <span className={`h-2 w-2 shrink-0 rounded-sm ${dot}`} />
      <span className="min-w-0 flex-1 truncate text-[10px] font-black">{label}</span>
      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black ${active ? "bg-white text-violet-700" : "bg-slate-100 text-slate-500"}`}>{count}</span>
    </button>
  );
}

function ToolButton({
  label,
  icon,
  tone,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  tone: "violet" | "blue" | "emerald" | "orange" | "rose";
  onClick: () => void;
}) {
  const toneClass = {
    violet: "bg-violet-50 text-violet-700 hover:bg-violet-100",
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    orange: "bg-orange-50 text-orange-700 hover:bg-orange-100",
    rose: "bg-rose-50 text-rose-700 hover:bg-rose-100",
  }[tone];
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-black transition ${toneClass}`}>{icon}{label}</button>;
}

function compactMode(value: string) {
  return value
    .replace(/Digit/gi, "D")
    .replace(/\s+by\s+/gi, " × ")
    .replace(/\s+/g, " ")
    .trim();
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <span className="truncate text-[10px] font-black text-slate-500">
          {value}
        </span>
      </div>
    </label>
  );
}

function LayoutPreview({
  item,
  selected,
  onPointerDown,
}: {
  item: LayoutItem;
  selected: boolean;
  onPointerDown: (e: React.PointerEvent, item: LayoutItem) => void;
}) {
  const ring = selected ? "ring-4 ring-indigo-500" : "";

  if (item.type === "box") {
    return (
      <div
        onPointerDown={(e) => onPointerDown(e, item)}
        className={`absolute flex cursor-move select-none items-center justify-center rounded-xl border-4 font-black shadow ${ring}`}
        style={{
          left: item.x,
          top: item.y,
          width: item.width || 80,
          height: item.height || 80,
          transform: `rotate(${item.rotation || 0}deg)`,
          borderColor: item.borderColor || "#cbd5e1",
          backgroundColor: item.bgColor || "#ffffff",
          color: item.textColor || "#0f172a",
          fontSize: Math.max((item.height || 80) / 2.5, 20),
        }}
      >
        {item.text || ""}
      </div>
    );
  }

  if (item.type === "line") {
    return (
      <div
        onPointerDown={(e) => onPointerDown(e, item)}
        className={`absolute cursor-move rounded-full ${ring}`}
        style={{
          left: item.x,
          top: item.y,
          width: item.width || 300,
          height: item.height || 5,
          transform: `rotate(${item.rotation || 0}deg)`,
          backgroundColor: item.lineColor || "#3b82f6",
          transformOrigin: "left center",
        }}
      />
    );
  }

  if (item.type === "arrow") {
    return (
      <div
        onPointerDown={(e) => onPointerDown(e, item)}
        className={`absolute cursor-move select-none ${ring}`}
        style={{
          left: item.x,
          top: item.y,
          transform: `rotate(${item.rotation || 0}deg)`,
          color: item.textColor || "#0f172a",
        }}
      >
        {item.direction === "right" ? (
          <ArrowRight size={item.size || 60} />
        ) : (
          <ArrowDown size={item.size || 60} />
        )}
      </div>
    );
  }

  return (
    <div
      onPointerDown={(e) => onPointerDown(e, item)}
      className={`absolute cursor-move select-none font-black ${ring}`}
      style={{
        left: item.x,
        top: item.y,
        fontSize: item.size || 40,
        transform: `rotate(${item.rotation || 0}deg)`,
        color: item.textColor || "#0f172a",
      }}
    >
      {item.text}
    </div>
  );
}

function SelectedEditor({
  item,
  answerJson,
  updateItem,
  setAnswerJson,
  deleteSelected,
  duplicateSelected,
}: {
  item: LayoutItem;
  answerJson: Record<string, string>;
  updateItem: (id: string, update: Partial<LayoutItem>) => void;
  setAnswerJson: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  deleteSelected: () => void;
  duplicateSelected: () => void;
}) {
  return (
    <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-500">
            Properties
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Selected Item</h2>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={duplicateSelected} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100">
            Duplicate
          </button>

                {item.type === "operator" ? (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          <label className="block">
            <span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
              Icon
            </span>
            <select
              value={item.operator || "+"}
              onChange={(e) =>
                updateItem(item.id, {
                  operator: e.target.value as "+" | "-" | "×" | "÷",
                  text: e.target.value,
                })
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-800 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
            >
              <option value="+">+ Plus</option>
              <option value="-">− Minus</option>
              <option value="×">× Multiply</option>
              <option value="÷">÷ Divide</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <ColorField
              label="Icon Color"
              value={item.textColor || "#0f172a"}
              onChange={(value) => updateItem(item.id, { textColor: value })}
            />
            <ColorField
              label="Background"
              value={item.bgColor || "#ffffff"}
              onChange={(value) => updateItem(item.id, { bgColor: value })}
            />
          </div>

          <div className="grid grid-cols-[1fr_90px] gap-3">
            <ColorField
              label="Border"
              value={item.borderColor || "#8b5cf6"}
              onChange={(value) => updateItem(item.id, { borderColor: value })}
            />
            <label className="block">
              <span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                Width
              </span>
              <input
                type="number"
                min={0}
                max={12}
                value={item.borderWidth ?? 3}
                onChange={(e) =>
                  updateItem(item.id, { borderWidth: Number(e.target.value) })
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
              Icon Size
            </span>
            <input
              type="number"
              min={18}
              max={160}
              value={item.size || 64}
              onChange={(e) =>
                updateItem(item.id, { size: Number(e.target.value) })
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
            />
          </label>
        </div>
      ) : null}

<button type="button" onClick={deleteSelected} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-100">
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-6">
        <input value={item.id} disabled className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" />

        <input type="number" value={item.x} onChange={(e) => updateItem(item.id, { x: Number(e.target.value) })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50" placeholder="X" />

        <input type="number" value={item.y} onChange={(e) => updateItem(item.id, { y: Number(e.target.value) })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50" placeholder="Y" />

        <input type="number" value={item.rotation || 0} onChange={(e) => updateItem(item.id, { rotation: Number(e.target.value) })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50" placeholder="Rotate" />

        {item.type === "box" && (
          <>
            <input value={item.text || ""} onChange={(e) => updateItem(item.id, { text: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50" placeholder="Number/Text" />

            <input type="number" value={item.width || 80} onChange={(e) => updateItem(item.id, { width: Number(e.target.value) })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50" placeholder="Width" />

            <input type="number" value={item.height || 80} onChange={(e) => updateItem(item.id, { height: Number(e.target.value) })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50" placeholder="Height" />

            <label className="flex items-center gap-2 font-bold">
              <input type="checkbox" checked={!!item.editable} onChange={(e) => updateItem(item.id, { editable: e.target.checked })} />
              Parent answer
            </label>

            <input
              value={answerJson[item.id] || ""}
              onChange={(e) =>
                setAnswerJson((prev) => ({
                  ...prev,
                  [item.id]: e.target.value,
                }))
              }
              disabled={!item.editable}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50 disabled:bg-slate-100"
              placeholder="Correct answer"
            />

            <label className="text-sm font-bold">
              Border
              <input type="color" value={item.borderColor || "#cbd5e1"} onChange={(e) => updateItem(item.id, { borderColor: e.target.value })} className="mt-1 h-10 w-full" />
            </label>

            <label className="text-sm font-bold">
              Background
              <input type="color" value={item.bgColor || "#ffffff"} onChange={(e) => updateItem(item.id, { bgColor: e.target.value })} className="mt-1 h-10 w-full" />
            </label>

            <label className="text-sm font-bold">
              Text
              <input type="color" value={item.textColor || "#0f172a"} onChange={(e) => updateItem(item.id, { textColor: e.target.value })} className="mt-1 h-10 w-full" />
            </label>
          </>
        )}

        {item.type === "line" && (
          <>
            <input type="number" value={item.width || 300} onChange={(e) => updateItem(item.id, { width: Number(e.target.value) })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50" placeholder="Width" />

            <input type="number" value={item.height || 5} onChange={(e) => updateItem(item.id, { height: Number(e.target.value) })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50" placeholder="Thickness" />

            <label className="text-sm font-bold">
              Line Colour
              <input type="color" value={item.lineColor || "#3b82f6"} onChange={(e) => updateItem(item.id, { lineColor: e.target.value })} className="mt-1 h-10 w-full" />
            </label>
          </>
        )}

        {item.type === "arrow" && (
          <>
            <select value={item.direction || "down"} onChange={(e) => updateItem(item.id, { direction: e.target.value as "down" | "right" })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50">
              <option value="down">Down</option>
              <option value="right">Right</option>
            </select>

            <input type="number" value={item.size || 60} onChange={(e) => updateItem(item.id, { size: Number(e.target.value) })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50" placeholder="Size" />

            <label className="text-sm font-bold">
              Arrow Colour
              <input type="color" value={item.textColor || "#0f172a"} onChange={(e) => updateItem(item.id, { textColor: e.target.value })} className="mt-1 h-10 w-full" />
            </label>
          </>
        )}

        {item.type === "text" && (
          <>
            <input value={item.text || ""} onChange={(e) => updateItem(item.id, { text: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50" placeholder="Text" />

            <input type="number" value={item.size || 40} onChange={(e) => updateItem(item.id, { size: Number(e.target.value) })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50" placeholder="Size" />

            <label className="text-sm font-bold">
              Text Colour
              <input type="color" value={item.textColor || "#0f172a"} onChange={(e) => updateItem(item.id, { textColor: e.target.value })} className="mt-1 h-10 w-full" />
            </label>
          </>
        )}
      </div>
    </div>
  );
}