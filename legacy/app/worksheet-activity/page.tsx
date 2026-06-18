"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import WorksheetCanvas from "@/components/worksheet/WorksheetCanvas";

export default function WorksheetActivityPage() {
  return (
    <AuthGuard accessKey="learning_hub_access" lockedTitle="Worksheet Activity is locked">
      <WorksheetCanvas />
    </AuthGuard>
  );
}
