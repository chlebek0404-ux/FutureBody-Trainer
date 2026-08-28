"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, CheckCircle2, ChevronDown, ChevronLeft, Dumbbell, Plus, RefreshCcw, Save, Search, Trash2, X } from "lucide-react";

import ExerciseMotion from "@/components/exercise-motion";
import { exerciseLibrary, getExerciseSubstitutions, searchExercises, type ExerciseRecord } from "@/lib/exercise-library";
import type { ProgramExercise, TrainingDay, TrainingProgram, WorkoutCompletion, WorkoutExerciseResult } from "@/lib/training-programs";

const panelClass = "ui-surface rounded-[24px] border border-black/[0.07] bg-white shadow-[0_12px_38px_rgba(0,0,0,.035)]";

function createProgramItem(exercise: ExerciseRecord, dayId: string): ProgramExercise {
  return {
    id: `item-${dayId}-${exercise.id}-${Date.now()}`,
    exerciseId: exercise.id,
    sets: 3,
    reps: "8–12",
    load: "Dobierz wg RPE",
    tempo: "3-1-1",
    rpe: "7",
    rir: "3",
    restSeconds: 90,
    note: exercise.instruction,
    alternativeIds: getExerciseSubstitutions(exercise, { limit: 3 }).map((candidate) => candidate.id),
  };
}

