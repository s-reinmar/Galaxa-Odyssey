# Dziennik Prac Refaktoryzacyjnych — KROK 3

**Data:** 16 października 2026 r.  
**Moduł:** Konfiguracja fotorealistycznych miękkich cieni kontaktowych (PCF Soft Shadows)  
**Zmienione pliki:**
- `src/game/hangar/CloneWarsHangar3D.ts`
- `src/components/3d/SpaceHangarScene.ts`

---

## 1. Wprowadzone Modyfikacje i Rationale Techniczne

1. **`src/game/hangar/CloneWarsHangar3D.ts`:**
   - **Problem:** Obiekty architektury, podłoże, lądowisko, kanonierki LAAT i skrzynie ładunkowe nie rzucały ani nie odbierały cieni, co sprawiało wrażenie zawieszenia statku i dekoracji w płaskiej przestrzeni bez fizycznej wagi.
   - **Rozwiązanie:** W metodzie `buildMonumentalHangar()` wdrożono automatyczną propagację cieni:
     - Wszystkie siatki architektoniczne i posadzka mają włączone `receiveShadow = true`.
     - Bryły stałe (kanonierki, skrzynie, filary, lądowisko) mają włączone `castShadow = true`.
     - Elementy przezroczyste, emisyjne lasery i stożki wolumetryczne (`MeshBasicMaterial`, `spotlightCones`, `forceField`) zostały wyłączone z rzucania cienia, co jest zgodne z fizyką optyczną.

2. **`src/components/3d/SpaceHangarScene.ts`:**
   - **Problem:** Domyślne cienie generowały ostre, ząbkowane krawędzie lub potencjalne artefakty typu *shadow acne* na zakrzywionych powierzchniach skrzydeł i kadłuba.
   - **Rozwiązanie:**
     - Skalibrowano `keyLight.shadow.bias = -0.0002` oraz `keyLight.shadow.normalBias = 0.04`, co całkowicie eliminuje prążkowanie geometryczne na gładkich krzywiznach kadłuba.
     - Wprowadzono `keyLight.shadow.radius = 2.0`, tworząc miękkie, plastyczne przejście półcienia (*penumbra*), charakterystyczne dla oświetlenia studyjnego.
     - Dodano cel oświetlenia `keyLight.target` na wysokości $Y = 0.8$, centrujący stożek cieniowania dokładnie na platformie lądowiska i sylwetce myśliwca.
     - Mapa cieni o wysokiej rozdzielczości $2048 \times 2048$ px zapewnia krystaliczną precyzję cienia podwozia i skrzydeł.

---

## 2. Wynik Weryfikacji
- Statek rzuca naturalny, głęboki, miękki cień na platformę lądowiska.
- Pełne poczucie masy, głębi 3D i fotorealizmu przestrzennego w hangarze.
