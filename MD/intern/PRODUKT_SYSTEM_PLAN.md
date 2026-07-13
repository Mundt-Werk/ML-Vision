# Produkt-System & KVA-Redesign — Vollständiger Plan
> **Stand:** April 2026  
> **Autor:** Marco + Claude  
> **Ziel:** Sauberes, produktbasiertes Angebots-System mit automatischer EK-Kalkulation

---

## 1. Begriffe klären (aktuell vs. künftig)

| Begriff | Bedeutung | Seite |
|---------|-----------|-------|
| **KVA** | Kostenvoranschlag — Leon erstellt 3 Optionen, Kunde wählt eine | `kva-form.html` + `kva-detail.html` |
| **Angebot** | Nach Kundenentscheidung — nur noch 1 Option, wird zur Grundlage des Vertrags | `dokument-hub.html` (Tab "Vertrag") |
| **Vertrag** | Finales Dokument — generiert aus der gewählten KVA-Option | `dokument-hub.html` |

**Wichtig:** KVA ≠ Angebot ≠ Vertrag — das ist absichtlich getrennt und bleibt so.  
Der Dokument-Hub zeigt aktuell: Vertrag / Anzahlung / AVV / Go-Live-Checkliste.  
Der **KVA selbst** soll künftig auch dort als Tab sichtbar sein (zurzeit fehlt er).

---

## 2. Was heute fehlt / falsch läuft

1. **KVA-Detailformular** zu komplex — Sections B–F mit Telefonie-Details, Bot-Aufgaben, etc. sind für die Preiskalkulation irrelevant und verwirren Leon
2. **Keine Produkt-Logik** — EK wird manuell eingetragen, kein Bezug zu konkreten Tools/APIs
3. **Abschnitt C fehlt** im geladenen KVA — weil `volumen`-Modul nicht standardmäßig aktiv ist
4. **Optionswahl** passiert im falschen Schritt (im KVA statt beim Angebot finalisieren)
5. **Keine Übersicht** was ML Vision alles anbietet / welche Tools genutzt werden

---

## 3. Die neue Architektur

```
┌─────────────────────────────────────────────────────────────┐
│  EBENE 1: Tool-Datenbank  (config/ml-tools.js)              │
│  Alle Tools mit Preis/Einheit, Kategorie, Notizen            │
│  z.B. Twilio: 0.047 €/Min · ElevenLabs: 0.11 €/Min          │
└───────────────────────────┬─────────────────────────────────┘
                            │ referenziert
┌───────────────────────────▼─────────────────────────────────┐
│  EBENE 2: Produkt-Templates  (config/ml-products.js)         │
│  Welcher Dienst braucht welche Tools in welcher Option?      │
│  z.B. Telefonassistent → Option 1/2/3 = je andere Tools     │
└───────────────────────────┬─────────────────────────────────┘
                            │ wird verwendet von
┌───────────────────────────▼─────────────────────────────────┐
│  EBENE 3: KVA-Detailformular  (kva-detail.html)              │
│  1. Produkt wählen + Volumen eingeben                        │
│  2. EK wird automatisch berechnet (aus Tool-DB × Volumen)   │
│  3. Leon tippt VK → Marge erscheint live                    │
│  4. Alle 3 Optionen bleiben offen                           │
│  ⚠️ Kein Auswählen hier — das kommt erst beim Angebot       │
└───────────────────────────┬─────────────────────────────────┘
                            │ nach Kundengespräch
┌───────────────────────────▼─────────────────────────────────┐
│  EBENE 4: Angebot finalisieren  (dokument-hub.html)          │
│  Leon wählt EINE der 3 Optionen                             │
│  → Vertrag / Anzahlung / AVV werden generiert               │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Wichtigste Erkenntnis: Das Fundament existiert bereits!

**`assets/js/pricing-calculator.js`** hat bereits alles was wir brauchen:

```
TOOLS = {
  elevenlabs, cartesia, twilio, vapi, deepgram, openai,
  brevo, whatsapp, hubspot, pipedrive
}  ← Tool-Datenbank mit echten Preisen

BUNDLES = {
  telefonbot, voice_widget, outbound, chatbot,
  lead_capture, whatsapp_bot, sms_kampagne,
  termin_reservierung, crm_automation, rechnungen
}  ← Produkt-Templates mit Stack-Logik (= 3 Optionen pro Produkt!)
```

**Was das bedeutet:**
- Kein `config/ml-tools.js` neu anlegen — stattdessen `pricing-calculator.js` zur **shared config** umbauen
- Die `stacks` in jedem Bundle = die 3 KVA-Optionen (z.B. `elevenlabs_allinone`, `vapi`, `vapi_cartesia`)
- `calculate(inputs, stack)` = EK-Kalkulation — **direkt wiederverwendbar im KVA**
- Preise werden per WebFetch aktuell gehalten (das war schon so geplant)

**Umbau-Strategie:**
```
pricing-calculator.js  →  aufteilen in:
  config/ml-products.js    (TOOLS + BUNDLES — shared, von beiden genutzt)
  assets/js/pricing-calculator.js  (nur noch UI-Code, importiert ml-products.js)
  admin/angebote/kva-detail.html   (importiert ebenfalls ml-products.js)
