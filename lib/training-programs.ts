import { exerciseLibrary, getExerciseSubstitutions } from "@/lib/exercises";

export type ProgramExercise = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: string;
  load: string;
  tempo: string;
  rpe: string;
  rir: string;
  restSeconds: number;
  note: string;
  alternativeIds: string[];
};

export type TrainingDay = {
  id: string;
  name: string;
  focus: string;
  items: ProgramExercise[];
};

export type TrainingProgram = {
  id: string;
  name: string;
  category: string;
  days: number;
  clients: number;
  duration: string;
  updated: string;
  completion: number;
  exercises: number;
  clientId: string;
  trainingDays: TrainingDay[];
};

export type WorkoutSetResult = {
  setNumber: number;
  reps: string;
  load: string;
  completed: boolean;
};

export type WorkoutExerciseResult = {
  itemId: string;
  exerciseId: string;
  sets: WorkoutSetResult[];
  actualRpe: string;
  note: string;
};

export type WorkoutCompletion = {
  id: string;
  clientId: string;
  planId: string;
  dayId: string;
  completedAt: string;
  results: WorkoutExerciseResult[];
};

/** Krótki opis dnia zbudowany z partii ćwiczeń, które w nim są. */
function describeDay(exerciseIds: string[]) {
  const groups = exerciseIds
    .map((id) => exerciseLibrary.find((exercise) => exercise.id === id)?.muscle)
    .filter((group): group is string => Boolean(group));
  const unique = Array.from(new Set(groups));
  if (!unique.length) return "Trening";
  if (unique.length <= 2) return unique.join(" i ");
  return `${unique.slice(0, 2).join(", ")} i więcej`;
}

/** Buduje pozycje jednego dnia z listy identyfikatorów ćwiczeń. */
function buildDayItems(dayIndex: number, exerciseIds: string[]): ProgramExercise[] {
  return exerciseIds.map((exerciseId, itemIndex) => {
    const exercise = exerciseLibrary.find((candidate) => candidate.id === exerciseId) ?? exerciseLibrary[0];
    return {
      id: `item-${dayIndex}-${itemIndex}-${exercise.id}`,
      exerciseId: exercise.id,
      sets: exercise.level === "Zaawansowany" ? 4 : 3,
      reps: exercise.protocol.includes("×") ? exercise.protocol.split("×")[1]?.trim() || "8" : "8–12",
      load: "Dobierz wg RPE",
      tempo: exercise.level === "Podstawowy" ? "2-1-2" : "3-1-1",
      rpe: "7",
      rir: "3",
      restSeconds: exercise.pattern === "squat" || exercise.pattern === "hinge" ? 120 : 75,
      note: exercise.instruction,
      alternativeIds: getExerciseSubstitutions(exercise, { limit: 3 }).map((candidate) => candidate.id),
    };
  });
}

/**
 * Dni zbudowane z jawnego podziału: jedna lista ćwiczeń na jeden dzień.
 * Trener decyduje, co trafia do którego dnia — nic nie jest rozdzielane losowo.
 */
export function createTrainingDaysFromPlan(dayPlans: string[][]): TrainingDay[] {
  return dayPlans.slice(0, 7).map((exerciseIds, dayIndex) => ({
    id: `day-${dayIndex + 1}`,
    name: `Dzień ${dayIndex + 1}`,
    focus: describeDay(exerciseIds),
    items: buildDayItems(dayIndex, exerciseIds),
  }));
}

/**
 * Dni zbudowane z jednej listy: ćwiczenia rozkładane po kolei na wszystkie dni.
 * Używane przez ścieżkę generowaną pod cel.
 */
export function createTrainingDays(dayCount: number, exerciseIds: string[]): TrainingDay[] {
  const safeDayCount = Math.max(1, Math.min(dayCount, 7));
  const sourceIds = exerciseIds.length ? exerciseIds : exerciseLibrary.slice(0, 6).map((exercise) => exercise.id);

  return createTrainingDaysFromPlan(
    Array.from({ length: safeDayCount }, (_, dayIndex) => {
      const distributed = sourceIds.filter((_, exerciseIndex) => exerciseIndex % safeDayCount === dayIndex);
      return distributed.length ? distributed : [sourceIds[dayIndex % sourceIds.length]];
    }),
  );
}

export function createTrainingProgram(input: {
  id?: string;
  name: string;
  category: string;
  dayCount: number;
  clientId: string;
  /** Płaska lista rozkładana po kolei na dni. */
  exerciseIds?: string[];
  /** Jawny podział: jedna lista na dzień. Ma pierwszeństwo przed `exerciseIds`. */
  dayExerciseIds?: string[][];
  duration?: string;
}): TrainingProgram {
  const trainingDays = input.dayExerciseIds
    ? createTrainingDaysFromPlan(input.dayExerciseIds)
    : createTrainingDays(input.dayCount, input.exerciseIds ?? []);
  return {
    id: input.id ?? `plan-${Date.now()}`,
    name: input.name,
    category: input.category,
    days: trainingDays.length,
    clients: 1,
    duration: input.duration ?? "8 tyg.",
    updated: "Teraz",
    completion: 0,
    exercises: trainingDays.reduce((total, day) => total + day.items.length, 0),
    clientId: input.clientId,
    trainingDays,
  };
}

export const initialTrainingPrograms: TrainingProgram[] = [];
