"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FolderPlus,
  Gift,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

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
  file_type: string | null;
  freebies_folders?: {
    name: string;
  } | null;
};

export default function AdminFreebiesPage() {
  return (
    <ProtectedPage>
      {(user) =>
        user.email === ADMIN_EMAIL ? (
          <AdminFreebiesContent />
        ) : (
          <main className="page-shell py-10">
            <h1 className="text-3xl font-bold text-red-600">Access denied</h1>
          </main>
        )
      }
    </ProtectedPage>
  );
}

function AdminFreebiesContent() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [items, setItems] = useState<FreebieItem[]>([]);
  const [folderName, setFolderName] = useState("");
  const [folderId, setFolderId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [googleDriveLink, setGoogleDriveLink] = useState("");
  const [fileType, setFileType] = useState("link");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: folderData, error: folderError } = await supabase
      .from("freebies_folders")
      .select("*")
      .order("name", { ascending: true });

    if (folderError) {
      setMessage(folderError.message);
      return;
    }

    const { data: itemData, error: itemError } = await supabase
      .from("freebies_items")
      .select("*, freebies_folders(name)")
      .order("created_at", { ascending: false });

    if (itemError) {
      setMessage(itemError.message);
      return;
    }

    const loadedFolders = (folderData || []) as Folder[];

    setFolders(loadedFolders);
    setItems((itemData || []) as FreebieItem[]);

    if (!folderId && loadedFolders.length > 0) {
      setFolderId(loadedFolders[0].id);
    }
  }

  async function createFolder(event: FormEvent) {
    event.preventDefault();

    if (!folderName.trim()) {
      setMessage("Please enter folder name.");
      return;
    }

    const { error } = await supabase.from("freebies_folders").insert({
      name: folderName.trim(),
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setFolderName("");
    setMessage("Folder created successfully.");
    await loadData();
  }

  async function uploadFreebieFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setMessage("Only image or PDF allowed.");
      return;
    }

    setUploading(true);
    setMessage("Uploading file...");

    const extension = file.name.split(".").pop();
    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    const fileName = `${Date.now()}-${safeName}.${extension}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("freebies")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setUploading(false);
      setMessage(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("freebies").getPublicUrl(filePath);

    setGoogleDriveLink(data.publicUrl);
    setFileType(file.type === "application/pdf" ? "pdf" : "image");

    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    setUploading(false);
    setMessage("File uploaded. Now click Save Freebie.");
  }

  async function saveFreebie(event: FormEvent) {
    event.preventDefault();

    if (!folderId || !title.trim() || !googleDriveLink.trim()) {
      setMessage("Please choose folder, add title and link or upload file.");
      return;
    }

    const { error } = await supabase.from("freebies_items").insert({
      folder_id: folderId,
      title: title.trim(),
      description: description.trim() || null,
      google_drive_link: googleDriveLink.trim(),
      file_type: fileType,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setGoogleDriveLink("");
    setFileType("link");
    setMessage("Freebie saved successfully.");
    await loadData();
  }

  async function deleteFreebie(id: string) {
    const { error } = await supabase.from("freebies_items").delete().eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Freebie deleted.");
    await loadData();
  }

  async function deleteFolder(id: string) {
    const confirmDelete = confirm(
      "Delete this folder? All freebies inside this folder will also be deleted."
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("freebies_folders")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Folder deleted.");
    await loadData();
  }

  return (
    <main className="min-h-screen bg-[#fff8ea] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-md transition hover:-translate-y-1 hover:bg-indigo-700"
          >
            <ArrowLeft size={20} />
            Back Home
          </Link>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-2xl bg-yellow-200 px-5 py-3 font-bold text-indigo-700 shadow-md transition hover:-translate-y-1 hover:bg-yellow-300"
          >
            <ArrowLeft size={20} />
            Back to Admin
          </Link>
        </div>

        <section className="rounded-[2rem] bg-indigo-600 p-7 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <Gift className="text-yellow-200" size={40} />

            <div>
              <p className="tracking-[0.25em] text-yellow-200">
                ADMIN FREEBIES
              </p>

              <h1 className="font-display mt-1 text-5xl">Freebies Upload</h1>

              <p className="mt-2 text-indigo-100">
                Create folders, upload image/PDF, or save Google Drive resources.
              </p>
            </div>
          </div>
        </section>

        {message ? (
          <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 font-bold text-emerald-700">
            {message}
          </div>
        ) : null}

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <form
            onSubmit={createFolder}
            className="rounded-[2rem] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 text-indigo-700">
              <FolderPlus size={26} />
              <h2 className="text-2xl font-bold">Create Folder</h2>
            </div>

            <input
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              placeholder="Example: Science, BM Reading, Jawi"
              className="mt-5 w-full rounded-2xl border border-indigo-100 px-4 py-3 outline-none"
            />

            <button
              type="submit"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-200 px-5 py-3 font-bold text-indigo-700 transition hover:bg-yellow-300"
            >
              <Plus size={20} />
              Add Folder
            </button>

            <div className="mt-5 space-y-2">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3"
                >
                  <p className="font-bold text-indigo-700">{folder.name}</p>

                  <button
                    type="button"
                    onClick={() => deleteFolder(folder.id)}
                    className="rounded-xl bg-red-100 p-2 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </form>

          <form
            onSubmit={saveFreebie}
            className="rounded-[2rem] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 text-indigo-700">
              <Download size={26} />
              <h2 className="text-2xl font-bold">Upload Freebie</h2>
            </div>

            <div className="mt-5 grid gap-4">
              <select
                value={folderId}
                onChange={(event) => setFolderId(event.target.value)}
                className="rounded-2xl border border-indigo-100 px-4 py-3 outline-none"
              >
                <option value="">Choose folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="File title"
                className="rounded-2xl border border-indigo-100 px-4 py-3 outline-none"
              />

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short description"
                className="h-24 rounded-2xl border border-indigo-100 px-4 py-3 outline-none"
              />

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-pink-100 px-5 py-3 font-bold text-pink-700 transition hover:bg-pink-200">
                <Upload size={20} />
                {uploading ? "Uploading..." : "Upload Image / PDF"}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={uploadFreebieFile}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              <div className="text-center text-sm font-bold text-slate-400">
                OR
              </div>

              <input
                value={googleDriveLink}
                onChange={(event) => {
                  setGoogleDriveLink(event.target.value);
                  setFileType("link");
                }}
                placeholder="Paste Google Drive link here"
                className="rounded-2xl border border-indigo-100 px-4 py-3 outline-none"
              />

              {googleDriveLink ? (
                <p className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700">
                  File type: {fileType}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save size={20} />
                Save Freebie
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-indigo-700">
            Uploaded Freebies
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4"
              >
                <p className="rounded-xl bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-800">
                  {item.freebies_folders?.name || "No folder"}
                </p>

                <h3 className="mt-3 text-xl font-bold text-indigo-700">
                  {item.title}
                </h3>

                <p className="mt-1 text-slate-600">
                  {item.description || "No description"}
                </p>

                <p className="mt-2 text-sm font-bold text-indigo-500">
                  Type: {item.file_type || "link"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={item.google_drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl bg-white px-4 py-2 font-bold text-indigo-700"
                  >
                    Open Link
                  </a>

                  <button
                    onClick={() => deleteFreebie(item.id)}
                    className="rounded-2xl bg-red-100 px-4 py-2 font-bold text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {items.length === 0 ? (
            <p className="mt-4 text-slate-500">No freebies uploaded yet.</p>
          ) : null}
        </section>
      </div>
    </main>
  );
}