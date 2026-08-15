"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Check, ChevronLeft, Save } from "lucide-react";

type ChildProfile = {
  id: string;
  name?: string | null;
  child_name?: string | null;
  full_name?: string | null;
  avatar_character?: string | null;
};

const avatarOptions = [
  {
    id: "boy_01",
    label: "Boy 01",
    image: "/avatars/boy_01/idle.png",
  },
  {
    id: "boy_02",
    label: "Boy 02",
    image: "/avatars/boy_02/idle.png",
  },
  {
    id: "girl_01",
    label: "Girl 01",
    image: "/avatars/girl_01/idle.png",
  },
  {
    id: "girl_02",
    label: "Girl 02",
    image: "/avatars/girl_02/idle.png",
  },
];

export default function AvatarSelectionPage() {
  const router = useRouter();

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("boy_01");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadChildren() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
  .from("children")
  .select("*")
  .eq("parent_id", user.id)
  .order("created_at", { ascending: true });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      const childData = (data || []) as ChildProfile[];

      setChildren(childData);

      if (childData.length > 0) {
        const firstChild = childData[0];

        setSelectedChildId(firstChild.id);
        setSelectedAvatar(
          firstChild.avatar_character || "boy_01"
        );
      }

      setLoading(false);
    }

    loadChildren();
  }, [router]);

  const selectedChild =
    children.find(
      (child) => child.id === selectedChildId
    ) || null;

  const selectedChildName =
    selectedChild?.name ||
    selectedChild?.child_name ||
    selectedChild?.full_name ||
    "Child";

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);

    const child = children.find(
      (item) => item.id === childId
    );

    if (child) {
      setSelectedAvatar(
        child.avatar_character || "boy_01"
      );
    }

    setMessage("");
  }

  async function handleSave() {
    if (!selectedChildId) return;

    try {
      setSaving(true);
      setMessage("");

      const { error } = await supabase
        .from("children")
        .update({
          avatar_character: selectedAvatar,
        })
        .eq("id", selectedChildId);

      if (error) {
        throw error;
      }

      setChildren((current) =>
        current.map((child) =>
          child.id === selectedChildId
            ? {
                ...child,
                avatar_character: selectedAvatar,
              }
            : child
        )
      );

      setMessage("Avatar berjaya disimpan ✨");

      window.setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 700);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save avatar.";

      setMessage(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f4ff]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="mt-4 text-sm font-bold text-violet-700">
            Loading avatars...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fff6f4] via-[#f5efff] to-[#eceaff] px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <header className="flex items-center justify-between gap-4">

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-4 text-sm font-black text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
          >
            <ChevronLeft size={17} />
            Back
          </button>

          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">
              FD Arcadia
            </p>

            <h1 className="mt-1 text-2xl font-black text-[#292554] sm:text-3xl">
              Choose My Avatar
            </h1>
          </div>

          <div className="w-20" />

        </header>


        {/* MAIN CARD */}

        <section className="mt-7 overflow-hidden rounded-[32px] border border-white/70 bg-white/70 shadow-[0_25px_80px_rgba(76,56,140,0.12)] backdrop-blur-xl">

          <div className="grid lg:grid-cols-[0.78fr_1.22fr]">

            {/* PREVIEW */}

            <section className="relative overflow-hidden bg-gradient-to-br from-[#6c59df] via-[#7d5ee8] to-[#b47ce9] p-6 text-white sm:p-8">

              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

              <p className="relative text-[10px] font-black uppercase tracking-[0.18em] text-violet-100">
                Character Preview
              </p>

              <h2 className="relative mt-2 text-3xl font-black">
                {selectedChildName}
              </h2>

              {/* CHILD SELECT */}

              {children.length > 1 ? (
                <div className="relative mt-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-100">
                    Choose Child
                  </label>

                  <select
                    value={selectedChildId}
                    onChange={(event) =>
                      handleChildChange(event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-sm font-black text-white outline-none"
                  >
                    {children.map((child) => {
                      const name =
                        child.name ||
                        child.child_name ||
                        child.full_name ||
                        "Child";

                      return (
                        <option
                          key={child.id}
                          value={child.id}
                          className="text-slate-800"
                        >
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : null}


              {/* AVATAR PREVIEW */}

              <div className="relative mt-8 flex min-h-[390px] items-end justify-center">

                <div className="absolute bottom-5 h-10 w-48 rounded-[50%] bg-indigo-950/20 blur-xl" />

                <img
                  key={selectedAvatar}
                  src={`/avatars/${selectedAvatar}/idle.png`}
                  alt={selectedAvatar}
                  className="relative z-10 max-h-[380px] w-auto object-contain drop-shadow-[0_25px_25px_rgba(20,10,70,0.2)]"
                />

              </div>

              <div className="relative mt-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur">
                <p className="text-xs font-bold text-violet-100">
                  Selected Avatar
                </p>

                <p className="mt-1 text-sm font-black">
                  {selectedAvatar.replace("_", " ").toUpperCase()}
                </p>
              </div>

            </section>


            {/* AVATAR OPTIONS */}

            <section className="p-5 sm:p-8">

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-500">
                  My Character
                </p>

                <h2 className="mt-1 text-2xl font-black text-[#292554]">
                  Pick your favourite
                </h2>

                <p className="mt-2 text-sm font-semibold text-slate-400">
                  This character will appear inside My Dream Room.
                </p>
              </div>


              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2">

                {avatarOptions.map((avatar) => {
                  const active =
                    selectedAvatar === avatar.id;

                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() =>
                        setSelectedAvatar(avatar.id)
                      }
                      className={`
                        group relative overflow-hidden rounded-[26px]
                        border-2 p-4 text-left transition-all duration-300

                        ${
                          active
                            ? "border-violet-500 bg-violet-50 shadow-[0_15px_40px_rgba(124,92,230,0.18)]"
                            : "border-slate-100 bg-white hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
                        }
                      `}
                    >

                      {active ? (
                        <div className="absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-full bg-violet-600 text-white shadow-lg">
                          <Check size={16} strokeWidth={3} />
                        </div>
                      ) : null}

                      <div className="flex h-[220px] items-end justify-center rounded-[20px] bg-gradient-to-b from-[#faf8ff] to-[#eee9ff] p-3">

                        <img
                          src={avatar.image}
                          alt={avatar.label}
                          className="max-h-full w-auto object-contain transition duration-300 group-hover:scale-105"
                        />

                      </div>

                      <div className="mt-3">
                        <p className="text-sm font-black text-[#302b64]">
                          {avatar.label}
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-slate-400">
                          FD Arcadia Character
                        </p>
                      </div>

                    </button>
                  );
                })}

              </div>


              {/* MESSAGE */}

              {message ? (
                <div
                  className={`
                    mt-5 rounded-2xl px-4 py-3 text-sm font-black

                    ${
                      message.includes("berjaya")
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }
                  `}
                >
                  {message}
                </div>
              ) : null}


              {/* SAVE */}

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  !selectedChildId
                }
                className="
                  mt-6 inline-flex w-full
                  items-center justify-center gap-2
                  rounded-2xl
                  bg-gradient-to-r from-violet-600 to-indigo-600
                  px-5 py-4
                  text-sm font-black text-white
                  shadow-[0_15px_35px_rgba(101,76,210,0.25)]
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-[0_20px_45px_rgba(101,76,210,0.32)]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <Save size={18} />

                {saving
                  ? "Saving Avatar..."
                  : "Save My Avatar"}
              </button>

            </section>

          </div>

        </section>

      </div>

    </main>
  );
}