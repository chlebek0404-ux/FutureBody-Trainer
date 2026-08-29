/**
 * Pomocnik budowy katalogu.
 *
 * Wpis podaje wyłącznie to, co odróżnia ćwiczenie; resztę uzupełniają
 * wartości domyślne. Dzięki temu opisy pozostają kompletne, a plik katalogu
 * czytelny — bez powtarzania tych samych pól przy każdej pozycji.
 */

import type { Exercise, ExerciseCategory, ExerciseLevel, Laterality, MovementPattern, MuscleId, TrainingParameter } from "@/lib/exercises/types";

export type Draft = {
  slug: string;
  name: string;
  en: string;
  pattern: MovementPattern;
  primary: MuscleId[];
  secondary?: MuscleId[];
  equipment: string[];
  level?: ExerciseLevel;
  laterality?: Laterality;
  compound?: boolean;
  goals?: string[];
  aliases?: string[];
  start: string;
  steps: string[];
  breathing?: string;
  mistakes: string[];
  cues?: string[];
  rom?: string;
  precautions?: string[];
  regression?: string | null;
  progression?: string | null;
  substitutions?: string[];
  parameters?: TrainingParameter[];
  protocol?: string;
  supervision?: boolean;
};

const strengthParameters: TrainingParameter[] = ["serie", "powtorzenia", "ciezar", "rpe", "rir", "tempo", "przerwa"];

/** Domyślne oddychanie dla ruchu siłowego: wdech w fazie ustępującej. */
const defaultBreathing = "Wdech przy opuszczaniu ciężaru, wydech w fazie pokonującej. Nie wstrzymuj oddechu dłużej niż jedno powtórzenie.";

export function buildCategory(category: ExerciseCategory, drafts: Draft[]): Exercise[] {
  return drafts.map((draft, index) => ({
    id: `${category.toLowerCase().replace(/[^a-z]/g, "")}-${String(index + 1).padStart(3, "0")}`,
    slug: draft.slug,
    name: draft.name,
    englishName: draft.en,
    aliases: draft.aliases ?? [],
    category,
    pattern: draft.pattern,
    primaryMuscles: draft.primary,
    secondaryMuscles: draft.secondary ?? [],
    equipment: draft.equipment,
    level: draft.level ?? "Średni",
    laterality: draft.laterality ?? "obustronne",
    compound: draft.compound ?? true,
    goals: draft.goals ?? ["Masa mięśniowa", "Siła"],
    startPosition: draft.start,
    steps: draft.steps,
    breathing: draft.breathing ?? defaultBreathing,
    mistakes: draft.mistakes,
    cues: draft.cues ?? [],
    rangeOfMotion: draft.rom ?? "Pełny zakres, w którym utrzymujesz kontrolę i pozycję.",
    precautions: draft.precautions ?? [],
    regression: draft.regression ?? null,
    progression: draft.progression ?? null,
    substitutions: draft.substitutions ?? [],
    parameters: draft.parameters ?? strengthParameters,
    defaultProtocol: draft.protocol ?? "3 × 8–12",
    mediaPath: null,
    source: "system" as const,
    requiresSupervision: draft.supervision ?? false,
  }));
}
