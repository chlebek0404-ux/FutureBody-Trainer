import { exerciseLibrary, getExerciseSubstitutions } from "@/lib/exercise-library";

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

export function createTrainingDays(dayCount: number, exerciseIds: string[]): TrainingDay[] {
  const safeDayCount = Math.max(1, Math.min(dayCount, 7));
  const sourceIds = exerciseIds.length ? exerciseIds : exerciseLibrary.slice(0, 6).map((exercise) => exercise.id);
  const dayNames = ["Dzień A", "Dzień B", "Dzień C", "Dzień D", "Dzień E", "Dzień F", "Dzień G"];
  const focuses = ["Siła całego ciała", "Góra ciała", "Dół ciała", "Technika i core", "Objętość", "Kondycja", "Mobilność"];

  return Array.from({ length: safeDayCount }, (_, dayIndex) => {
    const distributed = sourceIds.filter((_, exerciseIndex) => exerciseIndex % safeDayCount === dayIndex);
    const dayExercises = distributed.length ? distributed : [sourceIds[dayIndex % sourceIds.length]];
    return {
      id: `day-${dayIndex + 1}`,
      name: dayNames[dayIndex],
      focus: focuses[dayIndex],
      items: dayExercises.map((exerciseId, itemIndex) => {
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
      }),
    };
  });
}

export function createTrainingProgram(input: {
  id?: string;
  name: string;
  category: string;
  dayCount: number;
  clientId: string;
  exerciseIds: string[];
  duration?: string;
}): TrainingProgram {
  const trainingDays = createTrainingDays(input.dayCount, input.exerciseIds);
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
