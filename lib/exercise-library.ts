export type MovementPattern = "squat" | "hinge" | "push" | "pull" | "lunge" | "core" | "mobility";

export type ExerciseSource = "system" | "trainer";
export type ExerciseLaterality = "bilateral" | "unilateral";
export type CameraAngle = "front" | "back" | "side" | "frontThreeQuarter" | "rearThreeQuarter";

export type MuscleId =
  | "pectoralisMajor"
  | "upperChest"
  | "latissimusDorsi"
  | "trapezius"
  | "anteriorDeltoid"
  | "lateralDeltoid"
  | "posteriorDeltoid"
  | "biceps"
  | "triceps"
  | "forearms"
  | "rectusAbdominis"
  | "obliques"
  | "erectorSpinae"
  | "gluteusMaximus"
  | "quadriceps"
  | "hamstrings"
  | "adductors"
  | "abductors"
  | "calves";

export type MovementPhase = {
  id: string;
  label: string;
  cue: string;
  durationMs: number;
};

export type ExerciseVisualizationAsset = {
  kind: "sprite" | "video" | "imageSequence";
  src: string;
  frameCount: number;
  version: string;
};

export type ExerciseVisualization = {
  animationAsset?: ExerciseVisualizationAsset;
  anatomyAsset: string;
  preferredCameraAngle: CameraAngle;
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  movementPhases: MovementPhase[];
};

export type ExerciseMedia = {
  start: string;
  end: string;
  attribution?: string;
};

export type ExerciseRecord = {
  id: string;
  name: string;
  baseName: string;
  englishName: string;
  aliases: string[];
  muscle: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  primaryMuscleIds: MuscleId[];
  secondaryMuscleIds: MuscleId[];
  equipment: string;
  equipmentList: string[];
  level: "Podstawowy" | "Średni" | "Zaawansowany";
  pattern: MovementPattern;
  familyId: string;
  familyName: string;
  exerciseTypes: string[];
  laterality: ExerciseLaterality;
  tags: string[];
  goal: string;
  protocol: string;
  instruction: string;
  cues: string[];
  commonMistake: string;
  commonMistakes: string[];
  media?: ExerciseMedia;
  visualization: ExerciseVisualization;
  source: ExerciseSource;
  active: boolean;
  used: number;
};

type ExerciseBase = Pick<ExerciseRecord, "baseName" | "muscle" | "equipment" | "pattern" | "goal" | "instruction" | "commonMistake">;

