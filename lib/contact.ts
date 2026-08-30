/**
 * Odnośniki kontaktowe.
 *
 * Numer wpisywany przez trenera bywa zapisany na różne sposoby — ze spacjami,
 * myślnikami, w nawiasach. Schemat `tel:` przyjmuje wyłącznie cyfry i wiodący
 * plus, więc numer trzeba oczyścić, zanim trafi do odnośnika. Inaczej system
 * dostaje adres, którego nie potrafi otworzyć, i kliknięcie nic nie robi.
 */

/** Numer w postaci akceptowanej przez `tel:`; `null`, gdy nie ma czego wybrać. */
export function telHref(phone: string | undefined | null) {
  if (!phone) return null;
  const trimmed = phone.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 6) return null;
  return `tel:${plus}${digits}`;
}
