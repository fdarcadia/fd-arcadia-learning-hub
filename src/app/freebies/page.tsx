"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  FolderOpen,
  Gift,
  Home,
  ImageIcon,
  Loader2,
  Palette,
  PencilLine,
  Search,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type Folder = {
  id: string;
  name: string;
};

type FreebieItem = {
  id: string;
  folder_id: string;
  title: string;
  description: string | null;
  google_drive_link: string;
  created_at?: string | null;
};

type FolderWithCount = Folder & {
  count: number;
};

const sidebarLinks = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Freebies", href: "/freebies", icon: Gift },
  { title: "Custom Worksheet", href: "/custom-worksheet", icon: FileText },
  { title: "Draw & Learn", href: "/worksheet", icon: Palette },
];

function getFileType(link: string) {
  const lower = link.toLowerCase();

  if (
    lower.includes(".png") ||
    lower.includes(".jpg") ||
    lower.includes(".jpeg") ||
    lower.includes(".webp")
  ) {
    return "image";
  }

  if (lower.includes(".pdf")) {
    return "pdf";
  }

  return "link";
}

function getResourceIcon(link: string) {
  const type = getFileType(link);

  if (type === "image") return ImageIcon;
  if (type === "pdf") return FileText;
  return BookOpen;
}

function getResourceLabel(link: string) {
  const type = getFileType(link);

  if (type === "image") return "Image Resource";
  if (type === "pdf") return "PDF Resource";
  return "Google Drive Link";
}

export default function FreebiesPage() {
  return <ProtectedPage>{() => <FreebiesContent />}</ProtectedPage>;
}

function FreebiesContent() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [items, setItems] = useState<FreebieItem[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFreebies();
  }, []);

  async function loadFreebies() {
    setLoading(true);
    setError("");

    const { data: folderData, error: folderError } = await supabase
      .from("freebies_folders")
      .select("*")
      .order("name", { ascending: true });

    if (folderError) {
      setError(folderError.message);
      setLoading(false);
      return;
    }

    const { data: itemData, error: itemError } = await supabase
      .from("freebies_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (itemError) {
      setError(itemError.message);
      setLoading(false);
      return;
    }

    setFolders((folderData || []) as Folder[]);
    setItems((itemData || []) as FreebieItem[]);
    setLoading(false);
  }

  const foldersWithCount = useMemo<FolderWithCount[]>(() => {
    return folders.map((folder) => ({
      ...folder,
      count: items.filter((item) => item.folder_id === folder.id).length,
    }));
  }, [folders, items]);

  const filteredItems = useMemo(() => {
    const byFolder =
      activeFolder === "all"
        ? items
        : items.filter((item) => item.folder_id === activeFolder);

    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return byFolder;

    return byFolder.filter((item) => {
      return (
        item.title.toLowerCase().includes(keyword) ||
        String(item.description || "").toLowerCase().includes(keyword)
      );
    });
  }, [activeFolder, items, searchText]);

  const activeFolderName =
    activeFolder === "all"
      ? "All Resources"
      : folders.find((folder) => folder.id === activeFolder)?.name ||
        "Selected Folder";

  const pdfCount = items.filter((item) => getFileType(item.google_drive_link) === "pdf").length;
  const imageCount = items.filter((item) => getFileType(item.google_drive_link) === "image").length;

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[250px_minmax(0,1fr)]">
        <FreebiesSidebar total={items.length} folders={foldersWithCount} />

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 transition hover:text-indigo-700"
              >
                <ArrowLeft size={15} />
                Back to Dashboard
              </Link>

              <p className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
                Free Resource Library
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                FD Arcadia Freebies
              </h1>

              <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-400">
                Free worksheets, flashcards and printable resources in one clean library.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/worksheet"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                <Palette size={15} />
                Draw & Learn
              </Link>

              <Link
                href="/custom-worksheet"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <FileText size={15} />
                Custom Worksheet
              </Link>
            </div>
          </header>

          {/* PREMIUM HERO */}
          <section className="relative mt-5 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#10162f] via-[#25265f] to-[#3f47a8] px-5 py-6 text-white shadow-[0_20px_55px_rgba(15,23,42,0.18)] sm:px-6">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-yellow-300">
                    <Gift size={21} />
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                      Free Learning Resources
                    </p>
                    <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                      Explore, download and learn.
                    </h2>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Browse by folder, search by title, open resources on Google Drive
                  or send supported files directly into Draw & Learn.
                </p>
              </div>

              <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.06] lg:min-w-[330px]">
                <HeroStat label="Resources" value={loading ? "..." : String(items.length)} />
                <HeroStat label="Folders" value={String(folders.length)} />
                <HeroStat label="PDF / Image" value={String(pdfCount + imageCount)} />
              </div>
            </div>
          </section>

          {error ? (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
              {error}
            </div>
          ) : null}

          {/* FILTER BAR */}
          <section className="mt-5 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
                  Browse Resources
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {activeFolderName}
                </h2>
              </div>

              <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:max-w-sm">
                <Search className="text-slate-400" size={17} />
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search freebies..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
              </label>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setActiveFolder("all")}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
                  activeFolder === "all"
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
                }`}
              >
                All ({items.length})
              </button>

              {foldersWithCount.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setActiveFolder(folder.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition ${
                    activeFolder === folder.id
                      ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"
                  }`}
                >
                  <FolderOpen size={14} />
                  {folder.name}
                  <span className="opacity-70">({folder.count})</span>
                </button>
              ))}
            </div>
          </section>

          {/* RESOURCE GRID */}
          <section className="mt-6">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Resources
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Free Downloads
                </h2>
              </div>

              <span className="text-xs font-black text-slate-400">
                {filteredItems.length} {filteredItems.length === 1 ? "resource" : "resources"}
              </span>
            </div>

            {loading ? (
              <LoadingCard />
            ) : filteredItems.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredItems.map((item) => (
                  <FreebieCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* COMPACT BOTTOM TOOLS */}
          <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <HowItWorksCard />
            <QuickToolsCard />
          </section>

          <footer className="mt-6 border-t border-slate-200 py-5 text-center text-[10px] font-semibold text-slate-400">
            FD Arcadia Free Resource Library
          </footer>
        </section>
      </div>
    </main>
  );
}

