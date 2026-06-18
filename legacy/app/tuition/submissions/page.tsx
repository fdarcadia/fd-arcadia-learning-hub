"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Submission = {
  id: string;
  worksheet_name: string;
  file_url: string;
  status: string;
  teacher_remark: string | null;
  created_at: string;
};

export default function SubmissionPage() {
  const [submissions, setSubmissions] = useState<
    Submission[]
  >([]);

  async function loadSubmissions() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: parent } = await supabase
      .from("parents")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!parent) return;

    const { data: children } = await supabase
      .from("children")
      .select("id")
      .eq("parent_id", parent.id);

    if (!children) return;

    const childIds = children.map(
      (child) => child.id
    );

    const { data } = await supabase
      .from("tuition_submissions")
      .select("*")
      .in("child_id", childIds)
      .order("created_at", {
        ascending: false,
      });

    setSubmissions(data || []);
  }

  useEffect(() => {
    // Submissions are loaded once from Supabase when this page opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSubmissions();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] p-8">

      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-3xl shadow-2xl p-8">

          <h1 className="text-4xl font-bold mb-6">
            📂 Submission History
          </h1>

          <div className="space-y-4">

            {submissions.map((item) => (
              <div
                key={item.id}
                className="border rounded-2xl p-5"
              >
                <h2 className="text-xl font-bold">
                  {item.worksheet_name}
                </h2>

                <p className="mt-2">
                  Status:
                  <span className="font-bold ml-2">
                    {item.status}
                  </span>
                </p>

                <p className="mt-2">
                  Teacher Remark:
                </p>

                <div className="bg-[var(--fd-cream)] p-3 rounded-xl mt-1">
                  {item.teacher_remark ||
                    "No remarks yet"}
                </div>

                <a
                  href={item.file_url}
                  target="_blank"
                  className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded-xl"
                >
                  View File
                </a>
              </div>
            ))}

          </div>

        </div>

      </div>

    </main>
  );
}
