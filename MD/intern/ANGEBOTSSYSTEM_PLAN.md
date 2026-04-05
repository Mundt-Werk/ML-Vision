# ML Vision — Angebotssystem & Kostenvoranschlag
> **Ziel:** Leon gibt Kundendaten ein → sieht sofort Kosten + Marge + Kundenpreis → erstellt rechtsgültiges Angebot in Sevdesk
> **Stand:** März 2026

---

## 🗺️ Überblick: Der komplette Prozess

```
1. DATEN SAMMELN          2. KALKULATION            3. ANGEBOT              4. ABRECHNUNG
Kundendaten eingeben  →  Kosten berechnen       →  Sevdesk-Angebot     →  Monatliche Rechnung
(Checkliste nutzen)      (Pricing Kalkulator)      (Template nutzen)       (Sevdesk)
                         Einmal + Monatlich         Netto + MwSt
                         Anfahrt einrechnen         Klauseln prüfen
                         Marge einstellen
```

---

## ✅ Datencheckliste für Kunden-Angebote

Vor jedem Angebot müssen diese Daten vorliegen. Wenn Daten fehlen → NICHT kalkulieren!

### Pflichtdaten (ohne diese kein Angebot)
- [ ] **Firmenname** (offiziell, exakt wie im Handelsregister)
- [ ] **Rechtsform** (GmbH, GbR, Einzelunternehmer, etc.)
- [ ] **Anschrift** (Straße, PLZ, Ort — Rechnungsadresse)
- [ ] **USt-IdNr.** (falls Unternehmer — für korrekte MwSt-Behandlung)
- [ ] **Ansprechpartner Name + E-Mail** (für Kommunikation)
- [ ] **Telefon des Ansprechpartners**
- [ ] **Gewünschtes Produkt / Paket** (was genau soll gebaut werden?)

### Technische Daten (für korrekte Kalkulation)
- [ ] **Erwartetes Anrufvolumen** (Minuten/Monat oder Anrufe/Monat + Ø Gesprächsdauer)
- [ ] **Sprache(n) des Bots** (Deutsch, Englisch, etc.)
- [ ] **Verfügbarkeit** (24/7 oder nur Öffnungszeiten? Mo–Fr?)
- [ ] **Mobilfunk-Anteil** (wie viel % der Anrufer rufen vom Handy an?)
- [ ] **Benötigte Integrationen** (CRM, Reservierungssystem, Kalender, etc.)
- [ ] **Bestehende Telefonnummer** (Portierung gewünscht? Neue Nummer?)
- [ ] **Outbound benötigt?** (soll Bot auch aktiv anrufen?)

### Projektdaten (für Setup-Kalkulation)
- [ ] **Komplexität des Dialogs** (einfach = 1 Ziel / mittel = 3–5 Ziele / komplex = >5 Ziele)
- [ ] **Anzahl Szenarien / Use Cases**
- [ ] **Wissen/Wissensbasis** (FAQ, Speisekarte, Produktliste — liegt das vor?)
- [ ] **Gewünschter Go-Live Termin**
- [ ] **Vor-Ort Termin gewünscht?** (→ Anfahrt berechnen!)
- [ ] **Testzeitraum gewünscht?** (optional, aber klar definieren)

### Standortdaten (für Anfahrtsberechnung)
- [ ] **Stadt des Kunden**
- [ ] **Unser Standort → Kunde** (km Distanz, einfache Strecke)
- [ ] **Fahrtzeit** (ca. Stunden einfache Strecke)
- [ ] **Anfahrt nötig?** (Ja / Nein / Noch unklar)
- [ ] **Übernachtung nötig?** (bei >2h Fahrt oder Ganztag-Termin)

---

## 💰 Kalkulationsstruktur

### Zwei Kostenarten immer separat ausweisen

