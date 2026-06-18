"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import {
  Circle,
  Copy,
  Download,
  Eraser,
  Highlighter,
  Link2,
  MousePointer2,
  Pencil,
  RectangleHorizontal,
  RotateCcw,
  Save,
  Trash2,
  Type,
  Upload,
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
          <WorksheetCanvas />
        </>
      )}
    </ProtectedPage>
  );
}

function WorksheetCanvas() {
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);

  const [tool, setTool] = useState<Tool>("select");
  const [colour, setColour] = useState("#2563eb");
  const [penSize, setPenSize] = useState(5);
  const [imageLink, setImageLink] = useState("");
  const [pdfPages, setPdfPages] = useState<PdfPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!canvasEl.current) return;

    const canvas = new fabric.Canvas(canvasEl.current, {
      width: 1200,
      height: 850,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
    });

    canvasRef.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    applyTool(tool);
  }, [tool, colour, penSize]);

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

      const scale = Math.min(
        canvas.width! / image.width!,
        canvas.height! / image.height!
      );

      image.set({
        left: asBackground ? 0 : 80,
        top: asBackground ? 0 : 80,
        scaleX: asBackground ? scale : 0.8,
        scaleY: asBackground ? scale : 0.8,
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
      alert("Image cannot be loaded. Use PNG/JPG direct image link or upload image file.");
    }
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      addImageFromUrl(String(reader.result), false);
    };

    reader.readAsDataURL(file);
  }

  async function handlePdfUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage("Loading PDF pages...");

    const arrayBuffer = await file.arrayBuffer();
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    pdfjs.GlobalWorkerOptions.workerSrc = "";

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
      const input = {
        target: { files: [file] },
      } as unknown as ChangeEvent<HTMLInputElement>;

      handlePdfUpload(input);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      addImageFromUrl(String(reader.result), false);
    };

    reader.readAsDataURL(file);
  }

  function addTextBox() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const textbox = new fabric.Textbox("Type here", {
      left: 120,
      top: 120,
      width: 320,
      fontSize: 34,
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
      left: 140,
      top: 160,
      width: 360,
      height: 80,
      fontSize: 34,
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
      left: 160,
      top: 160,
      width: 220,
      height: 140,
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
      left: 180,
      top: 180,
      radius: 80,
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

    const line = new fabric.Line([100, 100, 380, 100], {
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
      left: 160,
      top: 160,
      fontSize: 74,
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

    localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(canvas.toJSON()));
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

    await canvas.loadFromJSON(saved);
    canvas.requestRenderAll();
    setMessage("Draft loaded.");
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
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-indigo-50 px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 p-7 text-white shadow-2xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-yellow-200">
                FD Arcadia
              </p>
              <h1 className="mt-2 text-4xl font-black md:text-6xl">
                Draw & Learn Studio
              </h1>
              <p className="mt-3 max-w-2xl text-indigo-50">
                Upload worksheet, draw, type, add shapes, stickers and download your edited page.
              </p>
            </div>

            <div className="rounded-3xl bg-white/20 px-5 py-3 text-sm font-bold backdrop-blur">
              Page {currentPage}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[88px_1fr]">
          <aside className="sticky top-24 h-fit rounded-[2rem] border border-white/70 bg-white/80 p-3 shadow-xl backdrop-blur">
            <div className="grid gap-3">
              <ToolButton active={tool === "select"} onClick={() => setTool("select")} title="Select">
                <MousePointer2 size={26} />
              </ToolButton>

              <ToolButton active={tool === "pen"} onClick={() => setTool("pen")} title="Pen">
                <Pencil size={26} />
              </ToolButton>

              <ToolButton active={tool === "marker"} onClick={() => setTool("marker")} title="Marker">
                <Brush size={26} />
              </ToolButton>

              <ToolButton active={tool === "highlighter"} onClick={() => setTool("highlighter")} title="Highlighter">
                <Highlighter size={26} />
              </ToolButton>

              <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")} title="Eraser">
                <Eraser size={26} />
              </ToolButton>

              <ToolButton onClick={addTextBox} title="Text">
                <Type size={26} />
              </ToolButton>

              <ToolButton onClick={addAnswerBox} title="Answer Box">
                <RectangleHorizontal size={26} />
              </ToolButton>

              <ToolButton danger onClick={deleteSelected} title="Delete Selected">
                <Trash2 size={26} />
              </ToolButton>
            </div>
          </aside>

          <div className="space-y-5">
            <section className="rounded-[2.5rem] border border-white/80 bg-white/90 p-5 shadow-xl backdrop-blur">
              <div className="flex flex-wrap items-center gap-3">
                <label className="premium-action bg-indigo-100 text-indigo-700">
                  <Upload size={18} /> Image
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                <label className="premium-action bg-pink-100 text-pink-700">
                  <Upload size={18} /> PDF
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                </label>

                <button onClick={addRectangle} className="premium-action bg-rose-100 text-rose-700">
                  <RectangleHorizontal size={18} /> Rect
                </button>

                <button onClick={addCircle} className="premium-action bg-emerald-100 text-emerald-700">
                  <Circle size={18} /> Circle
                </button>

                <button onClick={addLine} className="premium-action bg-orange-100 text-orange-700">
                  <Minus size={18} /> Line
                </button>

                <button onClick={duplicateSelected} className="premium-action bg-sky-100 text-sky-700">
                  <Copy size={18} /> Copy
                </button>

                <button onClick={saveDraftInBrowser} className="premium-action bg-yellow-100 text-yellow-800">
                  <Save size={18} /> Save
                </button>

                <button onClick={loadDraftFromBrowser} className="premium-action bg-slate-100 text-slate-700">
                  Load
                </button>

                <button onClick={clearAll} className="premium-action bg-slate-100 text-slate-700">
                  <RotateCcw size={18} /> Clear
                </button>

                <button onClick={downloadCanvas} className="premium-action bg-emerald-600 text-white">
                  <Download size={18} /> Download
                </button>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-[2rem] bg-indigo-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {colours.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setColour(item)}
                        className={`h-10 w-10 rounded-full border-4 transition ${
                          colour === item
                            ? "scale-110 border-indigo-600 shadow-lg"
                            : "border-white"
                        }`}
                        style={{ backgroundColor: item }}
                        title={item}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] bg-yellow-50 p-4">
                  <div className="flex items-center gap-4">
                    <span className="min-w-16 font-bold text-yellow-800">
                      Size {penSize}
                    </span>
                    <input
                      type="range"
                      min="2"
                      max="50"
                      value={penSize}
                      onChange={(event) => setPenSize(Number(event.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 md:flex-row">
                <input
                  value={imageLink}
                  onChange={(event) => setImageLink(event.target.value)}
                  placeholder="Paste direct PNG / JPG image link"
                  className="w-full rounded-[1.5rem] border border-indigo-100 bg-white px-5 py-4 outline-none ring-indigo-200 transition focus:ring-4"
                />

                <button
                  type="button"
                  onClick={() => addImageFromUrl(imageLink, false)}
                  className="rounded-[1.5rem] bg-indigo-600 px-6 py-4 font-bold text-white shadow-lg transition hover:bg-indigo-700"
                >
                  <Link2 className="inline" size={18} /> Add
                </button>
              </div>

              {pdfPages.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {pdfPages.map((page) => (
                    <button
                      key={page.pageNo}
                      onClick={() => openPdfPage(page)}
                      className={`rounded-2xl px-4 py-3 font-bold transition ${
                        currentPage === page.pageNo
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      }`}
                    >
                      {page.pageNo}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {stickers.map((sticker) => (
                  <button
                    key={sticker}
                    type="button"
                    onClick={() => addSticker(sticker)}
                    className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-md transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {sticker}
                  </button>
                ))}
              </div>

              {message && (
                <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 font-medium text-emerald-700">
                  {message}
                </div>
              )}
            </section>

            <section
              className="rounded-[2.5rem] border border-white/80 bg-white/90 p-4 shadow-xl backdrop-blur"
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
            >
              <p className="mb-3 text-center text-sm font-medium text-slate-500">
                Drag & drop PDF or image here. Select object to move, resize or delete.
              </p>

              <div className="overflow-auto rounded-[2rem] border-2 border-indigo-100 bg-white shadow-inner">
                <canvas ref={canvasEl} />
              </div>
            </section>
          </div>
        </section>
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
      className={`grid h-14 w-14 place-items-center rounded-2xl transition hover:-translate-y-1 ${
        danger
          ? "bg-red-100 text-red-700 shadow-md hover:bg-red-200"
          : active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
          : "bg-white text-slate-700 shadow-md hover:bg-indigo-50 hover:text-indigo-700"
      }`}
    >
      {children}
    </button>
  );
}