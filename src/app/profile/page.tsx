"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Camera, Loader2, Save } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { TextInput } from "@/components/TextInput";
import { type Profile, supabase, userTypeLabels } from "@/lib/supabase";

export default function ProfilePage() {
  return (
    <ProtectedPage>
      {(user) => <ProfileContent userId={user.id} email={user.email ?? ""} />}
    </ProtectedPage>
  );
}

function ProfileContent({ userId, email }: { userId: string; email: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data, error: profileError } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        return;
      }

     if (!data) {
  setError("Profile not found. Please create profile row in Supabase first.");
  return;
}

const nextProfile = data as Profile;
setProfile(nextProfile);
setFullName(nextProfile.full_name ?? "");
    }

    loadProfile();
  }, [userId]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
.eq("id", userId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setProfile((current) =>
      current ? { ...current, full_name: fullName } : current,
    );
    setMessage("Profile updated.");
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setMessage("");
    setUploading(true);

    const fileExt = file.name.split(".").pop() ?? "png";
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatarUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
.eq("id", userId);

    setUploading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setProfile((current) =>
      current ? { ...current, avatar_url: avatarUrl } : current,
    );
    setMessage("Profile picture updated.");
  }

  return (
    <>
      <Navbar />
      <main className="page-shell py-8">
        <section className="soft-card rounded-[2rem] p-6 sm:p-8">
          <p className="text-emerald-700">Parent profile</p>
          <h1 className="font-display mt-2 text-5xl text-indigo-700">
            My Profile
          </h1>

          <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
            <div className="rounded-[2rem] bg-yellow-50 p-5 text-center">
              <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full bg-white shadow-md">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Profile picture"
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-indigo-300">
                    <Camera size={54} />
                  </div>
                )}
              </div>
              <label className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5">
                {uploading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Camera size={20} />
                )}
                Upload photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
              </label>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <TextInput
                label="Full name"
                value={fullName}
                required
                onChange={setFullName}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-indigo-50 p-4">
                  <p className="text-sm text-emerald-700">Email</p>
                  <p className="mt-2 text-lg text-indigo-700">{email}</p>
                </div>
                <div className="rounded-2xl bg-indigo-50 p-4">
                  <p className="text-sm text-emerald-700">User type</p>
                  <p className="mt-2 text-lg text-indigo-700">
                    {profile?.user_type
                      ? userTypeLabels[profile.user_type]
                      : "Not selected"}
                  </p>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {error}
                </div>
              ) : null}
              {message ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className="button-shadow inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-xl font-bold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <Save size={22} />
                )}
                Save profile
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
