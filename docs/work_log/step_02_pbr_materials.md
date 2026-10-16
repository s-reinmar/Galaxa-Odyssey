# Dziennik Prac Refaktoryzacyjnych — KROK 2

**Data:** 16 października 2026 r.  
**Moduł:** Wdrożenie fotorealistycznych materiałów PBR i eliminacja artefaktów aliasingu/Moiré  
**Zmieniony plik:** `src/game/hangar/CloneWarsHangar3D.ts`

---

## 1. Wprowadzone Modyfikacje i Rationale Techniczne

1. **Podwyższenie rozdzielczości proceduralnych map tekstur (2048 x 2048):**
   - **`generateDeckPlateTexture()`**: Zwiększono rozdzielczość canvasu z 1024x1024 do 2048x2048. Zastąpiono powtarzalną gęstą siatkę dużymi, monumentalnymi płytami tytanowymi ($512 \times 512$ px) z antyaliasingowymi fazowaniami krawędzi, radialnym gradientem mikro-odbicia oraz pogłębionymi gniazdami śrub z mikroskopijnymi refleksami specularnymi.
   - **`generateRunwayTexture()`**: Podwyższono rozdzielczość do 2048x2048. Wdrożono antyaliasingowe pasy ostrzegawcze (hazard stripes), wektorowe oznaczenia chevronowe i typografię technologiczną `Orbitron` ("BAY 09 // LAUNCH VECTOR") z subtelną poświatą neonową `shadowBlur`.
   - **`generateHazardTexture()`**: Zwiększono rozdzielczość do 1024x1024, redukując szum pikselowy.
   - **`generateWallArmorTexture()`**: Zwiększono rozdzielczość do 2048x1024 z płynnymi gradientami ożebrowania pancerza.

2. **Pełna aktywacja filtrowania anizotropowego (Anisotropic Filtering x16):**
   - Dla wszystkich generowanych tekstur włączono:
     ```typescript
     texture.generateMipmaps = true;
     texture.anisotropy = 16;
     texture.minFilter = THREE.LinearMipmapLinearFilter;
     texture.magFilter = THREE.LinearFilter;
     ```
   - Zmniejszono powtarzalność płyt z `(4, 4)` na `(3, 3)`, co definitywnie zlikwidowało prążki interferencyjne Moiré przy ostrych kątach patrzenia kamery.

3. **Optymalizacja właściwości fizycznych materiałów PBR:**
   - **Płyty pokładowe (`deckMat`)**: `metalness: 0.82`, `roughness: 0.28`, `envMapIntensity: 1.2` — szlachetna satynowa stal reagująca na mapę środowiskową `RoomEnvironment`.
   - **Pas startowy (`runwayMat`)**: `metalness: 0.72`, `roughness: 0.30`, `envMapIntensity: 1.1` — matowy kompozyt grafitowy z wyraźnymi refleksami podłużnymi.
   - **Stal konstrukcyjna żeber (`archSteelMat`)**: `metalness: 0.90`, `roughness: 0.20`, `envMapIntensity: 1.3` — twarda, lśniąca stal architektoniczna.
   - **Kanonierki LAAT (`republicRedMat`, `republicWhiteMat`)**: emalia ceramiczna i lakier wojskowy (`roughness: 0.25 - 0.28`).
   - **Tłoki hydrauliczne (`chromeMat`)**: `metalness: 0.98`, `roughness: 0.08`, `envMapIntensity: 1.5` — zwierciadlany chrom.

---

## 2. Wynik Weryfikacji
- Całkowity brak pikselozy i aliasingu na podłodze, pasie startowym i ścianach.
- Płynne, gładkie odbicia światła otoczenia na płytach lądowiska i pancerzu hangarowym.
