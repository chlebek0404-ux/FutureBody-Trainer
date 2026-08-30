"use client";

import { ChevronRight, Heart, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import MuscleMap from "@/components/muscle-map";
import {
  categoryCounts,
  equipmentGroups,
  exerciseCategories,
  exerciseLibrary,
  filterExercises,
  getProgression,
  getRegression,
  getExerciseSubstitutions,
  movementPatternLabels,
  pluralExercises,
  quickFilters,
  trainingGoals,
  type ExerciseLevel,
  type ExerciseRecord,
} from "@/lib/exercises";

const favouritesKey = "futurebody_exercise_favourites";
const recentsKey = "futurebody_exercise_recents";

function readStored(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as string[]) : [];
  } catch {
    return [];
  }
}

const levels: ExerciseLevel[] = ["Podstawowy", "Średni", "Zaawansowany"];

export default function ExerciseLibrary({ onAddToPlan }: { onAddToPlan?: (exercise: ExerciseRecord) => void }) {
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState("all");
  const [category, setCategory] = useState<string>("Wszystkie");
  const [pickedLevels, setPickedLevels] = useState<ExerciseLevel[]>([]);
  const [pickedEquipment, setPickedEquipment] = useState<string[]>([]);
  const [pickedGoals, setPickedGoals] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<string[]>(() => readStored(favouritesKey));
  const [recents, setRecents] = useState<string[]>(() => readStored(recentsKey));
  const [scope, setScope] = useState<"all" | "favourites" | "recents">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<ExerciseRecord | null>(null);

  const counts = useMemo(() => categoryCounts(), []);

  const results = useMemo(() => {
    const quickFilter = quickFilters.find((item) => item.id === quick);
    let base = exerciseLibrary;
    if (quickFilter && quick !== "all") base = base.filter((item) => quickFilter.match(item));
    if (scope === "favourites") base = base.filter((item) => favourites.includes(item.id));
    if (scope === "recents") base = recents.map((id) => base.find((item) => item.id === id)).filter((item): item is ExerciseRecord => Boolean(item));

    return filterExercises(base, {
      query,
      categories: category === "Wszystkie" ? undefined : [category as ExerciseRecord["category"]],
      levels: pickedLevels.length ? pickedLevels : undefined,
      equipment: pickedEquipment.length ? pickedEquipment : undefined,
      goals: pickedGoals.length ? pickedGoals : undefined,
    });
  }, [query, quick, category, pickedLevels, pickedEquipment, pickedGoals, scope, favourites, recents]);

  function toggleFavourite(id: string) {
    setFavourites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem(favouritesKey, JSON.stringify(next));
      return next;
    });
  }

  function openExercise(exercise: ExerciseRecord) {
    setSelected(exercise);
    setRecents((current) => {
      const next = [exercise.id, ...current.filter((id) => id !== exercise.id)].slice(0, 20);
      window.localStorage.setItem(recentsKey, JSON.stringify(next));
      return next;
    });
  }

  function toggleIn<T>(list: T[], value: T, setter: (next: T[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  const activeFilters = pickedLevels.length + pickedEquipment.length + pickedGoals.length;

  return (
    <>
      <header className="mb-5">
        <h1 className="text-[clamp(2rem,6.5vw,2.9rem)] font-black leading-[1.02] tracking-[-0.055em]">Biblioteka ćwiczeń</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--fb-text-secondary)]">
          {exerciseLibrary.length} ćwiczeń w {exerciseCategories.length} kategoriach · instrukcja, oddech, błędy, regresje i zamienniki
        </p>
      </header>

      {/* Wyszukiwanie i zakres */}
      <div className="mb-4 flex flex-col gap-3">
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
            {activeFilters ? <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--fb-gold)] text-[9px] font-black text-[#0c0c0f]">{activeFilters}</span> : null}
          </button>
        </div>

        <div className="fb-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {[
            { id: "all" as const, label: "Wszystkie" },
            { id: "favourites" as const, label: `Ulubione ${favourites.length || ""}`.trim() },
            { id: "recents" as const, label: "Ostatnio używane" },
          ].map((item) => (
            <button key={item.id} onClick={() => setScope(item.id)} aria-pressed={scope === item.id}
              className={`h-11 shrink-0 rounded-full border px-4 text-[11px] font-black transition ${scope === item.id ? "border-black bg-black text-white" : "border-black/10 bg-white"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="fb-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {quickFilters.map((item) => (
            <button key={item.id} onClick={() => setQuick(item.id)} aria-pressed={quick === item.id}
              className={`h-10 shrink-0 rounded-full border px-3.5 text-[11px] font-bold transition ${quick === item.id ? "border-[var(--fb-gold)] bg-[color-mix(in_srgb,var(--fb-gold)_13%,transparent)] text-[var(--fb-gold-ink)]" : "border-black/10 bg-white"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="fb-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {["Wszystkie", ...exerciseCategories].map((name) => {
            const count = name === "Wszystkie" ? exerciseLibrary.length : counts.get(name as ExerciseRecord["category"]) ?? 0;
            if (!count) return null;
            const active = category === name;
            return (
              <button key={name} onClick={() => setCategory(name)} aria-pressed={active}
                className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[11px] font-black transition ${active ? "border-black bg-black text-white" : "border-black/10 bg-white"}`}>
                {name}<span className={active ? "text-white/45" : "text-black/32"}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista */}
      <section className="fb-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--fb-border)] px-4 py-3 sm:px-5">
          <p className="text-[11px] font-bold text-[var(--fb-text-muted)]">{results.length} {pluralExercises(results.length)}</p>
          {activeFilters ? (
            <button onClick={() => { setPickedLevels([]); setPickedEquipment([]); setPickedGoals([]); }} className="text-[10px] font-black uppercase tracking-wider text-[var(--fb-gold-ink)]">Wyczyść filtry</button>
          ) : null}
        </div>

        {results.length ? (
          <div className="divide-y divide-[var(--fb-border)]">
            {results.map((exercise) => (
              <div key={exercise.id} className="flex items-center">
                <button onClick={() => openExercise(exercise)} className="flex min-h-20 min-w-0 flex-1 items-center gap-3.5 py-3 pl-4 pr-2 text-left transition hover:bg-black/[0.015] sm:pl-5">
                  <span className="h-14 w-12 shrink-0 text-black/70">
                    <MuscleMap primary={exercise.primaryMuscles} secondary={exercise.secondaryMuscles} className="h-full" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black">{exercise.name}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-black/42">{exercise.category} · {exercise.equipmentLabel}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-black/[0.055] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black/50">{exercise.level}</span>
                      {exercise.requiresSupervision ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-900">Nadzór</span> : null}
                    </span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-black/25" />
                </button>
                <button
                  onClick={() => toggleFavourite(exercise.id)}
                  aria-label={favourites.includes(exercise.id) ? `Usuń ${exercise.name} z ulubionych` : `Dodaj ${exercise.name} do ulubionych`}
                  aria-pressed={favourites.includes(exercise.id)}
                  className="grid h-12 w-12 shrink-0 place-items-center text-black/25 transition hover:text-black"
                >
                  <Heart size={16} fill={favourites.includes(exercise.id) ? "currentColor" : "none"} className={favourites.includes(exercise.id) ? "text-[var(--fb-gold-dark)]" : ""} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <Search size={22} className="mx-auto text-black/25" />
            <p className="mt-3 text-sm font-black">Brak ćwiczeń dla tych kryteriów</p>
            <p className="mt-1 text-[11px] text-black/38">Zmień kategorię, filtry albo wyczyść wyszukiwanie.</p>
          </div>
        )}
      </section>

      {filtersOpen ? (
        <div className="fixed inset-0 z-[86] flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-4">
          <button className="absolute inset-0" onClick={() => setFiltersOpen(false)} aria-label="Zamknij" />
          <section className="ui-sheet relative flex max-h-[85svh] w-full flex-col rounded-t-[28px] shadow-2xl sm:max-w-lg sm:rounded-[28px]">
            <div className="shrink-0 px-5 pt-4 sm:px-6 sm:pt-6">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/15 sm:hidden" />
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-[-0.03em]">Filtry</h2>
                <button onClick={() => setFiltersOpen(false)} className="grid h-11 w-11 place-items-center rounded-full bg-[#f1f1ef]" aria-label="Zamknij"><X size={16} /></button>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
              <div>
                <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-black/32">Poziom</p>
                <div className="flex flex-wrap gap-2">
                  {levels.map((item) => (
                    <button key={item} onClick={() => toggleIn(pickedLevels, item, setPickedLevels)} aria-pressed={pickedLevels.includes(item)}
                      className={`h-11 rounded-full border px-4 text-[11px] font-black ${pickedLevels.includes(item) ? "border-black bg-black text-white" : "border-black/10 bg-white"}`}>{item}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-black/32">Cel</p>
                <div className="flex flex-wrap gap-2">
                  {trainingGoals.map((item) => (
                    <button key={item} onClick={() => toggleIn(pickedGoals, item, setPickedGoals)} aria-pressed={pickedGoals.includes(item)}
                      className={`h-11 rounded-full border px-4 text-[11px] font-black ${pickedGoals.includes(item) ? "border-black bg-black text-white" : "border-black/10 bg-white"}`}>{item}</button>
                  ))}
                </div>
              </div>
              {equipmentGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-black/32">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <button key={item} onClick={() => toggleIn(pickedEquipment, item, setPickedEquipment)} aria-pressed={pickedEquipment.includes(item)}
                        className={`h-10 rounded-full border px-3.5 text-[11px] font-bold ${pickedEquipment.includes(item) ? "border-black bg-black text-white" : "border-black/10 bg-white"}`}>{item}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex shrink-0 gap-2 border-t border-black/[0.06] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              <button onClick={() => { setPickedLevels([]); setPickedEquipment([]); setPickedGoals([]); }} className="h-12 flex-1 rounded-full border border-black/12 text-[10px] font-black uppercase tracking-wider">Wyczyść</button>
              <button onClick={() => setFiltersOpen(false)} className="h-12 flex-1 rounded-full bg-black text-[10px] font-black uppercase tracking-wider text-white">Pokaż {results.length}</button>
            </div>
          </section>
        </div>
      ) : null}

      {selected ? <ExerciseDetail exercise={selected} onClose={() => setSelected(null)} onOpen={openExercise} onAddToPlan={onAddToPlan} isFavourite={favourites.includes(selected.id)} onToggleFavourite={() => toggleFavourite(selected.id)} /> : null}
    </>
  );
}

function ExerciseDetail({ exercise, onClose, onOpen, onAddToPlan, isFavourite, onToggleFavourite }: {
  exercise: ExerciseRecord;
  onClose: () => void;
  onOpen: (exercise: ExerciseRecord) => void;
  onAddToPlan?: (exercise: ExerciseRecord) => void;
  isFavourite: boolean;
  onToggleFavourite: () => void;
}) {
  const regression = getRegression(exercise);
  const progression = getProgression(exercise);
  const substitutions = getExerciseSubstitutions(exercise, { limit: 5 });

  return (
    <div className="fixed inset-0 z-[87] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
      <button className="absolute inset-0" onClick={onClose} aria-label="Zamknij" />
      <article className="ui-sheet relative flex max-h-[92svh] w-full flex-col rounded-t-[28px] shadow-2xl sm:max-w-2xl sm:rounded-[28px]">
        <div className="shrink-0 px-5 pt-4 sm:px-7 sm:pt-7">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/15 sm:hidden" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/32">{exercise.category} · {movementPatternLabels[exercise.pattern]}</p>
              <h2 className="mt-1.5 text-2xl font-black tracking-[-0.04em]">{exercise.name}</h2>
              <p className="mt-0.5 text-xs text-black/40">{exercise.englishName}</p>
            </div>
            <button onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f1f1ef]" aria-label="Zamknij"><X size={16} /></button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="grid gap-4 sm:grid-cols-[190px_1fr]">
            <div className="rounded-2xl bg-[#f3f3f1] p-4">
              <div className="h-44 text-black/70"><MuscleMap primary={exercise.primaryMuscles} secondary={exercise.secondaryMuscles} className="h-full" /></div>
              <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[9px] font-bold">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--fb-gold)]" />Główne</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--fb-gold)]/40" />Wspomagające</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 self-start">
              {[["Sprzęt", exercise.equipment.join(", ")], ["Poziom", exercise.level], ["Protokół", exercise.defaultProtocol], ["Strona", exercise.laterality], ["Typ", exercise.compound ? "Wielostawowe" : "Izolowane"], ["Cele", exercise.goals.join(", ")]].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[#f3f3f1] px-3 py-2.5">
                  <p className="text-[8px] font-black uppercase tracking-wider text-black/32">{label}</p>
                  <p className="mt-0.5 text-[11px] font-black leading-4">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {exercise.requiresSupervision ? (
            <p className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-sm leading-6 text-amber-900">
              Ćwiczenie techniczne — wprowadzaj je pod nadzorem trenera.
            </p>
          ) : null}

          <Section title="Pozycja początkowa"><p className="text-sm leading-6 text-black/70">{exercise.startPosition}</p></Section>

          <Section title="Wykonanie">
            <ol className="space-y-2">
              {exercise.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-6 text-black/70">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-black text-[10px] font-black text-white">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Oddychanie"><p className="text-sm leading-6 text-black/70">{exercise.breathing}</p></Section>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-amber-800">Najczęstsze błędy</h3>
            <ul className="mt-1.5 space-y-1">
              {exercise.mistakes.map((mistake) => <li key={mistake} className="text-sm leading-6 text-amber-900">· {mistake}</li>)}
            </ul>
          </div>

          {exercise.cues.length ? (
            <Section title="Wskazówki trenera">
              <ul className="space-y-1">{exercise.cues.map((cue) => <li key={cue} className="text-sm leading-6 text-black/70">· {cue}</li>)}</ul>
            </Section>
          ) : null}

          <Section title="Zakres ruchu"><p className="text-sm leading-6 text-black/70">{exercise.rangeOfMotion}</p></Section>

          {exercise.precautions.length ? (
            <Section title="Środki ostrożności">
              <ul className="space-y-1">{exercise.precautions.map((item) => <li key={item} className="text-sm leading-6 text-black/70">· {item}</li>)}</ul>
            </Section>
          ) : null}

          <Section title="Mięśnie">
            <div className="flex flex-wrap gap-1.5">
              {exercise.primaryMuscleLabels.map((label) => <span key={label} className="rounded-full bg-black px-2.5 py-1 text-[9px] font-black text-white">{label}</span>)}
              {exercise.secondaryMuscleLabels.map((label) => <span key={label} className="rounded-full bg-black/[0.06] px-2.5 py-1 text-[9px] font-black text-black/55">{label}</span>)}
            </div>
          </Section>

          {(regression || progression) ? (
            <Section title="Prościej i trudniej">
              <div className="grid gap-2 sm:grid-cols-2">
                {regression ? <RelatedCard label="Prościej" exercise={regression} onOpen={onOpen} /> : null}
                {progression ? <RelatedCard label="Trudniej" exercise={progression} onOpen={onOpen} /> : null}
              </div>
            </Section>
          ) : null}

          {substitutions.length ? (
            <Section title="Zamienniki">
              <div className="grid gap-2 sm:grid-cols-2">
                {substitutions.map((item) => <RelatedCard key={item.slug} label={item.equipmentLabel} exercise={item} onOpen={onOpen} />)}
              </div>
            </Section>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-2 border-t border-black/[0.06] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
          <button onClick={onToggleFavourite} className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border transition ${isFavourite ? "border-transparent bg-black text-white" : "border-black/12"}`} aria-label={isFavourite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}>
            <Heart size={16} fill={isFavourite ? "currentColor" : "none"} />
          </button>
          {onAddToPlan ? (
            <button onClick={() => { onAddToPlan(exercise); onClose(); }} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-black text-[10px] font-black uppercase tracking-wider text-white">
              <Plus size={15} />Dodaj do planu
            </button>
          ) : (
            <p className="flex h-12 flex-1 items-center justify-center rounded-full bg-[#f3f3f1] text-[10px] font-bold text-black/40">Otwórz plan, aby dodać ćwiczenie</p>
          )}
        </div>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[10px] font-black uppercase tracking-wider text-black/32">{title}</h3>
      {children}
    </section>
  );
}

function RelatedCard({ label, exercise, onOpen }: { label: string; exercise: ExerciseRecord; onOpen: (exercise: ExerciseRecord) => void }) {
  return (
    <button onClick={() => onOpen(exercise)} className="flex min-h-16 items-center gap-3 rounded-2xl bg-[#f3f3f1] p-3 text-left transition hover:bg-[#ededeb]">
      <span className="h-11 w-9 shrink-0 text-black/60">
        <MuscleMap primary={exercise.primaryMuscles} secondary={exercise.secondaryMuscles} className="h-full" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[9px] font-black uppercase tracking-wider text-black/32">{label}</span>
        <span className="mt-0.5 block truncate text-xs font-black">{exercise.name}</span>
      </span>
      <ChevronRight size={15} className="shrink-0 text-black/25" />
    </button>
  );
}