#### 1. Einmalkosten (Setup / Einrichtung)
| Position | Beschreibung | Kalkulation |
|----------|-------------|-------------|
| Konzeption | Dialog-Design, Beratung | Stunden × Stundensatz |
| Entwicklung | Bot-Programmierung, Konfiguration | Stunden × Stundensatz |
| Integration | CRM, Kalender, API-Anbindungen | Stunden × Stundensatz |
| Training | Wissensbasis einpflegen, Testen | Stunden × Stundensatz |
| Anfahrt | km-basiert (s.u.) | km × Satz |
| Einweisung | Schulung des Kunden | Stunden × Stundensatz |

**Unsere Stundensätze (intern):**
- Basis-Entwicklung: [Stundensatz eintragen]
- Beratung/Konzeption: [Stundensatz eintragen]
- Schnell-Termin / Vor-Ort: [Stundensatz eintragen]

#### 2. Laufende Kosten (monatlich)
| Position | Beschreibung | Kalkulation |
|----------|-------------|-------------|
| Tool-Kosten | ElevenLabs, Twilio, etc. | Volumen-basiert (Pricing Kalkulator) |
| Wartung & Monitoring | Laufende Betreuung | Pauschale oder Stunden |
| Support-Kontingent | x Stunden/Monat inklusive | Stunden × Satz |
| Hosting/Infrastruktur | Server-Anteil (n8n, Firebase) | Pauschale |

---

## 🚗 Anfahrtsberechnung

### Grundregel: Immer Anfahrt im Angebot aufführen!

**Kostenformel Anfahrt:**
```
Anfahrtskosten = (km_einfach × 2 × km_satz) + (stunden_fahrt × 2 × stundensatz_fahrt)

Beispiel Leipzig (~280 km, ~2,5h):
km-Kosten:     280 × 2 × €0.35 = €196.00 (steuerlich: €0.35/km als Nacht 2024)
Fahrtzeit:     2.5 × 2 × €[Stundensatz] = [Betrag]
--------------------------------------------
Gesamt Anfahrt: €[Summe] Netto
```

**Unsere Kilometer-Pauschale:** €0.35/km (steuerlich anerkannt 2024/2025)
**Alternativ:** Bahn 1. Klasse + Taxi wenn günstiger (immer vergleichen!)

### Anfahrtsszenarien

| Distanz | Empfehlung | Kosten (ca.) |
|---------|-----------|-------------|
| < 50 km | Auto, keine Übernachtung | < €35 |
| 50–150 km | Auto oder Bahn, Halbtag | €35–€105 |
| 150–300 km | Bahn 1. Klasse, evtl. Übernachtung | €100–€300 |
| > 300 km | Bahn oder Flug + Übernachtung | ab €300 |

### Übernachtung
- Pauschale Hotel: €80–€150/Nacht (je nach Stadt)
- Immer im Angebot ausweisen: "Reisekosten nach Aufwand, max. €X"
- Oder als Pauschalpreis: "Anfahrt Pauschal €XXX"

---

## 🔢 Brutto / Netto Berechnung

### Grundregel in Deutschland
```
Netto-Preis × 1.19 = Brutto-Preis (19% MwSt)
Brutto-Preis / 1.19 = Netto-Preis

Beispiel:
Netto:   €1.000,00
MwSt:    €   190,00 (19%)
Brutto:  €1.190,00
```

### Wann welche Preise ausweisen?
- **An Unternehmen (B2B):** Immer Netto ausweisen + MwSt separat
- **An Privatkunden (B2C):** Bruttopreis ausweisen (inkl. MwSt)
- **Restaurants/Gastronomie:** Sind Unternehmen → B2B → Netto

### Im Angebot immer:
1. Alle Positionen **Netto**
2. Summe **Netto**
3. + MwSt 19% (Betrag)
4. = Summe **Brutto**

---

## 📊 Margen-Kalkulation

