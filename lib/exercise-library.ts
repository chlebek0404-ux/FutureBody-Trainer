import { exerciseCatalog, exerciseGroups } from "@/lib/exercise-catalog";

export type MovementPattern = "squat" | "hinge" | "push" | "pull" | "lunge" | "core" | "mobility";

export type ExerciseSource = "system" | "trainer";
export type ExerciseLaterality = "bilateral" | "unilateral";
export type CameraAngle = "front" | "back" | "side" | "frontThreeQuarter" | "rearThreeQuarter";

export type MuscleId =
  | "pectoralisMajor"
  | "upperChest"
  | "latissimusDorsi"
  | "trapezius"
  | "anteriorDeltoid"
  | "lateralDeltoid"
  | "posteriorDeltoid"
  | "biceps"
  | "triceps"
  | "forearms"
  | "rectusAbdominis"
  | "obliques"
  | "erectorSpinae"
  | "gluteusMaximus"
  | "quadriceps"
  | "hamstrings"
  | "adductors"
  | "abductors"
  | "calves";

export type MovementPhase = {
  id: string;
  label: string;
  cue: string;
  durationMs: number;
};

export type ExerciseVisualizationAsset = {
  kind: "sprite" | "video" | "imageSequence";
  src: string;
  frameCount: number;
  version: string;
};

export type ExerciseVisualization = {
  animationAsset?: ExerciseVisualizationAsset;
  anatomyAsset: string;
  preferredCameraAngle: CameraAngle;
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  movementPhases: MovementPhase[];
};

export type ExerciseMedia = {
  start: string;
  end: string;
  attribution?: string;
};

export type ExerciseRecord = {
  id: string;
  name: string;
  baseName: string;
  englishName: string;
  aliases: string[];
  muscle: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  primaryMuscleIds: MuscleId[];
  secondaryMuscleIds: MuscleId[];
  equipment: string;
  equipmentList: string[];
  level: "Podstawowy" | "Średni" | "Zaawansowany";
  pattern: MovementPattern;
  familyId: string;
  familyName: string;
  exerciseTypes: string[];
  laterality: ExerciseLaterality;
  tags: string[];
  goal: string;
  protocol: string;
  instruction: string;
  cues: string[];
  commonMistake: string;
  commonMistakes: string[];
  media?: ExerciseMedia;
  visualization: ExerciseVisualization;
  source: ExerciseSource;
  active: boolean;
  used: number;
};

export const muscleLabels: Record<MuscleId, string> = {
  pectoralisMajor: "Klatka piersiowa",
  upperChest: "Górna część klatki",
  latissimusDorsi: "Najszerszy grzbietu",
  trapezius: "Mięsień czworoboczny",
  anteriorDeltoid: "Przedni akton barków",
  lateralDeltoid: "Boczny akton barków",
  posteriorDeltoid: "Tylny akton barków",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Przedramiona",
  rectusAbdominis: "Mięsień prosty brzucha",
  obliques: "Mięśnie skośne brzucha",
  erectorSpinae: "Prostowniki grzbietu",
  gluteusMaximus: "Pośladkowy wielki",
  quadriceps: "Czworogłowe uda",
  hamstrings: "Dwugłowe uda",
  adductors: "Przywodziciele",
  abductors: "Odwodziciele",
  calves: "Łydki",
};

