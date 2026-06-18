import { BookOpenCheck, FileText, Layers3, type LucideIcon } from "lucide-react";

export type AccountType = "learning_hub" | "custom_worksheet" | "flashcard_modul";

export type AccessKey =
  | "learning_hub_access"
  | "custom_worksheet_access"
  | "flashcard_modul_access";

export type UserAccess = {
  custom_worksheet_access: boolean;
  flashcard_modul_access: boolean;
  learning_hub_access: boolean;
  subscription_status: string | null;
};

export type AccessOption = {
  accountType: AccountType;
  accessKey: AccessKey;
  description: string;
  href: string;
  icon: LucideIcon;
  label: string;
};

export const accessOptions: AccessOption[] = [
  {
    accountType: "learning_hub",
    accessKey: "learning_hub_access",
    description: "Interactive worksheets, guided activities, and the iPad-ready canvas.",
    href: "/learning-hub",
    icon: BookOpenCheck,
    label: "Learning Hub",
  },
  {
    accountType: "custom_worksheet",
    accessKey: "custom_worksheet_access",
    description: "Request and manage personalised worksheet packs for your child.",
    href: "/custom-worksheet",
    icon: FileText,
    label: "Custom Worksheet",
  },
  {
    accountType: "flashcard_modul",
    accessKey: "flashcard_modul_access",
    description: "Flashcard sets and learning modules for joyful practice time.",
    href: "/flashcard-modul",
    icon: Layers3,
    label: "Flashcard & Modul",
  },
];

export function getAccessOption(accountType: AccountType) {
  return accessOptions.find((option) => option.accountType === accountType);
}

export function getAccountTypeLabel(accountType?: string | null) {
  return accessOptions.find((option) => option.accountType === accountType)?.label || "Not selected";
}

export function emptyUserAccess(): UserAccess {
  return {
    custom_worksheet_access: false,
    flashcard_modul_access: false,
    learning_hub_access: false,
    subscription_status: "inactive",
  };
}
