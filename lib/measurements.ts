/**
 * Pomiary sylwetki.
 *
 * Obok masy ciała i tkanki tłuszczowej trener zapisuje obwody. Każdy pomiar
 * to jeden wpis z datą, a moduł zamienia listę wpisów w serię gotową do
 * narysowania i w podsumowanie zmiany.
 *
 * Wszystko liczy się wyłącznie z zapisanych wartości. Brakujący pomiar nie
 * jest uzupełniany ani interpolowany — po prostu nie ma go w serii.
 */

export type MetricId =
  | "weight" | "bodyFat"
  | "chest" | "waist" | "hips" | "neck"
  | "armLeft" | "armRight" | "thighLeft" | "thighRight" | "calf";

export type MetricDefinition = {
  id: MetricId;
  label: string;
  unit: string;
  /** Podpowiedź, gdzie mierzyć — żeby kolejne pomiary były porównywalne. */
  hint: string;
  group: "Podstawowe" | "Obwody";
};

export const metricDefinitions: MetricDefinition[] = [
  { id: "weight", label: "Masa ciała", unit: "kg", hint: "Rano, na czczo, po toalecie.", group: "Podstawowe" },
  { id: "bodyFat", label: "Tkanka tłuszczowa", unit: "%", hint: "Ta sama metoda pomiaru za każdym razem.", group: "Podstawowe" },
  { id: "chest", label: "Klatka piersiowa", unit: "cm", hint: "Na wysokości brodawek, na wydechu.", group: "Obwody" },
  { id: "waist", label: "Talia", unit: "cm", hint: "W najwęższym miejscu, bez wciągania brzucha.", group: "Obwody" },
  { id: "hips", label: "Biodra", unit: "cm", hint: "W najszerszym miejscu pośladków.", group: "Obwody" },
  { id: "neck", label: "Kark", unit: "cm", hint: "Poniżej krtani, taśma poziomo.", group: "Obwody" },
  { id: "armLeft", label: "Ramię lewe", unit: "cm", hint: "W najszerszym miejscu, ręka rozluźniona.", group: "Obwody" },
  { id: "armRight", label: "Ramię prawe", unit: "cm", hint: "W najszerszym miejscu, ręka rozluźniona.", group: "Obwody" },
  { id: "thighLeft", label: "Udo lewe", unit: "cm", hint: "W najszerszym miejscu, tuż pod pośladkiem.", group: "Obwody" },
  { id: "thighRight", label: "Udo prawe", unit: "cm", hint: "W najszerszym miejscu, tuż pod pośladkiem.", group: "Obwody" },
  { id: "calf", label: "Łydka", unit: "cm", hint: "W najszerszym miejscu.", group: "Obwody" },
];

export const metricById = new Map(metricDefinitions.map((item) => [item.id, item]));

/** Liczba z pola tekstowego. Przecinek dziesiętny jest dopuszczalny. */
export function parseValue(raw: string | undefined) {
  if (!raw) return null;
  const parsed = Number.parseFloat(raw.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatValue(value: number) {
  return new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1 }).format(value);
}

export type MeasurementLike = {
  id: string;
  clientId: string;
  date: string;
  measuredAt?: string;
  weight: string;
  bodyFat: string;
  note: string;
  circumferences?: Partial<Record<MetricId, string>>;
};

/**
 * Moment pomiaru w formie porównywalnej. Starsze wpisy mają tylko datę
 * w formacie polskim (`30.08.2026`), więc rozpoznajemy oba zapisy.
 */
export function measuredTime(entry: MeasurementLike) {
  if (entry.measuredAt) {
    const parsed = new Date(entry.measuredAt).getTime();
    if (Number.isFinite(parsed)) return parsed;
  }
  const match = entry.date.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 12).getTime();
  const fallback = new Date(entry.date).getTime();
  return Number.isFinite(fallback) ? fallback : 0;
}

export function readMetric(entry: MeasurementLike, metric: MetricId) {
  if (metric === "weight") return parseValue(entry.weight);
  if (metric === "bodyFat") return parseValue(entry.bodyFat);
  return parseValue(entry.circumferences?.[metric]);
}

export type SeriesPoint = { time: number; value: number; label: string };

/** Punkty jednej miary, od najstarszego do najnowszego. */
export function metricSeries(entries: MeasurementLike[], metric: MetricId): SeriesPoint[] {
  return entries
    .map((entry) => {
      const value = readMetric(entry, metric);
      return value === null ? null : { time: measuredTime(entry), value, label: entry.date };
    })
    .filter((point): point is SeriesPoint => point !== null)
    .sort((a, b) => a.time - b.time);
}

/** Miary, dla których w ogóle jest co pokazać. */
export function availableMetrics(entries: MeasurementLike[]) {
  return metricDefinitions.filter((metric) => entries.some((entry) => readMetric(entry, metric.id) !== null));
}

export type MetricSummary = {
  metric: MetricDefinition;
  first: SeriesPoint;
  last: SeriesPoint;
  change: number;
  points: number;
};

/** Podsumowanie zmiany: pierwszy i ostatni pomiar oraz różnica między nimi. */
export function metricSummary(entries: MeasurementLike[], metric: MetricDefinition): MetricSummary | null {
  const series = metricSeries(entries, metric.id);
  if (!series.length) return null;
  const first = series[0];
  const last = series[series.length - 1];
  return { metric, first, last, change: last.value - first.value, points: series.length };
}

/**
 * Odmiana rzeczownika przez liczbę w polskim: 1 pomiar, 2 pomiary, 5 pomiarów.
 * Formy podaje się w kolejności: pojedyncza, mnoga „mało”, mnoga „dużo”.
 */
export function plural(count: number, one: string, few: string, many: string) {
  const last = count % 10;
  const lastTwo = count % 100;
  if (count === 1) return one;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
  return many;
}
