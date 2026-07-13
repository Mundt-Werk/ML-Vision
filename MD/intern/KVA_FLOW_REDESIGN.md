# KVA-Flow Redesign — Vollständiger Plan
> **Stand:** April 2026  
> **Problem:** KVA-Formular ist unverständlich, zeigt sofort alte KVAs, kein klarer Workflow  
> **Ziel:** Sauberer 4-Schritt-Prozess vom Kunden zum fertigen Kostenvoranschlag

---

## Kernprobleme (Ist-Zustand)

| Problem | Auswirkung |
|---------|------------|
| „KVA erstellen" öffnet sofort alten KVA | Verwirrend — was ist das? Warum ist da schon was? |
| „Laden / Löschen" Buttons ohne Kontext | Unverständlich — laden von wo? |
| Kein Kundenbezug beim Start | Man weiß nicht für wen man gerade arbeitet |
| Riesiges Scrollformular ohne Struktur | Man verliert den Überblick |
| Scroll-Bug durch IntersectionObserver | Seite springt beim Navigieren nach oben |
| Sections B+C erscheinen ohne Vorwarnung | Formular wächst unerwartet |

---

## Neuer Flow — 4 Schritte

```
[Sidebar: KVA erstellen]
        │
        ▼
┌─────────────────┐
│  SCHRITT 1      │  Kunde wählen oder neu anlegen
│  Kunde wählen   │  → Suche in bestehenden Kunden
│                 │  → Oder: „Neuer Interessent" (ohne Kundenkonto)
└────────┬────────┘
         │ Kunde ausgewählt
         ▼
┌─────────────────┐
│  SCHRITT 2      │  Welche Produkte/Module?
│  Produkt wählen │  → Klickbare Modul-Karten (Telefon-Bot, Chatbot, etc.)
│                 │  → Mehrfachauswahl möglich
│                 │  → Hinweis wenn KVA schon existiert → direkt zu Schritt 4
└────────┬────────┘
         │ Produkt(e) gewählt
         ▼
┌─────────────────┐
│  SCHRITT 3      │  Schnell-Check
│  Bestätigen     │  → Zusammenfassung: Kunde + Produkte
│                 │  → Button: „KVA erstellen"
└────────┬────────┘
         │ Klick
         ▼
┌─────────────────┐
│  SCHRITT 4      │  KVA-Detailformular (neue, saubere Seite)
│  KVA ausfüllen  │  → Modulare Sektionen (nur relevante werden gezeigt)
│                 │  → Aktionsleiste mit allen Optionen
└─────────────────┘
```

---

## Schritt 1 — Kunde wählen

**Seite:** `admin/angebote/kva-form.html` (oder neue `kva-wizard.html`)

**Design:**
- Suchfeld oben: live-Suche in `sales_leads` Collection
- Ergebnisse als Karten: Firmenname, Kontakt, letzter KVA-Status (Badge)
- Wenn Kunde bereits einen KVA hat: Badge „1 KVA vorhanden" + Option direkt dorthin zu springen
- Button: „+ Neuer Interessent" → öffnet Inline-Miniformular (Firma, Name, E-Mail, Telefon)

**Was passiert:**
- Kunden-ID und Kundendaten werden in SessionStorage gespeichert
- Weiter zu Schritt 2

---

## Schritt 2 — Produkt wählen

**Design:**
- Große Modul-Karten zum Anklicken (nicht Checkboxen)
- Jede Karte zeigt: Icon, Name, kurze Beschreibung, Preisrange
- Auswahl wird farblich markiert (aktiv/inaktiv)

**Module:**
| Karte | Icon | Beschreibung |
|-------|------|--------------|
| Telefon-Assistent | Phone | KI nimmt Anrufe entgegen, 24/7 |
| Chatbot (Website) | MessageSquare | Chatbot auf der Webseite |
| E-Mail-Sortierung | Mail | Eingehende Mails klassifizieren |
| Terminbuchung | Calendar | Kalenderanbindung & Buchung |
| Sonstiges | Sliders | Individuelle Lösung |

**Wenn Kunde schon KVA hat:**
- Hinweisbox erscheint: „Für [Firma] existiert bereits KVA-20260329-117 (Status: Vertrag). Möchtest du diesen bearbeiten oder einen neuen erstellen?"
- Zwei Buttons: „Bestehenden öffnen" | „Neuen erstellen"

---

## Schritt 3 — Bestätigen

**Design:**
- Kompakte Zusammenfassung: Kundenname + Produkte als Tags
- Großer Button: „KVA erstellen →"
- Optional: Freifeld „Notiz/Kontext für diesen KVA"

---

## Schritt 4 — KVA-Detailformular (neue Maske)

**Seite:** `admin/angebote/kva-detail.html` (neue Seite) oder Modal auf `kva-form.html`

### Seitenaufbau

```
┌─── KOPFZEILE ─────────────────────────────────────────────────┐
│  Kunde: Mybach & Co. Immobilien   KVA-20260412-001   [Status] │
│  [Speichern]  [Löschen]  [Drucken/PDF]  [Zum Angebot →]      │
└───────────────────────────────────────────────────────────────┘

┌─── MODUL-SCHALTER ────────────────────────────────────────────┐
│  [✓ Telefon-Bot]  [✓ Volumen]  [  Chatbot]  [  Integration]  │
│  [  Standort]     [  Budget]                                  │
└───────────────────────────────────────────────────────────────┘

┌─── AKTIVE SEKTIONEN (nur eingeschaltete) ─────────────────────┐
│  Telefonie-Details                                            │
│  Anrufvolumen                                                 │
│  ...                                                          │
└───────────────────────────────────────────────────────────────┘
```