```

---

## 4. Tool-Datenbank (`config/ml-tools.js`)

### Struktur einer Tool-Einheit
```javascript
{
  id: 'twilio_byoc',
  name: 'Twilio (BYOC)',
  category: 'telephony',        // telephony | voice_ai | llm | stt | tts | automation | infra
  billing: 'per_min',           // per_min | per_call | per_token | fixed_monthly | per_message
  price: 0.047,                 // in USD
  currency: 'USD',
  notes: 'Bring Your Own Carrier — günstigste Option für hohe Volumen'
}
```

### Tool-Liste (Platzhalter — Preise von Leon zu bestätigen!)

#### Telefonie
| ID | Name | Preis | Einheit |
|----|------|-------|---------|
| `twilio_byoc` | Twilio (BYOC) | ~$0.047 | /Min |
| `twilio_direct` | Twilio (Direct) | ~$0.09 | /Min |
| `vapi` | VAPI Platform | ~$0.05 | /Min |

#### Voice AI / Sprache
| ID | Name | Preis | Einheit |
|----|------|-------|---------|
| `elevenlabs_convai` | ElevenLabs ConvAI | ~$0.11 | /Min |
| `cartesia_tts` | Cartesia (TTS) | ~$0.045 | /Min |
| `deepgram_stt` | Deepgram (STT) | ~$0.005 | /Min |

#### LLM / KI
| ID | Name | Preis | Einheit |
|----|------|-------|---------|
| `openai_gpt4o_mini` | GPT-4o mini | ~$0.15 | /1M Input-Token |
| `openai_gpt4o` | GPT-4o | ~$2.50 | /1M Input-Token |
| `claude_haiku` | Claude Haiku | ~$0.25 | /1M Input-Token |
| `claude_sonnet` | Claude Sonnet | ~$3.00 | /1M Input-Token |

#### Automatisierung
| ID | Name | Preis | Einheit |
|----|------|-------|---------|
| `n8n_selfhosted` | n8n (Self-Hosted, ML-Server) | ~€5 | /Mo anteilig |
| `make_pro` | Make.com Pro | ~$16 | /Mo anteilig |
| `zapier` | Zapier | variabel | /Task |

#### Infrastruktur / Sonstiges
| ID | Name | Preis | Einheit |
|----|------|-------|---------|
| `brevo` | Brevo (E-Mail/SMS) | ~€25 | /Mo anteilig |
| `firebase` | Firebase/Firestore | ~€5 | /Mo anteilig |
| `hetzner_vps` | Hetzner VPS | ~€5 | /Mo anteilig |

> **TODO:** Leon trägt die tatsächlichen Vertragspreise ein, sobald die Config-Datei steht.

---

## 5. Produkt-Katalog (`config/ml-products.js`)

### Produkt: Telefonassistent

```
Option 1 — Basis
  Tools:     Twilio BYOC + OpenAI GPT-4o mini
  EK/Min:    ~0.047 + 0.003 ≈ 0.05 $/Min (× Kurs)
  Setup:     14h × 70 €/h = 980 €
  Stärken:   Günstig, zuverlässig, einfach
  Schwächen: Stimme weniger natürlich

Option 2 — Standard  
  Tools:     ElevenLabs ConvAI + Twilio
  EK/Min:    ~0.11 + 0.047 ≈ 0.16 $/Min (× Kurs)
  Setup:     19h × 70 €/h = 1.330 €
  Stärken:   Sehr natürliche Stimme, einfache Integration
  Schwächen: Teurer bei hohem Volumen

Option 3 — Premium
  Tools:     VAPI + Cartesia + Deepgram + GPT-4o mini + Twilio
  EK/Min:    ~0.05 + 0.045 + 0.005 + 0.003 + 0.047 ≈ 0.15 $/Min
  Setup:     26h × 70 €/h = 1.820 €
  Stärken:   Maximale Kontrolle, beste Performance, skalierbar
  Schwächen: Komplexeste Integration
