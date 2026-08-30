"use client";

import { CalendarPlus, CalendarX, Check, Clock, Lock } from "lucide-react";
import { useMemo, useState } from "react";

import {
  canCancel,
  formatDayLabel,
  freeSlots,
  groupSlotsByDay,
  weekdayNames,
  weekdayShort,
  type BookingSettings,
} from "@/lib/booking";
import type { CalendarAppointment } from "@/lib/demo-data";

const cardClass = "ui-surface rounded-[24px] border border-black/[0.07] bg-white shadow-[0_12px_38px_rgba(0,0,0,.035)]";

/**
 * Ustawienia rezerwacji po stronie trenera.
 *
 * Wyłączona rezerwacja chowa cały panel zapisów u podopiecznych, więc główny
 * przełącznik stoi na samej górze, a reszta ustawień pojawia się dopiero po
 * jego włączeniu — nie ma sensu wybierać godzin dla funkcji, która nie działa.
 */
export function BookingSettingsPanel({ settings, onChange }: { settings: BookingSettings; onChange: (next: BookingSettings) => void }) {
  function toggleWeekday(day: number) {
    const weekdays = settings.weekdays.includes(day)
      ? settings.weekdays.filter((item) => item !== day)
      : [...settings.weekdays, day].sort((a, b) => a - b);
    onChange({ ...settings, weekdays });
  }

  return (
    <section className={`${cardClass} p-5 sm:p-6`}>
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black tracking-[-0.02em]">Rezerwacja przez podopiecznych</h2>
          <p className="mt-1 text-[11px] leading-5 text-black/42">
            {settings.enabled
              ? "Podopieczni widzą Twoje wolne godziny i zapisują się sami. Każdy zapis od razu pojawia się w kalendarzu."
              : "Zapisy są wyłączone. Terminy dodajesz wyłącznie Ty, a podopieczni nie widzą panelu rezerwacji."}
          </p>
        </div>
        <button
          role="switch"
          aria-checked={settings.enabled}
          aria-label="Rezerwacja przez podopiecznych"
          onClick={() => onChange({ ...settings, enabled: !settings.enabled })}
          className="fb-switch shrink-0"
        />
      </div>

      {settings.enabled ? (
        <div className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-black/32">Dni, w których przyjmujesz</p>
            <div className="flex flex-wrap gap-2">
              {weekdayShort.map((label, index) => {
                const day = index + 1;
                const active = settings.weekdays.includes(day);
                return (
                  <button key={day} onClick={() => toggleWeekday(day)} aria-pressed={active} aria-label={weekdayNames[index]}
                    className={`h-11 w-11 rounded-full border text-[11px] font-black transition ${active ? "border-black bg-black text-white" : "border-black/10 bg-white"}`}>
                    {label}
                  </button>
                );
              })}
            </div>
            {!settings.weekdays.length ? <p className="mt-2 text-[10px] font-bold text-amber-700">Bez wybranego dnia nie ma wolnych terminów.</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-black/32">Pierwszy trening o</span>
              <select value={settings.startHour} onChange={(event) => onChange({ ...settings, startHour: Math.min(Number(event.target.value), settings.endHour) })}
                className="h-12 w-full rounded-xl border-0 bg-[#f2f2f0] px-3 text-sm font-bold outline-none">
                {Array.from({ length: 18 }, (_, index) => index + 5).map((hour) => <option key={hour} value={hour}>{String(hour).padStart(2, "0")}:00</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-black/32">Ostatni trening o</span>
              <select value={settings.endHour} onChange={(event) => onChange({ ...settings, endHour: Math.max(Number(event.target.value), settings.startHour) })}
                className="h-12 w-full rounded-xl border-0 bg-[#f2f2f0] px-3 text-sm font-bold outline-none">
                {Array.from({ length: 18 }, (_, index) => index + 5).map((hour) => <option key={hour} value={hour}>{String(hour).padStart(2, "0")}:00</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-black/32">Zapis najpóźniej</span>
              <select value={settings.noticeHours} onChange={(event) => onChange({ ...settings, noticeHours: Number(event.target.value) })}
                className="h-12 w-full rounded-xl border-0 bg-[#f2f2f0] px-3 text-sm font-bold outline-none">
                {[2, 4, 6, 12, 24, 48].map((hours) => <option key={hours} value={hours}>{hours} h przed treningiem</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-black/32">Widoczne terminy</span>
              <select value={settings.horizonDays} onChange={(event) => onChange({ ...settings, horizonDays: Number(event.target.value) })}
                className="h-12 w-full rounded-xl border-0 bg-[#f2f2f0] px-3 text-sm font-bold outline-none">
                {[7, 14, 21, 30].map((days) => <option key={days} value={days}>{days} dni w przód</option>)}
              </select>
            </label>
          </div>

          <p className="rounded-2xl bg-[#f3f3f1] p-3.5 text-[11px] leading-5 text-black/50">
            Zajęte godziny znikają z listy automatycznie. Odwołanie terminu przez podopiecznego zwalnia godzinę,
            a on sam może odwołać tylko z tym samym wyprzedzeniem, jakie obowiązuje przy zapisie.
          </p>
        </div>
      ) : null}
    </section>
  );
}

/**
 * Panel zapisów w widoku podopiecznego. Pokazywany tylko wtedy, gdy trener
 * włączył rezerwację.
 */
export function ClientBooking({ settings, appointments, myAppointments, now, onBook, onCancel }: {
  settings: BookingSettings;
  appointments: CalendarAppointment[];
  myAppointments: CalendarAppointment[];
  now: Date;
  onBook: (date: string, hour: number) => void;
  onCancel: (id: string) => void;
}) {
  const [openDay, setOpenDay] = useState<string | null>(null);
  const days = useMemo(
    () => groupSlotsByDay(freeSlots(settings, appointments, now)),
    [settings, appointments, now],
  );
  const upcoming = myAppointments
    .filter((item) => item.status !== "Anulowany")
    .filter((item) => new Date(`${item.date}T${String(item.hour).padStart(2, "0")}:00:00`).getTime() >= now.getTime() - 3_600_000)
    .sort((a, b) => `${a.date}${String(a.hour).padStart(2, "0")}`.localeCompare(`${b.date}${String(b.hour).padStart(2, "0")}`));

  if (!settings.enabled) {
    return (
      <section className={`${cardClass} p-5`}>
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f1f1ef] text-black/45"><Lock size={18} /></span>
          <div className="min-w-0">
            <h2 className="text-base font-black tracking-[-0.02em]">Terminy ustala trener</h2>
            <p className="mt-1 text-[11px] leading-5 text-black/42">Samodzielne zapisy są wyłączone. Twoje treningi zobaczysz w kalendarzu.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div className="border-b border-black/[0.06] px-5 py-4">
        <h2 className="text-base font-black tracking-[-0.02em]">Zapisz się na trening</h2>
        <p className="mt-0.5 text-[11px] text-black/40">Wolne godziny u Twojego trenera</p>
      </div>

      {upcoming.length ? (
        <div className="border-b border-black/[0.06] p-5">
          <p className="mb-2.5 text-[9px] font-black uppercase tracking-wider text-black/32">Twoje najbliższe treningi</p>
          <div className="space-y-2">
            {upcoming.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-[#f3f3f1] p-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-black text-[11px] font-black text-white">{String(item.hour).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-black">{formatDayLabel(item.date, now)}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-black/40">{item.kind ?? "Trening personalny"} · {String(item.hour).padStart(2, "0")}:00</span>
                </span>
                {canCancel(item, settings, now) ? (
                  <button onClick={() => onCancel(item.id)} className="h-10 shrink-0 rounded-full border border-black/12 px-3.5 text-[9px] font-black uppercase tracking-wider">
                    <CalendarX size={12} className="mr-1.5 inline" />Odwołaj
                  </button>
                ) : (
                  <span className="shrink-0 text-[9px] font-black uppercase tracking-wider text-black/28">Za późno na zmianę</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {days.length ? (
        <div className="divide-y divide-black/[0.055]">
          {days.map(({ date, hours }) => {
            const open = openDay === date;
            return (
              <div key={date}>
                <button onClick={() => setOpenDay(open ? null : date)} aria-expanded={open} className="flex min-h-14 w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-black/[0.015]">
                  <Clock size={15} className="shrink-0 text-black/28" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black first-letter:uppercase">{formatDayLabel(date, now)}</span>
                    <span className="mt-0.5 block text-[10px] text-black/40">{hours.length} {hours.length === 1 ? "wolna godzina" : hours.length < 5 ? "wolne godziny" : "wolnych godzin"}</span>
                  </span>
                  <span className="shrink-0 text-[9px] font-black uppercase tracking-wider text-[var(--fb-gold-dark)]">{open ? "Zwiń" : "Wybierz"}</span>
                </button>
                {open ? (
                  <div className="flex flex-wrap gap-2 px-5 pb-4">
                    {hours.map((slot) => (
                      <button key={slot.hour} onClick={() => onBook(slot.date, slot.hour)}
                        className="h-11 rounded-full border border-black/12 px-4 text-[11px] font-black tabular-nums transition hover:border-black hover:bg-black hover:text-white">
                        {String(slot.hour).padStart(2, "0")}:00
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <CalendarPlus size={22} className="mx-auto text-black/25" />
          <p className="mt-3 text-sm font-black">Brak wolnych terminów</p>
          <p className="mt-1 text-[11px] text-black/38">Wszystkie godziny są zajęte albo trener nie przyjmuje w najbliższych dniach.</p>
        </div>
      )}
    </section>
  );
}

/** Potwierdzenie po udanym zapisie — krótkie, bez zbędnego okna. */
export function BookingConfirmation({ date, hour, now }: { date: string; hour: number; now: Date }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-bold text-emerald-700">
      <Check size={14} />Zapisano: {formatDayLabel(date, now).toLowerCase()}, {String(hour).padStart(2, "0")}:00
    </p>
  );
}
