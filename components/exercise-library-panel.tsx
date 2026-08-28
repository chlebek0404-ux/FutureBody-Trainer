"use client";

import { ArrowUpRight, Check, ChevronDown, Clock3, Filter, Heart, Plus, RefreshCcw, Search, SlidersHorizontal, Sparkles, Star, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import ExerciseMotion from "@/components/exercise-motion";
import {
  createExerciseVisualization,
  exerciseLibrary,
  filterExercises,
  getExerciseSubstitutions,
  libraryFilterOptions,
  movementPatternLabels,
  muscleIdsForNames,
  searchExercises,
  type ExerciseFilters,
  type ExerciseRecord,
  type MovementPattern,
} from "@/lib/exercise-library";

const cardClass = "ui-surface rounded-[26px] border border-black/[0.07] bg-white shadow-[0_16px_50px_rgba(0,0,0,.035)]";
const favoritesKey = "movendo-demo-exercise-favorites";
const recentsKey = "movendo-demo-exercise-recents";
const customKey = "movendo-demo-trainer-exercises";

type QuickFilter = "all" | "favorites" | "recent" | "popular" | "legs" | "back" | "chest" | "shoulders";

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: unknown) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeCustomExercise(exercise: ExerciseRecord) {
  const primaryMuscleIds = exercise.primaryMuscleIds ?? muscleIdsForNames(exercise.primaryMuscles ?? [exercise.muscle]);
  const secondaryMuscleIds = exercise.secondaryMuscleIds ?? muscleIdsForNames(exercise.secondaryMuscles ?? []);
  return { ...exercise, primaryMuscleIds, secondaryMuscleIds, visualization: exercise.visualization ?? createExerciseVisualization(exercise.pattern, primaryMuscleIds, secondaryMuscleIds) };
}

function uniqueBaseExercises(exercises: ExerciseRecord[]) {
  const seen = new Set<string>();
  return exercises.filter((exercise) => !seen.has(exercise.baseName) && Boolean(seen.add(exercise.baseName)));
}

