# ML Vision Webdesign — Claude Projekt-Kontext

## Verzeichnisse die Claude NICHT lesen soll

- `_archiv/` — Alte Backups (Dez 2024), private Keys-Backup. Nicht in git. NICHT scannen.
- `leads_bot/node_modules/` — NPM-Abhängigkeiten, nie relevant.

## Aktive Codebereiche

- **Web-App**: `admin/`, `customer/`, `public/`, `assets/`, `config/`, `functions/`
- **Interne Docs**: `MD/intern/`, `docs/`
- **Kundendocs**: `MD/kunden/[kunde]/`
- **Kunden-Daten**: `kunden/[kunde]/`
- **Automatisierung**: `leads_bot/`, `n8n/`, `scripts/`

## Kunden-Ordner Konvention

Jeder Kunde bekommt:
- `MD/kunden/[kunde]/` — Docs, Verträge, Planungsunterlagen (gitignored, privat)
- `kunden/[kunde]/` — Dateiablage: PDFs, Rechnungen (gitignored, privat)
- `assets/img/[kunde]/` — Kunden-Assets im Web-App (z.B. bereits vorhanden: `assets/img/mybach/`)

### Aktive Kunden
- **mybach** — Mybach & Co. Immobilien
- **donna** — DONNA Ristorante Leipzig
