/**
 * Słowniki biblioteki: mięśnie, sprzęt, wzorce ruchowe, cele i filtry.
 * Jedno miejsce prawdy — etykiety w interfejsie i filtry biorą się stąd.
 */

import type { ExerciseCategory, MovementPattern, MuscleId } from "@/lib/exercises/types";

export const muscleLabels: Record<MuscleId, string> = {
  pectoralisMajor: "Klatka piersiowa",
  upperChest: "Górna część klatki",
  latissimusDorsi: "Najszerszy grzbietu",
  trapezius: "Czworoboczny",
  anteriorDeltoid: "Przedni akton barku",
  lateralDeltoid: "Boczny akton barku",
  posteriorDeltoid: "Tylny akton barku",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Przedramiona",
  rectusAbdominis: "Prosty brzucha",
  obliques: "Skośne brzucha",
  erectorSpinae: "Prostowniki grzbietu",
  gluteusMaximus: "Pośladkowy wielki",
  quadriceps: "Czworogłowy uda",
  hamstrings: "Dwugłowy uda",
  adductors: "Przywodziciele",
  abductors: "Odwodziciele",
  calves: "Łydki",
};

export const movementPatternLabels: Record<MovementPattern, string> = {
  squat: "Przysiad",
  hinge: "Zawias biodrowy",
  lunge: "Wykrok",
  "horizontal-push": "Pchanie poziome",
  "vertical-push": "Pchanie pionowe",
  "horizontal-pull": "Ciągnięcie poziome",
  "vertical-pull": "Ciągnięcie pionowe",
  carry: "Przenoszenie",
  rotation: "Rotacja",
  "anti-rotation": "Antyrotacja",
  flexion: "Zgięcie tułowia",
  "anti-extension": "Antywyprost",
  "lateral-flexion": "Zgięcie boczne",
  locomotion: "Przemieszczanie",
  jump: "Skok",
  throw: "Rzut",
  isolation: "Izolacja",
  mobility: "Mobilność",
  cardio: "Wydolność",
  recovery: "Regeneracja",
};

/** Kategorie w kolejności wyświetlania. */
export const exerciseCategories: ExerciseCategory[] = [
  "Klatka", "Plecy", "Barki", "Biceps", "Triceps", "Przedramiona",
  "Czworogłowe", "Dwugłowe", "Pośladki", "Przywodziciele", "Łydki",
  "Brzuch", "Prostowniki", "Mobilność", "Funkcjonalne",
  "Trójbój", "Ciężary olimpijskie", "Cardio", "Regeneracja",
];

/** Sprzęt pogrupowany tak, jak wygląda wyposażenie siłowni. */
export const equipmentGroups: { label: string; items: string[] }[] = [
  { label: "Wolne ciężary", items: ["Sztanga", "Sztanga EZ", "Trap bar", "Safety squat bar", "Hantle", "Kettlebell", "Talerze"] },
  { label: "Ławki i stojaki", items: ["Ławka płaska", "Ławka regulowana", "Stojaki", "Klatka treningowa", "Skrzynia plyometryczna", "Step"] },
  { label: "Maszyny", items: ["Smith machine", "Maszyna stosowa", "Maszyna plate-loaded", "Chest press", "Shoulder press", "Lat pulldown", "Seated row", "Pec deck", "Reverse pec deck", "Leg press", "Hack squat", "Pendulum squat", "Belt squat", "Leg extension", "Leg curl siedząc", "Leg curl leżąc", "Maszyna przywodzicieli", "Maszyna odwodzicieli", "Maszyna do łydek", "Maszyna hip thrust", "Glute kickback", "Maszyna dip"] },
  { label: "Wyciągi", items: ["Brama kablowa", "Wyciąg górny", "Wyciąg dolny", "Landmine"] },
  { label: "Masa ciała i akcesoria", items: ["Masa ciała", "Drążek", "Poręcze", "TRX", "Guma oporowa", "Miniband", "Piłka fitness", "Piłka lekarska", "BOSU", "Mata", "Wałek", "Kij"] },
  { label: "Motoryka i cardio", items: ["Sled", "Battle ropes", "Skakanka", "Bieżnia", "Rower stacjonarny", "Air bike", "Ergometr wioślarski", "SkiErg", "Orbitrek", "Schody treningowe", "Stepper", "Drabinka koordynacyjna"] },
];

export const allEquipment = equipmentGroups.flatMap((group) => group.items);

export const trainingGoals = [
  "Siła",
  "Masa mięśniowa",
  "Redukcja",
  "Wytrzymałość",
  "Sprawność",
  "Mobilność",
  "Technika",
  "Regeneracja",
];

/** Szybkie filtry nad listą — jeden klik zamiast trzech pól. */
export type QuickFilter = {
  id: string;
  label: string;
  match: (exercise: { category: ExerciseCategory; pattern: MovementPattern; equipment: string[] }) => boolean;
};

const upperBody: ExerciseCategory[] = ["Klatka", "Plecy", "Barki", "Biceps", "Triceps", "Przedramiona"];
const lowerBody: ExerciseCategory[] = ["Czworogłowe", "Dwugłowe", "Pośladki", "Przywodziciele", "Łydki"];
const pushPatterns: MovementPattern[] = ["horizontal-push", "vertical-push"];
const pullPatterns: MovementPattern[] = ["horizontal-pull", "vertical-pull"];

export const quickFilters: QuickFilter[] = [
  { id: "all", label: "Wszystkie", match: () => true },
  { id: "upper", label: "Góra", match: (item) => upperBody.includes(item.category) },
  { id: "lower", label: "Dół", match: (item) => lowerBody.includes(item.category) },
  { id: "push", label: "Push", match: (item) => pushPatterns.includes(item.pattern) },
  { id: "pull", label: "Pull", match: (item) => pullPatterns.includes(item.pattern) },
  { id: "core", label: "Core", match: (item) => item.category === "Brzuch" || item.pattern === "anti-rotation" || item.pattern === "anti-extension" },
  { id: "mobility", label: "Mobilność", match: (item) => item.category === "Mobilność" || item.pattern === "mobility" },
  { id: "cardio", label: "Cardio", match: (item) => item.category === "Cardio" || item.pattern === "cardio" },
  { id: "bodyweight", label: "Bez sprzętu", match: (item) => item.equipment.length === 1 && item.equipment[0] === "Masa ciała" },
  { id: "dumbbell", label: "Hantle", match: (item) => item.equipment.includes("Hantle") },
  { id: "barbell", label: "Sztanga", match: (item) => item.equipment.some((name) => name.startsWith("Sztanga")) },
  { id: "machine", label: "Maszyny", match: (item) => item.equipment.some((name) => name.includes("Maszyna") || name.includes("press") || name.includes("squat") || name.includes("curl") || name.includes("row") || name.includes("deck") || name === "Smith machine") },
  { id: "cable", label: "Wyciągi", match: (item) => item.equipment.some((name) => name.includes("Wyciąg") || name === "Brama kablowa" || name === "Landmine") },
];
