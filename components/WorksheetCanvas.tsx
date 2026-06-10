"use client";

import {
  BookOpen,
  CheckSquare,
  Circle,
  ClipboardCheck,
  Download,
  Eraser,
  FileText,
  FolderUp,
  Home,
  LibraryBig,
  Link2,
  Lock,
  Minus,
  MousePointer2,
  Move,
  Palette,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Square,
  Stars,
  Trash2,
  Type,
  Undo2,
  Unlock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import BrandLogo from "@/components/BrandLogo";

type BrushLike = {
  color: string;
  width: number;
};

type FabricObjectLike = {
  scale: (value: number) => void;
  set: (options: Record<string, unknown>) => void;
};

type FabricCanvasLike = {
  backgroundColor: string;
  clear: () => void;
  discardActiveObject: () => void;
  dispose: () => void;
  freeDrawingBrush?: BrushLike;
  getActiveObjects: () => FabricObjectLike[];
  isDrawingMode: boolean;
  loadFromJSON: (json: unknown) => Promise<FabricCanvasLike>;
  on: (event: string, handler: () => void) => void;
  remove: (...objects: FabricObjectLike[]) => void;
  renderAll: () => void;
  requestRenderAll: () => void;
  sendObjectToBack: (object: FabricObjectLike) => void;
  setActiveObject: (object: FabricObjectLike) => void;
  setDimensions: (dimensions: { height: number; width: number }) => void;
  toDataURL: (options: { format: "png"; multiplier: number }) => string;
  toJSON: () => unknown;
  add: (...objects: FabricObjectLike[]) => void;
};

type FabricModuleLike = {
  Canvas: new (
    element: HTMLCanvasElement,
    options: Record<string, unknown>
  ) => FabricCanvasLike;
  Circle: new (options: Record<string, unknown>) => FabricObjectLike;
  FabricImage: {
    fromURL: (url: string) => Promise<FabricObjectLike>;
  };
  IText: new (text: string, options: Record<string, unknown>) => FabricObjectLike;
  Line: new (points: number[], options: Record<string, unknown>) => FabricObjectLike;
  PencilBrush: new (canvas: FabricCanvasLike) => BrushLike;
  Rect: new (options: Record<string, unknown>) => FabricObjectLike;
};

type PdfModuleLike = {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (options: { data: Uint8Array }) => {
    promise: Promise<{
      getPage: (pageNumber: number) => Promise<{
        getViewport: (options: { scale: number }) => { height: number; width: number };
        render: (options: {
          canvasContext: CanvasRenderingContext2D;
          viewport: { height: number; width: number };
        }) => { promise: Promise<void> };
      }>;
      numPages: number;
    }>;
  };
};

type PreparedWorksheetImage = {
  cropped: boolean;
  dataUrl: string;
  height: number;
  width: number;
};

const pdfWorkerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
const portraitCanvas = { height: 1123, label: "Portrait", width: 794 };

const colors = [
  "#4c57a9",
  "#cc1400",
  "#ffad33",
  "#ffec87",
  "#6baa75",
  "#c28cae",
  "#967cc7",
  "#6698cc",
];

const stickers = [
  { label: "Star", path: "/stickers/star.svg" },
  { label: "Smile", path: "/stickers/smile.svg" },
  { label: "Heart", path: "/stickers/heart.svg" },
  { label: "Trophy", path: "/stickers/trophy.svg" },
];

export default function WorksheetCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvasLike | null>(null);
  const historyRef = useRef<string[]>([]);
  const redoRef = useRef<string[]>([]);
  const skipHistoryRef = useRef(false);
  const pdfBytesRef = useRef<Uint8Array | null>(null);
  const worksheetBackgroundRef = useRef<FabricObjectLike | null>(null);

  const [fabricLib, setFabricLib] = useState<FabricModuleLike | null>(null);
  const [activeTool, setActiveTool] = useState("draw");
  const [brushColor, setBrushColor] = useState("#4c57a9");
  const [brushSize, setBrushSize] = useState(5);
  const [exportFileName, setExportFileName] = useState("fd-arcadia-worksheet");
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [selectedPdfPage, setSelectedPdfPage] = useState(1);
  const [pdfStatus, setPdfStatus] = useState("");
  const [canvasSize, setCanvasSize] = useState(portraitCanvas);
  const [zoom, setZoom] = useState(35);
  const [hasWorksheetLayer, setHasWorksheetLayer] = useState(false);
  const [isWorksheetLocked, setIsWorksheetLocked] = useState(false);

  const updateZoom = (value: number) => {
    setZoom(Math.min(100, Math.max(20, value)));
  };

  const saveHistory = useCallback(() => {
    const canvas = fabricCanvasRef.current;

    if (!canvas || skipHistoryRef.current) return;

    const json = JSON.stringify(canvas.toJSON());
    const previous = historyRef.current[historyRef.current.length - 1];

    if (json === previous) return;

    historyRef.current.push(json);
    redoRef.current = [];

    if (historyRef.current.length > 40) {
      historyRef.current.shift();
    }
  }, []);

  const configureBrush = useCallback((color = brushColor, width = brushSize) => {
    const canvas = fabricCanvasRef.current;

    if (!canvas?.freeDrawingBrush) return;

    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = width;
  }, [brushColor, brushSize]);

  useEffect(() => {
    let canvas: FabricCanvasLike | null = null;

    const initCanvas = async () => {
      const fabric = (await import("fabric")) as unknown as FabricModuleLike;

      setFabricLib(fabric);

      if (!canvasRef.current) return;

      canvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        height: portraitCanvas.height,
        preserveObjectStacking: true,
        width: portraitCanvas.width,
      });

      const brush = new fabric.PencilBrush(canvas);
      brush.color = "#4c57a9";
      brush.width = 5;

      canvas.freeDrawingBrush = brush;
      canvas.isDrawingMode = true;
      fabricCanvasRef.current = canvas;

      saveHistory();

      canvas.on("object:added", saveHistory);
      canvas.on("object:modified", saveHistory);
      canvas.on("object:removed", saveHistory);

      console.log("FD Arcadia Worksheet Studio Ready");
    };

    initCanvas();

    return () => {
      canvas?.dispose();
    };
  }, [saveHistory]);

  useEffect(() => {
    configureBrush(brushColor, brushSize);
  }, [brushColor, brushSize, configureBrush]);

  async function restoreState(state: string) {
    const canvas = fabricCanvasRef.current;

    if (!canvas) return;

    skipHistoryRef.current = true;
    await canvas.loadFromJSON(JSON.parse(state));
    canvas.renderAll();
    skipHistoryRef.current = false;
  }

  async function undo() {
    if (historyRef.current.length < 2) return;

    const current = historyRef.current.pop();

    if (current) redoRef.current.push(current);

    const previous = historyRef.current[historyRef.current.length - 1];

    if (previous) await restoreState(previous);
  }

  async function redo() {
    const state = redoRef.current.pop();

    if (!state) return;

    historyRef.current.push(state);
    await restoreState(state);
  }

  function enableSelect() {
    const canvas = fabricCanvasRef.current;

    if (!canvas) return;

    canvas.isDrawingMode = false;
    setActiveTool("select");
  }

  function enableDraw() {
    const canvas = fabricCanvasRef.current;

    if (!canvas) return;

    canvas.isDrawingMode = true;
    setActiveTool("draw");
    configureBrush(brushColor, brushSize);
  }

  function enableEraser() {
    const canvas = fabricCanvasRef.current;

    if (!canvas) return;

    canvas.isDrawingMode = true;
    setActiveTool("eraser");
    configureBrush("#ffffff", Math.max(brushSize * 3, 18));
  }

  function addText() {
    const canvas = fabricCanvasRef.current;

    if (!canvas || !fabricLib) return;

    canvas.isDrawingMode = false;
    setActiveTool("select");

    const text = new fabricLib.IText("Type here", {
      fill: brushColor,
      fontFamily: "Arial",
      fontSize: 34,
      fontWeight: 700,
      left: 120,
      top: 140,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
  }

  function addRectangle() {
    const canvas = fabricCanvasRef.current;

    if (!canvas || !fabricLib) return;

    canvas.isDrawingMode = false;
    setActiveTool("select");

    const rect = new fabricLib.Rect({
      fill: `${brushColor}22`,
      height: 120,
      left: 130,
      rx: 16,
      ry: 16,
      stroke: brushColor,
      strokeWidth: 4,
      top: 170,
      width: 210,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
  }

  function addCircle() {
    const canvas = fabricCanvasRef.current;

    if (!canvas || !fabricLib) return;

    canvas.isDrawingMode = false;
    setActiveTool("select");

    const circle = new fabricLib.Circle({
      fill: `${brushColor}22`,
      left: 160,
      radius: 62,
      stroke: brushColor,
      strokeWidth: 4,
      top: 180,
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
  }

  function addDragDropElement() {
    const canvas = fabricCanvasRef.current;

    if (!canvas || !fabricLib) return;

    canvas.isDrawingMode = false;
    setActiveTool("select");

    const dropBox = new fabricLib.Rect({
      fill: "#ffffff",
      height: 74,
      left: 330,
      rx: 14,
      ry: 14,
      stroke: brushColor,
      strokeDashArray: [12, 8],
      strokeWidth: 4,
      top: 180,
      width: 230,
    });

    const answerCard = new fabricLib.Rect({
      fill: "#ffffff",
      height: 58,
      left: 110,
      rx: 18,
      ry: 18,
      shadow: "0 12px 26px rgba(76,87,169,0.16)",
      stroke: `${brushColor}66`,
      strokeWidth: 3,
      top: 188,
      width: 170,
    });

    const answerText = new fabricLib.IText("Drag answer", {
      fill: "#30366f",
      fontFamily: "Arial",
      fontSize: 22,
      fontWeight: 800,
      left: 130,
      top: 204,
    });

    const prompt = new fabricLib.IText("Drop here", {
      fill: brushColor,
      fontFamily: "Arial",
      fontSize: 22,
      fontWeight: 800,
      left: 392,
      top: 204,
    });

    canvas.add(dropBox, answerCard, answerText, prompt);
    canvas.setActiveObject(answerCard);
    canvas.requestRenderAll();
  }

  function addJoinElement() {
    const canvas = fabricCanvasRef.current;

    if (!canvas || !fabricLib) return;

    canvas.isDrawingMode = false;
    setActiveTool("select");

    const leftDot = new fabricLib.Circle({
      fill: brushColor,
      left: 190,
      radius: 11,
      top: 315,
    });

    const rightDot = new fabricLib.Circle({
      fill: brushColor,
      left: 500,
      radius: 11,
      top: 315,
    });

    const connector = new fabricLib.Line([218, 326, 500, 326], {
      fill: brushColor,
      stroke: brushColor,
      strokeDashArray: [14, 10],
      strokeWidth: 5,
    });

    const leftText = new fabricLib.IText("Item A", {
      fill: "#30366f",
      fontFamily: "Arial",
      fontSize: 24,
      fontWeight: 800,
      left: 110,
      top: 300,
    });

    const rightText = new fabricLib.IText("Match 1", {
      fill: "#30366f",
      fontFamily: "Arial",
      fontSize: 24,
      fontWeight: 800,
      left: 530,
      top: 300,
    });

    canvas.add(connector, leftDot, rightDot, leftText, rightText);
    canvas.setActiveObject(connector);
    canvas.requestRenderAll();
  }

  function addCheckboxElement() {
    const canvas = fabricCanvasRef.current;

    if (!canvas || !fabricLib) return;

    canvas.isDrawingMode = false;
    setActiveTool("select");

    const checkbox = new fabricLib.Rect({
      fill: "#ffffff",
      height: 42,
      left: 118,
      rx: 8,
      ry: 8,
      stroke: brushColor,
      strokeWidth: 4,
      top: 420,
      width: 42,
    });

    const label = new fabricLib.IText("Checkbox answer", {
      fill: "#30366f",
      fontFamily: "Arial",
      fontSize: 25,
      fontWeight: 800,
      left: 180,
      top: 424,
    });

    canvas.add(checkbox, label);
    canvas.setActiveObject(label);
    canvas.requestRenderAll();
  }

  async function addSticker(stickerPath: string) {
    const canvas = fabricCanvasRef.current;

    if (!canvas || !fabricLib) return;

    canvas.isDrawingMode = false;
    setActiveTool("select");

    const img = await fabricLib.FabricImage.fromURL(stickerPath);

    img.set({
      left: 230,
      top: 220,
    });
    img.scale(0.26);

    canvas.add(img);
    canvas.setActiveObject(img);
  }

  async function uploadSticker(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    await addSticker(URL.createObjectURL(file));
    e.target.value = "";
  }

  function cropBlankWorksheetSpace(sourceCanvas: HTMLCanvasElement): PreparedWorksheetImage {
    const context = sourceCanvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      return {
        cropped: false,
        dataUrl: sourceCanvas.toDataURL("image/png"),
        height: sourceCanvas.height,
        width: sourceCanvas.width,
      };
    }

    const { data, height, width } = context.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];
        const red = data[index];
        const green = data[index + 1];
        const blue = data[index + 2];
        const hasContent = alpha > 16 && (red < 246 || green < 246 || blue < 246);

        if (hasContent) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (minX > maxX || minY > maxY) {
      return {
        cropped: false,
        dataUrl: sourceCanvas.toDataURL("image/png"),
        height,
        width,
      };
    }

    const padding = Math.round(Math.min(width, height) * 0.035);
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropRight = Math.min(width, maxX + padding);
    const cropBottom = Math.min(height, maxY + padding);
    const cropWidth = cropRight - cropX + 1;
    const cropHeight = cropBottom - cropY + 1;
    const removedOuterBlank =
      cropWidth < width * 0.96 || cropHeight < height * 0.96 || cropX > padding || cropY > padding;

    if (!removedOuterBlank) {
      return {
        cropped: false,
        dataUrl: sourceCanvas.toDataURL("image/png"),
        height,
        width,
      };
    }

    const croppedCanvas = document.createElement("canvas");
    const croppedContext = croppedCanvas.getContext("2d");

    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    if (!croppedContext) {
      return {
        cropped: false,
        dataUrl: sourceCanvas.toDataURL("image/png"),
        height,
        width,
      };
    }

    croppedContext.fillStyle = "#ffffff";
    croppedContext.fillRect(0, 0, cropWidth, cropHeight);
    croppedContext.drawImage(
      sourceCanvas,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    return {
      cropped: true,
      dataUrl: croppedCanvas.toDataURL("image/png"),
      height: cropHeight,
      width: cropWidth,
    };
  }

  function prepareImageWorksheet(image: HTMLImageElement): PreparedWorksheetImage {
    const imageCanvas = document.createElement("canvas");
    const context = imageCanvas.getContext("2d");

    imageCanvas.width = image.naturalWidth;
    imageCanvas.height = image.naturalHeight;

    if (!context) {
      return {
        cropped: false,
        dataUrl: image.src,
        height: image.naturalHeight,
        width: image.naturalWidth,
      };
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
    context.drawImage(image, 0, 0);

    return cropBlankWorksheetSpace(imageCanvas);
  }

  function resizeCanvasForWorksheet(sourceWidth: number, sourceHeight: number) {
    const canvas = fabricCanvasRef.current;
    const maxLongSide = 1400;
    const scale = Math.min(1, maxLongSide / Math.max(sourceWidth, sourceHeight));
    const nextSize = {
      height: Math.round(sourceHeight * scale),
      label: sourceWidth > sourceHeight ? "Landscape" : "Portrait",
      width: Math.round(sourceWidth * scale),
    };

    if (!canvas) return nextSize;

    canvas.setDimensions({
      height: nextSize.height,
      width: nextSize.width,
    });
    setCanvasSize(nextSize);

    return nextSize;
  }

  function toggleWorksheetLock() {
    const canvas = fabricCanvasRef.current;
    const worksheetLayer = worksheetBackgroundRef.current;

    if (!canvas || !worksheetLayer) return;

    const nextLocked = !isWorksheetLocked;

    worksheetLayer.set({
      evented: !nextLocked,
      hasControls: !nextLocked,
      lockMovementX: nextLocked,
      lockMovementY: nextLocked,
      lockRotation: nextLocked,
      lockScalingFlip: nextLocked,
      lockScalingX: nextLocked,
      lockScalingY: nextLocked,
      selectable: !nextLocked,
    });

    if (nextLocked) {
      canvas.discardActiveObject();
    } else {
      canvas.setActiveObject(worksheetLayer);
      canvas.isDrawingMode = false;
      setActiveTool("select");
    }

    setIsWorksheetLocked(nextLocked);
    canvas.requestRenderAll();
  }

  async function addWorksheetImage(
    imageUrl: string,
    sourceSize: { height: number; width: number }
  ) {
    const canvas = fabricCanvasRef.current;

    if (!canvas || !fabricLib) return;

    const targetSize = resizeCanvasForWorksheet(sourceSize.width, sourceSize.height);

    if (worksheetBackgroundRef.current) {
      skipHistoryRef.current = true;
      canvas.remove(worksheetBackgroundRef.current);
      skipHistoryRef.current = false;
      worksheetBackgroundRef.current = null;
      setHasWorksheetLayer(false);
      setIsWorksheetLocked(false);
    }

    const img = await fabricLib.FabricImage.fromURL(imageUrl);

    canvas.isDrawingMode = false;
    setActiveTool("select");

    const scale = targetSize.width / sourceSize.width;

    img.scale(scale);
    img.set({
      borderColor: "#4c57a9",
      cornerColor: "#4c57a9",
      cornerStyle: "circle",
      evented: true,
      left: targetSize.width / 2,
      opacity: 1,
      originX: "center",
      originY: "center",
      selectable: true,
      top: targetSize.height / 2,
      transparentCorners: false,
    });

    canvas.add(img);
    canvas.sendObjectToBack(img);
    canvas.setActiveObject(img);
    worksheetBackgroundRef.current = img;
    setHasWorksheetLayer(true);
    setIsWorksheetLocked(false);
    canvas.requestRenderAll();
    saveHistory();
  }

  async function renderPdfPage(pageNumber: number) {
    const bytes = pdfBytesRef.current;

    if (!bytes || !fabricLib) return;

    setPdfStatus(`Loading page ${pageNumber}...`);

    const pdfjs = (await import("pdfjs-dist")) as unknown as PdfModuleLike;
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

    const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2 });
    const pdfCanvas = document.createElement("canvas");
    const context = pdfCanvas.getContext("2d");

    if (!context) return;

    pdfCanvas.width = viewport.width;
    pdfCanvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    const preparedWorksheet = cropBlankWorksheetSpace(pdfCanvas);

    await addWorksheetImage(preparedWorksheet.dataUrl, {
      height: preparedWorksheet.height,
      width: preparedWorksheet.width,
    });
    setSelectedPdfPage(pageNumber);
    setPdfStatus(
      `Selected page ${pageNumber} of ${pdf.numPages}. Auto ${preparedWorksheet.width > preparedWorksheet.height ? "landscape" : "portrait"}${preparedWorksheet.cropped ? ", fitted to worksheet content" : ""}.`
    );
  }

  async function uploadWorksheet(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setExportFileName(file.name.replace(/\.[^/.]+$/, "") || "fd-arcadia-worksheet");

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const pdfjs = (await import("pdfjs-dist")) as unknown as PdfModuleLike;
      const bytes = new Uint8Array(await file.arrayBuffer());

      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
      pdfBytesRef.current = bytes;

      const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;

      setPdfFileName(file.name);
      setPdfPageCount(pdf.numPages);
      setSelectedPdfPage(1);
      setPdfStatus(`${file.name} loaded. Page 1 selected.`);

      await renderPdfPage(1);
      e.target.value = "";
      return;
    }

    pdfBytesRef.current = null;
    setPdfFileName("");
    setPdfPageCount(0);
    setPdfStatus("Image worksheet selected.");

    const imageUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.src = imageUrl;
    await image.decode();
    const preparedWorksheet = prepareImageWorksheet(image);

    await addWorksheetImage(preparedWorksheet.dataUrl, {
      height: preparedWorksheet.height,
      width: preparedWorksheet.width,
    });
    setPdfStatus(
      `Image worksheet selected${preparedWorksheet.cropped ? " and fitted to worksheet content" : ""}.`
    );
    e.target.value = "";
  }

  function deleteSelected() {
    const canvas = fabricCanvasRef.current;

    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();

    if (!activeObjects.length) return;

    if (worksheetBackgroundRef.current && activeObjects.includes(worksheetBackgroundRef.current)) {
      worksheetBackgroundRef.current = null;
      setHasWorksheetLayer(false);
      setIsWorksheetLocked(false);
    }

    canvas.remove(...activeObjects);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }

  function clearCanvas() {
    const canvas = fabricCanvasRef.current;

    if (!canvas || !window.confirm("Clear this worksheet canvas?")) return;

    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    canvas.setDimensions({
      height: portraitCanvas.height,
      width: portraitCanvas.width,
    });
    setCanvasSize(portraitCanvas);
    setZoom(35);
    worksheetBackgroundRef.current = null;
    setHasWorksheetLayer(false);
    setIsWorksheetLocked(false);
    pdfBytesRef.current = null;
    setPdfFileName("");
    setPdfPageCount(0);
    setPdfStatus("");
    canvas.renderAll();
    saveHistory();
  }

  function savePNG() {
    const canvas = fabricCanvasRef.current;

    if (!canvas) return;

    const url = canvas.toDataURL({
      format: "png",
      multiplier: 2,
    });

    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportFileName.trim() || "fd-arcadia-worksheet"}.png`;
    link.click();
  }

  const toolButtonClass = (tool: string) =>
    `group grid size-12 place-items-center rounded-lg border transition ${
      activeTool === tool
        ? "border-[var(--fd-blue)] bg-[var(--fd-blue)] text-white shadow-[0_14px_34px_rgba(76,87,169,0.22)]"
        : "border-[var(--fd-blue)]/10 bg-white text-[var(--fd-blue)] hover:-translate-y-0.5 hover:border-[var(--fd-blue)]/25"
    }`;

  return (
    <div className="min-h-screen bg-[var(--fd-cream)] text-[var(--fd-ink)]">
      <style>
        {`
          .worksheet-canvas-viewport > .canvas-container {
            height: var(--worksheet-canvas-height) !important;
            transform: scale(var(--worksheet-canvas-scale));
            transform-origin: top left;
            width: var(--worksheet-canvas-width) !important;
          }
        `}
      </style>
      <header className="sticky top-0 z-20 border-b border-[var(--fd-blue)]/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-4">
            <BrandLogo imageClassName="h-12 w-24" label="" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--fd-green)]">
                FD Arcadia Studio
              </p>
              <h1 className="text-xl font-black tracking-normal">Premium Worksheet Canvas</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--fd-blue)]/15 bg-white px-4 py-3 text-sm font-black text-[var(--fd-blue)] shadow-sm transition hover:-translate-y-0.5"
            >
              <Home size={18} aria-hidden="true" />
              Parent Dashboard
            </Link>
            <button
              onClick={savePNG}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--fd-red)] px-4 py-3 text-sm font-black text-white shadow-[0_16px_38px_rgba(204,20,0,0.2)] transition hover:-translate-y-0.5"
            >
              <Download size={18} aria-hidden="true" />
              Export PNG
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[260px_1fr_260px]">
        <aside className="space-y-4">
          <section className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-4 shadow-[0_18px_48px_rgba(76,87,169,0.08)]">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--fd-blue)]/70">
              Tools
            </p>
            <div className="grid grid-cols-4 gap-3 lg:grid-cols-3">
              <button className={toolButtonClass("select")} onClick={enableSelect} title="Select">
                <MousePointer2 size={21} aria-hidden="true" />
              </button>
              <button className={toolButtonClass("draw")} onClick={enableDraw} title="Draw">
                <Pencil size={21} aria-hidden="true" />
              </button>
              <button className={toolButtonClass("eraser")} onClick={enableEraser} title="Eraser">
                <Eraser size={21} aria-hidden="true" />
              </button>
              <button className={toolButtonClass("text")} onClick={addText} title="Text">
                <Type size={21} aria-hidden="true" />
              </button>
              <button className={toolButtonClass("rect")} onClick={addRectangle} title="Rectangle">
                <Square size={21} aria-hidden="true" />
              </button>
              <button className={toolButtonClass("circle")} onClick={addCircle} title="Circle">
                <Circle size={21} aria-hidden="true" />
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-4 shadow-[0_18px_48px_rgba(76,87,169,0.08)]">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--fd-blue)]/70">
              Activity elements
            </p>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={addDragDropElement}
                className="flex items-center gap-3 rounded-lg border border-[var(--fd-blue)]/10 bg-[var(--fd-cream)] px-3 py-3 text-left text-sm font-black text-[var(--fd-blue)] transition hover:-translate-y-0.5 hover:border-[var(--fd-green)]/45"
              >
                <Move size={18} aria-hidden="true" />
                Drag & Drop
              </button>
              <button
                type="button"
                onClick={addJoinElement}
                className="flex items-center gap-3 rounded-lg border border-[var(--fd-blue)]/10 bg-[var(--fd-cream)] px-3 py-3 text-left text-sm font-black text-[var(--fd-blue)] transition hover:-translate-y-0.5 hover:border-[var(--fd-green)]/45"
              >
                <Link2 size={18} aria-hidden="true" />
                Join
              </button>
              <button
                type="button"
                onClick={addCheckboxElement}
                className="flex items-center gap-3 rounded-lg border border-[var(--fd-blue)]/10 bg-[var(--fd-cream)] px-3 py-3 text-left text-sm font-black text-[var(--fd-blue)] transition hover:-translate-y-0.5 hover:border-[var(--fd-green)]/45"
              >
                <CheckSquare size={18} aria-hidden="true" />
                Checkbox
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-4 shadow-[0_18px_48px_rgba(76,87,169,0.08)]">
            <div className="mb-4 flex items-center gap-2">
              <Palette size={18} className="text-[var(--fd-green)]" aria-hidden="true" />
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--fd-blue)]/70">
                Brush
              </p>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  aria-label={`Use ${color}`}
                  onClick={() => {
                    setBrushColor(color);
                    if (activeTool === "draw") configureBrush(color, brushSize);
                  }}
                  className={`size-8 rounded-full border-2 transition ${
                    brushColor === color ? "border-[var(--fd-blue)] scale-110" : "border-white"
                  }`}
                  style={{ backgroundColor: color, boxShadow: "0 0 0 1px rgba(23,32,51,0.12)" }}
                />
              ))}
            </div>

            <label className="mt-5 block text-sm font-bold text-[var(--fd-blue)]">
              Brush size
              <input
                type="range"
                min="2"
                max="26"
                value={brushSize}
                onChange={(event) => setBrushSize(Number(event.target.value))}
                className="mt-3 w-full accent-[var(--fd-red)]"
              />
            </label>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-[var(--fd-cream)] px-3 py-2 text-sm font-black">
              <span>{brushSize}px</span>
              <span
                className="rounded-full"
                style={{
                  backgroundColor: activeTool === "eraser" ? "#ffffff" : brushColor,
                  height: Math.max(brushSize, 6),
                  width: Math.max(brushSize, 6),
                  boxShadow: "0 0 0 1px rgba(23,32,51,0.14)",
                }}
              />
            </div>
          </section>
        </aside>

        <section className="min-w-0 rounded-lg border border-[var(--fd-blue)]/10 bg-[#f1e4cf] p-3 shadow-[0_24px_70px_rgba(76,87,169,0.14)] md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white/80 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--fd-blue)]">
              <Save size={17} className="text-[var(--fd-green)]" aria-hidden="true" />
              A4 worksheet, auto {canvasSize.label.toLowerCase()} export
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-[var(--fd-blue)]/10 bg-white px-3 py-2 text-xs font-black text-[var(--fd-blue)]">
                Zoom
                <button
                  type="button"
                  onClick={() => updateZoom(zoom - 5)}
                  className="grid size-7 place-items-center rounded-md border border-[var(--fd-blue)]/10 bg-[var(--fd-cream)] transition hover:-translate-y-0.5"
                  title="Zoom out"
                  aria-label="Zoom out"
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={zoom}
                  onInput={(event) => updateZoom(Number(event.currentTarget.value))}
                  onChange={(event) => updateZoom(Number(event.currentTarget.value))}
                  className="w-24 accent-[var(--fd-blue)]"
                />
                <span className="w-9 text-right">{zoom}%</span>
                <button
                  type="button"
                  onClick={() => updateZoom(zoom + 5)}
                  className="grid size-7 place-items-center rounded-md border border-[var(--fd-blue)]/10 bg-[var(--fd-cream)] transition hover:-translate-y-0.5"
                  title="Zoom in"
                  aria-label="Zoom in"
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </label>
              <button
                onClick={undo}
                className="grid size-10 place-items-center rounded-lg border border-[var(--fd-blue)]/10 bg-white transition hover:-translate-y-0.5"
                title="Undo"
              >
                <Undo2 size={18} aria-hidden="true" />
              </button>
              <button
                onClick={redo}
                className="grid size-10 place-items-center rounded-lg border border-[var(--fd-blue)]/10 bg-white transition hover:-translate-y-0.5"
                title="Redo"
              >
                <Redo2 size={18} aria-hidden="true" />
              </button>
              <button
                onClick={clearCanvas}
                className="grid size-10 place-items-center rounded-lg border border-[var(--fd-blue)]/10 bg-white text-[var(--fd-red)] transition hover:-translate-y-0.5"
                title="Clear"
              >
                <RotateCcw size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="overflow-auto rounded-lg bg-[#dccdc1] p-4 md:p-8">
            <div className="mx-auto w-fit rounded-[10px] bg-white p-3 shadow-[0_30px_80px_rgba(23,32,51,0.28)]">
              <div
                className="worksheet-canvas-viewport relative overflow-visible"
                style={{
                  "--worksheet-canvas-height": `${canvasSize.height}px`,
                  "--worksheet-canvas-scale": zoom / 100,
                  "--worksheet-canvas-width": `${canvasSize.width}px`,
                  height: Math.round(canvasSize.height * (zoom / 100)),
                  width: Math.round(canvasSize.width * (zoom / 100)),
                } as CSSProperties}
              >
                <canvas ref={canvasRef} className="block" />
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-4 shadow-[0_18px_48px_rgba(76,87,169,0.08)]">
            <div className="mb-4 flex items-center gap-2">
              <LibraryBig size={18} className="text-[var(--fd-green)]" aria-hidden="true" />
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--fd-blue)]/70">
                Parent worksheet
              </p>
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--fd-green)] px-4 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(107,170,117,0.24)] transition hover:-translate-y-0.5">
              <FileText size={18} aria-hidden="true" />
              Upload PDF / image
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                hidden
                onChange={uploadWorksheet}
              />
            </label>
            <p className="mt-3 rounded-lg bg-[var(--fd-cream)] p-3 text-xs font-semibold leading-5 text-[var(--fd-blue)]/75">
              Uploaded worksheet becomes a resizable layer. Use Select, then drag the corner handles.
            </p>

            <button
              type="button"
              onClick={toggleWorksheetLock}
              disabled={!hasWorksheetLayer}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition ${
                hasWorksheetLayer
                  ? isWorksheetLocked
                    ? "bg-[var(--fd-blue)] text-white shadow-[0_14px_34px_rgba(76,87,169,0.22)] hover:-translate-y-0.5"
                    : "border border-[var(--fd-blue)]/15 bg-white text-[var(--fd-blue)] hover:-translate-y-0.5"
                  : "cursor-not-allowed border border-[var(--fd-blue)]/10 bg-slate-100 text-slate-400"
              }`}
            >
              {isWorksheetLocked ? (
                <Lock size={18} aria-hidden="true" />
              ) : (
                <Unlock size={18} aria-hidden="true" />
              )}
              {isWorksheetLocked ? "Unlock worksheet layer" : "Lock worksheet layer"}
            </button>

            <label className="mt-4 block text-sm font-bold text-[var(--fd-blue)]">
              Save file name
              <input
                value={exportFileName}
                onChange={(event) => setExportFileName(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--fd-blue)]/15 bg-[var(--fd-cream)] px-3 py-2 text-sm font-bold outline-none transition focus:border-[var(--fd-blue)]"
                placeholder="fd-arcadia-worksheet"
              />
            </label>

            {pdfPageCount > 0 && (
              <div className="mt-4 rounded-lg border border-[var(--fd-blue)]/10 bg-[#fff8dc] p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--fd-red)]">
                  PDF selected
                </p>
                <p className="mt-1 truncate text-sm font-black text-[var(--fd-blue)]">
                  {pdfFileName}
                </p>
                <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-2">
                  <label className="block text-xs font-bold text-[var(--fd-blue)]">
                    Page to use
                    <select
                      value={selectedPdfPage}
                      onChange={(event) => renderPdfPage(Number(event.target.value))}
                      className="mt-2 w-full rounded-lg border border-[var(--fd-blue)]/15 bg-white px-3 py-2 text-sm font-black outline-none focus:border-[var(--fd-blue)]"
                    >
                      {Array.from({ length: pdfPageCount }, (_, index) => index + 1).map((page) => (
                        <option key={page} value={page}>
                          Page {page}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span className="rounded-lg bg-white px-3 py-2 text-sm font-black text-[var(--fd-blue)]">
                    {selectedPdfPage}/{pdfPageCount}
                  </span>
                </div>
                {pdfStatus && (
                  <p className="mt-3 text-xs font-semibold leading-5 text-[var(--fd-blue)]/75">
                    {pdfStatus}
                  </p>
                )}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <Link
                href="/learninghub"
                className="flex items-start gap-3 rounded-lg border border-[var(--fd-green)]/25 bg-[#f0f7e6] p-3 text-left transition hover:-translate-y-0.5 hover:border-[var(--fd-green)]/60"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--fd-green)] text-white">
                  <BookOpen size={19} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-black uppercase tracking-[0.14em] text-[var(--fd-red)]">
                    LearningHub
                  </span>
                  <span className="mt-1 block text-sm font-black text-[var(--fd-blue)]">
                    Choose subscribed worksheet
                  </span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-[var(--fd-blue)]/70">
                    For parents with active LearningHub access.
                  </span>
                </span>
              </Link>

              <Link
                href="/tuition"
                className="flex items-start gap-3 rounded-lg border border-[var(--fd-blue)]/15 bg-[var(--fd-cream)] p-3 text-left transition hover:-translate-y-0.5 hover:border-[var(--fd-blue)]/45"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--fd-blue)] text-white">
                  <ClipboardCheck size={19} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-black uppercase tracking-[0.14em] text-[var(--fd-red)]">
                    Tuition Task
                  </span>
                  <span className="mt-1 block text-sm font-black text-[var(--fd-blue)]">
                    Open tuition workspace
                  </span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-[var(--fd-blue)]/70">
                    For parents registered under the tuition package.
                  </span>
                </span>
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-4 shadow-[0_18px_48px_rgba(76,87,169,0.08)]">
            <div className="mb-4 flex items-center gap-2">
              <Stars size={18} className="text-[var(--fd-orange)]" aria-hidden="true" />
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--fd-blue)]/70">
                Stickers
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3 lg:grid-cols-2">
              {stickers.map((sticker) => (
                <button
                  key={sticker.path}
                  onClick={() => addSticker(sticker.path)}
                  className="grid aspect-square place-items-center rounded-lg border border-[var(--fd-blue)]/10 bg-[var(--fd-cream)] transition hover:-translate-y-0.5 hover:border-[var(--fd-blue)]/25"
                  title={sticker.label}
                >
                  <Image
                    src={sticker.path}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 object-contain"
                  />
                </button>
              ))}
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--fd-blue)]/25 bg-[var(--fd-cream)] px-4 py-3 text-sm font-black transition hover:-translate-y-0.5">
              <FolderUp size={18} aria-hidden="true" />
              Upload sticker
              <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={uploadSticker} />
            </label>
          </section>

          <section className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-4 shadow-[0_18px_48px_rgba(76,87,169,0.08)]">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--fd-blue)]/70">
              Object actions
            </p>
            <button
              onClick={deleteSelected}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--fd-blue)] px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              <Trash2 size={18} aria-hidden="true" />
              Delete selected
            </button>
            <p className="mt-4 rounded-lg bg-[var(--fd-cream)] p-4 text-sm leading-6 text-[var(--fd-blue)]/75">
              Use Select to move text, stickers, and shapes. Use Draw or Eraser for handwriting practice.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
