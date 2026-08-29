"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, ChevronLeft, Dumbbell, Save } from "lucide-react";

import ExerciseMotion from "@/components/exercise-motion";
import { exerciseLibrary } from "@/lib/exercises";
import type { TrainingDay, TrainingProgram, WorkoutCompletion, WorkoutExerciseResult } from "@/lib/training-programs";

const panelClass = "ui-surface rounded-[24px] border border-black/[0.07] bg-white";

function createResults(day: TrainingDay): WorkoutExerciseResult[] {
  return day.items.map((item) => ({
    itemId: item.id,
    exerciseId: item.exerciseId,
    sets: Array.from({ length: item.sets }, (_, index) => ({
      setNumber: index + 1,
      reps: item.reps,
      load: item.load === "Dobierz wg RPE" ? "" : item.load,
      completed: false,
    })),
    actualRpe: item.rpe,
    note: "",
  }));
}

export function ClientWorkout({ clientId, clientName, plan, day, onBack, onComplete }: { clientId: string; clientName?: string; plan: TrainingProgram; day: TrainingDay; onBack: () => void; onComplete: (completion: WorkoutCompletion) => void }) {
  const draftKey = `futurebody_workout_draft_${clientId}_${plan.id}_${day.id}`;
  const [results, setResults] = useState<WorkoutExerciseResult[]>(() => {
    if (typeof window === "undefined") return createResults(day);
    try {
      const saved = window.localStorage.getItem(draftKey);
      return saved ? JSON.parse(saved) as WorkoutExerciseResult[] : createResults(day);
    } catch {
      return createResults(day);
    }
  });
  const [sessionNote, setSessionNote] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const totalSets = useMemo(() => results.reduce((total, result) => total + result.sets.length, 0), [results]);
  const completedSets = useMemo(() => results.reduce((total, result) => total + result.sets.filter((set) => set.completed).length, 0), [results]);

  useEffect(() => {
    window.localStorage.setItem(draftKey, JSON.stringify(results));
  }, [draftKey, results]);

  function updateSet(itemId: string, setNumber: number, key: "reps" | "load" | "completed", value: string | boolean) {
    setResults((current) => current.map((result) => result.itemId === itemId ? {
      ...result,
      sets: result.sets.map((set) => set.setNumber === setNumber ? { ...set, [key]: value } : set),
    } : result));
  }

  function updateResult(itemId: string, key: "actualRpe" | "note", value: string) {
    setResults((current) => current.map((result) => result.itemId === itemId ? { ...result, [key]: value } : result));
  }

  function finish() {
    const normalizedResults = results.map((result, index) => index === 0 && sessionNote.trim()
      ? { ...result, note: [result.note, `Notatka sesji: ${sessionNote.trim()}`].filter(Boolean).join(" · ") }
      : result);
    window.localStorage.removeItem(draftKey);
    onComplete({ id: `log-${Date.now()}`, clientId, planId: plan.id, dayId: day.id, completedAt: new Date().toISOString(), results: normalizedResults });
  }

  if (reviewing) {
    return <section className="mx-auto max-w-3xl"><button onClick={() => setReviewing(false)} className="mb-5 flex min-h-11 items-center gap-2 text-xs font-black text-black/45"><ChevronLeft size={15}/>Wróć do treningu</button><div className={`${panelClass} p-6 sm:p-8`}><span className="grid h-12 w-12 place-items-center rounded-2xl bg-black text-white"><CheckCircle2 size={20}/></span><p className="mt-6 text-[9px] font-black uppercase tracking-[0.14em] text-black/30">Podsumowanie treningu</p><h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">{clientName ?? "Podopieczny"}</h1><p className="mt-1 text-sm text-black/42">{plan.name} · {day.name}</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#f3f3f1] p-4"><p className="text-[8px] font-black uppercase text-black/30">Wykonane serie</p><p className="mt-2 text-2xl font-black">{completedSets} / {totalSets}</p></div><div className="rounded-2xl bg-[#f3f3f1] p-4"><p className="text-[8px] font-black uppercase text-black/30">Ćwiczenia</p><p className="mt-2 text-2xl font-black">{results.filter((result) => result.sets.some((set) => set.completed)).length}</p></div></div><label className="mt-5 block"><span className="mb-2 block text-[9px] font-black uppercase text-black/30">Notatka z sesji</span><textarea value={sessionNote} onChange={(event) => setSessionNote(event.target.value)} className="min-h-28 w-full rounded-2xl bg-[#f3f3f1] p-4 text-sm outline-none" placeholder="Samopoczucie, technika, ból, zalecenia na kolejną sesję…"/></label><button onClick={finish} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black text-[10px] font-black uppercase text-white"><Save size={15}/>Zapisz i zakończ trening</button></div></section>;
  }

  return <section className="mx-auto max-w-5xl">
    <button onClick={onBack} className="mb-4 flex min-h-11 items-center gap-2 text-xs font-black text-black/45"><ChevronLeft size={15}/>Wróć</button>
    <header className="fb-dark-surface mb-4 rounded-[26px] bg-[#0b0b0d] p-5 text-white sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/35">Trening na żywo · {clientName ?? "Podopieczny"}</p><h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">{day.name}</h1><p className="mt-1 text-xs text-white/42">{plan.name} · {day.focus} · {day.items.length} ćwiczeń</p></div><div className="min-w-56"><div className="mb-2 flex justify-between text-[9px]"><span className="text-white/38">Wykonane serie</span><strong>{completedSets} / {totalSets}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#ffc400] transition-all" style={{ width: `${totalSets ? completedSets / totalSets * 100 : 0}%` }}/></div><p className="mt-2 text-[8px] text-white/30">Wyniki zapisują się roboczo na tym urządzeniu</p></div></div></header>

    <div className="space-y-4">{day.items.map((item, itemIndex) => {
      const exercise = exerciseLibrary.find((candidate) => candidate.id === item.exerciseId);
      const result = results.find((candidate) => candidate.itemId === item.id);
      if (!exercise || !result) return null;
      return <article key={item.id} className={`${panelClass} overflow-hidden`}><div className="grid lg:grid-cols-[180px_1fr]"><div className="relative"><ExerciseMotion pattern={exercise.pattern}/><span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black text-[9px] font-black text-white">{itemIndex + 1}</span></div><div className="p-4 sm:p-6"><p className="text-[8px] font-black uppercase tracking-wider text-black/30">{exercise.muscle} · {exercise.equipment}</p><h2 className="mt-1 text-xl font-black">{exercise.name}</h2><p className="mt-2 text-[10px] leading-5 text-black/42">Plan: {item.sets} × {item.reps} · {item.load} · przerwa {item.restSeconds}s</p><p className="mt-1 text-[9px] text-black/32">Poprzednio: {item.load === "Dobierz wg RPE" ? "dobór indywidualny" : item.load} × {item.reps}</p><div className="mt-5 space-y-2">{result.sets.map((set) => <div key={set.setNumber} className={`grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_44px] items-end gap-2 rounded-2xl p-2 sm:grid-cols-[44px_1fr_1fr_52px] ${set.completed ? "bg-emerald-50" : "bg-[#f3f3f1]"}`}><span className="grid h-11 w-9 place-items-center rounded-xl bg-white text-[10px] font-black sm:w-11">{set.setNumber}</span><label className="min-w-0"><span className="mb-1 block text-[7px] font-black uppercase text-black/28">Powt.</span><input value={set.reps} onChange={(event) => updateSet(item.id, set.setNumber, "reps", event.target.value)} inputMode="numeric" className="h-11 w-full min-w-0 rounded-xl bg-white px-2 text-center text-xs font-black outline-none sm:px-3"/></label><label className="min-w-0"><span className="mb-1 block text-[7px] font-black uppercase text-black/28">Kg</span><input value={set.load} onChange={(event) => updateSet(item.id, set.setNumber, "load", event.target.value)} inputMode="decimal" placeholder="0" className="h-11 w-full min-w-0 rounded-xl bg-white px-2 text-center text-xs font-black outline-none sm:px-3"/></label><button onClick={() => updateSet(item.id, set.setNumber, "completed", !set.completed)} className={`grid h-11 w-11 place-items-center rounded-xl ${set.completed ? "bg-emerald-600 text-white" : "border border-black/10 bg-white text-black/22"}`} aria-label={`${set.completed ? "Cofnij" : "Zapisz"} serię ${set.setNumber}`}><Check size={16}/></button></div>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr]"><label><span className="mb-1 block text-[8px] font-black uppercase text-black/28">RPE</span><select value={result.actualRpe} onChange={(event) => updateResult(item.id, "actualRpe", event.target.value)} className="h-11 w-full rounded-xl bg-[#f3f3f1] px-3 text-xs font-black outline-none">{["5", "6", "7", "8", "9", "10"].map((value) => <option key={value}>{value}</option>)}</select></label><label><span className="mb-1 block text-[8px] font-black uppercase text-black/28">Notatka po ćwiczeniu</span><input value={result.note} onChange={(event) => updateResult(item.id, "note", event.target.value)} className="h-11 w-full rounded-xl bg-[#f3f3f1] px-3 text-xs outline-none" placeholder="Technika, ból, uwagi…"/></label></div></div></div></article>;
    })}</div>

    <div className="sticky bottom-[max(.75rem,env(safe-area-inset-bottom))] z-20 mt-5 flex items-center justify-between gap-3 rounded-[22px] bg-black p-3 pl-5 text-white shadow-2xl"><div className="min-w-0"><p className="text-[8px] text-white/38">Postęp treningu</p><p className="truncate text-xs font-black">{completedSets} z {totalSets} serii</p></div><button onClick={() => setReviewing(true)} disabled={!completedSets} className="min-h-12 rounded-2xl bg-[#ffc400] px-5 text-[9px] font-black uppercase text-[#050505] disabled:opacity-35"><Dumbbell size={14} className="mr-2 inline"/>Zakończ trening</button></div>
  </section>;
}
