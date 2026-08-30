"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { formatValue, plural, type MetricDefinition, type SeriesPoint } from "@/lib/measurements";

/**
 * Wykres jednej miary w czasie.
 *
 * Jedna seria na jednym wykresie — masa ciała, talia i procent tkanki mają
 * różne skale, więc rysowanie ich razem wymagałoby drugiej osi i dawałoby
 * fałszywy obraz. Miarę wybiera się nad wykresem.
 *
 * Rysowane inline, bez biblioteki wykresów: seria jest krótka, a dzięki temu
 * wykres dziedziczy kolory motywu i nie dokłada nic do rozmiaru aplikacji.
 */

const height = 220;
const padding = { top: 18, right: 54, bottom: 28, left: 10 };

/**
 * Szerokość układu współrzędnych równa szerokości kontenera.
 *
 * Gdyby viewBox miał stałą szerokość, na wąskim ekranie całość byłaby
 * zmniejszana, a razem z nią podpisy — przy 320 px tekst schodził do czterech
 * pikseli. Rysowanie w skali 1:1 utrzymuje wielkość liter niezależnie od
 * szerokości ekranu.
 */
function useContainerWidth(fallback: number) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.contentRect.width;
      if (next > 0) setWidth(next);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

/** „30.08.2026” → „30.08”. Rok powtarza się w każdym podpisie i tylko zajmuje miejsce. */
function shortDate(label: string) {
  const match = label.match(/^(\d{1,2}\.\d{1,2})\.\d{4}$/);
  return match ? match[1] : label;
}

function niceStep(span: number) {
  const rough = span / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough || 1));
  return [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((step) => step >= rough) ?? magnitude * 10;
}

export default function MeasurementChart({ metric, series }: { metric: MetricDefinition; series: SeriesPoint[] }) {
  const clipId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const { ref, width } = useContainerWidth(640);

  const geometry = useMemo(() => {
    if (series.length < 2) return null;
    const values = series.map((point) => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    // Skala nie zaczyna się od zera: przy obwodach zero zjadłoby całą zmianę.
    // Zakres dobieramy wokół danych, a oś zawsze jest podpisana.
    const step = niceStep(max - min || Math.max(1, max * 0.02));
    const low = Math.floor(min / step) * step - (max === min ? step : 0);
    const high = Math.ceil(max / step) * step + (max === min ? step : 0);
    const span = high - low || 1;

    const firstTime = series[0].time;
    const lastTime = series[series.length - 1].time;
    const timeSpan = lastTime - firstTime || 1;

    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const x = (time: number) => padding.left + ((time - firstTime) / timeSpan) * innerWidth;
    const y = (value: number) => padding.top + innerHeight - ((value - low) / span) * innerHeight;

    const points = series.map((point) => ({ ...point, cx: x(point.time), cy: y(point.value) }));
    const ticks: number[] = [];
    for (let value = low; value <= high + 0.0001; value += step) ticks.push(Number(value.toFixed(4)));

    return { points, ticks, y, path: points.map((point, index) => `${index ? "L" : "M"}${point.cx.toFixed(1)} ${point.cy.toFixed(1)}`).join(" ") };
  }, [series, width]);

  if (series.length < 2) {
    return (
      <div ref={ref} className="grid min-h-44 place-items-center rounded-2xl border border-dashed border-[var(--fb-border-strong)] px-6 text-center">
        <p className="text-[11px] leading-5 text-[var(--fb-text-muted)]">
          {series.length === 1
            ? `Jeden pomiar: ${formatValue(series[0].value)} ${metric.unit}. Wykres pojawi się po drugim wpisie.`
            : "Brak pomiarów tej miary."}
        </p>
      </div>
    );
  }

  const { points, ticks, y, path } = geometry!;
  const last = points[points.length - 1];
  const active = hover === null ? null : points[hover];
  // Podpis ostatniej wartości ląduje po przeciwnej stronie niż biegnie końcówka
  // linii: gdy wykres opada, tekst idzie pod kropkę, gdy rośnie — nad nią.
  const falling = points.length > 1 && last.cy > points[points.length - 2].cy;
  const labelY = falling ? Math.min(height - padding.bottom - 4, last.cy + 20) : Math.max(padding.top + 4, last.cy - 12);

  return (
    <figure ref={ref} className="m-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="block max-w-full touch-none"
        role="img"
        aria-label={`${metric.label} w czasie: od ${formatValue(points[0].value)} do ${formatValue(last.value)} ${metric.unit}`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={padding.left} y={padding.top - 6} width={width - padding.left - padding.right} height={height - padding.top - padding.bottom + 12} />
          </clipPath>
        </defs>

        {/* Siatka: cienka, ciągła, cofnięta za dane. */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={y(tick)} y2={y(tick)} stroke="var(--fb-border)" strokeWidth={1} />
            <text x={width - padding.right + 8} y={y(tick) + 3.5} fill="var(--fb-text-muted)" fontSize={10} fontWeight={700}>{formatValue(tick)}</text>
          </g>
        ))}

        <g clipPath={`url(#${clipId})`}>
          <path d={path} fill="none" stroke="var(--fb-chart-line)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => (
            <circle
              key={point.time}
              cx={point.cx}
              cy={point.cy}
              r={index === hover ? 5.5 : 4}
              fill="var(--fb-chart-line)"
              stroke="var(--fb-surface)"
              strokeWidth={2}
            />
          ))}
        </g>

        {/* Podpis tylko przy ostatnim punkcie — wartość na każdej kropce byłaby
            nieczytelna. Trafia na lewo od kropki, bo ta stoi przy samej krawędzi
            i tekst po prawej wchodziłby na podpisy osi. */}
        <text x={last.cx - 9} y={labelY} textAnchor="end" fill="var(--fb-text)" fontSize={12} fontWeight={800}>
          {formatValue(last.value)} {metric.unit}
        </text>

        {/* Oś czasu: dzień i miesiąc. Pełna data jest w podpisie pod wykresem,
            a skrót nie zderza się z sąsiednim podpisem na wąskim ekranie. */}
        <text x={padding.left} y={height - 8} fill="var(--fb-text-muted)" fontSize={10} fontWeight={700}>{shortDate(points[0].label)}</text>
        {last.label === points[0].label ? null : (
          <text x={width - padding.right} y={height - 8} textAnchor="end" fill="var(--fb-text-muted)" fontSize={10} fontWeight={700}>{shortDate(last.label)}</text>
        )}

        {active ? (
          <line x1={active.cx} x2={active.cx} y1={padding.top - 6} y2={height - padding.bottom} stroke="var(--fb-text-muted)" strokeWidth={1} />
        ) : null}

        {/* Pola trafień szersze niż kropki, żeby dało się w nie trafić palcem. */}
        {points.map((point, index) => {
          const half = (width - padding.left - padding.right) / Math.max(1, points.length - 1) / 2;
          return (
            <rect
              key={`hit-${point.time}`}
              x={Math.max(0, point.cx - half)}
              y={0}
              width={half * 2}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHover(index)}
              onFocus={() => setHover(index)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              role="button"
              aria-label={`${point.label}: ${formatValue(point.value)} ${metric.unit}`}
            />
          );
        })}
      </svg>

      <figcaption className="mt-2 min-h-5 text-center text-[11px] font-bold text-[var(--fb-text-secondary)]">
        {active ? `${active.label} · ${formatValue(active.value)} ${metric.unit}` : `${metric.label} (${metric.unit}) · ${points.length} ${plural(points.length, "pomiar", "pomiary", "pomiarów")}`}
      </figcaption>
    </figure>
  );
}
