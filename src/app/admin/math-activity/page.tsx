"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Copy,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

type Topic = "addition" | "subtraction" | "multiplication" | "division";
type ItemType = "box" | "line" | "arrow" | "text";

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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#fffaf0] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold shadow"
          >
            <ArrowLeft size={18} />
            Back Admin
          </Link>

          <form onSubmit={saveQuestion} className="rounded-3xl bg-white p-6 shadow">
            <h1 className="text-3xl font-black">
              {editingId ? "Edit Math Question" : "Create Math Question"}
            </h1>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <label>
                <span className="mb-1 block font-bold">Topic Folder</span>
                <select
                  value={topic}
                  onChange={(e) => makeTemplate(e.target.value as Topic)}
                  className="w-full rounded-2xl border px-4 py-3"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.en} / {t.bm}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-1 block font-bold">Title English</span>
                <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="w-full rounded-2xl border px-4 py-3" />
              </label>

              <label>
                <span className="mb-1 block font-bold">Title BM</span>
                <input value={titleBm} onChange={(e) => setTitleBm(e.target.value)} className="w-full rounded-2xl border px-4 py-3" />
              </label>

              <label>
                <span className="mb-1 block font-bold">Folder / Mode Label</span>
                <input value={modeLabel} onChange={(e) => setModeLabel(e.target.value)} className="w-full rounded-2xl border px-4 py-3" />
              </label>

              <label className="flex items-end gap-3 font-bold">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-5 w-5" />
                Active for parent
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => addItem("box")} className="rounded-2xl bg-indigo-100 px-5 py-3 font-black text-indigo-700">
                <Plus size={18} className="inline" /> Box
              </button>

              <button type="button" onClick={() => addItem("text")} className="rounded-2xl bg-yellow-100 px-5 py-3 font-black text-yellow-700">
                <Plus size={18} className="inline" /> Text
              </button>

              <button type="button" onClick={() => addItem("line")} className="rounded-2xl bg-blue-100 px-5 py-3 font-black text-blue-700">
                <Plus size={18} className="inline" /> Line
              </button>

              <button type="button" onClick={() => addItem("arrow")} className="rounded-2xl bg-green-100 px-5 py-3 font-black text-green-700">
                <ArrowDown size={18} className="inline" /> Arrow
              </button>

              <button type="button" onClick={duplicateSelected} className="rounded-2xl bg-slate-100 px-5 py-3 font-black text-slate-700">
                <Copy size={18} className="inline" /> Duplicate
              </button>

              <button type="button" onClick={undo} className="rounded-2xl bg-slate-100 px-5 py-3 font-black text-slate-700">
                <RotateCcw size={18} className="inline" /> Undo
              </button>

              <button type="button" onClick={deleteSelected} className="rounded-2xl bg-red-100 px-5 py-3 font-black text-red-700">
                <Trash2 size={18} className="inline" /> Delete Selected
              </button>

              <button type="submit" className="rounded-2xl bg-indigo-600 px-6 py-3 font-black text-white">
                <Save size={18} className="inline" /> {editingId ? "Update" : "Save"}
              </button>
            </div>

            <div className={`mt-6 overflow-auto rounded-3xl p-5 ${topicBg}`}>
              <div
                className="relative mx-auto h-[650px] w-[950px] rounded-3xl bg-white shadow-inner"
                onPointerMove={onMove}
                onPointerUp={() => setDragging(null)}
                onPointerLeave={() => setDragging(null)}
              >
                {items.map((item) => (
                  <LayoutPreview
                    key={item.id}
                    item={item}
                    selected={selectedId === item.id}
                    onPointerDown={startDrag}
                  />
                ))}
              </div>
            </div>

            {selectedItem && (
              <SelectedEditor
                item={selectedItem}
                answerJson={answerJson}
                updateItem={updateItem}
                setAnswerJson={setAnswerJson}
                deleteSelected={deleteSelected}
                duplicateSelected={duplicateSelected}
              />
            )}
          </form>

          <section className="mt-8 rounded-3xl bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-black">Saved Questions</h2>

            <div className="grid gap-4 md:grid-cols-2">
              {topics.map((t) => (
                <div key={t.id} className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="mb-3 text-xl font-black">
                    {t.en} / {t.bm}
                  </h3>

                  <div className="space-y-3">
                    {savedQuestions
                      .filter((q) => q.topic === t.id)
                      .map((q) => (
                        <div key={q.id} className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="font-black">{q.title_en}</p>
                          <p className="text-sm text-slate-500">
                            {q.title_bm} • {q.mode_label}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button type="button" onClick={() => editQuestion(q)} className="rounded-xl bg-blue-100 px-4 py-2 font-bold text-blue-700">
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleActive(q)}
                              className={`rounded-xl px-4 py-2 font-bold text-white ${q.is_active ? "bg-green-600" : "bg-slate-400"}`}
                            >
                              {q.is_active ? "Active" : "Locked"}
                            </button>

                            <button type="button" onClick={() => deleteQuestion(q.id)} className="rounded-xl bg-red-100 px-4 py-2 font-bold text-red-600">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
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
    <div className="mt-6 rounded-3xl bg-slate-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black">Selected Item</h2>

        <div className="flex gap-2">
          <button type="button" onClick={duplicateSelected} className="rounded-xl bg-blue-100 px-4 py-2 font-bold text-blue-700">
            Duplicate
          </button>

          <button type="button" onClick={deleteSelected} className="rounded-xl bg-red-100 px-4 py-2 font-bold text-red-600">
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-6">
        <input value={item.id} disabled className="rounded-xl border px-3 py-2 text-sm" />

        <input type="number" value={item.x} onChange={(e) => updateItem(item.id, { x: Number(e.target.value) })} className="rounded-xl border px-3 py-2" placeholder="X" />

        <input type="number" value={item.y} onChange={(e) => updateItem(item.id, { y: Number(e.target.value) })} className="rounded-xl border px-3 py-2" placeholder="Y" />

        <input type="number" value={item.rotation || 0} onChange={(e) => updateItem(item.id, { rotation: Number(e.target.value) })} className="rounded-xl border px-3 py-2" placeholder="Rotate" />

        {item.type === "box" && (
          <>
            <input value={item.text || ""} onChange={(e) => updateItem(item.id, { text: e.target.value })} className="rounded-xl border px-3 py-2" placeholder="Number/Text" />

            <input type="number" value={item.width || 80} onChange={(e) => updateItem(item.id, { width: Number(e.target.value) })} className="rounded-xl border px-3 py-2" placeholder="Width" />

            <input type="number" value={item.height || 80} onChange={(e) => updateItem(item.id, { height: Number(e.target.value) })} className="rounded-xl border px-3 py-2" placeholder="Height" />

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
              className="rounded-xl border px-3 py-2 disabled:bg-slate-100"
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
            <input type="number" value={item.width || 300} onChange={(e) => updateItem(item.id, { width: Number(e.target.value) })} className="rounded-xl border px-3 py-2" placeholder="Width" />

            <input type="number" value={item.height || 5} onChange={(e) => updateItem(item.id, { height: Number(e.target.value) })} className="rounded-xl border px-3 py-2" placeholder="Thickness" />

            <label className="text-sm font-bold">
              Line Colour
              <input type="color" value={item.lineColor || "#3b82f6"} onChange={(e) => updateItem(item.id, { lineColor: e.target.value })} className="mt-1 h-10 w-full" />
            </label>
          </>
        )}

        {item.type === "arrow" && (
          <>
            <select value={item.direction || "down"} onChange={(e) => updateItem(item.id, { direction: e.target.value as "down" | "right" })} className="rounded-xl border px-3 py-2">
              <option value="down">Down</option>
              <option value="right">Right</option>
            </select>

            <input type="number" value={item.size || 60} onChange={(e) => updateItem(item.id, { size: Number(e.target.value) })} className="rounded-xl border px-3 py-2" placeholder="Size" />

            <label className="text-sm font-bold">
              Arrow Colour
              <input type="color" value={item.textColor || "#0f172a"} onChange={(e) => updateItem(item.id, { textColor: e.target.value })} className="mt-1 h-10 w-full" />
            </label>
          </>
        )}

        {item.type === "text" && (
          <>
            <input value={item.text || ""} onChange={(e) => updateItem(item.id, { text: e.target.value })} className="rounded-xl border px-3 py-2" placeholder="Text" />

            <input type="number" value={item.size || 40} onChange={(e) => updateItem(item.id, { size: Number(e.target.value) })} className="rounded-xl border px-3 py-2" placeholder="Size" />

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