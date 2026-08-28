/**
 * Model żywieniowy: zapotrzebowanie kaloryczne, makroskładniki i plan posiłków.
 *
 * Wszystkie wartości wynikają z danych wprowadzonych przez trenera. Moduł nie
 * zawiera bazy produktów ani przelicznika gramatury — kalorie i makro posiłku
 * podaje trener, a suma jest zestawiana z celem.
 */

export type Sex = "kobieta" | "mężczyzna";
export type DietGoal = "Redukcja" | "Utrzymanie" | "Budowa masy";

export type ActivityLevel = {
  id: string;
  label: string;
  detail: string;
  multiplier: number;
};

/** Mnożniki aktywności stosowane do przemiany spoczynkowej. */
export const activityLevels: ActivityLevel[] = [
  { id: "sedentary", label: "Siedzący", detail: "Praca biurowa, brak treningów", multiplier: 1.2 },
  { id: "light", label: "Lekko aktywny", detail: "1–2 treningi w tygodniu", multiplier: 1.375 },
  { id: "moderate", label: "Umiarkowany", detail: "3–4 treningi w tygodniu", multiplier: 1.55 },
  { id: "high", label: "Wysoki", detail: "5–6 treningów w tygodniu", multiplier: 1.725 },
  { id: "athlete", label: "Bardzo wysoki", detail: "Treningi codziennie lub praca fizyczna", multiplier: 1.9 },
];

export const dietGoals: DietGoal[] = ["Redukcja", "Utrzymanie", "Budowa masy"];

export type NutritionProfile = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityId: string;
  goal: DietGoal;
};

export type Meal = {
  id: string;
  name: string;
  time: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  note: string;
};

export type NutritionPlan = {
  id: string;
  clientId: string;
  profile: NutritionProfile;
  meals: Meal[];
  updatedAt: string;
};

/** Zapis wykonania posiłków w danym dniu. Klucz dnia w formacie RRRR-MM-DD. */
export type MealLog = {
  clientId: string;
  date: string;
  completedMealIds: string[];
};

export type NutritionTargets = {
  bmr: number;
  tdee: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export const maxMealsPerDay = 8;
export const maxMealKcal = 3000;

function round(value: number) {
  return Math.round(value);
}

/**
 * Przemiana spoczynkowa według wzoru Mifflina–St Jeora — obecnie zalecanego
 * dla populacji ogólnej, dokładniejszego niż starszy wzór Harrisa–Benedicta.
 */
export function basalMetabolicRate(profile: NutritionProfile) {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  return Math.max(0, base + (profile.sex === "mężczyzna" ? 5 : -161));
}

export function activityMultiplier(activityId: string) {
  return activityLevels.find((level) => level.id === activityId)?.multiplier ?? 1.55;
}

/**
 * Cel kaloryczny i rozkład makroskładników.
 *
 * Białko i tłuszcz liczone na kilogram masy ciała, węglowodany uzupełniają
 * pozostałe kalorie. Deficyt i nadwyżka są umiarkowane, żeby plan pozostał
 * bezpieczny bez konsultacji dietetyka.
 */
export function calculateTargets(profile: NutritionProfile): NutritionTargets {
  const bmr = basalMetabolicRate(profile);
  const tdee = bmr * activityMultiplier(profile.activityId);

  const kcalFactor = profile.goal === "Redukcja" ? 0.82 : profile.goal === "Budowa masy" ? 1.12 : 1;
  const kcal = Math.max(1200, tdee * kcalFactor);

  const proteinPerKg = profile.goal === "Redukcja" ? 2.2 : profile.goal === "Budowa masy" ? 1.9 : 1.8;
  const fatPerKg = profile.goal === "Redukcja" ? 0.8 : 1;

  const protein = profile.weightKg * proteinPerKg;
  const fat = profile.weightKg * fatPerKg;
  const remaining = kcal - protein * 4 - fat * 9;
  // Węglowodany nie schodzą poniżej zera, gdy białko i tłuszcz wypełnią cel.
  const carbs = Math.max(0, remaining / 4);

  return { bmr: round(bmr), tdee: round(tdee), kcal: round(kcal), protein: round(protein), fat: round(fat), carbs: round(carbs) };
}

export function sumMeals(meals: Meal[]) {
  return meals.reduce(
    (total, meal) => ({
      kcal: total.kcal + meal.kcal,
      protein: total.protein + meal.protein,
      fat: total.fat + meal.fat,
      carbs: total.carbs + meal.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

/** Udział makroskładnika w kaloriach, przydatny do pasków rozkładu. */
export function macroShare(targets: NutritionTargets) {
  const total = targets.protein * 4 + targets.fat * 9 + targets.carbs * 4;
  if (total <= 0) return { protein: 0, fat: 0, carbs: 0 };
  return {
    protein: Math.round((targets.protein * 4 / total) * 100),
    fat: Math.round((targets.fat * 9 / total) * 100),
    carbs: Math.round((targets.carbs * 4 / total) * 100),
  };
}

const mealTemplates: { name: string; time: string; share: number }[] = [
  { name: "Śniadanie", time: "08:00", share: 0.25 },
  { name: "Drugie śniadanie", time: "11:00", share: 0.15 },
  { name: "Obiad", time: "14:00", share: 0.3 },
  { name: "Posiłek potreningowy", time: "18:00", share: 0.15 },
  { name: "Kolacja", time: "20:30", share: 0.15 },
];

/** Szkielet dnia rozkładający cel na posiłki. Trener nadpisuje każdą wartość. */
export function createMealPlan(targets: NutritionTargets, mealCount = 5): Meal[] {
  const templates = mealTemplates.slice(0, Math.max(2, Math.min(mealCount, mealTemplates.length)));
  const shareSum = templates.reduce((sum, item) => sum + item.share, 0);

  return templates.map((template, index) => {
    const ratio = template.share / shareSum;
    return {
      id: `meal-${index + 1}`,
      name: template.name,
      time: template.time,
      kcal: round(targets.kcal * ratio),
      protein: round(targets.protein * ratio),
      fat: round(targets.fat * ratio),
      carbs: round(targets.carbs * ratio),
      note: "",
    };
  });
}

export function createNutritionPlan(clientId: string, profile: NutritionProfile): NutritionPlan {
  const targets = calculateTargets(profile);
  return {
    id: `diet-${clientId}`,
    clientId,
    profile,
    meals: createMealPlan(targets),
    updatedAt: new Date().toISOString(),
  };
}

export function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Zgodność z planem w procentach: udział odhaczonych kalorii w celu dnia. */
export function complianceForDay(plan: NutritionPlan, log: MealLog | undefined) {
  if (!plan.meals.length) return 0;
  const completed = plan.meals.filter((meal) => log?.completedMealIds.includes(meal.id));
  const planned = sumMeals(plan.meals).kcal;
  if (planned <= 0) return 0;
  return Math.round((sumMeals(completed).kcal / planned) * 100);
}
