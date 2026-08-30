"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Minus, TrendingDown, TrendingUp, X } from "lucide-react";
import { useMemo, useState } from "react";

import {
  checkinConcerns,
  checkinQuestions,
  checkinScore,
  checkinTrend,
  currentWeekKey,
  findCheckin,
  formatWeekRange,
  type CheckinRecord,
} from "@/lib/checkins";
import type { Client } from "@/lib/demo-data";

const cardClass = "ui-surface rounded-[24px] border border-black/[0.07] bg-white shadow-[0_12px_38px_rgba(0,0,0,.035)]";

function shiftWeek(weekKey: string, weeks: number) {
  const date = new Date(`${weekKey}T12:00:00`);
  date.setDate(date.getDate() + weeks * 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function scoreTone(score: number) {
  if (score >= 70) return { label: "Dobry tydzień", className: "bg-emerald-50 text-emerald-800" };
  if (score >= 45) return { label: "Przeciętny tydzień", className: "bg-amber-50 text-amber-800" };
  return { label: "Trudny tydzień", className: "bg-red-50 text-red-800" };
}

export default function CheckinsView({ clients, checkins, onReview, onOpenClient }: {
  clients: Client[];
  checkins: CheckinRecord[];
  onReview: (id: string, trainerNote: string) => void;
  onOpenClient: (id: string) => void;
}) {
  const [weekKey, setWeekKey] = useState(currentWeekKey());
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(
    () => clients.map((client) => ({ client, record: findCheckin(checkins, client.id, weekKey) })),
    [clients, checkins, weekKey],
  );
  const submitted = rows.filter((row) => row.record);
  const missing = rows.filter((row) => !row.record);
  const unread = submitted.filter((row) => !row.record!.reviewedAt).length;
  const average = submitted.length
    ? Math.round(submitted.reduce((sum, row) => sum + checkinScore(row.record!), 0) / submitted.length)
    : null;
  const open = openId ? checkins.find((item) => item.id === openId) ?? null : null;
  const openClient = open ? clients.find((client) => client.id === open.clientId) ?? null : null;

  return (
    <>
      <header className="mb-5">
        <h1 className="text-[clamp(2rem,6.5vw,2.9rem)] font-black leading-[1.02] tracking-[-0.055em]">Check-iny</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--fb-text-secondary)]">
          Sen, stres, głód, regeneracja, energia i realizacja planu — jeden raport na tydzień.
        </p>
      </header>

      {/* Wybór tygodnia */}
      <section className={`${cardClass} mb-4 flex items-center gap-3 p-3 sm:p-4`}>
        <button onClick={() => setWeekKey((current) => shiftWeek(current, -1))} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f1f1ef]" aria-label="Poprzedni tydzień"><ChevronLeft size={16} /></button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-black/32">Tydzień</p>
          <p className="mt-0.5 truncate text-sm font-black">{formatWeekRange(weekKey)}</p>
        </div>
        <button
          onClick={() => setWeekKey((current) => shiftWeek(current, 1))}
          disabled={weekKey >= currentWeekKey()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f1f1ef] disabled:opacity-25"
          aria-label="Następny tydzień"
        >
          <ChevronRight size={16} />
        </button>
      </section>

      {clients.length ? (
        <>
          <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Wypełnione", `${submitted.length} z ${clients.length}`],
              ["Do sprawdzenia", String(unread)],
              ["Średni wynik", average === null ? "—" : `${average}%`],
              ["Brak odpowiedzi", String(missing.length)],
            ].map(([label, value]) => (
              <article key={label} className="fb-card p-4">
                <p className="fb-label">{label}</p>
                <p className="fb-stat-value mt-2.5">{value}</p>
              </article>
            ))}
          </section>

          <section className={`${cardClass} overflow-hidden`}>
            <div className="border-b border-black/[0.06] px-4 py-3.5 sm:px-5">
              <h2 className="text-base font-black tracking-[-0.02em]">Odpowiedzi</h2>
            </div>
            <div className="divide-y divide-black/[0.055]">
              {submitted.map(({ client, record }) => {
                const score = checkinScore(record!);
                const trend = checkinTrend(checkins, record!);
                const tone = scoreTone(score);
                const concerns = checkinConcerns(record!);
                return (
                  <button key={record!.id} onClick={() => setOpenId(record!.id)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-black/[0.015] sm:px-5">
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-black">{client.name}</span>
                        {record!.reviewedAt ? null : <span className="shrink-0 rounded-full bg-[var(--fb-gold)] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#0c0c0f]">Nowy</span>}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${tone.className}`}>{score}% · {tone.label}</span>
                        {concerns.length ? <span className="truncate text-[10px] text-black/42">Uwaga: {concerns.map((item) => item.label.toLowerCase()).join(", ")}</span> : null}
                      </span>
                    </span>
                    {trend === null ? (
                      <span className="flex shrink-0 items-center gap-1 text-[10px] font-black text-black/28"><Minus size={13} />pierwszy</span>
                    ) : (
                      <span className={`flex shrink-0 items-center gap-1 text-[10px] font-black ${trend > 0 ? "text-emerald-700" : trend < 0 ? "text-red-700" : "text-black/32"}`}>
                        {trend > 0 ? <TrendingUp size={13} /> : trend < 0 ? <TrendingDown size={13} /> : <Minus size={13} />}
                        {trend > 0 ? `+${trend}` : trend}
                      </span>
                    )}
                    <ChevronRight size={15} className="shrink-0 text-black/25" />
                  </button>
                );
              })}
              {!submitted.length ? (
                <div className="px-6 py-14 text-center">
                  <ClipboardList size={22} className="mx-auto text-black/25" />
                  <p className="mt-3 text-sm font-black">Brak odpowiedzi w tym tygodniu</p>
                  <p className="mt-1 text-[11px] text-black/38">Podopieczni wypełniają check-in w swoim panelu.</p>
                </div>
              ) : null}
            </div>
          </section>

          {missing.length ? (
            <section className={`${cardClass} mt-4 overflow-hidden`}>
              <div className="border-b border-black/[0.06] px-4 py-3.5 sm:px-5">
                <h2 className="text-base font-black tracking-[-0.02em]">Bez odpowiedzi</h2>
                <p className="mt-0.5 text-[11px] text-black/38">Nie wypełnili check-inu za ten tydzień</p>
              </div>
              <div className="divide-y divide-black/[0.055]">
                {missing.map(({ client }) => (
                  <button key={client.id} onClick={() => onOpenClient(client.id)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-black/[0.015] sm:px-5">
                    <span className="min-w-0 flex-1 truncate text-sm font-black">{client.name}</span>
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-wider text-black/32">Otwórz profil</span>
                    <ChevronRight size={15} className="shrink-0 text-black/25" />
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <section className={`${cardClass} px-6 py-16 text-center`}>
          <ClipboardList size={24} className="mx-auto text-black/25" />
          <p className="mt-3 text-sm font-black">Brak podopiecznych</p>
          <p className="mt-1 text-[11px] text-black/38">Check-iny pojawią się po dodaniu pierwszego podopiecznego.</p>
        </section>
      )}

      {open && openClient ? (
        <CheckinReport record={open} client={openClient} allCheckins={checkins} onClose={() => setOpenId(null)} onReview={onReview} />
      ) : null}
    </>
  );
}

function CheckinReport({ record, client, allCheckins, onClose, onReview }: {
  record: CheckinRecord;
  client: Client;
  allCheckins: CheckinRecord[];
  onClose: () => void;
  onReview: (id: string, trainerNote: string) => void;
}) {
  const [note, setNote] = useState(record.trainerNote);
  const score = checkinScore(record);
  const trend = checkinTrend(allCheckins, record);
  const tone = scoreTone(score);
  const concerns = checkinConcerns(record);

  return (
    <div className="fixed inset-0 z-[87] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
      <button className="absolute inset-0" onClick={onClose} aria-label="Zamknij" />
      <article className="ui-sheet relative flex max-h-[92svh] w-full flex-col rounded-t-[28px] shadow-2xl sm:max-w-xl sm:rounded-[28px]">
        <div className="shrink-0 px-5 pt-4 sm:px-7 sm:pt-7">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/15 sm:hidden" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/32">Check-in · {formatWeekRange(record.weekKey)}</p>
              <h2 className="mt-1.5 truncate text-2xl font-black tracking-[-0.04em]">{client.name}</h2>
            </div>
            <button onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f1f1ef]" aria-label="Zamknij"><X size={16} /></button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
          <div className={`rounded-2xl p-4 ${tone.className}`}>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-black tracking-[-0.05em]">{score}%</p>
              <p className="text-sm font-black">{tone.label}</p>
              {trend !== null ? <p className="ml-auto text-xs font-black">{trend > 0 ? `+${trend}` : trend} vs poprzedni</p> : null}
            </div>
            {concerns.length ? (
              <p className="mt-2 text-xs leading-5">Do omówienia: {concerns.map((item) => item.label.toLowerCase()).join(", ")}.</p>
            ) : (
              <p className="mt-2 text-xs leading-5">Żadna odpowiedź nie wskazuje na problem.</p>
            )}
          </div>

          <section>
            <h3 className="mb-2 text-[10px] font-black uppercase tracking-wider text-black/32">Odpowiedzi</h3>
            <div className="space-y-2.5">
              {checkinQuestions.map((question) => {
                const value = record.scores[question.id] ?? 3;
                const bad = question.higherIsBetter ? value <= 2 : value >= 4;
                return (
                  <div key={question.id} className="rounded-2xl bg-[#f3f3f1] p-3.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-xs font-black">{question.label}</p>
                      <p className={`text-xs font-black tabular-nums ${bad ? "text-red-700" : "text-black/50"}`}>{value} / 5</p>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <span key={step} className={`h-1.5 flex-1 rounded-full ${step <= value ? (bad ? "bg-red-500" : "bg-black") : "bg-black/10"}`} />
                      ))}
                    </div>
                    <p className="mt-1.5 flex justify-between text-[9px] text-black/35"><span>{question.low}</span><span>{question.high}</span></p>
                  </div>
                );
              })}
            </div>
          </section>

          {record.weight ? (
            <section>
              <h3 className="mb-2 text-[10px] font-black uppercase tracking-wider text-black/32">Waga podana przez podopiecznego</h3>
              <p className="text-sm font-black">{record.weight} kg</p>
            </section>
          ) : null}

          {record.note ? (
            <section>
              <h3 className="mb-2 text-[10px] font-black uppercase tracking-wider text-black/32">Komentarz podopiecznego</h3>
              <p className="rounded-2xl bg-[#f3f3f1] p-3.5 text-sm leading-6 text-black/70">{record.note}</p>
            </section>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-black/32">Notatka trenera</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Co zmieniamy w kolejnym tygodniu?"
              className="min-h-24 w-full rounded-2xl bg-[#f3f3f1] p-3.5 text-sm leading-6 outline-none"
            />
          </label>

          {record.reviewedAt ? (
            <p className="flex items-center gap-2 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 size={14} />Sprawdzone {new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long" }).format(new Date(record.reviewedAt))}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-2 border-t border-black/[0.06] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
          <button onClick={onClose} className="h-12 flex-1 rounded-full border border-black/12 text-[10px] font-black uppercase tracking-wider">Zamknij</button>
          <button onClick={() => { onReview(record.id, note); onClose(); }} className="h-12 flex-1 rounded-full bg-black text-[10px] font-black uppercase tracking-wider text-white">
            {record.reviewedAt ? "Zapisz notatkę" : "Oznacz jako sprawdzone"}
          </button>
        </div>
      </article>
    </div>
  );
}