### Marge vs. Aufschlag — der Unterschied!
```
AUFSCHLAG (Markup):  Kosten × (1 + Aufschlag%) = Preis
Beispiel: €100 Kosten × 1.50 = €150 Preis → 50% Aufschlag aber nur 33% Marge!

MARGE (Margin):      Preis = Kosten / (1 - Marge%)
Beispiel: €100 / (1 - 0.40) = €166,67 → 40% echte Marge
```

**Wir kalkulieren immer mit echter MARGE (nicht Aufschlag)!**

### Empfohlene Margen je Bereich

| Bereich | Min-Marge | Ziel-Marge | Erklärung |
|---------|----------|-----------|-----------|
| Tool-Kosten (monatlich) | 30% | 40–50% | Wir managen und supporten |
| Setup / Entwicklung | 40% | 55–65% | Unser Know-how |
| Anfahrt | 0–10% | 0% | Meist 1:1 weitergeben |
| Support-Stunden | 50% | 60% | Premiumservice |

### Leon's Schnell-Formel:
```
Kundenpreis = Kosten / (1 - gewünschte_Marge)

Kosten €200, Ziel 40% Marge:
€200 / 0.60 = €333,33 → Kundenpreis

Kosten €200, Ziel 50% Marge:
€200 / 0.50 = €400,00 → Kundenpreis
```

---

## ⚖️ Rechtsgültige Klauseln für Angebote

### Standardklauseln (immer in Angebote aufnehmen)

#### 1. Angebotsgültigkeit
```
Dieses Angebot ist gültig bis zum [Datum, z.B. 30 Tage nach Angebotsdatum].
Nach Ablauf dieser Frist behalten wir uns Preisanpassungen vor.
```

#### 2. Zahlungsbedingungen
```
Einmalzahlung (Setup):
• 50% Anzahlung bei Auftragserteilung
• 50% nach Abnahme / Go-Live

Monatliche Kosten:
• Zahlung im Voraus, jeweils zum 1. eines Monats
• Per SEPA-Lastschrift oder Überweisung
• Zahlungsziel: 14 Tage
```

#### 3. Leistungsumfang & Änderungswünsche
```
Der Leistungsumfang ergibt sich ausschließlich aus diesem Angebot und der
beigefügten Leistungsbeschreibung.

Änderungswünsche, die über den vereinbarten Leistungsumfang hinausgehen,
werden gesondert berechnet. Hierfür gilt unser aktueller Stundensatz von
€[Stundensatz]/Stunde zzgl. MwSt. Änderungen werden vorab schriftlich
kommuniziert und bedürfen Ihrer Freigabe.
```

#### 4. Vertragslaufzeit & Kündigung
```
Option A (Mindestlaufzeit):
Der Vertrag hat eine Mindestlaufzeit von [3/6/12] Monaten.
Danach verlängert er sich automatisch um einen weiteren Monat,
sofern er nicht mit einer Frist von [30 Tagen] zum Monatsende
schriftlich gekündigt wird.

Option B (Monatlich kündbar):
Der Vertrag ist monatlich kündbar mit einer Frist von 30 Tagen zum Monatsende.
```

#### 5. Mitwirkungspflichten des Kunden
```
Der Auftraggeber stellt uns alle für die Durchführung erforderlichen
Informationen und Zugänge zeitnah zur Verfügung (z.B. CRM-Zugänge,
Produktdaten, Texte). Verzögerungen durch fehlende Mitwirkung des
Auftraggebers können zu Terminverschiebungen führen und berechtigen uns
zur Anpassung vereinbarter Fristen.
```

#### 6. Haftungsbeschränkung
```
Unsere Haftung ist auf Vorsatz und grobe Fahrlässigkeit beschränkt.
Für Unterbrechungen des Dienstes aufgrund von Ausfällen unserer
Drittanbieter (ElevenLabs, Twilio, OpenAI, etc.) übernehmen wir
keine Haftung. Wir bemühen uns um eine Verfügbarkeit von 99% im Monatsdurchschnitt.
```

