/**
 * Wygładzanie przewijania kółkiem myszy: ruch dobiega do celu z wyhamowaniem
 * zamiast skakać skokowo.
 *
 * Świadome ograniczenia:
 * - działa tylko przy wskaźniku precyzyjnym (mysz). Na dotyku i touchpadzie
 *   z bezwładnością przeglądarka robi to lepiej, więc nie przejmujemy zdarzeń;
 * - wyłączone przy `prefers-reduced-motion`;
 * - nie dotyka klawiatury, paska przewijania ani kotwic, żeby nie psuć dostępności;
 * - każde inne przewinięcie natychmiast przerywa animację.
 */
export function enableSmoothWheelScroll() {
  if (typeof window === "undefined") return () => undefined;

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!finePointer || reducedMotion) return () => undefined;

  let target = window.scrollY;
  let frame = 0;
  let animating = false;

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function step() {
    const current = window.scrollY;
    const distance = target - current;

    if (Math.abs(distance) < 0.5) {
      window.scrollTo(0, target);
      animating = false;
      return;
    }

    // Współczynnik dobrany tak, żeby ruch wyhamowywał w około 400 ms.
    window.scrollTo(0, current + distance * 0.18);
    frame = window.requestAnimationFrame(step);
  }

  function onWheel(event: WheelEvent) {
    // Zoom, przewijanie poziome i przewijanie wewnątrz elementu zostawiamy przeglądarce.
    if (event.ctrlKey || event.defaultPrevented) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (event.deltaMode !== 0) return;

    const scroller = (event.target as Element | null)?.closest?.("[class*='overflow-y-auto'], [class*='overflow-auto']");
    if (scroller && scroller.scrollHeight > scroller.clientHeight) return;

    const limit = maxScroll();
    if (limit <= 0) return;

    event.preventDefault();
    if (!animating) target = window.scrollY;
    target = Math.min(limit, Math.max(0, target + event.deltaY));

    if (!animating) {
      animating = true;
      frame = window.requestAnimationFrame(step);
    }
  }

  function cancel() {
    if (!animating) return;
    animating = false;
    window.cancelAnimationFrame(frame);
  }

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", cancel);
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("mousedown", cancel);

  return () => {
    cancel();
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("mousedown", cancel);
  };
}
