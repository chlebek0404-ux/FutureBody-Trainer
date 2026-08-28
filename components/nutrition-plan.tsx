"use client";

import { useMemo, useState } from "react";
import { Apple, Check, ChevronLeft, ChevronRight, Flame, Plus, Trash2, Users, Utensils } from "lucide-react";

import type { Client } from "@/lib/demo-data";
import {
  activityLevels,
  calculateTargets,
  complianceForDay,
  createMealPlan,
  createNutritionPlan,
  dietGoals,
  macroShare,
  maxMealKcal,
  maxMealsPerDay,
  sumMeals,
  todayKey,
  type DietGoal,
  type Meal,
  type MealLog,
  type NutritionPlan,
  type NutritionProfile,
  type Sex,
} from "@/lib/nutrition";

const cardClass = "ui-surface rounded-[24px] border border-black/[0.07] bg-white shadow-[0_12px_38px_rgba(0,0,0,.035)]";

function clampInt(value: string, min: number, max: number) {
  const parsed = Number(String(value).replace(",", "."));
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function MacroBar({ share }: { share: { protein: number; fat: number; carbs: number } }) {
  const parts = [
    { label: "Białko", value: share.protein, className: "bg-black" },
    { label: "Tłuszcze", value: share.fat, className: "bg-[#ffc400]" },
    { label: "Węglowodany", value: share.carbs, className: "bg-black/30" },
  ];
  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-black/[0.06]">
        {parts.map((part) => <span key={part.label} className={part.className} style={{ width: `${part.value}%` }} />)}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {parts.map((part) => (
          <span key={part.label} className="flex items-center gap-1.5 text-[10px] font-bold text-black/45">
            <span className={`h-2 w-2 rounded-full ${part.className}`} />{part.label} {part.value}%
          </span>
        ))}
      </div>
    </div>
  );
}

function NumberField({ label, value, suffix, min, max, onChange }: { label: string; value: number; suffix?: string; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-black/32">{label}</span>
      <div className="flex h-12 items-center rounded-xl bg-[#f2f2f0] px-3">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          onChange={(event) => onChange(clampInt(event.target.value, min, max))}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold outline-none"
        />
        {suffix ? <span className="ml-2 shrink-0 text-[10px] font-black text-black/32">{suffix}</span> : null}
      </div>
    </label>
  );
}

function ProfileForm({ profile, onChange }: { profile: NutritionProfile; onChange: (profile: NutritionProfile) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-black/32">Płeć</span>
        <div className="grid grid-cols-2 gap-2">
          {(["kobieta", "mężczyzna"] as Sex[]).map((sex) => (
            <button
              key={sex}
              type="button"
              onClick={() => onChange({ ...profile, sex })}
              aria-pressed={profile.sex === sex}
              className={`h-12 rounded-xl border text-[11px] font-black capitalize transition ${profile.sex === sex ? "border-black bg-black text-white" : "border-black/[0.08] bg-[#f2f2f0]"}`}
            >
              {sex}
            </button>
          ))}
        </div>
      </label>
      <NumberField label="Wiek" value={profile.age} suffix="lat" min={14} max={100} onChange={(age) => onChange({ ...profile, age })} />
      <NumberField label="Wzrost" value={profile.heightCm} suffix="cm" min={120} max={230} onChange={(heightCm) => onChange({ ...profile, heightCm })} />
      <NumberField label="Masa ciała" value={profile.weightKg} suffix="kg" min={35} max={250} onChange={(weightKg) => onChange({ ...profile, weightKg })} />
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-black/32">Aktywność</span>
        <select
          value={profile.activityId}
          onChange={(event) => onChange({ ...profile, activityId: event.target.value })}
          className="h-12 w-full rounded-xl border-0 bg-[#f2f2f0] px-3 text-sm font-bold outline-none"
        >
          {activityLevels.map((level) => <option key={level.id} value={level.id}>{level.label} — {level.detail}</option>)}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-black/32">Cel</span>
        <div className="grid grid-cols-3 gap-2">
          {dietGoals.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => onChange({ ...profile, goal: goal as DietGoal })}
              aria-pressed={profile.goal === goal}
              className={`min-h-12 rounded-xl border px-2 text-[10px] font-black transition ${profile.goal === goal ? "border-black bg-black text-white" : "border-black/[0.08] bg-[#f2f2f0]"}`}
            >
              {goal}
            </button>
          ))}
        </div>
      </label>
    </div>
  );
}