```

### Weitere Produkte (noch auszuarbeiten)

| Produkt | Status | Notizen |
|---------|--------|---------|
| **E-Mail-Sortierung** | Konzept | n8n + LLM + E-Mail-Provider |
| **Chatbot (Website)** | Konzept | n8n + LLM + Widget |
| **Terminbuchung** | Konzept | n8n + Kalender-API |
| **Rechnungsverarbeitung** | Konzept | n8n + OCR + LLM |
| **WhatsApp-Automatisierung** | Konzept | Twilio/360Dialog + n8n |
| **CRM-Automatisierung** | Konzept | n8n + CRM-API |
| **Social Media Assistent** | Konzept | n8n + LLM + APIs |
| **Dokumentenanalyse** | Konzept | LLM + RAG |

> **TODO:** Für jeden aktiven Dienst: 3 Options mit konkreten Tool-Kombinationen definieren

---

## 6. Neuer KVA-Detailformular-Aufbau

### Was rausfliegt
- Section B (Telefonie-Details: Anbieter, Rufnummernmodell, Bot-Aufgaben, Sprachen)
- Section D (Systemintegration: CRM, API)
- Section D2 (Bot-Konfiguration)
- Section E (Standort) — wird Teil des Kundenkontos, nicht KVA
- Die komplizierte Sections-Toggle-Leiste

### Was bleibt / wird vereinfacht
- Sticky Action Bar (Speichern, PDF, Zum Angebot, Löschen)
- Kundenkopf (Name, Kontakt, Branche)
- Section F (Preiskalkulation) — komplett neu, produktbasiert

### Neues Formular (3 Blöcke)

```
┌─── BLOCK 1: Produkt & Volumen ─────────────────────────────┐
│  Produkt:   [Telefonassistent ▾]                           │
│  Volumen:   [___] Minuten/Monat  oder  [___] Anrufe/Tag    │
│  Gesprächsdauer: [___] Min  ×  Arbeitstage: [22]           │
└───────────────────────────────────────────────────────────┘

