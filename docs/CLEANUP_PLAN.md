# 🧹 Projekt-Aufräum-Plan

**Erstellt:** 19.12.2024
**Savepoint:** `savepoint-before-cleanup` ✅
**Ziel:** Saubere, strukturierte Codebasis ohne Inline-Code

---

## Phase 1: Dokumentation strukturieren

### Aktion: MD-Dateien in `docs/` verschieben

**Zu verschiebende Dateien:**
- `AUDIT_ALLE_KUNDENMODULE.md` → `docs/audits/`
- `AUDIT_BEISPIEL_Gespraeche.md` → `docs/audits/`
- `AUDIT_MVP_Gespraeche.md` → `docs/audits/`
- `CLAUDE_MEMORY.md` → `docs/`
- `FIRESTORE_SCHEMA.md` → `docs/database/`
- `PLAN_KUNDENMODULE.md` → `docs/planning/`
- `QA_CHECKLIST.md` → `docs/`
- `REFACTORING_PLAN.md` → `docs/planning/`
- `TASK_0_NAVIGATION.md` → `docs/tasks/`

**Bleibt im Root:**
- `README.md` ✅
- Firebase-Konfiguration (firebase.json, firestore.rules, etc.)

**Savepoint nach Phase 1:** `savepoint-docs-organized`

---

## Phase 2: Inline CSS entfernen

### Betroffene Dateien (19 HTML-Dateien mit inline styles):
```
index.html
customer/dashboard.html
customer/pages/support.html
customer/pages/rechnungen.html
admin/pages/tickets.html
admin/pages/customers.html
admin/pages/users.html
admin/dashboard.html
admin/pages/settings.html
admin/pages/leads-bot.html
public/index.html
public/blog-ki-automatisierung-dueren.html
public/blog-voice-agents-nrw.html
public/blog-workflow-automatisierung.html
public/voice-agents-chatbots.html
public/ki-automatisierung-dueren.html
public/workflow-automatisierung.html
public/blog.html
admin/pages/workflows.html
```

**Aktion pro Datei:**
1. Inline `style=""` Attribute identifizieren
2. CSS-Klassen erstellen (in passenden CSS-Dateien)
3. Inline-Styles durch CSS-Klassen ersetzen

**Savepoint nach Phase 2:** `savepoint-no-inline-css`

---

## Phase 3: Inline JavaScript entfernen

### Betroffene Dateien (mit `<script>` Tags):
- Wird noch analysiert

**Aktion:**
1. Inline `<script>` Tags identifizieren
2. Code in separate .js Dateien auslagern
3. Script-Dateien ordentlich einbinden

**Savepoint nach Phase 3:** `savepoint-no-inline-js`

---

## Phase 4: Verzeichnisse aufräumen

### `NICHTHOCHLADEN/` Verzeichnis
**Inhalt:**
- `code/` - alte Code-Snippets
- `PHPMailer-master/` - PHPMailer Library
- `PHPMailer-master.zip` - ZIP-Archiv (unnötig)

**Aktion:**
- Prüfen ob `code/` noch benötigt wird → sonst in ARCHIV
- PHPMailer prüfen (wird aktuell verwendet?)
- `.zip` Datei löschen

### `ref/` Verzeichnis
**Inhalt:** 6 PNG-Dateien (Referenz-Screenshots?)

**Aktion:**
- Umbenennen zu `docs/references/` oder löschen falls veraltet

### Root-Verzeichnis aufräumen
**Aktuell im Root:**
- ✅ `.htaccess` (bleibt)
- ✅ `csrf-token.php` (bleibt)
- ✅ `send-mail.php` (bleibt)
- ✅ `index.html` (bleibt)
- ✅ `favicon.ico` (bleibt)
- ✅ `robots.txt` (bleibt)
- ✅ `sitemap.xml` (bleibt)
- ❌ Alle MD-Dateien → nach `docs/`

**Savepoint nach Phase 4:** `savepoint-directories-clean`

---

## Phase 5: Finale Struktur-Validierung

### Ziel-Struktur:
```
Webdesign/
├── .htaccess
├── csrf-token.php
├── send-mail.php
├── index.html
├── favicon.ico
├── robots.txt
├── sitemap.xml
├── README.md
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
│
├── docs/                    # Alle Dokumentation
│   ├── audits/
│   ├── database/
│   ├── planning/
│   ├── tasks/
│   └── references/
│
├── assets/                  # Statische Assets
│   ├── css/
│   ├── js/
│   └── img/
│
├── config/                  # PHP-Konfiguration
│   ├── config.php
│   ├── send-mail.php
│   └── PHPMailer/
│
├── admin/                   # Admin-Bereich
├── customer/                # Kunden-Bereich
├── public/                  # Öffentliche Seiten
├── scripts/                 # Utility-Scripts
├── functions/               # Firebase Functions
├── leads_bot/               # Leads Bot (separates Projekt)
└── ARCHIV_ALTE_DATEIEN/     # Archiv
```

**Validierungs-Checkliste:**
- [ ] Keine MD-Dateien im Root (außer README.md)
- [ ] Kein Inline CSS in HTML-Dateien
- [ ] Kein Inline JavaScript in HTML-Dateien
- [ ] Alle CSS-Dateien sauber strukturiert
- [ ] Alle JS-Dateien sauber strukturiert
- [ ] Keine unnötigen Duplikate
- [ ] .gitignore aktualisiert

**Finaler Savepoint:** `savepoint-cleanup-complete`

---

## Ausführungsreihenfolge

1. ✅ **Savepoint erstellen** → `savepoint-before-cleanup`
2. ⏳ **Phase 1** → Dokumentation organisieren
3. ⏳ **Phase 2** → Inline CSS entfernen
4. ⏳ **Phase 3** → Inline JavaScript entfernen
5. ⏳ **Phase 4** → Verzeichnisse aufräumen
6. ⏳ **Phase 5** → Validierung

**Wichtig:** Nach jeder Phase Git-Commit + Push!