export function NutritionEditor({ client, plan, onBack, onSave, onDelete }: {
  client: Client;
  plan?: NutritionPlan;
  onBack: () => void;
  onSave: (plan: NutritionPlan) => void;
  onDelete: (clientId: string) => void;
}) {
  const [draft, setDraft] = useState<NutritionPlan>(() => plan ?? createNutritionPlan(client.id, {
    sex: "kobieta", age: 30, heightCm: 170, weightKg: 70, activityId: "moderate", goal: "Redukcja",
  }));

  const targets = useMemo(() => calculateTargets(draft.profile), [draft.profile]);
  const totals = useMemo(() => sumMeals(draft.meals), [draft.meals]);
  const share = macroShare(targets);
  const kcalDiff = totals.kcal - targets.kcal;

  function updateMeal(id: string, key: keyof Meal, value: string | number) {
    setDraft((current) => ({ ...current, meals: current.meals.map((meal) => meal.id === id ? { ...meal, [key]: value } : meal) }));
  }

  function addMeal() {
    if (draft.meals.length >= maxMealsPerDay) return;
    setDraft((current) => ({
      ...current,
      meals: [...current.meals, { id: `meal-${Date.now()}`, name: "Nowy posiłek", time: "16:00", kcal: 0, protein: 0, fat: 0, carbs: 0, note: "" }],
    }));
  }

  function removeMeal(id: string) {
    setDraft((current) => ({ ...current, meals: current.meals.filter((meal) => meal.id !== id) }));
  }

  function redistribute() {
    setDraft((current) => ({ ...current, meals: createMealPlan(targets, current.meals.length || 5) }));
  }

  return (
    <section>
      <button onClick={onBack} className="mb-5 flex min-h-11 items-center gap-2 text-xs font-black text-black/45 hover:text-black">
        <ChevronLeft size={15} />Wróć do diety
      </button>

      <header className="mb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/30">Plan żywieniowy</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">{client.name}</h1>
        <p className="mt-1 text-sm text-black/40">{client.goal}</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1fr_.8fr]">
        <section className={`${cardClass} p-5 sm:p-6`}>
          <h2 className="font-black">Dane do wyliczeń</h2>
          <p className="mt-1 text-[10px] text-black/36">Zapotrzebowanie liczymy wzorem Mifflina–St Jeora.</p>
          <div className="mt-5"><ProfileForm profile={draft.profile} onChange={(profile) => setDraft((current) => ({ ...current, profile }))} /></div>
        </section>

        <section className="rounded-[24px] bg-black p-5 text-white sm:p-6">
          <p className="text-[9px] font-black uppercase tracking-wider text-white/38">Cel dzienny</p>
          <p className="mt-3 text-4xl font-black tracking-[-0.06em]">{targets.kcal} <span className="text-lg text-white/45">kcal</span></p>
          <dl className="mt-5 space-y-2.5">
            {[["Przemiana spoczynkowa", `${targets.bmr} kcal`], ["Całkowita przemiana", `${targets.tdee} kcal`], ["Białko", `${targets.protein} g`], ["Tłuszcze", `${targets.fat} g`], ["Węglowodany", `${targets.carbs} g`]].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3 border-b border-white/[0.09] pb-2.5 text-[11px]">
                <dt className="text-white/45">{label}</dt><dd className="font-black">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className={`${cardClass} mt-4 p-5 sm:p-6`}>
        <h2 className="font-black">Rozkład makroskładników</h2>
        <div className="mt-4"><MacroBar share={share} /></div>
      </section>

      <section className={`${cardClass} mt-4 overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] p-5 sm:p-6">
          <div>
            <h2 className="font-black">Plan dnia</h2>
            <p className="mt-1 text-[10px] text-black/36">{draft.meals.length} posiłków · suma {totals.kcal} kcal</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={redistribute} className="h-11 rounded-full border border-black/12 px-4 text-[10px] font-black uppercase tracking-wider">Rozłóż równo</button>
            <button onClick={addMeal} disabled={draft.meals.length >= maxMealsPerDay} className="flex h-11 items-center gap-1.5 rounded-full bg-black px-4 text-[10px] font-black uppercase tracking-wider text-white disabled:opacity-35">
              <Plus size={14} />Posiłek
            </button>
          </div>
        </div>

        <div className={`flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-3 text-[11px] font-bold sm:px-6 ${Math.abs(kcalDiff) <= 60 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
          <span>Suma {totals.kcal} kcal wobec celu {targets.kcal} kcal</span>
          <span>{kcalDiff === 0 ? "dokładnie w celu" : kcalDiff > 0 ? `${kcalDiff} kcal powyżej` : `${Math.abs(kcalDiff)} kcal poniżej`}</span>
          <span className="text-black/40">B {totals.protein} g · T {totals.fat} g · W {totals.carbs} g</span>
        </div>

        <div className="divide-y divide-black/[0.055]">
          {draft.meals.map((meal) => (
            <article key={meal.id} className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  value={meal.name}
                  onChange={(event) => updateMeal(meal.id, "name", event.target.value)}
                  aria-label="Nazwa posiłku"
                  className="h-12 min-w-0 flex-1 rounded-xl bg-[#f2f2f0] px-3.5 text-sm font-black outline-none"
                />
                <input
                  type="time"
                  value={meal.time}
                  onChange={(event) => updateMeal(meal.id, "time", event.target.value)}
                  aria-label="Godzina posiłku"
                  className="h-12 w-32 rounded-xl bg-[#f2f2f0] px-3 text-sm font-bold outline-none"
                />
                <button onClick={() => removeMeal(meal.id)} aria-label={`Usuń ${meal.name}`} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-black/10 text-black/40 transition hover:border-red-300 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <NumberField label="Kalorie" value={meal.kcal} suffix="kcal" min={0} max={maxMealKcal} onChange={(value) => updateMeal(meal.id, "kcal", value)} />
                <NumberField label="Białko" value={meal.protein} suffix="g" min={0} max={300} onChange={(value) => updateMeal(meal.id, "protein", value)} />
                <NumberField label="Tłuszcze" value={meal.fat} suffix="g" min={0} max={200} onChange={(value) => updateMeal(meal.id, "fat", value)} />
                <NumberField label="Węglowodany" value={meal.carbs} suffix="g" min={0} max={500} onChange={(value) => updateMeal(meal.id, "carbs", value)} />
              </div>
              <input
                value={meal.note}
                onChange={(event) => updateMeal(meal.id, "note", event.target.value)}
                placeholder="Propozycja produktów, uwagi dla podopiecznego…"
                aria-label="Notatka do posiłku"
                className="mt-3 h-12 w-full rounded-xl bg-[#f2f2f0] px-3.5 text-sm outline-none"
              />
            </article>
          ))}
          {draft.meals.length === 0 ? <p className="px-6 py-10 text-center text-sm text-black/38">Dodaj pierwszy posiłek, aby zbudować plan dnia.</p> : null}
        </div>
      </section>

      <div className="sticky bottom-[max(5.75rem,calc(env(safe-area-inset-bottom)+5.25rem))] mt-6 lg:bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-black p-3 pl-5 text-white shadow-2xl">
        <div>
          <p className="text-[9px] text-white/40">Plan dnia</p>
          <p className="text-xs font-black">{totals.kcal} z {targets.kcal} kcal</p>
        </div>
        <div className="flex gap-2">
          {plan ? <button onClick={() => onDelete(client.id)} className="h-11 rounded-full border border-white/20 px-4 text-[10px] font-black uppercase text-white/70">Usuń plan</button> : null}
          <button onClick={() => onSave({ ...draft, updatedAt: new Date().toISOString() })} className="flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[10px] font-black uppercase text-black">
            <Check size={15} />Zapisz plan
          </button>
        </div>
      </div>
    </section>
  );
}

export function NutritionView({ clients, plans, logs, onOpen }: {
  clients: Client[];
  plans: NutritionPlan[];
  logs: MealLog[];
  onOpen: (clientId: string) => void;
}) {
  const today = todayKey();

  if (!clients.length) {
    return (
      <section className={`${cardClass} p-10 text-center`}>
        <Apple size={26} className="mx-auto text-black/25" />
        <h2 className="mt-4 text-lg font-black">Brak podopiecznych</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/42">Plany żywieniowe tworzy się dla konkretnej osoby. Dodaj podopiecznego, aby zacząć.</p>
      </section>
    );
  }

  const withPlan = clients.filter((client) => plans.some((plan) => plan.clientId === client.id));
  const withoutPlan = clients.filter((client) => !plans.some((plan) => plan.clientId === client.id));

  return (
    <div className="grid gap-4">
      <header className="mb-1">
        <h1 className="text-[34px] font-black tracking-[-0.055em] sm:text-[42px]">Dieta</h1>
        <p className="mt-1.5 text-sm text-black/42">Zapotrzebowanie, makroskładniki i plan posiłków podopiecznych.</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Plany żywieniowe", value: `${withPlan.length} z ${clients.length}`, icon: Utensils },
          { label: "Bez planu", value: String(withoutPlan.length), icon: Users },
          {
            label: "Średnia zgodność dziś",
            value: withPlan.length
              ? `${Math.round(withPlan.reduce((sum, client) => {
                  const plan = plans.find((item) => item.clientId === client.id)!;
                  return sum + complianceForDay(plan, logs.find((log) => log.clientId === client.id && log.date === today));
                }, 0) / withPlan.length)}%`
              : "—",
            icon: Flame,
          },
        ].map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.label} className={`${cardClass} p-5`}>
              <Icon size={18} className="text-black/35" />
              <p className="mt-4 text-[9px] font-black uppercase tracking-wider text-black/32">{tile.label}</p>
              <p className="mt-1.5 text-2xl font-black">{tile.value}</p>
            </div>
          );
        })}
      </section>

      <section className={`${cardClass} overflow-hidden`}>
        <div className="border-b border-black/[0.06] p-5 sm:p-6">
          <h2 className="font-black">Podopieczni</h2>
          <p className="mt-1 text-[10px] text-black/36">Kliknij osobę, aby otworzyć lub utworzyć plan żywieniowy.</p>
        </div>
        <div className="divide-y divide-black/[0.055]">
          {clients.map((client) => {
            const plan = plans.find((item) => item.clientId === client.id);
            const compliance = plan ? complianceForDay(plan, logs.find((log) => log.clientId === client.id && log.date === today)) : null;
            const targets = plan ? calculateTargets(plan.profile) : null;
            return (
              <button key={client.id} onClick={() => onOpen(client.id)} className="grid w-full grid-cols-[1fr_auto] items-center gap-3 p-4 text-left transition hover:bg-black/[0.015] sm:p-5">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black">{client.name}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-black/40">
                    {plan && targets ? `${targets.kcal} kcal · ${plan.meals.length} posiłków · ${plan.profile.goal}` : "Brak planu żywieniowego"}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  {compliance !== null ? <span className="text-xs font-black">{compliance}%</span> : <span className="rounded-full bg-black/[0.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-black/45">Utwórz</span>}
                  <ChevronRight size={16} className="text-black/28" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <p className="px-1 pb-2 text-[10px] leading-5 text-black/32">
        Plan nie zastępuje konsultacji dietetycznej. Przy chorobach przewlekłych, ciąży i zaburzeniach odżywiania skieruj podopiecznego do specjalisty.
      </p>
    </div>
  );
}
