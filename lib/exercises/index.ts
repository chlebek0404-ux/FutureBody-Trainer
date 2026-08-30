/**
 * Publiczne API biblioteki ćwiczeń.
 *
 * Jedyne wejście dla reszty aplikacji. Komponenty nie sięgają do plików
 * katalogu bezpośrednio, dzięki czemu źródło danych można później podmienić
 * na Supabase bez zmian w interfejsie.
 */

import { chestExercises } from "@/lib/exercises/catalog/chest";
import { backExercises } from "@/lib/exercises/catalog/back";
import { shoulderExercises } from "@/lib/exercises/catalog/shoulders";
import { bicepsExercises, forearmExercises, tricepsExercises } from "@/lib/exercises/catalog/arms";
import { adductorExercises, calfExercises, gluteExercises, hamstringExercises, quadExercises } from "@/lib/exercises/catalog/legs";
import { coreExercises, extensorExercises } from "@/lib/exercises/catalog/core";
import { cardioExercises, functionalExercises, mobilityExercises, olympicExercises, powerliftingExercises, recoveryExercises } from "@/lib/exercises/catalog/conditioning";
import { muscleLabels } from "@/lib/exercises/taxonomy";
import type { Exercise, ExerciseCategory, ExerciseLevel, ExerciseRecord, MovementPattern, MuscleId } from "@/lib/exercises/types";

export * from "@/lib/exercises/types";
export * from "@/lib/exercises/taxonomy";

