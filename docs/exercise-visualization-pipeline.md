# Pipeline wizualizacji ćwiczeń FutureBody

## Cel

Każde ćwiczenie korzysta z jednego komponentu `ExerciseVisualizer`. Komponent nie zna konkretnych ćwiczeń - otrzymuje wyłącznie rekord danych, zatwierdzony asset ruchu, mapę mięśni, kąt kamery i fazy ruchu.

## Przepływ

1. Uzupełnij stabilne `exerciseId`, sprzęt, wzorzec ruchowy i rodzinę ćwiczenia.
2. Przypisz identyfikatory `primaryMuscleIds` i `secondaryMuscleIds` z centralnego modelu anatomii.
3. Wybierz `preferredCameraAngle` na podstawie czytelności techniki.
4. Przygotuj pięć spójnych faz: start, faza pośrednia, pozycja kluczowa, powrót i zakończenie.
5. Wygeneruj lub wyrenderuj poziomy sprite PNG/WebP bez tekstu, logo i strzałek.
6. Przeprowadź kontrolę techniki, anatomii, sprzętu, dłoni, stawów i spójności modelu.
7. Umieść asset w R2, a w rekordzie ćwiczenia zapisz ścieżkę, wersję i liczbę klatek.
8. Dopiero po akceptacji ustaw `animationAsset`. Wcześniej aplikacja pokazuje bezpieczny placeholder.

## Standard assetu ruchu

- jeden identyczny model w każdej fazie,
- jeden stały kąt kamery,
- pełna sylwetka i cały sprzęt w kadrze,
- pięć równych komórek w kolejności od lewej do prawej,
- pełne powtórzenie w czasie około 2,5-4 sekund,
- spokojna pauza w pozycji kluczowej,
- brak tekstu, numeracji, logo i znaków wodnych,
- nazwa pliku: `{exerciseSlug}-{modelStyle}-{version}.webp`.

## Anatomia

Model anatomii używa wspólnych identyfikatorów z `MuscleId`. Główne mięśnie otrzymują mocne czerwone wyróżnienie, pomocnicze - słabsze i półprzezroczyste. Pozostałe ciało pozostaje neutralne. Overlay nie może sugerować pracy mięśnia, którego rekord ćwiczenia nie zawiera.

## Wydajność

- lista biblioteki pokazuje tylko pierwszą, statyczną klatkę,
- pełny asset ładuje się dopiero dla otwartego ćwiczenia,
- atlas anatomii ładuje się dopiero po wejściu w tryb `Mięśnie`,
- przeglądarka korzysta z cache dla wspólnych assetów,
- brak animacji zastępczej dla nieukończonych ćwiczeń.

## Kolejka pierwszych assetów

Pierwszy zatwierdzany wzorzec: Romanian Deadlift. Po akceptacji stylu kolejność produkcji obejmuje: Bench Press, Dumbbell Bench Press, Incline Dumbbell Press, Squat, Deadlift, Leg Press, Hack Squat, Bulgarian Split Squat, Leg Extension, Leg Curl, Hip Thrust, Lat Pulldown, Pull-up, Seated Row, Barbell Row, Shoulder Press, Lateral Raise, Face Pull, Biceps Curl, Hammer Curl, Triceps Pushdown, Overhead Triceps Extension, Cable Fly, Calf Raise, Cable Crunch i Plank.

## Kontrola przed publikacją

- ruch możliwy anatomicznie,
- poprawny tor sprzętu i chwyt,
- neutralne stawy bez artefaktów,
- ta sama postać, proporcje i strój w każdej fazie,
- mięśnie główne silniejsze wizualnie od pomocniczych,
- czytelność na ekranie telefonu,
- zgodność nazwy pliku, wersji i rekordu ćwiczenia.
