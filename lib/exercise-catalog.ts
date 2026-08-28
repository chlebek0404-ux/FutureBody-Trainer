/**
 * Katalog ćwiczeń: dziesięć partii po dziesięć pozycji.
 *
 * Każdy wpis to osobne ćwiczenie z własną instrukcją i typowym błędem —
 * w odróżnieniu od poprzedniej biblioteki, która mnożyła kilkanaście baz
 * przez techniki i protokoły, prezentując wynik jako dwa tysiące ćwiczeń.
 */

import type { MovementPattern } from "@/lib/exercise-library";

export type CatalogEntry = {
  name: string;
  english: string;
  group: string;
  equipment: string;
  pattern: MovementPattern;
  level: "Podstawowy" | "Średni" | "Zaawansowany";
  primary: string[];
  secondary: string[];
  instruction: string;
  mistake: string;
  aliases: string[];
};

export const exerciseGroups = [
  "Klatka", "Plecy", "Barki", "Biceps", "Triceps",
  "Nogi", "Pośladki", "Brzuch", "Łydki", "Mobilność",
] as const;

type Row = [string, string, string, MovementPattern, CatalogEntry["level"], string[], string[], string, string, string[]];

const rows: Record<string, Row[]> = {
  Klatka: [
    ["Wyciskanie sztangi leżąc", "Barbell Bench Press", "Sztanga", "push", "Średni", ["Klatka piersiowa"], ["Triceps", "Barki"], "Ustaw łopatki ściągnięte i stabilne, opuść sztangę do dolnej części klatki i wyciśnij nad linię barków.", "Odrywanie łopatek od ławki i rozchodzenie łokci na boki.", ["bench", "bench press", "wyciskanie"]],
    ["Wyciskanie hantli leżąc", "Dumbbell Bench Press", "Hantle", "push", "Podstawowy", ["Klatka piersiowa"], ["Triceps", "Barki"], "Prowadź hantle po powtarzalnym torze, zatrzymaj się na wysokości klatki i wyciśnij bez zderzania ciężarów.", "Zbyt głębokie schodzenie kosztem stabilności barku.", ["dumbbell press", "wyciskanie hantli"]],
    ["Wyciskanie sztangi na skosie", "Incline Barbell Press", "Sztanga", "push", "Średni", ["Górna część klatki"], ["Barki", "Triceps"], "Ustaw ławkę na 30 stopni, opuść sztangę do górnej części klatki i wyciśnij po skosie.", "Zbyt duży kąt ławki, który przenosi pracę na barki.", ["incline press", "skos sztanga"]],
    ["Wyciskanie hantli na skosie", "Incline Dumbbell Press", "Hantle", "push", "Podstawowy", ["Górna część klatki"], ["Barki", "Triceps"], "Stabilizuj łopatki, kontroluj dolną fazę i prowadź hantle nad górną częścią klatki.", "Zderzanie hantli u góry i utrata napięcia.", ["incline dumbbell", "skos hantle"]],
    ["Rozpiętki z hantlami", "Dumbbell Fly", "Hantle", "push", "Średni", ["Klatka piersiowa"], ["Barki"], "Utrzymaj lekko ugięte łokcie przez cały ruch i rozciągnij klatkę tylko do zakresu bez bólu barku.", "Prostowanie łokci i zamiana ruchu w wyciskanie.", ["fly", "rozpiętki"]],
    ["Rozpiętki na bramie", "Cable Crossover", "Wyciąg", "push", "Średni", ["Klatka piersiowa"], ["Barki"], "Zrób krok w przód dla napięcia linek, zbliż dłonie przed klatką i wróć powoli do rozciągnięcia.", "Praca samymi ramionami bez napięcia klatki.", ["crossover", "brama"]],
    ["Pompka klasyczna", "Push-up", "Masa ciała", "push", "Podstawowy", ["Klatka piersiowa"], ["Triceps", "Barki", "Core"], "Utrzymaj ciało w jednej linii, opuść klatkę między dłońmi i odepchnij podłoże pełnym wyprostem.", "Opadanie bioder i wysuwanie głowy do przodu.", ["push up", "pompki"]],
    ["Pompki na poręczach", "Chest Dip", "Poręcze", "push", "Zaawansowany", ["Klatka piersiowa"], ["Triceps", "Barki"], "Pochyl tułów lekko do przodu, zejdź do kąta prostego w łokciu i wypchnij się bez bujania.", "Zbyt głębokie schodzenie obciążające przednią część barku.", ["dipy", "dips"]],
    ["Wyciskanie na maszynie", "Chest Press Machine", "Maszyna", "push", "Podstawowy", ["Klatka piersiowa"], ["Triceps", "Barki"], "Ustaw uchwyty na wysokości środka klatki, wypchnij ciężar i wróć bez uderzania stosu.", "Zbyt wysokie ustawienie siedziska.", ["chest press", "maszyna klatka"]],
    ["Pull-over z hantlem", "Dumbbell Pull-over", "Hantel", "push", "Średni", ["Klatka piersiowa"], ["Najszerszy grzbietu", "Triceps"], "Prowadź hantel łukiem zza głowy, kontrolując żebra i nie odrywając lędźwi od ławki.", "Przeprost odcinka lędźwiowego w fazie rozciągnięcia.", ["pullover", "przenoszenie hantla"]],
  ],
  Plecy: [
    ["Podciąganie nachwytem", "Pull-up", "Drążek", "pull", "Zaawansowany", ["Plecy"], ["Biceps", "Przedramiona"], "Rozpocznij ruchem łopatek, prowadź klatkę w stronę drążka i wróć do pełnego zwisu pod kontrolą.", "Kołysanie tułowiem i skracanie zakresu ruchu.", ["pullup", "podciąganie"]],
    ["Podciąganie podchwytem", "Chin-up", "Drążek", "pull", "Średni", ["Plecy"], ["Biceps"], "Chwyć drążek podchwytem na szerokość barków i podciągnij się prowadząc łokcie wzdłuż tułowia.", "Zatrzymywanie ruchu w połowie zakresu.", ["chin up", "podchwyt"]],
    ["Ściąganie drążka szeroko", "Wide-Grip Lat Pulldown", "Wyciąg", "pull", "Podstawowy", ["Plecy"], ["Biceps", "Przedramiona"], "Utrzymaj wysoki tułów i prowadź łokcie w dół, kończąc ruch przy górnej części klatki.", "Nadmierne odchylanie tułowia i szarpanie ciężaru.", ["lat pulldown", "wyciąg górny"]],
    ["Wiosłowanie sztangą", "Barbell Row", "Sztanga", "pull", "Średni", ["Plecy"], ["Biceps", "Prostowniki grzbietu"], "Ustaw tułów w opadzie, napnij grzbiet i przyciągnij sztangę do dolnych żeber.", "Prostowanie tułowia w trakcie ciągnięcia.", ["barbell row", "wiosło sztangą"]],
    ["Wiosłowanie hantlem jednorącz", "One-arm Dumbbell Row", "Hantel", "pull", "Podstawowy", ["Plecy"], ["Biceps", "Przedramiona"], "Oprzyj się o ławkę, utrzymaj biodra nieruchomo i prowadź łokieć w kierunku biodra.", "Rotowanie tułowia na końcu ruchu.", ["one arm row", "wiosło hantlem"]],
    ["Wiosłowanie na wyciągu siedząc", "Seated Cable Row", "Wyciąg", "pull", "Podstawowy", ["Plecy"], ["Biceps", "Barki"], "Zachowaj wysoki tułów, cofnij łopatki i przyciągnij uchwyt do brzucha bez odchylania pleców.", "Kołysanie tułowiem zamiast pracy łopatek.", ["cable row", "wiosło siedząc"]],
    ["Wiosłowanie T-bar", "T-Bar Row", "Sztanga", "pull", "Średni", ["Plecy"], ["Biceps", "Prostowniki grzbietu"], "Ustaw stopy stabilnie, utrzymaj neutralny kręgosłup i przyciągnij uchwyt do brzucha.", "Zaokrąglanie pleców przy zbyt dużym ciężarze.", ["t bar", "wiosło t"]],
    ["Face pull", "Face Pull", "Wyciąg", "pull", "Podstawowy", ["Barki"], ["Plecy", "Mięsień czworoboczny"], "Ustaw wyciąg na wysokości twarzy i przyciągnij linkę do czoła, rozwodząc łokcie na boki.", "Ciągnięcie zbyt nisko i praca samymi ramionami.", ["face pull", "przyciąganie do twarzy"]],
    ["Przyciąganie prostymi rękami", "Straight-arm Pulldown", "Wyciąg", "pull", "Średni", ["Plecy"], ["Triceps", "Core"], "Utrzymaj lekko ugięte łokcie i sprowadź drążek do ud ruchem z barków.", "Uginanie łokci i zamiana ruchu w prostowanie tricepsa.", ["straight arm", "przenoszenie na wyciągu"]],
    ["Martwy ciąg klasyczny", "Conventional Deadlift", "Sztanga", "hinge", "Zaawansowany", ["Plecy", "Pośladki"], ["Dwugłowe uda", "Przedramiona"], "Ustaw sztangę nad środkiem stopy, napnij grzbiet i wypchnij podłoże nogami bez szarpania.", "Oddalanie sztangi od nóg i zaokrąglanie pleców.", ["deadlift", "martwy ciąg"]],
  ],
  Barki: [
    ["Wyciskanie żołnierskie", "Overhead Press", "Sztanga", "push", "Średni", ["Barki"], ["Triceps", "Core"], "Napnij pośladki i brzuch, prowadź sztangę pionowo i zakończ z ramionami nad głową.", "Odchylanie tułowia i przeprost odcinka lędźwiowego.", ["ohp", "military press"]],
    ["Wyciskanie hantli siedząc", "Seated Dumbbell Press", "Hantle", "push", "Podstawowy", ["Barki"], ["Triceps"], "Oprzyj plecy o oparcie, wyciśnij hantle nad głowę i wróć do wysokości uszu.", "Zbyt szerokie ustawienie łokci.", ["dumbbell shoulder press", "wyciskanie hantli barki"]],
    ["Wznosy bokiem z hantlami", "Dumbbell Lateral Raise", "Hantle", "push", "Podstawowy", ["Boczny akton barków"], ["Mięsień czworoboczny"], "Unieś ramiona do wysokości barków z lekko ugiętymi łokciami i opuść powoli.", "Unoszenie barków i wspomaganie ruchu tułowiem.", ["lateral raise", "wznosy bokiem"]],
    ["Wznosy bokiem na wyciągu", "Cable Lateral Raise", "Wyciąg", "push", "Średni", ["Boczny akton barków"], ["Mięsień czworoboczny"], "Stań bokiem do wyciągu i prowadź ramię łukiem do wysokości barku, utrzymując napięcie.", "Zbyt duży ciężar i zamach.", ["cable raise"]],
    ["Wznosy w opadzie", "Bent-over Reverse Fly", "Hantle", "pull", "Średni", ["Tylny akton barków"], ["Plecy"], "Pochyl tułów, utrzymaj plecy proste i rozwiedź ramiona na boki bez ściągania łopatek na siłę.", "Praca łopatkami zamiast tylnym aktonem barku.", ["reverse fly", "opad wznosy"]],
    ["Wznosy przodem", "Front Raise", "Hantle", "push", "Podstawowy", ["Przedni akton barków"], ["Klatka piersiowa"], "Unieś ramię przed siebie do wysokości barku i opuść pod kontrolą.", "Odchylanie tułowia i zamach biodrami.", ["front raise", "wznosy przodem"]],
    ["Arnold press", "Arnold Press", "Hantle", "push", "Średni", ["Barki"], ["Triceps"], "Rozpocznij z dłońmi do siebie, rotuj przedramiona w trakcie wyciskania i wróć tą samą drogą.", "Zbyt szybka rotacja kosztem kontroli.", ["arnold"]],
    ["Podciąganie sztangi wzdłuż tułowia", "Upright Row", "Sztanga", "pull", "Średni", ["Barki"], ["Mięsień czworoboczny", "Biceps"], "Prowadź sztangę blisko tułowia, unosząc łokcie na boki do wysokości klatki.", "Ciągnięcie zbyt wysoko, co drażni bark.", ["upright row"]],
    ["Unoszenie barków", "Barbell Shrug", "Sztanga", "pull", "Podstawowy", ["Mięsień czworoboczny"], ["Przedramiona"], "Unieś barki pionowo w stronę uszu i zatrzymaj na moment w górnej pozycji.", "Rotowanie barkami w kółko.", ["shrug", "wzruszanie barków"]],
    ["Wyciskanie barki na maszynie", "Shoulder Press Machine", "Maszyna", "push", "Podstawowy", ["Barki"], ["Triceps"], "Ustaw uchwyty na wysokości barków i wyciśnij nad głowę bez blokowania łokci.", "Zbyt niskie ustawienie siedziska.", ["shoulder machine"]],
  ],
  Biceps: [
    ["Uginanie sztangą", "Barbell Curl", "Sztanga", "pull", "Podstawowy", ["Biceps"], ["Przedramiona"], "Trzymaj łokcie przy tułowiu i ugnij ramiona bez odchylania pleców.", "Bujanie tułowiem i wspomaganie biodrami.", ["barbell curl", "uginanie ze sztangą"]],
    ["Uginanie hantlami", "Dumbbell Curl", "Hantle", "pull", "Podstawowy", ["Biceps"], ["Przedramiona"], "Uginaj ramiona naprzemiennie, obracając dłoń w supinację na górze ruchu.", "Rozkołysanie hantli zamiast pracy mięśnia.", ["dumbbell curl"]],
    ["Uginanie młotkowe", "Hammer Curl", "Hantle", "pull", "Podstawowy", ["Biceps"], ["Przedramiona"], "Utrzymaj chwyt neutralny przez cały ruch i prowadź hantle blisko tułowia.", "Rotowanie nadgarstków w trakcie ruchu.", ["hammer curl", "młotki"]],
    ["Uginanie na modlitewniku", "Preacher Curl", "Sztanga łamana", "pull", "Średni", ["Biceps"], ["Przedramiona"], "Oprzyj ramiona o pulpit i uginaj do pełnego skurczu, kontrolując fazę opuszczania.", "Gwałtowne prostowanie ramion na dole.", ["preacher", "modlitewnik"]],
    ["Uginanie na wyciągu", "Cable Curl", "Wyciąg", "pull", "Podstawowy", ["Biceps"], ["Przedramiona"], "Ustaw wyciąg nisko, utrzymaj łokcie nieruchomo i uginaj ramiona przeciw stałemu oporowi.", "Cofanie łokci do tyłu.", ["cable curl"]],
    ["Uginanie ze skosem", "Incline Dumbbell Curl", "Hantle", "pull", "Średni", ["Biceps"], ["Przedramiona"], "Usiądź na skosie z ramionami swobodnie w dole i uginaj bez unoszenia łokci.", "Podnoszenie łokci do przodu.", ["incline curl"]],
    ["Uginanie koncentryczne", "Concentration Curl", "Hantel", "pull", "Podstawowy", ["Biceps"], [], "Oprzyj łokieć o wewnętrzną stronę uda i uginaj ramię do pełnego skurczu.", "Odrywanie łokcia od uda.", ["concentration curl"]],
    ["Uginanie sztangą łamaną", "EZ-Bar Curl", "Sztanga łamana", "pull", "Podstawowy", ["Biceps"], ["Przedramiona"], "Chwyt na załamaniach gryfu odciąża nadgarstki; uginaj z łokciami przy tułowiu.", "Zbyt szeroki chwyt obciążający nadgarstki.", ["ez bar", "łamany"]],
    ["Uginanie odwrotnym chwytem", "Reverse Curl", "Sztanga", "pull", "Średni", ["Przedramiona"], ["Biceps"], "Chwyć sztangę nachwytem i uginaj ramiona, utrzymując proste nadgarstki.", "Załamywanie nadgarstków pod ciężarem.", ["reverse curl"]],
    ["Podciąganie podchwytem wąsko", "Close-Grip Chin-up", "Drążek", "pull", "Zaawansowany", ["Biceps"], ["Plecy"], "Chwyć drążek wąsko podchwytem i podciągnij się prowadząc łokcie blisko tułowia.", "Skracanie zakresu w dolnej fazie.", ["close chin up"]],
  ],
  Triceps: [
    ["Wyciskanie francuskie", "Skull Crusher", "Sztanga łamana", "push", "Średni", ["Triceps"], [], "Utrzymaj ramiona pionowo i zginaj wyłącznie łokcie, opuszczając gryf nad czoło.", "Przesuwanie ramion do tyłu i zamiana w pull-over.", ["skull crusher", "francuskie"]],
    ["Prostowanie na wyciągu", "Triceps Pushdown", "Wyciąg", "push", "Podstawowy", ["Triceps"], [], "Przyklej łokcie do tułowia i prostuj ramiona do pełnego wyprostu.", "Pomaganie sobie tułowiem i odrywanie łokci.", ["pushdown", "prostowanie linki"]],
    ["Prostowanie nad głowę", "Overhead Cable Extension", "Wyciąg", "push", "Średni", ["Triceps"], ["Core"], "Ustaw się tyłem do wyciągu i prostuj ramiona nad głową, trzymając żebra ściągnięte.", "Przeprost lędźwi przy prostowaniu.", ["overhead extension"]],
    ["Pompki na poręczach", "Triceps Dip", "Poręcze", "push", "Zaawansowany", ["Triceps"], ["Klatka piersiowa", "Barki"], "Utrzymaj tułów pionowo, zejdź do kąta prostego i wypchnij się do pełnego wyprostu.", "Pochylanie tułowia, które przenosi pracę na klatkę.", ["dipy triceps"]],
    ["Pompki diamentowe", "Diamond Push-up", "Masa ciała", "push", "Średni", ["Triceps"], ["Klatka piersiowa"], "Ustaw dłonie blisko siebie pod klatką i opuść tułów w jednej linii.", "Rozchodzenie łokci na boki.", ["diamond push up"]],
    ["Wyciskanie wąsko", "Close-Grip Bench Press", "Sztanga", "push", "Średni", ["Triceps"], ["Klatka piersiowa"], "Chwyć sztangę na szerokość barków i prowadź łokcie blisko tułowia.", "Zbyt wąski chwyt obciążający nadgarstki.", ["close grip"]],
    ["Kickback z hantlem", "Triceps Kickback", "Hantel", "push", "Podstawowy", ["Triceps"], [], "Pochyl tułów, unieś ramię do linii tułowia i prostuj wyłącznie przedramię.", "Opuszczanie ramienia w trakcie serii.", ["kickback"]],
    ["Prostowanie jednorącz", "Single-arm Pushdown", "Wyciąg", "push", "Podstawowy", ["Triceps"], [], "Prostuj jedno ramię, kontrolując powrót i utrzymując bark nieruchomo.", "Rotowanie tułowia przy większym ciężarze.", ["single arm pushdown"]],
    ["Prostowanie zza głowy hantlem", "Overhead Dumbbell Extension", "Hantel", "push", "Podstawowy", ["Triceps"], ["Core"], "Trzymaj hantel oburącz nad głową i opuszczaj za kark, zginając wyłącznie łokcie.", "Rozchodzenie łokci na boki.", ["overhead dumbbell"]],
    ["Pompki na ławce", "Bench Dip", "Ławka", "push", "Podstawowy", ["Triceps"], ["Barki"], "Oprzyj dłonie o ławkę za sobą i opuszczaj biodra blisko ławki.", "Zbyt głębokie schodzenie drażniące bark.", ["bench dip"]],
  ],
  Nogi: [
    ["Przysiad ze sztangą", "Barbell Back Squat", "Sztanga", "squat", "Zaawansowany", ["Czworogłowe uda", "Pośladki"], ["Core", "Dwugłowe uda"], "Napnij brzuch przed zejściem, zachowaj pełną stopę na podłożu i wstań prowadząc biodra oraz barki razem.", "Utrata napięcia tułowia w dolnej fazie.", ["back squat", "przysiad"]],
    ["Przysiad przedni", "Front Squat", "Sztanga", "squat", "Zaawansowany", ["Czworogłowe uda"], ["Pośladki", "Core"], "Trzymaj łokcie wysoko, klatkę stabilnie i kontroluj zejście bez utraty neutralnego kręgosłupa.", "Opuszczanie łokci i pochylanie tułowia.", ["front squat"]],
    ["Przysiad goblet", "Goblet Squat", "Hantel", "squat", "Podstawowy", ["Czworogłowe uda"], ["Pośladki", "Core"], "Trzymaj hantel przy klatce, prowadź kolana nad stopami i zejdź tak nisko, jak pozwala kontrola.", "Zapadanie kolan do środka i odrywanie pięt.", ["goblet"]],
    ["Hack squat", "Hack Squat", "Maszyna", "squat", "Średni", ["Czworogłowe uda"], ["Pośladki"], "Oprzyj plecy o platformę, ustaw stopy na środku i zejdź do kąta prostego w kolanie.", "Odrywanie bioder od oparcia na dole.", ["hack"]],
    ["Wypychanie na suwnicy", "Leg Press", "Maszyna", "squat", "Podstawowy", ["Czworogłowe uda"], ["Pośladki", "Dwugłowe uda"], "Ustaw stopy na szerokość bioder i zginaj kolana do zakresu, w którym lędźwie zostają na oparciu.", "Odrywanie miednicy od oparcia w dolnej fazie.", ["leg press", "suwnica"]],
    ["Wykrok w przód", "Forward Lunge", "Hantle", "lunge", "Podstawowy", ["Czworogłowe uda", "Pośladki"], ["Dwugłowe uda", "Core"], "Zrób krok w przód, obniż biodra pionowo i wróć odpychając się przednią nogą.", "Uciekanie kolana do środka.", ["lunge", "wykrok"]],
    ["Wykrok w tył", "Reverse Lunge", "Hantle", "lunge", "Podstawowy", ["Czworogłowe uda", "Pośladki"], ["Dwugłowe uda"], "Cofnij stopę, obniż biodra pionowo i wróć naciskając całą stopą nogi z przodu.", "Zbyt krótki krok obciążający kolano.", ["reverse lunge", "zakrok"]],
    ["Przysiad bułgarski", "Bulgarian Split Squat", "Hantle", "lunge", "Średni", ["Czworogłowe uda", "Pośladki"], ["Dwugłowe uda", "Core"], "Ustaw stabilny wykrok, schodź pionowo i utrzymuj ciężar nad pracującą nogą.", "Zbyt wąskie ustawienie stóp i utrata równowagi.", ["bulgarian", "bułgar"]],
    ["Wejście na podest", "Step-up", "Podest", "lunge", "Podstawowy", ["Czworogłowe uda", "Pośladki"], ["Dwugłowe uda", "Łydki"], "Postaw całą stopę na podeście i wstań bez odbijania się nogą pozostającą na ziemi.", "Odpychanie się dolną nogą.", ["step up"]],
    ["Prostowanie nóg na maszynie", "Leg Extension", "Maszyna", "squat", "Podstawowy", ["Czworogłowe uda"], [], "Ustaw wałek nad kostką i prostuj kolana do pełnego wyprostu, zatrzymując na moment.", "Szarpanie ciężaru i opadanie na dół bez kontroli.", ["leg extension", "prostowanie nóg"]],
  ],
  Pośladki: [
    ["Hip thrust", "Barbell Hip Thrust", "Sztanga", "hinge", "Średni", ["Pośladki"], ["Dwugłowe uda", "Core"], "Dociśnij żebra, wypchnij biodra do pełnego wyprostu i zakończ ruch napięciem pośladków.", "Przeprost odcinka lędźwiowego zamiast wyprostu bioder.", ["hip thrust", "wypychanie bioder"]],
    ["Glute bridge", "Glute Bridge", "Masa ciała", "hinge", "Podstawowy", ["Pośladki"], ["Dwugłowe uda"], "Leżąc na plecach, dociśnij pięty i unieś biodra do linii kolana i barku.", "Unoszenie bioder ruchem z lędźwi.", ["mostek biodrowy"]],
    ["Rumuński martwy ciąg", "Romanian Deadlift", "Sztanga", "hinge", "Średni", ["Dwugłowe uda"], ["Pośladki", "Prostowniki grzbietu"], "Cofaj biodra przy lekko ugiętych kolanach, prowadząc ciężar blisko ud i goleni.", "Zamiana zawiasu biodrowego w przysiad.", ["rdl", "martwy rumuński"]],
    ["Martwy ciąg na jednej nodze", "Single-leg Deadlift", "Hantel", "hinge", "Średni", ["Dwugłowe uda", "Pośladki"], ["Core"], "Przenieś ciężar na jedną nogę i cofaj biodro, utrzymując miednicę równolegle do podłoża.", "Rotowanie miednicy w trakcie schodzenia.", ["single leg deadlift"]],
    ["Odwodzenie na maszynie", "Hip Abduction Machine", "Maszyna", "hinge", "Podstawowy", ["Odwodziciele"], ["Pośladki"], "Usiądź prosto i odwodź uda przeciw oporowi, wracając powoli do środka.", "Odchylanie tułowia dla większego zakresu.", ["abduction", "odwodzenie"]],
    ["Kopnięcie w tył na wyciągu", "Cable Kickback", "Wyciąg", "hinge", "Podstawowy", ["Pośladki"], ["Dwugłowe uda"], "Utrzymaj tułów nieruchomo i wyprostuj biodro do tyłu bez przeprostu lędźwi.", "Wyginanie pleców zamiast wyprostu biodra.", ["kickback pośladki"]],
    ["Good morning", "Good Morning", "Sztanga", "hinge", "Zaawansowany", ["Dwugłowe uda"], ["Pośladki", "Prostowniki grzbietu"], "Utrzymaj napięty tułów i cofaj biodra do momentu zachowania pełnej kontroli.", "Zbyt duży ciężar i utrata neutralnych pleców.", ["good morning"]],
    ["Uginanie nóg leżąc", "Lying Leg Curl", "Maszyna", "hinge", "Podstawowy", ["Dwugłowe uda"], ["Łydki"], "Ustaw wałek nad ścięgnem Achillesa i uginaj kolana do pełnego skurczu.", "Odrywanie bioder od leżanki.", ["leg curl", "uginanie nóg"]],
    ["Przysiad sumo", "Sumo Squat", "Hantel", "squat", "Podstawowy", ["Pośladki", "Przywodziciele"], ["Czworogłowe uda"], "Ustaw stopy szeroko z lekką rotacją na zewnątrz i zejdź prowadząc kolana nad stopami.", "Zapadanie kolan do środka.", ["sumo"]],
    ["Odwodzenie z gumą", "Banded Hip Abduction", "Guma", "hinge", "Podstawowy", ["Odwodziciele"], ["Pośladki"], "Załóż gumę nad kolanami i odwodź nogi przeciw oporowi, utrzymując stabilną miednicę.", "Kompensowanie ruchem tułowia.", ["guma pośladki"]],
  ],
  Brzuch: [
    ["Plank", "Plank", "Mata", "core", "Podstawowy", ["Core"], ["Barki", "Pośladki"], "Ustaw żebra nad miednicą, napnij pośladki i utrzymuj długą linię ciała.", "Opadanie bioder lub wstrzymywanie oddechu.", ["deska", "plank"]],
    ["Plank boczny", "Side Plank", "Mata", "core", "Średni", ["Mięśnie skośne brzucha"], ["Barki", "Pośladki"], "Ustaw łokieć pod barkiem i unieś biodra do prostej linii od kostki do głowy.", "Opadanie bioder i rotacja tułowia.", ["side plank", "deska bok"]],
    ["Dead bug", "Dead Bug", "Mata", "core", "Podstawowy", ["Core"], [], "Dociśnij odcinek lędźwiowy do maty i wydłużaj przeciwległe kończyny bez utraty napięcia.", "Odrywanie lędźwi od podłoża.", ["dead bug"]],
    ["Bird dog", "Bird Dog", "Mata", "core", "Podstawowy", ["Core"], ["Pośladki", "Barki"], "Wydłuż przeciwległą rękę i nogę, utrzymując miednicę równolegle do podłoża.", "Rotowanie bioder i unoszenie nogi zbyt wysoko.", ["bird dog"]],
    ["Pallof press", "Pallof Press", "Wyciąg", "core", "Średni", ["Core"], ["Barki"], "Ustaw stopy stabilnie i wyprostuj ręce bez pozwalania, aby tułów obrócił się w stronę wyciągu.", "Rotacja tułowia pod wpływem oporu.", ["pallof"]],
    ["Unoszenie nóg w zwisie", "Hanging Leg Raise", "Drążek", "core", "Zaawansowany", ["Core"], ["Przedramiona"], "Zwiśnij na drążku i unieś nogi ruchem z miednicy, nie z bioder.", "Bujanie ciałem i praca samymi zginaczami biodra.", ["hanging leg raise"]],
    ["Brzuszki", "Crunch", "Mata", "core", "Podstawowy", ["Mięsień prosty brzucha"], [], "Unieś łopatki nad matę ruchem zwijania, bez ciągnięcia głowy rękami.", "Pociąganie karku dłońmi.", ["crunch", "brzuszki"]],
    ["Russian twist", "Russian Twist", "Mata", "core", "Średni", ["Mięśnie skośne brzucha"], ["Core"], "Usiądź z uniesionymi stopami i rotuj tułów, prowadząc ruch klatką, nie samymi rękami.", "Rotowanie wyłącznie ramionami.", ["russian twist", "skrętoskłony"]],
    ["Ab wheel", "Ab Wheel Rollout", "Kółko", "core", "Zaawansowany", ["Core"], ["Plecy", "Barki"], "Wyjeżdżaj kółkiem tak daleko, jak utrzymasz żebra ściągnięte i lędźwie bez przeprostu.", "Wypadanie lędźwi w przeprost.", ["ab wheel", "kółko"]],
    ["Mountain climbers", "Mountain Climbers", "Masa ciała", "core", "Podstawowy", ["Core"], ["Barki", "Czworogłowe uda"], "W podporze przodem przyciągaj kolana naprzemiennie, utrzymując biodra nisko.", "Unoszenie bioder i skracanie zakresu.", ["mountain climbers"]],
  ],
  Łydki: [
    ["Wspięcia stojąc", "Standing Calf Raise", "Maszyna", "push", "Podstawowy", ["Łydki"], [], "Opuść pięty poniżej stopnia i wznieś się na palce do pełnego zakresu.", "Sprężynowanie bez zatrzymania w górnej pozycji.", ["calf raise", "wspięcia"]],
    ["Wspięcia siedząc", "Seated Calf Raise", "Maszyna", "push", "Podstawowy", ["Łydki"], [], "Usiądź z kolanami pod wałkiem i wznoś pięty, akcentując mięsień płaszczkowaty.", "Zbyt szybkie tempo i skracanie zakresu.", ["seated calf"]],
    ["Wspięcia na suwnicy", "Leg Press Calf Raise", "Maszyna", "push", "Średni", ["Łydki"], [], "Ustaw śródstopie na dolnej krawędzi platformy i wypychaj palcami, kontrolując powrót.", "Zginanie kolan w trakcie ruchu.", ["calf press"]],
    ["Wspięcia jednonóż", "Single-leg Calf Raise", "Masa ciała", "push", "Średni", ["Łydki"], [], "Stań na jednej nodze na stopniu i wznoś się na palce, przytrzymując równowagę.", "Podpieranie się ręką zamiast pracy stopą.", ["one leg calf"]],
    ["Donkey calf raise", "Donkey Calf Raise", "Maszyna", "push", "Średni", ["Łydki"], [], "Pochyl tułów, oprzyj ręce i wznoś pięty przy wyprostowanych kolanach.", "Uginanie kolan i skracanie zakresu.", ["donkey calf"]],
    ["Spacer farmera", "Farmer's Walk", "Hantle", "core", "Podstawowy", ["Przedramiona"], ["Core", "Mięsień czworoboczny"], "Weź ciężary w obie ręce i idź wyprostowany krótkimi, kontrolowanymi krokami.", "Pochylanie tułowia i opadanie barków.", ["farmer walk", "spacer farmera"]],
    ["Zwis na drążku", "Dead Hang", "Drążek", "pull", "Podstawowy", ["Przedramiona"], ["Plecy", "Barki"], "Zwiśnij na drążku z aktywnymi barkami i utrzymaj pozycję przez zadany czas.", "Całkowite rozluźnienie barków w zwisie.", ["dead hang", "zwis"]],
    ["Uginanie nadgarstków", "Wrist Curl", "Sztanga", "pull", "Podstawowy", ["Przedramiona"], [], "Oprzyj przedramiona o uda i uginaj nadgarstki w pełnym zakresie.", "Unoszenie przedramion zamiast pracy nadgarstków.", ["wrist curl"]],
    ["Prostowanie nadgarstków", "Reverse Wrist Curl", "Sztanga", "pull", "Podstawowy", ["Przedramiona"], [], "Chwyć sztangę nachwytem i prostuj nadgarstki, kontrolując powrót.", "Zbyt duży ciężar i szarpanie.", ["reverse wrist curl"]],
    ["Rolowanie liny", "Wrist Roller", "Maszyna", "pull", "Średni", ["Przedramiona"], ["Barki"], "Trzymaj ramiona przed sobą i nawijaj linkę naprzemiennymi ruchami nadgarstków.", "Opuszczanie ramion w trakcie serii.", ["wrist roller"]],
  ],
  Mobilność: [
    ["Mobilizacja bioder 90/90", "90/90 Hip Switch", "Mata", "mobility", "Podstawowy", ["Mobilność bioder"], ["Pośladki", "Przywodziciele"], "Poruszaj się powoli między pozycjami, nie wymuszając zakresu i utrzymując spokojny oddech.", "Szybkie ruchy i dociskanie stawu przez ból.", ["90 90", "hip switch"]],
    ["Kot-krowa", "Cat-Cow", "Mata", "mobility", "Podstawowy", ["Prostowniki grzbietu"], ["Core"], "W klęku podpartym naprzemiennie zaokrąglaj i wydłużaj kręgosłup, oddychając rytmicznie.", "Ruch wyłącznie z odcinka lędźwiowego.", ["cat cow", "kot krowa"]],
    ["Rotacja piersiowa", "Thoracic Rotation", "Mata", "mobility", "Podstawowy", ["Prostowniki grzbietu"], ["Barki"], "W klęku podpartym połóż dłoń na karku i rotuj klatkę, prowadząc ruch łokciem.", "Rotowanie z lędźwi zamiast z klatki.", ["thoracic rotation"]],
    ["World's greatest stretch", "World's Greatest Stretch", "Mata", "mobility", "Średni", ["Mobilność bioder"], ["Prostowniki grzbietu"], "Z wykroku oprzyj przedramię o podłoże, następnie rotuj klatkę w stronę przedniej nogi.", "Zapadanie bioder i utrata pozycji wykroku.", ["greatest stretch"]],
    ["Rozciąganie zginaczy biodra", "Hip Flexor Stretch", "Mata", "mobility", "Podstawowy", ["Mobilność bioder"], ["Pośladki"], "W klęku jednonóż podwiń miednicę i napnij pośladek nogi zakrocznej.", "Przeprost lędźwi zamiast wydłużenia biodra.", ["hip flexor"]],
    ["Couch stretch", "Couch Stretch", "Mata", "mobility", "Zaawansowany", ["Czworogłowe uda"], ["Mobilność bioder"], "Oprzyj goleń o ścianę i utrzymuj podwiniętą miednicę przez cały czas trwania pozycji.", "Wyginanie lędźwi dla większego zakresu.", ["couch stretch"]],
    ["Skłon do prostych nóg", "Standing Hamstring Stretch", "Mata", "mobility", "Podstawowy", ["Dwugłowe uda"], ["Prostowniki grzbietu"], "Cofnij biodra przy prostych nogach i schodź do pierwszego wyraźnego napięcia.", "Zaokrąglanie pleców zamiast zawiasu biodrowego.", ["hamstring stretch"]],
    ["Rotacja barku z kijem", "Shoulder Dislocate", "Kij", "mobility", "Podstawowy", ["Barki"], ["Klatka piersiowa"], "Trzymaj kij szeroko i prowadź go łukiem nad głową do pleców bez wyginania lędźwi.", "Zbyt wąski chwyt wymuszający kompensację.", ["shoulder dislocate", "kij"]],
    ["Głęboki przysiad w przytrzymaniu", "Deep Squat Hold", "Masa ciała", "mobility", "Średni", ["Mobilność bioder"], ["Czworogłowe uda"], "Zejdź do najgłębszego przysiadu i utrzymaj pozycję, rozpychając kolana łokciami.", "Odrywanie pięt od podłoża.", ["deep squat"]],
    ["Rozciąganie łydek o ścianę", "Wall Calf Stretch", "Ściana", "mobility", "Podstawowy", ["Łydki"], [], "Oprzyj śródstopie o ścianę i dociśnij piętę do podłoża, przenosząc ciężar do przodu.", "Odrywanie pięty od podłoża.", ["calf stretch"]],
  ],
};

export const exerciseCatalog: CatalogEntry[] = Object.entries(rows).flatMap(([group, list]) =>
  list.map(([name, english, equipment, pattern, level, primary, secondary, instruction, mistake, aliases]) => ({
    name, english, group, equipment, pattern, level, primary, secondary, instruction, mistake, aliases,
  })),
);