const bases: ExerciseBase[] = [
  { baseName: "Przysiad goblet", muscle: "Nogi", equipment: "Hantel", pattern: "squat", goal: "Sprawność", instruction: "Utrzymaj stabilny tułów, prowadź kolana nad stopami i zejdź tak nisko, jak pozwala kontrola.", commonMistake: "Zapadanie kolan do środka i odrywanie pięt." },
  { baseName: "Przysiad ze sztangą", muscle: "Nogi", equipment: "Sztanga", pattern: "squat", goal: "Siła", instruction: "Napnij brzuch przed zejściem, zachowaj pełną stopę na podłożu i wstań prowadząc biodra oraz barki razem.", commonMistake: "Utrata napięcia tułowia w dolnej fazie." },
  { baseName: "Przysiad przedni", muscle: "Nogi", equipment: "Sztanga", pattern: "squat", goal: "Siła", instruction: "Trzymaj łokcie wysoko, klatkę stabilnie i kontroluj zejście bez utraty neutralnej pozycji kręgosłupa.", commonMistake: "Opuszczanie łokci i pochylanie tułowia." },
  { baseName: "Przysiad do skrzyni", muscle: "Nogi", equipment: "Skrzynia", pattern: "squat", goal: "Technika", instruction: "Cofnij biodra do wyznaczonej wysokości, dotknij skrzyni bez rozluźniania i wróć do stania.", commonMistake: "Opadanie na skrzynię bez kontroli." },
  { baseName: "Martwy ciąg klasyczny", muscle: "Tył ciała", equipment: "Sztanga", pattern: "hinge", goal: "Siła", instruction: "Ustaw sztangę nad środkiem stopy, napnij grzbiet i wypchnij podłoże nogami bez szarpania.", commonMistake: "Oddalanie sztangi od nóg i zaokrąglanie pleców." },
  { baseName: "Rumuński martwy ciąg", muscle: "Tył ciała", equipment: "Sztanga", pattern: "hinge", goal: "Masa mięśniowa", instruction: "Cofaj biodra przy lekko ugiętych kolanach, prowadząc ciężar blisko ud i goleni.", commonMistake: "Zamiana zawiasu biodrowego w przysiad." },
  { baseName: "Hip thrust", muscle: "Pośladki", equipment: "Ławka i sztanga", pattern: "hinge", goal: "Masa mięśniowa", instruction: "Dociśnij żebra, wypchnij biodra do pełnego wyprostu i zakończ ruch napięciem pośladków.", commonMistake: "Przeprost odcinka lędźwiowego zamiast bioder." },
  { baseName: "Good morning", muscle: "Tył ciała", equipment: "Sztanga", pattern: "hinge", goal: "Siła", instruction: "Utrzymaj napięty tułów i cofaj biodra do momentu zachowania pełnej kontroli.", commonMistake: "Zbyt duży ciężar i utrata neutralnych pleców." },
  { baseName: "Wyciskanie leżąc", muscle: "Klatka", equipment: "Sztanga", pattern: "push", goal: "Siła", instruction: "Ustaw łopatki stabilnie, opuść ciężar pod kontrolą i wyciśnij nad linię barków.", commonMistake: "Odrywanie barków od ławki i rozchodzenie łokci." },
  { baseName: "Pompka", muscle: "Klatka", equipment: "Masa ciała", pattern: "push", goal: "Sprawność", instruction: "Utrzymaj ciało w jednej linii, opuść klatkę między dłońmi i odepchnij podłoże.", commonMistake: "Opadanie bioder lub wysuwanie głowy." },
  { baseName: "Wyciskanie nad głowę", muscle: "Barki", equipment: "Sztanga", pattern: "push", goal: "Siła", instruction: "Napnij pośladki i brzuch, prowadź ciężar pionowo i zakończ z ramionami nad głową.", commonMistake: "Odchylanie tułowia i nadmierny przeprost pleców." },
  { baseName: "Wyciskanie hantli skos", muscle: "Klatka", equipment: "Hantle", pattern: "push", goal: "Masa mięśniowa", instruction: "Stabilizuj łopatki, kontroluj dolną fazę i prowadź hantle po powtarzalnym torze.", commonMistake: "Zderzanie hantli i utrata kontroli na dole." },
  { baseName: "Podciąganie nachwytem", muscle: "Plecy", equipment: "Drążek", pattern: "pull", goal: "Siła", instruction: "Rozpocznij ruchem łopatek, prowadź klatkę do drążka i wróć do pełnego zwisu pod kontrolą.", commonMistake: "Kołysanie tułowiem i skracanie zakresu." },
  { baseName: "Ściąganie drążka", muscle: "Plecy", equipment: "Wyciąg", pattern: "pull", goal: "Masa mięśniowa", instruction: "Utrzymaj stabilny tułów i prowadź łokcie w dół bez szarpania ciężaru.", commonMistake: "Nadmierne odchylanie i ciągnięcie samymi dłońmi." },
  { baseName: "Wiosłowanie jednorącz", muscle: "Plecy", equipment: "Hantel", pattern: "pull", goal: "Masa mięśniowa", instruction: "Utrzymaj biodra i tułów nieruchomo, prowadząc łokieć w kierunku biodra.", commonMistake: "Rotowanie całego tułowia w końcu ruchu." },
  { baseName: "Wiosłowanie siedząc", muscle: "Plecy", equipment: "Wyciąg", pattern: "pull", goal: "Postawa", instruction: "Zachowaj wysoki tułów, cofnij łopatki i przyciągnij uchwyt bez odchylania pleców.", commonMistake: "Kołysanie tułowiem zamiast pracy łopatek." },
  { baseName: "Wykrok w tył", muscle: "Nogi", equipment: "Hantle", pattern: "lunge", goal: "Sprawność", instruction: "Cofnij stopę, obniż biodra pionowo i wróć naciskając całą stopą nogi z przodu.", commonMistake: "Uciekanie kolana do środka." },
  { baseName: "Przysiad bułgarski", muscle: "Nogi", equipment: "Hantle", pattern: "lunge", goal: "Masa mięśniowa", instruction: "Ustaw stabilny wykrok, schodź pionowo i utrzymuj ciężar nad pracującą nogą.", commonMistake: "Zbyt wąskie ustawienie stóp i utrata równowagi." },
  { baseName: "Wejście na podest", muscle: "Nogi", equipment: "Podest", pattern: "lunge", goal: "Sprawność", instruction: "Postaw całą stopę na podeście i wstań bez odbijania się nogą pozostającą na ziemi.", commonMistake: "Odpychanie się dolną nogą." },
  { baseName: "Wykrok boczny", muscle: "Nogi", equipment: "Masa ciała", pattern: "lunge", goal: "Mobilność", instruction: "Przenieś biodra nad jedną nogę, utrzymując drugą wyprostowaną i całą stopę na podłożu.", commonMistake: "Odrywanie pięty i skręcanie kolana." },
  { baseName: "Dead bug", muscle: "Core", equipment: "Mata", pattern: "core", goal: "Stabilizacja", instruction: "Dociśnij odcinek lędźwiowy do maty i wydłużaj przeciwległe kończyny bez utraty napięcia.", commonMistake: "Odrywanie lędźwi od podłoża." },
  { baseName: "Plank", muscle: "Core", equipment: "Mata", pattern: "core", goal: "Stabilizacja", instruction: "Ustaw żebra nad miednicą, napnij pośladki i utrzymuj długą linię ciała.", commonMistake: "Opadanie bioder lub wstrzymywanie oddechu." },
  { baseName: "Pallof press", muscle: "Core", equipment: "Wyciąg", pattern: "core", goal: "Stabilizacja", instruction: "Ustaw stopy stabilnie i wyprostuj ręce bez pozwalania, aby tułów obrócił się w stronę wyciągu.", commonMistake: "Rotacja tułowia pod wpływem oporu." },
  { baseName: "Bird dog", muscle: "Core", equipment: "Mata", pattern: "core", goal: "Postawa", instruction: "Wydłuż przeciwległą rękę i nogę, utrzymując miednicę równolegle do podłoża.", commonMistake: "Rotowanie bioder i unoszenie nogi zbyt wysoko." },
  { baseName: "Mobilizacja bioder 90/90", muscle: "Mobilność", equipment: "Mata", pattern: "mobility", goal: "Mobilność", instruction: "Poruszaj się powoli między pozycjami, nie wymuszając zakresu i utrzymując spokojny oddech.", commonMistake: "Szybkie ruchy i dociskanie stawu przez ból." },
];

