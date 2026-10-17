# comptools.cloud

Website von Jannik Weiser: Software-Tools (Callzone-Management, Lead-Uhr, TI-Rechner) und Wettkampftechnik für Kletterwettkämpfe. Statische Seite ohne Build-Schritt, gehostet über GitHub Pages unter https://comptools.cloud.

## Struktur

```
index.html          Startseite (Deutsch)
en/index.html       Startseite (Englisch) – Textänderungen immer in beiden Sprachen nachziehen
impressum.html      Impressum (nur Deutsch, auch von der englischen Seite verlinkt)
datenschutz.html    Datenschutzerklärung (nur Deutsch)
style.css           Design für alle Seiten, Farben ganz oben unter :root
main.js             Menü, Einblenden beim Scrollen, Animationen der Mockups
assets/img/         Optimierte Bilder (Bildnachweise im Impressum pflegen)
favicon.svg …       Favicon und App-Icon
CNAME               Eigene Domain für GitHub Pages
```

Die Mockups der Tools sind reines HTML/CSS im Look der echten Apps und laden nichts von außen.

## Sicherheit

Alle Seiten haben eine strenge Content-Security-Policy (Meta-Tag im `<head>`): Skripte, Styles, Bilder und Schriften nur von der eigenen Domain.
Deshalb gilt:
- keine Inline-Skripte (`<script>…</script>`) und keine `style="…"`-Attribute im HTML; stattdessen eigene Dateien bzw. Klassen (z. B. `accent-lime`)
- keine externen Schriften, Skripte oder Einbettungen ohne Anpassung der Policy und der Datenschutzerklärung
- Sicherheitskontakt: `.well-known/security.txt` (Ablaufdatum jährlich verlängern)

## Lokal ansehen

```bash
python3 -m http.server 8080
```

Dann http://localhost:8080 öffnen.
