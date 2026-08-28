/**
 * Obsługa instalacji i aktualizacji aplikacji zainstalowanej na telefonie.
 *
 * Android i przeglądarki oparte na Chromium zgłaszają `beforeinstallprompt`
 * i pozwalają wywołać okno instalacji z kodu. Safari na iOS tego nie wspiera —
 * tam jedyną drogą jest „Udostępnij → Dodaj do ekranu początkowego”, więc
 * zamiast przycisku pokazujemy instrukcję.
 */

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type PwaState = {
  canInstall: boolean;
  installed: boolean;
  isIos: boolean;
  updateReady: boolean;
  offline: boolean;
};

export function isStandalone() {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone;
}

export function isIosDevice() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

/**
 * Rejestruje service workera i zgłasza zmiany stanu.
 * Zwraca funkcję sprzątającą oraz uchwyty do wywołania instalacji i aktualizacji.
 */
export function initPwa(onChange: (state: Partial<PwaState>) => void) {
  if (typeof window === "undefined") return { cleanup: () => undefined, install: async () => false, applyUpdate: () => undefined };

  let deferred: InstallPromptEvent | null = null;
  let waiting: ServiceWorker | null = null;

  function handleBeforeInstall(event: Event) {
    event.preventDefault();
    deferred = event as InstallPromptEvent;
    onChange({ canInstall: true });
  }

  function handleInstalled() {
    deferred = null;
    onChange({ canInstall: false, installed: true });
  }

  const online = () => onChange({ offline: false });
  const offline = () => onChange({ offline: true });

  window.addEventListener("beforeinstallprompt", handleBeforeInstall);
  window.addEventListener("appinstalled", handleInstalled);
  window.addEventListener("online", online);
  window.addEventListener("offline", offline);

  onChange({ installed: isStandalone(), isIos: isIosDevice(), offline: !window.navigator.onLine });

  if ("serviceWorker" in navigator && window.isSecureContext) {
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      if (registration.waiting) {
        waiting = registration.waiting;
        onChange({ updateReady: true });
      }
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          // Nowa wersja czeka tylko wtedy, gdy jakaś już działa.
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            waiting = installing;
            onChange({ updateReady: true });
          }
        });
      });
    }).catch(() => undefined);
  }

  return {
    cleanup() {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    },
    async install() {
      if (!deferred) return false;
      await deferred.prompt();
      const choice = await deferred.userChoice;
      deferred = null;
      onChange({ canInstall: false });
      return choice.outcome === "accepted";
    },
    applyUpdate() {
      waiting?.postMessage("skip-waiting");
      // Przeładowanie po przejęciu kontroli przez nową wersję.
      navigator.serviceWorker?.addEventListener("controllerchange", () => window.location.reload(), { once: true });
    },
  };
}
