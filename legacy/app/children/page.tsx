"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Child = {
  age?: number | null;
  avatar?: string | null;
  child_name?: string | null;
  completed_worksheets?: number | null;
  id: string;
  level?: string | null;
  points?: number | null;
};

type Parent = {
  id: string;
  subscription_type?: string | null;
};

export default function ChildrenPage() {
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("");
  const [level, setLevel] = useState("");
  const [avatar, setAvatar] = useState("boy");

  const [children, setChildren] = useState<Child[]>([]);
  const [parent, setParent] = useState<Parent | null>(null);

  async function loadChildren() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: parentData } = await supabase
      .from("parents")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!parentData) return;

    setParent(parentData);

    const { data } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", parentData.id);

    setChildren(data || []);
  }

  useEffect(() => {
    // Children are loaded once from Supabase when this page opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadChildren();
  }, []);

  const saveChild = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      return;
    }

    const { data: parentData } = await supabase
      .from("parents")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!parentData) {
      alert("Parent not found");
      return;
    }

    const { count } = await supabase
      .from("children")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("parent_id", parentData.id);

    if (
      parentData.subscription_type === "trial" &&
      count! >= 1
    ) {
      alert("Trial package allows only 1 child.");
      return;
    }

    if (
      parentData.subscription_type === "monthly" &&
      count! >= 2
    ) {
      alert("Monthly package allows only 3 children.");
      return;
    }

    const { error } = await supabase
      .from("children")
      .insert([
        {
          parent_id: parentData.id,
          child_name: childName,
          age: Number(age),
          level,
          avatar,
          points: 0,
          completed_worksheets: 0,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("🎉 Child added successfully!");

    setChildName("");
    setAge("");
    setLevel("");
    setAvatar("boy");

    loadChildren();
  };

  const deleteChild = async (childId: string) => {
    const confirmDelete = confirm(
      "Delete this child?"
    );

    if (!confirmDelete) return;

    await supabase
      .from("children")
      .delete()
      .eq("id", childId);

    loadChildren();
  };

  return (
    <main className="min-h-screen bg-[var(--fd-cream)] p-8">

      <div className="max-w-6xl mx-auto">

        {/* Header */}

        <div className="bg-[var(--fd-blue)] text-white rounded-3xl p-8 shadow-2xl mb-8">

          <h1 className="text-5xl font-bold">
            👶 Child Management
          </h1>

          <p className="mt-3 text-lg">
            Manage your children&apos;s learning profile.
          </p>

          <div className="mt-4 inline-block bg-white/20 px-4 py-2 rounded-xl">
            Package:{" "}
            <span className="font-bold uppercase">
              {parent?.subscription_type || "trial"}
            </span>
          </div>

        </div>

        {/* Add Child Form */}

        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">

          <h2 className="text-3xl font-bold mb-6">
            Add Child
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Child Name"
              value={childName}
              onChange={(e) =>
                setChildName(e.target.value)
              }
              className="border-2 border-[var(--fd-purple)]/35 p-4 rounded-xl"
            />

            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) =>
                setAge(e.target.value)
              }
              className="border-2 border-[var(--fd-purple)]/35 p-4 rounded-xl"
            />

          </div>

          <select
            value={level}
            onChange={(e) =>
              setLevel(e.target.value)
            }
            className="w-full border-2 border-[var(--fd-purple)]/35 p-4 rounded-xl mt-4"
          >
            <option value="">
              Select Level
            </option>

            <option value="Homeschool">
              🏡 Homeschool
            </option>

            <option value="Preschool">
              🎨 Preschool
            </option>

            <option value="Primary">
              📚 Primary
            </option>
          </select>

          {/* Avatar */}

          <div className="mt-6">

            <p className="font-bold mb-3">
              Choose Avatar
            </p>

            <div className="flex gap-4">

              <button
                type="button"
                onClick={() =>
                  setAvatar("boy")
                }
                className={`text-5xl p-4 rounded-2xl border-2 ${
                  avatar === "boy"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                👦
              </button>

              <button
                type="button"
                onClick={() =>
                  setAvatar("girl")
                }
                className={`text-5xl p-4 rounded-2xl border-2 ${
                  avatar === "girl"
                    ? "border-[var(--fd-mauve)] bg-[#fbf0f6]"
                    : "border-gray-200"
                }`}
              >
                👧
              </button>

            </div>

          </div>

          <button
            onClick={saveChild}
            className="w-full mt-6 bg-[var(--fd-blue)] text-white py-4 rounded-xl font-bold hover:scale-[1.01] transition"
          >
            ➕ Add Child
          </button>

        </div>

        {/* Children List */}

        <h2 className="text-3xl font-bold mb-5">
          My Children
        </h2>

        <div className="grid md:grid-cols-2 gap-5">

          {children.map((child) => (
            <div
              key={child.id}
              className="bg-white rounded-3xl shadow-xl p-6"
            >

              <div className="flex items-center gap-4">

                <div className="text-6xl">
                  {child.avatar === "girl"
                    ? "👧"
                    : "👦"}
                </div>

                <div>

                  <h3 className="text-2xl font-bold">
                    {child.child_name}
                  </h3>

                  <p>
                    Age: {child.age}
                  </p>

                  <p>
                    {child.level}
                  </p>

                </div>

              </div>

              <div className="mt-6">

                <div className="flex justify-between mb-2">
                  <span>⭐ Reward Points</span>
                  <span className="font-bold">
                    {child.points}
                  </span>
                </div>

                <div className="flex justify-between mb-3">
                  <span>📚 Worksheets Done</span>
                  <span className="font-bold">
                    {child.completed_worksheets || 0}
                  </span>
                </div>

                <div className="w-full bg-gray-200 h-4 rounded-full">

                  <div
                    className="bg-[var(--fd-mauve)] h-4 rounded-full"
                    style={{
                      width: `${Math.min(
                        (child.completed_worksheets || 0) * 10,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

          <div className="flex flex-wrap gap-3 mt-5">

  <button
    className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
  >
    ✏️ Edit
  </button>

  <Link href={`/progress/${child.id}`}>
    <button
      className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600"
    >
      📈 Progress
    </button>
  </Link>

  <button
    onClick={() => deleteChild(child.id)}
    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
  >
    🗑 Delete
  </button>

</div>

            </div>
          ))}

        </div>

        {/* Navigation */}

        <div className="grid md:grid-cols-2 gap-4 mt-8">

          <Link href="/dashboard">
            <div className="bg-white p-6 rounded-2xl shadow text-center cursor-pointer hover:shadow-xl">

              <h3 className="font-bold text-xl">
                🏠 Dashboard
              </h3>

              <p className="text-gray-600 mt-2">
                Back to Parent Dashboard
              </p>

            </div>
          </Link>

          <Link href="/learninghub">
            <div className="bg-white p-6 rounded-2xl shadow text-center cursor-pointer hover:shadow-xl">

              <h3 className="font-bold text-xl">
                📚 Learning Hub
              </h3>

              <p className="text-gray-600 mt-2">
                Open Worksheets
              </p>

            </div>
          </Link>

        </div>

      </div>

    </main>
  );
}
