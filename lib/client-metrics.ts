/**
 * Wskaźniki podopiecznego liczone z zapisanych danych.
 *
 * Karta podopiecznego trzymała wcześniej gotowe napisy i liczby — „Brak planu”,
 * najbliższy termin, procent realizacji — ustawiane w chwili jakiejś akcji
 * i później nieaktualizowane. Wystarczyło odwołać trening albo usunąć plan,
 * żeby aplikacja pokazywała nieprawdę.
 *
 * Wszystko poniżej wynika wprost z list planów, terminów i historii treningów.
 * Gdy czegoś nie da się wyliczyć, funkcja zwraca `null`, a widok pokazuje
 * uczciwy myślnik zamiast wymyślonej wartości.
 */

import type { CalendarAppointment } from "@/lib/demo-data";
import type { TrainingProgram, WorkoutCompletion } from "@/lib/training-programs";

function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const weekday = next.getDay() || 7;
  next.setDate(next.getDate() - weekday + 1);
  next.setHours(0, 0, 0, 0);
  return next;
}

/** Aktywny plan podopiecznego albo `null`, gdy żadnego nie ma. */
export function planForClient(clientId: string, plans: TrainingProgram[]) {
  return plans.find((plan) => plan.clientId === clientId) ?? null;
}

/** Nazwa planu do wyświetlenia na liście i w profilu. */
export function planLabel(clientId: string, plans: TrainingProgram[]) {
  return planForClient(clientId, plans)?.name ?? "Brak planu";
}

/**
 * Najbliższy zaplanowany termin. Liczony za każdym razem od bieżącej chwili,
 * więc nie zostaje na ekranie po tym, jak trening się odbył albo został
 * odwołany.
 */
export function nextSession(clientId: string, appointments: CalendarAppointment[], now: Date) {
  const todayKey = dayKey(now);
  const upcoming = appointments
    .filter((item) => item.clientId === clientId && item.status !== "Anulowany" && item.status !== "Wykonany")
    .filter((item) => item.date > todayKey || (item.date === todayKey && item.hour >= now.getHours()))
    .sort((a, b) => `${a.date}${String(a.hour).padStart(2, "0")}`.localeCompare(`${b.date}${String(b.hour).padStart(2, "0")}`));
  return upcoming[0] ?? null;
}

export function nextSessionLabel(clientId: string, appointments: CalendarAppointment[], now: Date) {
  const appointment = nextSession(clientId, appointments, now);
  if (!appointment) return "Brak terminu";
  const date = new Date(`${appointment.date}T12:00:00`);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const hour = `${String(appointment.hour).padStart(2, "0")}:00`;
  if (appointment.date === dayKey(now)) return `Dziś, ${hour}`;
  if (appointment.date === dayKey(tomorrow)) return `Jutro, ${hour}`;
  return `${new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long" }).format(date)}, ${hour}`;
}

/**
 * Realizacja planu w bieżącym tygodniu: ile jednostek z planu zostało
 * zapisanych, licząc od poniedziałku. Bez planu nie ma czego realizować,
 * więc wynik jest pusty.
 */
export function weeklyRealisation(clientId: string, plans: TrainingProgram[], history: WorkoutCompletion[], now: Date) {
  const plan = planForClient(clientId, plans);
  if (!plan || !plan.trainingDays.length) return null;
  const from = dayKey(startOfWeek(now));
  const done = history.filter((entry) => entry.clientId === clientId && entry.completedAt.slice(0, 10) >= from).length;
  return { done, planned: plan.trainingDays.length, percent: Math.min(100, Math.round((done / plan.trainingDays.length) * 100)) };
}

/**
 * Frekwencja: ile minionych terminów skończyło się zapisanym treningiem.
 * Bez minionych terminów nie ma z czego liczyć.
 */
export function attendance(clientId: string, appointments: CalendarAppointment[], history: WorkoutCompletion[], now: Date) {
  const todayKey = dayKey(now);
  const past = appointments.filter((item) => {
    if (item.clientId !== clientId || item.status === "Anulowany") return false;
    return item.date < todayKey || (item.date === todayKey && item.hour + 1 <= now.getHours());
  });
  if (!past.length) return null;
  const attended = past.filter((item) =>
    item.status === "Wykonany" || history.some((entry) => entry.clientId === clientId && entry.completedAt.slice(0, 10) === item.date),
  ).length;
  return { attended, total: past.length, percent: Math.round((attended / past.length) * 100) };
}

/**
 * Odstęp w dniach kalendarzowych, nie w dobach.
 *
 * Trening z wczorajszego wieczora dzieli od dzisiejszego popołudnia mniej niż
 * dwadzieścia cztery godziny, więc licząc czas w milisekundach wychodziło
 * „dzisiaj”. Dla trenera liczy się data, nie liczba godzin.
 */
export function calendarDaysBetween(from: Date, to: Date) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Data ostatniego zapisanego treningu w formie czytelnej dla trenera. */
export function lastActivityLabel(clientId: string, history: WorkoutCompletion[], now: Date) {
  const entries = history
    .filter((entry) => entry.clientId === clientId)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  if (!entries.length) return "Brak zapisanych treningów";
  const days = calendarDaysBetween(new Date(entries[0].completedAt), now);
  if (days <= 0) return "Trening dzisiaj";
  if (days === 1) return "Trening wczoraj";
  return `Trening ${days} dni temu`;
}