function FreebiesSidebar({
  total,
  folders,
}: {
  total: number;
  folders: FolderWithCount[];
}) {
  return (
    <aside className="hidden border-r border-indigo-950/10 bg-[#111735] px-4 py-6 text-white xl:flex xl:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-950/30">
          <Gift size={21} />
        </div>

        <div>
          <p className="text-sm font-black tracking-[0.08em]">FD ARCADIA</p>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-300">
            FREEBIES
          </p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1.5">
        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const active = item.title === "Freebies";

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-black transition ${
                active
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/20"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-7">
        <p className="px-3 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
          Folders
        </p>

        <div className="mt-2 space-y-1">
          {folders.slice(0, 8).map((folder) => (
            <div
              key={folder.id}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-300"
            >
              <span className="truncate">{folder.name}</span>
              <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[9px] text-violet-300">
                {folder.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-[20px] border border-violet-400/20 bg-gradient-to-br from-violet-600/35 to-indigo-500/15 p-4">
        <Star className="text-yellow-300" size={17} />
        <p className="mt-3 text-xs font-black">Free Library</p>
        <p className="mt-1 text-lg font-black">{total} Resources</p>
        <p className="mt-1 text-[10px] leading-5 text-indigo-200">
          Worksheets, flashcards and printable activities.
        </p>
      </div>
    </aside>
  );
}

function FreebieCard({ item }: { item: FreebieItem }) {
  const fileType = getFileType(item.google_drive_link);
  const Icon = getResourceIcon(item.google_drive_link);

  const accent =
    fileType === "pdf"
      ? "from-rose-50 via-orange-50 to-white text-rose-600"
      : fileType === "image"
        ? "from-sky-50 via-indigo-50 to-white text-sky-600"
        : "from-violet-50 via-indigo-50 to-white text-violet-600";

  return (
    <article className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <div className={`bg-gradient-to-br ${accent} p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-sm">
            <Icon size={20} />
          </div>

          <CheckCircle2 className="text-emerald-500" size={17} />
        </div>

        <span className="mt-4 inline-block rounded-full bg-white/80 px-3 py-1 text-[9px] font-black uppercase tracking-[0.08em] shadow-sm">
          {getResourceLabel(item.google_drive_link)}
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-black text-slate-950">
          {item.title}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
          {item.description || "Open this free learning resource."}
        </p>

        <div className="mt-4 grid gap-2">
          <a
            href={item.google_drive_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800"
          >
            <Download size={15} />
            Open Resource
          </a>

          <Link
            href={`/worksheet?file=${encodeURIComponent(
              item.google_drive_link
            )}&type=${fileType}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
          >
            <PencilLine size={15} />
            Open in Draw & Learn
          </Link>
        </div>
      </div>
    </article>
  );
}

function HowItWorksCard() {
  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
          <Sparkles size={18} />
        </div>

        <div>
          <h2 className="text-sm font-black text-slate-900">How it works</h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Choose a folder, open the resource, or send it directly into Draw &
            Learn if you want to practise digitally.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoPill icon={<FolderOpen size={18} />} text="Choose Folder" />
            <InfoPill icon={<Download size={18} />} text="Download" />
            <InfoPill icon={<PencilLine size={18} />} text="Draw & Learn" />
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickToolsCard() {
  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
          QUICK TOOLS
        </p>
        <h2 className="mt-1 text-2xl font-black text-indigo-700">
          More Resources
        </h2>
      </div>

      <div className="grid gap-3">
        <QuickLink
          href="/worksheet"
          icon={<Palette size={24} />}
          title="Draw & Learn Canvas"
          description="Open digital worksheet canvas."
        />
        <QuickLink
          href="/custom-worksheet"
          icon={<FileText size={24} />}
          title="Custom Worksheet"
          description="Open your purchased worksheet library."
        />
        <QuickLink
          href="/dashboard"
          icon={<Home size={24} />}
          title="Back Dashboard"
          description="Return to parent dashboard."
        />
      </div>
    </section>
  );
}

function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 transition hover:border-indigo-200 hover:bg-indigo-50/60"
    >
      <div className="flex items-center gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-indigo-500 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="text-[10px] text-slate-400">{description}</p>
        </div>
      </div>
      <ChevronRight className="text-indigo-400" size={16} />
    </Link>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-4 text-center">
      <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function InfoPill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-600">
      {icon}
      {text}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <Loader2 className="mx-auto animate-spin text-indigo-600" size={40} />
      <p className="mt-4 font-bold text-slate-500">Loading freebies...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <Gift className="mx-auto text-indigo-400" size={44} />
      <h2 className="mt-3 text-xl font-black text-slate-800">
        No freebies found
      </h2>
      <p className="mt-2 text-slate-500">
        Try another folder or wait for admin to upload resources.
      </p>
    </div>
  );
}