# Cloudflare R2

Cloudflare R2 przechowuje zdjęcia postępów, filmy, dokumenty, materiały edukacyjne i eksporty. Baza Supabase przechowuje wyłącznie metadane w tabeli `file_objects`.

## Zasady implementacji

- pliki prywatne otrzymują czasowe, podpisane adresy;
- klucze R2 są dostępne wyłącznie po stronie serwera;
- nazwa obiektu powinna mieć postać `organizationId/clientId/randomId.ext`;
- przed wysłaniem sprawdzane są typ i rozmiar pliku;
- aplikacja nie przyjmuje plików wykonywalnych;
- usunięcie rekordu oznacza plik jako usunięty, a fizyczne czyszczenie wykonuje zadanie w tle;
- zdjęcia postępów i dokumenty zdrowotne nigdy nie są publiczne;
- lokalne i produkcyjne środowisko używają osobnych magazynów.

Logiczne powiązanie R2 jest już zadeklarowane w `.openai/hosting.json`. Dane dostępowe należy dodać dopiero przy konfiguracji środowiska produkcyjnego.
