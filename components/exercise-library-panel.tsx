"use client";

import { ChevronRight, Heart, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import MuscleMap from "@/components/muscle-map";
import {
  exerciseLibrary,
  muscleLabels,
  scoreExerciseSearch,
  type ExerciseRecord,
} from "@/lib/exercise-library";
import { exerciseGroups } from "@/lib/exercise-catalog";

const cardClass = "ui-surface rounded-[24px] border border-black/[0.07] bg-white shadow-[0_12px_38px_rgba(0,0,0,.035)]";
const favoritesKey = "futurebody_exercise_favorites";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(favoritesKey);
    return saved ? JSON.parse(saved) as string[] : [];
  } catch {
    return [];
  }
}

const levels = ["Wszystkie", "Podstawowy", "Średni", "Zaawansowany"] as const;

export default function ExerciseLibraryPanel() {
  const [group, setGroup] = useState<string>("Wszystkie");
  const [level, setLevel] = useState<(typeof levels)[number]>("Wszystkie");
  const [equipment, setEquipment] = useState("Wszystkie");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(readFavorites);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<ExerciseRecord | null>(null);

  const equipmentOptions = useMemo(
    () => ["Wszystkie", ...Array.from(new Set(exerciseLibrary.map((item) => item.equipment))).sort((a, b) => a.localeCompare(b, "pl"))],
    [],
  );

  const results = useMemo(() => {
    let list = exerciseLibrary;
    if (group !== "Wszystkie") list = list.filter((item) => item.muscle === group);
    if (level !== "Wszystkie") list = list.filter((item) => item.level === level);
    if (equipment !== "Wszystkie") list = list.filter((item) => item.equipment === equipment);
    if (onlyFavorites) list = list.filter((item) => favorites.includes(item.id));
    const trimmed = query.trim();
    if (!trimmed) return list;
    return list
      .map((item) => ({ item, score: scoreExerciseSearch(item, trimmed) }))
      .filter((entry) => entry.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }, [group, level, equipment, onlyFavorites, favorites, query]);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem(favoritesKey, JSON.stringify(next));
      return next;
    });
  }

  const activeFilters = (level !== "Wszystkie" ? 1 : 0) + (equipment !== "Wszystkie" ? 1 : 0);

  return (
    <>
      <header className="mb-5">
        <h1 className="text-[34px] font-black tracking-[-0.055em] sm:text-[42px]">Biblioteka ćwiczeń</h1>
        <p className="mt-1.5 text-sm text-black/42">
          {exerciseLibrary.length} ćwiczeń w {exerciseGroups.length} partiach · instrukcja, typowy błąd i mapa mięśni
        </p>
      </header>

      {/* Wyszukiwanie i filtry */}
      <div className="sticky top-[calc(72px+env(safe-area-inset-top))] z-20 -mx-4 mb-4 bg-[var(--fb-bg)] px-4 py-3 lg:top-[72px]">
        <div className="flex gap-2">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-black/[0.08] bg-white px-4">
            <Search size={16} className="shrink-0 text-black/32" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Szukaj ćwiczenia…"
              aria-label="Szukaj ćwiczenia"
              className="h-full min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm"
            />
            {query ? <button onClick={() => setQuery("")} aria-label="Wyczyść" className="shrink-0 text-black/35"><X size={15} /></button> : null}
          </label>
          <button
            onClick={() => setFiltersOpen(true)}
            aria-label="Filtry"
            className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition ${activeFilters ? "border-black bg-black text-white" : "border-black/[0.08] bg-white"}`}
          >
            <SlidersHorizontal size={17} />
            {activeFilters ? <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#ffc400] text-[9px] font-black text-black">{activeFilters}</span> : null}
          </button>
          <button
            onClick={() => setOnlyFavorites((current) => !current)}
            aria-pressed={onlyFavorites}
            aria-label="Tylko ulubione"
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition ${onlyFavorites ? "border-black bg-black text-white" : "border-black/[0.08] bg-white"}`}
          >
            <Heart size={17} fill={onlyFavorites ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="fb-scroll-x -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {["Wszystkie", ...exerciseGroups].map((name) => {
            const count = name === "Wszystkie" ? exerciseLibrary.length : exerciseLibrary.filter((item) => item.muscle === name).length;
            const active = group === name;
            return (
              <button
                key={name}
                onClick={() => setGroup(name)}
                aria-pressed={active}
                className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[11px] font-black transition ${active ? "border-black bg-black text-white" : "border-black/10 bg-white"}`}
              >
                {name}
                <span className={active ? "text-white/45" : "text-black/32"}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista */}
      <section className={`${cardClass} overflow-hidden`}>
        {results.length ? (
          <div className="divide-y divide-black/[0.055]">
            {results.map((exercise) => (
              <div key={exercise.id} className="flex items-center">
                <button onClick={() => setSelected(exercise)} className="flex min-h-20 min-w-0 flex-1 items-center gap-3.5 py-3 pl-4 pr-2 text-left transition hover:bg-black/[0.015] sm:pl-5">
                  <span className="h-14 w-12 shrink-0 text-black/70">
                    <MuscleMap primary={exercise.primaryMuscleIds} secondary={exercise.secondaryMuscleIds} className="h-full" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black">{exercise.name}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-black/42">{exercise.muscle} · {exercise.equipment}</span>
                    <span className="mt-1 inline-flex rounded-full bg-black/[0.055] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black/50">{exercise.level}</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-black/25" />
                </button>
                <button
                  onClick={() => toggleFavorite(exercise.id)}
                  aria-label={favorites.includes(exercise.id) ? `Usuń ${exercise.name} z ulubionych` : `Dodaj ${exercise.name} do ulubionych`}
                  aria-pressed={favorites.includes(exercise.id)}
                  className="grid h-12 w-12 shrink-0 place-items-center text-black/25 transition hover:text-black"
                >
                  <Heart size={16} fill={favorites.includes(exercise.id) ? "currentColor" : "none"} className={favorites.includes(exercise.id) ? "text-[#d99f00]" : ""} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <Search size={22} className="mx-auto text-black/25" />
            <p className="mt-3 text-sm font-black">Brak ćwiczeń dla tych kryteriów</p>
            <p className="mt-1 text-[11px] text-black/38">Zmień partię, filtry albo wyczyść wyszukiwanie.</p>
          </div>
        )}
      </section>

      {/* Filtry */}
      {filtersOpen ? (
        <div className="fixed inset-0 z-[86] flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-4">
          <button className="absolute inset-0" onClick={() => setFiltersOpen(false)} aria-label="Zamknij" />
          <section className="ui-sheet relative flex max-h-[80svh] w-full flex-col rounded-t-[28px] bg-white shadow-2xl sm:max-w-md sm:rounded-[28px]">
            <div className="shrink-0 px-5 pt-4 sm:px-6 sm:pt-6">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/15 sm:hidden" />
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-[-0.03em]">Filtry</h2>
                <button onClick={() => setFiltersOpen(false)} className="grid h-11 w-11 place-items-center rounded-full bg-[#f1f1ef]" aria-label="Zamknij"><X size={16} /></button>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              <div>
                <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-black/32">Poziom</p>
                <div className="flex flex-wrap gap-2">
                  {levels.map((item) => (
                    <button key={item} onClick={() => setLevel(item)} aria-pressed={level === item} className={`h-11 rounded-full border px-4 text-[11px] font-black ${level === item ? "border-black bg-black text-white" : "border-black/10 bg-white"}`}>{item}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-black/32">Sprzęt</p>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map((item) => (
                    <button key={item} onClick={() => setEquipment(item)} aria-pressed={equipment === item} className={`h-11 rounded-full border px-4 text-[11px] font-black ${equipment === item ? "border-black bg-black text-white" : "border-black/10 bg-white"}`}>{item}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-2 border-t border-black/[0.06] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              <button onClick={() => { setLevel("Wszystkie"); setEquipment("Wszystkie"); }} className="h-12 flex-1 rounded-full border border-black/12 text-[10px] font-black uppercase tracking-wider">Wyczyść</button>
              <button onClick={() => setFiltersOpen(false)} className="h-12 flex-1 rounded-full bg-black text-[10px] font-black uppercase tracking-wider text-white">Pokaż {results.length}</button>
            </div>
          </section>
        </div>
      ) : null}

      {/* Szczegóły ćwiczenia */}
      {selected ? (
        <div className="fixed inset-0 z-[87] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
          <button className="absolute inset-0" onClick={() => setSelected(null)} aria-label="Zamknij" />
          <article className="ui-sheet relative flex max-h-[90svh] w-full flex-col rounded-t-[28px] bg-white shadow-2xl sm:max-w-2xl sm:rounded-[28px]">
            <div className="shrink-0 px-5 pt-4 sm:px-7 sm:pt-7">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/15 sm:hidden" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/32">{selected.muscle}</p>
                  <h2 className="mt-1.5 text-2xl font-black tracking-[-0.04em]">{selected.name}</h2>
                  <p className="mt-0.5 text-xs text-black/40">{selected.englishName}</p>
                </div>
                <button onClick={() => setSelected(null)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f1f1ef]" aria-label="Zamknij"><X size={16} /></button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                <div className="rounded-2xl bg-[#f3f3f1] p-4">
                  <div className="h-44 text-black/70"><MuscleMap primary={selected.primaryMuscleIds} secondary={selected.secondaryMuscleIds} className="h-full" /></div>
                  <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[9px] font-bold">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ffc400]" />Główne</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ffc400]/40" />Wspomagające</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[["Sprzęt", selected.equipment], ["Poziom", selected.level], ["Protokół", selected.protocol], ["Wzorzec", selected.familyName]].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-[#f3f3f1] px-3 py-2.5">
                        <p className="text-[8px] font-black uppercase tracking-wider text-black/32">{label}</p>
                        <p className="mt-0.5 text-[11px] font-black">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-black/32">Jak wykonać</h3>
                    <p className="mt-1.5 text-sm leading-6 text-black/70">{selected.instruction}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-amber-800">Typowy błąd</h3>
                    <p className="mt-1 text-sm leading-6 text-amber-900">{selected.commonMistake}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-black/32">Mięśnie</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selected.primaryMuscleIds.map((id) => <span key={id} className="rounded-full bg-black px-2.5 py-1 text-[9px] font-black text-white">{muscleLabels[id]}</span>)}
                      {selected.secondaryMuscleIds.map((id) => <span key={id} className="rounded-full bg-black/[0.06] px-2.5 py-1 text-[9px] font-black text-black/55">{muscleLabels[id]}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-black/[0.06] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
              <button
                onClick={() => toggleFavorite(selected.id)}
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[10px] font-black uppercase tracking-wider transition ${favorites.includes(selected.id) ? "bg-black text-white" : "border border-black/12"}`}
              >
                <Heart size={15} fill={favorites.includes(selected.id) ? "currentColor" : "none"} />
                {favorites.includes(selected.id) ? "W ulubionych" : "Dodaj do ulubionych"}
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}