function toggleArray<T>(values: T[] | undefined, value: T) {
  const current = values ?? [];
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

export default function ExerciseLibraryPanel() {
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(18);
  const [favorites, setFavorites] = useState<string[]>(() => readStored(favoritesKey, []));
  const [recentIds, setRecentIds] = useState<string[]>(() => readStored(recentsKey, []));
  const [customExercises, setCustomExercises] = useState<ExerciseRecord[]>(() => readStored<ExerciseRecord[]>(customKey, []).map(normalizeCustomExercise));
  const [selectedId, setSelectedId] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const allExercises = useMemo(() => [...customExercises, ...exerciseLibrary], [customExercises]);
  const bases = useMemo(() => uniqueBaseExercises(allExercises), [allExercises]);

  const quickFiltered = useMemo(() => {
    const advanced = filterExercises(bases, filters);
    if (quickFilter === "favorites") return advanced.filter((exercise) => favorites.includes(exercise.id));
    if (quickFilter === "recent") return [...advanced].sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id)).filter((exercise) => recentIds.includes(exercise.id));
    if (quickFilter === "popular") return [...advanced].sort((a, b) => b.used - a.used);
    const muscle: Partial<Record<QuickFilter, string[]>> = {
      legs: ["Czworogłowe uda", "Dwugłowe uda", "Pośladki", "Przywodziciele"],
      back: ["Plecy", "Prostowniki grzbietu"],
      chest: ["Klatka piersiowa"],
      shoulders: ["Barki"],
    };
    return muscle[quickFilter]?.length ? advanced.filter((exercise) => exercise.primaryMuscles.some((item) => muscle[quickFilter]!.includes(item))) : advanced;
  }, [bases, favorites, filters, quickFilter, recentIds]);

  const results = useMemo(() => query ? searchExercises(query, { exercises: quickFiltered }) : quickFiltered, [query, quickFiltered]);
  const selected = allExercises.find((exercise) => exercise.id === selectedId);
  const substitutions = useMemo(() => selected ? uniqueBaseExercises(getExerciseSubstitutions(selected, { limit: 24 })).slice(0, 5) : [], [selected]);
  const activeFilterCount = Object.values(filters).reduce((total, value) => total + (value?.length ?? 0), 0);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedId(""); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [selected]);

  function choose(exercise: ExerciseRecord) {
    setSelectedId(exercise.id);
    const next = [exercise.id, ...recentIds.filter((id) => id !== exercise.id)].slice(0, 12);
    setRecentIds(next);
    persist(recentsKey, next);
  }

  function toggleFavorite(exercise: ExerciseRecord) {
    const next = favorites.includes(exercise.id) ? favorites.filter((id) => id !== exercise.id) : [exercise.id, ...favorites];
    setFavorites(next);
    persist(favoritesKey, next);
  }

  function addCustom(exercise: ExerciseRecord) {
    const next = [exercise, ...customExercises];
    setCustomExercises(next);
    persist(customKey, next);
    setShowCreate(false);
    setQuickFilter("all");
    choose(exercise);
  }

  const quickOptions: { id: QuickFilter; label: string; icon?: typeof Heart }[] = [
    { id: "all", label: "Wszystkie" }, { id: "favorites", label: "Ulubione", icon: Heart }, { id: "recent", label: "Ostatnie", icon: Clock3 },
    { id: "popular", label: "Najczęściej", icon: Star }, { id: "legs", label: "Nogi" }, { id: "back", label: "Plecy" }, { id: "chest", label: "Klatka" }, { id: "shoulders", label: "Barki" },
  ];

  return <>
    <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-black/30">Baza ruchu FutureBody</p><h1 className="mt-2 text-3xl font-black tracking-[-0.055em] sm:text-4xl">Biblioteka ćwiczeń</h1><p className="mt-2 max-w-2xl text-xs leading-5 text-black/40">Szybko znajdź ćwiczenie, sprawdź technikę i dobierz bezpieczny zamiennik. Pełne demonstracje pojawiają się tylko przy zweryfikowanych materiałach.</p></div>
      <button onClick={() => setShowCreate(true)} className="flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-[9px] font-black uppercase tracking-wider text-white transition hover:scale-[1.02]"><Plus size={14}/>Dodaj własne</button>
    </div>

    <section className={`${cardClass} mb-5 p-4 sm:p-5`}>
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="flex h-12 min-w-0 flex-1 items-center rounded-2xl bg-[#f3f3f1] px-4 transition focus-within:ring-2 focus-within:ring-black/10"><Search size={16} className="mr-3 text-black/28"/><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-bold outline-none" placeholder="Szukaj po nazwie, mięśniu lub sprzęcie…"/>{query ? <button onClick={() => setQuery("")} aria-label="Wyczyść wyszukiwanie" className="grid h-7 w-7 place-items-center rounded-full bg-white"><X size={12}/></button> : null}</label>
        <button onClick={() => setShowFilters((value) => !value)} className={`flex h-12 items-center justify-center gap-2 rounded-2xl border px-5 text-[9px] font-black uppercase tracking-wider ${showFilters || activeFilterCount ? "border-black bg-black text-white" : "border-black/10 bg-white"}`}><SlidersHorizontal size={14}/>Filtry{activeFilterCount ? ` (${activeFilterCount})` : ""}<ChevronDown size={13} className={`transition ${showFilters ? "rotate-180" : ""}`}/></button>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{quickOptions.map((option) => { const Icon = option.icon; return <button key={option.id} onClick={() => setQuickFilter(option.id)} className={`flex whitespace-nowrap items-center gap-1.5 rounded-full px-4 py-2 text-[8px] font-black uppercase tracking-wider transition ${quickFilter === option.id ? "bg-black text-white" : "bg-[#f3f3f1] text-black/48 hover:text-black"}`}>{Icon ? <Icon size={11}/> : null}{option.label}</button>; })}</div>
      {showFilters ? <AdvancedFilters filters={filters} setFilters={setFilters} onClear={() => setFilters({})}/> : null}
    </section>

    <div className="mb-3 flex items-center justify-between px-1"><div><h2 className="text-sm font-black">Wyniki</h2><p className="mt-0.5 text-[9px] text-black/32">{results.length} pasujących ćwiczeń</p></div><span className="rounded-full bg-black/[0.055] px-3 py-1.5 text-[7px] font-black uppercase tracking-wider text-black/38">Kliknij, aby otworzyć</span></div>

    {results.length ? <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{results.slice(0, limit).map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} favorite={favorites.includes(exercise.id)} onOpen={() => choose(exercise)} onFavorite={() => toggleFavorite(exercise)}/>)}</section>
      {limit < results.length ? <div className="mt-6 text-center"><button onClick={() => setLimit((value) => value + 18)} className="rounded-full border border-black/10 bg-white px-6 py-3 text-[9px] font-black uppercase tracking-wider">Pokaż kolejne</button></div> : null}
    </> : <EmptyLibrary onReset={() => { setQuery(""); setFilters({}); setQuickFilter("all"); }} onCreate={() => setShowCreate(true)}/>}

    {selected ? <ExerciseDetailModal exercise={selected} favorite={favorites.includes(selected.id)} substitutions={substitutions} onClose={() => setSelectedId("")} onFavorite={() => toggleFavorite(selected)} onChoose={choose}/> : null}
    {showCreate ? <CreateExerciseModal onClose={() => setShowCreate(false)} onCreate={addCustom}/> : null}
  </>;
}

