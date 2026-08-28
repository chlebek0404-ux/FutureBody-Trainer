# FutureBody Trainer

Kompletne centrum zarządzania codzienną pracą trenera personalnego w ciemnym, sportowym systemie premium FutureBody.

## Gotowe moduły

- logowanie trenera i aktywacja konta podopiecznego kodem,
- pulpit trenera,
- podopieczni i rozbudowane profile,
- klikalny kalendarz szybkiego umawiania,
- pełna historia kalendarza z trwałym zapisem, wyborem daty i nawigacją między tygodniami,
- globalna wyszukiwarka klientów, planów, zadań i modułów,
- centrum powiadomień oraz przygotowanie PWA do powiadomień telefonu,
- kreator planów oparty na celu i ankiecie,
- pełny edytor dni i ćwiczeń: serie, powtórzenia, ciężar, tempo, RPE, RIR, przerwy, kolejność i zamienniki,
- uporządkowana biblioteka ćwiczeń: aliasy PL/EN, rodziny, wzorce ruchowe, mięśnie główne i dodatkowe, sprzęt, tagi oraz 2000 wariantów planowania,
- wyszukiwanie odporne na skróty i drobne literówki, łączone filtry, ulubione, ostatnio używane, ćwiczenia trenera i wielokryterialne zamienniki,
- wspólny `ExerciseVisualizer` z trybami Ruch/Mięśnie, fazami powtórzenia, sterowaniem odtwarzaniem, kątem kamery i centralną mapą anatomii,
- profesjonalny pięciofazowy prototyp Romanian Deadlift oraz bezpieczne placeholdery dla ćwiczeń oczekujących na zatwierdzony asset,
- tryb wykonywania treningu przez podopiecznego z zapisem każdej serii, obciążenia, RPE i notatek,
- postępy i pomiary,
- check-iny,
- wiadomości,
- zadania,
- automatyzacje,
- materiały,
- raporty,
- tygodniowe raporty i czytelny eksport PDF,
- ustawienia powiadomień i panel ochrony konta.
- spójny, subtelny system motion z obsługą ograniczenia ruchu.

## Stan danych i logowanie

Projekt nie zawiera kont demonstracyjnych ani przykładowych zapisów użytkowników. Po uruchomieniu wyświetlany jest ekran logowania z pustymi polami. Logowanie, rejestracja i aktywacja kont będą działały po skonfigurowaniu Supabase za pomocą zmiennych z `.env.example`.

Moduły wyliczają wskaźniki wyłącznie z zapisanych danych. Dopóki nie ma zapisanych treningów i pomiarów, widoczne są stany puste zamiast wartości zastępczych.

### Tryb podglądu

Do recenzji interfejsu przed podłączeniem backendu służy tryb podglądu z dwoma kontami:

| Rola | Adres e-mail | Hasło |
| --- | --- | --- |
| Trener | `demo@movendo.pl` | `demo1234` |
| Podopieczny | `client@movendo.pl` | `demo1234` |

Tryb wymaga jednocześnie dwóch warunków: braku konfiguracji Supabase oraz buildu developerskiego albo eksportu `pnpm export:html`. Produkcyjny `pnpm build` go nie udostępnia — sprawdzone uruchomieniem serwera produkcyjnego. Dane podglądu powstają w pamięci, nie trafiają do bazy i znikają po wylogowaniu.

## Uruchomienie developerskie

Wymagany jest Node.js `22.13` lub nowszy oraz pnpm.

```bash
pnpm install
pnpm dev
```

Kontrola jakości:

```bash
pnpm lint
pnpm build
```

Kod aplikacji znajduje się w katalogach `app`, `components` i `lib`. Projekt korzysta z Next.js App Router uruchamianego przez Vinext/Vite, dlatego nie posiada dodatkowego katalogu `src`.

## Samodzielna wersja HTML

Polecenie `pnpm export:html` tworzy samodzielny plik HTML poza katalogiem źródłowym. Plik eksportowy nie jest wymagany do pracy developerskiej i nie powinien być przenoszony zamiast kodu źródłowego. Powiadomienia ekranu blokady wymagają uruchomienia aplikacji online przez HTTPS.

## Dane i pliki

- Supabase Auth odpowiada za konta i sesje.
- PostgreSQL w Supabase przechowuje dane aplikacji.
- Migracja początkowa znajduje się w `supabase/migrations`.
- Cloudflare R2 jest przygotowany jako magazyn dużych plików.
- Tabela `file_objects` przechowuje metadane plików zapisanych w R2.

## Kolejność uruchomienia produkcyjnego

1. Utworzenie projektu Supabase i wykonanie migracji.
2. Konfiguracja zmiennych środowiskowych.
3. Podłączenie produkcyjnego magazynu R2.
4. Testy kont, ról i polityk dostępu.
5. Testy kluczowych procesów na urządzeniach mobilnych.
6. Wdrożenie wersji staging.
7. Akceptacja właściciela.
8. Publikacja i podłączenie domeny.

Publiczne wdrożenie nie powinno być wykonywane przed skonfigurowaniem prawdziwych usług i końcową akceptacją.
