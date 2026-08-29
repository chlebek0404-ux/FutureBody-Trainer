"use client";

import type { MuscleId } from "@/lib/exercises";

/**
 * Mapa mięśni: uproszczona sylwetka od przodu i od tyłu z podświetleniem
 * partii pracujących w ćwiczeniu. Rysowana w kodzie, więc działa dla całego
 * katalogu bez plików graficznych i skaluje się bez utraty jakości.
 */

type Region = { id: MuscleId; view: "front" | "back"; d: string };

// Sylwetka mieści się w układzie 100 × 200.
const regions: Region[] = [
  // ── przód ──
  { id: "anteriorDeltoid", view: "front", d: "M27 52 q-7 3 -8 13 q6 3 11 -1 q1 -7 3 -11 z" },
  { id: "anteriorDeltoid", view: "front", d: "M73 52 q7 3 8 13 q-6 3 -11 -1 q-1 -7 -3 -11 z" },
  { id: "upperChest", view: "front", d: "M35 53 q15 -4 30 0 l-1 8 q-14 -4 -28 0 z" },
  { id: "pectoralisMajor", view: "front", d: "M34 62 q16 -4 32 0 l-2 13 q-14 5 -28 0 z" },
  { id: "rectusAbdominis", view: "front", d: "M42 77 h16 v28 q-8 4 -16 0 z" },
  { id: "obliques", view: "front", d: "M35 78 l6 -1 v26 l-7 -4 z" },
  { id: "obliques", view: "front", d: "M65 78 l-6 -1 v26 l7 -4 z" },
  { id: "biceps", view: "front", d: "M23 68 q-5 8 -5 18 l7 2 q1 -11 4 -18 z" },
  { id: "biceps", view: "front", d: "M77 68 q5 8 5 18 l-7 2 q-1 -11 -4 -18 z" },
  { id: "forearms", view: "front", d: "M18 88 q-2 12 0 22 l7 -1 q1 -12 0 -20 z" },
  { id: "forearms", view: "front", d: "M82 88 q2 12 0 22 l-7 -1 q-1 -12 0 -20 z" },
  { id: "quadriceps", view: "front", d: "M40 110 q-4 22 -2 40 l11 1 q2 -22 1 -41 z" },
  { id: "quadriceps", view: "front", d: "M60 110 q4 22 2 40 l-11 1 q-2 -22 -1 -41 z" },
  { id: "adductors", view: "front", d: "M46 112 h8 v24 h-8 z" },
  { id: "calves", view: "front", d: "M41 155 q-2 15 0 26 l8 -1 q1 -14 0 -25 z" },
  { id: "calves", view: "front", d: "M59 155 q2 15 0 26 l-8 -1 q-1 -14 0 -25 z" },
  // ── tył ──
  { id: "trapezius", view: "back", d: "M38 48 q12 -4 24 0 l-4 18 q-8 3 -16 0 z" },
  { id: "posteriorDeltoid", view: "back", d: "M27 52 q-7 3 -8 13 q6 3 11 -1 q1 -7 3 -11 z" },
  { id: "posteriorDeltoid", view: "back", d: "M73 52 q7 3 8 13 q-6 3 -11 -1 q-1 -7 -3 -11 z" },
  { id: "latissimusDorsi", view: "back", d: "M33 66 q8 -3 16 0 v20 q-11 3 -18 -4 z" },
  { id: "latissimusDorsi", view: "back", d: "M67 66 q-8 -3 -16 0 v20 q11 3 18 -4 z" },
  { id: "triceps", view: "back", d: "M22 68 q-5 8 -5 18 l7 2 q1 -11 4 -18 z" },
  { id: "triceps", view: "back", d: "M78 68 q5 8 5 18 l-7 2 q-1 -11 -4 -18 z" },
  { id: "forearms", view: "back", d: "M17 88 q-2 12 0 22 l7 -1 q1 -12 0 -20 z" },
  { id: "forearms", view: "back", d: "M83 88 q2 12 0 22 l-7 -1 q-1 -12 0 -20 z" },
  { id: "erectorSpinae", view: "back", d: "M45 68 h10 v36 h-10 z" },
  { id: "gluteusMaximus", view: "back", d: "M38 104 q12 -5 24 0 l-2 16 q-10 4 -20 0 z" },
  { id: "abductors", view: "back", d: "M35 106 l5 -1 v14 l-6 -3 z" },
  { id: "abductors", view: "back", d: "M65 106 l-5 -1 v14 l6 -3 z" },
  { id: "hamstrings", view: "back", d: "M40 122 q-3 18 -1 32 l11 1 q2 -18 1 -33 z" },
  { id: "hamstrings", view: "back", d: "M60 122 q3 18 1 32 l-11 1 q-2 -18 -1 -33 z" },
  { id: "calves", view: "back", d: "M41 157 q-2 14 0 24 l8 -1 q1 -13 0 -23 z" },
  { id: "calves", view: "back", d: "M59 157 q2 14 0 24 l-8 -1 q-1 -13 0 -23 z" },
];

// Kontur ciała wspólny dla obu widoków.
const silhouette =
  "M50 18 q9 0 9 10 q0 8 -4 11 q10 2 16 8 q6 6 8 16 q3 14 3 26 q0 12 -3 22 q-2 6 -6 6 q-3 0 -4 -5 l-3 -14 q-1 12 -2 20 q-1 10 -3 20 q-2 14 -3 30 q-1 12 -2 20 q-1 6 -6 6 q-5 0 -5 -6 l-2 -30 h-4 l-2 30 q0 6 -5 6 q-5 0 -6 -6 q-1 -8 -2 -20 q-1 -16 -3 -30 q-2 -10 -3 -20 q-1 -8 -2 -20 l-3 14 q-1 5 -4 5 q-4 0 -6 -6 q-3 -10 -3 -22 q0 -12 3 -26 q2 -10 8 -16 q6 -6 16 -8 q-4 -3 -4 -11 q0 -10 9 -10 z";

export default function MuscleMap({ primary, secondary, className = "" }: {
  primary: MuscleId[];
  secondary: MuscleId[];
  className?: string;
}) {
  function fill(id: MuscleId) {
    if (primary.includes(id)) return "var(--fb-gold, #ffc400)";
    if (secondary.includes(id)) return "color-mix(in srgb, var(--fb-gold, #ffc400) 38%, transparent)";
    return "transparent";
  }

  const views: ("front" | "back")[] = ["front", "back"];

  return (
    <div className={`flex items-end justify-center gap-1 ${className}`} aria-hidden="true">
      {views.map((view) => (
        <svg key={view} viewBox="0 0 100 200" className="h-full w-auto" role="presentation">
          <path d={silhouette} fill="currentColor" opacity="0.14" />
          {regions.filter((region) => region.view === view).map((region, index) => (
            <path key={`${region.id}-${index}`} d={region.d} fill={fill(region.id)} />
          ))}
          <path d={silhouette} fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.35" />
        </svg>
      ))}
    </div>
  );
}
