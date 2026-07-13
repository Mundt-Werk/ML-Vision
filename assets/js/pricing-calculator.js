/**
 * Pricing Calculator — ML Vision Admin (UI-Code)
 * ================================================
 * Voraussetzung: config/ml-products.js muss VOR diesem Script geladen sein.
 * TOOLS, BUNDLES, USD_TO_EUR, PRICES_LAST_UPDATED kommen von dort (window.*).
 *
 * Dieses File enthält ausschließlich UI-Logik:
 *   - Bundle-Tabs rendern
 *   - Inputs rendern + auslesen
 *   - EK-Kalkulation via BUNDLES[x].calculate()
 *   - Marge / Kundenpreis berechnen
 *   - Copy-Funktionen für Clipboard & Sevdesk
 */

// ============================
// UI STATE
// ============================

let currentBundle    = 'telefonbot';
let currentStack     = 'elevenlabs_allinone';
let currentMargin    = 40;
let currentInputs    = {};
let currentCostEUR   = 0;  // Monatliche Tool-Kosten (Netto, EUR)
let currentSetupEUR  = 0;  // Einmalkosten (Netto, EUR)
const MwSt           = 0.19;

// ============================
// INITIALISIERUNG
// ============================

function init() {
    checkPriceAge();
    setupExchangeRate();
    renderBundleTabs();
    selectBundle('telefonbot');
    setupMarginSlider();
}

