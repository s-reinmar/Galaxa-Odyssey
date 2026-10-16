# Dziennik Prac Refaktoryzacyjnych — KROK 1

**Data:** 16 października 2026 r.  
**Moduł:** Likwidacja migotania świateł i stabilizacja oświetlenia studyjnego  
**Zmienione pliki:**
- `src/components/3d/Spaceship3D.ts`
- `src/game/hangar/CloneWarsHangar3D.ts`
- `src/components/3d/SpaceHangarScene.ts`

---

## 1. Wprowadzone Modyfikacje i Rationale Techniczne

1. **`src/components/3d/Spaceship3D.ts`:**
   - **Problem:** W metodzie `update()` natężenie świateł silników i skala płomieni była generowana przy użyciu `Math.random()` 60 razy na sekundę (`light.intensity = 2.8 + flicker * 1.8`), co powodowało nieprzyjemny, stroboskopowy szum na kadłubie myśliwca.
   - **Rozwiązanie:** Usunięto losowy stroboskop. Wprowadzono stabilne, szlachetne oświetlenie napędu jonowego (`intensity: 3.0` dla silnika centralnego, `intensity: 1.8` dla bocznych), eliminując wszelkie drgania światła.

2. **`src/game/hangar/CloneWarsHangar3D.ts`:**
   - **Problem 1 (Kolizja świateł):** Światło `padGlow` na platformie lądowiska znajdowało się na wysokości $Y = 1.4$ przy natężeniu 12.0. Statek gracza unosi się w przedziale $Y = 1.18$ do $1.25$. W efekcie obrotu platformy źródło światła przecinało geometrię myśliwca i kokpitu, wywołując gwałtowne rozbłyski.
   - **Rozwiązanie 1:** Pozycję `padGlow` przeniesiono bezpiecznie pod podłogę lądowiska ($Y = 0.18$) ze zbalansowanym natężeniem `2.6`, tworząc miękką poświatę antygrawitacyjną bez przecinania kadłuba.
   - **Problem 2 (Prześwietlenie żyrandola):** 6 spotlightów w żyrandolu nad statkiem miało natężenie 28 lumenów każdy (łącznie 168), co powodowało przepalenia bieli i ostre plamy specularne.
   - **Rozwiązanie 2:** Skalibrowano natężenie każdego reflektora do `4.2` ze zwiększonym kątem półcienia (`penumbra: 0.7`), uzyskując miękkie, kinowe stożki oświetleniowe.
   - **Problem 3 (Agresywne pulsowanie):** Stożki wolumetryczne i lampy stanchionów pulsowały z dużą częstotliwością (`Math.sin(elapsedTime * 5.0)`).
   - **Rozwiązanie 3:** Ustabilizowano przezroczystość stożków na stałym poziomie `0.12`, a lampy obrysowe wprowadzono w bardzo spokojny, powolny cykl lotniczy (`1.5 rad/s`).

3. **`src/components/3d/SpaceHangarScene.ts`:**
   - **Problem:** `canopyLight` znajdowało się na wysokości $Y = 1.2$ ponad statkiem, a `bounceLight` miało zbyt duże natężenie (`3.6`, zasięg 18), zacierając kontrast cieni.
   - **Rozwiązanie:** `canopyLight` umieszczono bezpośrednio nad owiewką ($Y = 0.42, Z = 0.65$, natężenie `0.75`), a `bounceLight` obniżono do `1.8`, zapewniając czysty, plastyczny rysunek światłocienia.

---

## 2. Wynik Weryfikacji
- Brak jakichkolwiek artefaktów migotania pod dowolnym kątem kamery.
- Statek i kokpit są równomiernie, szlachetnie doświetlone bez stroboskopu.
