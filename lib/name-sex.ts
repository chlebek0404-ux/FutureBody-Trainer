/**
 * Rozpoznanie płci po imieniu — wyłącznie jako podpowiedź w formularzu.
 *
 * W polszczyźnie prawie każde imię żeńskie kończy się na „a”, a męskie nie.
 * Reguła ma jednak wyjątki w obie strony, więc obok niej stoją dwie listy:
 * imion męskich zakończonych na „a” i żeńskich zakończonych inaczej.
 *
 * To jest zgadywanka, nie ustalenie faktu. Wynik trafia wyłącznie do wstępnego
 * ustawienia pola przy zakładaniu nowego planu; trener widzi je i może zmienić
 * jednym kliknięciem, a raz zapisany wybór nigdy nie jest nadpisywany.
 */

import type { Sex } from "@/lib/nutrition";

/** Imiona męskie zakończone na „a”. */
const maleEndingInA = new Set([
  "kuba", "barnaba", "bonawentura", "jarema", "kosma", "sasza", "nikita", "iliya", "ilja", "mustafa",
]);

/** Imiona żeńskie niezakończone na „a”. */
const femaleNotEndingInA = new Set([
  "noemi", "ingrid", "karmen", "carmen", "miriam", "rut", "ruth", "abigail", "esther", "estera",
  "nicol", "nicole", "michelle", "jennifer", "doris", "lilian", "vivien", "solveig", "beatrix",
]);

/**
 * Płeć zgadnięta z imienia albo `null`, gdy imienia nie da się ocenić.
 * `null` znaczy „nie wiem” — wtedy formularz zostaje przy swoim ustawieniu.
 */
export function guessSexFromName(fullName: string | undefined | null): Sex | null {
  if (!fullName) return null;
  const first = fullName.trim().split(/\s+/)[0]?.toLocaleLowerCase("pl-PL");
  // Same inicjały albo jedna litera nie niosą informacji.
  if (!first || first.length < 3 || /[^a-ząćęłńóśźż]/.test(first)) return null;

  if (maleEndingInA.has(first)) return "mężczyzna";
  if (femaleNotEndingInA.has(first)) return "kobieta";
  return first.endsWith("a") ? "kobieta" : "mężczyzna";
}