type ExerciseEnrichment = Partial<Pick<ExerciseRecord,
  "englishName" | "aliases" | "primaryMuscles" | "secondaryMuscles" | "equipmentList" | "familyId" | "familyName" |
  "exerciseTypes" | "laterality" | "tags" | "cues" | "commonMistakes" | "media"
>>;

const mediaRoot = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";
const mediaPair = (slug: string): ExerciseMedia => ({
  start: `${mediaRoot}/${slug}/0.jpg`,
  end: `${mediaRoot}/${slug}/1.jpg`,
  attribution: "free-exercise-db",
});

const enrichments: Record<string, ExerciseEnrichment> = {
  "Przysiad goblet": { englishName: "Goblet Squat", aliases: ["goblet", "przysiad z hantlem"], primaryMuscles: ["Czworogłowe uda"], secondaryMuscles: ["Pośladki", "Core"], familyId: "squat", familyName: "Przysiad", tags: ["quad dominant", "beginner friendly"] },
  "Przysiad ze sztangą": { englishName: "Barbell Back Squat", aliases: ["back squat", "przysiad tylni"], primaryMuscles: ["Czworogłowe uda", "Pośladki"], secondaryMuscles: ["Core", "Dwugłowe uda"], familyId: "squat", familyName: "Przysiad", tags: ["free weights", "quad dominant"] },
  "Przysiad przedni": { englishName: "Front Squat", aliases: ["front squat", "przysiad z przodu"], primaryMuscles: ["Czworogłowe uda"], secondaryMuscles: ["Pośladki", "Core"], familyId: "squat", familyName: "Przysiad", tags: ["free weights", "quad dominant"] },
  "Przysiad do skrzyni": { englishName: "Box Squat", aliases: ["box squat"], primaryMuscles: ["Pośladki", "Czworogłowe uda"], secondaryMuscles: ["Dwugłowe uda", "Core"], familyId: "squat", familyName: "Przysiad", tags: ["beginner friendly"] },
  "Martwy ciąg klasyczny": { englishName: "Conventional Deadlift", aliases: ["deadlift", "martwy", "ciąg klasyczny"], primaryMuscles: ["Pośladki", "Dwugłowe uda", "Plecy"], secondaryMuscles: ["Przedramiona", "Core"], familyId: "deadlift", familyName: "Martwy ciąg", tags: ["free weights", "hamstring dominant"] },
  "Rumuński martwy ciąg": { englishName: "Romanian Deadlift", aliases: ["rdl", "martwy rumuński", "rumuński martwy ciąg", "martwy ciąg rumuński"], primaryMuscles: ["Dwugłowe uda"], secondaryMuscles: ["Pośladki", "Prostowniki grzbietu"], familyId: "hip-hinge", familyName: "Hip Hinge", tags: ["hamstring dominant", "free weights"] },
  "Hip thrust": { englishName: "Barbell Hip Thrust", aliases: ["hip thrust", "unoszenie bioder", "wypychanie bioder"], primaryMuscles: ["Pośladki"], secondaryMuscles: ["Dwugłowe uda", "Core"], familyId: "hip-thrust", familyName: "Wyprost biodra", tags: ["glute dominant", "free weights"] },
  "Good morning": { englishName: "Good Morning", aliases: ["dzień dobry", "skłon ze sztangą"], primaryMuscles: ["Dwugłowe uda"], secondaryMuscles: ["Pośladki", "Prostowniki grzbietu"], familyId: "hip-hinge", familyName: "Hip Hinge", tags: ["hamstring dominant", "free weights"] },
  "Wyciskanie leżąc": { englishName: "Barbell Bench Press", aliases: ["bench", "bench press", "wyciskanie", "wyciskanie sztangi", "wyciskanie leżąc"], primaryMuscles: ["Klatka piersiowa"], secondaryMuscles: ["Triceps", "Barki"], equipmentList: ["Sztanga", "Ławka"], familyId: "horizontal-chest-press", familyName: "Horizontal Chest Press", tags: ["horizontal push", "free weights"], media: mediaPair("Barbell_Bench_Press_-_Medium_Grip") },
  "Pompka": { englishName: "Push-up", aliases: ["push up", "pompki"], primaryMuscles: ["Klatka piersiowa"], secondaryMuscles: ["Triceps", "Barki", "Core"], familyId: "horizontal-chest-press", familyName: "Horizontal Chest Press", tags: ["horizontal push", "bodyweight", "home workout"] },
  "Wyciskanie nad głowę": { englishName: "Overhead Press", aliases: ["ohp", "military press", "wyciskanie żołnierskie"], primaryMuscles: ["Barki"], secondaryMuscles: ["Triceps", "Core"], familyId: "vertical-press", familyName: "Vertical Press", tags: ["vertical push", "free weights"] },
  "Wyciskanie hantli skos": { englishName: "Incline Dumbbell Press", aliases: ["incline press", "skos hantle", "wyciskanie hantli na skosie"], primaryMuscles: ["Klatka piersiowa"], secondaryMuscles: ["Barki", "Triceps"], equipmentList: ["Hantle", "Ławka"], familyId: "horizontal-chest-press", familyName: "Horizontal Chest Press", tags: ["horizontal push", "free weights"], media: mediaPair("Incline_Dumbbell_Press") },
  "Podciąganie nachwytem": { englishName: "Pull-up", aliases: ["pullup", "pull up", "podciąganie", "drążek"], primaryMuscles: ["Plecy"], secondaryMuscles: ["Biceps", "Przedramiona"], familyId: "vertical-pull", familyName: "Vertical Pull", tags: ["vertical pull", "bodyweight"], media: mediaPair("Pullups") },
  "Ściąganie drążka": { englishName: "Lat Pulldown", aliases: ["lat pulldown", "ściąganie wyciągu", "wyciąg górny"], primaryMuscles: ["Plecy"], secondaryMuscles: ["Biceps", "Przedramiona"], familyId: "vertical-pull", familyName: "Vertical Pull", tags: ["vertical pull", "machine"], media: mediaPair("Wide-Grip_Lat_Pulldown") },
  "Wiosłowanie jednorącz": { englishName: "One-arm Dumbbell Row", aliases: ["one arm row", "wiosło hantlem"], primaryMuscles: ["Plecy"], secondaryMuscles: ["Biceps", "Przedramiona"], familyId: "horizontal-row", familyName: "Horizontal Pull", laterality: "unilateral", tags: ["horizontal pull", "unilateral", "free weights"] },
  "Wiosłowanie siedząc": { englishName: "Seated Cable Row", aliases: ["cable row", "wiosło na wyciągu"], primaryMuscles: ["Plecy"], secondaryMuscles: ["Biceps", "Barki"], familyId: "horizontal-row", familyName: "Horizontal Pull", tags: ["horizontal pull", "machine"], media: mediaPair("Seated_Cable_Rows") },
  "Wykrok w tył": { englishName: "Reverse Lunge", aliases: ["reverse lunge", "zakrok"], primaryMuscles: ["Czworogłowe uda", "Pośladki"], secondaryMuscles: ["Dwugłowe uda", "Core"], familyId: "lunge", familyName: "Wykrok", laterality: "unilateral", tags: ["unilateral", "quad dominant"] },
  "Przysiad bułgarski": { englishName: "Bulgarian Split Squat", aliases: ["bulgar", "bułgar", "split squat"], primaryMuscles: ["Czworogłowe uda", "Pośladki"], secondaryMuscles: ["Dwugłowe uda", "Core"], equipmentList: ["Hantle", "Ławka"], familyId: "split-squat", familyName: "Split Squat", laterality: "unilateral", tags: ["unilateral", "quad dominant", "free weights"], media: mediaPair("Split_Squat_with_Dumbbells") },
  "Wejście na podest": { englishName: "Step-up", aliases: ["step up", "wejścia na skrzynię"], primaryMuscles: ["Czworogłowe uda", "Pośladki"], secondaryMuscles: ["Dwugłowe uda", "Łydki"], familyId: "step-up", familyName: "Step-up", laterality: "unilateral", tags: ["unilateral", "quad dominant"] },
  "Wykrok boczny": { englishName: "Lateral Lunge", aliases: ["side lunge", "wykrok w bok"], primaryMuscles: ["Przywodziciele", "Pośladki"], secondaryMuscles: ["Czworogłowe uda"], familyId: "lunge", familyName: "Wykrok", laterality: "unilateral", tags: ["unilateral", "mobility"] },
  "Dead bug": { englishName: "Dead Bug", aliases: ["martwy robak"], primaryMuscles: ["Core"], secondaryMuscles: ["Zginacze biodra"], familyId: "anti-extension", familyName: "Anti-Extension", laterality: "unilateral", tags: ["core", "beginner friendly", "home workout"] },
  "Plank": { englishName: "Plank", aliases: ["deska", "plank statyczny"], primaryMuscles: ["Core"], secondaryMuscles: ["Barki", "Pośladki"], familyId: "anti-extension", familyName: "Anti-Extension", tags: ["core", "bodyweight", "home workout"], media: mediaPair("Plank") },
  "Pallof press": { englishName: "Pallof Press", aliases: ["pallof", "antyrotacja na wyciągu"], primaryMuscles: ["Core"], secondaryMuscles: ["Barki"], familyId: "anti-rotation", familyName: "Anti-Rotation", tags: ["core", "anti-rotation"] },
  "Bird dog": { englishName: "Bird Dog", aliases: ["naprzemienne unoszenie kończyn", "ptak pies"], primaryMuscles: ["Core"], secondaryMuscles: ["Pośladki", "Barki"], familyId: "anti-rotation", familyName: "Anti-Rotation", laterality: "unilateral", tags: ["core", "beginner friendly", "home workout"] },
  "Mobilizacja bioder 90/90": { englishName: "90/90 Hip Switch", aliases: ["90 90", "hip switch", "rotacja bioder"], primaryMuscles: ["Mobilność bioder"], secondaryMuscles: ["Pośladki", "Przywodziciele"], familyId: "hip-mobility", familyName: "Mobilność bioder", tags: ["mobility", "home workout"] },
};