function ExerciseCard({ exercise, favorite, onOpen, onFavorite }: { exercise: ExerciseRecord; favorite: boolean; onOpen: () => void; onFavorite: () => void }) {
  const verified = Boolean(exercise.visualization.animationAsset);
  return <article className={`${cardClass} group relative overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,.09)]`}>
    <button onClick={onOpen} className="block w-full text-left"><ExerciseMotion exercise={exercise} compact/><div className="p-4 sm:p-5"><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[7px] font-black uppercase tracking-wider ${verified ? "bg-black text-white" : "bg-[#efefed] text-black/35"}`}>{verified ? "Pełna demonstracja" : "Opis techniki"}</span><span className="text-[7px] font-black uppercase tracking-wider text-black/25">{movementPatternLabels[exercise.pattern]}</span></div><h3 className="mt-3 text-base font-black tracking-[-0.025em]">{exercise.baseName}</h3><p className="mt-1 truncate text-[9px] text-black/32">{exercise.englishName}</p><div className="mt-4 flex items-end justify-between gap-3 border-t border-black/[0.06] pt-3"><div className="min-w-0"><p className="truncate text-[9px] font-bold text-black/58">{exercise.primaryMuscles.join(" • ")}</p><p className="mt-1 truncate text-[8px] text-black/30">{exercise.equipmentList.join(" + ")}</p></div><ArrowUpRight size={15} className="shrink-0 text-black/28 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black"/></div></div></button>
    <button onClick={onFavorite} className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md ${favorite ? "border-white bg-white text-black" : "border-white/15 bg-black/35 text-white"}`} aria-label={favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}><Heart size={14} className={favorite ? "fill-current" : ""}/></button>
  </article>;
}

