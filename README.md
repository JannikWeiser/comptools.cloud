# comptools.cloud

Website von Jannik Weiser: Software-Tools (Callzone-Management, Lead-Uhr, TI-Rechner) und Wettkampftechnik für Kletterwettkämpfe. Statische Seite ohne Build-Schritt, gehostet über GitHub Pages unter https://comptools.cloud.

## Struktur

```
index.html          Startseite (Deutsch)
en/index.html       Startseite (Englisch) – Textänderungen immer in beiden Sprachen nachziehen
hilfe.html          Fragen & Anleitungen (DE), en/help.html (EN); verlinkt aus den Tool-Zeilen und dem Kontakt, FAQ auch als JSON-LD im <head>
impressum.html      Impressum (nur Deutsch, auch von der englischen Seite verlinkt)
datenschutz.html    Datenschutzerklärung (nur Deutsch)
style.css           Design für alle Seiten, Farben ganz oben unter :root
main.js             Menü, Einblenden beim Scrollen, Animationen der Mockups
assets/img/         Bilder als WebP, og-image.jpg für Link-Vorschauen (Bildnachweise im Impressum pflegen)
404.html            Fehlerseite (absolute Pfade, weil GitHub sie für jede fehlende URL ausliefert)
robots.txt          Erlaubt alle Crawler und verweist auf die Sitemap
sitemap.xml         Beide Sprachversionen; lastmod bei größeren Änderungen anpassen
llms.txt            Kurzbeschreibung für AI-Agenten – bei Textänderungen mitpflegen
favicon.svg …       Favicon und App-Icon
CNAME               Eigene Domain für GitHub Pages
```

Strukturierte Daten (JSON-LD) stehen am Ende des `<head>` beider Startseiten und müssen bei Textänderungen an den Tools mitgepflegt werden. Neue Bilder als WebP ablegen, z. B. `cwebp -q 74 -m 6 bild.jpg -o bild.webp`.

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
