"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserType =
  | "learning_hub"
  | "custom_worksheet"
  | "flashcard_modul";

export type Profile = {
  id?: string;
  user_id: string;
  email: string;
  full_name: string | null;
  user_type: UserType | null;
  avatar_url: string | null;
  learning_hub_unlocked: boolean;
  custom_worksheet_unlocked: boolean;
  flashcard_modul_unlocked: boolean;
  draw_learn_unlocked: boolean;
    math_activity_unlocked: boolean;
  freebies_unlocked: boolean;
  package_note: string | null;
sifir_deck_unlocked: boolean;
  package_type: string | null;
subscription_start: string | null;
subscription_end: string | null;
};

export const userTypeLabels: Record<UserType, string> = {
  learning_hub: "Learning Hub User",
  custom_worksheet: "Custom Worksheet User",
  flashcard_modul: "Flashcard & Modul User",
};

export function unlocksForUserType(userType: UserType) {
  return {
    learning_hub_unlocked: userType === "learning_hub",
    custom_worksheet_unlocked: userType === "custom_worksheet",
    flashcard_modul_unlocked: userType === "flashcard_modul",
  };
}