const muscleIdsByName: Record<string, MuscleId[]> = {
  "Klatka piersiowa": ["pectoralisMajor"],
  "Górna część klatki": ["upperChest"],
  Plecy: ["latissimusDorsi", "trapezius"],
  Barki: ["anteriorDeltoid", "lateralDeltoid"],
  Biceps: ["biceps"],
  Triceps: ["triceps"],
  Przedramiona: ["forearms"],
  Core: ["rectusAbdominis", "obliques"],
  "Prostowniki grzbietu": ["erectorSpinae"],
  Pośladki: ["gluteusMaximus"],
  "Czworogłowe uda": ["quadriceps"],
  "Dwugłowe uda": ["hamstrings"],
  Przywodziciele: ["adductors"],
  Odwodziciele: ["abductors"],
  Łydki: ["calves"],
  "Tył ciała": ["hamstrings", "gluteusMaximus", "erectorSpinae"],
  Nogi: ["quadriceps", "hamstrings", "gluteusMaximus"],
  "Mobilność bioder": ["adductors", "abductors", "gluteusMaximus"],
  "Zginacze biodra": ["rectusAbdominis"],
  Brzuch: ["rectusAbdominis", "obliques"],
  Klatka: ["pectoralisMajor"],
  "Mięsień prosty brzucha": ["rectusAbdominis"],
  "Mięśnie skośne brzucha": ["obliques"],
  "Najszerszy grzbietu": ["latissimusDorsi"],
  "Mięsień czworoboczny": ["trapezius"],
  "Przedni akton barków": ["anteriorDeltoid"],
  "Boczny akton barków": ["lateralDeltoid"],
  "Tylny akton barków": ["posteriorDeltoid"],
  Mobilność: ["adductors", "abductors", "gluteusMaximus"],
};

export function muscleIdsForNames(names: string[]) {
  return Array.from(new Set(names.flatMap((name) => muscleIdsByName[name] ?? [])));
}

const cameraAngles: Record<MovementPattern, CameraAngle> = {
  squat: "frontThreeQuarter",
  hinge: "side",
  push: "frontThreeQuarter",
  pull: "rearThreeQuarter",
  lunge: "frontThreeQuarter",
  core: "side",
  mobility: "frontThreeQuarter",
};

const defaultPhases: Record<MovementPattern, MovementPhase[]> = {
  squat: [
    { id: "start", label: "Pozycja startowa", cue: "Stabilna stopa i napięty tułów", durationMs: 650 },
    { id: "descent", label: "Kontrolowane zejście", cue: "Kolana prowadź nad stopami", durationMs: 700 },
    { id: "bottom", label: "Dolna pozycja", cue: "Zachowaj kontrolę i równowagę", durationMs: 800 },
    { id: "return", label: "Powrót", cue: "Odepchnij podłoże całą stopą", durationMs: 700 },
    { id: "finish", label: "Pełny wyprost", cue: "Wróć do stabilnej pozycji", durationMs: 650 },
  ],
  hinge: [
    { id: "start", label: "Pozycja startowa", cue: "Ustaw stabilny tułów", durationMs: 650 },
    { id: "hinge", label: "Cofnij biodra", cue: "Ciężar prowadź blisko ciała", durationMs: 700 },
    { id: "bottom", label: "Dolna pozycja", cue: "Zatrzymaj zakres przed utratą pozycji", durationMs: 850 },
    { id: "return", label: "Wyprost biodra", cue: "Wróć bez szarpania", durationMs: 700 },
    { id: "finish", label: "Pozycja końcowa", cue: "Stań wysoko bez przeprostu", durationMs: 650 },
  ],
  push: [
    { id: "start", label: "Pozycja startowa", cue: "Ustaw łopatki i chwyt", durationMs: 650 },
    { id: "lower", label: "Opuszczanie", cue: "Kontroluj tor ruchu", durationMs: 700 },
    { id: "bottom", label: "Dolna pozycja", cue: "Zachowaj stabilność barków", durationMs: 800 },
    { id: "press", label: "Wyciskanie", cue: "Prowadź ciężar płynnie", durationMs: 700 },
    { id: "finish", label: "Pozycja końcowa", cue: "Zakończ bez utraty napięcia", durationMs: 650 },
  ],
  pull: [
    { id: "start", label: "Pełny zakres", cue: "Ustaw stabilny tułów", durationMs: 650 },
    { id: "initiate", label: "Rozpocznij łopatką", cue: "Nie szarp ciężaru", durationMs: 700 },
    { id: "pull", label: "Przyciągnięcie", cue: "Prowadź łokcie w kierunku tułowia", durationMs: 800 },
    { id: "return", label: "Kontrolowany powrót", cue: "Oddawaj ciężar spokojnie", durationMs: 700 },
    { id: "finish", label: "Pozycja startowa", cue: "Wróć do pełnego zakresu", durationMs: 650 },
  ],
  lunge: [
    { id: "start", label: "Pozycja startowa", cue: "Ustaw stabilną bazę", durationMs: 650 },
    { id: "step", label: "Ustawienie nogi", cue: "Kontroluj biodra i kolano", durationMs: 700 },
    { id: "bottom", label: "Dolna pozycja", cue: "Utrzymaj równowagę", durationMs: 800 },
    { id: "return", label: "Powrót", cue: "Odepchnij podłoże pracującą nogą", durationMs: 700 },
    { id: "finish", label: "Stabilna pozycja", cue: "Wróć bez kołysania", durationMs: 650 },
  ],
  core: [
    { id: "start", label: "Pozycja startowa", cue: "Ustaw żebra nad miednicą", durationMs: 700 },
    { id: "brace", label: "Napięcie", cue: "Utrzymaj spokojny oddech", durationMs: 750 },
    { id: "work", label: "Kontrolowany ruch", cue: "Nie trać ustawienia tułowia", durationMs: 850 },
    { id: "return", label: "Powrót", cue: "Wróć bez rozluźnienia", durationMs: 750 },
    { id: "finish", label: "Pozycja końcowa", cue: "Zachowaj napięcie", durationMs: 700 },
  ],
  mobility: [
    { id: "start", label: "Pozycja startowa", cue: "Nie wymuszaj zakresu", durationMs: 750 },
    { id: "move", label: "Płynne przejście", cue: "Oddychaj swobodnie", durationMs: 850 },
    { id: "range", label: "Końcowy zakres", cue: "Zatrzymaj się przed bólem", durationMs: 900 },
    { id: "return", label: "Powrót", cue: "Poruszaj się spokojnie", durationMs: 850 },
    { id: "finish", label: "Pozycja startowa", cue: "Rozluźnij napięcie", durationMs: 750 },
  ],
};

