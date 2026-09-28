# comptools.cloud

Tools & Technik für Kletterwettkämpfe – statische Website, gehostet über GitHub Pages.

## Struktur

```
index.html          Startseite (Tools, Technik, Kontakt)
impressum.html      Impressum (Platzhalter ausfüllen!)
datenschutz.html    Datenschutzerklärung (Platzhalter ausfüllen!)
css/style.css       Design (Farben ganz oben unter :root)
js/main.js          Kleine Helfer (Scroll-Effekt, Farbfotos am Handy)
assets/img/         Optimierte Bilder für die Website
CNAME               Eigene Domain für GitHub Pages
```

## Neues Tool oder neue Technik hinzufügen

In `index.html` eine bestehende `<article class="card">` kopieren und anpassen:
- `id` (für den Schnellzugriff-Kreis oben)
- `style="--accent: var(--green)"` – Akzentfarbe: `--red`, `--green`, `--orange`, `--blue`, `--yellow`
- Bild in `assets/img/` ablegen (ca. 1400 px breit, JPG) und `src` anpassen
- Titel, Text und Link

Optional oben in `.highlights` einen weiteren Kreis ergänzen.

## Lokal ansehen

```bash
python3 -m http.server 8080
```

Dann http://localhost:8080 öffnen.

## Domain comptools.cloud verbinden

Beim Domain-Anbieter folgende DNS-Einträge setzen:

| Typ   | Name | Wert                   |
|-------|------|------------------------|
| A     | @    | 185.199.108.153        |
| A     | @    | 185.199.109.153        |
| A     | @    | 185.199.110.153        |
| A     | @    | 185.199.111.153        |
| CNAME | www  | jannikweiser.github.io |

Danach in GitHub unter *Settings → Pages* „Enforce HTTPS“ aktivieren.
Die Subdomain `timer.comptools.cloud` bleibt davon unberührt.