/** Usuwa znaki diakrytyczne, żeby „przysiad” znajdowało też „przysiad ze sztangą”. */
function normalize(value: string) {
  return value.toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function toRecord(exercise: Exercise): ExerciseRecord {
  const primaryMuscleLabels = exercise.primaryMuscles.map((id) => muscleLabels[id]);
  const secondaryMuscleLabels = exercise.secondaryMuscles.map((id) => muscleLabels[id]);
  return {
    ...exercise,
    primaryMuscleLabels,
    secondaryMuscleLabels,
    searchText: normalize([
      exercise.name, exercise.englishName, exercise.category,
      ...exercise.aliases, ...primaryMuscleLabels, ...exercise.equipment,
    ].join(" ")),
    muscle: exercise.category,
    equipmentLabel: exercise.equipment[0] ?? "Masa ciała",
    instruction: exercise.steps.join(" "),
    commonMistake: exercise.mistakes[0] ?? "",
    protocol: exercise.defaultProtocol,
  };
}

const rawCatalog: Exercise[] = [
  ...chestExercises, ...backExercises, ...shoulderExercises,
  ...bicepsExercises, ...tricepsExercises, ...forearmExercises,
  ...quadExercises, ...hamstringExercises, ...gluteExercises,
  ...adductorExercises, ...calfExercises,
  ...coreExercises, ...extensorExercises,
  ...mobilityExercises, ...functionalExercises,
  ...powerliftingExercises, ...olympicExercises,
  ...cardioExercises, ...recoveryExercises,
];

/** Pełna biblioteka systemowa. */
export const exerciseLibrary: ExerciseRecord[] = rawCatalog.map(toRecord);

const bySlug = new Map(exerciseLibrary.map((exercise) => [exercise.slug, exercise]));

export function getExercise(slug: string) {
  return bySlug.get(slug) ?? null;
}

export function categoryCounts() {
  const counts = new Map<ExerciseCategory, number>();
  for (const exercise of exerciseLibrary) counts.set(exercise.category, (counts.get(exercise.category) ?? 0) + 1);
  return counts;
}

export type ExerciseFilters = {
  query?: string;
  categories?: ExerciseCategory[];
  patterns?: MovementPattern[];
  muscles?: MuscleId[];
  equipment?: string[];
  levels?: ExerciseLevel[];
  goals?: string[];
  unilateralOnly?: boolean;
  compoundOnly?: boolean;
  isolationOnly?: boolean;
  noEquipmentOnly?: boolean;
  favouriteIds?: string[];
  favouritesOnly?: boolean;
  customOnly?: boolean;
  /** Slugi wykluczone przez ograniczenia podopiecznego. */
  excludeSlugs?: string[];
};

/**
 * Ocena trafności dla wyszukiwania. Wyższa wartość to lepsze dopasowanie;
 * wynik ujemny oznacza brak dopasowania.
 */
export function scoreExercise(exercise: ExerciseRecord, rawQuery: string) {
  const query = normalize(rawQuery.trim());
  if (!query) return 0;
  const name = normalize(exercise.name);
  const english = normalize(exercise.englishName);

  if (name.startsWith(query) || english.startsWith(query)) return 1000;
  if (name.includes(query) || english.includes(query)) return 800;
  if (exercise.aliases.some((alias) => normalize(alias).includes(query))) return 600;
  if (normalize(exercise.category).includes(query)) return 400;
  if (exercise.primaryMuscleLabels.some((label) => normalize(label).includes(query))) return 300;
  if (exercise.equipment.some((item) => normalize(item).includes(query))) return 200;
  if (exercise.searchText.includes(query)) return 100;
  return -1;
}

export function filterExercises(source: ExerciseRecord[], filters: ExerciseFilters = {}) {
  let list = source;

  if (filters.categories?.length) list = list.filter((item) => filters.categories!.includes(item.category));
  if (filters.patterns?.length) list = list.filter((item) => filters.patterns!.includes(item.pattern));
  if (filters.muscles?.length) list = list.filter((item) => item.primaryMuscles.some((id) => filters.muscles!.includes(id)));
  if (filters.equipment?.length) list = list.filter((item) => item.equipment.some((name) => filters.equipment!.includes(name)));
  if (filters.levels?.length) list = list.filter((item) => filters.levels!.includes(item.level));
  if (filters.goals?.length) list = list.filter((item) => item.goals.some((goal) => filters.goals!.includes(goal)));
  if (filters.unilateralOnly) list = list.filter((item) => item.laterality !== "obustronne");
  if (filters.compoundOnly) list = list.filter((item) => item.compound);
  if (filters.isolationOnly) list = list.filter((item) => !item.compound);
  if (filters.noEquipmentOnly) list = list.filter((item) => item.equipment.length === 1 && item.equipment[0] === "Masa ciała");
  if (filters.favouritesOnly) list = list.filter((item) => filters.favouriteIds?.includes(item.id));
  if (filters.customOnly) list = list.filter((item) => item.source === "trainer");
  if (filters.excludeSlugs?.length) list = list.filter((item) => !filters.excludeSlugs!.includes(item.slug));

  const query = filters.query?.trim();
  if (!query) return list;

  return list
    .map((item) => ({ item, score: scoreExercise(item, query) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}

export function searchExercises(query: string, options: { exercises?: ExerciseRecord[]; filters?: ExerciseFilters; limit?: number } = {}) {
  const list = filterExercises(options.exercises ?? exerciseLibrary, { ...options.filters, query });
  return options.limit ? list.slice(0, options.limit) : list;
}

/**
 * Zamienniki. Najpierw wskazane wprost przez autora katalogu, potem dobrane
 * po wzorcu ruchowym i głównej partii, z uwzględnieniem dostępnego sprzętu.
 */
export function getExerciseSubstitutions(exercise: ExerciseRecord, options: { equipment?: string[]; limit?: number } = {}) {
  const limit = options.limit ?? 6;
  const explicit = exercise.substitutions.map((slug) => bySlug.get(slug)).filter((item): item is ExerciseRecord => Boolean(item));

  const matchesEquipment = (candidate: ExerciseRecord) =>
    !options.equipment?.length || candidate.equipment.some((name) => options.equipment!.includes(name));

  const derived = exerciseLibrary
    .filter((candidate) =>
      candidate.slug !== exercise.slug &&
      !explicit.some((item) => item.slug === candidate.slug) &&
      candidate.pattern === exercise.pattern &&
      candidate.primaryMuscles.some((id) => exercise.primaryMuscles.includes(id)) &&
      matchesEquipment(candidate))
    .sort((a, b) => Number(a.level !== exercise.level) - Number(b.level !== exercise.level));

  return [...explicit.filter(matchesEquipment), ...derived].slice(0, limit);
}

export function getRegression(exercise: ExerciseRecord) {
  return exercise.regression ? bySlug.get(exercise.regression) ?? null : null;
}

export function getProgression(exercise: ExerciseRecord) {
  return exercise.progression ? bySlug.get(exercise.progression) ?? null : null;
}

/**
 * Dobór pod cel treningowy: po jednym ćwiczeniu z każdego preferowanego
 * wzorca na zmianę, bez powtarzania kategorii w pierwszych rundach.
 */
export function suggestExercises(goal: string, limit = 12) {
  const normalized = normalize(goal);
  const patterns: MovementPattern[] = normalized.includes("mobil") || normalized.includes("ruchu")
    ? ["mobility", "anti-extension", "hinge", "squat"]
    : normalized.includes("sil")
      ? ["squat", "hinge", "horizontal-push", "vertical-pull", "anti-extension"]
      : normalized.includes("masa")
        ? ["horizontal-push", "vertical-pull", "squat", "hinge", "lunge", "isolation"]
        : normalized.includes("reduk") || normalized.includes("spraw")
          ? ["squat", "horizontal-push", "horizontal-pull", "lunge", "anti-extension", "hinge"]
          : ["squat", "hinge", "horizontal-push", "horizontal-pull", "anti-extension"];

  const pools = new Map(patterns.map((pattern) => [
    pattern,
    exerciseLibrary.filter((item) => item.pattern === pattern && item.level !== "Zaawansowany" && !item.requiresSupervision),
  ]));

  const picked: ExerciseRecord[] = [];
  const usedCategories = new Set<string>();

  for (let round = 0; round < 12 && picked.length < limit; round += 1) {
    let added = false;
    for (const pattern of patterns) {
      if (picked.length >= limit) break;
      const pool = pools.get(pattern) ?? [];
      const candidate =
        pool.find((item) => !picked.includes(item) && (round > 0 || !usedCategories.has(item.category))) ??
        pool.find((item) => !picked.includes(item));
      if (!candidate) continue;
      picked.push(candidate);
      usedCategories.add(candidate.category);
      added = true;
    }
    if (!added) break;
  }

  return picked.slice(0, limit);
}

/**
 * Odmiana rzeczownika przez liczbę: 1 ćwiczenie, 2 ćwiczenia, 5 ćwiczeń.
 * Wynik nie zawiera liczby, żeby dało się go użyć w dowolnym miejscu zdania.
 */
export function pluralExercises(count: number) {
  const last = count % 10;
  const lastTwo = count % 100;
  if (count === 1) return "ćwiczenie";
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "ćwiczenia";
  return "ćwiczeń";
}