function checkPriceAge() {
    const daysDiff = Math.floor((new Date() - PRICES_LAST_UPDATED) / (1000 * 60 * 60 * 24));
    const el = document.getElementById('priceWarning');
    if (daysDiff > 90 && el) {
        el.style.display = 'flex';
        const daysEl = document.getElementById('priceWarningDays');
        if (daysEl) daysEl.textContent = daysDiff;
    }
    const dateEl = document.getElementById('pricesLastUpdated');
    if (dateEl) dateEl.textContent = PRICES_LAST_UPDATED.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

function setupExchangeRate() {
    const input = document.getElementById('exchangeRate');
    if (!input) return;
    input.value = USD_TO_EUR;
    input.addEventListener('change', () => {
        const val = parseFloat(input.value);
        if (val > 0) { USD_TO_EUR = val; calculate(); }
    });
}

// ============================
// BUNDLE TABS
// ============================

function renderBundleTabs() {
    const container = document.getElementById('bundleTabs');
    if (!container) return;
    container.innerHTML = Object.values(BUNDLES).map(b => `
        <button class="bundle-tab" data-bundle="${b.id}" onclick="selectBundle('${b.id}')">
            <span class="bundle-tab-icon"><i data-lucide="${b.icon}"></i></span>
            <span class="bundle-tab-name">${b.name}</span>
        </button>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

function selectBundle(bundleId) {
    currentBundle = bundleId;
    const bundle  = BUNDLES[bundleId];
    document.querySelectorAll('.bundle-tab').forEach(tab =>
        tab.classList.toggle('active', tab.dataset.bundle === bundleId)
    );
    const descEl = document.getElementById('bundleDescription');
    if (descEl) descEl.textContent = bundle.description;
    currentInputs = {};
    bundle.inputs.forEach(inp => { currentInputs[inp.id] = inp.default; });
    currentStack = bundle.stacks[0];
    renderInputs(bundle);
    renderStackSelector(bundle);
    calculate();
}

// ============================
// INPUTS
// ============================

function renderInputs(bundle) {
    const container = document.getElementById('inputFields');
    if (!container) return;
    container.innerHTML = bundle.inputs.map(inp => {
        if (inp.type === 'number') {
            return `
                <div class="form-group">
                    <label for="input_${inp.id}">${inp.label}</label>
                    <div class="input-with-unit">
                        <input type="number" id="input_${inp.id}"
                            value="${inp.default}" min="${inp.min || 0}"
                            oninput="updateInput('${inp.id}', this.value)">
                        <span class="input-unit">${inp.unit}</span>
                    </div>
                </div>`;
        } else if (inp.type === 'range') {
            return `
                <div class="form-group">
                    <label for="input_${inp.id}">${inp.label}</label>
                    <div class="range-slider-container">
                        <input type="range" id="input_${inp.id}"
                            min="${inp.min}" max="${inp.max}" value="${inp.default}" step="5"
                            oninput="updateInput('${inp.id}', this.value); document.getElementById('rval_${inp.id}').textContent = this.value + '${inp.unit}'">
                        <span class="range-value" id="rval_${inp.id}">${inp.default}${inp.unit}</span>
                    </div>
                </div>`;
        } else if (inp.type === 'checkbox') {
            if (inp.default === true) {
                return `
                <div class="form-group">
                    <div class="checkbox-inkl-row">
                        <span class="inkl-tag">✓ Inklusive</span>
                        <span class="inkl-tag-label">${inp.label}</span>
                    </div>
                </div>`;
            }
            return `
                <div class="form-group">
                    <div class="checkbox-group">
                        <input type="checkbox" id="input_${inp.id}"
                            onchange="updateInput('${inp.id}', this.checked)">
                        <label for="input_${inp.id}">${inp.label}</label>
                    </div>
                </div>`;
        } else if (inp.type === 'select') {
            return `
                <div class="form-group">
                    <label for="input_${inp.id}">${inp.label}</label>
                    <select id="input_${inp.id}" onchange="updateInput('${inp.id}', this.value)">
                        ${inp.options.map(opt => `
                            <option value="${opt.value}" ${opt.value === inp.default ? 'selected' : ''}>${opt.label}</option>
                        `).join('')}
                    </select>
                </div>`;
        }
        return '';
    }).join('');
}

function updateInput(id, value) {
    currentInputs[id] = value;
    calculate();
}

// ============================
// STACK SELECTOR
// ============================

const STACK_NAMES = {
    elevenlabs_allinone: 'ElevenLabs All-in-One (empfohlen)',
    vapi:                'Vapi + ElevenLabs TTS (flexibel)',
    vapi_cartesia:       'Vapi + Cartesia TTS (ultra-niedrige Latenz)',
    openai_n8n:          'OpenAI + n8n',
    meta_n8n:            'Meta WhatsApp API + n8n',
    twilio_n8n:          'Twilio + n8n',
};

function renderStackSelector(bundle) {
    const container = document.getElementById('stackSelector');
    if (!container) return;
    if (bundle.stacks.length <= 1) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    container.innerHTML = `
        <div class="form-group">
            <label>Stack wählen</label>
            <div class="stack-options">
                ${bundle.stacks.map((s, i) => `
                    <label class="stack-option ${i === 0 ? 'active' : ''}">
                        <input type="radio" name="stack" value="${s}" ${i === 0 ? 'checked' : ''}
                            onchange="selectStack('${s}', this.closest('.stack-options'))">
                        ${STACK_NAMES[s] || s}
                    </label>
                `).join('')}
            </div>
        </div>`;
}

function selectStack(stack, container) {
    currentStack = stack;
    if (container) {
        container.querySelectorAll('.stack-option').forEach(opt =>
            opt.classList.toggle('active', opt.querySelector('input').value === stack)
        );
    }
    calculate();
}

// ============================
// KALKULATION
// ============================

function calculate() {
    const result = BUNDLES[currentBundle].calculate(currentInputs, currentStack);
    renderResults(result);
}

function renderResults(result) {
    const totalUSD = result.total;
    const totalEUR = totalUSD * USD_TO_EUR;
    currentCostEUR = totalEUR;

    const usdEl = document.getElementById('totalUSD');
    const eurEl = document.getElementById('totalEUR');
    if (usdEl) usdEl.textContent = fmtUSD(totalUSD);
    if (eurEl) eurEl.textContent = '~' + fmtEUR(totalEUR);

    const breakdown = document.getElementById('breakdown');
    if (breakdown) {
        breakdown.innerHTML = result.items.map(item => {
            if (item.is_section) {
                return `<div class="breakdown-section-header">${item.tool}</div>`;
            }
            return `
                <div class="breakdown-row">
                    <div class="breakdown-info">
                        <span class="breakdown-name">${item.tool}</span>
                        <span class="breakdown-detail">${item.detail}</span>
                    </div>
                    <div class="breakdown-cost">
                        ${item.cost === 0 || item.cost === null
                            ? '<span class="free-badge">kostenlos</span>'
                            : `<span>${fmtUSD(item.cost)}</span><span class="eur-note">${fmtEUR(item.cost * USD_TO_EUR)}</span>`}
                    </div>
                </div>`;
        }).join('');
    }

    const planEl = document.getElementById('planRecommendation');
    if (planEl) {
        if (result.plan_recommendation) {
            planEl.style.display = 'flex';
            const planText = planEl.querySelector('.plan-text');
            if (planText) planText.textContent = result.plan_recommendation;
        } else {
            planEl.style.display = 'none';
        }
    }
    updateCustomerPrice();
}

// ============================
// KUNDENPREIS / MARGE
// ============================

function setupMarginSlider() {
    const slider = document.getElementById('marginSlider');
    const valEl  = document.getElementById('marginValue');
    if (!slider) return;
    slider.value = currentMargin;
    if (valEl) valEl.textContent = currentMargin + '%';
    slider.addEventListener('input', () => {
        currentMargin = parseInt(slider.value);
        if (valEl) valEl.textContent = currentMargin + '%';
        updateCustomerPrice();
    });
}

function updateCustomerPrice() {
    const margin         = currentMargin < 100 ? currentMargin / 100 : 0.99;
    const customerNetto  = currentCostEUR / (1 - margin);
    const profit         = customerNetto - currentCostEUR;
    const mwstBetrag     = customerNetto * MwSt;
    const customerBrutto = customerNetto * (1 + MwSt);
    const setupBrutto    = currentSetupEUR * (1 + MwSt);

    const cpEl = document.getElementById('customerPrice');
    const prEl = document.getElementById('ourProfit');
    if (cpEl) cpEl.textContent = fmtEUR(customerNetto);
    if (prEl) prEl.textContent = fmtEUR(profit);

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('monthlyNetto',        fmtEUR(customerNetto));
    setEl('mwstBetrag',          fmtEUR(mwstBetrag));
    setEl('customerPriceBrutto', fmtEUR(customerBrutto));

    const setupRow     = document.getElementById('setupMwstRow');
    const setupBruttoR = document.getElementById('setupBruttoRow');
    const hasSetup     = currentSetupEUR > 0;
    if (setupRow)     setupRow.style.display     = hasSetup ? 'flex' : 'none';
    if (setupBruttoR) setupBruttoR.style.display = hasSetup ? 'flex' : 'none';
    setEl('setupNettoDisplay',  fmtEUR(currentSetupEUR));
    setEl('setupBruttoDisplay', fmtEUR(setupBrutto));
}

// ============================
// EINMALKOSTEN & ANFAHRT
// ============================

function updateSetup() {
    const hourlyRate   = parseFloat(document.getElementById('hourlyRate')?.value)   || 0;
    const hoursKonzept = parseFloat(document.getElementById('hoursKonzept')?.value) || 0;
    const hoursDev     = parseFloat(document.getElementById('hoursDev')?.value)     || 0;
    const hoursTesting = parseFloat(document.getElementById('hoursTesting')?.value) || 0;

    const stundenkostenNetto = (hoursKonzept + hoursDev + hoursTesting) * hourlyRate;

    let anfahrtNetto = 0;
    const anfahrtEnabled = document.getElementById('anfahrtEnabled')?.checked;
    if (anfahrtEnabled) {
        const km            = parseFloat(document.getElementById('anfahrtKm')?.value)       || 0;
        const kmSatz        = parseFloat(document.getElementById('kmSatz')?.value)          || 0.35;
        const fahrtzeit     = parseFloat(document.getElementById('fahrzeitStunden')?.value) || 0;
        const uebernachtung = document.getElementById('uebernachtung')?.checked;

        const kmKosten    = km * 2 * kmSatz;
        const fahrtKosten = fahrtzeit * 2 * hourlyRate;
        const hotelKosten = uebernachtung ? 120 : 0;
        anfahrtNetto      = kmKosten + fahrtKosten + hotelKosten;

        const anfahrtEl = document.getElementById('anfahrtResult');
        if (anfahrtEl) {
            anfahrtEl.innerHTML = `
                <div class="anfahrt-breakdown">
                    <div class="anfahrt-row"><span>km-Kosten (${km} × 2 × €${kmSatz})</span><span>${fmtEUR(kmKosten)}</span></div>
                    <div class="anfahrt-row"><span>Fahrtzeit (${fahrtzeit}h × 2 × €${hourlyRate}/h)</span><span>${fmtEUR(fahrtKosten)}</span></div>
                    ${uebernachtung ? `<div class="anfahrt-row"><span>Übernachtung (pauschal)</span><span>${fmtEUR(hotelKosten)}</span></div>` : ''}
                    <div class="anfahrt-row anfahrt-sum"><span>Anfahrt gesamt</span><span>${fmtEUR(anfahrtNetto)}</span></div>
                </div>`;
        }
    }

    currentSetupEUR = stundenkostenNetto + anfahrtNetto;

    const totalEl = document.getElementById('setupTotalNetto');
    if (totalEl) totalEl.textContent = fmtEUR(currentSetupEUR);

    updateCustomerPrice();
}

function toggleAnfahrt(enabled) {
    const sec = document.getElementById('anfahrtSection');
    if (sec) sec.style.display = enabled ? 'block' : 'none';
    updateSetup();
}

// ============================
// KOPIEREN
// ============================

function copyToClipboard() {
    const bundle    = BUNDLES[currentBundle];
    const stackName = STACK_NAMES[currentStack] || currentStack;
    const margin    = currentMargin < 100 ? currentMargin / 100 : 0.99;
    const nettoMonatlich  = currentCostEUR / (1 - margin);
    const bruttoMonatlich = nettoMonatlich * (1 + MwSt);
    const mwstBetrag      = nettoMonatlich * MwSt;
    const rows = Array.from(document.querySelectorAll('.breakdown-row')).map(row => {
        const name   = row.querySelector('.breakdown-name')?.textContent.trim()   || '';
        const detail = row.querySelector('.breakdown-detail')?.textContent.trim() || '';
        const cost   = row.querySelector('.breakdown-cost')?.textContent.trim().replace(/\s+/g, ' ') || '';
        return `  ${name.padEnd(30)} ${detail.padEnd(35)} ${cost}`;
    }).join('\n');

    const lines = [
        '╔══════════════════════════════════════════════╗',
        '║    PRICING-KALKULATION — ML Vision KI        ║',
        '╚══════════════════════════════════════════════╝',
        '',
        `Bundle:  ${bundle.name}`,
        `Stack:   ${stackName}`,
        `Datum:   ${new Date().toLocaleDateString('de-DE')}`,
        '',
        'MONATLICHE TOOL-KOSTEN (intern)',
        '─'.repeat(80),
        rows,
        '─'.repeat(80),
        `Unsere Kosten/Monat:  ${document.getElementById('totalUSD')?.textContent}  (~${document.getElementById('totalEUR')?.textContent})`,
    ];

    if (currentSetupEUR > 0) {
        lines.push('', `Einmalkosten (intern): ${fmtEUR(currentSetupEUR)}`);
    }

    lines.push(
        '',
        'KUNDENPREIS',
        '─'.repeat(80),
        `Marge:                ${currentMargin}%`,
        `Monatlich Netto:      ${fmtEUR(nettoMonatlich)}`,
        `zzgl. 19% MwSt.:      ${fmtEUR(mwstBetrag)}`,
        `Monatlich Brutto:     ${fmtEUR(bruttoMonatlich)}`,
    );

    if (currentSetupEUR > 0) {
        const setupBrutto = currentSetupEUR * (1 + MwSt);
        lines.push(`Einmalig Netto:       ${fmtEUR(currentSetupEUR)}`);
        lines.push(`Einmalig Brutto:      ${fmtEUR(setupBrutto)}`);
    }

    lines.push(
        `Unser Gewinn/Monat:   ${document.getElementById('ourProfit')?.textContent}`,
        '',
        `Preise verifiziert:   ${PRICES_LAST_UPDATED.toLocaleDateString('de-DE')}`,
        `Wechselkurs:          1 USD = €${USD_TO_EUR}`,
    );

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
        flashBtn('copyBtn', '<i data-lucide="check"></i> Kopiert!');
    });
}

function copyForSevdesk() {
    const bundle    = BUNDLES[currentBundle];
    const margin    = currentMargin < 100 ? currentMargin / 100 : 0.99;
    const nettoMonatlich  = currentCostEUR / (1 - margin);
    const bruttoMonatlich = nettoMonatlich * (1 + MwSt);
    const mwstMonatlich   = nettoMonatlich * MwSt;
    const datum      = new Date().toLocaleDateString('de-DE');
    const gueltigBis = new Date(Date.now() + 30 * 864e5).toLocaleDateString('de-DE');

    const lines = [
        '===== SEVDESK ANGEBOT — POSITIONEN =====',
        `Datum: ${datum}  |  Gültig bis: ${gueltigBis}`,
        `Leistung: ${bundle.name}`,
        '',
    ];

    if (currentSetupEUR > 0) {
        const setupBrutto = currentSetupEUR * (1 + MwSt);
        lines.push(
            '--- EINMALKOSTEN ---',
            `Einrichtung & Setup — ${bundle.name}`,
            `  Menge: 1  |  Einzelpreis (Netto): ${fmtEUR(currentSetupEUR)}  |  MwSt: 19%  |  Gesamt Brutto: ${fmtEUR(setupBrutto)}`,
            '  → In Sevdesk als EINMALIGE Position erfassen',
            '',
        );
    }

    lines.push(
        '--- MONATLICHE SERVICEGEBÜHR ---',
        `KI-Service — ${bundle.name}`,
        `  Menge: 1 Monat  |  Einzelpreis (Netto): ${fmtEUR(nettoMonatlich)}  |  MwSt: 19%  |  Gesamt Brutto: ${fmtEUR(bruttoMonatlich)}`,
        '  → In Sevdesk als WIEDERKEHRENDE Rechnung anlegen (monatlich)',
        '',
        '--- RECHNUNGSSUMME ---',
    );

    if (currentSetupEUR > 0) {
        lines.push(`Einmalig Netto:          ${fmtEUR(currentSetupEUR)}`);
    }

    lines.push(
        `Monatlich Netto:         ${fmtEUR(nettoMonatlich)}`,
        `zzgl. 19% MwSt.:         ${fmtEUR(mwstMonatlich)}`,
        `Monatlich Brutto:        ${fmtEUR(bruttoMonatlich)}`,
        '',
        '--- ZAHLUNGSBEDINGUNGEN ---',
        'Zahlungsziel: 14 Tage nach Rechnungsstellung',
        currentSetupEUR > 0 ? '50% Anzahlung bei Auftragserteilung / 50% nach Go-Live' : 'Monatliche Vorauszahlung jeweils zum 1.',
        '',
        '⚠️  Hinweis: Marge und interne Kosten NICHT in Sevdesk eingeben!',
    );

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
        flashBtn('sevdeskBtn', '<i data-lucide="check"></i> Kopiert!');
    });
}

function flashBtn(id, html) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const orig = btn.innerHTML;
    btn.innerHTML = html;
    btn.classList.add('copied');
    if (window.lucide) lucide.createIcons();
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); if (window.lucide) lucide.createIcons(); }, 2500);
}

// ============================
// FORMATIERUNG
// ============================

function fmtUSD(amount) {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtEUR(amount) {
    return '€' + amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============================
// START
// ============================

document.addEventListener('DOMContentLoaded', init);
