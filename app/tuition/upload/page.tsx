"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Child = {
  id: string;
  child_name: string;
};

export default function UploadWorksheetPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [worksheetName, setWorksheetName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function loadChildren() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: parent, error: parentError } =
        await supabase
          .from("parents")
          .select("id")
          .eq("user_id", user.id)
          .single();

      console.log("PARENT:", parent);
      console.log("PARENT ERROR:", parentError);

      if (!parent) return;

      const { data, error } = await supabase
        .from("children")
        .select("id, child_name")
        .eq("parent_id", parent.id);

      console.log("CHILDREN:", data);
      console.log("CHILDREN ERROR:", error);

      setChildren(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    // Children are loaded once from Supabase when this upload page opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadChildren();
  }, []);

  const uploadWorksheet = async () => {
    try {
      if (!selectedChild) {
        alert("Please select child");
        return;
      }

      if (!worksheetName) {
        alert("Please enter worksheet name");
        return;
      }

      if (!file) {
        alert("Please select file");
        return;
      }

      console.log("========== START ==========");
      console.log("Child:", selectedChild);
      console.log("Worksheet:", worksheetName);
      console.log("File:", file);

      const fileName =
        Date.now() + "-" + file.name;

      console.log("Uploading to Storage...");

      const {
        data: uploadData,
        error: uploadError,
      } = await supabase.storage
        .from("tuition_submission")
        .upload(fileName, file);

      console.log("UPLOAD DATA:", uploadData);
      console.log("UPLOAD ERROR:", uploadError);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("tuition_submission")
        .getPublicUrl(uploadData.path);

      console.log("PUBLIC URL:", publicUrl);

      const insertData = {
        child_id: selectedChild,
        worksheet_name: worksheetName,
        file_url: publicUrl,
        status: "Pending",
      };

      console.log("INSERT DATA:", insertData);

      const {
        data,
        error: dbError,
      } = await supabase
        .from("tuition_submissions")
        .insert([insertData])
        .select();

      console.log("DB DATA:", data);
      console.log("DB ERROR:", dbError);

      if (dbError) {
        alert(dbError.message);
        return;
      }

      console.log("========== SUCCESS ==========");

      alert("Worksheet uploaded successfully!");

      setSelectedChild("");
      setWorksheetName("");
      setFile(null);

      window.location.reload();
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Unexpected error");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold mb-6">
            📤 Upload Worksheet
          </h1>

          <select
            value={selectedChild}
            onChange={(e) =>
              setSelectedChild(e.target.value)
            }
            className="w-full border p-4 rounded-xl mb-4"
          >
            <option value="">
              Select Child
            </option>

            {children.map((child) => (
              <option
                key={child.id}
                value={child.id}
              >
                {child.child_name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Worksheet Name"
            value={worksheetName}
            onChange={(e) =>
              setWorksheetName(
                e.target.value
              )
            }
            className="w-full border p-4 rounded-xl mb-4"
          />

          <input
            type="file"
            onChange={(e) =>
              setFile(
                e.target.files?.[0] || null
              )
            }
            className="w-full border p-4 rounded-xl mb-6"
          />

          <button
            onClick={uploadWorksheet}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold"
          >
            Upload Worksheet
          </button>
        </div>
      </div>
    </main>
  );
}