export const muscleLabels: Record<MuscleId, string> = {
  pectoralisMajor: "Klatka piersiowa",
  upperChest: "Górna część klatki",
  latissimusDorsi: "Najszerszy grzbietu",
  trapezius: "Mięsień czworoboczny",
  anteriorDeltoid: "Przedni akton barków",
  lateralDeltoid: "Boczny akton barków",
  posteriorDeltoid: "Tylny akton barków",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Przedramiona",
  rectusAbdominis: "Mięsień prosty brzucha",
  obliques: "Mięśnie skośne brzucha",
  erectorSpinae: "Prostowniki grzbietu",
  gluteusMaximus: "Pośladkowy wielki",
  quadriceps: "Czworogłowe uda",
  hamstrings: "Dwugłowe uda",
  adductors: "Przywodziciele",
  abductors: "Odwodziciele",
  calves: "Łydki",
};

const muscleIdsByName: Record<string, MuscleId[]> = {
  "Klatka piersiowa": ["pectoralisMajor"],
  "Górna część klatki": ["upperChest"],
  Plecy: ["latissimusDorsi", "trapezius"],
  Barki: ["anteriorDeltoid", "lateralDeltoid"],
  Biceps: ["biceps"],
  Triceps: ["triceps"],
  Przedramiona: ["forearms"],
  Core: ["rectusAbdominis", "obliques"],
  "Prostowniki grzbietu": ["erectorSpinae"],
  Pośladki: ["gluteusMaximus"],
  "Czworogłowe uda": ["quadriceps"],
  "Dwugłowe uda": ["hamstrings"],
  Przywodziciele: ["adductors"],
  Odwodziciele: ["abductors"],
  Łydki: ["calves"],
  "Tył ciała": ["hamstrings", "gluteusMaximus", "erectorSpinae"],
  Nogi: ["quadriceps", "hamstrings", "gluteusMaximus"],
  "Mobilność bioder": ["adductors", "abductors", "gluteusMaximus"],
  "Zginacze biodra": ["rectusAbdominis"],
};