#### 7. Drittanbieter-Kosten Preisanpassung
```
Die monatlichen Kosten für KI-Dienste (Sprachverarbeitung, Telefonie, etc.)
basieren auf den aktuellen Tarifen unserer Drittanbieter (Stand: [Datum]).
Bei Preisänderungen der Drittanbieter um mehr als 10% sind wir berechtigt,
die monatlichen Servicegebühren entsprechend anzupassen. Wir informieren Sie
hierüber 4 Wochen im Voraus.
```

#### 8. Datenschutz
```
Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer
Datenschutzerklärung und im Einklang mit der DSGVO.
Für die Verarbeitung von Kundendaten im Auftrag wird ein separater
Auftragsverarbeitungsvertrag (AVV) abgeschlossen.
```

#### 9. Gerichtsstand
```
Erfüllungsort und Gerichtsstand für Streitigkeiten ist [Ihr Firmensitz],
sofern der Auftraggeber Kaufmann, juristische Person des öffentlichen Rechts
oder öffentlich-rechtliches Sondervermögen ist.
Es gilt deutsches Recht.
```

---

## 📄 Sevdesk — Angebot erstellen

### Schritt-für-Schritt (für Leon)

1. **Sevdesk öffnen** → Verkauf → Angebote → Neues Angebot
2. **Kunde auswählen** (oder neu anlegen)
3. **Angebotsdatum** + **Gültig bis** (z.B. +30 Tage) eintragen
4. **Positionen eingeben** (aus Pricing Kalkulator übernehmen):

### Positionsstruktur im Angebot

```
EINMALKOSTEN (Einrichtung & Setup)
──────────────────────────────────
Pos. 1: Konzeption & Dialog-Design            Netto: €X.XX
Pos. 2: Technische Entwicklung & Konfiguration Netto: €X.XX
Pos. 3: Integration [Systemname]              Netto: €X.XX
Pos. 4: Testing & Qualitätssicherung          Netto: €X.XX
Pos. 5: Einweisung & Übergabe                 Netto: €X.XX
[Pos. 6: Anfahrt [Stadt]                      Netto: €X.XX]
─────────────────────────────────────────────────────────
Summe Einmalkosten (Netto):                         €X.XX
zzgl. 19% MwSt.:                                    €X.XX
Summe Einmalkosten (Brutto):                        €X.XX

MONATLICHE SERVICEGEBÜHR (ab Monat 1)
──────────────────────────────────────
Pos. 7: KI-Sprachassistent — Basispaket       Netto: €X.XX/Monat
         ↳ inkl. bis zu [X] Minuten/Monat
Pos. 8: Mehrminuten über Inklusivpaket        Netto: €X.XX/Minute
Pos. 9: Wartung & Support (Std. X Stunden)   Netto: €X.XX/Monat
─────────────────────────────────────────────────────────
Summe monatlich (Netto):                            €X.XX
zzgl. 19% MwSt.:                                    €X.XX
Summe monatlich (Brutto):                           €X.XX
```

### Wichtige Sevdesk-Einstellungen
- **Steuer:** 19% MwSt. auf alle Positionen
- **Währung:** EUR
- **Sprache:** Deutsch
- **Angebot → Auftrag:** In Sevdesk nach Unterschrift umwandeln
- **Wiederholende Rechnung:** Für monatliche Kosten Abo-Rechnung anlegen

---

## 🧮 Beispiel-Kalkulation: Telefonbot Restaurant

### Kundendaten (Beispiel)
- Branche: Restaurant/Gastronomie
- Erwartete Anrufe: ~500/Monat à 2 Minuten = 1.000 Min/Monat
- Stack: ElevenLabs All-in-One + Twilio
- Komplexität: Mittel (Reservierung + FAQ + Weiterleitung)
- Setup: 20h Entwicklung

