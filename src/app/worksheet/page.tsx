"use client";

import {
  ChangeEvent,
  DragEvent,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import * as fabric from "fabric";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Copy,
  Download,
  Eraser,
  Highlighter,
  Link2,
  MousePointer2,
  Pencil,
  RectangleHorizontal,
  Redo2,
  RotateCcw,
  Save,
  Trash2,
  Type,
  Upload,
  Undo2,
  Minus,
  Brush,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";

type Tool = "select" | "pen" | "marker" | "highlighter" | "eraser";

type PdfPage = {
  pageNo: number;
  imageUrl: string;
};

const colours = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#f59e0b",
  "#ec4899",
  "#7c3aed",
  "#000000",
];

const stickers = ["⭐", "✅", "❌", "❤️", "😊", "🎉", "👍", "🌈"];

const LOCAL_SAVE_KEY = "fd-arcadia-draw-learn-draft";

export default function WorksheetPage() {
  return (
    <ProtectedPage>
      {() => (
        <>
          <Navbar />
          <Suspense fallback={null}>
            <WorksheetCanvas />
          </Suspense>
        </>
      )}
    </ProtectedPage>
  );
}

function WorksheetCanvas() {
  const searchParams = useSearchParams();
  const freebiesFile = searchParams.get("file");
  const freebiesType = searchParams.get("type");

  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const loadedFreebieRef = useRef("");
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const restoringHistoryRef = useRef(false);
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tool, setTool] = useState<Tool>("select");
  const [colour, setColour] = useState("#2563eb");
  const [penSize, setPenSize] = useState(5);
  const [imageLink, setImageLink] = useState("");
  const [pdfPages, setPdfPages] = useState<PdfPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const [canvasWidth, setCanvasWidth] = useState(794);
  const [canvasHeight, setCanvasHeight] = useState(1123);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving">("saved");

  function getCanvasSize() {
    return {
      width: canvasWidth,
      height: canvasHeight,
    };
  }

  function updatePageSize(width: number, height: number) {
    const canvas = canvasRef.current;

    setCanvasWidth(width);
    setCanvasHeight(height);

    if (!canvas) return;

    canvas.setDimensions({
      width,
      height,
    });

    canvas.requestRenderAll();
  }

  function resizeCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = getCanvasSize();

    canvas.setDimensions({
      width,
      height,
    });

    canvas.requestRenderAll();
  }

  function updateHistoryButtons() {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(
      historyIndexRef.current >= 0 &&
        historyIndexRef.current < historyRef.current.length - 1,
    );
  }

  function pushHistorySnapshot() {
    const canvas = canvasRef.current;
    if (!canvas || restoringHistoryRef.current) return;

    const snapshot = JSON.stringify(canvas.toJSON());

    const currentSnapshot =
      historyRef.current[historyIndexRef.current] || "";

    if (snapshot === currentSnapshot) return;

    const nextHistory = historyRef.current.slice(
      0,
      historyIndexRef.current + 1,
    );

    nextHistory.push(snapshot);

    if (nextHistory.length > 40) {
      nextHistory.shift();
    }

    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    updateHistoryButtons();

    setAutoSaveStatus("saving");

    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
    }

    historyTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_SAVE_KEY, snapshot);
        setAutoSaveStatus("saved");
      } catch {
        setAutoSaveStatus("saved");
      }
    }, 450);
  }

  async function restoreHistory(index: number) {
    const canvas = canvasRef.current;
    const snapshot = historyRef.current[index];

    if (!canvas || !snapshot) return;

    restoringHistoryRef.current = true;

    try {
      await canvas.loadFromJSON(snapshot);
      canvas.requestRenderAll();
      historyIndexRef.current = index;
      updateHistoryButtons();
      setTool("select");
    } finally {
      restoringHistoryRef.current = false;
    }
  }

  function undoCanvas() {
    if (historyIndexRef.current <= 0) return;
    void restoreHistory(historyIndexRef.current - 1);
  }

  function redoCanvas() {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    void restoreHistory(historyIndexRef.current + 1);
  }

  useEffect(() => {
    if (!canvasEl.current) return;

    const { width, height } = getCanvasSize();

    const canvas = new fabric.Canvas(canvasEl.current, {
      width,
      height,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
    });

    canvasRef.current = canvas;

    historyRef.current = [JSON.stringify(canvas.toJSON())];
    historyIndexRef.current = 0;
    updateHistoryButtons();

    const scheduleHistory = () => {
      if (restoringHistoryRef.current) return;
      window.setTimeout(() => pushHistorySnapshot(), 0);
    };

    canvas.on("object:added", scheduleHistory);
    canvas.on("object:modified", scheduleHistory);
    canvas.on("object:removed", scheduleHistory);
    canvas.on("path:created", scheduleHistory);
    canvas.on("text:changed", scheduleHistory);

    return () => {
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
      }

      canvas.off("object:added", scheduleHistory);
      canvas.off("object:modified", scheduleHistory);
      canvas.off("object:removed", scheduleHistory);
      canvas.off("path:created", scheduleHistory);
      canvas.off("text:changed", scheduleHistory);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    resizeCanvas();
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    applyTool(tool);
  }, [tool, colour, penSize]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      const meta = event.metaKey || event.ctrlKey;

      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();

        if (event.shiftKey) {
          redoCanvas();
        } else {
          undoCanvas();
        }

        return;
      }

      if (typing) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        const canvas = canvasRef.current;
        if (!canvas?.getActiveObject()) return;

        event.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !freebiesFile) return;
    if (loadedFreebieRef.current === freebiesFile) return;

    loadedFreebieRef.current = freebiesFile;
    loadFreebiesFile(freebiesFile, freebiesType || "link");
  }, [freebiesFile, freebiesType]);

  async function loadFreebiesFile(url: string, type: string) {
    setMessage("Loading freebies file...");

    try {
      if (type === "pdf" || url.toLowerCase().includes(".pdf")) {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Cannot fetch PDF.");
        }

        const arrayBuffer = await response.arrayBuffer();
        await loadPdfFromArrayBuffer(arrayBuffer);
        setMessage("Freebies PDF loaded.");
        return;
      }

      await addImageFromUrl(url, true);
      setImageLink(url);
      setMessage("Freebies image loaded.");
    } catch {
      setMessage(
        "Cannot load this file directly. Please open Google Drive and upload the file manually."
      );
    }
  }

  function applyTool(nextTool: Tool) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = nextTool !== "select";
    canvas.selection = nextTool === "select";

    if (nextTool === "select") {
      canvas.getObjects().forEach((object) => {
        object.selectable = true;
        object.evented = true;
      });
      canvas.requestRenderAll();
      return;
    }

    canvas.getObjects().forEach((object) => {
      object.selectable = false;
      object.evented = false;
    });

    const brush = new fabric.PencilBrush(canvas);

    if (nextTool === "pen") {
      brush.color = colour;
      brush.width = penSize;
    }

    if (nextTool === "marker") {
      brush.color = colour;
      brush.width = penSize + 8;
    }

    if (nextTool === "highlighter") {
      brush.color = "rgba(255, 230, 0, 0.35)";
      brush.width = penSize + 20;
    }

    if (nextTool === "eraser") {
      brush.color = "#ffffff";
      brush.width = penSize + 25;
    }

    canvas.freeDrawingBrush = brush;
    canvas.requestRenderAll();
  }

  async function addImageFromUrl(url: string, asBackground = false) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    try {
      const image = await fabric.FabricImage.fromURL(cleanUrl, {
        crossOrigin: "anonymous",
      });

      const imageWidth = image.width || 800;
      const imageHeight = image.height || 600;

      const canvasWidthNow = canvas.width || canvasWidth;
      const canvasHeightNow = canvas.height || canvasHeight;

      const scale = Math.min(
        canvasWidthNow / imageWidth,
        canvasHeightNow / imageHeight
      );

      const scaledWidth = imageWidth * scale;
      const scaledHeight = imageHeight * scale;

      const centerLeft = (canvasWidthNow - scaledWidth) / 2;
      const centerTop = (canvasHeightNow - scaledHeight) / 2;

      image.set({
        left: asBackground ? centerLeft : 40,
        top: asBackground ? centerTop : 40,
        scaleX: asBackground ? scale : Math.min(0.8, scale),
        scaleY: asBackground ? scale : Math.min(0.8, scale),
        selectable: !asBackground,
        evented: !asBackground,
        borderColor: "#6366f1",
        cornerColor: "#6366f1",
        cornerSize: 16,
        transparentCorners: false,
      });

      if (asBackground) {
        canvas.clear();
        canvas.backgroundColor = "#ffffff";
        canvas.add(image);
        canvas.sendObjectToBack(image);
      } else {
        canvas.add(image);
        canvas.setActiveObject(image);
      }

      canvas.requestRenderAll();
      setTool("select");
    } catch {
      alert(
        "Image cannot be loaded. Use PNG/JPG direct image link or upload image file."
      );
    }
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      addImageFromUrl(String(reader.result), true);
    };

    reader.readAsDataURL(file);
  }

  async function handlePdfUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage("Loading PDF pages...");
    const arrayBuffer = await file.arrayBuffer();
    await loadPdfFromArrayBuffer(arrayBuffer);
  }

  async function loadPdfFromArrayBuffer(arrayBuffer: ArrayBuffer) {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const pdf = await pdfjs.getDocument({
      data: arrayBuffer,
    }).promise;

    const pages: PdfPage[] = [];

    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
      const page = await pdf.getPage(pageNo);
      const viewport = page.getViewport({ scale: 1.6 });

      const tempCanvas = document.createElement("canvas");
      const context = tempCanvas.getContext("2d");

      if (!context) continue;

      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;

      await page.render({
        canvas: tempCanvas,
        canvasContext: context,
        viewport,
      }).promise;

      pages.push({
        pageNo,
        imageUrl: tempCanvas.toDataURL("image/png"),
      });
    }

    setPdfPages(pages);
    setCurrentPage(1);

    if (pages[0]) {
      await addImageFromUrl(pages[0].imageUrl, true);
    }

    setMessage(`PDF loaded. Total pages: ${pages.length}`);
  }

  async function openPdfPage(page: PdfPage) {
    setCurrentPage(page.pageNo);
    await addImageFromUrl(page.imageUrl, true);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      file.arrayBuffer().then((arrayBuffer) => {
        loadPdfFromArrayBuffer(arrayBuffer);
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      addImageFromUrl(String(reader.result), true);
    };

    reader.readAsDataURL(file);
  }

  function addTextBox() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const textbox = new fabric.Textbox("Type here", {
      left: 60,
      top: 80,
      width: 260,
      fontSize: 28,
      fill: "#3730a3",
      fontFamily: "Arial",
      backgroundColor: "rgba(255, 247, 204, 0.95)",
      padding: 12,
      borderColor: "#6366f1",
      cornerColor: "#6366f1",
      cornerSize: 14,
      transparentCorners: false,
      editable: true,
      splitByGrapheme: true,
    });

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    setTool("select");
  }

  function addAnswerBox() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const answer = new fabric.Textbox("", {
      left: 70,
      top: 100,
      width: 280,
      height: 70,
      fontSize: 28,
      fill: "#1e3a8a",
      fontFamily: "Arial",
      backgroundColor: "rgba(255, 251, 230, 0.95)",
      padding: 16,
      borderColor: "#6366f1",
      cornerColor: "#6366f1",
      cornerSize: 14,
      transparentCorners: false,
      editable: true,
      splitByGrapheme: true,
    });

    canvas.add(answer);
    canvas.setActiveObject(answer);
    setTool("select");
  }

  function addRectangle() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = new fabric.Rect({
      left: 80,
      top: 90,
      width: 180,
      height: 110,
      fill: "rgba(255,255,255,0.2)",
      stroke: colour,
      strokeWidth: 5,
      rx: 18,
      ry: 18,
      borderColor: "#6366f1",
      cornerColor: "#6366f1",
      cornerSize: 14,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    setTool("select");
  }

  function addCircle() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const circle = new fabric.Circle({
      left: 90,
      top: 90,
      radius: 70,
      fill: "rgba(255,255,255,0.2)",
      stroke: colour,
      strokeWidth: 5,
      borderColor: "#6366f1",
      cornerColor: "#6366f1",
      cornerSize: 14,
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
    setTool("select");
  }

  function addLine() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const line = new fabric.Line([60, 80, 280, 80], {
      stroke: colour,
      strokeWidth: penSize,
      borderColor: "#6366f1",
      cornerColor: "#6366f1",
      cornerSize: 14,
    });

    canvas.add(line);
    canvas.setActiveObject(line);
    setTool("select");
  }

  function addSticker(sticker: string) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const text = new fabric.Text(sticker, {
      left: 80,
      top: 80,
      fontSize: 60,
      borderColor: "#6366f1",
      cornerColor: "#6366f1",
      cornerSize: 14,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    setTool("select");
  }

  function deleteSelected() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.getActiveObjects().forEach((object) => {
      canvas.remove(object);
    });

    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }

  function duplicateSelected() {
    const canvas = canvasRef.current;
    const object = canvas?.getActiveObject();

    if (!canvas || !object) return;

    object.clone().then((cloned: fabric.Object) => {
      cloned.set({
        left: (object.left || 0) + 30,
        top: (object.top || 0) + 30,
      });

      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  }

  function clearAll() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    canvas.requestRenderAll();
  }

  function saveDraftInBrowser() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const snapshot = JSON.stringify(canvas.toJSON());
    localStorage.setItem(LOCAL_SAVE_KEY, snapshot);
    setAutoSaveStatus("saved");
    setMessage("Draft saved in this browser.");
  }

  async function loadDraftFromBrowser() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const saved = localStorage.getItem(LOCAL_SAVE_KEY);

    if (!saved) {
      setMessage("No saved draft found.");
      return;
    }

    restoringHistoryRef.current = true;

    try {
      await canvas.loadFromJSON(saved);
      canvas.requestRenderAll();

      historyRef.current = [saved];
      historyIndexRef.current = 0;
      updateHistoryButtons();
      setAutoSaveStatus("saved");
      setTool("select");
      setMessage("Draft loaded.");
    } finally {
      restoringHistoryRef.current = false;
    }
  }

  function downloadCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const data = canvas.toDataURL({
      format: "png",
      multiplier: 2,
    });

    const link = document.createElement("a");
    link.href = data;
    link.download = `fd-arcadia-worksheet-page-${currentPage}.png`;
    link.click();
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-3 py-4 text-slate-950 sm:px-5 lg:px-8">
      <section className="mx-auto max-w-[1600px]">
        {/* APP HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/custom-worksheet"
              className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Back to Custom Worksheet"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-indigo-500">
                FD Arcadia Learning Hub
              </p>
              <h1 className="mt-0.5 text-xl font-black tracking-tight sm:text-2xl">
                Draw & Learn Studio
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-700 sm:flex">
              <CheckCircle2 size={13} />
              {autoSaveStatus === "saving" ? "Saving..." : "Auto Saved"}
            </div>

            <div className="rounded-full bg-slate-950 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white">
              Page {currentPage}
            </div>
          </div>
        </header>

        {/* PREMIUM HERO / STATUS */}
        <section className="relative mt-4 overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-5 py-5 text-white shadow-[0_20px_55px_rgba(15,23,42,0.16)] sm:px-6">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300">
                Interactive Worksheet Canvas
              </p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                Draw, write and practise directly on your worksheet.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Upload an image or PDF, annotate it with drawing tools, add text and
                shapes, then save or export your completed page.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:min-w-[330px]">
              <StudioStat label="Canvas" value={`${canvasWidth}×${canvasHeight}`} />
              <StudioStat label="Tool" value={toolLabel(tool)} />
              <StudioStat label="PDF" value={pdfPages.length ? `${pdfPages.length} pages` : "None"} />
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[68px_minmax(0,1fr)_300px]">
          {/* PRIMARY TOOLBAR */}
          <aside className="order-1 rounded-[22px] border border-slate-200 bg-white p-2 shadow-sm xl:sticky xl:top-4 xl:h-fit">
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:flex-col xl:overflow-visible">
              <ToolButton active={tool === "select"} onClick={() => setTool("select")} title="Select">
                <MousePointer2 size={20} />
              </ToolButton>

              <ToolButton active={tool === "pen"} onClick={() => setTool("pen")} title="Pen">
                <Pencil size={20} />
              </ToolButton>

              <ToolButton active={tool === "marker"} onClick={() => setTool("marker")} title="Marker">
                <Brush size={20} />
              </ToolButton>

              <ToolButton
                active={tool === "highlighter"}
                onClick={() => setTool("highlighter")}
                title="Highlighter"
              >
                <Highlighter size={20} />
              </ToolButton>

              <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")} title="Eraser">
                <Eraser size={20} />
              </ToolButton>

              <div className="hidden h-px bg-slate-100 xl:block" />

              <ToolButton onClick={addTextBox} title="Text">
                <Type size={20} />
              </ToolButton>

              <ToolButton onClick={addAnswerBox} title="Answer Box">
                <RectangleHorizontal size={20} />
              </ToolButton>

              <ToolButton danger onClick={deleteSelected} title="Delete Selected">
                <Trash2 size={20} />
              </ToolButton>
            </div>
          </aside>

          {/* CANVAS WORKSPACE */}
          <div className="order-3 min-w-0 xl:order-2">
            <section
              className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Worksheet Workspace
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    Drag & drop a PDF or image here.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={undoCanvas}
                    disabled={!canUndo}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Undo (Ctrl/Cmd + Z)"
                  >
                    <Undo2 size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={redoCanvas}
                    disabled={!canRedo}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Redo (Ctrl/Cmd + Shift + Z)"
                  >
                    <Redo2 size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={saveDraftInBrowser}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <Save size={15} />
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={downloadCanvas}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-black text-white transition hover:bg-slate-800"
                  >
                    <Download size={15} />
                    Export
                  </button>
                </div>
              </div>

              {pdfPages.length > 0 && (
                <div className="mb-3 flex items-center gap-2 overflow-x-auto rounded-xl bg-slate-50 p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <span className="shrink-0 px-2 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Pages
                  </span>
                  {pdfPages.map((page) => (
                    <button
                      key={page.pageNo}
                      type="button"
                      onClick={() => openPdfPage(page)}
                      className={`grid h-9 min-w-9 shrink-0 place-items-center rounded-lg px-2 text-xs font-black transition ${
                        currentPage === page.pageNo
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {page.pageNo}
                    </button>
                  ))}
                </div>
              )}

              <div
                ref={canvasWrapRef}
                className="w-full overflow-auto rounded-[18px] border border-slate-200 bg-slate-100 p-2 shadow-inner sm:p-4"
              >
                <div className="mx-auto w-fit overflow-hidden rounded-lg bg-white shadow-[0_12px_35px_rgba(15,23,42,0.12)]">
                  <canvas ref={canvasEl} className="block touch-none" />
                </div>
              </div>

              {message && (
                <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                  {message}
                </div>
              )}
            </section>
          </div>

          {/* CLEAN SETTINGS PANEL */}
          <aside className="order-2 space-y-3 xl:order-3 xl:sticky xl:top-4 xl:h-fit">
            <Panel title="Import">
              <div className="grid grid-cols-2 gap-2">
                <label className="studio-action cursor-pointer">
                  <Upload size={16} />
                  Image
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                <label className="studio-action cursor-pointer">
                  <Upload size={16} />
                  PDF
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                </label>
              </div>

              <div className="mt-2 flex gap-2">
                <input
                  value={imageLink}
                  onChange={(event) => setImageLink(event.target.value)}
                  placeholder="Direct image URL"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none transition focus:border-indigo-300 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => addImageFromUrl(imageLink, false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white"
                  title="Add image link"
                >
                  <Link2 size={16} />
                </button>
              </div>
            </Panel>

            <Panel title="Drawing">
              <div className="flex flex-wrap gap-2">
                {colours.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setColour(item)}
                    className={`h-8 w-8 rounded-full border-[3px] transition ${
                      colour === item
                        ? "scale-110 border-indigo-500 shadow-sm"
                        : "border-white ring-1 ring-slate-200"
                    }`}
                    style={{ backgroundColor: item }}
                    title={item}
                  />
                ))}
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                  <span>Brush Size</span>
                  <span>{penSize}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={penSize}
                  onChange={(event) => setPenSize(Number(event.target.value))}
                  className="w-full"
                />
              </div>
            </Panel>

            <Panel title="Objects">
              <div className="grid grid-cols-3 gap-2">
                <SmallAction onClick={addRectangle} label="Rect">
                  <RectangleHorizontal size={17} />
                </SmallAction>
                <SmallAction onClick={addCircle} label="Circle">
                  <Circle size={17} />
                </SmallAction>
                <SmallAction onClick={addLine} label="Line">
                  <Minus size={17} />
                </SmallAction>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <SmallAction onClick={duplicateSelected} label="Duplicate">
                  <Copy size={17} />
                </SmallAction>
                <SmallAction onClick={deleteSelected} label="Delete" danger>
                  <Trash2 size={17} />
                </SmallAction>
              </div>
            </Panel>

            <Panel title="Page">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updatePageSize(794, 1123)}
                  className="studio-action"
                >
                  Portrait
                </button>
                <button
                  type="button"
                  onClick={() => updatePageSize(1123, 794)}
                  className="studio-action"
                >
                  Landscape
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updatePageSize(canvasWidth + 100, canvasHeight + 100)}
                  className="studio-action"
                >
                  Bigger
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updatePageSize(
                      Math.max(400, canvasWidth - 100),
                      Math.max(400, canvasHeight - 100),
                    )
                  }
                  className="studio-action"
                >
                  Smaller
                </button>
              </div>
            </Panel>

            <Panel title="Stickers">
              <div className="grid grid-cols-4 gap-2">
                {stickers.map((sticker) => (
                  <button
                    key={sticker}
                    type="button"
                    onClick={() => addSticker(sticker)}
                    className="grid h-10 place-items-center rounded-xl border border-slate-200 bg-white text-lg transition hover:bg-slate-50"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Draft">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={saveDraftInBrowser} className="studio-action">
                  <Save size={15} />
                  Save
                </button>
                <button type="button" onClick={loadDraftFromBrowser} className="studio-action">
                  Load
                </button>
              </div>

              <button
                type="button"
                onClick={clearAll}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-black text-red-600 transition hover:bg-red-100"
              >
                <RotateCcw size={15} />
                Clear Canvas
              </button>
            </Panel>
          </aside>
        </div>
      </section>
    </main>
  );
}

function ToolButton({
  children,
  onClick,
  active = false,
  danger = false,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition ${
        danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : active
          ? "bg-indigo-600 text-white shadow-sm"
          : "bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
      }`}
    >
      {children}
    </button>
  );
}

function toolLabel(tool: Tool) {
  if (tool === "select") return "Select";
  if (tool === "pen") return "Pen";
  if (tool === "marker") return "Marker";
  if (tool === "highlighter") return "Highlight";
  return "Eraser";
}

function StudioStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-3 text-center backdrop-blur">
      <p className="truncate text-sm font-black text-white">{value}</p>
      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-3.5 shadow-sm">
      <p className="mb-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
      {children}
    </section>
  );
}

function SmallAction({
  children,
  label,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border text-[10px] font-black transition ${
        danger
          ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
      }`}
    >
      {children}
      {label}
    </button>
  );
}