function ExerciseDetailModal({ exercise, favorite, substitutions, onClose, onFavorite, onChoose }: { exercise: ExerciseRecord; favorite: boolean; substitutions: ExerciseRecord[]; onClose: () => void; onFavorite: () => void; onChoose: (exercise: ExerciseRecord) => void }) {
  return <div className="fixed inset-0 z-[110] overflow-y-auto bg-[#ededeb]">
    <header className="sticky top-0 z-20 border-b border-black/[0.07] bg-[#ededeb]/90 px-4 py-3 backdrop-blur-xl sm:px-7"><div className="mx-auto flex max-w-[1280px] items-center gap-3"><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-black text-white" aria-label="Zamknij szczegóły ćwiczenia"><X size={15}/></button><div className="min-w-0 flex-1"><p className="truncate text-[8px] font-black uppercase tracking-[0.15em] text-black/28">Biblioteka ćwiczeń</p><p className="truncate text-xs font-black">{exercise.baseName}</p></div><button onClick={onFavorite} className={`grid h-10 w-10 place-items-center rounded-full border ${favorite ? "border-black bg-black text-white" : "border-black/10 bg-white text-black/45"}`} aria-label={favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}><Heart size={15} className={favorite ? "fill-current" : ""}/></button></div></header>
    <main className="mx-auto max-w-[1280px] px-4 pb-14 pt-6 sm:px-7 sm:pt-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-black px-3 py-1.5 text-[7px] font-black uppercase tracking-wider text-white">{exercise.primaryMuscles[0]}</span><span className="rounded-full bg-white px-3 py-1.5 text-[7px] font-black uppercase tracking-wider text-black/40">{movementPatternLabels[exercise.pattern]}</span><span className="rounded-full bg-white px-3 py-1.5 text-[7px] font-black uppercase tracking-wider text-black/40">{exercise.level}</span></div><h1 className="mt-4 text-3xl font-black tracking-[-0.055em] sm:text-5xl">{exercise.baseName}</h1><p className="mt-2 text-xs text-black/35">{exercise.englishName} · {exercise.familyName}</p></div><p className="max-w-sm text-[9px] leading-5 text-black/35">Demonstracja pokazuje kolejne fazy ruchu. Zakres i obciążenie trener zawsze dopasowuje do możliwości podopiecznego.</p></div>
      <ExerciseMotion key={exercise.id} exercise={exercise}/>
      <section className="mt-5 grid gap-4 lg:grid-cols-[1.12fr_.88fr]">
        <div className={`${cardClass} p-5 sm:p-7`}><p className="text-[8px] font-black uppercase tracking-[0.15em] text-black/28">Wykonanie krok po kroku</p><h2 className="mt-2 text-xl font-black tracking-[-0.035em]">Technika ruchu</h2><p className="mt-4 text-[11px] leading-6 text-black/62">{exercise.instruction}</p><div className="mt-6 space-y-3">{exercise.cues.map((cue, index) => <div key={cue} className="flex gap-3 rounded-2xl bg-[#f3f3f1] p-4"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-black text-[8px] font-black text-white">{index + 1}</span><p className="pt-1 text-[10px] font-bold leading-4 text-black/64">{cue}</p></div>)}</div></div>
        <div className="space-y-4"><div className={`${cardClass} grid grid-cols-2 gap-px overflow-hidden bg-black/[0.06]`}>{[["Główne", exercise.primaryMuscles.join(", ")], ["Pomocnicze", exercise.secondaryMuscles.join(", ") || "—"], ["Sprzęt", exercise.equipmentList.join(" + ")], ["Poziom", exercise.level]].map(([label, value]) => <div key={label} className="bg-white p-4"><p className="text-[7px] font-black uppercase tracking-wider text-black/26">{label}</p><p className="mt-2 text-[10px] font-bold leading-4">{value}</p></div>)}</div><div className="rounded-[26px] bg-[#181818] p-5 text-white sm:p-6"><p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#ff6b61]">Najczęstsze błędy</p><div className="mt-4 space-y-3">{exercise.commonMistakes.map((item) => <div key={item} className="flex gap-3"><X size={13} className="mt-0.5 shrink-0 text-[#ff554b]"/><p className="text-[10px] leading-4 text-white/62">{item}</p></div>)}</div></div></div>
      </section>
      {substitutions.length ? <section className="mt-5 rounded-[26px] border border-black/[0.07] bg-white p-5 sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="text-[8px] font-black uppercase tracking-[0.15em] text-black/28">Dobre zamienniki</p><h2 className="mt-2 text-lg font-black">Podobny wzorzec i mięśnie</h2></div><RefreshCcw size={15} className="text-black/24"/></div><div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{substitutions.map((item) => <button key={item.id} onClick={() => onChoose(item)} className="flex min-h-20 flex-col justify-between rounded-2xl bg-[#f3f3f1] p-4 text-left transition hover:bg-black hover:text-white"><span className="text-[10px] font-black leading-4">{item.baseName}</span><span className="mt-3 text-[7px] font-bold uppercase tracking-wider opacity-40">{item.equipmentList[0]}</span></button>)}</div></section> : null}
      <p className="mx-auto mt-7 max-w-2xl text-center text-[8px] leading-4 text-black/28">W przypadku bólu, urazu albo ograniczeń aplikacja nie stawia diagnozy. Ostateczną decyzję o doborze ćwiczenia podejmuje trener.</p>
    </main>
  </div>;
}

function EmptyLibrary({ onReset, onCreate }: { onReset: () => void; onCreate: () => void }) {
  return <div className={`${cardClass} grid min-h-80 place-items-center p-8 text-center`}><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f1f1ef]"><Search size={19}/></span><h3 className="mt-5 text-lg font-black">Nie znaleźliśmy takiego ćwiczenia</h3><p className="mt-2 text-xs text-black/40">Spróbuj innej nazwy albo wyczyść filtry.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><button onClick={onReset} className="rounded-full bg-black px-5 py-2.5 text-[8px] font-black uppercase text-white">Wyczyść filtry</button><button onClick={onCreate} className="rounded-full border border-black/10 px-5 py-2.5 text-[8px] font-black uppercase">Dodaj własne</button></div></div></div>;
}

function AdvancedFilters({ filters, setFilters, onClear }: { filters: ExerciseFilters; setFilters: (filters: ExerciseFilters) => void; onClear: () => void }) {
  return <div className="mt-4 grid gap-4 border-t border-black/[0.07] pt-4 lg:grid-cols-3"><FilterGroup title="Partia" options={libraryFilterOptions.muscles} selected={filters.muscles ?? []} onToggle={(value) => setFilters({ ...filters, muscles: toggleArray(filters.muscles, value) })}/><FilterGroup title="Wzorzec" options={libraryFilterOptions.patterns} label={(value) => movementPatternLabels[value as MovementPattern]} selected={filters.patterns ?? []} onToggle={(value) => setFilters({ ...filters, patterns: toggleArray(filters.patterns, value as MovementPattern) })}/><FilterGroup title="Sprzęt" options={libraryFilterOptions.equipment} selected={filters.equipment ?? []} onToggle={(value) => setFilters({ ...filters, equipment: toggleArray(filters.equipment, value) })}/><FilterGroup title="Poziom" options={libraryFilterOptions.levels} selected={filters.levels ?? []} onToggle={(value) => setFilters({ ...filters, levels: toggleArray(filters.levels, value as ExerciseRecord["level"]) })}/><FilterGroup title="Strona" options={["bilateral", "unilateral"]} label={(value) => value === "bilateral" ? "Obustronne" : "Jednostronne"} selected={filters.laterality ?? []} onToggle={(value) => setFilters({ ...filters, laterality: toggleArray(filters.laterality, value as "bilateral" | "unilateral") })}/><div className="flex items-end"><button onClick={onClear} className="h-10 rounded-full border border-black/10 px-4 text-[8px] font-black uppercase"><Filter size={12} className="mr-2 inline"/>Wyczyść wszystkie</button></div></div>;
}

function FilterGroup<T extends string>({ title, options, selected, onToggle, label }: { title: string; options: T[]; selected: T[]; onToggle: (value: T) => void; label?: (value: T) => string }) {
  return <div><p className="mb-2 text-[8px] font-black uppercase tracking-wider text-black/28">{title}</p><div className="flex max-h-24 flex-wrap gap-1.5 overflow-auto">{options.map((option) => <button key={option} onClick={() => onToggle(option)} className={`rounded-full px-3 py-1.5 text-[8px] font-bold ${selected.includes(option) ? "bg-black text-white" : "bg-[#f2f2f0] text-black/45"}`}>{label ? label(option) : option}</button>)}</div></div>;
}

function CreateExerciseModal({ onClose, onCreate }: { onClose: () => void; onCreate: (exercise: ExerciseRecord) => void }) {
  const [form, setForm] = useState({ name: "", englishName: "", aliases: "", muscle: "Klatka piersiowa", equipment: "Hantle", pattern: "push" as MovementPattern, instruction: "", cues: "", mistake: "" });
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;
    const id = `trainer-${Date.now()}`;
    const primaryMuscleIds = muscleIdsForNames([form.muscle]);
    onCreate({ id, name: form.name.trim(), baseName: form.name.trim(), englishName: form.englishName.trim() || form.name.trim(), aliases: form.aliases.split(",").map((item) => item.trim()).filter(Boolean), muscle: form.muscle, primaryMuscles: [form.muscle], secondaryMuscles: [], primaryMuscleIds, secondaryMuscleIds: [], equipment: form.equipment, equipmentList: [form.equipment], level: "Podstawowy", pattern: form.pattern, familyId: `trainer-${form.pattern}`, familyName: movementPatternLabels[form.pattern], exerciseTypes: ["trenerskie"], laterality: "bilateral", tags: [form.pattern, form.muscle.toLowerCase()], goal: "Indywidualny", protocol: "3 × 8–12", instruction: form.instruction.trim() || "Instrukcja zostanie uzupełniona przez trenera.", cues: form.cues.split("\n").map((item) => item.trim()).filter(Boolean), commonMistake: form.mistake.trim() || "Brak opisu.", commonMistakes: [form.mistake.trim() || "Brak opisu."], visualization: createExerciseVisualization(form.pattern, primaryMuscleIds, []), source: "trainer", active: true, used: 0 });
  }
  return <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"><button className="absolute inset-0" onClick={onClose} aria-label="Zamknij"/><form onSubmit={submit} className="relative my-6 w-full max-w-2xl rounded-[28px] bg-white p-5 shadow-2xl sm:p-7"><header className="flex items-start gap-4"><div className="grid h-10 w-10 place-items-center rounded-full bg-black text-white"><Sparkles size={15}/></div><div><p className="text-[8px] font-black uppercase tracking-wider text-black/30">Biblioteka trenera</p><h2 className="mt-1 text-xl font-black">Dodaj własne ćwiczenie</h2></div><button type="button" onClick={onClose} className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-[#f2f2f0]"><X size={14}/></button></header><div className="mt-6 grid gap-4 sm:grid-cols-2"><CreateField label="Nazwa ćwiczenia" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required/><CreateField label="Nazwa angielska" value={form.englishName} onChange={(value) => setForm({ ...form, englishName: value })}/><CreateField label="Aliasy, po przecinku" value={form.aliases} onChange={(value) => setForm({ ...form, aliases: value })}/><CreateField label="Główna partia" value={form.muscle} onChange={(value) => setForm({ ...form, muscle: value })}/><CreateField label="Sprzęt" value={form.equipment} onChange={(value) => setForm({ ...form, equipment: value })}/><label><span className="mb-2 block text-[8px] font-black uppercase text-black/30">Wzorzec ruchowy</span><select value={form.pattern} onChange={(event) => setForm({ ...form, pattern: event.target.value as MovementPattern })} className="h-11 w-full rounded-xl bg-[#f3f3f1] px-3 text-xs font-bold outline-none">{libraryFilterOptions.patterns.map((pattern) => <option key={pattern} value={pattern}>{movementPatternLabels[pattern]}</option>)}</select></label><label className="sm:col-span-2"><span className="mb-2 block text-[8px] font-black uppercase text-black/30">Krótka instrukcja</span><textarea value={form.instruction} onChange={(event) => setForm({ ...form, instruction: event.target.value })} className="min-h-20 w-full rounded-xl bg-[#f3f3f1] p-3 text-xs outline-none"/></label><label><span className="mb-2 block text-[8px] font-black uppercase text-black/30">Wskazówki — każda w nowej linii</span><textarea value={form.cues} onChange={(event) => setForm({ ...form, cues: event.target.value })} className="min-h-20 w-full rounded-xl bg-[#f3f3f1] p-3 text-xs outline-none"/></label><label><span className="mb-2 block text-[8px] font-black uppercase text-black/30">Najczęstszy błąd</span><textarea value={form.mistake} onChange={(event) => setForm({ ...form, mistake: event.target.value })} className="min-h-20 w-full rounded-xl bg-[#f3f3f1] p-3 text-xs outline-none"/></label></div><footer className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-11 rounded-full border border-black/10 px-5 text-[9px] font-black uppercase">Anuluj</button><button type="submit" className="h-11 rounded-full bg-black px-5 text-[9px] font-black uppercase text-white"><Check size={13} className="mr-2 inline"/>Dodaj ćwiczenie</button></footer></form></div>;
}

function CreateField({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <label><span className="mb-2 block text-[8px] font-black uppercase text-black/30">{label}</span><input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl bg-[#f3f3f1] px-3 text-xs outline-none"/></label>;
}
