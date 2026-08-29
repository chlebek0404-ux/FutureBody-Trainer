/**
 * Model ćwiczenia w bibliotece FutureBody.
 *
 * Jeden rekord opisuje jedno ćwiczenie na tyle dokładnie, żeby trener mógł
 * je bezpiecznie zadać, a podopieczny wykonać bez nadzoru. Warianty chwytu,
 * strony ciała czy ustawienia ławki są parametrami ćwiczenia, nie osobnymi
 * rekordami — powielanie rekordów zaciemnia wyszukiwanie.
 */

export type MovementPattern =
  | "squat" | "hinge" | "lunge"
  | "horizontal-push" | "vertical-push"
  | "horizontal-pull" | "vertical-pull"
  | "carry" | "rotation" | "anti-rotation"
  | "flexion" | "anti-extension" | "lateral-flexion"
  | "locomotion" | "jump" | "throw"
  | "isolation" | "mobility" | "cardio" | "recovery";

export type ExerciseLevel = "Podstawowy" | "Średni" | "Zaawansowany";

export type Laterality = "obustronne" | "jednostronne" | "naprzemienne";

/** Parametry, które mają sens dla danego ćwiczenia w edytorze planu. */
export type TrainingParameter =
  | "serie" | "powtorzenia" | "ciezar" | "procent-maks"
  | "rpe" | "rir" | "tempo" | "czas" | "dystans"
  | "przerwa" | "rundy" | "strona" | "chwyt" | "ustawienie";

export type MuscleId =
  | "pectoralisMajor" | "upperChest" | "latissimusDorsi" | "trapezius"
  | "anteriorDeltoid" | "lateralDeltoid" | "posteriorDeltoid"
  | "biceps" | "triceps" | "forearms"
  | "rectusAbdominis" | "obliques" | "erectorSpinae"
  | "gluteusMaximus" | "quadriceps" | "hamstrings"
  | "adductors" | "abductors" | "calves";

export type ExerciseCategory =
  | "Klatka" | "Plecy" | "Barki" | "Biceps" | "Triceps" | "Przedramiona"
  | "Czworogłowe" | "Dwugłowe" | "Pośladki" | "Przywodziciele" | "Łydki"
  | "Brzuch" | "Prostowniki" | "Mobilność" | "Funkcjonalne"
  | "Trójbój" | "Ciężary olimpijskie" | "Cardio" | "Regeneracja";

export type ExerciseSource = "system" | "trainer";

export type Exercise = {
  id: string;
  slug: string;
  name: string;
  englishName: string;
  aliases: string[];

  category: ExerciseCategory;
  pattern: MovementPattern;
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  equipment: string[];
  level: ExerciseLevel;
  laterality: Laterality;
  /** Wielostawowe angażuje więcej niż jeden staw; izolowane jeden. */
  compound: boolean;
  /** Cele treningowe, do których ćwiczenie się nadaje. */
  goals: string[];

  startPosition: string;
  steps: string[];
  breathing: string;
  mistakes: string[];
  cues: string[];
  rangeOfMotion: string;
  precautions: string[];

  /** Slug prostszej wersji i trudniejszej wersji tego samego wzorca. */
  regression: string | null;
  progression: string | null;
  /** Zamienniki wskazane wprost przez autora katalogu. */
  substitutions: string[];

  parameters: TrainingParameter[];
  /** Domyślny protokół podpowiadany przy dodawaniu do planu. */
  defaultProtocol: string;

  /** Ścieżka zasobu w magazynie plików. Puste, dopóki brak zatwierdzonej wizualizacji. */
  mediaPath: string | null;
  source: ExerciseSource;
  requiresSupervision: boolean;
};

/** Rekord rozszerzony o dane wyliczane przy budowie biblioteki. */
export type ExerciseRecord = Exercise & {
  /** Etykiety mięśni do wyświetlenia bez sięgania po słownik. */
  primaryMuscleLabels: string[];
  secondaryMuscleLabels: string[];
  /** Tekst do wyszukiwania, znormalizowany bez znaków diakrytycznych. */
  searchText: string;
};
