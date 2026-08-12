"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  GripVertical,
  ImageIcon,
  Loader2,
  Move,
  RefreshCw,
  Settings2,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { createClient } from "@/lib/client";

/* =========================================================
   TYPES
========================================================= */

type ModuleRow = {
  id: string;
  title: string;
  description: string | null;
  storage_prefix: string | null;
  total_pages: number | null;
  display_order: number | null;
  allow_annotation: boolean;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type ModulePreset = {
  title: string;
  description: string;
  order: number;
  level: string;
  code: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const moduleOptions: ModulePreset[] = [
  {
    title: "Modul Membaca 1",
    description: "Modul bacaan asas",
    order: 1,
    level: "Foundation",
    code: "modul-1",
  },
  {
    title: "Modul Membaca 2",
    description: "Modul bacaan berperingkat",
    order: 2,
    level: "Progressive",
    code: "modul-2",
  },
  {
    title: "Modul Membaca 3",
    description: "Modul bacaan lanjutan",
    order: 3,
    level: "Advanced",
    code: "modul-3",
  },
];

const BUCKET = "learninghub-books";

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminFlashcardModulesPage() {
  const supabase = useMemo(() => createClient(), []);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [selectedModule, setSelectedModule] =
    useState(0);

  const [pageFiles, setPageFiles] =
    useState<File[]>([]);

  const [draggedIndex, setDraggedIndex] =
    useState<number | null>(null);

  const [existingModules, setExistingModules] =
    useState<ModuleRow[]>([]);

  const [allowAnnotation, setAllowAnnotation] =
    useState(true);

  const [isActive, setIsActive] =
    useState(true);

  const [loadingModules, setLoadingModules] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [uploadedCount, setUploadedCount] =
    useState(0);

  const [currentUploadName, setCurrentUploadName] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<"success" | "error" | "">("");

  const currentModule =
    moduleOptions[selectedModule];

  const existingCurrentModule =
    existingModules.find(
      (item) =>
        item.title === currentModule.title,
    );

  const totalSelectedSize =
    pageFiles.reduce(
      (sum, file) => sum + file.size,
      0,
    );

  /* =======================================================
     LOAD MODULES
  ======================================================= */

  async function loadModules() {
    try {
      setLoadingModules(true);

      const { data, error } = await supabase
        .from("flashcard_modules")
        .select(
          `
            id,
            title,
            description,
            storage_prefix,
            total_pages,
            display_order,
            allow_annotation,
            is_active,
            created_at,
            updated_at
          `,
        )
        .order("display_order", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setExistingModules(
        (data ?? []) as ModuleRow[],
      );
    } catch (error) {
      console.error(
        "Load modules error:",
        error,
      );

      setMessageType("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load modules.",
      );
    } finally {
      setLoadingModules(false);
    }
  }

  useEffect(() => {
    loadModules();
  }, []);

  /* =======================================================
     MODULE CHANGE
  ======================================================= */

  useEffect(() => {
    if (existingCurrentModule) {
      setAllowAnnotation(
        existingCurrentModule.allow_annotation,
      );

      setIsActive(
        existingCurrentModule.is_active,
      );
    } else {
      setAllowAnnotation(true);
      setIsActive(true);
    }

    clearSelectedFiles();

    setMessage("");
    setMessageType("");
  }, [selectedModule]);

  /* =======================================================
     FILE FUNCTIONS
  ======================================================= */

  function clearSelectedFiles() {
    setPageFiles([]);
    setDraggedIndex(null);

    setUploadProgress(0);
    setUploadedCount(0);
    setCurrentUploadName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function naturalSort(files: File[]) {
    return [...files].sort((a, b) =>
      a.name.localeCompare(
        b.name,
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        },
      ),
    );
  }

  function handleFilesSelected(
    files: FileList | null,
  ) {
    if (!files) return;

    const selected = Array.from(files);

    const accepted =
      selected.filter((file) => {
        const lower =
          file.name.toLowerCase();

        return (
          file.type === "image/webp" ||
          file.type === "image/jpeg" ||
          file.type === "image/png" ||
          lower.endsWith(".webp") ||
          lower.endsWith(".jpg") ||
          lower.endsWith(".jpeg") ||
          lower.endsWith(".png")
        );
      });

    if (
      accepted.length !== selected.length
    ) {
      setMessageType("error");

      setMessage(
        "Only WEBP, JPG, JPEG and PNG book pages are allowed.",
      );

      return;
    }

    const sorted = naturalSort(accepted);

    setPageFiles(sorted);

    setMessage("");
    setMessageType("");

    setUploadProgress(0);
    setUploadedCount(0);
  }

  function getFileExtension(
    filename: string,
  ) {
    const extension =
      filename
        .split(".")
        .pop()
        ?.toLowerCase();

    if (
      extension === "jpg" ||
      extension === "jpeg" ||
      extension === "png" ||
      extension === "webp"
    ) {
      return extension;
    }

    return "webp";
  }

  /* =======================================================
     REORDER FUNCTIONS
  ======================================================= */

  function handleDragStart(
    index: number,
  ) {
    setDraggedIndex(index);
  }

  function handleDragOver(
    event: React.DragEvent<HTMLDivElement>,
    targetIndex: number,
  ) {
    event.preventDefault();

    if (
      draggedIndex === null ||
      draggedIndex === targetIndex
    ) {
      return;
    }

    setPageFiles((currentFiles) => {
      const updatedFiles =
        [...currentFiles];

      const [movedFile] =
        updatedFiles.splice(
          draggedIndex,
          1,
        );

      updatedFiles.splice(
        targetIndex,
        0,
        movedFile,
      );

      return updatedFiles;
    });

    setDraggedIndex(targetIndex);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  function movePageUp(
    index: number,
  ) {
    if (index <= 0) return;

    setPageFiles((currentFiles) => {
      const updated =
        [...currentFiles];

      [
        updated[index - 1],
        updated[index],
      ] = [
        updated[index],
        updated[index - 1],
      ];

      return updated;
    });
  }

  function movePageDown(
    index: number,
  ) {
    setPageFiles((currentFiles) => {
      if (
        index >=
        currentFiles.length - 1
      ) {
        return currentFiles;
      }

      const updated =
        [...currentFiles];

      [
        updated[index],
        updated[index + 1],
      ] = [
        updated[index + 1],
        updated[index],
      ];

      return updated;
    });
  }

  function moveToPage(
    fromIndex: number,
    targetPage: number,
  ) {
    const targetIndex =
      Math.max(
        0,
        Math.min(
          targetPage - 1,
          pageFiles.length - 1,
        ),
      );

    if (
      fromIndex === targetIndex
    ) {
      return;
    }

    setPageFiles((currentFiles) => {
      const updated =
        [...currentFiles];

      const [movedFile] =
        updated.splice(
          fromIndex,
          1,
        );

      updated.splice(
        targetIndex,
        0,
        movedFile,
      );

      return updated;
    });
  }

  /* =======================================================
     STORAGE CLEANUP
  ======================================================= */

  async function deleteOldModulePages(
    prefix: string,
  ) {
    const { data, error } =
      await supabase.storage
        .from(BUCKET)
        .list(prefix, {
          limit: 1000,
        });

    if (error) {
      throw error;
    }

    if (!data?.length) {
      return;
    }

    const paths = data.map(
      (file) =>
        `${prefix}/${file.name}`,
    );

    const {
      error: deleteError,
    } = await supabase.storage
      .from(BUCKET)
      .remove(paths);

    if (deleteError) {
      throw deleteError;
    }
  }

  /* =======================================================
     UPLOAD
  ======================================================= */

  async function handleUpload() {
  if (pageFiles.length === 0) {
    setMessageType("error");
    setMessage("Please select your book pages first.");
    return;
  }

  try {
    setUploading(true);

    setMessage("");
    setMessageType("");

    setUploadProgress(0);
    setUploadedCount(0);

    const version = Date.now();

    const storagePrefix =
      `modul-membaca/${currentModule.code}/${version}`;

    for (
      let index = 0;
      index < pageFiles.length;
      index++
    ) {
      const file = pageFiles[index];

      setCurrentUploadName(file.name);

      const extension =
        getFileExtension(file.name);

      const pageNumber =
        String(index + 1).padStart(
          3,
          "0",
        );

      const storagePath =
        `${storagePrefix}/page-${pageNumber}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from(BUCKET)
        .upload(
          storagePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType:
              file.type ||
              undefined,
          },
        );

      if (uploadError) {
        const uploadErrorDetails =
          uploadError as {
            message?: string;
            error?: string;
            statusCode?: string | number;
            status?: number;
          };

        const uploadMessage =
          uploadErrorDetails.message ||
          uploadErrorDetails.error ||
          "Unknown storage error.";

        const uploadStatus =
          uploadErrorDetails.statusCode ||
          uploadErrorDetails.status;

        throw {
          message:
            `Page ${index + 1} upload failed: ${uploadMessage}`,
          statusCode: uploadStatus,
        };
      }

      const completed =
        index + 1;

      setUploadedCount(completed);

      setUploadProgress(
        Math.round(
          (completed /
            pageFiles.length) *
            100,
        ),
      );
    }

    /* =========================================
       UPDATE EXISTING MODULE
    ========================================= */

    if (existingCurrentModule) {
      const oldPrefix =
        existingCurrentModule.storage_prefix;

      const {
        error: updateError,
      } = await supabase
        .from("flashcard_modules")
        .update({
          description:
            currentModule.description,

          storage_prefix:
            storagePrefix,

          total_pages:
            pageFiles.length,

          display_order:
            currentModule.order,

          allow_annotation:
            allowAnnotation,

          is_active:
            isActive,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          existingCurrentModule.id,
        );

      if (updateError) {
        const updateDetails =
          updateError as {
            message?: string;
            code?: string;
          };

        throw {
          message:
            updateDetails.message ||
            "Unable to update module database.",
          statusCode:
            updateDetails.code,
        };
      }

      /*
       * Delete old storage only AFTER
       * new upload + DB update succeeds.
       */
      if (
        oldPrefix &&
        oldPrefix !== storagePrefix
      ) {
        try {
          await deleteOldModulePages(
            oldPrefix,
          );
        } catch {
          /*
           * Cleanup failure should not
           * break successful replacement.
           */
        }
      }

      setMessageType("success");

      setMessage(
        `${currentModule.title} replaced successfully. ${pageFiles.length} pages published.`,
      );
    } else {
      /* =========================================
         CREATE NEW MODULE
      ========================================= */

      const {
        error: insertError,
      } = await supabase
        .from("flashcard_modules")
        .insert({
          title:
            currentModule.title,

          description:
            currentModule.description,

          storage_prefix:
            storagePrefix,

          total_pages:
            pageFiles.length,

          display_order:
            currentModule.order,

          allow_annotation:
            allowAnnotation,

          is_active:
            isActive,

          pdf_path: null,
        });

      if (insertError) {
        const insertDetails =
          insertError as {
            message?: string;
            code?: string;
          };

        throw {
          message:
            insertDetails.message ||
            "Unable to create module database record.",
          statusCode:
            insertDetails.code,
        };
      }

      setMessageType("success");

      setMessage(
        `${currentModule.title} published successfully. ${pageFiles.length} pages uploaded.`,
      );
    }

    setCurrentUploadName("");

    await loadModules();

    clearSelectedFiles();
  } catch (error: unknown) {
    const err =
      error as {
        message?: string;
        error?: string;
        statusCode?:
          string | number;
        status?: number;
      };

    const readableMessage =
      err?.message ||
      err?.error ||
      "Unable to upload book.";

    const statusCode =
      err?.statusCode ||
      err?.status;

    setMessageType("error");

    setMessage(
      statusCode
        ? `${readableMessage} (Status ${statusCode})`
        : readableMessage,
    );
  } finally {
    setUploading(false);
    setCurrentUploadName("");
  }
}

  /* =======================================================
     SAVE SETTINGS ONLY
  ======================================================= */

  async function handleSaveSettings() {
    if (!existingCurrentModule) {
      setMessageType("error");

      setMessage(
        "Upload this module first.",
      );

      return;
    }

    try {
      const { error } =
        await supabase
          .from("flashcard_modules")
          .update({
            allow_annotation:
              allowAnnotation,

            is_active:
              isActive,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            existingCurrentModule.id,
          );

      if (error) {
        throw error;
      }

      setMessageType("success");

      setMessage(
        "Module settings saved successfully.",
      );

      await loadModules();
    } catch (error) {
      setMessageType("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save settings.",
      );
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-slate-950">
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/flashcard-modules/progress"
              className="group inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              <BarChart3 size={17} />
              <span className="hidden sm:inline">Reading Progress</span>
              <ChevronRight
                size={15}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 lg:flex">
              <ShieldCheck size={15} />
              Private Book Manager
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-8 lg:px-8 lg:py-10">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-6 py-8 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)] lg:px-10 lg:py-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-indigo-200">
                  <BookOpenCheck
                    size={26}
                  />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-300">
                    FD Arcadia Learning Hub
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    Interactive Book Management
                  </p>
                </div>
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight lg:text-5xl">
                Modul Membaca
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                Upload, arrange and publish book pages as a responsive
                digital flipbook for parents.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
                  Image Preview
                </span>

                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
                  Drag & Reorder
                </span>

                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
                  Flipbook Ready
                </span>

                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
                  Writing Layer
                </span>
              </div>
            </div>

            {/* MODULE SUMMARY */}
            <div className="grid grid-cols-3 gap-3">
              {moduleOptions.map(
                (module) => {
                  const uploaded =
                    existingModules.find(
                      (item) =>
                        item.title ===
                        module.title,
                    );

                  return (
                    <div
                      key={
                        module.order
                      }
                      className="min-w-[94px] rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-center backdrop-blur"
                    >
                      <p className="text-2xl font-black">
                        {uploaded
                          ? uploaded.total_pages ??
                            0
                          : "—"}
                      </p>

                      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Book{" "}
                        {module.order}
                      </p>

                      <p className="mt-2 text-[10px] text-slate-400">
                        {uploaded
                          ? "Pages"
                          : "Empty"}
                      </p>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </section>

        {/* MODULE SELECTOR */}
        <section className="mt-9">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
            Book Library
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Select Module
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {moduleOptions.map(
              (
                module,
                index,
              ) => {
                const active =
                  selectedModule ===
                  index;

                const uploaded =
                  existingModules.find(
                    (item) =>
                      item.title ===
                      module.title,
                  );

                return (
                  <button
                    key={module.code}
                    type="button"
                    disabled={
                      uploading
                    }
                    onClick={() =>
                      setSelectedModule(
                        index,
                      )
                    }
                    className={`rounded-[1.6rem] border p-5 text-left transition ${
                      active
                        ? "border-slate-950 bg-slate-950 text-white shadow-xl"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={`text-[10px] font-black uppercase tracking-[0.18em] ${
                            active
                              ? "text-slate-400"
                              : "text-indigo-500"
                          }`}
                        >
                          Book{" "}
                          {
                            module.order
                          }
                        </p>

                        <h3 className="mt-2 text-lg font-black">
                          {
                            module.title
                          }
                        </h3>

                        <p
                          className={`mt-1 text-xs ${
                            active
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          {
                            module.level
                          }
                        </p>
                      </div>

                      {uploaded ? (
                        <CheckCircle2
                          size={23}
                          className={
                            active
                              ? "text-emerald-400"
                              : "text-emerald-600"
                          }
                        />
                      ) : (
                        <span
                          className={`h-3 w-3 rounded-full ${
                            active
                              ? "bg-slate-600"
                              : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[10px] font-black ${
                          uploaded
                            ? active
                              ? "bg-emerald-400/15 text-emerald-300"
                              : "bg-emerald-50 text-emerald-700"
                            : active
                              ? "bg-white/10 text-slate-300"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {uploaded
                          ? `${uploaded.total_pages ?? 0} Pages`
                          : "Not Uploaded"}
                      </span>

                      {active && (
                        <span className="text-xs font-bold">
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="mt-7 grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
          {/* MAIN CARD */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            {/* TITLE */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
                  Book Pages
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {currentModule.title}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {currentModule.description}
                </p>
              </div>

              <span className="self-start rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600">
                Display Order{" "}
                {currentModule.order}
              </span>
            </div>

            {/* CURRENT */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-indigo-700 shadow-sm">
                    <BookOpenCheck
                      size={20}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Current Book
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-800">
                      {existingCurrentModule
                        ? `${existingCurrentModule.total_pages ?? 0} pages published`
                        : "No book uploaded"}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-black ${
                    existingCurrentModule
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {existingCurrentModule
                    ? "Live"
                    : "Empty"}
                </span>
              </div>
            </div>

            {/* FILE INPUT */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".webp,.jpg,.jpeg,.png,image/webp,image/jpeg,image/png"
              className="hidden"
              onChange={(
                event,
              ) =>
                handleFilesSelected(
                  event.target
                    .files,
                )
              }
            />

            {/* UPLOAD DROP AREA */}
            <button
              type="button"
              disabled={uploading}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className={`mt-6 flex min-h-[240px] w-full flex-col items-center justify-center rounded-[1.8rem] border-2 border-dashed p-6 text-center transition ${
                pageFiles.length > 0
                  ? "border-emerald-300 bg-emerald-50/40"
                  : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40"
              }`}
            >
              {pageFiles.length >
              0 ? (
                <>
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Check
                      size={30}
                    />
                  </div>

                  <h3 className="mt-5 text-xl font-black">
                    {
                      pageFiles.length
                    }{" "}
                    pages selected
                  </h3>

                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Total size:{" "}
                    {(
                      totalSelectedSize /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>

                  <span className="mt-5 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-700">
                    Change Images
                  </span>
                </>
              ) : (
                <>
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-indigo-700 shadow-sm">
                    <UploadCloud
                      size={29}
                    />
                  </div>

                  <h3 className="mt-5 text-xl font-black">
                    Choose Book Pages
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Select all book
                    images at once.
                    You can rearrange
                    them before
                    publishing.
                  </p>

                  <span className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
                    Select Images
                  </span>

                  <p className="mt-4 text-xs text-slate-400">
                    WEBP • JPG • PNG
                  </p>
                </>
              )}
            </button>

            {/* ARRANGE PAGES */}
            {pageFiles.length > 0 &&
              !uploading && (
                <section className="mt-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-500">
                        Page Organizer
                      </p>

                      <h3 className="mt-1 text-xl font-black">
                        Arrange Book
                        Pages
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Check the
                        thumbnail and
                        arrange every
                        page before
                        publishing.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700">
                        {
                          pageFiles.length
                        }{" "}
                        Pages
                      </span>

                      <button
                        type="button"
                        onClick={
                          clearSelectedFiles
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
                      >
                        <X
                          size={14}
                        />
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* TIP */}
                  <div className="mt-4 flex gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                    <Move
                      size={18}
                      className="mt-0.5 shrink-0 text-indigo-600"
                    />

                    <p className="text-xs leading-5 text-indigo-700">
                      <strong>
                        Drag any
                        page
                      </strong>{" "}
                      untuk susun
                      semula. Untuk
                      page yang jauh,
                      gunakan{" "}
                      <strong>
                        Move to Page
                      </strong>
                      .
                    </p>
                  </div>

                  {/* PAGE LIST */}
                  <div className="mt-4 overflow-hidden rounded-[1.6rem] border border-slate-200">
                    {/* DESKTOP HEADER */}
                    <div className="hidden grid-cols-[55px_90px_1fr_145px_90px] items-center gap-3 border-b border-slate-200 bg-slate-100 px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 sm:grid">
                      <span>
                        Move
                      </span>

                      <span>
                        Preview
                      </span>

                      <span>
                        File
                      </span>

                      <span className="text-center">
                        Position
                      </span>

                      <span className="text-center">
                        Page
                      </span>
                    </div>

                    <div className="max-h-[700px] overflow-y-auto bg-slate-50">
                      {pageFiles.map(
                        (
                          file,
                          index,
                        ) => (
                          <PageOrganizerRow
                            key={`${file.name}-${file.size}-${file.lastModified}`}
                            file={
                              file
                            }
                            index={
                              index
                            }
                            totalPages={
                              pageFiles.length
                            }
                            dragging={
                              draggedIndex ===
                              index
                            }
                            onDragStart={() =>
                              handleDragStart(
                                index,
                              )
                            }
                            onDragOver={(
                              event,
                            ) =>
                              handleDragOver(
                                event,
                                index,
                              )
                            }
                            onDragEnd={
                              handleDragEnd
                            }
                            onMoveUp={() =>
                              movePageUp(
                                index,
                              )
                            }
                            onMoveDown={() =>
                              movePageDown(
                                index,
                              )
                            }
                            onMoveToPage={(
                              page,
                            ) =>
                              moveToPage(
                                index,
                                page,
                              )
                            }
                          />
                        ),
                      )}
                    </div>
                  </div>
                </section>
              )}

            {/* UPLOAD PROGRESS */}
            {uploading && (
              <div className="mt-6 rounded-[1.6rem] border border-indigo-200 bg-indigo-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-white">
                    <Loader2
                      className="animate-spin"
                      size={20}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black text-indigo-950">
                        Uploading
                        Book
                      </p>

                      <p className="text-sm font-black text-indigo-700">
                        {
                          uploadProgress
                        }
                        %
                      </p>
                    </div>

                    <p className="mt-1 truncate text-xs text-indigo-600">
                      {
                        currentUploadName
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>
                    {
                      uploadedCount
                    }{" "}
                    /{" "}
                    {
                      pageFiles.length
                    }{" "}
                    pages
                  </span>

                  <span>
                    Keep this page
                    open
                  </span>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                <div className="pr-4">
                  <p className="font-black text-slate-800">
                    Allow Writing
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Parent can
                    write,
                    highlight and
                    erase on the
                    book.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={
                    allowAnnotation
                  }
                  onChange={(
                    event,
                  ) =>
                    setAllowAnnotation(
                      event.target
                        .checked,
                    )
                  }
                  className="h-5 w-5 accent-indigo-600"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                <div className="pr-4">
                  <p className="font-black text-slate-800">
                    Parent
                    Visibility
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Show this
                    module in
                    parent portal.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={
                    isActive
                  }
                  onChange={(
                    event,
                  ) =>
                    setIsActive(
                      event.target
                        .checked,
                    )
                  }
                  className="h-5 w-5 accent-indigo-600"
                />
              </label>
            </div>

            {/* MESSAGE */}
            {message && (
              <div
                className={`mt-6 rounded-2xl border px-4 py-4 text-sm font-bold ${
                  messageType ===
                  "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* BUTTONS */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={
                  handleUpload
                }
                disabled={
                  uploading ||
                  pageFiles.length ===
                    0
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
              >
                {uploading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud
                      size={18}
                    />

                    {existingCurrentModule
                      ? `Replace with ${pageFiles.length} Pages`
                      : `Publish ${pageFiles.length} Pages`}
                  </>
                )}
              </button>

              {existingCurrentModule && (
                <button
                  type="button"
                  disabled={
                    uploading
                  }
                  onClick={
                    handleSaveSettings
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  <Settings2
                    size={17}
                  />
                  Save Settings
                </button>
              )}
            </div>
          </div>

          {/* SIDE PANEL */}
          <aside className="space-y-5">
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
                Book Status
              </p>

              <h3 className="mt-2 text-xl font-black">
                {currentModule.title}
              </h3>

              <div className="mt-6 space-y-3">
                <StatusItem
                  label="Pages"
                  value={
                    existingCurrentModule
                      ? String(
                          existingCurrentModule.total_pages ??
                            0,
                        )
                      : "0"
                  }
                />

                <StatusItem
                  label="Storage"
                  value={
                    existingCurrentModule
                      ? "Uploaded"
                      : "Empty"
                  }
                />

                <StatusItem
                  label="Writing"
                  value={
                    existingCurrentModule?.allow_annotation
                      ? "Enabled"
                      : "Disabled"
                  }
                />

                <StatusItem
                  label="Parent View"
                  value={
                    existingCurrentModule?.is_active
                      ? "Active"
                      : "Hidden"
                  }
                />
              </div>
            </div>

            <div className="rounded-[1.8rem] bg-slate-950 p-6 text-white shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Flipbook Setup
              </p>

              <h3 className="mt-2 text-xl font-black">
                Image-based Reader
              </h3>

              <div className="mt-6 space-y-5">
                <FeatureRow
                  icon={
                    ImageIcon
                  }
                  title="Real Thumbnails"
                  text="Admin can visually check every page before publishing."
                />

                <FeatureRow
                  icon={Move}
                  title="Page Organizer"
                  text="Drag, move up/down or jump directly to another page."
                />

                <FeatureRow
                  icon={
                    BookOpenCheck
                  }
                  title="Page Flip"
                  text="Pages are prepared for the parent flipbook reader."
                />

                <FeatureRow
                  icon={
                    RefreshCw
                  }
                  title="Responsive"
                  text="Designed for phone, tablet, iPad and laptop."
                />

                <FeatureRow
                  icon={
                    ShieldCheck
                  }
                  title="Protected"
                  text="No original PDF needs to be exposed to parents."
                />
              </div>
            </div>

            <Link
              href="/admin/flashcard-modules/progress"
              className="group flex items-center justify-between rounded-[1.6rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                  <BarChart3 size={21} />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-indigo-500">
                    Analytics
                  </p>

                  <p className="mt-1 font-black text-slate-950">
                    Reading Progress
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Track parent reading activity
                  </p>
                </div>
              </div>

              <ChevronRight className="text-indigo-600 transition group-hover:translate-x-1" />
            </Link>

            <Link
              href="/flashcard-modules"
              className="group flex items-center justify-between rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Parent Preview
                </p>

                <p className="mt-1 font-black">
                  Open Modul
                  Membaca
                </p>
              </div>

              <ChevronRight className="transition group-hover:translate-x-1" />
            </Link>
          </aside>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   PAGE ORGANIZER ROW
========================================================= */

function PageOrganizerRow({
  file,
  index,
  totalPages,
  dragging,
  onDragStart,
  onDragOver,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onMoveToPage,
}: {
  file: File;
  index: number;
  totalPages: number;
  dragging: boolean;

  onDragStart: () => void;

  onDragOver: (
    event: React.DragEvent<HTMLDivElement>,
  ) => void;

  onDragEnd: () => void;

  onMoveUp: () => void;

  onMoveDown: () => void;

  onMoveToPage: (
    page: number,
  ) => void;
}) {
  const [previewUrl, setPreviewUrl] =
    useState("");

  const [movePage, setMovePage] =
    useState(
      String(index + 1),
    );

  useEffect(() => {
    const objectUrl =
      URL.createObjectURL(file);

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(
        objectUrl,
      );
    };
  }, [file]);

  useEffect(() => {
    setMovePage(
      String(index + 1),
    );
  }, [index]);

  function confirmMove() {
    const page =
      Number(movePage);

    if (
      !Number.isFinite(page)
    ) {
      return;
    }

    onMoveToPage(page);
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`grid grid-cols-[42px_68px_1fr_auto] items-center gap-3 border-b border-slate-100 px-3 py-3 transition last:border-b-0 sm:grid-cols-[55px_90px_1fr_145px_90px] sm:px-4 ${
        dragging
          ? "scale-[0.995] bg-indigo-100 opacity-60 shadow-inner"
          : "bg-white hover:bg-indigo-50/40"
      }`}
    >
      {/* DRAG */}
      <div
        className="grid h-11 w-10 cursor-grab place-items-center rounded-xl text-slate-300 transition hover:bg-slate-100 hover:text-indigo-600 active:cursor-grabbing"
        title="Drag page"
      >
        <GripVertical
          size={22}
        />
      </div>

      {/* THUMBNAIL */}
      <div className="flex justify-center">
        <div className="relative h-[84px] w-[64px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`Page ${
                index + 1
              }`}
              draggable={false}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-slate-200" />
          )}

          <div className="absolute bottom-1 right-1 rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[8px] font-black text-white">
            {index + 1}
          </div>
        </div>
      </div>

      {/* FILE */}
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-slate-800">
          {file.name}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {(
            file.size /
            1024
          ).toFixed(0)}{" "}
          KB
        </p>

        <p className="mt-2 text-[10px] font-black text-indigo-600 sm:hidden">
          PAGE{" "}
          {index + 1}
        </p>

        {/* MOBILE MOVE */}
        <div className="mt-3 flex gap-2 sm:hidden">
          <button
            type="button"
            disabled={
              index === 0
            }
            onClick={
              onMoveUp
            }
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-20"
          >
            <ArrowUp
              size={14}
            />
          </button>

          <button
            type="button"
            disabled={
              index ===
              totalPages - 1
            }
            onClick={
              onMoveDown
            }
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-20"
          >
            <ArrowDown
              size={14}
            />
          </button>
        </div>
      </div>

      {/* POSITION */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            disabled={
              index === 0
            }
            onClick={
              onMoveUp
            }
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-20"
            title="Move up"
          >
            <ArrowUp
              size={15}
            />
          </button>

          <button
            type="button"
            disabled={
              index ===
              totalPages - 1
            }
            onClick={
              onMoveDown
            }
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-20"
            title="Move down"
          >
            <ArrowDown
              size={15}
            />
          </button>

          <div className="relative">
            <input
              type="number"
              min={1}
              max={
                totalPages
              }
              value={
                movePage
              }
              onChange={(
                event,
              ) =>
                setMovePage(
                  event.target
                    .value,
                )
              }
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();

                  confirmMove();
                }
              }}
              className="h-9 w-12 rounded-xl border border-slate-200 bg-white text-center text-xs font-black text-slate-700 outline-none transition focus:border-indigo-400"
              title="Move to page"
            />
          </div>

          <button
            type="button"
            onClick={
              confirmMove
            }
            className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-700 transition hover:bg-indigo-100"
            title="Move to page"
          >
            <Move
              size={14}
            />
          </button>
        </div>
      </div>

      {/* PAGE NUMBER */}
      <div className="hidden sm:block">
        <div className="rounded-xl bg-slate-950 px-3 py-2.5 text-center text-white shadow-sm">
          <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
            Page
          </p>

          <p className="mt-0.5 text-sm font-black">
            {index + 1}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-xs font-bold text-slate-500">
        {label}
      </span>

      <span className="text-xs font-black text-slate-800">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   FEATURE
========================================================= */

function FeatureRow({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-indigo-200">
        <Icon size={19} />
      </div>

      <div>
        <p className="text-sm font-black">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {text}
        </p>
      </div>
    </div>
  );
}