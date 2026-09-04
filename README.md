# 🧟 Pixel Survivors

Ein Pixel-Art Zombie-Survival-Spiel für den Browser. Keine Abhängigkeiten, kein
Build-Schritt nötig — funktioniert offline und auf dem iPad genauso wie am Desktop.

## Spielen

- **Online:** https://anonym246.github.io/Pixel-Survivor/
- **Lokal:** Repo klonen und `index.html` im Browser öffnen.
- **Als Einzeldatei:** `node build.js` erzeugt `dist/pixel-survivors.html` — eine
  eigenständige HTML-Datei mit allem darin, zum Weitergeben oder Einbetten.

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

## Aufbau

```
index.html   Markup
style.css    Oberfläche — HUD, Overlays, Shop
game.js      Spiellogik, Rendering, Audio
build.js     baut daraus dist/pixel-survivors.html (Einzeldatei)
```

Technisch:

- Canvas-Rendering mit doppelter interner Auflösung (`SS = 2`) — die Spiellogik rechnet
  in Weltpixeln, gezeichnet wird mit doppelter Pixeldichte. Ergibt scharfe Kanten und
  saubere Schrift auf Retina-Displays, ohne den Pixel-Look zu verlieren.
- Kamera folgt gedämpft, alles außerhalb des Sichtfelds wird übersprungen
- Sprites werden zur Laufzeit aus ASCII-Mustern und Farbpaletten auf Canvas gebacken
- Die Karte wird pro Runde neu generiert: Biome, Wege, Krater, Gräber, Bewuchs, Körnung
- Sound komplett prozedural über die Web Audio API — keine Audiodateien
- Steuerung über Pointer Events mit mehreren Sicherheitsnetzen: ein neuer Finger
  übernimmt immer, und ein Wachhund erkennt verlorene Eingaben (iOS-Gesten,
  App-Wechsel), damit die Figur nie unkontrolliert weiterläuft
- Autosave im `localStorage`

## Balancing

Die Waffen liegen bewusst in engen DPS-Bändern je Seltenheit, damit die Wahl vom
Spielstil abhängt und nicht von einer offensichtlich besten Waffe:

| Seltenheit | Ø DPS | Spanne |
|---|---|---|
| Gewöhnlich | 26 | 23 – 30 |
| Selten | 50 | 28 – 63 |
| Episch | 83 | 69 – 104 |
| Legendär | 138 | 89 – 173 |

Waffen am unteren Rand ihres Bandes gleichen das über Reichweite, Durchschlag oder
Flächenschaden aus — die Railgun etwa trifft mit unendlichem Durchschlag eine ganze
Reihe, die Singularität zieht Gegner zusammen.

Die Gegner werden über die Wellen hinweg mehr statt nur zäher: die Lebenspunkte
wachsen flacher als früher, dafür steigen Anzahl, Typenvielfalt und Elite-Anteil.
Eine Welle dauert dadurch quer durch den Lauf etwa 10–35 Sekunden.

## Lizenz

MIT — siehe [LICENSE](LICENSE).
