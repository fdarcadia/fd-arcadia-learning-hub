"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FolderOpen, Gift } from "lucide-react";
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
};

export default function FreebiesPage() {
  return (
    <ProtectedPage>
      {() => <FreebiesContent />}
    </ProtectedPage>
  );
}

function FreebiesContent() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [items, setItems] = useState<FreebieItem[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [error, setError] = useState("");

  useEffect(() => {
    loadFreebies();
  }, []);

  async function loadFreebies() {
    const { data: folderData, error: folderError } = await supabase
      .from("freebies_folders")
      .select("*")
      .order("name", { ascending: true });

    if (folderError) {
      setError(folderError.message);
      return;
    }

    const { data: itemData, error: itemError } = await supabase
      .from("freebies_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (itemError) {
      setError(itemError.message);
      return;
    }

    setFolders((folderData || []) as Folder[]);
    setItems((itemData || []) as FreebieItem[]);
  }

  const filteredItems =
    activeFolder === "all"
      ? items
      : items.filter((item) => item.folder_id === activeFolder);

  return (
    <main className="min-h-screen bg-[#fff8ea] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-md transition hover:-translate-y-1 hover:bg-indigo-700"
        >
          <ArrowLeft size={20} />
          Back Home
        </Link>

        <section className="mt-6 rounded-[2rem] bg-indigo-600 p-7 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <Gift className="text-yellow-200" size={40} />

            <div>
              <p className="tracking-[0.25em] text-yellow-200">
                FREE DOWNLOADS
              </p>

              <h1 className="font-display mt-1 text-5xl">
                FD Arcadia Freebies
              </h1>

              <p className="mt-2 text-indigo-100">
                Download free worksheets, flashcards and learning resources.
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-red-600">
            {error}
          </div>
        ) : null}

        <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveFolder("all")}
              className={`rounded-2xl px-5 py-3 font-bold transition ${
                activeFolder === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-50 text-indigo-700"
              }`}
            >
              All
            </button>

            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold transition ${
                  activeFolder === folder.id
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 text-indigo-700"
                }`}
              >
                <FolderOpen size={18} />
                {folder.name}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <a
              key={item.id}
              href={item.google_drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[2rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <Download className="text-indigo-600" size={34} />

              <h2 className="mt-4 text-2xl font-bold text-indigo-700">
                {item.title}
              </h2>

              <p className="mt-2 text-slate-600">
                {item.description || "Click to download this free resource."}
              </p>

              <p className="mt-4 rounded-2xl bg-yellow-100 px-4 py-2 font-bold text-yellow-800">
                Open Google Drive
              </p>
            </a>
          ))}
        </section>

        {filteredItems.length === 0 ? (
          <div className="mt-6 rounded-[2rem] bg-white p-6 text-center text-slate-600 shadow-sm">
            No freebies added yet.
          </div>
        ) : null}
      </div>
    </main>
  );
}