export function muscleIdsForNames(names: string[]) {
  return Array.from(new Set(names.flatMap((name) => muscleIdsByName[name] ?? [])));
}

const cameraAngles: Record<MovementPattern, CameraAngle> = {
  squat: "frontThreeQuarter",
  hinge: "side",
  push: "frontThreeQuarter",
  pull: "rearThreeQuarter",
  lunge: "frontThreeQuarter",
  core: "side",
  mobility: "frontThreeQuarter",
};

const defaultPhases: Record<MovementPattern, MovementPhase[]> = {
  squat: [
    { id: "start", label: "Pozycja startowa", cue: "Stabilna stopa i napięty tułów", durationMs: 650 },
    { id: "descent", label: "Kontrolowane zejście", cue: "Kolana prowadź nad stopami", durationMs: 700 },
    { id: "bottom", label: "Dolna pozycja", cue: "Zachowaj kontrolę i równowagę", durationMs: 800 },
    { id: "return", label: "Powrót", cue: "Odepchnij podłoże całą stopą", durationMs: 700 },
    { id: "finish", label: "Pełny wyprost", cue: "Wróć do stabilnej pozycji", durationMs: 650 },
  ],
  hinge: [
    { id: "start", label: "Pozycja startowa", cue: "Ustaw stabilny tułów", durationMs: 650 },
    { id: "hinge", label: "Cofnij biodra", cue: "Ciężar prowadź blisko ciała", durationMs: 700 },
    { id: "bottom", label: "Dolna pozycja", cue: "Zatrzymaj zakres przed utratą pozycji", durationMs: 850 },
    { id: "return", label: "Wyprost biodra", cue: "Wróć bez szarpania", durationMs: 700 },
    { id: "finish", label: "Pozycja końcowa", cue: "Stań wysoko bez przeprostu", durationMs: 650 },
  ],
  push: [
    { id: "start", label: "Pozycja startowa", cue: "Ustaw łopatki i chwyt", durationMs: 650 },
    { id: "lower", label: "Opuszczanie", cue: "Kontroluj tor ruchu", durationMs: 700 },
    { id: "bottom", label: "Dolna pozycja", cue: "Zachowaj stabilność barków", durationMs: 800 },
    { id: "press", label: "Wyciskanie", cue: "Prowadź ciężar płynnie", durationMs: 700 },
    { id: "finish", label: "Pozycja końcowa", cue: "Zakończ bez utraty napięcia", durationMs: 650 },
  ],
  pull: [
    { id: "start", label: "Pełny zakres", cue: "Ustaw stabilny tułów", durationMs: 650 },
    { id: "initiate", label: "Rozpocznij łopatką", cue: "Nie szarp ciężaru", durationMs: 700 },
    { id: "pull", label: "Przyciągnięcie", cue: "Prowadź łokcie w kierunku tułowia", durationMs: 800 },
    { id: "return", label: "Kontrolowany powrót", cue: "Oddawaj ciężar spokojnie", durationMs: 700 },
    { id: "finish", label: "Pozycja startowa", cue: "Wróć do pełnego zakresu", durationMs: 650 },
  ],
  lunge: [
    { id: "start", label: "Pozycja startowa", cue: "Ustaw stabilną bazę", durationMs: 650 },
    { id: "step", label: "Ustawienie nogi", cue: "Kontroluj biodra i kolano", durationMs: 700 },
    { id: "bottom", label: "Dolna pozycja", cue: "Utrzymaj równowagę", durationMs: 800 },
    { id: "return", label: "Powrót", cue: "Odepchnij podłoże pracującą nogą", durationMs: 700 },
    { id: "finish", label: "Stabilna pozycja", cue: "Wróć bez kołysania", durationMs: 650 },
  ],
  core: [
    { id: "start", label: "Pozycja startowa", cue: "Ustaw żebra nad miednicą", durationMs: 700 },
    { id: "brace", label: "Napięcie", cue: "Utrzymaj spokojny oddech", durationMs: 750 },
    { id: "work", label: "Kontrolowany ruch", cue: "Nie trać ustawienia tułowia", durationMs: 850 },
    { id: "return", label: "Powrót", cue: "Wróć bez rozluźnienia", durationMs: 750 },
    { id: "finish", label: "Pozycja końcowa", cue: "Zachowaj napięcie", durationMs: 700 },
  ],
  mobility: [
    { id: "start", label: "Pozycja startowa", cue: "Nie wymuszaj zakresu", durationMs: 750 },
    { id: "move", label: "Płynne przejście", cue: "Oddychaj swobodnie", durationMs: 850 },
    { id: "range", label: "Końcowy zakres", cue: "Zatrzymaj się przed bólem", durationMs: 900 },
    { id: "return", label: "Powrót", cue: "Poruszaj się spokojnie", durationMs: 850 },
    { id: "finish", label: "Pozycja startowa", cue: "Rozluźnij napięcie", durationMs: 750 },
  ],
};

