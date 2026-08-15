"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Eraser,
  Gem,
  PenLine,
  Star,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  PointerEvent as ReactPointerEvent,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { PortalShell } from "@/components/PortalShell";
import { ProtectedPage } from "@/components/ProtectedPage";

type Point = { x: number; y: number };

type StrokeLine = {
  id: string;
  color: string;
  size: number;
  points: Point[];
};

type TraceSide = "upper" | "lower";
type ToolMode = "pen" | "eraser";

type GuideDef = {
  d: string;
  startX: number;
  startY: number;
  number: number;
  badgeX?: number;
  badgeY?: number;
};

type LetterGuideSet = {
  upper: GuideDef[];
  lower: GuideDef[];
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const PEN_COLORS = [
  "#6D3AF2",
  "#F43F8C",
  "#2499F3",
  "#23B66F",
  "#F97316",
  "#A9653F",
];

const PEN_SIZES = [10, 14, 18, 22, 28, 34];

/* =========================================================
   A-Z HANDWRITING STROKE DATA
   - Every Next/Previous letter uses its own guides.
   - Lowercase a is intentionally TWO strokes:
     1) open c-shape
     2) straight line down
========================================================= */

const LETTER_GUIDES: Record<string, LetterGuideSet> = {
  A: {
    upper: [
      { d: "M150 72 L70 330", startX: 150, startY: 72, number: 1, badgeX: 116, badgeY: 52 },
      { d: "M150 72 L230 330", startX: 150, startY: 72, number: 2, badgeX: 214, badgeY: 52 },
      { d: "M108 230 L192 230", startX: 108, startY: 230, number: 3, badgeX: 88, badgeY: 230 },
    ],
    lower: [
      { d: "M190 145 C170 112 108 112 82 154 C54 202 82 270 142 274 C174 276 194 260 198 240", startX: 190, startY: 145, number: 1, badgeX: 60, badgeY: 142 },
      { d: "M208 130 L208 286", startX: 208, startY: 130, number: 2, badgeX: 242, badgeY: 122 },
    ],
  },
  B: {
    upper: [
      { d: "M86 72 L86 328", startX: 86, startY: 72, number: 1, badgeX: 58, badgeY: 72 },
      { d: "M86 78 C214 62 226 176 88 194 C230 180 236 318 86 326", startX: 86, startY: 78, number: 2, badgeX: 116, badgeY: 52 },
    ],
    lower: [
      { d: "M92 70 L92 286", startX: 92, startY: 70, number: 1, badgeX: 62, badgeY: 70 },
      { d: "M94 186 C118 138 198 142 210 204 C222 270 142 300 96 256", startX: 94, startY: 186, number: 2, badgeX: 120, badgeY: 156 },
    ],
  },
  C: {
    upper: [
      { d: "M228 104 C184 62 98 70 70 164 C42 258 100 330 218 304", startX: 228, startY: 104, number: 1, badgeX: 248, badgeY: 92 },
    ],
    lower: [
      { d: "M210 162 C180 130 112 132 82 188 C58 238 92 288 198 270", startX: 210, startY: 162, number: 1, badgeX: 234, badgeY: 148 },
    ],
  },
  D: {
    upper: [
      { d: "M82 72 L82 328", startX: 82, startY: 72, number: 1, badgeX: 54, badgeY: 72 },
      { d: "M82 76 C232 66 250 320 82 328", startX: 82, startY: 76, number: 2, badgeX: 112, badgeY: 52 },
    ],
    lower: [
      { d: "M208 70 L208 286", startX: 208, startY: 70, number: 1, badgeX: 238, badgeY: 70 },
      { d: "M206 184 C178 140 102 142 82 204 C62 266 126 300 204 256", startX: 206, startY: 184, number: 2, badgeX: 178, badgeY: 156 },
    ],
  },
  E: {
    upper: [
      { d: "M82 72 L82 328", startX: 82, startY: 72, number: 1, badgeX: 54, badgeY: 72 },
      { d: "M82 78 L224 78", startX: 82, startY: 78, number: 2, badgeX: 112, badgeY: 52 },
      { d: "M82 198 L192 198", startX: 82, startY: 198, number: 3, badgeX: 56, badgeY: 198 },
      { d: "M82 326 L226 326", startX: 82, startY: 326, number: 4, badgeX: 54, badgeY: 326 },
    ],
    lower: [
      { d: "M208 206 C150 206 92 204 84 220 C70 248 100 286 156 282 C182 280 198 270 208 258 M86 220 C100 166 190 152 214 198", startX: 208, startY: 206, number: 1, badgeX: 232, badgeY: 194 },
    ],
  },
  F: {
    upper: [
      { d: "M82 72 L82 328", startX: 82, startY: 72, number: 1, badgeX: 54, badgeY: 72 },
      { d: "M82 78 L224 78", startX: 82, startY: 78, number: 2, badgeX: 112, badgeY: 52 },
      { d: "M82 198 L192 198", startX: 82, startY: 198, number: 3, badgeX: 56, badgeY: 198 },
    ],
    lower: [
      { d: "M176 78 C134 62 112 90 112 132 L112 286", startX: 176, startY: 78, number: 1, badgeX: 202, badgeY: 66 },
      { d: "M78 166 L172 166", startX: 78, startY: 166, number: 2, badgeX: 56, badgeY: 166 },
    ],
  },
  G: {
    upper: [
      { d: "M228 104 C184 62 98 70 70 164 C42 258 100 330 218 304 C236 300 244 276 244 238 L172 238", startX: 228, startY: 104, number: 1, badgeX: 248, badgeY: 92 },
    ],
    lower: [
      { d: "M198 152 C168 122 106 128 82 180 C58 232 88 278 146 278 C184 278 202 252 202 212", startX: 198, startY: 152, number: 1, badgeX: 224, badgeY: 140 },
      { d: "M202 150 L202 304 C202 338 176 350 134 336", startX: 202, startY: 150, number: 2, badgeX: 232, badgeY: 150 },
    ],
  },
  H: {
    upper: [
      { d: "M78 72 L78 328", startX: 78, startY: 72, number: 1, badgeX: 50, badgeY: 72 },
      { d: "M222 72 L222 328", startX: 222, startY: 72, number: 2, badgeX: 250, badgeY: 72 },
      { d: "M78 198 L222 198", startX: 78, startY: 198, number: 3, badgeX: 52, badgeY: 198 },
    ],
    lower: [
      { d: "M88 72 L88 286", startX: 88, startY: 72, number: 1, badgeX: 58, badgeY: 72 },
      { d: "M90 190 C108 144 194 136 204 202 L204 286", startX: 90, startY: 190, number: 2, badgeX: 118, badgeY: 160 },
    ],
  },
  I: {
    upper: [
      { d: "M150 78 L150 326", startX: 150, startY: 78, number: 1, badgeX: 120, badgeY: 78 },
      { d: "M94 78 L206 78", startX: 94, startY: 78, number: 2, badgeX: 70, badgeY: 78 },
      { d: "M94 326 L206 326", startX: 94, startY: 326, number: 3, badgeX: 70, badgeY: 326 },
    ],
    lower: [
      { d: "M150 154 L150 286", startX: 150, startY: 154, number: 1, badgeX: 120, badgeY: 154 },
    ],
  },
  J: {
    upper: [
      { d: "M214 78 L214 258 C214 326 98 348 72 278", startX: 214, startY: 78, number: 1, badgeX: 244, badgeY: 78 },
      { d: "M112 78 L224 78", startX: 112, startY: 78, number: 2, badgeX: 88, badgeY: 78 },
    ],
    lower: [
      { d: "M170 154 L170 304 C170 340 146 350 116 332", startX: 170, startY: 154, number: 1, badgeX: 200, badgeY: 154 },
    ],
  },
  K: {
    upper: [
      { d: "M82 72 L82 328", startX: 82, startY: 72, number: 1, badgeX: 54, badgeY: 72 },
      { d: "M224 78 L84 208", startX: 224, startY: 78, number: 2, badgeX: 248, badgeY: 70 },
      { d: "M84 208 L228 328", startX: 84, startY: 208, number: 3, badgeX: 58, badgeY: 208 },
    ],
    lower: [
      { d: "M88 72 L88 286", startX: 88, startY: 72, number: 1, badgeX: 58, badgeY: 72 },
      { d: "M204 160 L90 222", startX: 204, startY: 160, number: 2, badgeX: 232, badgeY: 150 },
      { d: "M92 220 L212 286", startX: 92, startY: 220, number: 3, badgeX: 66, badgeY: 220 },
    ],
  },
  L: {
    upper: [
      { d: "M82 72 L82 326", startX: 82, startY: 72, number: 1, badgeX: 54, badgeY: 72 },
      { d: "M82 326 L224 326", startX: 82, startY: 326, number: 2, badgeX: 54, badgeY: 326 },
    ],
    lower: [
      { d: "M150 72 L150 286", startX: 150, startY: 72, number: 1, badgeX: 120, badgeY: 72 },
    ],
  },
  M: {
    upper: [
      { d: "M62 328 L62 78", startX: 62, startY: 328, number: 1, badgeX: 38, badgeY: 328 },
      { d: "M62 78 L150 224", startX: 62, startY: 78, number: 2, badgeX: 38, badgeY: 78 },
      { d: "M150 224 L238 78", startX: 150, startY: 224, number: 3, badgeX: 150, badgeY: 250 },
      { d: "M238 78 L238 328", startX: 238, startY: 78, number: 4, badgeX: 262, badgeY: 78 },
    ],
    lower: [
      { d: "M64 166 L64 286", startX: 64, startY: 166, number: 1, badgeX: 40, badgeY: 166 },
      { d: "M66 190 C82 144 136 148 144 202 L144 286", startX: 66, startY: 190, number: 2, badgeX: 88, badgeY: 164 },
      { d: "M144 194 C166 144 222 154 226 208 L226 286", startX: 144, startY: 194, number: 3, badgeX: 166, badgeY: 164 },
    ],
  },
  N: {
    upper: [
      { d: "M70 328 L70 78", startX: 70, startY: 328, number: 1, badgeX: 44, badgeY: 328 },
      { d: "M70 78 L230 328", startX: 70, startY: 78, number: 2, badgeX: 44, badgeY: 78 },
      { d: "M230 328 L230 78", startX: 230, startY: 328, number: 3, badgeX: 256, badgeY: 328 },
    ],
    lower: [
      { d: "M82 166 L82 286", startX: 82, startY: 166, number: 1, badgeX: 56, badgeY: 166 },
      { d: "M84 190 C104 142 198 142 208 208 L208 286", startX: 84, startY: 190, number: 2, badgeX: 112, badgeY: 160 },
    ],
  },
  O: {
    upper: [
      { d: "M150 72 C88 72 54 126 54 202 C54 278 90 330 150 330 C212 330 246 278 246 202 C246 126 212 72 150 72", startX: 150, startY: 72, number: 1, badgeX: 120, badgeY: 50 },
    ],
    lower: [
      { d: "M150 142 C96 142 72 178 72 216 C72 260 100 286 150 286 C200 286 228 258 228 216 C228 174 202 142 150 142", startX: 150, startY: 142, number: 1, badgeX: 120, badgeY: 122 },
    ],
  },
  P: {
    upper: [
      { d: "M82 72 L82 328", startX: 82, startY: 72, number: 1, badgeX: 54, badgeY: 72 },
      { d: "M82 78 C220 62 230 194 82 200", startX: 82, startY: 78, number: 2, badgeX: 112, badgeY: 52 },
    ],
    lower: [
      { d: "M88 166 L88 338", startX: 88, startY: 166, number: 1, badgeX: 58, badgeY: 166 },
      { d: "M90 190 C120 142 200 144 212 208 C220 264 150 294 92 254", startX: 90, startY: 190, number: 2, badgeX: 118, badgeY: 160 },
    ],
  },
  Q: {
    upper: [
      { d: "M150 72 C88 72 54 126 54 202 C54 278 90 330 150 330 C212 330 246 278 246 202 C246 126 212 72 150 72", startX: 150, startY: 72, number: 1, badgeX: 120, badgeY: 50 },
      { d: "M176 272 L244 338", startX: 176, startY: 272, number: 2, badgeX: 154, badgeY: 272 },
    ],
    lower: [
      { d: "M150 142 C96 142 72 178 72 216 C72 260 100 286 150 286 C200 286 228 258 228 216 C228 174 202 142 150 142", startX: 150, startY: 142, number: 1, badgeX: 120, badgeY: 122 },
      { d: "M206 256 L206 338", startX: 206, startY: 256, number: 2, badgeX: 234, badgeY: 256 },
    ],
  },
  R: {
    upper: [
      { d: "M82 72 L82 328", startX: 82, startY: 72, number: 1, badgeX: 54, badgeY: 72 },
      { d: "M82 78 C220 62 230 194 82 200", startX: 82, startY: 78, number: 2, badgeX: 112, badgeY: 52 },
      { d: "M132 200 L232 328", startX: 132, startY: 200, number: 3, badgeX: 112, badgeY: 200 },
    ],
    lower: [
      { d: "M92 166 L92 286", startX: 92, startY: 166, number: 1, badgeX: 64, badgeY: 166 },
      { d: "M94 198 C116 158 156 150 188 166", startX: 94, startY: 198, number: 2, badgeX: 118, badgeY: 172 },
    ],
  },
  S: {
    upper: [
      { d: "M224 102 C198 70 106 64 76 118 C48 168 112 196 164 202 C226 208 252 256 218 302 C184 346 92 328 66 294", startX: 224, startY: 102, number: 1, badgeX: 248, badgeY: 90 },
    ],
    lower: [
      { d: "M204 164 C180 136 104 134 88 180 C74 222 138 224 166 232 C218 246 214 286 170 294 C126 302 92 282 78 266", startX: 204, startY: 164, number: 1, badgeX: 230, badgeY: 150 },
    ],
  },
  T: {
    upper: [
      { d: "M56 78 L244 78", startX: 56, startY: 78, number: 1, badgeX: 34, badgeY: 78 },
      { d: "M150 78 L150 328", startX: 150, startY: 78, number: 2, badgeX: 180, badgeY: 78 },
    ],
    lower: [
      { d: "M150 106 L150 268 C150 294 176 302 204 286", startX: 150, startY: 106, number: 1, badgeX: 120, badgeY: 106 },
      { d: "M108 166 L194 166", startX: 108, startY: 166, number: 2, badgeX: 84, badgeY: 166 },
    ],
  },
  U: {
    upper: [
      { d: "M72 78 L72 236 C72 304 108 330 150 330 C196 330 228 302 228 236 L228 78", startX: 72, startY: 78, number: 1, badgeX: 44, badgeY: 78 },
    ],
    lower: [
      { d: "M82 166 L82 246 C82 296 150 300 196 252", startX: 82, startY: 166, number: 1, badgeX: 54, badgeY: 166 },
      { d: "M204 166 L204 286", startX: 204, startY: 166, number: 2, badgeX: 232, badgeY: 166 },
    ],
  },
  V: {
    upper: [
      { d: "M60 78 L150 328", startX: 60, startY: 78, number: 1, badgeX: 34, badgeY: 78 },
      { d: "M150 328 L240 78", startX: 150, startY: 328, number: 2, badgeX: 150, badgeY: 350 },
    ],
    lower: [
      { d: "M82 166 L146 286", startX: 82, startY: 166, number: 1, badgeX: 56, badgeY: 166 },
      { d: "M146 286 L212 166", startX: 146, startY: 286, number: 2, badgeX: 146, badgeY: 314 },
    ],
  },
  W: {
    upper: [
      { d: "M42 78 L94 328", startX: 42, startY: 78, number: 1, badgeX: 22, badgeY: 78 },
      { d: "M94 328 L150 174", startX: 94, startY: 328, number: 2, badgeX: 94, badgeY: 350 },
      { d: "M150 174 L206 328", startX: 150, startY: 174, number: 3, badgeX: 150, badgeY: 148 },
      { d: "M206 328 L258 78", startX: 206, startY: 328, number: 4, badgeX: 206, badgeY: 350 },
    ],
    lower: [
      { d: "M52 166 L100 286", startX: 52, startY: 166, number: 1, badgeX: 30, badgeY: 166 },
      { d: "M100 286 L150 204", startX: 100, startY: 286, number: 2, badgeX: 100, badgeY: 314 },
      { d: "M150 204 L200 286", startX: 150, startY: 204, number: 3, badgeX: 150, badgeY: 178 },
      { d: "M200 286 L248 166", startX: 200, startY: 286, number: 4, badgeX: 200, badgeY: 314 },
    ],
  },
  X: {
    upper: [
      { d: "M66 78 L234 328", startX: 66, startY: 78, number: 1, badgeX: 40, badgeY: 78 },
      { d: "M234 78 L66 328", startX: 234, startY: 78, number: 2, badgeX: 260, badgeY: 78 },
    ],
    lower: [
      { d: "M82 166 L216 286", startX: 82, startY: 166, number: 1, badgeX: 56, badgeY: 166 },
      { d: "M216 166 L82 286", startX: 216, startY: 166, number: 2, badgeX: 242, badgeY: 166 },
    ],
  },
  Y: {
    upper: [
      { d: "M60 78 L150 202", startX: 60, startY: 78, number: 1, badgeX: 34, badgeY: 78 },
      { d: "M240 78 L150 202", startX: 240, startY: 78, number: 2, badgeX: 266, badgeY: 78 },
      { d: "M150 202 L150 328", startX: 150, startY: 202, number: 3, badgeX: 120, badgeY: 202 },
    ],
    lower: [
      { d: "M82 166 L148 274", startX: 82, startY: 166, number: 1, badgeX: 56, badgeY: 166 },
      { d: "M216 166 L148 274 L122 338", startX: 216, startY: 166, number: 2, badgeX: 242, badgeY: 166 },
    ],
  },
  Z: {
    upper: [
      { d: "M58 78 L240 78", startX: 58, startY: 78, number: 1, badgeX: 34, badgeY: 78 },
      { d: "M240 78 L62 328", startX: 240, startY: 78, number: 2, badgeX: 266, badgeY: 78 },
      { d: "M62 328 L242 328", startX: 62, startY: 328, number: 3, badgeX: 38, badgeY: 328 },
    ],
    lower: [
      { d: "M82 166 L218 166", startX: 82, startY: 166, number: 1, badgeX: 56, badgeY: 166 },
      { d: "M218 166 L84 286", startX: 218, startY: 166, number: 2, badgeX: 244, badgeY: 166 },
      { d: "M84 286 L220 286", startX: 84, startY: 286, number: 3, badgeX: 58, badgeY: 286 },
    ],
  },
};

export default function AlphabetActivitiesPage() {
  return (
    <ProtectedPage>
      {() => (
        <PortalShell role="parent">
          <AlphabetActivities />
        </PortalShell>
      )}
    </ProtectedPage>
  );
}

function AlphabetActivities() {
  const [letterIndex, setLetterIndex] = useState(0);

  const currentLetter = LETTERS[letterIndex];
  const lowerLetter = currentLetter.toLowerCase();

  function previousLetter() {
    setLetterIndex((current) =>
      current === 0 ? LETTERS.length - 1 : current - 1
    );
  }

  function nextLetter() {
    setLetterIndex((current) =>
      current === LETTERS.length - 1 ? 0 : current + 1
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F5FD] px-3 py-4 sm:px-5 lg:px-7">
      <div className="mx-auto max-w-[1380px]">
        <section className="rounded-[28px] border border-[#E4E6F2] bg-white px-4 py-4 shadow-[0_12px_35px_rgba(35,45,90,0.06)] sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/huruf-membaca"
                className="grid h-12 w-12 place-items-center rounded-[18px] border border-[#E2E4EE] bg-white text-[#6D3AF2] shadow-sm"
              >
                <ArrowLeft size={22} />
              </Link>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9EA8C3]">
                  FD Arcadia LearningHub
                </p>

                <h1
                  className="mt-1 text-2xl text-[#101C46] sm:text-3xl"
                  style={{
                    fontFamily:
                      '"KG Black Space", "KG Miss Kindergarten", sans-serif',
                  }}
                >
                  Alphabet Activities
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TopStat
                icon={<Coins size={18} className="text-amber-500" />}
                value="560"
              />
              <TopStat
                icon={
                  <Star
                    size={18}
                    className="fill-amber-400 text-amber-400"
                  />
                }
                value="124"
              />
              <TopStat
                icon={<Gem size={18} className="text-violet-500" />}
                value="18"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            {[
              ["01", "Learn Stroke"],
              ["02", "Trace Letter"],
              ["03", "Write It Yourself"],
              ["04", "Find & Match"],
              ["05", "Letter Sound"],
            ].map(([no, label], index) => (
              <div
                key={label}
                className={`rounded-[16px] border px-3 py-3 text-center text-sm font-bold ${
                  index === 0
                    ? "border-[#7445F3] bg-gradient-to-r from-[#7D4EF6] to-[#6837EB] text-white shadow-[0_8px_20px_rgba(108,58,232,0.20)]"
                    : "border-[#E5E6EF] bg-white text-[#1E2C55]"
                }`}
              >
                <span className="mr-2 text-xs opacity-80">{no}</span>
                {label}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[30px] border border-[#E2E5F0] bg-white shadow-[0_12px_35px_rgba(35,45,90,0.06)]">
          <SectionHeader
            step="STEP 01"
            title="Learn the Stroke"
            subtitle="Start at number 1 and follow the number sequence."
            number="01"
            color="purple"
          />

          <div className="grid gap-5 border-t border-[#EEF0F6] p-4 sm:p-6 lg:grid-cols-2">
            <LearnStrokeCard
              label="UPPERCASE"
              letter={currentLetter}
              side="upper"
            />
            <LearnStrokeCard
              label="LOWERCASE"
              letter={lowerLetter}
              side="lower"
            />
          </div>
        </section>

        <section className="mt-5 rounded-[30px] border border-[#E2E5F0] bg-white shadow-[0_12px_35px_rgba(35,45,90,0.06)]">
          <SectionHeader
            step="STEP 02"
            title="Trace the Letter"
            subtitle="Start at the highlighted number and trace the dotted letter."
            number="02"
            color="pink"
          />

          <TraceLetters key={`trace-${currentLetter}`} currentLetter={currentLetter} />
        </section>

        <section className="mt-5 rounded-[30px] border border-[#E2E5F0] bg-white shadow-[0_12px_35px_rgba(35,45,90,0.06)]">
          <SectionHeader
            step="STEP 03"
            title="Write It Yourself"
            subtitle={`Write ${currentLetter}${lowerLetter} by yourself on the handwriting lines.`}
            number="03"
            color="teal"
          />

          <WriteYourself key={`write-${currentLetter}`} />
        </section>

        <section className="mt-5 rounded-[24px] border border-[#E2E5F0] bg-white p-3 shadow-[0_10px_25px_rgba(35,45,90,0.05)]">
          <div className="grid items-center gap-3 sm:grid-cols-[auto_1fr_auto]">
            <button
              type="button"
              onClick={previousLetter}
              className="flex min-h-[54px] items-center justify-center gap-2 rounded-[17px] bg-gradient-to-r from-[#7847F2] to-[#6735E8] px-5 font-black text-white"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="px-2 text-center">
              <p
                className="text-lg text-[#14214B]"
                style={{
                  fontFamily:
                    '"KG Black Space", "KG Miss Kindergarten", sans-serif',
                }}
              >
                {letterIndex + 1} / 26 Letters
              </p>

              <div className="mx-auto mt-2 h-2 max-w-[420px] overflow-hidden rounded-full bg-[#E4E5EA]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7041F1] to-[#8B5DF7] transition-[width] duration-300"
                  style={{
                    width: `${((letterIndex + 1) / 26) * 100}%`,
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={nextLetter}
              className="flex min-h-[54px] items-center justify-center gap-2 rounded-[17px] bg-gradient-to-r from-[#7847F2] to-[#6735E8] px-5 font-black text-white"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes strokePulse {
          0%,
          100% {
            transform: scale(0.88);
            transform-origin: center;
            opacity: 0.10;
          }

          50% {
            transform: scale(1.18);
            transform-origin: center;
            opacity: 0.24;
          }
        }
      `}</style>
    </main>
  );
}

function TopStat({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-full border border-[#E7E8F1] bg-white px-4 shadow-sm">
      {icon}
      <span className="font-black text-[#16214A]">{value}</span>
    </div>
  );
}

function SectionHeader({
  step,
  title,
  subtitle,
  number,
  color,
}: {
  step: string;
  title: string;
  subtitle: string;
  number: string;
  color: "purple" | "pink" | "teal";
}) {
  const colorClass =
    color === "purple"
      ? "bg-[#EEE7FF] text-[#7345F2]"
      : color === "pink"
        ? "bg-[#FFEAF4] text-[#F12F83]"
        : "bg-[#E8FAF6] text-[#10A98D]";

  return (
    <div className="flex items-start gap-4 px-4 py-5 sm:px-6">
      <div
        className={`grid h-16 w-16 shrink-0 place-items-center rounded-[20px] text-xl font-black ${colorClass}`}
      >
        {number}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A8B2C9]">
          {step}
        </p>

        <h2
          className="mt-1 text-2xl text-[#14214B]"
          style={{
            fontFamily:
              '"KG Black Space", "KG Miss Kindergarten", sans-serif',
          }}
        >
          {title}
        </h2>

        <p className="mt-1 text-base text-[#8D99B5]">{subtitle}</p>
      </div>
    </div>
  );
}

function LearnStrokeCard({
  label,
  letter,
  side,
}: {
  label: string;
  letter: string;
  side: TraceSide;
}) {
  const letterKey = letter.toUpperCase();
  const guideSet = LETTER_GUIDES[letterKey];
  const guides =
    side === "upper"
      ? guideSet.upper
      : guideSet.lower;

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[24px] border border-[#DDE2EF] bg-white p-4">
      <div className="mx-auto w-fit rounded-full bg-[#F3EEFF] px-4 py-2 text-xs font-black tracking-[0.05em] text-[#7445F3]">
        {label}
      </div>

      <svg
        viewBox="0 0 300 360"
        className="mx-auto mt-3 block h-[330px] w-full max-w-[390px]"
      >
        {/* Same stroke geometry used by Step 02, but solid for learning. */}
        {guides.map((guide) => (
          <path
            key={`learn-${guide.number}`}
            d={guide.d}
            fill="none"
            stroke="#172B59"
            strokeWidth={
              side === "upper" ? 34 : 30
            }
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Small numbered badges outside the letter. No tick in Step 01. */}
        {guides.map((guide) => (
          <StrokeBadge
            key={`learn-badge-${guide.number}`}
            x={
              guide.badgeX ??
              guide.startX - 24
            }
            y={
              guide.badgeY ??
              guide.startY - 18
            }
            no={guide.number}
            size="small"
          />
        ))}
      </svg>
    </div>
  );
}

function StrokeBadge({
  x,
  y,
  no,
  size = "normal",
  active = false,
}: {
  x: number;
  y: number;
  no: number;
  size?: "small" | "normal";
  active?: boolean;
}) {
  const radius = size === "small" ? 13 : 16;
  const fontSize = size === "small" ? 12 : 14;

  return (
    <g>
      {active ? (
        <circle
          cx={x}
          cy={y}
          r={radius + 10}
          fill="#F52F85"
          opacity="0.14"
          className="animate-[strokePulse_1.2s_ease-in-out_infinite]"
        />
      ) : null}

      <circle
        cx={x}
        cy={y}
        r={radius}
        fill="#F52F85"
        stroke="white"
        strokeWidth="3"
      />

      <text
        x={x}
        y={y + fontSize * 0.35}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="900"
        fill="white"
      >
        {no}
      </text>
    </g>
  );
}

function TraceLetters({
  currentLetter,
}: {
  currentLetter: string;
}) {
  const [tool, setTool] = useState<ToolMode>("pen");
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [penSize, setPenSize] = useState(18);

  const [upperLines, setUpperLines] = useState<StrokeLine[]>([]);
  const [lowerLines, setLowerLines] = useState<StrokeLine[]>([]);

  const [upperDone, setUpperDone] = useState(false);
  const [lowerDone, setLowerDone] = useState(false);

  function clearAll() {
    setUpperLines([]);
    setLowerLines([]);
    setUpperDone(false);
    setLowerDone(false);
  }

  function undo() {
    if (lowerLines.length > 0) {
      setLowerLines((lines) => lines.slice(0, -1));
      setLowerDone(false);
      return;
    }

    if (upperLines.length > 0) {
      setUpperLines((lines) => lines.slice(0, -1));
      setUpperDone(false);
    }
  }

  const guideSet = LETTER_GUIDES[currentLetter];

  return (
    <div className="border-t border-[#EEF0F6] p-4 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <TracePad
          label="UPPERCASE"
          side="upper"
          lines={upperLines}
          setLines={setUpperLines}
          color={penColor}
          penSize={penSize}
          tool={tool}
          done={upperDone}
          onDone={() => setUpperDone(true)}
          guides={guideSet.upper}
        />

        <TracePad
          label="LOWERCASE"
          side="lower"
          lines={lowerLines}
          setLines={setLowerLines}
          color={penColor}
          penSize={penSize}
          tool={tool}
          done={lowerDone}
          onDone={() => setLowerDone(true)}
          guides={guideSet.lower}
        />
      </div>

      <ToolBar
        tool={tool}
        setTool={setTool}
        penColor={penColor}
        setPenColor={setPenColor}
        penSize={penSize}
        setPenSize={setPenSize}
        onUndo={undo}
        onClear={clearAll}
      />
    </div>
  );
}

function TracePad({
  label,
  side,
  lines,
  setLines,
  color,
  penSize,
  tool,
  done,
  onDone,
  guides,
}: {
  label: string;
  side: TraceSide;
  lines: StrokeLine[];
  setLines: Dispatch<SetStateAction<StrokeLine[]>>;
  color: string;
  penSize: number;
  tool: ToolMode;
  done: boolean;
  onDone: () => void;
  guides: GuideDef[];
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  /*
    Performance:
    - Jangan set React state pada setiap pointermove.
    - Stroke semasa dilukis terus pada <polyline> melalui ref.
    - State hanya commit bila jari diangkat / stroke selesai.
  */
  const livePolylineRef =
    useRef<SVGPolylineElement | null>(null);

  const drawingRef = useRef(false);
  const livePointsRef = useRef<Point[]>([]);
  const lastMoveTimeRef = useRef(0);

  const [activeStroke, setActiveStroke] =
    useState(0);

  const initialProgress =
    side === "upper"
      ? [0, 0, 0]
      : [0, 0];

  const [strokeProgress, setStrokeProgress] =
    useState<number[]>(initialProgress);

  const activeStrokeRef = useRef(0);
  const strokeProgressRef =
    useRef<number[]>(initialProgress);

  /*
    Pre-sampled path points.
    Ini jauh lebih ringan daripada getPointAtLength 120 kali
    pada SETIAP pointermove.
  */
  const guideSamplesRef = useRef<
    Array<Array<Point>>
  >([]);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const sampleCount = 180;

    guideSamplesRef.current = guides.map(
      (_, index) => {
        const path =
          svg.querySelector<SVGPathElement>(
            `[data-guide-index="${index}"]`
          );

        if (!path) return [];

        const total = path.getTotalLength();

        return Array.from(
          { length: sampleCount + 1 },
          (_, sampleIndex) => {
            const p = path.getPointAtLength(
              total *
                (sampleIndex / sampleCount)
            );

            return {
              x: p.x,
              y: p.y,
            };
          }
        );
      }
    );
  }, [guides, side]);

  function updateActiveStroke(value: number) {
    activeStrokeRef.current = value;
    setActiveStroke(value);
  }

  function updateStrokeProgress(
    value: number[]
  ) {
    strokeProgressRef.current = value;
    setStrokeProgress(value);
  }

  function getSvgPoint(
    event: ReactPointerEvent<SVGSVGElement>
  ): Point {
    const svg = svgRef.current;

    if (!svg) {
      return { x: 0, y: 0 };
    }

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const matrix = svg.getScreenCTM();

    if (!matrix) {
      return { x: 0, y: 0 };
    }

    const transformed =
      point.matrixTransform(
        matrix.inverse()
      );

    return {
      x: transformed.x,
      y: transformed.y,
    };
  }

  /*
    STRICT FORWARD SEARCH

    Jangan cari nearest point pada seluruh path.
    Untuk lowercase a, awal dan akhir bulatan sangat dekat.
    Kalau global nearest digunakan, student sentuh No.1
    boleh terus dianggap hampir 100%.

    Kita hanya cari sedikit di depan progress semasa.
  */
  function findForwardPosition(
    strokeIndex: number,
    point: Point
  ) {
    const samples =
      guideSamplesRef.current[
        strokeIndex
      ] || [];

    if (samples.length === 0) {
      return null;
    }

    const currentPercent =
      strokeProgressRef.current[
        strokeIndex
      ] || 0;

    const currentIndex = Math.round(
      (currentPercent / 100) *
        (samples.length - 1)
    );

    const backwardAllowance =
      currentPercent === 0 ? 0 : 8;

    /*
      Maksimum gerakan ke depan sekali gus.
      Ini prevent lompat terus ke hujung.
    */
    const forwardAllowance = 28;

    const startIndex = Math.max(
      0,
      currentIndex - backwardAllowance
    );

    const endIndex = Math.min(
      samples.length - 1,
      currentIndex + forwardAllowance
    );

    let bestIndex = -1;
    let bestDistance =
      Number.POSITIVE_INFINITY;

    for (
      let i = startIndex;
      i <= endIndex;
      i++
    ) {
      const sample = samples[i];

      const distance = Math.hypot(
        point.x - sample.x,
        point.y - sample.y
      );

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }

    if (bestIndex < 0) {
      return null;
    }

    return {
      distance: bestDistance,
      percent:
        (bestIndex /
          (samples.length - 1)) *
        100,
      point: samples[bestIndex],
    };
  }

  function isNearAllowedStart(
    strokeIndex: number,
    point: Point
  ) {
    const samples =
      guideSamplesRef.current[
        strokeIndex
      ] || [];

    if (samples.length === 0) {
      return false;
    }

    const currentPercent =
      strokeProgressRef.current[
        strokeIndex
      ] || 0;

    /*
      Kalau belum mula:
      hanya kawasan 0-10% stroke yang aktif.

      Kalau sambung:
      hanya sekitar tempat progress terakhir.
    */
    const centerIndex =
      currentPercent === 0
        ? 0
        : Math.round(
            (currentPercent / 100) *
              (samples.length - 1)
          );

    const startIndex =
      currentPercent === 0
        ? 0
        : Math.max(
            0,
            centerIndex - 14
          );

    const endIndex =
      currentPercent === 0
        ? Math.min(
            samples.length - 1,
            18
          )
        : Math.min(
            samples.length - 1,
            centerIndex + 14
          );

    /*
      Toleransi besar untuk jari kanak-kanak,
      tetapi masih LOCK kepada stroke aktif.
    */
    const allowedRadius = 38;

    for (
      let i = startIndex;
      i <= endIndex;
      i++
    ) {
      const sample = samples[i];

      if (
        Math.hypot(
          point.x - sample.x,
          point.y - sample.y
        ) <= allowedRadius
      ) {
        return true;
      }
    }

    return false;
  }

  function setLivePolyline(
    points: Point[]
  ) {
    const node =
      livePolylineRef.current;

    if (!node) return;

    node.setAttribute(
      "points",
      points
        .map(
          (p) =>
            `${p.x.toFixed(
              1
            )},${p.y.toFixed(1)}`
        )
        .join(" ")
    );

    node.setAttribute(
      "stroke",
      color
    );

    node.setAttribute(
      "stroke-width",
      String(penSize)
    );
  }

  function clearLivePolyline() {
    livePointsRef.current = [];

    const node =
      livePolylineRef.current;

    if (node) {
      node.setAttribute(
        "points",
        ""
      );
    }
  }

  function commitLiveStroke() {
    const points =
      livePointsRef.current;

    if (points.length < 2) {
      clearLivePolyline();
      return;
    }

    setLines((old) => [
      ...old,
      {
        id: `${Date.now()}-${Math.random()}`,
        color,
        size: penSize,
        points: [...points],
      },
    ]);

    clearLivePolyline();
  }

  /*
    Eraser hanya buang USER STROKES.
    Guide, dotted alphabet, badge dan handwriting line
    berada pada layer berasingan dan tak pernah disentuh.
  */
  function eraseNearbyUserStroke(
    point: Point
  ) {
    const radius = Math.max(
      22,
      penSize * 1.15
    );

    setLines((old) =>
      old.filter((line) => {
        const hit = line.points.some(
          (p) =>
            Math.hypot(
              p.x - point.x,
              p.y - point.y
            ) <= radius
        );

        return !hit;
      })
    );
  }

  function startDrawing(
    event: ReactPointerEvent<SVGSVGElement>
  ) {
    const point = getSvgPoint(event);

    if (tool === "eraser") {
      drawingRef.current = true;

      eraseNearbyUserStroke(point);

      try {
        event.currentTarget.setPointerCapture(
          event.pointerId
        );
      } catch {}

      return;
    }

    if (guides.length === 0 || done) {
      return;
    }

    const strokeIndex =
      activeStrokeRef.current;

    /*
      HARD LOCK:
      Student hanya boleh mula stroke semasa.
      Stroke 2 tak boleh disentuh selagi stroke 1
      belum 100%.
    */
    if (
      strokeIndex > 0 &&
      (strokeProgressRef.current[
        strokeIndex - 1
      ] || 0) < 100
    ) {
      return;
    }

    if (
      !isNearAllowedStart(
        strokeIndex,
        point
      )
    ) {
      return;
    }

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch {}

    drawingRef.current = true;

    livePointsRef.current = [point];

    setLivePolyline(
      livePointsRef.current
    );
  }

  function moveDrawing(
    event: ReactPointerEvent<SVGSVGElement>
  ) {
    if (!drawingRef.current) {
      return;
    }

    const now =
      performance.now();

    /*
      Limit kepada ~60fps.
      iPhone boleh hantar pointermove jauh lebih laju
      dan itu yang buat UI lag.
    */
    if (
      now -
        lastMoveTimeRef.current <
      14
    ) {
      return;
    }

    lastMoveTimeRef.current = now;

    const point = getSvgPoint(event);

    if (tool === "eraser") {
      eraseNearbyUserStroke(point);
      return;
    }

    const strokeIndex =
      activeStrokeRef.current;

    const forward =
      findForwardPosition(
        strokeIndex,
        point
      );

    if (!forward) {
      return;
    }

    /*
      User boleh lari sedikit dari dotted guide,
      tapi bukan terlalu jauh.
    */
    if (forward.distance > 34) {
      return;
    }

    const previous =
      strokeProgressRef.current[
        strokeIndex
      ] || 0;

    let accepted = Math.max(
      previous,
      forward.percent
    );

    /*
      Jangan complete terlalu awal.
      Untuk loop lowercase a, kena betul-betul
      hampir habis keliling dulu.
    */
    if (accepted >= 97) {
      accepted = 100;
    }

    const nextProgress = [
      ...strokeProgressRef.current,
    ];

    nextProgress[
      strokeIndex
    ] = accepted;

    /*
      State progress tak perlu update setiap pixel.
      Update visual apabila berubah ~2%.
    */
    if (
      Math.abs(
        accepted - previous
      ) >= 1.5 ||
      accepted === 100
    ) {
      updateStrokeProgress(
        nextProgress
      );
    } else {
      strokeProgressRef.current =
        nextProgress;
    }

    /*
      Snap lukisan ke GUIDE POINT,
      bukan raw finger point.
      Hasil lebih smooth dan kemas.
    */
    const lastPoint =
      livePointsRef.current[
        livePointsRef.current.length -
          1
      ];

    const snapped =
      forward.point;

    if (
      !lastPoint ||
      Math.hypot(
        lastPoint.x - snapped.x,
        lastPoint.y - snapped.y
      ) > 2.2
    ) {
      livePointsRef.current.push(
        snapped
      );

      /*
        Elakkan array terlalu besar pada mobile.
      */
      if (
        livePointsRef.current.length >
        220
      ) {
        livePointsRef.current =
          livePointsRef.current.filter(
            (_, i) =>
              i % 2 === 0
          );
      }

      setLivePolyline(
        livePointsRef.current
      );
    }

    if (accepted >= 100) {
      finishStroke();
    }
  }

  function finishStroke() {
    const strokeIndex =
      activeStrokeRef.current;

    const nextProgress = [
      ...strokeProgressRef.current,
    ];

    nextProgress[
      strokeIndex
    ] = 100;

    updateStrokeProgress(
      nextProgress
    );

    commitLiveStroke();

    drawingRef.current = false;

    /*
      STRICT SEQUENCE:
      baru unlock next stroke selepas 100%.
    */
    if (
      strokeIndex >=
      guides.length - 1
    ) {
      onDone();
      return;
    }

    updateActiveStroke(
      strokeIndex + 1
    );
  }

  function endDrawing(
    event: ReactPointerEvent<SVGSVGElement>
  ) {
    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {}

    if (tool === "eraser") {
      drawingRef.current = false;
      return;
    }

    if (!drawingRef.current) {
      return;
    }

    const strokeIndex =
      activeStrokeRef.current;

    const progress =
      strokeProgressRef.current[
        strokeIndex
      ] || 0;

    /*
      Hanya complete kalau benar-benar hampir hujung.
      Kalau belum, commit segment dan student
      boleh sambung dari tempat terakhir.
    */
    if (progress >= 97) {
      finishStroke();
      return;
    }

    commitLiveStroke();
    drawingRef.current = false;
  }

  /*
    Badge positions:
    lowercase a No.1 di kiri luar circle,
    No.2 di kanan atas straight stroke.
  */
  function getBadgePosition(
    guide: GuideDef
  ) {
    return {
      x:
        guide.badgeX ??
        guide.startX - 24,
      y:
        guide.badgeY ??
        guide.startY - 18,
    };
  }

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-[#DDE2EF] bg-white">
      <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-[#F2EDFF] px-4 py-2 text-xs font-black tracking-[0.05em] text-[#7445F3]">
        {label}
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 300 360"
        className="block h-[440px] w-full touch-none select-none sm:h-[500px]"
        onPointerDown={startDrawing}
        onPointerMove={moveDrawing}
        onPointerUp={endDrawing}
        onPointerCancel={endDrawing}
      >
        {/* HANDWRITING LINES — permanent */}
        <g pointerEvents="none">
          <line
            x1="25"
            y1="86"
            x2="275"
            y2="86"
            stroke="#DCE2EF"
            strokeWidth="2"
          />

          <line
            x1="25"
            y1="220"
            x2="275"
            y2="220"
            stroke="#D8DFF0"
            strokeWidth="2"
            strokeDasharray="5 7"
          />

          <line
            x1="25"
            y1="330"
            x2="275"
            y2="330"
            stroke="#B9C7E4"
            strokeWidth="2"
          />
        </g>

        {guides.length > 0 ? (
          <g pointerEvents="none">
            {guides.map(
              (guide, index) => {
                const locked =
                  index >
                  activeStroke;

                const finished =
                  index <
                    activeStroke ||
                  done;

                return (
                  <path
                    key={`guide-${guide.number}`}
                    data-guide-index={index}
                    d={guide.d}
                    fill="none"
                    stroke={
                      locked
                        ? "#D8DFEC"
                        : finished
                          ? "#C3CDDF"
                          : "#AAB7D0"
                    }
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="2 12"
                    opacity={
                      locked
                        ? 0.45
                        : finished
                          ? 0.5
                          : 0.9
                    }
                  />
                );
              }
            )}

            {guides.map(
              (guide, index) => {
                const pos =
                  getBadgePosition(
                    guide
                  );

                const locked =
                  index >
                  activeStroke;

                const finished =
                  index <
                    activeStroke ||
                  done;

                return (
                  <g
                    key={`badge-${guide.number}`}
                    opacity={
                      locked
                        ? 0.36
                        : finished
                          ? 0.55
                          : 1
                    }
                  >
                    <StrokeBadge
                      x={pos.x}
                      y={pos.y}
                      no={guide.number}
                      size="small"
                      active={
                        !done &&
                        index ===
                          activeStroke
                      }
                    />
                  </g>
                );
              }
            )}
          </g>
        ) : null}

        {/* SAVED USER STROKES */}
        <g pointerEvents="none">
          {lines.map((line) => (
            <polyline
              key={line.id}
              points={line.points
                .map(
                  (p) =>
                    `${p.x},${p.y}`
                )
                .join(" ")}
              fill="none"
              stroke={line.color}
              strokeWidth={line.size}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* LIVE STROKE — imperative, no React rerender per move */}
        <polyline
          ref={livePolylineRef}
          points=""
          fill="none"
          stroke={color}
          strokeWidth={penSize}
          strokeLinecap="round"
          strokeLinejoin="round"
          pointerEvents="none"
        />
      </svg>

      {done ? (
        <div className="absolute bottom-5 right-5 grid h-11 w-11 place-items-center rounded-full bg-[#2CC77F] text-white shadow-[0_8px_18px_rgba(44,199,127,0.24)]">
          <Check
            size={23}
            strokeWidth={4}
          />
        </div>
      ) : null}

      {/* tiny status to make locked sequence clear */}
      {!done && guides.length > 0 ? (
        <div className="pointer-events-none absolute bottom-5 left-5 rounded-full border border-[#E3D9FF] bg-white/92 px-3 py-1.5 text-xs font-black text-[#7445F3] shadow-sm backdrop-blur">
          Stroke {activeStroke + 1} /{" "}
          {guides.length}
        </div>
      ) : null}
    </div>
  );
}

function WriteYourself() {
  const [tool, setTool] = useState<ToolMode>("pen");
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [penSize, setPenSize] = useState(18);

  const [upperLines, setUpperLines] = useState<StrokeLine[]>([]);
  const [lowerLines, setLowerLines] = useState<StrokeLine[]>([]);

  function undo() {
    if (lowerLines.length > 0) {
      setLowerLines((lines) => lines.slice(0, -1));
      return;
    }

    if (upperLines.length > 0) {
      setUpperLines((lines) => lines.slice(0, -1));
    }
  }

  function clear() {
    setUpperLines([]);
    setLowerLines([]);
  }

  return (
    <div className="border-t border-[#EEF0F6] p-4 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <FreeWritePad
          label="UPPERCASE"
          lines={upperLines}
          setLines={setUpperLines}
          color={penColor}
          penSize={penSize}
          tool={tool}
        />

        <FreeWritePad
          label="LOWERCASE"
          lines={lowerLines}
          setLines={setLowerLines}
          color={penColor}
          penSize={penSize}
          tool={tool}
        />
      </div>

      <ToolBar
        tool={tool}
        setTool={setTool}
        penColor={penColor}
        setPenColor={setPenColor}
        penSize={penSize}
        setPenSize={setPenSize}
        onUndo={undo}
        onClear={clear}
      />
    </div>
  );
}

function FreeWritePad({
  label,
  lines,
  setLines,
  color,
  penSize,
  tool,
}: {
  label: string;
  lines: StrokeLine[];
  setLines: Dispatch<SetStateAction<StrokeLine[]>>;
  color: string;
  penSize: number;
  tool: ToolMode;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const drawingRef = useRef(false);
  const activeIdRef = useRef<string | null>(null);

  function getPoint(
    event: ReactPointerEvent<SVGSVGElement>
  ): Point {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const p = svg.createSVGPoint();
    p.x = event.clientX;
    p.y = event.clientY;

    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };

    const result = p.matrixTransform(matrix.inverse());
    return { x: result.x, y: result.y };
  }

  function down(
    event: ReactPointerEvent<SVGSVGElement>
  ) {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}

    const p = getPoint(event);
    const id = `${Date.now()}-${Math.random()}`;

    drawingRef.current = true;
    activeIdRef.current = id;

    setLines((old) => [
      ...old,
      {
        id,
        color: tool === "eraser" ? "#FFFFFF" : color,
        size:
          tool === "eraser"
            ? Math.max(38, penSize + 18)
            : penSize,
        points: [p],
      },
    ]);
  }

  function move(
    event: ReactPointerEvent<SVGSVGElement>
  ) {
    if (!drawingRef.current || !activeIdRef.current) return;

    const p = getPoint(event);
    const id = activeIdRef.current;

    setLines((old) =>
      old.map((line) =>
        line.id === id
          ? { ...line, points: [...line.points, p] }
          : line
      )
    );
  }

  function up(
    event: ReactPointerEvent<SVGSVGElement>
  ) {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}

    drawingRef.current = false;
    activeIdRef.current = null;
  }

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-[#DDE2EF] bg-white">
      <div className="absolute left-5 top-4 z-20 rounded-full bg-[#F2EDFF] px-4 py-2 text-xs font-black tracking-[0.05em] text-[#7445F3]">
        {label}
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 300 260"
        className="block h-[320px] w-full touch-none select-none sm:h-[360px]"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <line
          x1="20"
          y1="70"
          x2="280"
          y2="70"
          stroke="#DCE2EF"
          strokeWidth="2"
        />
        <line
          x1="20"
          y1="165"
          x2="280"
          y2="165"
          stroke="#D4DDEE"
          strokeWidth="2"
          strokeDasharray="5 7"
        />
        <line
          x1="20"
          y1="240"
          x2="280"
          y2="240"
          stroke="#B7C5E1"
          strokeWidth="2"
        />

        {lines.map((line) => (
          <polyline
            key={line.id}
            points={line.points
              .map((p) => `${p.x},${p.y}`)
              .join(" ")}
            fill="none"
            stroke={line.color}
            strokeWidth={line.size}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}

function ToolBar({
  tool,
  setTool,
  penColor,
  setPenColor,
  penSize,
  setPenSize,
  onUndo,
  onClear,
}: {
  tool: ToolMode;
  setTool: Dispatch<SetStateAction<ToolMode>>;
  penColor: string;
  setPenColor: Dispatch<SetStateAction<string>>;
  penSize: number;
  setPenSize: Dispatch<SetStateAction<number>>;
  onUndo: () => void;
  onClear: () => void;
}) {
  return (
    <div className="mt-4 rounded-[22px] border border-[#E2E6F0] bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTool("pen")}
            className={`flex h-14 items-center gap-2 rounded-[16px] px-4 font-black ${
              tool === "pen"
                ? "bg-gradient-to-r from-[#7948F4] to-[#6535E9] text-white shadow-md"
                : "border border-[#DFE3ED] bg-white text-[#42516E]"
            }`}
          >
            <PenLine size={19} />
            Pen
          </button>

          <button
            type="button"
            onClick={() => setTool("eraser")}
            className={`flex h-14 items-center gap-2 rounded-[16px] px-4 font-black ${
              tool === "eraser"
                ? "bg-gradient-to-r from-[#7948F4] to-[#6535E9] text-white shadow-md"
                : "border border-[#DFE3ED] bg-white text-[#42516E]"
            }`}
          >
            <Eraser size={19} />
            Eraser
          </button>

          <button
            type="button"
            onClick={onUndo}
            className="flex h-14 items-center gap-2 rounded-[16px] border border-[#DFE3ED] bg-white px-4 font-black text-[#42516E]"
          >
            <Undo2 size={19} />
            Undo
          </button>

          <button
            type="button"
            onClick={onClear}
            className="flex h-14 items-center gap-2 rounded-[16px] border border-[#FFD7E8] bg-white px-4 font-black text-[#F33684]"
          >
            <Trash2 size={19} />
            Clear
          </button>
        </div>

        <div className="hidden h-12 w-px bg-[#E7E8EF] lg:block" />

        <div className="min-w-[260px] flex-1">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-[#8491AC]">
            Pen Color
          </p>

          <div className="flex flex-wrap gap-2">
            {PEN_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setPenColor(color);
                  setTool("pen");
                }}
                className={`h-9 w-9 rounded-full border-[3px] transition ${
                  penColor === color
                    ? "scale-110 border-[#6C3BF0]"
                    : "border-white"
                }`}
                style={{
                  backgroundColor: color,
                  boxShadow:
                    penColor === color
                      ? "0 0 0 2px #D9CCFF"
                      : "0 0 0 1px #E5E7EF",
                }}
                aria-label={`Choose ${color}`}
              />
            ))}
          </div>
        </div>

        <div className="hidden h-12 w-px bg-[#E7E8EF] lg:block" />

        <div className="min-w-[280px] flex-1">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-[#8491AC]">
            Pen Size
          </p>

          <div className="flex items-end gap-2">
            {PEN_SIZES.map((size) => {
              const dotSize = Math.max(10, Math.min(28, size));

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPenSize(size)}
                  className={`grid h-11 w-11 place-items-center rounded-full border transition ${
                    penSize === size
                      ? "border-[#7040F1] bg-[#F3EEFF]"
                      : "border-transparent"
                  }`}
                  aria-label={`Pen size ${size}`}
                >
                  <span
                    className="rounded-full bg-[#56678D]"
                    style={{
                      width: `${dotSize}px`,
                      height: `${dotSize}px`,
                    }}
                  />
                </button>
              );
            })}
          </div>

          <p className="mt-1 text-xs font-bold text-[#9AA5BC]">
            Minimum 10px — comfortable for finger and stylus.
          </p>
        </div>
      </div>
    </div>
  );
}