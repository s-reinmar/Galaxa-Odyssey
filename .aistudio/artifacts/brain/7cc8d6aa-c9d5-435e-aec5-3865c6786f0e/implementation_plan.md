# Refaktoryzacja Hangaru i Statku na Silnik Presetów (SOLID, SRP, OOP) oraz Poradnik Grafik

Plan wdrożenia modularnej architektury 3D, która dramatycznie redukuje kod proceduralny (z tysięcy linii do czystych definicji danych), rozdziela odpowiedzialności zgodnie z SOLID/SRP i umożliwia łatwe dodawanie własnych grafik PNG (atlasy tekstur, trim sheets) poprzez elastyczne presety.

## User Review & Critical Decisions

> [!IMPORTANT]
> Na podstawie odpowiedzi w fazie pytań przyjęto następujące ustalenia architektoniczne:
> 1. **Format zasobów**: Tekstury PNG i atlasy UV (Trim Sheets) nakładane na modułowe geometrie Three.js z wbudowaną obsługą proceduralnych fallbacków (gwarancja zero 404).
> 2. **Wzorzec architektoniczny**: Czyste presety konfiguracyjne (TypeScript/JSON) połączone z wyspecjalizowanymi fabrykami (`ShipFactory`, `HangarFactory`, `TextureAtlasManager`) spełniającymi zasadę Pojedynczej Odpowiedzialności (SRP) i Otwarte/Zamknięte (OCP).
> 3. **Zakres prac**: Refaktoryzacja obecnego hangaru i statku na silnik presetów + interaktywny panel przewodnika po przygotowywaniu grafik i strukturze presetów bezpośrednio w aplikacji.

---

## 1. Overview & Core Concept

### Problem
Dotychczasowy kod `CloneWarsHangar3D.ts` (ponad 1340 linii) i `Spaceship3D.ts` (ponad 670 linii) miesza bezpośrednie tworzenie geometrii proceduralnych, definicje materiałów, animacje, transformacje i logikę sceny w wielkich, monolitycznych klasach. Dodanie nowego statku lub hangaru wymaga pisania setek linijek imperatywnego kodu Three.js.

### Rozwiązanie
1. **Separacja Danych od Mechaniki (Preset-Driven Design)**: Model statku i hangar stają się deklaratywnymi obiektami konfiguracyjnymi (`IShipPreset`, `IHangarPreset`).
2. **SOLID & SRP**:
   - **SRP (Single Responsibility)**: Osobne klasy dla zarządzania teksturami/materiałami (`TextureAtlasManager`), budowania siatek (`MeshAssembler`), fabryki obiektów (`ShipFactory`, `HangarFactory`) i kontrolerów sceny (`SpaceHangarScene`).
   - **OCP (Open/Closed Principle)**: Nowy statek lub hangar dodaje się przez dopisanie nowego presetu w pliku konfiguracyjnym — bez modyfikowania ani jednej linijki kodu fabryki czy silnika gry.
   - **LSP (Liskov Substitution)**: Każdy preset hangaru implementuje wspólny kontrakt `IHangarPreset`, a statku `IShipPreset`, co pozwala na ich bezproblemową zamianę w runtime.
   - **ISP (Interface Segregation)**: Wąskie, dedykowane interfejsy: `ITexturable`, `ITrimSheet`, `ILightingRig`, `ITransformPart`.
   - **DIP (Dependency Inversion)**: Scena zależy od abstrakcji (`IShipFactory`, `IHangarFactory`), a nie od konkretnych implementacji proceduralnych.
3. **Trim Sheets i Atlasy UV**: Zamiast tworzyć setki oddzielnych małych klocków z osobnymi materiałami, stosuje się technikę **Trim Sheet** (standard w grach AAA): pojedynczą teksturę PNG podzieloną na pasy i panele (blachy, kratki, światła neonowe, krawędzie, spawy), na którą modularne części geometrii nakładają odpowiednie współrzędne UV.

---

## 2. Przewodnik: Jak Przygotować Własne Grafiki (Trim Sheets & PBR)

### A. Koncepcja Trim Sheet w Grach 3D
Trim Sheet to podłużny lub siatkowy atlas tekstur (zazwyczaj 2048x2048 lub 4096x4096 px), który zawiera uniwersalne elementy wykończenia:
- **Pasy krawędziowe (Trims)**: Krawędzie pancerza, spoiny, linie nitów, uszczelki.
- **Pasy funkcyjne**: Kratki wentylacyjne, radiatory chłodzenia, szyny montażowe.
- **Pasy oświetlenia (Emissive)**: Lampy, neony, linie dokowania, wskaźniki statusu.
- **Powierzchnie ciągłe (Tileable Panels)**: Gładki tytan, chropowaty kompozyt węglowy, płyty pancerza.

### B. Struktura Plików i Kanałów PBR
Dla maksymalnej wydajności i estetyki przygotowuje się zestaw map:
1. `albedo.png` (kolor bazowy, sRGB): Kolory pancerza, oznaczenia, pasy ostrzegawcze.
2. `roughness_metalness.png` (lub oddzielne mapy w kanałach R i G): Stopień połysku i metaliczności.
3. `emissive.png` (kanał świecenia): Elementy neonowe, silniki, ekrany, światła dokowania.
4. `normal.png` (opcjonalnie): Wypukłości płyt, śruby i panele bez dodawania polygonów.

