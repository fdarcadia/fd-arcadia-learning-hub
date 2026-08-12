"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import HTMLFlipBook from "react-pageflip";
import {
  ArrowLeft,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eraser,
  FileText,
  Expand,
  Highlighter,
  Loader2,
  Maximize2,
  Minus,
  MousePointer2,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { createClient } from "@/lib/client";

type ModuleData = {
  id: string;
  title: string;
  description: string | null;
  storage_prefix: string | null;
  total_pages: number | null;
  allow_annotation: boolean;
  is_active: boolean;
};

type Tool = "pointer" | "pen" | "highlighter" | "eraser" | "text";

type Point = {
  x: number;
  y: number;
};

type StrokeAnnotation = {
  id: string;
  type: "stroke";
  tool: "pen" | "highlighter" | "eraser";
  color: string;
  width: number;
  points: Point[];
};

type TextAnnotation = {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
};

type Annotation = StrokeAnnotation | TextAnnotation;
type AnnotationMap = Record<number, Annotation[]>;
type RedoMap = Record<number, Annotation[]>;
type SaveStatus = "idle" | "saving" | "saved" | "error";

type FlipEvent = {
  data: number;
};

type FlipApi = {
  flipNext: () => void;
  flipPrev: () => void;
  flip: (pageNumber: number) => void;
  getCurrentPageIndex?: () => number;
};

type FlipBookHandle = {
  pageFlip: () => FlipApi;
};

type FlipPageProps = {
  pageNumber: number;
  imageUrl?: string;
  annotations: Annotation[];
  tool: Tool;
  color: string;
  penWidth: number;
  onAddAnnotation: (page: number, annotation: Annotation) => void;
  onActivatePage: (page: number) => void;
};

const BUCKET = "learninghub-books";
const SIGNED_URL_SECONDS = 60 * 60;
const FlipBook = HTMLFlipBook as unknown as ComponentType<any>;

export default function FlashcardModuleReaderPage() {
  const params = useParams<{ id: string }>();
  const moduleId = params.id;
  const supabase = useMemo(() => createClient(), []);

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const flipBookRef = useRef<FlipBookHandle | null>(null);

  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [pageUrls, setPageUrls] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [bookWidth, setBookWidth] = useState(470);
  const [bookHeight, setBookHeight] = useState(665);
  const [isMobile, setIsMobile] = useState(false);
  const [isTabletPortrait, setIsTabletPortrait] = useState(false);

  const [tool, setTool] = useState<Tool>("pointer");
  const [penColor, setPenColor] = useState("#2563eb");
  const [penWidth, setPenWidth] = useState(4);
  const [annotations, setAnnotations] = useState<AnnotationMap>({});
  const [redoAnnotations, setRedoAnnotations] = useState<RedoMap>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [annotationsLoaded, setAnnotationsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [activeWritingPage, setActiveWritingPage] = useState(1);
  const [resumePage, setResumePage] = useState(1);
  const [highestPage, setHighestPage] = useState(1);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [resettingAllNotes, setResettingAllNotes] = useState(false);
  const [notesMenuOpen, setNotesMenuOpen] = useState(false);
  const [notesConfirmMode, setNotesConfirmMode] = useState<"page" | "all" | null>(null);
  const [notesMessage, setNotesMessage] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [zoom, setZoom] = useState(1);

  const annotationsRef = useRef<AnnotationMap>({});
  const dirtyPagesRef = useRef<Set<number>>(new Set());
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressInitialisedRef = useRef(false);
  const completionCelebratedRef = useRef(false);

  const totalPages = moduleData?.total_pages ?? 0;
  const allowFlipGesture = tool === "pointer";

  useEffect(() => {
    function updateBookSize() {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const portrait = viewportHeight >= viewportWidth;
      const mobile = viewportWidth < 640;
      const tabletPortrait = viewportWidth >= 640 && viewportWidth < 1024 && portrait;

      setIsMobile(mobile);
      setIsTabletPortrait(tabletPortrait);

      /*
       * Phone + iPad portrait: one large portrait page.
       * iPad landscape + desktop: PageFlip can render a two-page spread.
       */
      if (mobile || tabletPortrait) {
        const horizontalPadding = mobile ? 20 : 48;
        const verticalReserve = mobile ? 245 : 270;
        const availableWidth = Math.max(280, viewportWidth - horizontalPadding);
        const availableHeight = Math.max(390, viewportHeight - verticalReserve);
        const widthFromHeight = Math.floor(availableHeight * 0.707);
        const width = Math.max(280, Math.min(availableWidth, widthFromHeight, 690));

        setBookWidth(width);
        setBookHeight(Math.round(width / 0.707));
        return;
      }

      const verticalReserve = viewportWidth < 1280 ? 255 : 245;
      const availableHeight = Math.max(480, Math.min(viewportHeight - verticalReserve, 900));
      const availableSpreadWidth = Math.max(700, viewportWidth - 120);
      const pageWidthByHeight = Math.round(availableHeight * 0.707);
      const pageWidthBySpread = Math.floor(availableSpreadWidth / 2);
      const pageWidth = Math.max(320, Math.min(pageWidthByHeight, pageWidthBySpread, 700));

      setBookWidth(pageWidth);
      setBookHeight(Math.round(pageWidth / 0.707));
    }

    updateBookSize();
    window.addEventListener("resize", updateBookSize);
    window.addEventListener("orientationchange", updateBookSize);

    return () => {
      window.removeEventListener("resize", updateBookSize);
      window.removeEventListener("orientationchange", updateBookSize);
    };
  }, []);

  /* =======================================================
     LOAD CURRENT USER
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !user) {
        setUserId(null);
        setAnnotationsLoaded(true);
        setSaveStatus("error");
        return;
      }

      setUserId(user.id);
    }

    void loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!moduleId) return;
    let mounted = true;

    async function loadBookPageUrls(storagePrefix: string, expectedTotal: number) {
      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET)
        .list(storagePrefix, {
          limit: 1000,
          sortBy: { column: "name", order: "asc" },
        });

      if (listError) throw listError;

      const pageFiles = (files ?? [])
        .filter((file) => /^page-\d+\./i.test(file.name))
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        );

      if (pageFiles.length === 0) {
        throw new Error("No book page images were found.");
      }

      const paths = pageFiles
        .slice(0, expectedTotal)
        .map((file) => `${storagePrefix}/${file.name}`);

      const { data: signedData, error: signedError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrls(paths, SIGNED_URL_SECONDS);

      if (signedError) throw signedError;

      const urls = (signedData ?? [])
        .map((item) => item.signedUrl)
        .filter((url): url is string => Boolean(url));

      if (urls.length === 0) {
        throw new Error("Unable to prepare book pages.");
      }

      return urls;
    }

    async function loadBook() {
      try {
        setLoading(true);
        setErrorMessage("");

        const { data, error } = await supabase
          .from("flashcard_modules")
          .select(
            `
              id,
              title,
              description,
              storage_prefix,
              total_pages,
              allow_annotation,
              is_active
            `,
          )
          .eq("id", moduleId)
          .eq("is_active", true)
          .single();

        if (error) throw error;

        const typed = data as ModuleData;

        if (!typed.storage_prefix) {
          throw new Error("Book pages are not available.");
        }

        if (!typed.total_pages || typed.total_pages <= 0) {
          throw new Error("This book does not have any pages yet.");
        }

        const urls = await loadBookPageUrls(
          typed.storage_prefix,
          typed.total_pages,
        );

        if (!mounted) return;

        setModuleData(typed);
        setPageUrls(urls);
        setCurrentPage(1);
      } catch (error) {
        if (!mounted) return;
        const err = error as { message?: string };
        setErrorMessage(err?.message || "Unable to open this book.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadBook();

    return () => {
      mounted = false;
    };
  }, [moduleId, supabase]);

  /* =======================================================
     LOAD SAVED ANNOTATIONS
  ======================================================= */

  useEffect(() => {
    if (!userId || !moduleData?.id) {
      return;
    }

    const currentModuleId = moduleData.id;
    let mounted = true;

    async function loadSavedAnnotations() {
      try {
        setAnnotationsLoaded(false);
        setSaveStatus("idle");

        const { data, error } = await supabase
          .from("flashcard_module_annotations")
          .select("page_number, annotation_data")
          .eq("user_id", userId)
          .eq("module_id", currentModuleId)
          .order("page_number", {
            ascending: true,
          });

        if (error) {
          throw error;
        }

        if (!mounted) return;

        const loadedAnnotations: AnnotationMap = {};

        for (const row of data ?? []) {
          const pageNumber = Number(row.page_number);

          if (!Number.isFinite(pageNumber)) {
            continue;
          }

          const savedData = row.annotation_data;

          loadedAnnotations[pageNumber] = Array.isArray(savedData)
            ? (savedData as Annotation[])
            : [];
        }

        annotationsRef.current = loadedAnnotations;
        dirtyPagesRef.current.clear();
        setAnnotations(loadedAnnotations);
        setRedoAnnotations({});
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        if (!mounted) return;

        /*
         * Keep the reader usable even if saved notes fail to load.
         * We do not auto-save until annotationsLoaded becomes true.
         */
        setSaveStatus("error");
      } finally {
        if (mounted) {
          setAnnotationsLoaded(true);
        }
      }
    }

    void loadSavedAnnotations();

    return () => {
      mounted = false;
    };
  }, [userId, moduleData?.id, supabase]);

  /* =======================================================
     AUTO SAVE ANNOTATIONS
  ======================================================= */

  const saveDirtyAnnotations = useCallback(async () => {
    if (
      savingRef.current ||
      !annotationsLoaded ||
      !userId ||
      !moduleData?.id
    ) {
      return;
    }

    const currentModuleId = moduleData.id;
    const pagesToSave = Array.from(dirtyPagesRef.current);

    if (pagesToSave.length === 0) {
      return;
    }

    /*
     * Remove this batch from dirty pages before saving.
     * Any new writing that happens during the request will be
     * added back into dirtyPagesRef and saved in the next batch.
     */
    pagesToSave.forEach((pageNumber) => {
      dirtyPagesRef.current.delete(pageNumber);
    });

    savingRef.current = true;
    setSaveStatus("saving");

    const now = new Date().toISOString();

    const rows = pagesToSave.map((pageNumber) => ({
      user_id: userId,
      module_id: currentModuleId,
      page_number: pageNumber,
      annotation_data: annotationsRef.current[pageNumber] ?? [],
      updated_at: now,
    }));

    const { error } = await supabase
      .from("flashcard_module_annotations")
      .upsert(rows, {
        onConflict: "user_id,module_id,page_number",
      });

    savingRef.current = false;

    if (error) {
      /*
       * Put failed pages back into the queue so the next edit
       * or retry can save them again.
       */
      pagesToSave.forEach((pageNumber) => {
        dirtyPagesRef.current.add(pageNumber);
      });

      setSaveStatus("error");

      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        void saveDirtyAnnotations();
      }, 3000);
      return;
    }

    setSaveStatus("saved");
    setLastSavedAt(new Date());

    /*
     * If the parent wrote again while this request was saving,
     * automatically flush that newer batch too.
     */
    if (dirtyPagesRef.current.size > 0) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        void saveDirtyAnnotations();
      }, 700);
    }
  }, [
    annotationsLoaded,
    userId,
    moduleData?.id,
    supabase,
  ]);

  const queueAnnotationSave = useCallback(
    (pageNumber: number) => {
      if (
        !annotationsLoaded ||
        !userId ||
        !moduleData?.id
      ) {
        return;
      }

      dirtyPagesRef.current.add(pageNumber);
      setSaveStatus("idle");

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        void saveDirtyAnnotations();
      }, 900);
    },
    [
      annotationsLoaded,
      userId,
      moduleData?.id,
      saveDirtyAnnotations,
    ],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    };
  }, []);

  useEffect(() => {
    function protectPendingSave(event: BeforeUnloadEvent) {
      if (dirtyPagesRef.current.size === 0 && !savingRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", protectPendingSave);
    return () => window.removeEventListener("beforeunload", protectPendingSave);
  }, []);

  function retrySaveNow() {
    if (dirtyPagesRef.current.size === 0) return;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    void saveDirtyAnnotations();
  }

  /* =======================================================
     READING PROGRESS + RESUME
  ======================================================= */

  useEffect(() => {
    if (!userId || !moduleData?.id || totalPages <= 0) return;

    const currentModuleId = moduleData.id;
    let mounted = true;

    async function loadReadingProgress() {
      try {
        setProgressLoaded(false);

        const { data, error } = await supabase
          .from("flashcard_module_progress")
          .select("last_page,highest_page")
          .eq("user_id", userId)
          .eq("module_id", currentModuleId)
          .maybeSingle();

        if (error) throw error;
        if (!mounted) return;

        const last = Math.max(1, Math.min(totalPages, Number(data?.last_page ?? 1)));
        const highest = Math.max(last, Math.min(totalPages, Number(data?.highest_page ?? last)));

        setResumePage(last);
        setCurrentPage(last);
        setActiveWritingPage(last);
        setHighestPage(highest);
        progressInitialisedRef.current = true;

        if (highest >= totalPages) {
          completionCelebratedRef.current = true;
        }

        window.setTimeout(() => {
          flipBookRef.current?.pageFlip().flip(last - 1);
        }, 200);

        const now = new Date().toISOString();
        const percent = Math.min(100, Math.round((highest / totalPages) * 100));

        await supabase.from("flashcard_module_progress").upsert(
          {
            user_id: userId,
            module_id: currentModuleId,
            last_page: last,
            highest_page: highest,
            progress_percent: percent,
            last_opened_at: now,
            completed_at: highest >= totalPages ? now : null,
          },
          { onConflict: "user_id,module_id" },
        );
      } catch {
        progressInitialisedRef.current = true;
      } finally {
        if (mounted) setProgressLoaded(true);
      }
    }

    void loadReadingProgress();
    return () => { mounted = false; };
  }, [userId, moduleData?.id, totalPages, supabase]);

  const saveReadingProgress = useCallback(
    async (pageNumber: number) => {
      if (!progressInitialisedRef.current || !userId || !moduleData?.id || totalPages <= 0) return;

      const currentModuleId = moduleData.id;
      const safePage = Math.max(1, Math.min(totalPages, pageNumber));
      const nextHighest = Math.max(highestPage, safePage);
      const percent = Math.min(100, Math.round((nextHighest / totalPages) * 100));
      const now = new Date().toISOString();

      setHighestPage(nextHighest);

      if (
        nextHighest >= totalPages &&
        highestPage < totalPages &&
        !completionCelebratedRef.current
      ) {
        completionCelebratedRef.current = true;
        setShowCompletionModal(true);
      }

      await supabase.from("flashcard_module_progress").upsert(
        {
          user_id: userId,
          module_id: currentModuleId,
          last_page: safePage,
          highest_page: nextHighest,
          progress_percent: percent,
          last_opened_at: now,
          completed_at: nextHighest >= totalPages ? now : null,
        },
        { onConflict: "user_id,module_id" },
      );
    },
    [userId, moduleData?.id, totalPages, highestPage, supabase],
  );

  function queueProgressSave(pageNumber: number) {
    if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    progressTimerRef.current = setTimeout(() => {
      void saveReadingProgress(pageNumber);
    }, 650);
  }

  function reviewFromBeginning() {
    setShowCompletionModal(false);
    setCurrentPage(1);
    setActiveWritingPage(1);
    flipBookRef.current?.pageFlip().flip(0);
    queueProgressSave(1);
  }

  function nextPage() {
    flipBookRef.current?.pageFlip().flipNext();
  }

  function previousPage() {
    flipBookRef.current?.pageFlip().flipPrev();
  }

  function jumpToPage(page: number) {
    if (!Number.isFinite(page) || totalPages <= 0) return;
    const target = Math.max(1, Math.min(totalPages, Math.round(page)));
    flipBookRef.current?.pageFlip().flip(target - 1);
  }

  const handleFlip = useCallback((event: FlipEvent) => {
    const pageNumber = event.data + 1;
    setCurrentPage(pageNumber);
    setActiveWritingPage(pageNumber);
    queueProgressSave(pageNumber);
  }, [saveReadingProgress]);

  function addAnnotation(pageNumber: number, annotation: Annotation) {
    setAnnotations((current) => {
      const next: AnnotationMap = {
        ...current,
        [pageNumber]: [
          ...(current[pageNumber] ?? []),
          annotation,
        ],
      };

      annotationsRef.current = next;
      return next;
    });

    setRedoAnnotations((current) => ({
      ...current,
      [pageNumber]: [],
    }));

    queueAnnotationSave(pageNumber);
  }

  function undoPage(pageNumber: number) {
    const pageItems = annotationsRef.current[pageNumber] ?? [];

    if (pageItems.length === 0) return;

    const lastItem = pageItems[pageItems.length - 1];

    setAnnotations((current) => {
      const next: AnnotationMap = {
        ...current,
        [pageNumber]: pageItems.slice(0, -1),
      };

      annotationsRef.current = next;
      return next;
    });

    setRedoAnnotations((current) => ({
      ...current,
      [pageNumber]: [
        ...(current[pageNumber] ?? []),
        lastItem,
      ],
    }));

    queueAnnotationSave(pageNumber);
  }

  function redoPage(pageNumber: number) {
    const redoItems = redoAnnotations[pageNumber] ?? [];

    if (redoItems.length === 0) return;

    const restored = redoItems[redoItems.length - 1];

    setAnnotations((current) => {
      const next: AnnotationMap = {
        ...current,
        [pageNumber]: [
          ...(current[pageNumber] ?? []),
          restored,
        ],
      };

      annotationsRef.current = next;
      return next;
    });

    setRedoAnnotations((current) => ({
      ...current,
      [pageNumber]: redoItems.slice(0, -1),
    }));

    queueAnnotationSave(pageNumber);
  }

  function clearPage(pageNumber: number) {
    const pageItems = annotationsRef.current[pageNumber] ?? [];

    if (pageItems.length === 0) return;

    setRedoAnnotations((current) => ({
      ...current,
      [pageNumber]: pageItems,
    }));

    setAnnotations((current) => {
      const next: AnnotationMap = {
        ...current,
        [pageNumber]: [],
      };

      annotationsRef.current = next;
      return next;
    });

    queueAnnotationSave(pageNumber);
  }

  async function resetAllNotes() {
    if (resettingAllNotes || !annotationsLoaded || !userId || !moduleData?.id) return;
    const currentModuleId = moduleData.id;

    try {
      setResettingAllNotes(true);
      setNotesMessage("");
      if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); saveTimerRef.current = null; }
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
      dirtyPagesRef.current.clear();

      let waitCount = 0;
      while (savingRef.current && waitCount < 40) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        waitCount += 1;
      }

      const { error } = await supabase
        .from("flashcard_module_annotations")
        .delete()
        .eq("user_id", userId)
        .eq("module_id", currentModuleId);

      if (error) throw error;

      annotationsRef.current = {};
      dirtyPagesRef.current.clear();
      setAnnotations({});
      setRedoAnnotations({});
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      setNotesConfirmMode(null);
      setNotesMenuOpen(false);
      setNotesMessage("All notes reset. Reading progress is unchanged.");
    } catch (error) {
      console.error("Reset all notes error:", error);
      setSaveStatus("error");
      setNotesMessage(error instanceof Error ? `Unable to reset notes: ${error.message}` : "Unable to reset notes. Please try again.");
    } finally {
      setResettingAllNotes(false);
    }
  }

  function confirmClearCurrentPage() {
    clearPage(activeToolbarPage);
    setNotesConfirmMode(null);
    setNotesMenuOpen(false);
    setNotesMessage(`Page ${activeToolbarPage} notes cleared.`);
  }

  function zoomIn() {
    setZoom((current) =>
      Math.min(1.6, Number((current + 0.1).toFixed(1))),
    );
  }

  function zoomOut() {
    setZoom((current) =>
      Math.max(0.75, Number((current - 0.1).toFixed(1))),
    );
  }

  function resetZoom() {
    setZoom(1);
  }

  async function toggleFullscreen() {
    const viewer = viewerRef.current;
    if (!viewer) return;

    try {
      if (!document.fullscreenElement) {
        await viewer.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Some browsers do not support fullscreen here.
    }
  }

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;

      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") {
        return;
      }

      if (tool !== "pointer") return;

      if (event.key === "ArrowRight") nextPage();
      if (event.key === "ArrowLeft") previousPage();
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [tool]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#E8ECF3] px-4">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-xl">
            <Loader2 size={29} className="animate-spin text-indigo-600" />
          </div>
          <h1 className="mt-5 text-xl font-black text-slate-950">
            Preparing Flipbook...
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Loading your reading module.
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !moduleData) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#E8ECF3] px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-red-100 bg-white p-7 text-center shadow-xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-xl font-black text-red-600">
            !
          </div>
          <h1 className="mt-5 text-xl font-black text-slate-950">
            Book cannot be opened
          </h1>
          <p className="mt-2 text-sm leading-6 text-red-600">
            {errorMessage}
          </p>
          <Link
            href="/flashcard-modules"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            Back to Modules
          </Link>
        </div>
      </main>
    );
  }

  const canPrevious = currentPage > 1;
  const canNext = currentPage < totalPages;
  const activeToolbarPage = activeWritingPage;

  return (
    <main className="flex min-h-screen flex-col bg-[#E2E7EF]">
      <header className="z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="flex min-h-[70px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/flashcard-modules"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              title="Back to Modules"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
              <BookOpen size={20} />
            </div>

            <div className="min-w-0">
              <p className="truncate font-black text-slate-950">
                {moduleData.title}
              </p>
              <p className="hidden text-xs text-slate-400 sm:block">
                FD Arcadia Interactive Flipbook
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-indigo-50 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-indigo-700 md:inline-flex">
              {tool === "pointer" ? "Flip Mode" : "Writing Mode"}
            </span>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              title="Fullscreen"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
      </header>

      {moduleData.allow_annotation && (
        <div className="z-40 border-b border-slate-800 bg-[#24262B] shadow-lg">
          <div className="flex touch-pan-x items-center gap-1 overflow-x-auto overscroll-x-contain px-2 py-2 sm:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ToolButton
              active={tool === "pointer"}
              title="Pointer / Flip"
              onClick={() => setTool("pointer")}
            >
              <MousePointer2 size={19} />
            </ToolButton>

            <ToolButton
              active={tool === "text"}
              title="Text"
              disabled={!annotationsLoaded}
              onClick={() => setTool("text")}
            >
              <Type size={20} />
            </ToolButton>

            <ToolButton
              active={tool === "pen"}
              title="Pen"
              disabled={!annotationsLoaded}
              onClick={() => setTool("pen")}
            >
              <Pencil size={20} />
            </ToolButton>

            <ToolButton
              active={tool === "highlighter"}
              title="Highlighter"
              disabled={!annotationsLoaded}
              onClick={() => setTool("highlighter")}
            >
              <Highlighter size={20} />
            </ToolButton>

            <ToolButton
              active={tool === "eraser"}
              title="Eraser"
              disabled={!annotationsLoaded}
              onClick={() => setTool("eraser")}
            >
              <Eraser size={20} />
            </ToolButton>

            <ToolbarDivider />

            <ToolButton title="Undo" onClick={() => undoPage(activeToolbarPage)}>
              <Undo2 size={19} />
            </ToolButton>

            <ToolButton title="Redo" onClick={() => redoPage(activeToolbarPage)}>
              <Redo2 size={19} />
            </ToolButton>

            <div className="relative shrink-0">
              <button type="button" onClick={() => setNotesMenuOpen((v) => !v)} disabled={!annotationsLoaded}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-white/10 px-3 text-xs font-black text-white hover:bg-white/15 disabled:opacity-30">
                <FileText size={17} />
                <span className="hidden xl:inline">Notes</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">{(annotations[activeToolbarPage] ?? []).length}</span>
              </button>
              {notesMenuOpen && (
                <div className="absolute bottom-12 right-0 z-[90] w-[290px] rounded-2xl border border-white/10 bg-slate-950 p-2 shadow-2xl">
                  <div className="px-3 py-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Notes Manager</p>
                    <p className="mt-1 text-sm font-bold text-white">Page {activeToolbarPage}</p>
                    <p className="mt-1 text-xs text-slate-400">{(annotations[activeToolbarPage] ?? []).length} note item(s)</p>
                  </div>
                  <button type="button" onClick={() => setNotesConfirmMode("page")} disabled={(annotations[activeToolbarPage] ?? []).length === 0}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-white/10 disabled:opacity-30">
                    <Trash2 size={17} className="text-amber-300" />
                    <div><p className="text-xs font-black text-white">Clear Current Page</p><p className="text-[10px] text-slate-500">Page {activeToolbarPage} only</p></div>
                  </button>
                  <button type="button" onClick={() => setNotesConfirmMode("all")}
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-red-500/10">
                    <RotateCcw size={17} className="text-red-300" />
                    <div><p className="text-xs font-black text-red-200">Reset All Notes</p><p className="text-[10px] text-slate-500">Every page in this module</p></div>
                  </button>
                  <div className="mt-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-[10px] font-semibold text-emerald-300">Reading progress will not be affected.</div>
                </div>
              )}
            </div>
            <ToolbarDivider />

            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-white/10 p-1">
              {[2, 4, 7].map((width) => (
                <button
                  key={width}
                  type="button"
                  onClick={() => setPenWidth(width)}
                  className={`grid h-8 w-8 place-items-center rounded-md transition ${
                    penWidth === width
                      ? "bg-indigo-500 text-white"
                      : "text-white hover:bg-white/10"
                  }`}
                  title={`Brush ${width}`}
                >
                  <span
                    className="rounded-full bg-current"
                    style={{ width: width + 4, height: Math.max(width, 2) }}
                  />
                </button>
              ))}
            </div>

            <label
              className="relative ml-1 flex h-9 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white/10"
              title="Colour"
            >
              <span
                className="h-5 w-5 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: penColor }}
              />
              <input
                type="color"
                value={penColor}
                onChange={(event) => setPenColor(event.target.value)}
                className="absolute h-0 w-0 opacity-0"
              />
            </label>

            <ToolbarDivider />

            <ToolButton title="Zoom Out" onClick={zoomOut}>
              <Minus size={18} />
            </ToolButton>

            <button
              type="button"
              onClick={resetZoom}
              className="min-w-[58px] shrink-0 rounded-lg px-2 py-2 text-xs font-black text-white transition hover:bg-white/10"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>

            <ToolButton title="Zoom In" onClick={zoomIn}>
              <Plus size={18} />
            </ToolButton>

            <ToolButton title="Reset Zoom" onClick={resetZoom}>
              <RotateCcw size={17} />
            </ToolButton>

            <ToolButton title="Fullscreen" onClick={toggleFullscreen}>
              <Expand size={18} />
            </ToolButton>

            <button
              type="button"
              onClick={saveStatus === "error" ? retrySaveNow : undefined}
              disabled={saveStatus !== "error"}
              title={saveStatus === "error" ? "Retry saving notes" : "Auto save status"}
              className={`ml-auto hidden shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider xl:flex ${
                !annotationsLoaded
                  ? "bg-white/10 text-slate-300"
                  : saveStatus === "saving"
                    ? "bg-amber-500/15 text-amber-300"
                    : saveStatus === "error"
                      ? "cursor-pointer bg-red-500/15 text-red-300 hover:bg-red-500/25"
                      : "bg-emerald-500/15 text-emerald-300"
              }`}
            >
              {saveStatus === "saving" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              {!annotationsLoaded
                ? "Loading Notes"
                : saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "error"
                    ? "Save Error • Retry"
                    : saveStatus === "idle"
                      ? "Unsaved"
                      : lastSavedAt
                        ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : "Saved"}
            </button>
          </div>
        </div>
      )}

      <div className="z-30 border-b border-slate-200 bg-white px-3 py-3 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={previousPage}
            disabled={!canPrevious}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden min-w-[150px] sm:block">
              <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span>Progress</span>
                <span>
                  {progressLoaded
                    ? `${Math.min(100, Math.round((highestPage / Math.max(totalPages, 1)) * 100))}%`
                    : "..."}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{
                    width: `${progressLoaded
                      ? Math.min(100, Math.round((highestPage / Math.max(totalPages, 1)) * 100))
                      : 0}%`,
                  }}
                />
              </div>
            </div>
            <PageJump
              currentPage={currentPage}
              totalPages={totalPages}
              onJump={jumpToPage}
            />
          </div>

          <button
            type="button"
            onClick={nextPage}
            disabled={!canNext}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <section className="flex flex-1 justify-center overflow-hidden p-1.5 sm:p-4 lg:p-6">
        <div
          ref={viewerRef}
          className="relative flex min-h-[calc(100dvh-190px)] w-full max-w-[1650px] touch-pan-x touch-pan-y items-center justify-center overflow-auto rounded-[1.35rem] bg-gradient-to-br from-[#C9D0DC] via-[#B7C0CF] to-[#9FAABD] p-2 shadow-inner sm:min-h-[calc(100dvh-185px)] sm:rounded-[2rem] sm:p-4 lg:min-h-[calc(100dvh-170px)] lg:p-8"
        >
          <button
            type="button"
            onClick={previousPage}
            disabled={!canPrevious}
            className="absolute left-4 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-700 shadow-xl transition hover:scale-105 disabled:opacity-20 lg:grid"
            title="Previous Page"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className="flex origin-center items-center justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            <FlipBook
              ref={flipBookRef}
              width={bookWidth}
              height={bookHeight}
              size="fixed"
              minWidth={260}
              maxWidth={700}
              minHeight={360}
              maxHeight={1000}
              startPage={Math.max(0, resumePage - 1)}
              drawShadow={true}
              flippingTime={800}
              usePortrait={true}
              startZIndex={0}
              autoSize={true}
              maxShadowOpacity={0.38}
              showCover={false}
              mobileScrollSupport={allowFlipGesture}
              clickEventForward={true}
              useMouseEvents={allowFlipGesture}
              swipeDistance={isMobile || isTabletPortrait ? 12 : 20}
              showPageCorners={allowFlipGesture}
              disableFlipByClick={!allowFlipGesture}
              onFlip={handleFlip}
              className="shadow-[0_30px_90px_rgba(15,23,42,0.28)]"
              style={{}}
            >
              {pageUrls.map((url, index) => {
                const pageNumber = index + 1;

                return (
                  <InteractiveFlipPage
                    key={pageNumber}
                    pageNumber={pageNumber}
                    imageUrl={url}
                    annotations={annotations[pageNumber] ?? []}
                    tool={tool}
                    color={penColor}
                    penWidth={penWidth}
                    onAddAnnotation={addAnnotation}
                    onActivatePage={setActiveWritingPage}
                  />
                );
              })}
            </FlipBook>
          </div>

          <button
            type="button"
            onClick={nextPage}
            disabled={!canNext}
            className="absolute right-4 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-slate-950 text-white shadow-xl transition hover:scale-105 disabled:opacity-20 lg:grid"
            title="Next Page"
          >
            <ChevronRight size={24} />
          </button>

          <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
            {tool === "pointer" ? (
              <div className="rounded-full bg-slate-950/85 px-4 py-2 text-[10px] font-bold text-white shadow-lg backdrop-blur">
                {isMobile || isTabletPortrait
                  ? "Swipe or drag the page to turn"
                  : "Drag the page corner to flip"}
              </div>
            ) : (
              <div className="rounded-full bg-indigo-600/95 px-4 py-2 text-[10px] font-bold text-white shadow-lg">
                Writing Mode • page flip gesture locked
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 z-50 border-t border-slate-200 bg-white p-3 sm:hidden">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button
            type="button"
            onClick={previousPage}
            disabled={!canPrevious}
            className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 py-3 text-xs font-black text-slate-700 disabled:opacity-30"
          >
            <ChevronLeft size={17} />
            Prev
          </button>

          <span className="text-xs font-black text-slate-600">
            {currentPage}/{totalPages}
          </span>

          <button
            type="button"
            onClick={nextPage}
            disabled={!canNext}
            className="flex items-center justify-center gap-1 rounded-xl bg-slate-950 px-3 py-3 text-xs font-black text-white disabled:opacity-30"
          >
            Next
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {isTabletPortrait && (
        <div className="fixed bottom-5 left-1/2 z-50 hidden -translate-x-1/2 items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur sm:flex lg:hidden">
          <button
            type="button"
            onClick={previousPage}
            disabled={!canPrevious}
            className="flex h-11 items-center gap-2 rounded-xl bg-slate-100 px-4 text-xs font-black text-slate-700 disabled:opacity-30"
          >
            <ChevronLeft size={17} /> Prev
          </button>
          <span className="min-w-[74px] text-center text-xs font-black text-slate-600">
            {currentPage}/{totalPages}
          </span>
          <button
            type="button"
            onClick={nextPage}
            disabled={!canNext}
            className="flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-black text-white disabled:opacity-30"
          >
            Next <ChevronRight size={17} />
          </button>
        </div>
      )}

      {showCompletionModal && (
        <div className="fixed inset-0 z-[230] grid place-items-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.45)]">
            <div className="relative overflow-hidden bg-slate-950 px-7 py-8 text-center text-white">
              <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/[0.05]" />
              <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-white/[0.05]" />
              <div className="absolute left-8 top-8 text-amber-300/80">
                <Sparkles size={22} />
              </div>
              <div className="absolute right-8 top-10 text-amber-300/70">
                <Sparkles size={18} />
              </div>

              <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-[26px] border border-white/10 bg-white/10 shadow-inner">
                <Award size={38} className="text-amber-300" />
              </div>

              <p className="relative mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                FD Arcadia Achievement
              </p>

              <h2 className="relative mt-2 text-3xl font-black tracking-tight">
                Module Completed!
              </h2>

              <p className="relative mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
                You reached the final page of {moduleData.title}. Your reading progress is now 100%.
              </p>
            </div>

            <div className="px-7 py-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xl font-black text-slate-950">100%</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Complete</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xl font-black text-slate-950">{totalPages}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Pages</p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                  <p className="text-xl font-black text-emerald-700">✓</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">Finished</p>
                </div>
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                Notes and writing remain saved. You can review the module anytime.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={reviewFromBeginning}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Review from Page 1
                </button>

                <Link
                  href="/flashcard-modules"
                  className="flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  Back to Modules
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="mt-3 w-full rounded-xl px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
              >
                Continue reviewing this page
              </button>
            </div>
          </div>
        </div>
      )}

      {notesConfirmMode && (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Confirm Action</p>
              <h3 className="mt-1 text-xl font-black text-slate-950">
                {notesConfirmMode === "all" ? "Reset all notes?" : `Clear Page ${activeToolbarPage}?`}
              </h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm leading-6 text-slate-600">
                {notesConfirmMode === "all"
                  ? "This permanently removes pen, text, highlighter and eraser annotations from every page in this module."
                  : `This removes all notes from Page ${activeToolbarPage}. Other pages stay unchanged.`}
              </p>
              <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                Reading progress, last page and completion percentage will not be reset.
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setNotesConfirmMode(null)} disabled={resettingAllNotes}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700">Cancel</button>
                <button type="button" onClick={() => notesConfirmMode === "all" ? void resetAllNotes() : confirmClearCurrentPage()}
                  disabled={resettingAllNotes}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white ${notesConfirmMode === "all" ? "bg-red-600" : "bg-amber-500"}`}>
                  {resettingAllNotes && notesConfirmMode === "all" && <Loader2 size={16} className="animate-spin" />}
                  {resettingAllNotes && notesConfirmMode === "all" ? "Resetting..." : notesConfirmMode === "all" ? "Reset All" : "Clear Page"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notesMessage && (
        <div className="fixed bottom-5 left-1/2 z-[190] -translate-x-1/2 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xl">
          {notesMessage}
        </div>
      )}
    </main>
  );
}

const InteractiveFlipPage = forwardRef<HTMLDivElement, FlipPageProps>(
  function InteractiveFlipPage(
    {
      pageNumber,
      imageUrl,
      annotations,
      tool,
      color,
      penWidth,
      onAddAnnotation,
    },
    forwardedRef,
  ) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawingRef = useRef(false);
    const pointsRef = useRef<Point[]>([]);

    const [canvasSize, setCanvasSize] = useState({
      width: 0,
      height: 0,
    });

    function setWrapperNode(node: HTMLDivElement | null) {
      wrapperRef.current = node;

      if (typeof forwardedRef === "function") {
        forwardedRef(node);
        return;
      }

      if (forwardedRef) {
        forwardedRef.current = node;
      }
    }

  useEffect(() => {
  const wrapperElement = wrapperRef.current;

  if (!wrapperElement) {
    return;
  }

  const updateCanvasSize = () => {
    const rect = wrapperElement.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    setCanvasSize({
      width: rect.width,
      height: rect.height,
    });
  };

  updateCanvasSize();

  const observer = new ResizeObserver(() => {
    updateCanvasSize();
  });

  observer.observe(wrapperElement);

  return () => {
    observer.disconnect();
  };
}, []);

    useEffect(() => {
      renderAnnotationCanvas();
    }, [annotations, canvasSize]);

    function renderAnnotationCanvas(temporaryStroke?: StrokeAnnotation) {
      const canvas = canvasRef.current;

      if (!canvas || !canvasSize.width || !canvasSize.height) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const ratio = window.devicePixelRatio || 1;

      canvas.width = Math.round(canvasSize.width * ratio);
      canvas.height = Math.round(canvasSize.height * ratio);
      canvas.style.width = `${canvasSize.width}px`;
      canvas.style.height = `${canvasSize.height}px`;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      annotations.forEach((annotation) => {
        drawAnnotation(
          ctx,
          annotation,
          canvasSize.width,
          canvasSize.height,
        );
      });

      if (temporaryStroke) {
        drawAnnotation(
          ctx,
          temporaryStroke,
          canvasSize.width,
          canvasSize.height,
        );
      }
    }

    function getNormalisedPoint(
      event: ReactPointerEvent<HTMLCanvasElement>,
    ): Point {
      const rect = event.currentTarget.getBoundingClientRect();

      return {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
    }

    function handlePointerDown(
      event: ReactPointerEvent<HTMLCanvasElement>,
    ) {
      if (tool === "pointer") return;

      event.preventDefault();
      event.stopPropagation();

      if (tool === "text") {
        const point = getNormalisedPoint(event);
        const text = window.prompt("Type your answer:");

        if (!text?.trim()) return;

        onAddAnnotation(pageNumber, {
          id: crypto.randomUUID(),
          type: "text",
          x: point.x,
          y: point.y,
          text: text.trim(),
          color,
          size: Math.max(18, penWidth * 5),
        });

        return;
      }

      drawingRef.current = true;
      pointsRef.current = [getNormalisedPoint(event)];

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Ignore unsupported pointer capture.
      }
    }

    function handlePointerMove(
      event: ReactPointerEvent<HTMLCanvasElement>,
    ) {
      if (!drawingRef.current) return;

      event.preventDefault();
      event.stopPropagation();

      pointsRef.current = [
        ...pointsRef.current,
        getNormalisedPoint(event),
      ];

      const temporaryStroke: StrokeAnnotation = {
        id: "temporary",
        type: "stroke",
        tool:
          tool === "eraser"
            ? "eraser"
            : tool === "highlighter"
              ? "highlighter"
              : "pen",
        color,
        width:
          tool === "highlighter"
            ? penWidth * 4
            : tool === "eraser"
              ? penWidth * 5
              : penWidth,
        points: pointsRef.current,
      };

      renderAnnotationCanvas(temporaryStroke);
    }

    function finishDrawing(
      event?: ReactPointerEvent<HTMLCanvasElement>,
    ) {
      if (!drawingRef.current) return;

      event?.preventDefault();
      event?.stopPropagation();

      drawingRef.current = false;

      if (pointsRef.current.length < 2) {
        pointsRef.current = [];
        renderAnnotationCanvas();
        return;
      }

      const annotation: StrokeAnnotation = {
        id: crypto.randomUUID(),
        type: "stroke",
        tool:
          tool === "eraser"
            ? "eraser"
            : tool === "highlighter"
              ? "highlighter"
              : "pen",
        color,
        width:
          tool === "highlighter"
            ? penWidth * 4
            : tool === "eraser"
              ? penWidth * 5
              : penWidth,
        points: pointsRef.current,
      };

      onAddAnnotation(pageNumber, annotation);
      pointsRef.current = [];
    }

    return (
      <div
        ref={setWrapperNode}
        className="relative h-full w-full overflow-hidden bg-white"
        data-density="soft"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Page ${pageNumber}`}
            draggable={false}
            onContextMenu={(event) => event.preventDefault()}
            className="absolute inset-0 h-full w-full select-none object-contain"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-white">
            <div className="text-center">
              <Loader2
                size={24}
                className="mx-auto animate-spin text-indigo-600"
              />
              <p className="mt-3 text-xs font-bold text-slate-400">
                Loading Page {pageNumber}...
              </p>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
          onPointerLeave={(event) => {
            if (drawingRef.current) finishDrawing(event);
          }}
          className={`absolute inset-0 z-20 h-full w-full touch-none ${
            tool === "pointer"
              ? "pointer-events-none"
              : tool === "text"
                ? "cursor-text"
                : "cursor-crosshair"
          }`}
        />

        <span className="pointer-events-none absolute bottom-3 right-3 z-30 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-slate-600 shadow-sm backdrop-blur">
          {pageNumber}
        </span>
      </div>
    );
  },
);

function drawAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  canvasWidth: number,
  canvasHeight: number,
) {
  ctx.save();

  if (annotation.type === "text") {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = annotation.color;
    ctx.font = `600 ${annotation.size}px Arial, sans-serif`;
    ctx.textBaseline = "top";
    ctx.fillText(
      annotation.text,
      annotation.x * canvasWidth,
      annotation.y * canvasHeight,
    );
    ctx.restore();
    return;
  }

  if (annotation.points.length < 2) {
    ctx.restore();
    return;
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = annotation.width;

  if (annotation.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#000000";
  } else if (annotation.tool === "highlighter") {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = annotation.color;
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.strokeStyle = annotation.color;
  }

  ctx.beginPath();

  const firstPoint = annotation.points[0];
  ctx.moveTo(
    firstPoint.x * canvasWidth,
    firstPoint.y * canvasHeight,
  );

  for (let index = 1; index < annotation.points.length; index++) {
    const point = annotation.points[index];
    ctx.lineTo(
      point.x * canvasWidth,
      point.y * canvasHeight,
    );
  }

  ctx.stroke();
  ctx.restore();
}

function ToolButton({
  children,
  active,
  danger,
  disabled,
  title,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-30 sm:h-10 sm:w-10 sm:rounded-lg ${
        active
          ? "bg-indigo-500 text-white shadow"
          : danger
            ? "text-red-300 hover:bg-red-500/20"
            : "text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-7 w-px shrink-0 bg-white/20" />;
}

function PageJump({
  currentPage,
  totalPages,
  onJump,
}: {
  currentPage: number;
  totalPages: number;
  onJump: (page: number) => void;
}) {
  const [value, setValue] = useState(String(currentPage));

  useEffect(() => {
    setValue(String(currentPage));
  }, [currentPage]);

  function submitPage() {
    const page = Number(value);

    if (!Number.isFinite(page)) {
      setValue(String(currentPage));
      return;
    }

    onJump(page);
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
      <input
        type="number"
        min={1}
        max={totalPages}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submitPage();
          }
        }}
        onBlur={submitPage}
        className="w-12 bg-transparent text-center text-xs font-black text-slate-800 outline-none"
        aria-label="Jump to page"
      />
      <span className="text-xs font-black text-slate-400">
        / {totalPages}
      </span>
    </div>
  );
}