const visualizationAssets: Record<string, ExerciseVisualizationAsset> = {
  "Rumuński martwy ciąg": {
    kind: "sprite",
    src: "/exercise-visuals/romanian-deadlift-realistic-female-v01.png",
    frameCount: 5,
    version: "realistic-v01",
  },
};

export function createExerciseVisualization(pattern: MovementPattern, primaryMuscles: MuscleId[], secondaryMuscles: MuscleId[], baseName?: string): ExerciseVisualization {
  return {
    animationAsset: baseName ? visualizationAssets[baseName] : undefined,
    anatomyAsset: "/exercise-visuals/anatomy-female-front-back-v01.png",
    preferredCameraAngle: cameraAngles[pattern],
    primaryMuscles,
    secondaryMuscles,
    movementPhases: defaultPhases[pattern],
  };
}

function inferExerciseTypes(base: ExerciseBase) {
  if (base.pattern === "mobility") return ["mobilizacyjne", "rozgrzewkowe"];
  if (base.pattern === "core") return ["core", "stabilizacyjne"];
  return ["siłowe", "hipertroficzne", base.pattern === "push" || base.pattern === "pull" ? "wielostawowe" : "wielostawowe"];
}

function enrichBase(base: ExerciseBase) {
  const extra = enrichments[base.baseName] ?? {};
  const primaryMuscles = extra.primaryMuscles ?? [base.muscle];
  const secondaryMuscles = extra.secondaryMuscles ?? [];
  const primaryMuscleIds = muscleIdsForNames(primaryMuscles);
  const secondaryMuscleIds = muscleIdsForNames(secondaryMuscles).filter((id) => !primaryMuscleIds.includes(id));
  const equipmentList = extra.equipmentList ?? base.equipment.split(" i ");
  const familyId = extra.familyId ?? base.pattern;
  return {
    englishName: extra.englishName ?? base.baseName,
    aliases: extra.aliases ?? [],
    primaryMuscles,
    secondaryMuscles,
    primaryMuscleIds,
    secondaryMuscleIds,
    equipmentList,
    familyId,
    familyName: extra.familyName ?? base.pattern,
    exerciseTypes: extra.exerciseTypes ?? inferExerciseTypes(base),
    laterality: extra.laterality ?? (base.baseName.includes("jednorącz") ? "unilateral" : "bilateral"),
    tags: Array.from(new Set([base.pattern, base.goal.toLowerCase(), ...(extra.tags ?? [])])),
    cues: extra.cues ?? ["Kontroluj tempo ruchu", "Utrzymuj stabilny tułów", "Oddychaj swobodnie"],
    commonMistakes: extra.commonMistakes ?? [base.commonMistake],
    media: extra.media,
    visualization: createExerciseVisualization(base.pattern, primaryMuscleIds, secondaryMuscleIds, base.baseName),
  };
}