const visualizationAssets: Record<string, ExerciseVisualizationAsset> = {
  "Rumuński martwy ciąg": {
    kind: "sprite",
    src: "/exercise-visuals/romanian-deadlift-realistic-female-v01.png",
    frameCount: 5,
    version: "realistic-v01",
  },
};

export function createExerciseVisualization(pattern: MovementPattern, primaryMuscles: MuscleId[], secondaryMuscles: MuscleId[], baseName?: string): ExerciseVisualization {
  return {
    animationAsset: baseName ? visualizationAssets[baseName] : undefined,
    anatomyAsset: "/exercise-visuals/anatomy-female-front-back-v01.png",
    preferredCameraAngle: cameraAngles[pattern],
    primaryMuscles,
    secondaryMuscles,
    movementPhases: defaultPhases[pattern],
  };
}

/** Typy ćwiczenia używane w filtrach biblioteki. */
function inferExerciseTypes(pattern: MovementPattern) {
  if (pattern === "mobility") return ["mobilizacyjne", "rozgrzewkowe"];
  if (pattern === "core") return ["core", "stabilizacyjne"];
  return ["siłowe", "hipertroficzne", "wielostawowe"];
}

const protocolByPattern: Record<MovementPattern, string> = {
  squat: "4 × 8", hinge: "4 × 8", push: "4 × 10", pull: "4 × 10",
  lunge: "3 × 10", core: "3 × 45 s", mobility: "3 × 60 s",
};

export const exerciseLibrary: ExerciseRecord[] = exerciseCatalog.map((entry, index) => {
  const primaryMuscleIds = muscleIdsForNames(entry.primary);
  const secondaryMuscleIds = muscleIdsForNames(entry.secondary);
  return {
    id: `ex-${String(index + 1).padStart(3, "0")}`,
    name: entry.name,
    baseName: entry.name,
    englishName: entry.english,
    aliases: entry.aliases,
    muscle: entry.group,
    primaryMuscles: entry.primary,
    secondaryMuscles: entry.secondary,
    primaryMuscleIds,
    secondaryMuscleIds,
    equipment: entry.equipment,
    equipmentList: [entry.equipment],
    level: entry.level,
    pattern: entry.pattern,
    familyId: entry.group.toLowerCase(),
    familyName: entry.group,
    exerciseTypes: inferExerciseTypes(entry.pattern),
    laterality: /jednorącz|jednonóż|jedn|koncentryczne|bułgarski|wykrok|wejście|bocz/i.test(entry.name) ? "unilateral" : "bilateral",
    tags: [entry.group.toLowerCase(), entry.equipment.toLowerCase()],
    goal: entry.level === "Podstawowy" ? "Technika" : entry.level === "Średni" ? "Masa mięśniowa" : "Siła",
    protocol: protocolByPattern[entry.pattern],
    instruction: entry.instruction,
    cues: [entry.instruction],
    commonMistake: entry.mistake,
    commonMistakes: [entry.mistake],
    visualization: createExerciseVisualization(entry.pattern, primaryMuscleIds, secondaryMuscleIds),
    source: "system" as const,
    active: true,
    used: 0,
  };
});