┌─── BLOCK 2: Preiskalkulation (3 Optionen) ─────────────────┐
│  [Basis]               [Standard]          [Premium]       │
│  Tools: Twilio+GPT     Tools: 11Labs+Twilio Tools: VAPI... │
│  EK/Min: 0.046 €       EK/Min: 0.147 €     EK/Min: 0.138€ │
│  EK Setup: 980 €       EK Setup: 1.330 €   EK Setup:1.820€│
│  EK/Mo:   ~€23         EK/Mo:   ~€52       EK/Mo:   ~€65  │
│  ─────────────────────────────────────────────────────── │
│  VK Setup: [1.490 €]   VK Setup: [2.020 €] VK Setup:[2.770│
│  VK/Mo:    [70 €]      VK/Mo:   [150 €]    VK/Mo:  [190 €]│
│  Marge Mo: ~67%        Marge Mo: ~65%      Marge Mo: ~66% │
└───────────────────────────────────────────────────────────┘

┌─── BLOCK 3: Angebotsdaten ─────────────────────────────────┐
│  Empfänger, Gültig bis, Interne Notizen                    │
└───────────────────────────────────────────────────────────┘
```

---

## 7. Angebot finalisieren (Dokument-Hub)

**Aktueller Stand:**  
Im Dokument-Hub fehlt der KVA-Tab. Leon sieht nur Vertrag/Anzahlung/AVV/Checkliste.

**Künftiger Stand:**

```
Tabs: [KVA] [Angebot] [Vertrag] [Anzahlung] [AVV] [Go-Live]
```

- **KVA-Tab:** Zeigt alle 3 Optionen, read-only. Button: „Option wählen"
- **Angebot-Tab:** Leon wählt eine Option → Angebots-PDF wird generiert
- **Vertrag-Tab:** Basiert auf gewählter Option (wie heute)

**Optionswahl-Flow:**
```
Dokument-Hub → KVA-Tab → Klick „Option 2 wählen"
→ Bestätigungs-Dialog: „Option 2 — Standard für 40 €/Mo?"
→ Status wechselt auf 'angebot'
→ Angebots-PDF wird generiert
→ Vertrag-Generierung freigeschaltet
```

---

## 8. Seiten-Übersicht (Ist vs. Soll)

| Seite | Heute | Nach Redesign |
|-------|-------|---------------|
| `kva-form.html` | 3-Schritt-Wizard (Kunde, Produkt, Bestätigen) | ✅ bleibt, Schritt 2 nutzt Produkt-DB |
| `kva-detail.html` | Komplexes Sections-Formular (B–F) | 🔄 Vereinfacht: nur Block 1–3 |
| `dokument-hub.html` | Vertrag/Anzahlung/AVV/Checkliste | 🔄 + KVA-Tab + Angebot-Tab |
| `config/ml-tools.js` | ❌ existiert nicht | ✅ neu anlegen |
| `config/ml-products.js` | ❌ existiert nicht | ✅ neu anlegen |

---

## 9. Firestore-Struktur (Ergänzungen)

### Collection `quotes` (KVA) — neue Felder
```javascript
{
  // NEU:
  productId: 'telefonassistent',     // Referenz auf Produkt-Template
  volumeMinutes: 120,                // Monatliches Volumen in Minuten
  
  // Preise (wie bisher, aber jetzt aus Tool-DB generiert):
  ek: { opt1: 23, opt2: 52, opt3: 65 },
  ekSetup: { opt1: 980, opt2: 1330, opt3: 1820 },
  vkMonthly: { opt1: 70, opt2: 150, opt3: 190 },
  vkSetup: { opt1: 1490, opt2: 2020, opt3: 2770 },
  
  // NEU:
  toolsUsed: {                       // Snapshot welche Tools zum Zeitpunkt der KVA
    opt1: ['twilio_byoc', 'openai_gpt4o_mini'],
    opt2: ['elevenlabs_convai', 'twilio_byoc'],
    opt3: ['vapi', 'cartesia_tts', 'deepgram_stt', 'openai_gpt4o_mini', 'twilio_byoc']
  }
}
```

---

## 10. Umsetzungsreihenfolge

### Phase 1 — Shared Config extrahieren
- [ ] `pricing-calculator.js` analysieren — welche Teile sind UI, welche sind Daten/Logik
- [ ] `config/ml-products.js` erstellen: `TOOLS` + `BUNDLES` aus pricing-calculator.js extrahieren
- [ ] Preise per WebFetch aktualisieren (ElevenLabs, Twilio, VAPI, Deepgram, OpenAI, Cartesia)
- [ ] `pricing-calculator.js` umbauen: importiert jetzt `ml-products.js` statt eigene Daten

### Phase 2 — KVA-Detail neu aufbauen
- [ ] `kva-detail.html`: Sections B–E entfernen (Telefonie-Details, Bot-Tasks, etc.)
- [ ] Block 1: Produkt-Dropdown (aus `BUNDLES`) + Volumen-Eingabe
- [ ] Block 2: EK auto-berechnet via `bundle.calculate(inputs, stack)` → 3 Karten
- [ ] Block 3: Angebotsdaten (Empfänger, Gültigkeit, Notizen)
- [ ] Kein Optionswählen hier

### Phase 3 — Dokument-Hub erweitern
- [ ] KVA-Tab: zeigt alle 3 Optionen (read-only), mit „Option wählen"-Button
- [ ] Optionswahl-Flow: Dialog → Status `angebot` → Vertrag freigeschaltet
- [ ] Edit-Button: zurück zu `kva-detail.html?loadDocId=XXX`

### Phase 4 — Qualität & Wartung
- [ ] Preise-Update-Mechanismus (automatisch per n8n Cron oder manuell mit Datum)
- [ ] Weitere Bundles ausbauen (aktuell noch: crm_automation, rechnungen haben nur 1 Stack)
- [ ] Admin-Seite für Preispflege (nice-to-have)

---

## 11. Offene Fragen für Leon

1. **Tool-Preise:** Bitte tatsächliche Vertragspreise für alle genutzten Tools eintragen (→ `ml-tools.js`)
2. **Produktliste:** Welche Dienste sind aktuell aktiv im Verkauf? (nicht nur geplant)
3. **Stundensatz:** 70 €/h für Setup — ist das der interne Kostensatz oder der Angebotssatz?
4. **Währung:** Tools werden in USD abgerechnet — fixer Kurs 0.92 weiterhin ok, oder dynamisch?
5. **KVA sichtbar?** Soll der ursprüngliche KVA im Dokument-Hub als Tab erscheinen?

---

## 12. Was der Dokument-Hub heute zeigt (zur Klarheit)

Der Dokument-Hub ist die **Post-KVA**-Ansicht. Er wird aufgerufen wenn:
- Ein KVA den Status `angebot` oder `vertrag` bekommt
- URL: `dokument-hub.html?docId=XXX&option=2`

**Er zeigt heute:**
- Option-Auswahl-Badge oben (Op. 2 · Standard · 349 Setup + 40 €/Mo)
- Tab: Vertrag (Dienstleistungsvertrag generieren/öffnen)
- Tab: Anzahlungsrechnung
- Tab: AVV
- Tab: Go-Live Checkliste

**Was fehlt:**
- Tab: KVA (zum Nachschauen der Ursprungsdaten)
- Der Weg zurück in die KVA-Bearbeitung (Edit-Button)

---

*Dieses Dokument ist die Planungsgrundlage für den nächsten Entwicklungs-Sprint.*  
*Vor dem Start: Phase 1 (Tool-DB + Produkt-DB) mit Leon abstimmen und Preise eintragen.*
