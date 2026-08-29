import { exerciseLibrary, type MovementPattern } from "@/lib/exercises";
import { createTrainingProgram, type TrainingProgram } from "@/lib/training-programs";
import type { CalendarAppointment, Client, ClientInvitation, TrainerTask } from "@/lib/demo-data";

/**
 * Tryb podglądu służy wyłącznie do recenzji interfejsu przed podłączeniem backendu.
 * Nie jest funkcją produktu i musi być niedostępny na produkcji.
 *
 * Wymaga JEDNOCZEŚNIE dwóch warunków:
 *   1. Supabase nie jest skonfigurowany — przy prawdziwej bazie ta ścieżka jest martwa;
 *   2. build jest developerski albo eksportem HTML do recenzji.
 *
 * Produkcyjny `vinext build` nie ustawia flagi, więc konta podglądu w nim nie istnieją.
 */
export const previewTrainerEmail = "demo@movendo.pl";
export const previewClientEmail = "client@movendo.pl";
const previewPassword = "demo1234";

export type PreviewRole = "trainer" | "client";

export const previewClientId = "preview-client-anna";

/** Czy build w ogóle dopuszcza tryb podglądu. Sprawdzane obok braku Supabase. */
export function isPreviewBuild() {
  return process.env.NEXT_PUBLIC_PREVIEW_MODE === "1" || process.env.NODE_ENV !== "production";
}

export function matchPreviewAccount(email: string, password: string): PreviewRole | null {
  const normalized = email.trim().toLowerCase();
  if (password !== previewPassword) return null;
  if (normalized === previewTrainerEmail) return "trainer";
  if (normalized === previewClientEmail) return "client";
  return null;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftedKey(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return dateKey(date);
}

function formatToday(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return new Intl.DateTimeFormat("pl-PL").format(date);
}

/**
 * Dobiera po jednym ćwiczeniu na wzorzec ruchowy i rodzinę, żeby dzień treningowy
 * nie składał się z kilku wariantów tego samego ruchu.
 */
function pickVariedExercises(patterns: MovementPattern[], perPattern: number) {
  const usedFamilies = new Set<string>();
  const picked: string[] = [];

  for (let round = 0; round < perPattern; round += 1) {
    for (const pattern of patterns) {
      const match = exerciseLibrary.find(
        (exercise) =>
          exercise.pattern === pattern &&
          exercise.level !== "Zaawansowany" &&
          !usedFamilies.has(exercise.category),
      );
      if (!match) continue;
      usedFamilies.add(match.category);
      picked.push(match.id);
    }
  }

  return picked;
}

export type PreviewWorkspace = {
  clients: Client[];
  tasks: TrainerTask[];
  plans: TrainingProgram[];
  appointments: CalendarAppointment[];
  invitations: ClientInvitation[];
};

/** Zestaw danych do recenzji interfejsu, budowany na żywo. Nigdy nie trafia do bazy. */
export function buildPreviewWorkspace(): PreviewWorkspace {
  const clients: Client[] = [
    {
      id: previewClientId,
      name: "Anna Kowalska",
      initials: "AK",
      email: previewClientEmail,
      phone: "+48 601 200 300",
      status: "Aktywny",
      goal: "Redukcja tkanki tłuszczowej",
      plan: "Redukcja · 3 dni",
      nextSession: "Dziś, 17:00",
      progress: 62,
      joined: formatToday(-96),
      lastCheckin: "2 dni temu",
      weight: "64,2 kg",
      bodyFat: "24,1%",
      attendance: "92%",
      tags: ["Redukcja", "Trening 3×/tydz."],
    },
    {
      id: "demo-client-marek",
      name: "Marek Nowicki",
      initials: "MN",
      email: "marek.nowicki@example.com",
      phone: "+48 602 410 118",
      status: "Aktywny",
      goal: "Budowa siły",
      plan: "Siła · 4 dni",
      nextSession: "Jutro, 07:00",
      progress: 48,
      joined: formatToday(-58),
      lastCheckin: "5 dni temu",
      weight: "88,6 kg",
      bodyFat: "18,4%",
      attendance: "85%",
      tags: ["Siła", "Poranne treningi"],
    },
    {
      id: "demo-client-julia",
      name: "Julia Wrona",
      initials: "JW",
      email: "julia.wrona@example.com",
      phone: "+48 660 774 902",
      status: "Do kontaktu",
      goal: "Powrót do ruchu po kontuzji",
      plan: "Brak planu",
      nextSession: "Brak terminu",
      progress: 12,
      joined: formatToday(-11),
      lastCheckin: "Brak",
      weight: "58,0 kg",
      bodyFat: "26,8%",
      attendance: "—",
      tags: ["Nowy podopieczny", "Mobilność"],
    },
  ];

  const plans: TrainingProgram[] = [
    createTrainingProgram({
      id: "demo-plan-redukcja",
      name: "Anna · Redukcja tkanki tłuszczowej",
      category: "Redukcja",
      dayCount: 3,
      clientId: previewClientId,
      exerciseIds: pickVariedExercises(["squat", "horizontal-push", "vertical-pull", "anti-extension", "lunge", "hinge"], 2),
      duration: "12 tyg.",
    }),
    createTrainingProgram({
      id: "demo-plan-sila",
      name: "Marek · Budowa siły",
      category: "Siła",
      dayCount: 4,
      clientId: "demo-client-marek",
      exerciseIds: pickVariedExercises(["squat", "hinge", "horizontal-push", "horizontal-pull", "anti-extension"], 3),
      duration: "8 tyg.",
    }),
  ];

  const appointments: CalendarAppointment[] = [
    { id: "demo-appt-1", clientId: previewClientId, date: shiftedKey(0), hour: 17, kind: "Trening personalny", status: "Zaplanowany" },
    { id: "demo-appt-2", clientId: "demo-client-marek", date: shiftedKey(1), hour: 7, kind: "Trening personalny", status: "Zaplanowany" },
    { id: "demo-appt-3", clientId: previewClientId, date: shiftedKey(-2), hour: 17, kind: "Trening personalny", status: "Wykonany" },
    { id: "demo-appt-4", clientId: "demo-client-julia", date: shiftedKey(3), hour: 12, kind: "Konsultacja wstępna", status: "Zaplanowany" },
  ];

  const tasks: TrainerTask[] = [
    { id: "demo-task-1", title: "Przygotuj plan dla Julii Wrony", due: formatToday(1), category: "Plany", priority: "Wysoki", done: false },
    { id: "demo-task-2", title: "Sprawdź check-in Anny Kowalskiej", due: formatToday(0), category: "Check-iny", priority: "Średni", done: false },
    { id: "demo-task-3", title: "Podsumowanie tygodnia dla Marka", due: formatToday(2), category: "Raporty", priority: "Niski", done: true },
  ];

  const invitations: ClientInvitation[] = [];

  return { clients, tasks, plans, appointments, invitations };
}
