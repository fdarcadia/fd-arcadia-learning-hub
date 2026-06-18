"use client";

import { FormEvent, useEffect, useState } from "react";
import { Baby, Plus, Trash2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";

type Child = {
  id: string;
  parent_id: string;
  child_name: string;
  age: string | null;
  avatar: string | null;
  subjects: string[] | null;
};

const avatars = ["👧", "👦", "🧒", "👶", "😊", "🌟"];
const subjects = ["Bahasa Melayu", "English", "Mathematics", "Science", "Membaca 3M"];

export default function ChildrenPage() {
  return (
    <ProtectedPage>
      {(user) => (
        <>
          <Navbar />
          <ChildrenContent parentId={user.id} />
        </>
      )}
    </ProtectedPage>
  );
}

function ChildrenContent({ parentId }: { parentId: string }) {
  const [children, setChildren] = useState<Child[]>([]);
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("");
  const [avatar, setAvatar] = useState("👧");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadChildren() {
    const { data, error: loadError } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", parentId)
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setChildren((data || []) as Child[]);
  }

  useEffect(() => {
    loadChildren();
  }, [parentId]);

  function toggleSubject(subject: string) {
    setSelectedSubjects((current) =>
      current.includes(subject)
        ? current.filter((item) => item !== subject)
        : [...current, subject]
    );
  }

  async function addChild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const { error: insertError } = await supabase.from("children").insert({
      parent_id: parentId,
      child_name: childName,
      age,
      avatar,
      subjects: selectedSubjects,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setMessage("Child profile added successfully.");
    setChildName("");
    setAge("");
    setAvatar("👧");
    setSelectedSubjects([]);
    loadChildren();
  }

  async function deleteChild(id: string) {
    const { error: deleteError } = await supabase
      .from("children")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    loadChildren();
  }

  return (
    <main className="page-shell py-8">
      <section className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl">
        <p className="tracking-[0.25em] text-yellow-200">PARENT AREA</p>
        <h1 className="font-display mt-2 text-5xl">My Children</h1>
        <p className="mt-2 text-indigo-100">
          Add child profile, avatar, age and selected subjects.
        </p>
      </section>

      <form
        onSubmit={addChild}
        className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={childName}
            onChange={(event) => setChildName(event.target.value)}
            placeholder="Child name"
            className="rounded-2xl border px-4 py-3"
            required
          />

          <input
            value={age}
            onChange={(event) => setAge(event.target.value)}
            placeholder="Age e.g. 5"
            className="rounded-2xl border px-4 py-3"
          />
        </div>

        <div className="mt-5">
          <p className="font-bold text-indigo-700">Choose Avatar</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {avatars.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setAvatar(item)}
                className={`rounded-2xl px-5 py-4 text-3xl ${
                  avatar === item
                    ? "bg-yellow-200 ring-4 ring-indigo-300"
                    : "bg-slate-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="font-bold text-indigo-700">Selected Subjects</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {subjects.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => toggleSubject(subject)}
                className={`rounded-2xl px-4 py-3 font-bold ${
                  selectedSubjects.includes(subject)
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 font-bold text-white"
        >
          <Plus size={20} />
          Add Child
        </button>
      </form>

      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {children.map((child) => (
          <div
            key={child.id}
            className="rounded-[2rem] bg-white p-6 shadow-sm"
          >
            <div className="text-6xl">{child.avatar || "👧"}</div>

            <h2 className="mt-4 text-3xl font-bold text-indigo-700">
              {child.child_name}
            </h2>

            <p className="mt-1 text-slate-600">Age: {child.age || "-"}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(child.subjects || []).map((subject) => (
                <span
                  key={subject}
                  className="rounded-2xl bg-yellow-100 px-3 py-2 text-sm font-bold text-yellow-800"
                >
                  {subject}
                </span>
              ))}
            </div>

            <button
              onClick={() => deleteChild(child.id)}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-red-100 px-4 py-3 font-bold text-red-700"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        ))}

        {children.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
            <Baby className="mx-auto text-slate-400" size={44} />
            <h2 className="mt-3 text-2xl font-bold text-slate-600">
              No child profile yet.
            </h2>
          </div>
        ) : null}
      </section>
    </main>
  );
} 