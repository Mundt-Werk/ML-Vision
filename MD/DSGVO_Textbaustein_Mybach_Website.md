# Datenschutzerklärung — Textbaustein: KI-Telefonassistent
## Für die Website von Mybach & Co Immobilien GmbH

> **Anweisung:** Diesen Abschnitt in die bestehende Datenschutzerklärung auf der Website von Mybach einfügen.
> Empfohlene Position: nach dem Abschnitt zu Kontaktaufnahme / vor Cookies.

---

## Textbaustein (fertig formuliert, zum Einfügen)

---

### Einsatz eines KI-Telefonassistenten

Wir nutzen auf unserer Telefonleitung einen KI-gestützten Telefonassistenten, der eingehende Anrufe automatisch entgegennimmt und bearbeitet.

**Verantwortlicher:** Mybach & Co Immobilien GmbH, Kreuzauer Straße 70, 52355 Düren, info@myco-immobilien.de

**Was der Assistent tut:**
Der KI-Telefonassistent beantwortet allgemeine Fragen zu unserem Unternehmen und nimmt Terminanfragen auf. Sie werden zu Beginn des Gesprächs darauf hingewiesen, dass Sie mit einem KI-System sprechen. Bei komplexen Anliegen kann ein Rückruf durch unser Team veranlasst werden.

**Welche Daten verarbeitet werden:**
Im Rahmen eines Anrufs können folgende personenbezogene Daten verarbeitet werden:
- Name (sofern genannt)
- Telefonnummer
- E-Mail-Adresse (sofern genannt)
- Inhalt Ihres Anliegens (Terminwunsch, Fragen)
- Datum und Uhrzeit des Anrufs

**Rechtsgrundlage:**
Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung / Durchführung vorvertraglicher Maßnahmen) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Erreichbarkeit und effizienten Bearbeitung von Kundenanfragen).

**Auftragsverarbeiter und Unterauftragsverarbeiter:**
Wir setzen für den Betrieb des KI-Assistenten folgende Dienstleister ein, mit denen Auftragsverarbeitungsverträge gemäß Art. 28 DSGVO geschlossen wurden:

- **Schauerte & Mundt GbR (ML Vision)**, In der Lohe 14, 52399 Merzenich (Auftragsverarbeiter, Deutschland) — Betrieb und Konfiguration des Telefonassistenten
- **ElevenLabs, Inc.** (USA) — Sprachverarbeitung und KI-Technologie; Übermittlung auf Grundlage von EU-Standardvertragsklauseln (Art. 46 DSGVO)
- **Twilio Inc.** (USA) — Telefonie-Infrastruktur; Übermittlung auf Grundlage von EU-Standardvertragsklauseln (Art. 46 DSGVO)

**Audioaufnahmen:**
Es werden **keine dauerhaften Audioaufnahmen** Ihrer Anrufe gespeichert. Gesprächsinhalte (Transskripte) werden ausschließlich zur Bearbeitung Ihres Anliegens genutzt und spätestens nach [30 Tagen / Ablauf des Anliegens] gelöscht.

**Speicherdauer:**
Die im Gespräch aufgenommenen Daten werden nur so lange gespeichert, wie es zur Bearbeitung Ihres Anliegens erforderlich ist, längstens jedoch [30 Tage / 3 Monate — je nach eingestellter Retention].

**Ihre Rechte:**
Sie haben das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO). Wenden Sie sich dazu an: info@myco-immobilien.de.

Sie haben außerdem das Recht, sich bei der zuständigen Datenschutzaufsichtsbehörde zu beschweren.

---

## Hinweise zur Anpassung

| Platzhalter | Status |
|-------------|--------|
| Adresse Mybach | ✅ Kreuzauer Straße 70, 52355 Düren |
| E-Mail Mybach | ✅ info@myco-immobilien.de |
| `[30 Tage / 3 Monate]` | ⏳ Nach ElevenLabs Retention-Einstellung anpassen |

## Wichtig vor Veröffentlichung

- [ ] Speicherdauer in ElevenLabs tatsächlich prüfen und angleichen
- [ ] Prüfen ob Audio-Recording in ElevenLabs wirklich **deaktiviert** ist — wenn ja: Formulierung passt. Wenn nein: Einwilligung (Art. 6 Abs. 1 lit. a) als Rechtsgrundlage erforderlich + expliziter Hinweis am Anfang des Anrufs
- [ ] Twilio Log Retention auf 90 Tage reduzieren (Console → Monitor → Logs)
- [ ] Ggf. Anwalt gegenlesen lassen (empfohlen, kein Pflichtschritt für Start)

---

*Erstellt: 03. April 2026 | Für: Mybach & Co Immobilien GmbH | Projekt: KI-Telefonassistent*