const techniques = [
  { label: "wersja bazowa", level: "Podstawowy" as const },
  { label: "tempo 3-1-1", level: "Średni" as const },
  { label: "pauza w końcowej fazie", level: "Średni" as const },
  { label: "kontrola ekscentryczna", level: "Średni" as const },
  { label: "zakres częściowy", level: "Podstawowy" as const },
  { label: "pełny zakres", level: "Średni" as const },
  { label: "wersja jednostronna", level: "Zaawansowany" as const },
  { label: "wersja dynamiczna", level: "Zaawansowany" as const },
];

const protocols = ["3 × 8", "3 × 10", "3 × 12", "4 × 5", "4 × 6", "4 × 8", "5 × 5", "EMOM 8 min", "45 s pracy", "RPE 7–8"];

export const exerciseLibrary: ExerciseRecord[] = bases.flatMap((base, baseIndex) =>
  techniques.flatMap((technique, techniqueIndex) =>
    protocols.map((protocol, protocolIndex) => ({
      ...base,
      ...enrichBase(base),
      id: `ex-${String(baseIndex + 1).padStart(2, "0")}-${techniqueIndex + 1}-${protocolIndex + 1}`,
      name: `${base.baseName} · ${technique.label}`,
      level: technique.level,
      protocol,
      source: "system" as const,
      active: true,
      used: 6 + ((baseIndex * 7 + techniqueIndex * 3 + protocolIndex) % 28),
    })),
  ),
);

export const exerciseCategories = ["Wszystkie", "Nogi", "Tył ciała", "Pośladki", "Klatka", "Plecy", "Barki", "Core", "Mobilność"];

export function suggestExercises(goal: string, limit = 12) {
  const normalized = goal.toLowerCase();
  const preferredPatterns: MovementPattern[] = normalized.includes("mobil") || normalized.includes("ból")
    ? ["mobility", "core", "hinge"]
    : normalized.includes("sił") || normalized.includes("masa")
      ? ["squat", "hinge", "push", "pull"]
      : normalized.includes("redu") || normalized.includes("spraw")
        ? ["squat", "lunge", "push", "pull", "core"]
        : ["squat", "hinge", "push", "pull", "core", "mobility"];

  const unique = exerciseLibrary.filter((item, index) => preferredPatterns.includes(item.pattern) && index % 17 === 0);
  return unique.slice(0, limit);
}

export type ExerciseFilters = {
  muscles?: string[];
  patterns?: MovementPattern[];
  equipment?: string[];
  levels?: ExerciseRecord["level"][];
  laterality?: ExerciseLaterality[];
  source?: ExerciseSource[];
};

export const movementPatternLabels: Record<MovementPattern, string> = {
  squat: "Squat",
  hinge: "Hinge",
  push: "Push",
  pull: "Pull",
  lunge: "Lunge",
  core: "Core",
  mobility: "Mobility",
};