### Kalkulation Einmalkosten

| Position | Stunden | Unser Stundensatz | Unsere Kosten | Kundenpreis (50% Marge) |
|----------|---------|------------------|---------------|------------------------|
| Konzeption | 3h | €[Satz] | €[Betrag] | €[Betrag] |
| Entwicklung | 12h | €[Satz] | €[Betrag] | €[Betrag] |
| Testing | 3h | €[Satz] | €[Betrag] | €[Betrag] |
| Einweisung | 2h | €[Satz] | €[Betrag] | €[Betrag] |
| **Gesamt Setup** | **20h** | | **€[Betrag]** | **€[Betrag]** |

### Kalkulation Monatliche Kosten

| Position | Unsere Kosten (USD) | Unsere Kosten (EUR) | Marge 40% | Kundenpreis EUR |
|----------|--------------------|--------------------|-----------|----------------|
| ElevenLabs Pro Plan | $99.00 | ~€91 | | |
| ElevenLabs ConvAI 1.000 Min | $100.00 | ~€92 | | |
| Twilio Inbound 1.000 Min | $8.50 | ~€7.82 | | |
| Twilio Nummer DE | $1.15 | ~€1.06 | | |
| n8n / Infrastruktur | €0 | €0 | | |
| Wartung & Support | intern | €[Betrag] | | |
| **Gesamt monatlich** | **~$208.65** | **~€192** | **40%** | **~€320/Monat** |

### Angebotspreis an Kunden
- **Setup-Gebühr:** €[Betrag] Netto (zzgl. 19% MwSt)
- **Monatliche Gebühr:** €[Betrag] Netto/Monat (zzgl. 19% MwSt)
- **Inklusivminuten:** 1.000 Min/Monat
- **Mehrminuten:** €[Betrag]/Minute Netto

---

## 🚧 Was im Pricing Kalkulator noch fehlt (TODO)

### Priorität 1 — Dringend
- [ ] **Brutto/Netto Toggle** — 19% MwSt automatisch draufschlagen
- [ ] **Einmalkosten-Modul** — Setup-Stunden × Stundensatz
- [ ] **Anfahrtsberechnung** — Stadt eingeben → km → Kosten
- [ ] **USD→EUR Kurs aktualisierbar** (manuell im UI)

### Priorität 2 — Wichtig
- [ ] **Jährliche Preise** — Jahresrabatte der Tools einrechnen
- [ ] **Inklusivminuten-Paket** — Pauschalpreis für X Minuten
- [ ] **Mehrminuten-Preis** — Was berechnen wir pro Extra-Minute?
- [ ] **Angebot als Text/PDF** — Copy-Paste für Sevdesk

### Priorität 3 — Nice to have
- [ ] **Kunde speichern** — Kalkulation direkt einem Kunden zuordnen
- [ ] **Versionshistorie** — Alte Angebote vergleichen
- [ ] **Sevdesk API** — Direkt Angebot erstellen (Zukunft)

---

## 📅 Stand & nächste Schritte

**Aktuell vorhanden:**
- ✅ Pricing Kalkulator (Basis) im Admin
- ✅ Tool-Preise dokumentiert
- ✅ Marge-Slider im Kalkulator
- ✅ Keys-Vorlage (NICHTHOCHLADEN/KEYS_PRIVAT.md)

**Noch umzusetzen:**
- [ ] Pricing Kalkulator: Brutto/Netto ergänzen
- [ ] Pricing Kalkulator: Einmalkosten-Modul
- [ ] Pricing Kalkulator: Anfahrtsberechnung
- [ ] Pricing Kalkulator: Sevdesk-Export Format
- [ ] Keys-Datei mit echten Keys befüllen (manuell durch Marco)
- [ ] Donna Restaurant Leipzig — Angebot erstellen (nach Dateneingabe)

---

*Zuletzt aktualisiert: März 2026*
