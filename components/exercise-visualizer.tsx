"use client";

import { Dumbbell, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { muscleLabels, type ExerciseRecord } from "@/lib/exercise-library";

type VisualizerMode = "movement" | "muscles";

export default function ExerciseVisualizer({ exercise, compact = false }: { exercise: ExerciseRecord; compact?: boolean }) {
  const [mode, setMode] = useState<VisualizerMode>("movement");
  const [playing, setPlaying] = useState(() => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const visualization = exercise.visualization;
  const asset = visualization.animationAsset;
  const phases = visualization.movementPhases;
  const visibleFrames = Math.min(asset?.frameCount ?? 0, phases.length);
  const activePhase = phases[phaseIndex] ?? phases[0];

  useEffect(() => {
    if (compact || mode !== "movement" || !asset || !playing || visibleFrames < 2) return;
    const timer = window.setTimeout(
      () => setPhaseIndex((index) => (index + 1) % visibleFrames),
      activePhase?.durationMs ?? 800,
    );
    return () => window.clearTimeout(timer);
  }, [activePhase?.durationMs, asset, compact, mode, playing, visibleFrames]);

  if (compact) return <CompactPreview exercise={exercise}/>;

  return <section className="overflow-hidden rounded-[26px] border border-white/10 bg-[#090909] text-white shadow-[0_24px_80px_rgba(0,0,0,.34)]">
    <header className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="inline-flex w-fit rounded-full bg-white/[0.075] p-1" role="tablist" aria-label="Tryb wizualizacji">
        <button role="tab" aria-selected={mode === "movement"} onClick={() => setMode("movement")} className={`rounded-full px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.12em] transition ${mode === "movement" ? "bg-white text-black" : "text-white/48 hover:text-white"}`}>Technika</button>
        <button role="tab" aria-selected={mode === "muscles"} onClick={() => setMode("muscles")} className={`rounded-full px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.12em] transition ${mode === "muscles" ? "bg-white text-black" : "text-white/48 hover:text-white"}`}>Mięśnie</button>
      </div>
      <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.16em] text-white/34">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_10px_rgba(255,59,48,.9)]"/>
        Profesjonalna demonstracja ruchu
      </div>
    </header>

    {mode === "movement"
      ? asset ? <MovementStage exercise={exercise} phaseIndex={phaseIndex}/> : <MissingVisualization exercise={exercise}/>
      : <MuscleStage exercise={exercise}/>}

    <footer className="border-t border-white/10 bg-[#0d0d0d] px-4 py-4 sm:px-6">
      {mode === "movement" ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => setPlaying((value) => !value)} disabled={!asset} className="flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[8px] font-black uppercase tracking-wider text-black transition hover:scale-[1.02] disabled:opacity-30">{playing ? <Pause size={12}/> : <Play size={12}/>} {playing ? "Pauza" : "Odtwórz"}</button>
            <button onClick={() => { setPhaseIndex(0); setPlaying(true); }} disabled={!asset} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/58 transition hover:border-white/30 hover:text-white disabled:opacity-30" aria-label="Powtórz demonstrację"><RotateCcw size={13}/></button>
          </div>
          <div className="min-w-0 flex-1 sm:text-right">
            <p className="text-[11px] font-black">{asset ? activePhase?.label : "Wizualizacja w przygotowaniu"}</p>
            <p className="mt-1 text-[9px] leading-4 text-white/38">{asset ? activePhase?.cue : "Pełna instrukcja tekstowa pozostaje dostępna poniżej."}</p>
          </div>
        </div>
      ) : <MuscleLegend exercise={exercise}/>}
    </footer>
  </section>;
}

