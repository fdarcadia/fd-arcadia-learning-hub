"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Submission {
  id: string;
  worksheet_name: string;
  file_url: string;
  status: string;
  score: number | null;
  teacher_remark: string | null;
  created_at: string;
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  async function loadSubmissions() {
    const { data, error } = await supabase
      .from("tuition_submissions")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log(error);
      return;
    }

    setSubmissions(data || []);
  }

  useEffect(() => {
    // Submissions are loaded once from Supabase when the admin page opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSubmissions();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] p-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          📤 Tuition Submissions
        </h1>

        <div className="space-y-5">

          {submissions.map((submission) => (

            <div
              key={submission.id}
              className="bg-white rounded-3xl p-6 shadow-xl"
            >

              <h2 className="text-2xl font-bold">
                {submission.worksheet_name}
              </h2>

              <p className="mt-2">
                Status: {submission.status}
              </p>

              <p>
                Score: {submission.score || 0}
              </p>

              <p>
                Remark: {submission.teacher_remark || "-"}
              </p>

              <div className="mt-4">

                <a
                  href={submission.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-500 text-white px-4 py-2 rounded-xl"
                >
                  View PDF
                </a>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}