### C. Mapowanie UV na Części Modułowe
W kodzie Three.js pomocnik `applyTrimUV(geometry, trimSlot)` modyfikuje atrybut `uv` siatki tak, aby pasował do wycinka tekstury (np. $Y \in [0.0, 0.15]$ dla kratki wentylacyjnej, $Y \in [0.15, 0.30]$ dla płyt pancerza). Dzięki temu ta sama grafika pokrywa dziesiątki modułowych elementów.

---

## 3. Architektura Systemu (Diagram)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PRESETS (Czyste Dane)                           │
│  - VanguardInterceptorPreset                                                │
│  - TitanHeavyGunshipPreset                                                  │
│  - CloneWarsRepublicDockPreset                                              │
│  - CyberpunkObsidianBayPreset                                               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FABRYKI I SERWISY (SRP/OOP)                        │
│                                                                             │
│  ┌────────────────────────┐  ┌────────────────────┐  ┌───────────────────┐  │
│  │  TextureAtlasManager   │  │    ShipFactory     │  │   HangarFactory   │  │
│  │  - Cache tekstur       │  │  - Montuje części  │  │ - Montuje hangar  │  │
│  │  - Generatory fallback │  │  - Mapuje Trim UV  │  │ - Pasy startowe   │  │
│  │  - Anizotropia / sRGB  │  │  - Węzły uzbrojenia│  │ - Oświetlenie bay │  │
│  └───────────┬────────────┘  └─────────┬──────────┘  └─────────┬─────────┘  │
└──────────────┼─────────────────────────┼───────────────────────┼────────────┘
               │                         │                       │
               ▼                         ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SCENA HANGARU & SILNIK GRY                           │
│  SpaceHangarScene / Modern3DMenu                                            │
│  - Renderuje gotowy THREE.Group                                             │
│  - Dynamicznie przełącza presety statku i hangaru w locie                   │
│  - Posiada panel instruktażowy: "Przewodnik po Grafikach i Presetach"      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Plan Wdrożenia Krok po Kroku

### Krok 1: Definicje Interfejsów i Schematów Presetów (`src/game/presets/`)
- `types.ts`:
  - `IShipPreset`: nazwa, opis, wymiary, sloty materiałowe, lista części kadłuba (`parts`: typ geometrii, wymiary, pozycja, rotacja, slot UV trim sheet), punkty montażowe broni (`hardpoints`), konfiguracja dysz silników (`thrusters`).
  - `IHangarPreset`: nazwa, styl architektoniczny, wymiary bay, tekstury podłogi/ścian, konfiguracja platformy lądownika, oświetlenie otoczenia, bramy hangaru.
  - `ITrimSheet`: definicje stref UV (płyty pancerza, kratki, neony, krawędzie).

### Krok 2: Serwis Tekstur i Pomocnik UV Trim Sheet (`src/game/presets/`)
- `TextureAtlasManager.ts`:
  - Wczytywanie tekstur PNG z obsługą przezroczystości, anizotropii i `SRGBColorSpace`.
  - Wbudowany automatyczny fallback Canvas2D o wysokiej jakości (brak błędów 404 w przypadku braku lokalnego pliku PNG).
- `trimSheetHelper.ts`:
  - Funkcja `mapTrimUV(geometry, uMin, vMin, uMax, vMax)` przekształcająca współrzędne UV standardowych geometrii Three.js na wybrane pasy trim sheetu.

### Krok 3: Fabryki Obiektów (`ShipFactory` i `HangarFactory`)
- `ShipFactory.ts`:
  - Przyjmuje `IShipPreset` oraz `TextureAtlasManager`.
  - Zwraca gotowy, zoptymalizowany `THREE.Group` z poprawnie przypisanymi materiałami, pancerzem i światłami silnika.
  - Kod budowy zredukowany z 670 linijek do uniwersalnego pętli montażowej części (`assembleParts()`).
- `HangarFactory.ts`:
  - Zastępuje monolityczny kod hangaru modularnym składaniem segmentów: podłoże, łuki konstrukcyjne, platforma lądowiska, wrota i oświetlenie rig.

### Krok 4: Wbudowane Presety Przykładowe
- Statki:
  - `Vanguard Interceptor` (lekki myśliwiec szturmowy, styl Clone Wars)
  - `Titan Gunship` (ciężki opancerzony niszczyciel)
  - `Spectre Stealth` (ciemny, matowy myśliwiec zwiadowczy)
- Hangary:
  - `Republic Navy Dock` (jasnoszary, wojskowy, czysty)
  - `Obsidian Deep Bay` (ciemny, grafitowy z cyjanowymi liniami nawigacyjnymi)

### Krok 5: Interaktywny Panel Przewodnika w Menu Aplikacji
- Dedykowany, estetyczny komponent modalny w menu hangaru:
  - **Przewodnik po Grafikach**: Ilustrowane wskazówki tworzenia trim sheetów w Photoshopie/GIMP/Aseprite/Blenderze, optymalne wymiary, rozkład UV i kanały PBR.
  - **Struktura Kodu i Presety**: Przykłady tworzenia własnego pliku presetu i podłączania go do silnika gry.
  - **Przełącznik Presetów**: Możliwość przetestowania w locie przełączania statków i hangarów w scenie 3D.

---

## 5. Weryfikacja i Testy
- Kompilacja projektu (`compile_applet`) oraz weryfikacja typów TypeScript.
- Potwierdzenie braku żółtych linii pomocniczych w menu (zgodnie z wcześniejszymi uwagami).
- Sprawdzenie wydajności (liczba draw calls, pamięć geometrii, płynność 60 FPS).
