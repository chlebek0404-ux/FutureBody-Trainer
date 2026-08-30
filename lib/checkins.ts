/**
 * Check-in tygodniowy.
 *
 * Raz w tygodniu podopieczny odpowiada na krótki zestaw pytań o samopoczucie
 * i realizację planu. Trener dostaje jeden raport zamiast rozproszonych
 * wiadomości, a pulpit ma z czego wyliczyć sygnał "wymaga uwagi".
 *
 * Odpowiedzi są zapisywane pod kluczem tygodnia (poniedziałek), więc jeden
 * podopieczny ma najwyżej jeden check-in na tydzień, a ponowne wysłanie
 * nadpisuje poprzedni wpis zamiast tworzyć duplikat.
 */

export type CheckinScaleId = "sleep" | "stress" | "hunger" | "recovery" | "energy" | "adherence";

export type CheckinQuestion = {
  id: CheckinScaleId;
  label: string;
  question: string;
  /** Podpisy skrajnych wartości skali 1–5. */
  low: string;
  high: string;
  /** Czy wysoka wartość jest dobra. Stres i głód czyta się odwrotnie. */
  higherIsBetter: boolean;
};

export const checkinQuestions: CheckinQuestion[] = [
  { id: "sleep", label: "Sen", question: "Jak spałeś w tym tygodniu?", low: "Bardzo źle", high: "Bardzo dobrze", higherIsBetter: true },
  { id: "stress", label: "Stres", question: "Jaki był poziom stresu?", low: "Spokojnie", high: "Bardzo wysoki", higherIsBetter: false },
  { id: "hunger", label: "Głód", question: "Jak duży był głód między posiłkami?", low: "Bez głodu", high: "Ciągły głód", higherIsBetter: false },
  { id: "recovery", label: "Regeneracja", question: "Jak czułeś się przed treningami?", low: "Ciągłe zmęczenie", high: "Pełna gotowość", higherIsBetter: true },
  { id: "energy", label: "Energia", question: "Ile miałeś energii w ciągu dnia?", low: "Bardzo mało", high: "Bardzo dużo", higherIsBetter: true },
  { id: "adherence", label: "Realizacja planu", question: "W jakim stopniu udało się zrealizować plan?", low: "Wcale", high: "W całości", higherIsBetter: true },
];

export type CheckinRecord = {
  id: string;
  clientId: string;
  /** Poniedziałek tygodnia, którego dotyczy check-in (RRRR-MM-DD). */
  weekKey: string;
  submittedAt: string;
  scores: Record<CheckinScaleId, number>;
  /** Waga podana przez podopiecznego, pusta gdy nie mierzył. */
  weight: string;
  note: string;
  reviewedAt: string | null;
  trainerNote: string;
};

export const checkinScaleLabels = ["1", "2", "3", "4", "5"];

function toKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Poniedziałek tygodnia, w którym wypada podana data. */
export function weekKeyFor(date: Date) {
  const next = new Date(date);
  const weekday = next.getDay() || 7;
  next.setDate(next.getDate() - weekday + 1);
  next.setHours(12, 0, 0, 0);
  return toKey(next);
}

export function currentWeekKey() {
  return weekKeyFor(new Date());
}

/** Zakres tygodnia w formie czytelnej dla człowieka: „25–31 sierpnia”. */
export function formatWeekRange(weekKey: string) {
  const start = new Date(`${weekKey}T12:00:00`);
  if (Number.isNaN(start.getTime())) return weekKey;
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const dayOnly = new Intl.DateTimeFormat("pl-PL", { day: "numeric" });
  const full = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long" });
  return sameMonth ? `${dayOnly.format(start)}–${full.format(end)}` : `${full.format(start)} – ${full.format(end)}`;
}

export function emptyScores(): Record<CheckinScaleId, number> {
  return { sleep: 3, stress: 3, hunger: 3, recovery: 3, energy: 3, adherence: 3 };
}

export function createCheckin(clientId: string, weekKey: string): CheckinRecord {
  return {
    id: `checkin-${clientId}-${weekKey}`,
    clientId,
    weekKey,
    submittedAt: new Date().toISOString(),
    scores: emptyScores(),
    weight: "",
    note: "",
    reviewedAt: null,
    trainerNote: "",
  };
}

/**
 * Ogólny wynik tygodnia w procentach. Odpowiedzi, w których wysoka wartość
 * jest niekorzystna, są odwracane, więc 100% zawsze znaczy „bardzo dobry
 * tydzień”, niezależnie od pytania.
 */
export function checkinScore(record: CheckinRecord) {
  const values = checkinQuestions.map((question) => {
    const raw = record.scores[question.id] ?? 3;
    return question.higherIsBetter ? raw : 6 - raw;
  });
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(((average - 1) / 4) * 100);
}

/** Różnica wyniku względem poprzedniego check-inu tego samego podopiecznego. */
export function checkinTrend(records: CheckinRecord[], record: CheckinRecord) {
  const history = records
    .filter((item) => item.clientId === record.clientId && item.weekKey < record.weekKey)
    .sort((a, b) => a.weekKey.localeCompare(b.weekKey));
  const previous = history[history.length - 1];
  return previous ? checkinScore(record) - checkinScore(previous) : null;
}

/** Odpowiedzi, które wymagają rozmowy: 4–5 przy stresie i głodzie, 1–2 przy reszcie. */
export function checkinConcerns(record: CheckinRecord) {
  return checkinQuestions.filter((question) => {
    const value = record.scores[question.id] ?? 3;
    return question.higherIsBetter ? value <= 2 : value >= 4;
  });
}

export function findCheckin(records: CheckinRecord[], clientId: string, weekKey: string) {
  return records.find((item) => item.clientId === clientId && item.weekKey === weekKey) ?? null;
}
