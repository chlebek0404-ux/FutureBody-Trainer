# Supabase — uruchomienie backendu

1. Utwórz projekt Supabase w regionie europejskim.
2. Wykonaj migracje z katalogu `migrations` przez Supabase CLI.
3. Uzupełnij lokalny plik `.env.local` na podstawie `.env.example`.
4. Włącz wymagane metody logowania w Supabase Auth.
5. Przetestuj polityki Row Level Security dla każdej roli przed użyciem prawdziwych danych.

Interfejs aplikacji działa bez zewnętrznego projektu w trybie demonstracyjnym. Po podaniu publicznego adresu i klucza anonimowego formularz logowania może korzystać z Supabase Auth.

Duże pliki nie powinny trafiać do PostgreSQL. Ich metadane przechowuje tabela `file_objects`, a zawartość będzie zapisywana w Cloudflare R2.
