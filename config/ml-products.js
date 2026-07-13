/**
 * ML Vision — Shared Product & Pricing Database
 * ================================================
 * Dieses File wird von mehreren Seiten eingebunden (kein ES-Modul, plain JS).
 * Alle Werte werden auf window.* exposed, sodass sie global verfügbar sind.
 *
 * Eingebunden in:
 *   - admin/pages/pricing-calculator.html  → assets/js/pricing-calculator.js
 *   - admin/angebote/kva-detail.html        → direkt
 *
 * Letztes Preis-Update: 13. April 2026
 * Nächstes Review empfohlen: Juli 2026
 *
 * Verifikationsstatus (April 2026):
 *   ✅ Deepgram Nova-3: $0.0077/min  (bestätigt via Pricing-Page)
 *   ✅ Deepgram Nova-2: $0.0058/min  (Update! war $0.0043 in März 2026)
 *   ⚠️ Cartesia: Pricing-Modell gewechselt auf Credits (15 Credits/Sek Audio)
 *       Pläne: Free $0 / Pro $4 / Startup $39 / Scale $239 (alle jährlich)
 *       per_min_basis ist Schätzwert — Leon bitte verifizieren!
 *   ⚠️ ElevenLabs, VAPI, OpenAI: Seiten blocken automatische Abfragen.
 *       Preise aus März 2026 beibehalten bis manuell verifiziert.
 *   ⚠️ Twilio DE: Preise aus März 2026 — bitte quartalsweise prüfen.
 */

// ============================
// WECHSELKURS & DATUM
// ============================

const USD_TO_EUR          = 0.92;
const PRICES_LAST_UPDATED = new Date('2026-04-13');

// ============================
// TOOL-DATENBANK
// ============================
// Jedes Tool hat: name, category, billing-Typ, Preise
// Alle Geldwerte in USD, außer explizit als EUR markiert.

const TOOLS = {
    elevenlabs: {
        name: 'ElevenLabs',
        category: 'TTS / Voice Agent',
        // Pläne: Monatspreis in USD, character-Limits, ConvAI-Zugang
        // ⚠️ Bitte bei elevenlabs.io/pricing manuell verifizieren
        plans: [
            { name: 'Starter',  monthly: 5,    chars: 30000,    convAI: false },
            { name: 'Creator',  monthly: 22,   chars: 100000,   convAI: true  },
            { name: 'Pro',      monthly: 99,   chars: 500000,   convAI: true  },
            { name: 'Scale',    monthly: 330,  chars: 2000000,  convAI: true  },
            { name: 'Business', monthly: 1320, chars: 11000000, convAI: true  },
        ],
        // Conversational AI: per Minute (zusätzlich zum Plan-Grundpreis)
        convAI_per_min: 0.10,
        // TTS Overage: per Character (über Plan-Limit)
        tts_overage: {
            Creator:  0.00030,
            Pro:      0.00024,
            Scale:    0.00018,
            Business: 0.00012,
        }
    },

    cartesia: {
        name: 'Cartesia',
        category: 'TTS (ultra-low Latenz ~100ms)',
        // ⚠️ Cartesia hat auf Credit-Modell gewechselt (April 2026)
        //    15 Credits/Sekunde Audio = 900 Credits/Minute
        //    Pläne (jährliche Abrechnung): Free $0 / Pro $4 / Startup $39 / Scale $239
        //    per_min_basis = geschätzter Wert auf Basis alter Preise — Leon verifizieren!
        chars_per_min:   900,
        per_min_basis:   0.045,  // ⚠️ Schätzwert — verifizieren
        per_min_scale:   0.033,  // ⚠️ Schätzwert — verifizieren
        plans: [
            { name: 'Free',    monthly: 0,   chars: 100000,  overage_per_1k: null  },
            { name: 'Pro',     monthly: 4,   chars: null,    overage_per_1k: null  }, // credit-basiert
            { name: 'Startup', monthly: 39,  chars: null,    overage_per_1k: null  }, // credit-basiert
            { name: 'Scale',   monthly: 239, chars: null,    overage_per_1k: null  }, // credit-basiert
        ]
    },

    twilio: {
        name: 'Twilio',
        category: 'Telefonie / SMS',
        // ⚠️ Twilio DE-Preise — quartalsweise prüfen: twilio.com/de-de/voice/pricing
        inbound_de:                  0.0085,  // USD/Min, eingehend Deutschland
        outbound_de_landline:        0.015,   // USD/Min, ausgehend Festnetz DE
        outbound_de_mobile:          0.025,   // USD/Min, ausgehend Mobil DE
        number_de_local_monthly:     1.15,    // USD/Monat, lokale Festnetz-Nummer DE
        number_de_mobile_monthly:    15.00,   // USD/Monat, mobile DE-Nummer (+49 15x/16x/17x)
        sms_outbound_de:             0.075,   // USD/SMS, ausgehend DE
        sms_inbound_de:              0.0075,  // USD/SMS, eingehend DE
    },

    vapi: {
        name: 'Vapi.ai',
        category: 'Voice Orchestrierung',
        // ⚠️ Bitte bei vapi.ai/pricing manuell verifizieren
        per_min: 0.05
    },

    deepgram: {
        name: 'Deepgram',
        category: 'STT',
        // ✅ Bestätigt April 2026 (Pay-As-You-Go Preise)
        nova2_per_min: 0.0058,  // ← Update von $0.0043 auf $0.0058 (April 2026)
        nova3_per_min: 0.0077,  // ✅ unverändert
    },

    openai: {
        name: 'OpenAI',
        category: 'LLM / STT',
        // ⚠️ Bitte bei platform.openai.com/pricing manuell verifizieren
        gpt4o_input_per_1m:        2.50,
        gpt4o_output_per_1m:      10.00,
        gpt4o_mini_input_per_1m:   0.15,
        gpt4o_mini_output_per_1m:  0.60,
        // Durchschnittliche Token-Anzahl pro Nachricht (für EK-Schätzung)
        avg_tokens_per_message:    500,
    },

    brevo: {
        name: 'Brevo',
        category: 'E-Mail / SMS',
        plans: [
            { name: 'Free',     monthly: 0,  emails: 9000,  note: '300/Tag Limit' },
            { name: 'Starter',  monthly: 9,  emails: 50000, note: 'kein Tageslimit' },
            { name: 'Business', monthly: 18, emails: 50000, note: '+ Automation' },
        ]
    },

    whatsapp: {
        name: 'WhatsApp Business API (Meta)',
        category: 'Messaging',
        // ⚠️ Meta-Preise für DE-Region — regelmäßig prüfen!
        marketing_per_conv: 0.0975,  // USD/Konversation
        utility_per_conv:   0.0265,
        service_per_conv:   0.00,    // User-initiiert: seit 2024 kostenlos
        auth_per_conv:      0.0570,
    },

    hubspot: {
        name: 'HubSpot CRM',
        category: 'CRM',
        plans: [
            { name: 'Free',         monthly: 0   },
            { name: 'Starter',      monthly: 45  },
            { name: 'Professional', monthly: 450 },
        ]
    },

    pipedrive: {
        name: 'Pipedrive',
        category: 'CRM',
        plans: [
            { name: 'Essential',    monthly: 14 },
            { name: 'Advanced',     monthly: 29 },
            { name: 'Professional', monthly: 59 },
        ]
    }
};