export const exerciseCategories = ["Wszystkie", ...exerciseGroups];

/**
 * Dobór ćwiczeń pod cel: bierzemy po jednej pozycji z każdego preferowanego
 * wzorca ruchowego na zmianę, nie powtarzając rodziny, dopóki starcza materiału.
 * Dzięki temu plan nie składa się z kilku wariantów tego samego ruchu.
 */
export function suggestExercises(goal: string, limit = 12) {
  const normalized = goal.toLowerCase();
  const preferredPatterns: MovementPattern[] = normalized.includes("mobil") || normalized.includes("ból")
    ? ["mobility", "core", "hinge", "squat"]
    : normalized.includes("sił")
      ? ["squat", "hinge", "push", "pull", "core"]
      : normalized.includes("masa")
        ? ["push", "pull", "squat", "hinge", "lunge"]
        : normalized.includes("redu") || normalized.includes("spraw")
          ? ["squat", "push", "pull", "lunge", "core", "hinge"]
          : ["squat", "hinge", "push", "pull", "core"];

  const byPattern = new Map<MovementPattern, ExerciseRecord[]>();
  for (const pattern of preferredPatterns) {
    byPattern.set(pattern, exerciseLibrary.filter((item) => item.pattern === pattern && item.level !== "Zaawansowany"));
  }

  const picked: ExerciseRecord[] = [];
  const usedGroups = new Set<string>();
  let round = 0;

  while (picked.length < limit && round < 12) {
    let addedThisRound = false;
    for (const pattern of preferredPatterns) {
      if (picked.length >= limit) break;
      const pool = byPattern.get(pattern) ?? [];
      // W pierwszych rundach unikamy powtarzania partii, potem dobieramy resztę.
      const candidate = pool.find((item) => !picked.includes(item) && (round > 0 || !usedGroups.has(item.muscle)))
        ?? pool.find((item) => !picked.includes(item));
      if (!candidate) continue;
      picked.push(candidate);
      usedGroups.add(candidate.muscle);
      addedThisRound = true;
    }
    if (!addedThisRound) break;
    round += 1;
  }

  return picked.slice(0, limit);
}

export type ExerciseFilters = {
  muscles?: string[];
  patterns?: MovementPattern[];
  equipment?: string[];
  levels?: ExerciseRecord["level"][];
  laterality?: ExerciseLaterality[];
  source?: ExerciseSource[];
};

export const movementPatternLabels: Record<MovementPattern, string> = {
  squat: "Squat",
  hinge: "Hinge",
  push: "Push",
  pull: "Pull",
  lunge: "Lunge",
  core: "Core",
  mobility: "Mobility",
};

export const libraryFilterOptions = {
  muscles: Array.from(new Set(exerciseLibrary.flatMap((item) => item.primaryMuscles))).sort((a, b) => a.localeCompare(b, "pl")),
  patterns: Object.keys(movementPatternLabels) as MovementPattern[],
  equipment: Array.from(new Set(exerciseLibrary.flatMap((item) => item.equipmentList))).sort((a, b) => a.localeCompare(b, "pl")),
  levels: ["Podstawowy", "Średni", "Zaawansowany"] as ExerciseRecord["level"][],
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string) {
  if (!a) return b.length;
  if (!b) return a.length;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return previous[b.length];
}