function CompactPreview({ exercise }: { exercise: ExerciseRecord }) {
  const asset = exercise.visualization.animationAsset;
  if (!asset) return <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-[#eeeeec] px-4 text-center"><div><Dumbbell size={18} className="mx-auto text-black/20"/><p className="mt-3 text-[7px] font-black uppercase tracking-[0.14em] text-black/28">Materiał w przygotowaniu</p></div></div>;
  return <div className="relative aspect-[4/3] overflow-hidden bg-[#090909]">
    <div role="img" aria-label={`Miniatura ćwiczenia ${exercise.baseName}`} className="absolute left-1/2 top-1/2 h-[92%] aspect-[3/5] -translate-x-1/2 -translate-y-1/2 bg-no-repeat" style={{ backgroundImage: `url("${asset.src}")`, backgroundSize: `${asset.frameCount * 100}% 100%`, backgroundPosition: "0% center" }}/>
    <span className="absolute bottom-3 left-3 rounded-full border border-white/12 bg-black/65 px-2.5 py-1 text-[7px] font-black uppercase tracking-wider text-white/58 backdrop-blur">5 faz ruchu</span>
  </div>;
}

function MovementStage({ exercise, phaseIndex }: { exercise: ExerciseRecord; phaseIndex: number }) {
  const asset = exercise.visualization.animationAsset!;
  const position = asset.frameCount <= 1 ? 0 : phaseIndex / (asset.frameCount - 1) * 100;
  return <div className="bg-[radial-gradient(circle_at_50%_40%,#242424_0%,#090909_67%)]">
    <div className="relative h-[360px] sm:h-[510px] lg:h-[560px]">
      <div role="img" aria-label={`${exercise.baseName}, faza ${phaseIndex + 1}`} className="absolute left-1/2 top-1/2 h-[94%] aspect-[3/5] -translate-x-1/2 -translate-y-1/2 bg-no-repeat" style={{ backgroundImage: `url("${asset.src}")`, backgroundSize: `${asset.frameCount * 100}% 100%`, backgroundPosition: `${position}% center` }}/>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent"/>
      <span className="absolute bottom-5 left-5 text-[8px] font-black uppercase tracking-[0.16em] text-white/30">Faza {phaseIndex + 1} / {asset.frameCount}</span>
    </div>
    <PhaseTimeline exercise={exercise} activeIndex={phaseIndex}/>
  </div>;
}

function PhaseTimeline({ exercise, activeIndex }: { exercise: ExerciseRecord; activeIndex: number }) {
  const asset = exercise.visualization.animationAsset!;
  const frames = Math.min(asset.frameCount, exercise.visualization.movementPhases.length);
  return <div className="grid grid-cols-5 gap-px border-t border-white/10 bg-white/10">
    {Array.from({ length: frames }, (_, index) => {
      const position = frames <= 1 ? 0 : index / (frames - 1) * 100;
      const phase = exercise.visualization.movementPhases[index];
      return <div key={phase.id} className={`relative min-w-0 bg-[#111] px-1 pb-2 pt-1.5 text-center ${activeIndex === index ? "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-white" : "opacity-45"}`}>
        <div className="mx-auto h-16 max-w-16 bg-no-repeat sm:h-20" style={{ backgroundImage: `url("${asset.src}")`, backgroundSize: `${asset.frameCount * 100}% 100%`, backgroundPosition: `${position}% center` }}/>
        <p className="mt-1 truncate text-[6px] font-black uppercase tracking-wider text-white/70 sm:text-[7px]">{phase.label}</p>
      </div>;
    })}
  </div>;
}

function MissingVisualization({ exercise }: { exercise: ExerciseRecord }) {
  return <div className="grid h-[400px] place-items-center bg-[radial-gradient(circle_at_50%_42%,#222_0%,#090909_68%)] px-6 text-center sm:h-[540px]"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/12 bg-white/[0.04]"><Dumbbell size={22} className="text-white/34"/></span><p className="mt-6 text-base font-black">Wizualizacja w przygotowaniu</p><p className="mx-auto mt-2 max-w-sm text-[10px] leading-5 text-white/34">Nie pokazujemy przypadkowej animacji, która mogłaby uczyć niewłaściwej techniki. Trener nadal ma dostęp do instrukcji, wskazówek i mięśni pracujących.</p><p className="mt-4 text-[8px] font-black uppercase tracking-widest text-white/24">{exercise.primaryMuscles.join(" • ")}</p></div></div>;
}

function MuscleStage({ exercise }: { exercise: ExerciseRecord }) {
  const asset = exercise.visualization.animationAsset;
  if (!asset) return <MissingVisualization exercise={exercise}/>;
  return <div className="relative flex min-h-[400px] items-center bg-[#090909] p-4 sm:min-h-[540px] sm:p-7">
    <div role="img" aria-label={`${exercise.baseName} — wizualizacja pracujących mięśni`} className="mx-auto h-[360px] w-full bg-contain bg-center bg-no-repeat sm:h-[500px]" style={{ backgroundImage: `url("${asset.src}")` }}/>
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent"/>
    <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
      <p className="max-w-md text-[8px] font-black uppercase leading-4 tracking-[0.14em] text-white/45">Czerwone pola pokazują obszary najbardziej zaangażowane w kolejnych fazach ruchu</p>
      <span className="h-3 w-3 shrink-0 rounded-full bg-[#ff3b30] shadow-[0_0_18px_rgba(255,59,48,.9)]"/>
    </div>
  </div>;
}

function MuscleLegend({ exercise }: { exercise: ExerciseRecord }) {
  const primary = exercise.visualization.primaryMuscles;
  const secondary = exercise.visualization.secondaryMuscles;
  return <div className="grid gap-3 sm:grid-cols-2">
    <div className="flex min-w-0 items-start gap-3"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#ff3b30] shadow-[0_0_12px_rgba(255,59,48,.7)]"/><div className="min-w-0"><p className="text-[7px] font-black uppercase tracking-[0.13em] text-white/30">Główne mięśnie</p><p className="mt-1 text-[9px] font-bold leading-4">{primary.length ? primary.map((id) => muscleLabels[id]).join(" • ") : "Brak mapowania"}</p></div></div>
    <div className="flex min-w-0 items-start gap-3"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border border-[#ff3b30]/70 bg-[#ff3b30]/28"/><div className="min-w-0"><p className="text-[7px] font-black uppercase tracking-[0.13em] text-white/30">Pomocnicze</p><p className="mt-1 text-[9px] leading-4 text-white/62">{secondary.length ? secondary.map((id) => muscleLabels[id]).join(" • ") : "—"}</p></div></div>
  </div>;
}
