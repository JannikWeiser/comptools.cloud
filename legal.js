// Jahreszahl im Footer der Rechtstexte (als eigene Datei, damit die Content-Security-Policy keine Inline-Skripte erlauben muss)
document.getElementById('year').textContent = new Date().getFullYear();