export function scoreExerciseSearch(exercise: ExerciseRecord, rawQuery: string) {
  const query = normalizeSearch(rawQuery);
  if (!query) return exercise.used;
  const name = normalizeSearch(exercise.baseName);
  const english = normalizeSearch(exercise.englishName);
  const aliases = exercise.aliases.map(normalizeSearch);
  const family = normalizeSearch(exercise.familyName);
  const tags = exercise.tags.map(normalizeSearch);
  const muscles = [...exercise.primaryMuscles, ...exercise.secondaryMuscles].map(normalizeSearch);
  const equipment = exercise.equipmentList.map(normalizeSearch);

  if (name === query || english === query) return 10000 + exercise.used;
  if (aliases.includes(query)) return 9000 + exercise.used;
  if (name.startsWith(query) || english.startsWith(query)) return 8000 + exercise.used;
  if (aliases.some((alias) => alias.startsWith(query))) return 7000 + exercise.used;
  if (name.includes(query) || english.includes(query)) return 6000 + exercise.used;
  if (aliases.some((alias) => alias.includes(query))) return 5000 + exercise.used;
  if (family.includes(query)) return 4000 + exercise.used;
  if (tags.some((tag) => tag.includes(query))) return 3000 + exercise.used;
  if (muscles.some((muscle) => muscle.includes(query))) return 2000 + exercise.used;
  if (equipment.some((item) => item.includes(query))) return 1500 + exercise.used;

  const candidates = [name, english, ...aliases];
  const distance = Math.min(...candidates.map((candidate) => levenshtein(candidate.slice(0, Math.max(query.length, 3)), query)));
  return distance <= Math.max(1, Math.floor(query.length / 4)) ? 1000 - distance * 100 + exercise.used : -1;
}

export function filterExercises(exercises: ExerciseRecord[], filters: ExerciseFilters = {}) {
  return exercises.filter((exercise) => {
    if (!exercise.active) return false;
    if (filters.muscles?.length && !filters.muscles.some((muscle) => [...exercise.primaryMuscles, ...exercise.secondaryMuscles].includes(muscle))) return false;
    if (filters.patterns?.length && !filters.patterns.includes(exercise.pattern)) return false;
    if (filters.equipment?.length && !filters.equipment.every((item) => exercise.equipmentList.includes(item))) return false;
    if (filters.levels?.length && !filters.levels.includes(exercise.level)) return false;
    if (filters.laterality?.length && !filters.laterality.includes(exercise.laterality)) return false;
    if (filters.source?.length && !filters.source.includes(exercise.source)) return false;
    return true;
  });
}

export function searchExercises(query: string, options: { exercises?: ExerciseRecord[]; filters?: ExerciseFilters; limit?: number } = {}) {
  const source = filterExercises(options.exercises ?? exerciseLibrary, options.filters);
  return source
    .map((exercise) => ({ exercise, score: scoreExerciseSearch(exercise, query) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score || b.exercise.used - a.exercise.used || a.exercise.baseName.localeCompare(b.exercise.baseName, "pl"))
    .slice(0, options.limit ?? source.length)
    .map((item) => item.exercise);
}

export function getExerciseSubstitutions(exercise: ExerciseRecord, options: { equipment?: string[]; limit?: number } = {}) {
  const available = exerciseLibrary.filter((candidate) => candidate.id !== exercise.id && candidate.active);
  return available
    .map((candidate) => {
      let score = 0;
      if (candidate.familyId === exercise.familyId) score += 50;
      if (candidate.pattern === exercise.pattern) score += 24;
      score += candidate.primaryMuscles.filter((muscle) => exercise.primaryMuscles.includes(muscle)).length * 12;
      score += candidate.secondaryMuscles.filter((muscle) => exercise.secondaryMuscles.includes(muscle)).length * 4;
      if (candidate.laterality === exercise.laterality) score += 7;
      if (candidate.level === exercise.level) score += 5;
      if (options.equipment?.length && candidate.equipmentList.every((item) => options.equipment!.includes(item))) score += 20;
      return { candidate, score };
    })
    .filter((item) => item.score >= 24)
    .sort((a, b) => b.score - a.score || b.candidate.used - a.candidate.used)
    .slice(0, options.limit ?? 6)
    .map((item) => item.candidate);
}
