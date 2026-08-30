/**
 * Rezerwacja terminów przez podopiecznego.
 *
 * Trener ustala, w jakich godzinach przyjmuje i czy podopieczni mogą się
 * zapisywać sami. Gdy rezerwacja jest wyłączona, panel podopiecznego w ogóle
 * nie pokazuje zapisów — terminy dodaje wtedy wyłącznie trener.
 *
 * Wolny termin to godzina z dostępności, która nie jest już zajęta i nie
 * minęła. Nic nie jest tu zgadywane: lista powstaje z ustawień trenera
 * i z zapisanych terminów.
 */

import type { CalendarAppointment } from "@/lib/demo-data";

export type BookingSettings = {
  /** Czy podopieczni mogą sami zapisywać się na wolne godziny. */
  enabled: boolean;
  /** Dni tygodnia, w których trener przyjmuje. 1 = poniedziałek, 7 = niedziela. */
  weekdays: number[];
  /** Pierwsza i ostatnia godzina rozpoczęcia treningu. */
  startHour: number;
  endHour: number;
  /** Ile godzin przed terminem można się jeszcze zapisać. */
  noticeHours: number;
  /** Jak daleko w przód widać wolne terminy. */
  horizonDays: number;
};

export const defaultBookingSettings: BookingSettings = {
  enabled: false,
  weekdays: [1, 2, 3, 4, 5],
  startHour: 7,
  endHour: 20,
  noticeHours: 12,
  horizonDays: 14,
};

export const weekdayNames = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
export const weekdayShort = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

export function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type FreeSlot = { date: string; hour: number; time: number };

/**
 * Wolne godziny w najbliższych dniach.
 *
 * Pomijamy terminy już zajęte przez kogokolwiek oraz te, do których zostało
 * mniej czasu niż wymagane wyprzedzenie. Terminy anulowane zwalniają godzinę.
 */
export function freeSlots(settings: BookingSettings, appointments: CalendarAppointment[], now: Date): FreeSlot[] {
  if (!settings.enabled) return [];

  const taken = new Set(
    appointments
      .filter((item) => item.status !== "Anulowany")
      .map((item) => `${item.date}|${item.hour}`),
  );
  const earliest = now.getTime() + settings.noticeHours * 3_600_000;
  const slots: FreeSlot[] = [];

  for (let offset = 0; offset < settings.horizonDays; offset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const weekday = date.getDay() || 7;
    if (!settings.weekdays.includes(weekday)) continue;

    const key = dayKey(date);
    for (let hour = settings.startHour; hour <= settings.endHour; hour += 1) {
      if (taken.has(`${key}|${hour}`)) continue;
      const time = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour).getTime();
      if (time < earliest) continue;
      slots.push({ date: key, hour, time });
    }
  }

  return slots;
}

/** Wolne godziny pogrupowane po dniach, gotowe do wyświetlenia. */
export function groupSlotsByDay(slots: FreeSlot[]) {
  const days = new Map<string, FreeSlot[]>();
  for (const slot of slots) {
    const list = days.get(slot.date) ?? [];
    list.push(slot);
    days.set(slot.date, list);
  }
  return [...days.entries()].map(([date, hours]) => ({ date, hours }));
}

export function formatDayLabel(date: string, now: Date) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  if (dayKey(parsed) === dayKey(now)) return "Dzisiaj";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (dayKey(parsed) === dayKey(tomorrow)) return "Jutro";
  return new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long" }).format(parsed);
}

/** Czy podopieczny wciąż może odwołać ten termin sam. */
export function canCancel(appointment: CalendarAppointment, settings: BookingSettings, now: Date) {
  if (appointment.status === "Anulowany" || appointment.status === "Wykonany") return false;
  const time = new Date(`${appointment.date}T${String(appointment.hour).padStart(2, "0")}:00:00`).getTime();
  return time - now.getTime() >= settings.noticeHours * 3_600_000;
}
