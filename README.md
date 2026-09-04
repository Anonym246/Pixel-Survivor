# 🧟 Pixel Survivors

Ein Pixel-Art Zombie-Survival-Spiel für den Browser. **Eine einzige HTML-Datei**, keine
Abhängigkeiten, kein Build — funktioniert offline und auf dem iPad genauso wie am Desktop.

## Spielen

- **Online:** https://anonym246.github.io/Pixel-Survivor/
- **Lokal:** `index.html` herunterladen und im Browser öffnen.

## Steuerung

| Eingabe | Aktion |
|---|---|
| Irgendwo auf dem Feld ziehen | Laufen (Joystick erscheint unter dem Finger) |
| WASD / Pfeiltasten | Laufen (Desktop) |
| — | Waffen feuern automatisch auf das nächste Ziel |

## Spielprinzip

Überlebe endlose Zombie-Wellen auf einer 1760×1180 großen Karte. Nach jeder Welle hast du
5 Sekunden zum Coins-Einsammeln, danach öffnen sich Level-Belohnungen und der Shop.

**Gegner** — acht Archetypen, die sich nach und nach freischalten:

| Typ | Verhalten |
|---|---|
| Wandler | Standard-Nahkämpfer |
| Renner | schnell, wenig Leben |
| Brecher | langsamer Tank mit hohem Schaden |
| Spucker | Fernkämpfer, hinterlässt ätzende Säurepfützen |
| Sprengling | explodiert bei Kontakt |
| Panzerter | feste Schadensreduktion |
| Nekromant | beschwört laufend neue Zombies |
| Schemen | sehr schnell, läuft durch andere hindurch |

Ab Welle 8 tauchen Elite-Varianten mit mehr Leben, goldenem Ring und dreifachen Coins auf.

**Bosse** — alle 5 Wellen, im Wechsel, jeweils mit angekündigten Angriffen und Wut-Phase
unter 38% Leben:

- **Der Koloss** — Ansturm mit Telegraph-Linie, Schockwellen
- **Seuchenmeister** — Beschwörungen, Blink, radiale Nova
- **Der Kanonier** — Projektilsalven, Mörser mit Bodenmarkierungen
- **Die Brutmutter** — Brut-Spawns, Säurekegel, Ansturm

**Items** — 24 Waffen über vier Seltenheiten mit eigenen Effekten (Brand, Verlangsamung,
Kettenblitz, Zielsuche, Splash, Säurepfützen, Schwerkraft-Wirbel, unendlicher Durchschlag)
plus Rüstungen, Ringe, Schilde und Haustiere. Stärkere Items bringen stärkere Boni, aber
auch spürbare Nachteile.

**Fusion** — zwei identische Items derselben Stufe verschmelzen zu einer Stufe höher:
+45% auf alle Vorteile, Nachteile bleiben unverändert, bis +4. Der Fusions-Tab im Shop
zeigt die fertigen Endwerte, bevor du dich entscheidest.

Der Spielstand wird automatisch im `localStorage` des Browsers gesichert.

## Technik

Alles steckt in `index.html`:

- Canvas-Rendering mit `image-rendering: pixelated`, Kamera mit Off-Screen-Culling
- Sprites werden zur Laufzeit aus ASCII-Mustern und Farbpaletten auf Canvas gebacken
- Sound komplett prozedural über die Web Audio API — keine Audiodateien
- Steuerung über Pointer Events mit mehreren Sicherheitsnetzen gegen hängende Eingaben
- Autosave im `localStorage`

## Lizenz

MIT — siehe [LICENSE](LICENSE).
