"use client";

import { useEffect, useRef } from "react";

/**
 * Przewinięcie na górę po zmianie widoku.
 *
 * Zmiana zakładki albo otwarcie panelu podmienia całą zawartość ekranu, ale
 * przeglądarka zostawia pozycję przewijania z poprzedniego widoku. Trener
 * przewijał listę ćwiczeń, przechodził do check-inów i lądował w połowie
 * strony — bez żadnej wskazówki, że wyżej jest jeszcze nagłówek.
 *
 * Pomijamy pierwsze uruchomienie: wejście na ekran nie jest zmianą widoku,
 * a przewijanie przy montowaniu psułoby powrót przyciskiem wstecz.
 */
export function useScrollTopOnChange(key: string | number | null) {
  const previous = useRef(key);

  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    if (typeof window === "undefined") return;
    // „auto”, nie „smooth”: przy zmianie widoku liczy się natychmiastowy
    // początek nowej treści, a nie animacja przez cudzą zawartość.
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [key]);
}