### Aktionsleiste (sticky, immer sichtbar oben)

| Button | Aktion |
|--------|--------|
| **Speichern** | Firestore update (oder create) |
| **Löschen** | Löscht KVA nach Bestätigung |
| **PDF / Drucken** | Öffnet KVA-Vorschau zum Drucken |
| **Zum Angebot →** | Status auf `angebot` setzen, öffnet Dokument-Hub |

### Modul-Schalter (Toggle-Leiste)

- Immer alle verfügbaren Module sichtbar
- Jedes Modul kann an/aus geschaltet werden
- Eingeschaltete Module = Sektionen die im Formular erscheinen
- Beim Laden eines bestehenden KVA werden automatisch die richtigen Module aktiviert
- **Keine versteckten Sektionen mehr** — was du nicht brauchst, schaltest du einfach aus

### Sektionen (Inhalt bleibt wie jetzt, Design bereinigt)

| Modul | Sektion(en) |
|-------|-------------|
| Telefon-Bot | Nummernmodell, Anbieter, Bot-Aufgaben, Sprachen |
| Volumen | Anrufvolumen-Kalkulation, Volumen-Modus |
| Integration | CRM, Reservierungssystem, API |
| Bot-Konfiguration | Was nimmt der Bot auf, wohin weiterleiten |
| Standort | Adresse, Vor-Ort-Termin, Anfahrt |
| Budget | Preisvorstellung, Timeline |

---

## Was mit der alten kva-form.html passiert

Die aktuelle `kva-form.html` wird durch den Wizard ersetzt. Übergangsstrategie:

1. **Wizard (neu):** `kva-form.html` → wird zur Wizard-Seite (Schritte 1–3)
2. **Detailformular (neu):** `kva-detail.html` → KVA ausfüllen (Schritt 4)
3. **Altes Formular:** Bis Redesign fertig — bestehende Struktur intern behalten, aber „gespeicherte KVAs laden"-Block entfernen

---

## Scroll-Bug Fix (sofort umsetzbar)

**Ursache:** `btn.scrollIntoView(...)` in `setActiveStep()` löst auch vertikales Scrollen der Seite aus, weil der Button im sticky-Nav ist.

**Fix:** `scrollIntoView` durch manuelles horizontales Scrollen der Nav ersetzen:

```javascript
// Statt:
btn.scrollIntoView({ inline: 'nearest', block: 'nearest' });

// So:
const nav = document.querySelector('.kva-steps');
const btnLeft = btn.offsetLeft;
const btnRight = btnLeft + btn.offsetWidth;
const navScrollLeft = nav.scrollLeft;
const navWidth = nav.offsetWidth;
if (btnLeft < navScrollLeft) nav.scrollLeft = btnLeft - 12;
else if (btnRight > navScrollLeft + navWidth) nav.scrollLeft = btnRight - navWidth + 12;
```

---

## Sidebar-Änderung

Aktuell: „KVA erstellen" → öffnet direkt `kva-form.html` mit altem KVA  
Neu: 

```
Sidebar:
├── Dokument-Hub     → Übersicht aller KVAs
└── Neuer KVA        → kva-form.html (Wizard, leere Seite, kein auto-load)
```

Der Sidebar-Link zu „KVA erstellen" öffnet den Wizard immer **ohne** vorgeladenen KVA.  
Bestehende KVAs werden nur über den Dokument-Hub oder aus der Kundenkarte heraus geöffnet.

---

## Umsetzungsreihenfolge

### Sofort (diese Session)
- [ ] Scroll-Bug fixen (5 Zeilen JS)
- [ ] Auto-load letzten KVA beim Start deaktivieren (oder hinter `?load=...` verstecken)
- [ ] Konfuse „Laden/Löschen"-Buttons aus dem Startbereich entfernen

### Sprint 1 (nächste Session)
- [ ] Schritt 1–3 Wizard implementieren (`kva-form.html` umbauen)
- [ ] Kundensuche in Schritt 1
- [ ] Modul-Karten in Schritt 2

### Sprint 2
- [ ] `kva-detail.html` als neue Seite
- [ ] Sticky Aktionsleiste mit allen Buttons
- [ ] Modul-Toggle-Leiste
- [ ] Sektionen modular ein/ausschaltbar

### Sprint 3
- [ ] „Zum Angebot wandeln" Flow
- [ ] Status-Tracking im Dokument-Hub
- [ ] Margin-Dokument intern

---

## Wichtige Entscheidungen

**Frage: Wizard als neue Seite oder als Modal?**  
→ Neue Seite (`kva-form.html` umbauen). Modals werden bei diesem Umfang zu klein und unübersichtlich.

**Frage: Wo werden KVA-Entwürfe gespeichert?**  
→ Firestore `quotes` Collection wie bisher. Entwurf-Status = `draft`.

**Frage: Was wenn man „KVA erstellen" klickt ohne Kundenkonto?**  
→ Schritt 1 bietet „Neuer Interessent" an — minimale Daten (Firma, Name, E-Mail).  
→ KVA wird mit `customerId: null` gespeichert, kann später verknüpft werden.
