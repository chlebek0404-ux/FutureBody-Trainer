"use client";

import { CheckCircle2, ClipboardList } from "lucide-react";
import { useState } from "react";

import {
  checkinQuestions,
  checkinScore,
  createCheckin,
  currentWeekKey,
  formatWeekRange,
  type CheckinRecord,
  type CheckinScaleId,
} from "@/lib/checkins";

const cardClass = "ui-surface rounded-[24px] border border-black/[0.07] bg-white shadow-[0_12px_38px_rgba(0,0,0,.035)]";

/**
 * Formularz check-inu w panelu podopiecznego.
 *
 * Wypełniony check-in można poprawić do końca tygodnia — zapis nadpisuje
 * wpis dla tego samego tygodnia, więc trener zawsze widzi jedną, aktualną
 * odpowiedź.
 */
export default function CheckinForm({ clientId, existing, onSubmit }: {
  clientId: string;
  existing: CheckinRecord | null;
  onSubmit: (record: CheckinRecord) => void;
}) {
  const weekKey = currentWeekKey();
  const [draft, setDraft] = useState<CheckinRecord>(() => existing ?? createCheckin(clientId, weekKey));
  const [editing, setEditing] = useState(!existing);

  function setScore(id: CheckinScaleId, value: number) {
    setDraft((current) => ({ ...current, scores: { ...current.scores, [id]: value } }));
  }

  function save() {
    onSubmit({ ...draft, clientId, weekKey, submittedAt: new Date().toISOString(), reviewedAt: null });
    setEditing(false);
  }

  if (!editing && existing) {
    return (
      <section className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><CheckCircle2 size={19} /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-black tracking-[-0.02em]">Check-in wysłany</h2>
            <p className="mt-1 text-[11px] leading-5 text-black/42">
              Tydzień {formatWeekRange(existing.weekKey)} · wynik {checkinScore(existing)}%
              {existing.reviewedAt ? " · trener już go przeczytał" : " · czeka na trenera"}
            </p>
          </div>
        </div>
        {existing.trainerNote ? (
          <div className="mt-4 rounded-2xl bg-[#f3f3f1] p-3.5">
            <p className="text-[9px] font-black uppercase tracking-wider text-black/32">Odpowiedź trenera</p>
            <p className="mt-1.5 text-sm leading-6 text-black/70">{existing.trainerNote}</p>
          </div>
        ) : null}
        <button onClick={() => { setDraft(existing); setEditing(true); }} className="mt-4 h-12 w-full rounded-full border border-black/12 text-[10px] font-black uppercase tracking-wider">
          Popraw odpowiedzi
        </button>
      </section>
    );
  }

  return (
    <section className={`${cardClass} p-5 sm:p-6`}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-black text-white"><ClipboardList size={19} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black tracking-[-0.02em]">Check-in tygodniowy</h2>
          <p className="mt-1 text-[11px] leading-5 text-black/42">Tydzień {formatWeekRange(weekKey)} · sześć pytań, minuta czasu</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {checkinQuestions.map((question) => {
          const value = draft.scores[question.id] ?? 3;
          return (
            <fieldset key={question.id}>
              <legend className="text-xs font-black">{question.question}</legend>
              <div className="mt-2.5 flex gap-1.5">
                {[1, 2, 3, 4, 5].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setScore(question.id, step)}
                    aria-pressed={value === step}
                    aria-label={`${question.label}: ${step} z 5`}
                    className={`h-12 flex-1 rounded-2xl border text-sm font-black transition ${value === step ? "border-black bg-black text-white" : "border-black/10 bg-white hover:bg-black/[0.03]"}`}
                  >
                    {step}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 flex justify-between text-[9px] text-black/35"><span>{question.low}</span><span>{question.high}</span></p>
            </fieldset>
          );
        })}

        <label className="block">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-black/32">Waga (opcjonalnie)</span>
          <input
            value={draft.weight}
            onChange={(event) => setDraft((current) => ({ ...current, weight: event.target.value.replace(/[^\d,.]/g, "").slice(0, 6) }))}
            inputMode="decimal"
            placeholder="np. 72,4"
            className="h-12 w-full rounded-2xl bg-[#f3f3f1] px-4 text-base outline-none sm:text-sm"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-black/32">Chcesz coś dodać?</span>
          <textarea
            value={draft.note}
            onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
            placeholder="Co poszło dobrze, co było trudne…"
            className="min-h-24 w-full rounded-2xl bg-[#f3f3f1] p-3.5 text-base leading-6 outline-none sm:text-sm"
          />
        </label>
      </div>

      <div className="mt-5 flex gap-2">
        {existing ? (
          <button onClick={() => { setDraft(existing); setEditing(false); }} className="h-12 flex-1 rounded-full border border-black/12 text-[10px] font-black uppercase tracking-wider">Anuluj</button>
        ) : null}
        <button onClick={save} className="h-12 flex-1 rounded-full bg-black text-[10px] font-black uppercase tracking-wider text-white">
          {existing ? "Zapisz zmiany" : "Wyślij check-in"}
        </button>
      </div>
    </section>
  );
}
