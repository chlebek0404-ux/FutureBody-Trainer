"use client";

import MuscleMap from "@/components/muscle-map";
import type { ExerciseRecord, MovementPattern } from "@/lib/exercises";

/**
 * Podgląd ćwiczenia.
 *
 * Gdy znany jest rekord ćwiczenia, pokazujemy mapę pracujących mięśni.
 * Bez rekordu wracamy do schematycznej animacji wzorca ruchowego, która
 * korzysta z klas w `globals.css` opisanych starszym zestawem wzorców —
 * dlatego nowe wzorce mapujemy na tamte nazwy.
 */

const motionByPattern: Partial<Record<MovementPattern, string>> = {
  squat: "squat",
  hinge: "hinge",
  lunge: "lunge",
  "horizontal-push": "push",
  "vertical-push": "push",
  "horizontal-pull": "pull",
  "vertical-pull": "pull",
  "anti-extension": "core",
  "anti-rotation": "core",
  flexion: "core",
  rotation: "core",
  "lateral-flexion": "core",
  isolation: "push",
  mobility: "mobility",
  recovery: "mobility",
  carry: "hinge",
  locomotion: "lunge",
  jump: "squat",
  throw: "hinge",
  cardio: "lunge",
};

export default function ExerciseMotion({ exercise, pattern, compact = false }: { exercise?: ExerciseRecord; pattern?: MovementPattern; compact?: boolean }) {
  if (exercise) {
    return (
      <div className={`grid place-items-center rounded-2xl bg-[#ededeb] ${compact ? "h-24" : "h-44"}`}>
        <div className="h-full py-2 text-black/70">
          <MuscleMap primary={exercise.primaryMuscles} secondary={exercise.secondaryMuscles} className="h-full" />
        </div>
      </div>
    );
  }

  const activeMotion = motionByPattern[pattern ?? "mobility"] ?? "mobility";

  return (
    <div role="img" aria-label="Animowany podgląd wzorca ruchu" className={`exercise-demo relative grid place-items-center overflow-hidden rounded-2xl bg-[#ededeb] ${compact ? "h-24" : "h-48"}`}>
      <div className="motion-figure text-black" data-motion={activeMotion}>
        <span className="motion-head" />
        <span className="motion-torso" />
        <span className="motion-arm motion-arm-left" />
        <span className="motion-arm motion-arm-right" />
        <span className="motion-leg motion-leg-left" />
        <span className="motion-leg motion-leg-right" />
      </div>
    </div>
  );
}
