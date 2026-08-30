/**
 * Szablony planów treningowych.
 *
 * Szablon to plan bez przypisanego podopiecznego: układ dni, ćwiczenia
 * i wszystkie parametry serii. Trener zapisuje go raz, a potem przypisuje
 * kolejnym osobom bez przechodzenia przez kreator.
 *
 * Przypisanie zawsze tworzy nowy, niezależny plan — późniejsza zmiana
 * u jednego podopiecznego nie rusza szablonu ani planów pozostałych osób.
 */

import type { TrainingDay, TrainingProgram } from "@/lib/training-programs";

export type PlanTemplate = {
  id: string;
  name: string;
  category: string;
  duration: string;
  /** Notatka trenera: dla kogo ten szablon jest przeznaczony. */
  note: string;
  createdAt: string;
  /** Ile razy szablon został przypisany podopiecznemu. */
  usageCount: number;
  trainingDays: TrainingDay[];
};

/** Kopia dni z nowymi identyfikatorami, żeby plany nie współdzieliły pozycji. */
function cloneDays(days: TrainingDay[], seed: string): TrainingDay[] {
  return days.map((day, dayIndex) => ({
    ...day,
    id: `day-${dayIndex + 1}`,
    items: day.items.map((item, itemIndex) => ({
      ...item,
      id: `item-${seed}-${dayIndex}-${itemIndex}`,
      alternativeIds: [...item.alternativeIds],
    })),
  }));
}

export function createTemplateFromPlan(plan: TrainingProgram, name: string, note = ""): PlanTemplate {
  const id = `template-${Date.now()}`;
  return {
    id,
    name: name.trim() || plan.name,
    category: plan.category,
    duration: plan.duration,
    note: note.trim(),
    createdAt: new Date().toISOString(),
    usageCount: 0,
    trainingDays: cloneDays(plan.trainingDays, id),
  };
}

/** Nowy plan dla wskazanego podopiecznego, zbudowany z szablonu. */
export function createPlanFromTemplate(template: PlanTemplate, clientId: string, name?: string): TrainingProgram {
  const id = `plan-${Date.now()}`;
  const trainingDays = cloneDays(template.trainingDays, id);
  return {
    id,
    name: name?.trim() || template.name,
    category: template.category,
    days: trainingDays.length,
    clients: 1,
    duration: template.duration,
    updated: "Teraz",
    completion: 0,
    exercises: trainingDays.reduce((total, day) => total + day.items.length, 0),
    clientId,
    trainingDays,
  };
}

/**
 * Kopia planu dla innego podopiecznego. Postęp startuje od zera, bo dotyczy
 * osoby, która jeszcze nic z tego planu nie zrobiła.
 */
export function copyPlanToClient(plan: TrainingProgram, clientId: string, name?: string): TrainingProgram {
  const id = `plan-${Date.now()}`;
  const trainingDays = cloneDays(plan.trainingDays, id);
  return {
    ...plan,
    id,
    name: name?.trim() || plan.name,
    clientId,
    completion: 0,
    updated: "Teraz",
    days: trainingDays.length,
    exercises: trainingDays.reduce((total, day) => total + day.items.length, 0),
    trainingDays,
  };
}

export function templateSummary(template: PlanTemplate) {
  const exercises = template.trainingDays.reduce((total, day) => total + day.items.length, 0);
  return { days: template.trainingDays.length, exercises };
}
