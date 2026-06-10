"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Child = {
  child_name: string;
  id: string;
};

export default function UploadChildWorksheetPage() {
  const params = useParams<{ childId: string }>();
  const childId = params.childId;
  const [child, setChild] = useState<Child | null>(null);
  const [worksheetName, setWorksheetName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function loadChild() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/";
      return;
    }

    const { data } = await supabase
      .from("children")
      .select("id, child_name")
      .eq("id", childId)
      .single();

    setChild((data as Child | null) || null);
  }

  useEffect(() => {
    // Child details are loaded once from Supabase for this upload route.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadChild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadWorksheet = async () => {
    if (!worksheetName) {
      alert("Please enter worksheet name");
      return;
    }

    if (!file) {
      alert("Please select file");
      return;
    }

    setIsUploading(true);

    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("tuition_submission")
      .upload(fileName, file);

    if (uploadError) {
      setIsUploading(false);
      alert(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("tuition_submission").getPublicUrl(uploadData.path);

    const { error: dbError } = await supabase.from("tuition_submissions").insert([
      {
        child_id: childId,
        file_url: publicUrl,
        status: "Pending",
        worksheet_name: worksheetName,
      },
    ]);

    setIsUploading(false);

    if (dbError) {
      alert(dbError.message);
      return;
    }

    alert("Worksheet uploaded successfully!");
    window.location.href = "/tuition/submissions";
  };

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] p-6 text-[var(--fd-ink)]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/tuition" className="text-sm font-black text-[var(--fd-blue)]">
            Back to Tuition
          </Link>
          <span className="rounded-lg bg-white px-3 py-2 text-sm font-black text-[var(--fd-blue)] shadow-sm">
            Tuition Task
          </span>
        </div>

        <section className="rounded-lg border border-[var(--fd-blue)]/10 bg-white p-6 shadow-[0_18px_48px_rgba(76,87,169,0.08)] md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--fd-green)]">
            Upload worksheet
          </p>
          <h1 className="mt-2 text-3xl font-black text-[var(--fd-blue)]">
            {child?.child_name || "Selected student"}
          </h1>
          <p className="mt-2 text-sm font-semibold text-[var(--fd-blue)]/65">
            Submit a completed tuition worksheet for this student.
          </p>

          <div className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Worksheet name"
              value={worksheetName}
              onChange={(event) => setWorksheetName(event.target.value)}
              className="w-full rounded-lg border border-[var(--fd-blue)]/15 bg-[var(--fd-cream)] p-4 font-semibold outline-none focus:border-[var(--fd-blue)]"
            />

            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="w-full rounded-lg border border-[var(--fd-blue)]/15 bg-white p-4 font-semibold"
            />

            <button
              onClick={uploadWorksheet}
              disabled={isUploading}
              className="w-full rounded-lg bg-[var(--fd-blue)] px-5 py-4 font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? "Uploading..." : "Upload Worksheet"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