export const libraryFilterOptions = {
  muscles: Array.from(new Set(exerciseLibrary.flatMap((item) => item.primaryMuscles))).sort((a, b) => a.localeCompare(b, "pl")),
  patterns: Object.keys(movementPatternLabels) as MovementPattern[],
  equipment: Array.from(new Set(exerciseLibrary.flatMap((item) => item.equipmentList))).sort((a, b) => a.localeCompare(b, "pl")),
  levels: ["Podstawowy", "Średni", "Zaawansowany"] as ExerciseRecord["level"][],
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string) {
  if (!a) return b.length;
  if (!b) return a.length;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return previous[b.length];
}

export function scoreExerciseSearch(exercise: ExerciseRecord, rawQuery: string) {
  const query = normalizeSearch(rawQuery);
  if (!query) return exercise.used;
  const name = normalizeSearch(exercise.baseName);
  const english = normalizeSearch(exercise.englishName);
  const aliases = exercise.aliases.map(normalizeSearch);
  const family = normalizeSearch(exercise.familyName);
  const tags = exercise.tags.map(normalizeSearch);
  const muscles = [...exercise.primaryMuscles, ...exercise.secondaryMuscles].map(normalizeSearch);
  const equipment = exercise.equipmentList.map(normalizeSearch);

  if (name === query || english === query) return 10000 + exercise.used;
  if (aliases.includes(query)) return 9000 + exercise.used;
  if (name.startsWith(query) || english.startsWith(query)) return 8000 + exercise.used;
  if (aliases.some((alias) => alias.startsWith(query))) return 7000 + exercise.used;
  if (name.includes(query) || english.includes(query)) return 6000 + exercise.used;
  if (aliases.some((alias) => alias.includes(query))) return 5000 + exercise.used;
  if (family.includes(query)) return 4000 + exercise.used;
  if (tags.some((tag) => tag.includes(query))) return 3000 + exercise.used;
  if (muscles.some((muscle) => muscle.includes(query))) return 2000 + exercise.used;
  if (equipment.some((item) => item.includes(query))) return 1500 + exercise.used;

  const candidates = [name, english, ...aliases];
  const distance = Math.min(...candidates.map((candidate) => levenshtein(candidate.slice(0, Math.max(query.length, 3)), query)));
  return distance <= Math.max(1, Math.floor(query.length / 4)) ? 1000 - distance * 100 + exercise.used : -1;
}

export function filterExercises(exercises: ExerciseRecord[], filters: ExerciseFilters = {}) {
  return exercises.filter((exercise) => {
    if (!exercise.active) return false;
    if (filters.muscles?.length && !filters.muscles.some((muscle) => [...exercise.primaryMuscles, ...exercise.secondaryMuscles].includes(muscle))) return false;
    if (filters.patterns?.length && !filters.patterns.includes(exercise.pattern)) return false;
    if (filters.equipment?.length && !filters.equipment.every((item) => exercise.equipmentList.includes(item))) return false;
    if (filters.levels?.length && !filters.levels.includes(exercise.level)) return false;
    if (filters.laterality?.length && !filters.laterality.includes(exercise.laterality)) return false;
    if (filters.source?.length && !filters.source.includes(exercise.source)) return false;
    return true;
  });
}

export function searchExercises(query: string, options: { exercises?: ExerciseRecord[]; filters?: ExerciseFilters; limit?: number } = {}) {
  const source = filterExercises(options.exercises ?? exerciseLibrary, options.filters);
  return source
    .map((exercise) => ({ exercise, score: scoreExerciseSearch(exercise, query) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score || b.exercise.used - a.exercise.used || a.exercise.baseName.localeCompare(b.exercise.baseName, "pl"))
    .slice(0, options.limit ?? source.length)
    .map((item) => item.exercise);
}

export function getExerciseSubstitutions(exercise: ExerciseRecord, options: { equipment?: string[]; limit?: number } = {}) {
  const available = exerciseLibrary.filter((candidate) => candidate.id !== exercise.id && candidate.active);
  return available
    .map((candidate) => {
      let score = 0;
      if (candidate.familyId === exercise.familyId) score += 50;
      if (candidate.pattern === exercise.pattern) score += 24;
      score += candidate.primaryMuscles.filter((muscle) => exercise.primaryMuscles.includes(muscle)).length * 12;
      score += candidate.secondaryMuscles.filter((muscle) => exercise.secondaryMuscles.includes(muscle)).length * 4;
      if (candidate.laterality === exercise.laterality) score += 7;
      if (candidate.level === exercise.level) score += 5;
      if (options.equipment?.length && candidate.equipmentList.every((item) => options.equipment!.includes(item))) score += 20;
      return { candidate, score };
    })
    .filter((item) => item.score >= 24)
    .sort((a, b) => b.score - a.score || b.candidate.used - a.candidate.used)
    .slice(0, options.limit ?? 6)
    .map((item) => item.candidate);
}
