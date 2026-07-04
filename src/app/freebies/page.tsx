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
    <main className="min-h-screen bg-[#fbfaf7] text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[280px_1fr]">
        <FreebiesSidebar total={items.length} folders={foldersWithCount} />

        <section className="px-4 py-6 lg:px-8">
          <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <ArrowLeft size={20} />
                Back Dashboard
              </Link>

              <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                FREE DOWNLOADS
              </p>

              <h1 className="mt-1 text-4xl font-black text-indigo-700 sm:text-5xl">
                FD Arcadia Freebies
              </h1>

              <p className="mt-2 max-w-3xl text-slate-600">
                Download free worksheets, flashcards and learning resources.
                You can also open supported resources inside Draw & Learn.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/worksheet"
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Palette size={18} />
                Open Draw & Learn
              </Link>

              <Link
                href="/custom-worksheet"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-sm transition hover:bg-indigo-50"
              >
                Custom Worksheet
              </Link>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-7 text-white shadow-xl">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-yellow-200">
                  <Gift size={30} />
                </div>

                <div>
                  <p className="text-sm font-black tracking-[0.25em] text-yellow-200">
                    FREE RESOURCE LIBRARY
                  </p>
                  <h2 className="mt-1 text-3xl font-black">
                    Learning freebies in one place.
                  </h2>
                </div>
              </div>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-indigo-100">
                Browse free worksheet folders, download resources, or open them
                in the interactive worksheet canvas.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <HeroStat label="Resources" value={loading ? "..." : String(items.length)} />
                <HeroStat label="Folders" value={String(folders.length)} />
                <HeroStat label="PDF/Image" value={`${pdfCount + imageCount}`} />
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                    LIBRARY STATUS
                  </p>
                  <h2 className="mt-2 text-4xl font-black text-indigo-700">
                    {loading ? "..." : items.length}
                  </h2>
                </div>

                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Trophy size={34} />
                </div>
              </div>

              <div className="mt-6 h-4 overflow-hidden rounded-full bg-indigo-50">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{
                    width: `${items.length > 0 ? Math.min(100, items.length * 12) : 0}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-500">
                {items.length > 0
                  ? `${items.length} free resource available now.`
                  : "No freebies added yet."}
              </p>
            </div>
          </section>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 font-bold text-red-700">
              {error}
            </div>
          ) : null}

          <section className="mt-6 rounded-[2rem] border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                  FILTER
                </p>
                <h2 className="mt-1 text-2xl font-black text-indigo-700">
                  {activeFolderName}
                </h2>
              </div>

              <div className="flex w-full items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 lg:max-w-sm">
                <Search className="text-indigo-600" size={20} />
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search freebies..."
                  className="w-full bg-transparent font-bold text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveFolder("all")}
                className={`rounded-2xl px-5 py-3 font-black transition ${
                  activeFolder === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                All ({items.length})
              </button>

              {foldersWithCount.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setActiveFolder(folder.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-black transition ${
                    activeFolder === folder.id
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  <FolderOpen size={18} />
                  {folder.name} ({folder.count})
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-black tracking-[0.2em] text-yellow-600">
                  RESOURCES
                </p>
                <h2 className="mt-1 text-3xl font-black text-indigo-700">
                  Free Download Cards
                </h2>
              </div>
            </div>

            {loading ? (
              <LoadingCard />
            ) : filteredItems.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {filteredItems.map((item) => (
                  <FreebieCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <HowItWorksCard />
            <QuickToolsCard />
          </section>
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
    <aside className="hidden border-r border-indigo-100 bg-white p-6 xl:block">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-yellow-200 shadow-lg">
          <Sparkles size={26} />
        </div>

        <div>
          <p className="text-xl font-black tracking-[0.18em] text-slate-900">
            FD ARCADIA
          </p>
          <p className="text-sm font-black tracking-[0.25em] text-indigo-600">
            FREEBIES
          </p>
        </div>
      </Link>

      <nav className="mt-10 space-y-2">
        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const active = item.title === "Freebies";

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3 font-black transition ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-700"
              }`}
            >
              <Icon size={22} />
              {item.title}
            </Link>
          );
        })}

        <p className="mb-2 mt-6 text-xs font-black tracking-[0.2em] text-slate-400">
          FOLDERS
        </p>

        {folders.slice(0, 8).map((folder) => (
          <div
            key={folder.id}
            className="flex items-center justify-between rounded-2xl px-4 py-3 font-black text-slate-600"
          >
            <span className="truncate">{folder.name}</span>
            <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
              {folder.count}
            </span>
          </div>
        ))}
      </nav>

      <div className="mt-10 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl">
        <Star className="text-yellow-200" size={30} />
        <p className="mt-4 font-black">Free Library</p>
        <h3 className="mt-1 text-xl font-black">{total} Resources</h3>
        <p className="mt-2 text-sm text-indigo-100">
          Free worksheets, flashcards and printable activities.
        </p>
      </div>
    </aside>
  );
}

function FreebieCard({ item }: { item: FreebieItem }) {
  const fileType = getFileType(item.google_drive_link);
  const Icon = getResourceIcon(item.google_drive_link);

  return (
    <article className="group rounded-[2rem] border border-indigo-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="rounded-[1.7rem] bg-gradient-to-br from-yellow-100 to-indigo-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-indigo-700 shadow-sm">
            <Icon size={32} />
          </div>

          <CheckCircle2 className="text-emerald-600" size={26} />
        </div>

        <span className="mt-6 inline-block rounded-full bg-white px-3 py-1 text-sm font-black text-indigo-700">
          {getResourceLabel(item.google_drive_link)}
        </span>

        <h3 className="mt-4 text-2xl font-black text-indigo-700">
          {item.title}
        </h3>

        <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
          {item.description || "Click to download this free resource."}
        </p>

        <div className="mt-5 grid gap-2">
          <a
            href={item.google_drive_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-200 px-4 py-3 font-black text-yellow-900 transition hover:bg-yellow-300"
          >
            <Download size={18} />
            Open Google Drive
          </a>

          <Link
            href={`/worksheet?file=${encodeURIComponent(
              item.google_drive_link
            )}&type=${fileType}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-black text-white transition hover:bg-indigo-700"
          >
            <PencilLine size={18} />
            Open in Worksheet
          </Link>
        </div>
      </div>
    </article>
  );
}

function HowItWorksCard() {
  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-purple-100 text-purple-700">
          <Sparkles size={28} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-indigo-700">How it works</h2>

          <p className="mt-2 leading-7 text-slate-600">
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
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm">
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
      className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-4 transition hover:bg-indigo-100"
    >
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-indigo-600">
          {icon}
        </div>
        <div>
          <p className="font-black text-indigo-700">{title}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <Download className="text-indigo-600" size={20} />
    </Link>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4 text-white backdrop-blur">
      <p className="text-3xl font-black text-yellow-200">{value}</p>
      <p className="mt-1 text-sm font-bold text-indigo-100">{label}</p>
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
    <div className="flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 font-black text-indigo-700">
      {icon}
      {text}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
      <Loader2 className="mx-auto animate-spin text-indigo-600" size={40} />
      <p className="mt-4 font-bold text-slate-500">Loading freebies...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
      <Gift className="mx-auto text-indigo-400" size={44} />
      <h2 className="mt-3 text-2xl font-black text-indigo-700">
        No freebies found
      </h2>
      <p className="mt-2 text-slate-500">
        Try another folder or wait for admin to upload resources.
      </p>
    </div>
  );
}