export function PlanEditor({ plan, clientName, goal, onClose, onSave }: { plan: TrainingProgram; clientName?: string; goal?: string; onClose: () => void; onSave: (plan: TrainingProgram) => void }) {
  const [draft, setDraft] = useState<TrainingProgram>(() => structuredClone(plan));
  const [activeDayId, setActiveDayId] = useState(plan.trainingDays[0]?.id ?? "");
  const [pickerItemId, setPickerItemId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => new Set());
  const activeDay = draft.trainingDays.find((day) => day.id === activeDayId) ?? draft.trainingDays[0];
  const totalExercises = draft.trainingDays.reduce((total, day) => total + day.items.length, 0);

  function updateDay(updater: (day: TrainingDay) => TrainingDay) {
    setDraft((current) => ({ ...current, trainingDays: current.trainingDays.map((day) => day.id === activeDay.id ? updater(day) : day) }));
  }

  function updateItem(itemId: string, key: keyof ProgramExercise, value: string | number) {
    updateDay((day) => ({ ...day, items: day.items.map((item) => item.id === itemId ? { ...item, [key]: value } : item) }));
  }

  function moveItem(itemId: string, direction: -1 | 1) {
    updateDay((day) => {
      const index = day.items.findIndex((item) => item.id === itemId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= day.items.length) return day;
      const items = [...day.items];
      [items[index], items[target]] = [items[target], items[index]];
      return { ...day, items };
    });
  }

  function toggleAdvanced(itemId: string) {
    setExpandedItems((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function chooseExercise(exercise: ExerciseRecord) {
    if (!pickerItemId || !activeDay) return;
    if (pickerItemId === "new") {
      updateDay((day) => ({ ...day, items: [...day.items, createProgramItem(exercise, day.id)] }));
    } else {
      updateDay((day) => ({ ...day, items: day.items.map((item) => item.id === pickerItemId ? { ...item, exerciseId: exercise.id, note: exercise.instruction, alternativeIds: exerciseLibrary.filter((candidate) => candidate.pattern === exercise.pattern && candidate.id !== exercise.id).slice(0, 3).map((candidate) => candidate.id) } : item) }));
    }
    setPickerItemId(null);
  }

  function addDay() {
    const dayNumber = draft.trainingDays.length + 1;
    const next: TrainingDay = { id: `day-${Date.now()}`, name: `Dzień ${String.fromCharCode(64 + dayNumber)}`, focus: "Nowa jednostka", items: [] };
    setDraft((current) => ({ ...current, trainingDays: [...current.trainingDays, next] }));
    setActiveDayId(next.id);
  }

  function removeDay(dayId: string) {
    if (draft.trainingDays.length === 1) return;
    const remaining = draft.trainingDays.filter((day) => day.id !== dayId);
    setDraft((current) => ({ ...current, trainingDays: remaining }));
    setActiveDayId(remaining[0].id);
  }

  function save() {
    const normalized = {
      ...draft,
      days: draft.trainingDays.length,
      exercises: draft.trainingDays.reduce((total, day) => total + day.items.length, 0),
      updated: "Teraz",
    };
    onSave(normalized);
  }

  return (
    <section className="min-h-[calc(100svh-150px)]">
      <div className="mx-auto min-h-full max-w-7xl overflow-hidden rounded-[30px] bg-[#f4f4f2] shadow-sm">
        <header className="sticky top-0 z-20 flex items-center border-b border-black/[0.07] bg-[#f4f4f2]/95 px-5 py-4 backdrop-blur-xl sm:px-7">
          <div className="min-w-0"><button onClick={onClose} className="mb-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.14em] text-black/36"><ChevronLeft size={13}/>Plany</button><p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/30">{clientName ? `${clientName} · ${goal ?? "aktywny program"}` : "Plan bez przypisanego podopiecznego"}</p><input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="mt-1 w-full bg-transparent text-xl font-black outline-none sm:text-2xl" /></div>
          <div className="ml-auto flex gap-2"><button onClick={save} className="flex h-10 items-center gap-2 rounded-full bg-black px-5 text-[10px] font-black uppercase text-white"><Save size={14}/>Zapisz plan</button><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white"><X size={16}/></button></div>
        </header>

        <div className="grid gap-5 p-5 sm:p-7 xl:grid-cols-[230px_1fr]">
          <aside className="space-y-3">
            <div className={`${panelClass} p-3`}><p className="px-2 pb-2 text-[9px] font-black uppercase tracking-wider text-black/30">Dni treningowe</p>{draft.trainingDays.map((day, index) => <button key={day.id} onClick={() => setActiveDayId(day.id)} className={`mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left ${activeDay?.id === day.id ? "fb-selected" : "hover:bg-black/[0.04]"}`}><span className={`grid h-7 w-7 place-items-center rounded-full text-[9px] font-black ${activeDay?.id === day.id ? "bg-white text-black" : "bg-black/[0.06]"}`}>{index + 1}</span><span className="min-w-0"><span className="block truncate text-xs font-black">{day.name}</span><span className={`block truncate text-[9px] ${activeDay?.id === day.id ? "text-black/55" : "text-black/34"}`}>{day.items.length} ćwiczeń</span></span></button>)}<button onClick={addDay} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-black/15 py-2.5 text-[9px] font-black uppercase"><Plus size={13}/>Dodaj dzień</button></div>
            <div className="rounded-[24px] bg-black p-5 text-white"><Dumbbell size={19}/><p className="mt-5 text-2xl font-black">{totalExercises}</p><p className="mt-1 text-[9px] uppercase tracking-wider text-white/36">ćwiczeń w programie</p><p className="mt-4 border-t border-white/10 pt-4 text-[10px] leading-5 text-white/42">Wszystkie zmiany będą od razu widoczne w planie podopiecznego.</p></div>
          </aside>

          {activeDay ? <main>
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div className="min-w-0"><input value={activeDay.name} onChange={(event) => updateDay((day) => ({ ...day, name: event.target.value }))} className="w-full bg-transparent text-3xl font-black tracking-[-0.05em] outline-none"/><input value={activeDay.focus} onChange={(event) => updateDay((day) => ({ ...day, focus: event.target.value }))} className="mt-1 w-full bg-transparent text-sm text-black/42 outline-none"/></div><div className="flex gap-2"><button onClick={() => removeDay(activeDay.id)} disabled={draft.trainingDays.length === 1} className="h-10 rounded-full border border-black/10 bg-white px-4 text-[9px] font-black uppercase disabled:opacity-30"><Trash2 size={13} className="mr-2 inline"/>Usuń dzień</button><button onClick={() => setPickerItemId("new")} className="h-10 rounded-full bg-black px-4 text-[9px] font-black uppercase text-white"><Plus size={13} className="mr-2 inline"/>Dodaj ćwiczenie</button></div></div>
            <div className="space-y-3">
              {activeDay.items.map((item, itemIndex) => {
                const exercise = exerciseLibrary.find((candidate) => candidate.id === item.exerciseId) ?? exerciseLibrary[0];
                const advancedOpen = expandedItems.has(item.id);
                return (
                  <article key={item.id} className={`${panelClass} overflow-hidden`}>
                    <div className="grid lg:grid-cols-[150px_1fr]">
                      <div className="relative"><ExerciseMotion pattern={exercise.pattern}/><span className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-black text-[9px] font-black text-white">{itemIndex + 1}</span></div>
                      <div className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1"><p className="text-[9px] font-black uppercase tracking-wider text-black/30">{exercise.muscle} · {exercise.equipment}</p><h3 className="mt-1 text-lg font-black">{exercise.name}</h3></div>
                          <div className="flex gap-1"><button onClick={() => moveItem(item.id, -1)} disabled={itemIndex === 0} className="grid h-9 w-9 place-items-center rounded-full bg-[#f1f1ef] disabled:opacity-25" aria-label="Przesuń wyżej"><ArrowUp size={13}/></button><button onClick={() => moveItem(item.id, 1)} disabled={itemIndex === activeDay.items.length - 1} className="grid h-9 w-9 place-items-center rounded-full bg-[#f1f1ef] disabled:opacity-25" aria-label="Przesuń niżej"><ArrowDown size={13}/></button><button onClick={() => updateDay((day) => ({ ...day, items: day.items.filter((candidate) => candidate.id !== item.id) }))} className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-700" aria-label="Usuń ćwiczenie"><Trash2 size={13}/></button></div>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><PlanField label="Serie" value={item.sets} type="number" max={maxSets} onChange={(value) => updateItem(item.id, "sets", clampNumber(value, 1, maxSets))}/><PlanField label="Powtórzenia" value={item.reps} onChange={(value) => updateItem(item.id, "reps", value)}/><PlanField label="Ciężar" value={item.load} onChange={(value) => updateItem(item.id, "load", value)}/><PlanField label="Przerwa (s)" value={item.restSeconds} type="number" max={900} onChange={(value) => updateItem(item.id, "restSeconds", clampNumber(value, 0, 900))}/></div>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button onClick={() => setPickerItemId(item.id)} className="min-h-10 rounded-full border border-black/10 px-4 text-[8px] font-black uppercase"><RefreshCcw size={11} className="mr-1.5 inline"/>Zmień ćwiczenie</button>
                          <button onClick={() => toggleAdvanced(item.id)} className="flex min-h-10 items-center gap-2 rounded-full bg-[#f1f1ef] px-4 text-[8px] font-black uppercase" aria-expanded={advancedOpen}>Opcje dodatkowe<ChevronDown size={13} className={`transition-transform ${advancedOpen ? "rotate-180" : ""}`}/></button>
                        </div>
                        {advancedOpen ? <div className="mt-4 border-t border-black/[0.06] pt-4"><div className="grid grid-cols-3 gap-3"><PlanField label="Tempo" value={item.tempo} onChange={(value) => updateItem(item.id, "tempo", value)}/><PlanField label="RPE" value={item.rpe} onChange={(value) => updateItem(item.id, "rpe", value)}/><PlanField label="RIR" value={item.rir} onChange={(value) => updateItem(item.id, "rir", value)}/></div><label className="mt-4 block"><span className="mb-2 block text-[8px] font-black uppercase tracking-wider text-black/30">Wskazówki trenera</span><textarea value={item.note} onChange={(event) => updateItem(item.id, "note", event.target.value)} className="min-h-16 w-full rounded-xl bg-[#f4f4f2] p-3 text-[10px] leading-5 outline-none"/></label><div className="mt-4 flex flex-wrap items-center gap-2"><span className="text-[8px] font-black uppercase text-black/25">Szybkie zamienniki:</span>{item.alternativeIds.slice(0, 3).map((alternativeId) => { const alternative = exerciseLibrary.find((candidate) => candidate.id === alternativeId); return alternative ? <button key={alternativeId} onClick={() => chooseExerciseForItem(item.id, alternative, updateDay)} className="min-h-9 max-w-44 truncate rounded-full bg-[#f1f1ef] px-3 text-[8px] font-bold">{alternative.baseName}</button> : null; })}</div></div> : null}
                      </div>
                    </div>
                  </article>
                );
              })}
              {!activeDay.items.length ? <button onClick={() => setPickerItemId("new")} className={`${panelClass} grid min-h-52 w-full place-items-center text-center`}><span><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-black text-white"><Plus size={17}/></span><span className="mt-4 block text-sm font-black">Dodaj pierwsze ćwiczenie</span></span></button> : null}
            </div>
          </main> : null}
        </div>
      </div>
      {pickerItemId ? <ExercisePicker onClose={() => setPickerItemId(null)} onSelect={chooseExercise}/> : null}
    </section>
  );
}

function chooseExerciseForItem(itemId: string, exercise: ExerciseRecord, updateDay: (updater: (day: TrainingDay) => TrainingDay) => void) {
  updateDay((day) => ({ ...day, items: day.items.map((item) => item.id === itemId ? { ...item, exerciseId: exercise.id, note: exercise.instruction, alternativeIds: exerciseLibrary.filter((candidate) => candidate.pattern === exercise.pattern && candidate.id !== exercise.id).slice(0, 3).map((candidate) => candidate.id) } : item) }));
}

export const maxSets = 100;
export const maxLoadKg = 500;

/** Utrzymuje wartość liczbową w dopuszczalnym zakresie. Puste pole daje minimum. */
export function clampNumber(value: string, min: number, max: number) {
  const parsed = Number(String(value).replace(",", "."));
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

/** Ciężar wpisywany ręcznie: puste pole dozwolone, wartość ograniczona do maksimum. */
export function clampLoad(value: string) {
  const normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
  if (!normalized) return "";
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return "";
  return String(Math.min(maxLoadKg, Math.max(0, parsed)));
}

function PlanField({ label, value, type = "text", max, onChange }: { label: string; value: string | number; type?: string; max?: number; onChange: (value: string) => void }) {
  return <label><span className="mb-1.5 block text-[8px] font-black uppercase tracking-wider text-black/30">{label}</span><input value={value} type={type} min={type === "number" ? 0 : undefined} max={max} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-xl bg-[#f4f4f2] px-3 text-[10px] font-bold outline-none focus:ring-1 focus:ring-black"/></label>;
}

function ExercisePicker({ onClose, onSelect }: { onClose: () => void; onSelect: (exercise: ExerciseRecord) => void }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => searchExercises(search, { limit: 24 }), [search]);
  return <div className="fixed inset-0 z-[96] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"><button className="absolute inset-0" onClick={onClose} aria-label="Zamknij"/><section className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-2xl"><header className="flex items-center border-b border-black/[0.07] p-5"><div><p className="text-[9px] font-black uppercase tracking-wider text-black/30">Baza 2000 ćwiczeń</p><h2 className="mt-1 text-xl font-black">Wybierz ćwiczenie lub zamiennik</h2></div><button onClick={onClose} className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-[#f1f1ef]"><X size={15}/></button></header><div className="p-5"><div className="flex h-11 items-center rounded-full bg-[#f3f3f1] px-4"><Search size={15} className="mr-2 text-black/30"/><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} className="flex-1 bg-transparent text-xs outline-none" placeholder="Szukaj po nazwie, partii lub sprzęcie…"/></div><div className="mt-4 grid max-h-[62vh] gap-2 overflow-auto sm:grid-cols-2 lg:grid-cols-3">{filtered.map((exercise) => <button key={exercise.id} onClick={() => onSelect(exercise)} className="flex items-center gap-3 rounded-2xl border border-black/[0.07] p-2 text-left hover:border-black"><div className="w-20 shrink-0"><ExerciseMotion pattern={exercise.pattern} compact/></div><div className="min-w-0"><p className="line-clamp-2 text-[10px] font-black">{exercise.name}</p><p className="mt-1 text-[8px] text-black/36">{exercise.muscle} · {exercise.equipment}</p></div></button>)}</div></div></section></div>;
}

void LegacyClientWorkout;
function LegacyClientWorkout({ clientId, clientName, plan, day, onBack, onComplete }: { clientId: string; clientName?: string; plan: TrainingProgram; day: TrainingDay; onBack: () => void; onComplete: (completion: WorkoutCompletion) => void }) {
  const [results, setResults] = useState<WorkoutExerciseResult[]>(() => day.items.map((item) => ({ itemId: item.id, exerciseId: item.exerciseId, sets: Array.from({ length: item.sets }, (_, index) => ({ setNumber: index + 1, reps: item.reps, load: item.load === "Dobierz wg RPE" ? "" : item.load, completed: false })), actualRpe: item.rpe, note: "" })));
  const totalSets = results.reduce((total, result) => total + result.sets.length, 0);
  const completedSets = results.reduce((total, result) => total + result.sets.filter((set) => set.completed).length, 0);
  const workoutLabel = clientName ? `${clientName} · ${plan.name}` : plan.name;
  void workoutLabel;

  function updateSet(itemId: string, setNumber: number, key: "reps" | "load" | "completed", value: string | boolean) {
    setResults((current) => current.map((result) => result.itemId === itemId ? { ...result, sets: result.sets.map((set) => set.setNumber === setNumber ? { ...set, [key]: value } : set) } : result));
  }

  function updateResult(itemId: string, key: "actualRpe" | "note", value: string) {
    setResults((current) => current.map((result) => result.itemId === itemId ? { ...result, [key]: value } : result));
  }

  function finish() {
    onComplete({ id: `log-${Date.now()}`, clientId, planId: plan.id, dayId: day.id, completedAt: new Date().toISOString(), results });
  }

  return <section><button onClick={onBack} className="mb-5 flex items-center gap-2 text-xs font-black text-black/45"><ChevronLeft size={15}/>Wróć do planu</button><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/30">{plan.name}</p><h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">{day.name}</h1><p className="mt-1 text-sm text-black/40">{day.focus} · {day.items.length} ćwiczeń</p></div><div className="min-w-52 rounded-2xl bg-black p-4 text-white"><div className="flex justify-between text-[9px]"><span className="text-white/40">Wykonane serie</span><strong>{completedSets} / {totalSets}</strong></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/12"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${totalSets ? completedSets / totalSets * 100 : 0}%` }}/></div></div></div><div className="space-y-4">{day.items.map((item, itemIndex) => { const exercise = exerciseLibrary.find((candidate) => candidate.id === item.exerciseId) ?? exerciseLibrary[0]; const result = results.find((candidate) => candidate.itemId === item.id)!; return <article key={item.id} className={`${panelClass} overflow-hidden`}><div className="grid lg:grid-cols-[180px_1fr]"><div className="relative"><ExerciseMotion pattern={exercise.pattern}/><span className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-black text-[9px] font-black text-white">{itemIndex + 1}</span></div><div className="p-5 sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-[9px] font-black uppercase tracking-wider text-black/30">{exercise.muscle} · {exercise.equipment}</p><h2 className="mt-1 text-xl font-black">{exercise.name}</h2><p className="mt-2 text-[10px] leading-5 text-black/42">{item.note}</p></div><div className="flex shrink-0 gap-2 text-center">{[["Tempo", item.tempo], ["RIR", item.rir], ["Przerwa", `${item.restSeconds}s`]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#f3f3f1] px-3 py-2"><p className="text-[7px] font-black uppercase text-black/28">{label}</p><p className="mt-1 text-[10px] font-black">{value}</p></div>)}</div></div><div className="mt-5 overflow-x-auto"><div className="min-w-[470px]"><div className="grid grid-cols-[40px_1fr_1fr_70px] gap-2 px-2 pb-2 text-[8px] font-black uppercase tracking-wider text-black/28"><span>Seria</span><span>Powtórzenia</span><span>Ciężar (kg)</span><span>Gotowe</span></div>{result.sets.map((set) => <div key={set.setNumber} className={`mb-2 grid grid-cols-[40px_1fr_1fr_70px] items-center gap-2 rounded-xl p-2 ${set.completed ? "bg-emerald-50" : "bg-[#f4f4f2]"}`}><span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[9px] font-black">{set.setNumber}</span><input value={set.reps} onChange={(event) => updateSet(item.id, set.setNumber, "reps", event.target.value)} className="h-9 rounded-lg bg-white px-3 text-xs font-bold outline-none"/><input value={set.load} onChange={(event) => updateSet(item.id, set.setNumber, "load", clampLoad(event.target.value))} inputMode="decimal" placeholder="0" aria-label={`Ciężar w serii ${set.setNumber}, maksymalnie ${maxLoadKg} kg`} className="h-9 rounded-lg bg-white px-3 text-xs font-bold outline-none"/><button onClick={() => updateSet(item.id, set.setNumber, "completed", !set.completed)} className={`mx-auto grid h-8 w-8 place-items-center rounded-full ${set.completed ? "bg-emerald-600 text-white" : "border border-black/10 bg-white text-black/20"}`} aria-label={`Oznacz serię ${set.setNumber}`}><Check size={14}/></button></div>)}</div></div><div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr]"><label><span className="mb-1.5 block text-[8px] font-black uppercase text-black/28">RPE po ćwiczeniu</span><select value={result.actualRpe} onChange={(event) => updateResult(item.id, "actualRpe", event.target.value)} className="h-10 w-full rounded-xl bg-[#f4f4f2] px-3 text-xs font-bold outline-none">{["5", "6", "7", "8", "9", "10"].map((value) => <option key={value}>{value}</option>)}</select></label><label><span className="mb-1.5 block text-[8px] font-black uppercase text-black/28">Notatka po ćwiczeniu</span><input value={result.note} onChange={(event) => updateResult(item.id, "note", event.target.value)} placeholder="Samopoczucie, ból, uwagi…" className="h-10 w-full rounded-xl bg-[#f4f4f2] px-3 text-xs outline-none"/></label></div></div></div></article>; })}</div><div className="sticky bottom-3 mt-6 flex items-center justify-between rounded-[22px] bg-black p-3 pl-5 text-white shadow-2xl"><div><p className="text-[9px] text-white/40">Postęp treningu</p><p className="text-xs font-black">{completedSets} z {totalSets} serii</p></div><button onClick={finish} disabled={!completedSets} className="flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[10px] font-black uppercase text-black disabled:opacity-35"><CheckCircle2 size={15}/>Zakończ i zapisz</button></div></section>;
}