// ============================
// PRODUKT-BUNDLES
// ============================
// Jedes Bundle = ein verkäufliches Produkt.
// stacks    = Array von Stack-IDs (= die 3 KVA-Optionen)
// inputs    = Volumen-Eingaben für EK-Kalkulation
// calculate = EK-Berechnung; gibt { items[], total (USD), plan_recommendation } zurück
//             total ist in USD — Umrechnung mit USD_TO_EUR im UI

const BUNDLES = {

    // ─────────────────────────────────────────────
    telefonbot: {
        id:          'telefonbot',
        name:        'Telefonbot (Inbound)',
        icon:        'phone-incoming',
        description: 'KI beantwortet eingehende Anrufe automatisch. Einsatz: Kundensupport, Anfragen, Lead-Qualifizierung.',
        inputs: [
            {
                id: 'minutes', label: 'Minuten / Monat',
                type: 'number', default: 500, min: 1, unit: 'Min'
            },
            {
                id: 'nummer_typ', label: 'Rufnummer-Typ',
                type: 'select', default: 'lokal',
                options: [
                    { value: 'lokal', label: 'Lokale Festnetz-Nummer ($1.15/mo)' },
                    { value: 'mobil', label: 'Mobile DE-Nummer ($15.00/mo)' },
                ]
            },
        ],
        // Stack-IDs = KVA-Optionen (Basis / Standard / Premium)
        stacks: ['elevenlabs_allinone', 'vapi', 'vapi_cartesia'],
        stackLabels: {
            elevenlabs_allinone: 'Basis — ElevenLabs All-in-One',
            vapi:                'Standard — VAPI + ElevenLabs TTS',
            vapi_cartesia:       'Premium — VAPI + Cartesia (ultra-low Latenz)',
        },
        calculate(inputs, stack) {
            const mins       = Math.max(0, parseFloat(inputs.minutes) || 0);
            const numberCost = inputs.nummer_typ === 'mobil'
                ? TOOLS.twilio.number_de_mobile_monthly
                : TOOLS.twilio.number_de_local_monthly;
            const result = { items: [], total: 0, plan_recommendation: null };

            if (stack === 'elevenlabs_allinone') {
                const convai = mins * TOOLS.elevenlabs.convAI_per_min;
                const plan   = TOOLS.elevenlabs.plans[1].monthly;  // Creator
                const calls  = mins * TOOLS.twilio.inbound_de;
                result.items.push({ tool: 'ElevenLabs ConvAI', detail: `${mins} Min × $0.10`,                                                              cost: convai      });
                result.items.push({ tool: 'ElevenLabs Plan',   detail: 'Creator (min. für ConvAI)',                                                        cost: plan,  is_plan: true });
                result.items.push({ tool: 'Twilio Inbound DE', detail: `${mins} Min × $${TOOLS.twilio.inbound_de}`,                                       cost: calls       });
                result.items.push({ tool: 'Twilio DE-Nummer',  detail: inputs.nummer_typ === 'mobil' ? 'Mobile-Nummer / Monat' : 'Lokale Nummer / Monat', cost: numberCost  });
                result.total = convai + plan + calls + numberCost;
                result.plan_recommendation = `ElevenLabs Creator ($${TOOLS.elevenlabs.plans[1].monthly}/mo)`;

            } else if (stack === 'vapi') {
                const vapi     = mins * TOOLS.vapi.per_min;
                const deepgram = mins * TOOLS.deepgram.nova3_per_min;
                const llm      = mins * 0.02;
                const tts      = mins * 0.05;
                const calls    = mins * TOOLS.twilio.inbound_de;
                result.items.push({ tool: 'Vapi.ai',            detail: `${mins} Min × $${TOOLS.vapi.per_min}`,           cost: vapi     });
                result.items.push({ tool: 'Deepgram Nova-3',    detail: `${mins} Min × $${TOOLS.deepgram.nova3_per_min}`, cost: deepgram });
                result.items.push({ tool: 'OpenAI GPT-4o-mini', detail: `${mins} Min × ~$0.02`,                           cost: llm      });
                result.items.push({ tool: 'ElevenLabs TTS',     detail: `${mins} Min × ~$0.05`,                           cost: tts      });
                result.items.push({ tool: 'Twilio Inbound DE',  detail: `${mins} Min × $${TOOLS.twilio.inbound_de}`,      cost: calls    });
                result.items.push({ tool: 'Twilio DE-Nummer',   detail: inputs.nummer_typ === 'mobil' ? 'Mobile-Nummer' : 'Lokale Nummer', cost: numberCost });
                result.total = vapi + deepgram + llm + tts + calls + numberCost;
                result.plan_recommendation = `ElevenLabs Creator ($${TOOLS.elevenlabs.plans[1].monthly}/mo) für TTS-Zugang`;

            } else if (stack === 'vapi_cartesia') {
                const vapi     = mins * TOOLS.vapi.per_min;
                const cartesia = mins * TOOLS.cartesia.per_min_basis;
                const deepgram = mins * TOOLS.deepgram.nova3_per_min;
                const llm      = mins * 0.02;
                const calls    = mins * TOOLS.twilio.inbound_de;
                result.items.push({ tool: 'Vapi.ai',            detail: `${mins} Min × $${TOOLS.vapi.per_min}`,                                       cost: vapi     });
                result.items.push({ tool: 'Cartesia TTS',       detail: `${mins} Min × ~$${TOOLS.cartesia.per_min_basis.toFixed(3)} ⚠️`,              cost: cartesia });
                result.items.push({ tool: 'Deepgram Nova-3',    detail: `${mins} Min × $${TOOLS.deepgram.nova3_per_min}`,                             cost: deepgram });
                result.items.push({ tool: 'OpenAI GPT-4o-mini', detail: `${mins} Min × ~$0.02`,                                                       cost: llm      });
                result.items.push({ tool: 'Twilio Inbound DE',  detail: `${mins} Min × $${TOOLS.twilio.inbound_de}`,                                  cost: calls    });
                result.items.push({ tool: 'Twilio DE-Nummer',   detail: inputs.nummer_typ === 'mobil' ? 'Mobile-Nummer' : 'Lokale Nummer',            cost: numberCost });
                result.total = vapi + cartesia + deepgram + llm + calls + numberCost;
                result.plan_recommendation = `Cartesia Pro ($${TOOLS.cartesia.plans[1].monthly}/mo) — Ultra-niedrige Latenz (~100ms) ⚠️ Preis verifizieren`;
            }
            return result;
        }
    },

    // ─────────────────────────────────────────────
    voice_widget: {
        id:          'voice_widget',
        name:        'Voice Widget (Website)',
        icon:        'mic',
        description: 'Sprach-KI direkt im Browser auf der Website. Kein Telefon. Einsatz: FAQ-Bot, Beratungs-Bot, Website-Assistent.',
        inputs: [
            { id: 'minutes', label: 'Minuten / Monat', type: 'number', default: 200, min: 1, unit: 'Min' }
        ],
        stacks: ['elevenlabs_allinone', 'vapi_cartesia'],
        stackLabels: {
            elevenlabs_allinone: 'Basis — ElevenLabs All-in-One',
            vapi_cartesia:       'Premium — VAPI + Cartesia',
        },
        calculate(inputs, stack) {
            const mins   = Math.max(0, parseFloat(inputs.minutes) || 0);
            const result = { items: [], total: 0, plan_recommendation: null };

            if (stack === 'elevenlabs_allinone') {
                const convai = mins * TOOLS.elevenlabs.convAI_per_min;
                const plan   = TOOLS.elevenlabs.plans[1].monthly;
                result.items.push({ tool: 'ElevenLabs ConvAI', detail: `${mins} Min × $0.10`,      cost: convai           });
                result.items.push({ tool: 'ElevenLabs Plan',   detail: 'Creator (min. für ConvAI)', cost: plan, is_plan: true });
                result.total = convai + plan;
                result.plan_recommendation = `ElevenLabs Creator ($${TOOLS.elevenlabs.plans[1].monthly}/mo)`;

            } else if (stack === 'vapi_cartesia') {
                const vapi     = mins * TOOLS.vapi.per_min;
                const cartesia = mins * TOOLS.cartesia.per_min_basis;
                const deepgram = mins * TOOLS.deepgram.nova3_per_min;
                const llm      = mins * 0.02;
                result.items.push({ tool: 'Vapi.ai',            detail: `${mins} Min × $${TOOLS.vapi.per_min}`,                              cost: vapi     });
                result.items.push({ tool: 'Cartesia TTS',       detail: `${mins} Min × ~$${TOOLS.cartesia.per_min_basis.toFixed(3)} ⚠️`,     cost: cartesia });
                result.items.push({ tool: 'Deepgram Nova-3',    detail: `${mins} Min × $${TOOLS.deepgram.nova3_per_min}`,                    cost: deepgram });
                result.items.push({ tool: 'OpenAI GPT-4o-mini', detail: `${mins} Min × ~$0.02`,                                              cost: llm      });
                result.total = vapi + cartesia + deepgram + llm;
                result.plan_recommendation = `Cartesia Pro ($${TOOLS.cartesia.plans[1].monthly}/mo) ⚠️ Preis verifizieren`;
            }
            return result;
        }
    },

    // ─────────────────────────────────────────────
    outbound: {
        id:          'outbound',
        name:        'Outbound Kampagne',
        icon:        'phone-outgoing',
        description: 'KI ruft Kontakte aktiv an. Einsatz: Terminerinnerungen, Lead-Nurturing, Umfragen, Follow-up-Anrufe.',
        inputs: [
            { id: 'minutes',        label: 'Minuten / Monat',  type: 'number', default: 500, min: 1,   unit: 'Min' },
            { id: 'mobile_percent', label: 'Mobilfunk-Anteil', type: 'range',  default: 50,  min: 0, max: 100, unit: '%' }
        ],
        stacks: ['elevenlabs_allinone', 'vapi_cartesia'],
        stackLabels: {
            elevenlabs_allinone: 'Basis — ElevenLabs All-in-One',
            vapi_cartesia:       'Premium — VAPI + Cartesia',
        },
        calculate(inputs, stack) {
            const mins        = Math.max(0, parseFloat(inputs.minutes) || 0);
            const mobilePct   = Math.max(0, Math.min(100, parseFloat(inputs.mobile_percent) || 50)) / 100;
            const landlinePct = 1 - mobilePct;
            const result      = { items: [], total: 0, plan_recommendation: null };
            const number      = TOOLS.twilio.number_de_local_monthly;
            const twilioLL    = mins * landlinePct * TOOLS.twilio.outbound_de_landline;
            const twilioM     = mins * mobilePct   * TOOLS.twilio.outbound_de_mobile;

            if (stack === 'elevenlabs_allinone') {
                const convai = mins * TOOLS.elevenlabs.convAI_per_min;
                const plan   = TOOLS.elevenlabs.plans[1].monthly;
                result.items.push({ tool: 'ElevenLabs ConvAI',        detail: `${mins} Min × $0.10`,                                                          cost: convai,       });
                result.items.push({ tool: 'ElevenLabs Plan',          detail: 'Creator (min.)',                                                               cost: plan, is_plan: true });
                result.items.push({ tool: 'Twilio Outbound Festnetz', detail: `${(mins*landlinePct).toFixed(0)} Min × $${TOOLS.twilio.outbound_de_landline}`, cost: twilioLL      });
                result.items.push({ tool: 'Twilio Outbound Mobil',    detail: `${(mins*mobilePct).toFixed(0)} Min × $${TOOLS.twilio.outbound_de_mobile}`,     cost: twilioM       });
                result.items.push({ tool: 'Twilio DE-Nummer',         detail: 'Fixkosten / Monat',                                                            cost: number        });
                result.total = convai + plan + twilioLL + twilioM + number;
                result.plan_recommendation = `ElevenLabs Creator ($${TOOLS.elevenlabs.plans[1].monthly}/mo)`;

            } else if (stack === 'vapi_cartesia') {
                const vapi     = mins * TOOLS.vapi.per_min;
                const cartesia = mins * TOOLS.cartesia.per_min_basis;
                const deepgram = mins * TOOLS.deepgram.nova3_per_min;
                const llm      = mins * 0.02;
                result.items.push({ tool: 'Vapi.ai',                  detail: `${mins} Min × $${TOOLS.vapi.per_min}`,                                        cost: vapi     });
                result.items.push({ tool: 'Cartesia TTS',             detail: `${mins} Min × ~$${TOOLS.cartesia.per_min_basis.toFixed(3)} ⚠️`,               cost: cartesia });
                result.items.push({ tool: 'Deepgram Nova-3',          detail: `${mins} Min × $${TOOLS.deepgram.nova3_per_min}`,                              cost: deepgram });
                result.items.push({ tool: 'OpenAI GPT-4o-mini',       detail: `${mins} Min × ~$0.02`,                                                        cost: llm      });
                result.items.push({ tool: 'Twilio Outbound Festnetz', detail: `${(mins*landlinePct).toFixed(0)} Min × $${TOOLS.twilio.outbound_de_landline}`, cost: twilioLL });
                result.items.push({ tool: 'Twilio Outbound Mobil',    detail: `${(mins*mobilePct).toFixed(0)} Min × $${TOOLS.twilio.outbound_de_mobile}`,     cost: twilioM  });
                result.items.push({ tool: 'Twilio DE-Nummer',         detail: 'Fixkosten / Monat',                                                            cost: number   });
                result.total = vapi + cartesia + deepgram + llm + twilioLL + twilioM + number;
                result.plan_recommendation = `Cartesia Pro ($${TOOLS.cartesia.plans[1].monthly}/mo) — Ultra-niedrige Latenz ⚠️`;
            }
            return result;
        }
    },

    // ─────────────────────────────────────────────
    chatbot: {
        id:          'chatbot',
        name:        'Chat Bot (Text)',
        icon:        'message-square',
        description: 'Text-Chat-Bot für Website-Chat oder Support. Kein Voice. Einsatz: FAQ, Kundenservice, Lead-Capture.',
        inputs: [
            { id: 'messages',      label: 'Nachrichten / Monat',      type: 'number',   default: 1000, min: 1, unit: 'Msgs'  },
            { id: 'include_brevo', label: 'E-Mail Follow-up (Brevo)', type: 'checkbox', default: false }
        ],
        stacks: ['openai_n8n'],
        stackLabels: {
            openai_n8n: 'Standard — OpenAI + n8n',
        },
        calculate(inputs, stack) {
            const msgs       = Math.max(0, parseFloat(inputs.messages) || 0);
            const inclBrevo  = inputs.include_brevo === true || inputs.include_brevo === 'true';
            const result     = { items: [], total: 0, plan_recommendation: null };
            const inputToks  = msgs * TOOLS.openai.avg_tokens_per_message * 0.6;
            const outputToks = msgs * TOOLS.openai.avg_tokens_per_message * 0.4;
            const llmCost    = (inputToks  / 1_000_000 * TOOLS.openai.gpt4o_mini_input_per_1m)
                             + (outputToks / 1_000_000 * TOOLS.openai.gpt4o_mini_output_per_1m);
            result.items.push({ tool: 'OpenAI GPT-4o-mini', detail: `${msgs} Nachrichten × ~500 Tokens`, cost: llmCost });
            result.items.push({ tool: 'n8n (unser Server)', detail: 'Workflow-Automatisierung',           cost: 0       });
            if (inclBrevo) {
                result.items.push({ tool: 'Brevo Free', detail: 'bis 9.000 E-Mails/Monat', cost: 0 });
            }
            result.total = llmCost;
            result.plan_recommendation = 'OpenAI API (pay-as-you-go)';
            return result;
        }
    },

    // ─────────────────────────────────────────────
    lead_capture: {
        id:          'lead_capture',
        name:        'Lead Capture System',
        icon:        'target',
        description: 'Formular → KI-Qualifizierung → E-Mail → CRM. Vollautomatischer Lead-Funnel.',
        inputs: [
            { id: 'leads',  label: 'Leads / Monat',   type: 'number', default: 100, min: 1, unit: 'Leads'   },
            { id: 'emails', label: 'E-Mails / Monat', type: 'number', default: 200, min: 0, unit: 'E-Mails' }
        ],
        stacks: ['openai_n8n'],
        stackLabels: {
            openai_n8n: 'Standard — OpenAI + n8n',
        },
        calculate(inputs, stack) {
            const leads  = Math.max(0, parseFloat(inputs.leads)  || 0);
            const emails = Math.max(0, parseFloat(inputs.emails) || 0);
            const result = { items: [], total: 0, plan_recommendation: null };
            const inputToks  = leads * 1000 * 0.7;
            const outputToks = leads * 1000 * 0.3;
            const llmCost    = (inputToks  / 1_000_000 * TOOLS.openai.gpt4o_mini_input_per_1m)
                             + (outputToks / 1_000_000 * TOOLS.openai.gpt4o_mini_output_per_1m);
            const brevoPlan  = emails <= 9000 ? TOOLS.brevo.plans[0] : TOOLS.brevo.plans[1];
            result.items.push({ tool: 'OpenAI GPT-4o-mini',       detail: `${leads} Leads × ~$0.01/Lead`, cost: llmCost           });
            result.items.push({ tool: 'n8n (unser Server)',        detail: 'Workflow-Automatisierung',     cost: 0                 });
            result.items.push({ tool: `Brevo (${brevoPlan.name})`, detail: `${emails} E-Mails/Monat`,     cost: brevoPlan.monthly });
            result.items.push({ tool: 'Firebase',                  detail: 'Datenbank (Free-Tier)',        cost: 0                 });
            result.total = llmCost + brevoPlan.monthly;
            result.plan_recommendation = emails <= 9000
                ? 'Brevo Free reicht aus'
                : `Brevo Starter ($${TOOLS.brevo.plans[1].monthly}/mo)`;
            return result;
        }
    },

    // ─────────────────────────────────────────────
    whatsapp_bot: {
        id:          'whatsapp_bot',
        name:        'WhatsApp-Bot',
        icon:        'smartphone',
        description: 'KI beantwortet Kundennachrichten via WhatsApp. Einsatz: Bestellungen, Support, Reservierungen, FAQ. ⚠️ WhatsApp-Preise verifizieren!',
        inputs: [
            {
                id: 'conversations', label: 'Konversationen / Monat',
                type: 'number', default: 300, min: 1, unit: 'Konvs'
            },
            {
                id: 'conv_type', label: 'Nachrichtentyp',
                type: 'select', default: 'utility',
                options: [
                    { value: 'service',   label: 'Service — Kundenanfragen (kostenlos seit 2024)' },
                    { value: 'utility',   label: 'Utility — Bestätigungen, Termine (~$0.03/Konv)' },
                    { value: 'marketing', label: 'Marketing — Kampagnen, Angebote (~$0.10/Konv)' },
                ]
            },
            { id: 'ai_responses', label: 'KI-Antworten (OpenAI)', type: 'checkbox', default: true }
        ],
        stacks: ['meta_n8n'],
        stackLabels: {
            meta_n8n: 'Standard — WhatsApp API + n8n',
        },
        calculate(inputs, stack) {
            const convs     = Math.max(0, parseFloat(inputs.conversations) || 0);
            const convType  = inputs.conv_type || 'utility';
            const aiEnabled = inputs.ai_responses === true || inputs.ai_responses === 'true';
            const result    = { items: [], total: 0, plan_recommendation: null };
            const rateMap   = {
                service:   TOOLS.whatsapp.service_per_conv,
                utility:   TOOLS.whatsapp.utility_per_conv,
                marketing: TOOLS.whatsapp.marketing_per_conv,
            };
            const typeLabel = { service: 'Service', utility: 'Utility', marketing: 'Marketing' };
            const rate      = rateMap[convType] || TOOLS.whatsapp.utility_per_conv;
            const waCost    = convs * rate;
            result.items.push({
                tool:   `WhatsApp API (${typeLabel[convType]})`,
                detail: `${convs} Konvs × $${rate.toFixed(4)}`,
                cost:   waCost
            });
            if (aiEnabled) {
                const msgs       = convs * 3;
                const inputToks  = msgs * TOOLS.openai.avg_tokens_per_message * 0.6;
                const outputToks = msgs * TOOLS.openai.avg_tokens_per_message * 0.4;
                const llmCost    = (inputToks  / 1_000_000 * TOOLS.openai.gpt4o_mini_input_per_1m)
                                 + (outputToks / 1_000_000 * TOOLS.openai.gpt4o_mini_output_per_1m);
                result.items.push({ tool: 'OpenAI GPT-4o-mini', detail: `${convs} Konvs × ~3 Msgs × ~500 Tokens`, cost: llmCost });
                result.total += llmCost;
            }
            result.items.push({ tool: 'n8n (unser Server)', detail: 'Workflow-Automatisierung', cost: 0 });
            result.total += waCost;
            result.plan_recommendation = convType === 'service'
                ? '⚡ Service-Konversationen sind seit 2024 kostenlos — ideal für Support!'
                : `WhatsApp API: $${rate.toFixed(4)}/Konversation (DE Region) — ⚠️ Vor Angebot verifizieren`;
            return result;
        }
    },

    // ─────────────────────────────────────────────
    sms_kampagne: {
        id:          'sms_kampagne',
        name:        'SMS-Kampagne',
        icon:        'mail',
        description: 'Personalisierter SMS-Outbound via Twilio. Einsatz: Terminerinnerungen, Angebote, Follow-ups, Reaktivierungskampagnen.',
        inputs: [
            { id: 'sms_count',       label: 'SMS / Monat',                  type: 'number',   default: 500, min: 1, unit: 'SMS'   },
            { id: 'personalization', label: 'KI-Personalisierung (OpenAI)', type: 'checkbox', default: true  },
            { id: 'sms_inbound',     label: 'Antworten erwarten (Inbound)', type: 'checkbox', default: false }
        ],
        stacks: ['twilio_n8n'],
        stackLabels: {
            twilio_n8n: 'Standard — Twilio + n8n',
        },
        calculate(inputs, stack) {
            const sms         = Math.max(0, parseFloat(inputs.sms_count) || 0);
            const personalize = inputs.personalization === true || inputs.personalization === 'true';
            const inbound     = inputs.sms_inbound    === true || inputs.sms_inbound    === 'true';
            const result      = { items: [], total: 0, plan_recommendation: null };
            const outCost     = sms * TOOLS.twilio.sms_outbound_de;
            result.items.push({ tool: 'Twilio SMS (Outbound DE)', detail: `${sms} SMS × $${TOOLS.twilio.sms_outbound_de}`, cost: outCost });
            result.total += outCost;
            if (inbound) {
                const inCost = Math.round(sms * 0.3) * TOOLS.twilio.sms_inbound_de;
                result.items.push({ tool: 'Twilio SMS (Inbound DE)', detail: `~${Math.round(sms*0.3)} Antworten × $${TOOLS.twilio.sms_inbound_de}`, cost: inCost });
                result.total += inCost;
            }
            if (personalize) {
                const llmCost = sms * 200 / 1_000_000 * TOOLS.openai.gpt4o_mini_input_per_1m * 1.5;
                result.items.push({ tool: 'OpenAI GPT-4o-mini', detail: `${sms} SMS × ~200 Tokens (Personalisierung)`, cost: llmCost });
                result.total += llmCost;
            }
            result.items.push({ tool: 'n8n (unser Server)', detail: 'Workflow + Scheduling', cost: 0 });
            result.plan_recommendation = 'Twilio SMS: pay-as-you-go — keine monatliche Grundgebühr';
            return result;
        }
    },

    // ─────────────────────────────────────────────
    termin_reservierung: {
        id:          'termin_reservierung',
        name:        'Termine & Reservierungen',
        icon:        'calendar',
        description: 'KI nimmt Buchungen entgegen, trägt sie in den Kalender ein und sendet SMS-Bestätigungen. Ideal für Restaurants, Friseursalons, Arztpraxen.',
        inputs: [
            { id: 'anrufe',           label: 'Anrufe / Monat',         type: 'number',   default: 200, min: 1,  unit: 'Anrufe' },
            { id: 'avg_min',          label: 'Ø Gesprächsdauer',       type: 'range',    default: 3,   min: 1, max: 15, unit: ' Min' },
            { id: 'sms_bestaetigung', label: 'SMS-Bestätigung senden', type: 'checkbox', default: true },
            {
                id: 'nummer_typ', label: 'Rufnummer-Typ',
                type: 'select', default: 'lokal',
                options: [
                    { value: 'lokal', label: 'Lokale Festnetz-Nummer ($1.15/mo)' },
                    { value: 'mobil', label: 'Mobile DE-Nummer ($15.00/mo)' },
                ]
            },
        ],
        stacks: ['elevenlabs_allinone'],
        stackLabels: {
            elevenlabs_allinone: 'Standard — ElevenLabs All-in-One',
        },
        calculate(inputs, stack) {
            const anrufe     = Math.max(0, parseFloat(inputs.anrufe)  || 0);
            const avgMin     = Math.max(1, parseFloat(inputs.avg_min) || 3);
            const totalMin   = anrufe * avgMin;
            const smsBest    = inputs.sms_bestaetigung === true || inputs.sms_bestaetigung === 'true';
            const numberCost = inputs.nummer_typ === 'mobil'
                ? TOOLS.twilio.number_de_mobile_monthly
                : TOOLS.twilio.number_de_local_monthly;
            const result = { items: [], total: 0, plan_recommendation: null };
            const convai = totalMin * TOOLS.elevenlabs.convAI_per_min;
            const plan   = TOOLS.elevenlabs.plans[1].monthly;
            const calls  = totalMin * TOOLS.twilio.inbound_de;
            result.items.push({ tool: 'ElevenLabs ConvAI', detail: `${anrufe} × ${avgMin} Min = ${totalMin} Min × $0.10`,            cost: convai               });
            result.items.push({ tool: 'ElevenLabs Plan',   detail: 'Creator (min. für ConvAI)',                                       cost: plan, is_plan: true  });
            result.items.push({ tool: 'Twilio Inbound DE', detail: `${totalMin} Min × $${TOOLS.twilio.inbound_de}`,                  cost: calls                });
            result.items.push({ tool: 'Twilio DE-Nummer',  detail: inputs.nummer_typ === 'mobil' ? 'Mobile-Nummer' : 'Lokale Nummer', cost: numberCost          });
            result.total += convai + plan + calls + numberCost;
            if (smsBest) {
                const smsCost = anrufe * TOOLS.twilio.sms_outbound_de;
                result.items.push({ tool: 'Twilio SMS (Bestätigung)', detail: `${anrufe} SMS × $${TOOLS.twilio.sms_outbound_de}`, cost: smsCost });
                result.total += smsCost;
            }
            result.items.push({ tool: 'Google Calendar API', detail: 'Terminverwaltung (kostenlos)', cost: 0 });
            result.items.push({ tool: 'n8n (unser Server)',   detail: 'Buchungslogik / Webhooks',    cost: 0 });
            result.plan_recommendation = `ElevenLabs Creator ($${TOOLS.elevenlabs.plans[1].monthly}/mo)`;
            return result;
        }
    },

    // ─────────────────────────────────────────────
    crm_automation: {
        id:          'crm_automation',
        name:        'CRM & Kundenverwaltung',
        icon:        'database',
        description: 'Leads erfassen, KI qualifiziert und weist zu, automatische E-Mail-Sequenzen, CRM-Sync. Vollautomatisches Vertriebssystem.',
        inputs: [
            { id: 'leads',    label: 'Neue Leads / Monat', type: 'number', default: 100, min: 1, unit: 'Leads' },
            { id: 'emails',   label: 'E-Mails / Monat',    type: 'number', default: 500, min: 0, unit: 'Mails' },
            {
                id: 'crm_tool', label: 'CRM-System',
                type: 'select', default: 'firebase',
                options: [
                    { value: 'firebase',        label: 'Firebase (kostenlos — unsere DB)'   },
                    { value: 'hubspot_free',    label: 'HubSpot Free ($0/mo)'               },
                    { value: 'hubspot_starter', label: 'HubSpot Starter ($45/mo)'           },
                    { value: 'pipedrive',       label: 'Pipedrive Essential ($14/mo)'       },
                ]
            },
        ],
        stacks: ['openai_n8n'],
        stackLabels: {
            openai_n8n: 'Standard — OpenAI + n8n',
        },
        calculate(inputs, stack) {
            const leads  = Math.max(0, parseFloat(inputs.leads)  || 0);
            const emails = Math.max(0, parseFloat(inputs.emails) || 0);
            const crm    = inputs.crm_tool || 'firebase';
            const result = { items: [], total: 0, plan_recommendation: null };
            const inputToks  = leads * 800 * 0.7;
            const outputToks = leads * 800 * 0.3;
            const llmCost    = (inputToks  / 1_000_000 * TOOLS.openai.gpt4o_mini_input_per_1m)
                             + (outputToks / 1_000_000 * TOOLS.openai.gpt4o_mini_output_per_1m);
            result.items.push({ tool: 'OpenAI GPT-4o-mini', detail: `${leads} Leads × ~800 Tokens`, cost: llmCost });
            result.items.push({ tool: 'n8n (unser Server)', detail: 'Workflows + CRM-Sync',          cost: 0       });
            const brevoPlan = emails <= 9000 ? TOOLS.brevo.plans[0] : TOOLS.brevo.plans[1];
            result.items.push({ tool: `Brevo (${brevoPlan.name})`, detail: `${emails} E-Mails/Monat`, cost: brevoPlan.monthly });
            const crmCostMap = { firebase: 0, hubspot_free: 0, hubspot_starter: 45, pipedrive: 14 };
            const crmNameMap = {
                firebase:        'Firebase',
                hubspot_free:    'HubSpot Free',
                hubspot_starter: 'HubSpot Starter',
                pipedrive:       'Pipedrive Essential',
            };
            const crmCost = crmCostMap[crm] || 0;
            result.items.push({ tool: crmNameMap[crm], detail: '/ Monat', cost: crmCost });
            result.total = llmCost + brevoPlan.monthly + crmCost;
            result.plan_recommendation = crmCost === 0
                ? 'Firebase reicht für die meisten Kunden — kostenlos!'
                : `${crmNameMap[crm]} — für erweiterte Pipeline-Funktionen`;
            return result;
        }
    },

    // ─────────────────────────────────────────────
    rechnungen: {
        id:          'rechnungen',
        name:        'Rechnungen & Dokumente',
        icon:        'file-text',
        description: 'KI extrahiert Daten aus Rechnungen und Belegen, kategorisiert automatisch. Einsatz: Buchhaltungs-Automation, Belegerfassung, Lexoffice-Export.',
        inputs: [
            { id: 'belege',       label: 'Belege / Monat', type: 'number', default: 50, min: 1, unit: 'Belege' },
            {
                id: 'llm_quality', label: 'Qualität',
                type: 'select', default: 'mini',
                options: [
                    { value: 'mini',  label: 'GPT-4o-mini — günstig, gut für strukturierte Belege' },
                    { value: 'gpt4o', label: 'GPT-4o — besser für komplexe / handgeschriebene Belege' },
                ]
            },
            { id: 'email_notify', label: 'E-Mail-Benachrichtigung bei neuem Beleg', type: 'checkbox', default: true }
        ],
        stacks: ['openai_n8n'],
        stackLabels: {
            openai_n8n: 'Standard — OpenAI + n8n',
        },
        calculate(inputs, stack) {
            const belege   = Math.max(0, parseFloat(inputs.belege) || 0);
            const qual     = inputs.llm_quality || 'mini';
            const emailNot = inputs.email_notify === true || inputs.email_notify === 'true';
            const result   = { items: [], total: 0, plan_recommendation: null };
            let llmCost;
            if (qual === 'gpt4o') {
                const inp  = belege * 2000 * 0.7 / 1_000_000 * TOOLS.openai.gpt4o_input_per_1m;
                const outp = belege * 2000 * 0.3 / 1_000_000 * TOOLS.openai.gpt4o_output_per_1m;
                llmCost = inp + outp;
                result.items.push({ tool: 'OpenAI GPT-4o',      detail: `${belege} Belege × ~2.000 Tokens`, cost: llmCost });
            } else {
                const inp  = belege * 2000 * 0.7 / 1_000_000 * TOOLS.openai.gpt4o_mini_input_per_1m;
                const outp = belege * 2000 * 0.3 / 1_000_000 * TOOLS.openai.gpt4o_mini_output_per_1m;
                llmCost = inp + outp;
                result.items.push({ tool: 'OpenAI GPT-4o-mini', detail: `${belege} Belege × ~2.000 Tokens`, cost: llmCost });
            }
            result.items.push({ tool: 'n8n (unser Server)', detail: 'Automatisierung + Routing', cost: 0 });
            result.items.push({ tool: 'Firebase',           detail: 'Belegspeicher (Free-Tier)', cost: 0 });
            if (emailNot) {
                result.items.push({ tool: 'Brevo Free', detail: `${belege} Benachrichtigungen / Monat`, cost: 0 });
            }
            result.total = llmCost;
            result.plan_recommendation = qual === 'mini'
                ? 'GPT-4o-mini: ideal für digitale/strukturierte Rechnungen. Bei schlechter Qualität → GPT-4o.'
                : 'GPT-4o: deutlich bessere Extraktion, aber ~20× teurer als mini.';
            return result;
        }
    },

    // ─────────────────────────────────────────────
    komplett_paket: {
        id:          'komplett_paket',
        name:        'Komplett-Paket',
        icon:        'award',
        description: 'Vollständige KI-Infrastruktur: Telefonbot + WhatsApp + Lead Capture + E-Mail-Automation + CRM. Für Kunden die alles wollen.',
        inputs: [
            { id: 'voice_min', label: 'Telefonminuten / Monat',   type: 'number', default: 300, min: 0, unit: 'Min'   },
            { id: 'wa_convs',  label: 'WhatsApp-Konversationen',  type: 'number', default: 300, min: 0, unit: 'Konvs' },
            { id: 'leads',     label: 'Neue Leads / Monat',       type: 'number', default: 50,  min: 0, unit: 'Leads' },
            { id: 'emails',    label: 'E-Mails / Monat',          type: 'number', default: 500, min: 0, unit: 'Mails' },
        ],
        stacks: ['elevenlabs_allinone'],
        stackLabels: {
            elevenlabs_allinone: 'Standard — Full Stack',
        },
        calculate(inputs, stack) {
            const voiceMin = Math.max(0, parseFloat(inputs.voice_min) || 0);
            const waConvs  = Math.max(0, parseFloat(inputs.wa_convs)  || 0);
            const leads    = Math.max(0, parseFloat(inputs.leads)     || 0);
            const emails   = Math.max(0, parseFloat(inputs.emails)    || 0);
            const result   = { items: [], total: 0, plan_recommendation: null };

            // Telefonbot
            const convai   = voiceMin * TOOLS.elevenlabs.convAI_per_min;
            const elevPlan = TOOLS.elevenlabs.plans[1].monthly;
            const twilioIn = voiceMin * TOOLS.twilio.inbound_de;
            const twilioNr = TOOLS.twilio.number_de_local_monthly;
            result.items.push({ tool: '── Telefonbot ──────────────────────', detail: '', cost: null, is_section: true });
            result.items.push({ tool: 'ElevenLabs ConvAI',        detail: `${voiceMin} Min × $0.10`,             cost: convai              });
            result.items.push({ tool: 'ElevenLabs Plan',          detail: 'Creator',                             cost: elevPlan, is_plan: true });
            result.items.push({ tool: 'Twilio (Inbound + Nummer)', detail: `${voiceMin} Min + Festnetz-Nr.`,     cost: twilioIn + twilioNr });

            // WhatsApp
            const waRate = TOOLS.whatsapp.utility_per_conv;
            const waCost = waConvs * waRate;
            const waMsgs = waConvs * 3;
            const waLlm  = (waMsgs * TOOLS.openai.avg_tokens_per_message * 0.6 / 1_000_000 * TOOLS.openai.gpt4o_mini_input_per_1m)
                         + (waMsgs * TOOLS.openai.avg_tokens_per_message * 0.4 / 1_000_000 * TOOLS.openai.gpt4o_mini_output_per_1m);
            result.items.push({ tool: '── WhatsApp-Bot ─────────────────────', detail: '', cost: null, is_section: true });
            result.items.push({ tool: 'WhatsApp API (Utility)', detail: `${waConvs} Konvs × $${waRate.toFixed(4)}`,  cost: waCost });
            result.items.push({ tool: 'OpenAI (WA-Antworten)',  detail: `${waConvs} Konvs × ~3 Msgs`,               cost: waLlm  });

            // Lead Capture + CRM
            const leadLlm   = (leads * 1000 * 0.7 / 1_000_000 * TOOLS.openai.gpt4o_mini_input_per_1m)
                            + (leads * 1000 * 0.3 / 1_000_000 * TOOLS.openai.gpt4o_mini_output_per_1m);
            const brevoPlan = emails <= 9000 ? TOOLS.brevo.plans[0] : TOOLS.brevo.plans[1];
            result.items.push({ tool: '── Lead Capture & CRM ───────────────', detail: '', cost: null, is_section: true });
            result.items.push({ tool: 'OpenAI (Lead-Analyse)',    detail: `${leads} Leads × ~1.000 Tokens`,  cost: leadLlm           });
            result.items.push({ tool: `Brevo (${brevoPlan.name})`, detail: `${emails} E-Mails/Monat`,        cost: brevoPlan.monthly });
            result.items.push({ tool: 'Firebase',                 detail: 'Datenbank (Free-Tier)',            cost: 0                 });

            // Infrastruktur
            result.items.push({ tool: '── Infrastruktur ────────────────────', detail: '', cost: null, is_section: true });
            result.items.push({ tool: 'n8n (unser Server)', detail: 'Alle Workflows (inklusive)', cost: 0 });

            result.total = convai + elevPlan + twilioIn + twilioNr + waCost + waLlm + leadLlm + brevoPlan.monthly;
            result.plan_recommendation = `ElevenLabs Creator ($${elevPlan}/mo) + Brevo ${brevoPlan.name} — ⚠️ WhatsApp-Preise vor Angebot verifizieren`;
            return result;
        }
    }
};

// ============================
// WINDOW EXPORT
// ============================
// Plain-JS Strategie: keine ES-Module, kein Build-Step.
// Beide Seiten (pricing-calculator.html + kva-detail.html) binden
// dieses File per <script> vor ihrem eigenen JS ein und nutzen
// die globalen Variablen direkt.

window.TOOLS               = TOOLS;
window.BUNDLES             = BUNDLES;
window.USD_TO_EUR          = USD_TO_EUR;
window.PRICES_LAST_UPDATED = PRICES_LAST_UPDATED;
