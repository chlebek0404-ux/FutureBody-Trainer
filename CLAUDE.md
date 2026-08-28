# FutureBody Trainer — instrukcja dla Claude Code

## Cel projektu

FutureBody Trainer to mobilne centrum codziennej pracy trenera personalnego. Najważniejsze przepływy to: pulpit dnia, kalendarz, klient, plan treningowy i trening na żywo.

## Stack

- React 19 + TypeScript
- Next.js App Router
- Vinext + Vite
- Tailwind CSS 4
- Supabase Auth/PostgreSQL — adapter i migracje są przygotowane, usługa nie jest jeszcze skonfigurowana
- Cloudflare R2 — dokumentacja integracji jest przygotowana, usługa nie jest jeszcze skonfigurowana

## Struktura

- `app/` — routing, layout i globalne style
- `components/` — interfejs aplikacji i główne przepływy
- `lib/` — modele danych, biblioteka ćwiczeń, Supabase i eksport PDF
- `public/` — logo, ikony, manifest, service worker i wizualizacje ćwiczeń
- `supabase/migrations/` — schemat bazy danych i polityki dostępu
- `export-html/` — opcjonalny eksporter pojedynczego HTML; nie jest źródłem aplikacji
- `docs/` — dokumentacja R2 oraz procesu tworzenia wizualizacji ćwiczeń

Projekt celowo używa katalogów `app`, `components` i `lib` zamiast `src`.

## Komendy

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm export:html
```

Wymagany Node.js `>=22.13.0`.

## Konfiguracja

Skopiuj `.env.example` do `.env.local` i uzupełnij wartości Supabase. Sekrety Cloudflare R2 nie mogą trafić do kodu klienta ani do repozytorium.

## Aktualny stan

- po uruchomieniu aplikacja pokazuje splash i pusty ekran logowania;
- nie ma kont testowych ani przykładowych rekordów użytkowników;
- logowanie nie omija Supabase;
- dane demonstracyjne nie są ładowane do stanu aplikacji;
- hosting i produkcyjna konfiguracja usług są odłożone na końcowy etap.

## Zasady dalszej pracy

- rozwijaj istniejące komponenty inkrementalnie;
- zachowuj routing i główne przepływy produktu;
- nie przywracaj automatycznego logowania ani przykładowych klientów;
- nie dodawaj danych finansowych;
- projektuj mobile-first i utrzymuj minimum 44 px dla głównych pól dotykowych;
- po większej zmianie uruchom lint, sprawdzenie TypeScript i build;
- nie commituj `.env.local`, `node_modules`, `.next`, `dist`, wygenerowanych HTML-i ani danych użytkowników.
