"use client";

import ExerciseVisualizer from "@/components/exercise-visualizer";
import type { ExerciseRecord, MovementPattern } from "@/lib/exercise-library";

export default function ExerciseMotion({ exercise, pattern, compact = false }: { exercise?: ExerciseRecord; pattern?: MovementPattern; compact?: boolean }) {
  if (exercise) return <ExerciseVisualizer exercise={exercise} compact={compact}/>;
  const activePattern = pattern ?? "mobility";

  return (
    <div role="img" aria-label="Animowany podgląd wzorca ruchu" className={`exercise-demo relative grid place-items-center overflow-hidden rounded-2xl bg-[#ededeb] ${compact ? "h-24" : "h-48"}`}>
      <div className="motion-figure text-black" data-motion={activePattern}>
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
