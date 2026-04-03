/**
 * Pricing Calculator — ML Vision Admin
 * Stand: März 2026 — Preise bei Bedarf verifizieren!
 */

// ============================
// KONFIGURATION & PREISE
// ============================

let USD_TO_EUR = 0.92;
const PRICES_LAST_UPDATED = new Date('2026-03-14');

const TOOLS = {
    elevenlabs: {
        name: 'ElevenLabs',
        category: 'TTS / Voice Agent',
        plans: [
            { name: 'Starter',  monthly: 5,    chars: 30000,    convAI: false },
            { name: 'Creator',  monthly: 22,   chars: 100000,   convAI: true  },
            { name: 'Pro',      monthly: 99,   chars: 500000,   convAI: true  },
            { name: 'Scale',    monthly: 330,  chars: 2000000,  convAI: true  },
            { name: 'Business', monthly: 1320, chars: 11000000, convAI: true  },
        ],
        convAI_per_min: 0.10,
        tts_overage: { Creator: 0.00030, Pro: 0.00024, Scale: 0.00018, Business: 0.00012 }
    },
    cartesia: {
        name: 'Cartesia',
        category: 'TTS (ultra-low Latenz ~100ms)',
        chars_per_min: 900,
        per_min_basis: 0.045,   // 900 Chars × $0.050/1k
        per_min_scale: 0.033,   // 900 Chars × $0.037/1k (Scale)
        plans: [
            { name: 'Free',  monthly: 0,   chars: 100000,  overage_per_1k: null  },
            { name: 'Basis', monthly: 5,   chars: 100000,  overage_per_1k: 0.050 },
            { name: 'Pro',   monthly: 50,  chars: 1000000, overage_per_1k: 0.050 },
            { name: 'Scale', monthly: 299, chars: 8000000, overage_per_1k: 0.037 },
        ]
    },
    twilio: {
        name: 'Twilio',
        category: 'Telefonie / SMS',
        inbound_de: 0.0085,
        outbound_de_landline: 0.015,
        outbound_de_mobile: 0.025,
        number_de_local_monthly: 1.15,    // Lokale Festnetz-Nummer
        number_de_mobile_monthly: 15.00,  // Mobile DE-Nummer (+49 15x/16x/17x)
        sms_outbound_de: 0.075,
        sms_inbound_de: 0.0075,
    },
    vapi: {
        name: 'Vapi.ai',
        category: 'Voice Orchestrierung',
        per_min: 0.05
    },
    deepgram: {
        name: 'Deepgram',
        category: 'STT',
        nova2_per_min: 0.0043,
        nova3_per_min: 0.0077
    },
    openai: {
        name: 'OpenAI',
        category: 'LLM / STT',
        gpt4o_input_per_1m: 2.50,
        gpt4o_output_per_1m: 10.00,
        gpt4o_mini_input_per_1m: 0.15,
        gpt4o_mini_output_per_1m: 0.60,
        avg_tokens_per_message: 500,
    },
    brevo: {
        name: 'Brevo',
        category: 'E-Mail',
        plans: [
            { name: 'Free',     monthly: 0,  emails: 9000,  note: '300/Tag Limit' },
            { name: 'Starter',  monthly: 9,  emails: 50000, note: 'kein Tageslimit' },
            { name: 'Business', monthly: 18, emails: 50000, note: '+ Automation' },
        ]
    },
    whatsapp: {
        name: 'WhatsApp Business API (Meta)',
        category: 'Messaging',
        // Pro Konversation (24h-Fenster), DE Region — ⚠️ PREISE VERIFIZIEREN
        marketing_per_conv: 0.0975,
        utility_per_conv:   0.0265,
        service_per_conv:   0.00,   // User-initiiert: seit 2024 kostenlos
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
// BUNDLE DEFINITIONEN
// ============================

const BUNDLES = {

    telefonbot: {
        id: 'telefonbot',
        name: 'Telefonbot (Inbound)',
        icon: 'phone-incoming',
        description: 'KI beantwortet eingehende Anrufe automatisch. Einsatz: Kundensupport, Anfragen, Lead-Qualifizierung.',
        inputs: [
            { id: 'minutes',    label: 'Minuten / Monat',  type: 'number', default: 500, min: 1, unit: 'Min' },
            { id: 'nummer_typ', label: 'Rufnummer-Typ',    type: 'select', default: 'lokal', options: [
                { value: 'lokal', label: 'Lokale Festnetz-Nummer ($1.15/mo)' },
                { value: 'mobil', label: 'Mobile DE-Nummer ($15.00/mo)' },
            ]},
        ],
        stacks: ['elevenlabs_allinone', 'vapi', 'vapi_cartesia'],
        calculate(inputs, stack) {
            const mins       = Math.max(0, parseFloat(inputs.minutes) || 0);
            const numberCost = inputs.nummer_typ === 'mobil'
                ? TOOLS.twilio.number_de_mobile_monthly
                : TOOLS.twilio.number_de_local_monthly;
            const result = { items: [], total: 0, plan_recommendation: null };

            if (stack === 'elevenlabs_allinone') {
                const convai = mins * TOOLS.elevenlabs.convAI_per_min;
                const plan   = TOOLS.elevenlabs.plans[1].monthly;
                const calls  = mins * TOOLS.twilio.inbound_de;
                result.items.push({ tool: 'ElevenLabs ConvAI', detail: `${mins} Min × $0.10`,                                                             cost: convai });
                result.items.push({ tool: 'ElevenLabs Plan',   detail: 'Creator (min. für ConvAI)',                                                       cost: plan, is_plan: true });
                result.items.push({ tool: 'Twilio Inbound DE', detail: `${mins} Min × $${TOOLS.twilio.inbound_de}`,                                      cost: calls });
                result.items.push({ tool: 'Twilio DE-Nummer',  detail: inputs.nummer_typ === 'mobil' ? 'Mobile-Nummer / Monat' : 'Lokale Nummer / Monat', cost: numberCost });
                result.total = convai + plan + calls + numberCost;
                result.plan_recommendation = `ElevenLabs Creator ($${TOOLS.elevenlabs.plans[1].monthly}/mo)`;

            } else if (stack === 'vapi') {
                const vapi     = mins * TOOLS.vapi.per_min;
                const deepgram = mins * TOOLS.deepgram.nova3_per_min;
                const llm      = mins * 0.02;
                const tts      = mins * 0.05;
                const calls    = mins * TOOLS.twilio.inbound_de;
                result.items.push({ tool: 'Vapi.ai',             detail: `${mins} Min × $${TOOLS.vapi.per_min}`,             cost: vapi     });
                result.items.push({ tool: 'Deepgram Nova-3',      detail: `${mins} Min × $${TOOLS.deepgram.nova3_per_min}`,   cost: deepgram });
                result.items.push({ tool: 'OpenAI GPT-4o-mini',   detail: `${mins} Min × ~$0.02`,                             cost: llm      });
                result.items.push({ tool: 'ElevenLabs TTS',       detail: `${mins} Min × ~$0.05`,                             cost: tts      });
                result.items.push({ tool: 'Twilio Inbound DE',    detail: `${mins} Min × $${TOOLS.twilio.inbound_de}`,        cost: calls    });
                result.items.push({ tool: 'Twilio DE-Nummer',     detail: inputs.nummer_typ === 'mobil' ? 'Mobile-Nummer' : 'Lokale Nummer', cost: numberCost });
                result.total = vapi + deepgram + llm + tts + calls + numberCost;
                result.plan_recommendation = `ElevenLabs Creator ($${TOOLS.elevenlabs.plans[1].monthly}/mo) für TTS-Zugang`;

            } else if (stack === 'vapi_cartesia') {
                const vapi     = mins * TOOLS.vapi.per_min;
                const cartesia = mins * TOOLS.cartesia.per_min_basis;
                const deepgram = mins * TOOLS.deepgram.nova3_per_min;
                const llm      = mins * 0.02;
                const calls    = mins * TOOLS.twilio.inbound_de;
                result.items.push({ tool: 'Vapi.ai',             detail: `${mins} Min × $${TOOLS.vapi.per_min}`,                                          cost: vapi     });
                result.items.push({ tool: 'Cartesia TTS',         detail: `${mins} Min × ~$${TOOLS.cartesia.per_min_basis.toFixed(3)} (900 Chars/min)`,    cost: cartesia });
                result.items.push({ tool: 'Deepgram Nova-3',      detail: `${mins} Min × $${TOOLS.deepgram.nova3_per_min}`,                                cost: deepgram });
                result.items.push({ tool: 'OpenAI GPT-4o-mini',   detail: `${mins} Min × ~$0.02`,                                                          cost: llm      });
                result.items.push({ tool: 'Twilio Inbound DE',    detail: `${mins} Min × $${TOOLS.twilio.inbound_de}`,                                     cost: calls    });
                result.items.push({ tool: 'Twilio DE-Nummer',     detail: inputs.nummer_typ === 'mobil' ? 'Mobile-Nummer' : 'Lokale Nummer',               cost: numberCost });
                result.total = vapi + cartesia + deepgram + llm + calls + numberCost;
                result.plan_recommendation = `Cartesia Basis ($${TOOLS.cartesia.plans[1].monthly}/mo) — Ultra-niedrige Latenz (~100ms)`;
            }
            return result;
        }
    },

    voice_widget: {
        id: 'voice_widget',
        name: 'Voice Widget (Website)',
        icon: 'mic',
        description: 'Sprach-KI direkt im Browser auf der Website. Kein Telefon. Einsatz: FAQ-Bot, Beratungs-Bot, Website-Assistent.',
        inputs: [
            { id: 'minutes', label: 'Minuten / Monat', type: 'number', default: 200, min: 1, unit: 'Min' }
        ],
        stacks: ['elevenlabs_allinone', 'vapi_cartesia'],
        calculate(inputs, stack) {
            const mins   = Math.max(0, parseFloat(inputs.minutes) || 0);
            const result = { items: [], total: 0, plan_recommendation: null };

            if (stack === 'elevenlabs_allinone') {
                const convai = mins * TOOLS.elevenlabs.convAI_per_min;
                const plan   = TOOLS.elevenlabs.plans[1].monthly;
                result.items.push({ tool: 'ElevenLabs ConvAI', detail: `${mins} Min × $0.10`,           cost: convai });
                result.items.push({ tool: 'ElevenLabs Plan',   detail: 'Creator (min. für ConvAI)',      cost: plan, is_plan: true });
                result.total = convai + plan;
                result.plan_recommendation = `ElevenLabs Creator ($${TOOLS.elevenlabs.plans[1].monthly}/mo)`;

            } else if (stack === 'vapi_cartesia') {
                const vapi     = mins * TOOLS.vapi.per_min;
                const cartesia = mins * TOOLS.cartesia.per_min_basis;
                const deepgram = mins * TOOLS.deepgram.nova3_per_min;
                const llm      = mins * 0.02;
                result.items.push({ tool: 'Vapi.ai',           detail: `${mins} Min × $${TOOLS.vapi.per_min}`,                 cost: vapi     });
                result.items.push({ tool: 'Cartesia TTS',       detail: `${mins} Min × ~$${TOOLS.cartesia.per_min_basis.toFixed(3)}`, cost: cartesia });
                result.items.push({ tool: 'Deepgram Nova-3',    detail: `${mins} Min × $${TOOLS.deepgram.nova3_per_min}`,       cost: deepgram });
                result.items.push({ tool: 'OpenAI GPT-4o-mini', detail: `${mins} Min × ~$0.02`,                                 cost: llm      });
                result.total = vapi + cartesia + deepgram + llm;
                result.plan_recommendation = `Cartesia Basis ($${TOOLS.cartesia.plans[1].monthly}/mo) — kein Telefoniekosten`;
            }
            return result;
        }
    },

    outbound: {
        id: 'outbound',
        name: 'Outbound Kampagne',
        icon: 'phone-outgoing',
        description: 'KI ruft Kontakte aktiv an. Einsatz: Terminerinnerungen, Lead-Nurturing, Umfragen, Follow-up-Anrufe.',
        inputs: [
            { id: 'minutes',        label: 'Minuten / Monat',   type: 'number', default: 500, min: 1,   unit: 'Min' },
            { id: 'mobile_percent', label: 'Mobilfunk-Anteil',  type: 'range',  default: 50,  min: 0, max: 100, unit: '%' }
        ],
        stacks: ['elevenlabs_allinone', 'vapi_cartesia'],
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
                result.items.push({ tool: 'ElevenLabs ConvAI',        detail: `${mins} Min × $0.10`,                                                         cost: convai  });
                result.items.push({ tool: 'ElevenLabs Plan',          detail: 'Creator (min.)',                                                               cost: plan, is_plan: true });
                result.items.push({ tool: 'Twilio Outbound Festnetz', detail: `${(mins*landlinePct).toFixed(0)} Min × $${TOOLS.twilio.outbound_de_landline}`, cost: twilioLL });
                result.items.push({ tool: 'Twilio Outbound Mobil',    detail: `${(mins*mobilePct).toFixed(0)} Min × $${TOOLS.twilio.outbound_de_mobile}`,     cost: twilioM  });
                result.items.push({ tool: 'Twilio DE-Nummer',         detail: 'Fixkosten / Monat',                                                            cost: number   });
                result.total = convai + plan + twilioLL + twilioM + number;
                result.plan_recommendation = `ElevenLabs Creator ($${TOOLS.elevenlabs.plans[1].monthly}/mo)`;

            } else if (stack === 'vapi_cartesia') {
                const vapi     = mins * TOOLS.vapi.per_min;
                const cartesia = mins * TOOLS.cartesia.per_min_basis;
                const deepgram = mins * TOOLS.deepgram.nova3_per_min;
                const llm      = mins * 0.02;
                result.items.push({ tool: 'Vapi.ai',                  detail: `${mins} Min × $${TOOLS.vapi.per_min}`,                                        cost: vapi     });
                result.items.push({ tool: 'Cartesia TTS',             detail: `${mins} Min × ~$${TOOLS.cartesia.per_min_basis.toFixed(3)}`,                   cost: cartesia });
                result.items.push({ tool: 'Deepgram Nova-3',          detail: `${mins} Min × $${TOOLS.deepgram.nova3_per_min}`,                               cost: deepgram });
                result.items.push({ tool: 'OpenAI GPT-4o-mini',       detail: `${mins} Min × ~$0.02`,                                                         cost: llm      });
                result.items.push({ tool: 'Twilio Outbound Festnetz', detail: `${(mins*landlinePct).toFixed(0)} Min × $${TOOLS.twilio.outbound_de_landline}`, cost: twilioLL });
                result.items.push({ tool: 'Twilio Outbound Mobil',    detail: `${(mins*mobilePct).toFixed(0)} Min × $${TOOLS.twilio.outbound_de_mobile}`,     cost: twilioM  });
                result.items.push({ tool: 'Twilio DE-Nummer',         detail: 'Fixkosten / Monat',                                                            cost: number   });
                result.total = vapi + cartesia + deepgram + llm + twilioLL + twilioM + number;
                result.plan_recommendation = `Cartesia Basis ($${TOOLS.cartesia.plans[1].monthly}/mo) — Ultra-niedrige Latenz`;
            }
            return result;
        }
    },

    chatbot: {
        id: 'chatbot',
        name: 'Chat Bot (Text)',
        icon: 'message-square',
        description: 'Text-Chat-Bot für Website-Chat oder Support. Kein Voice. Einsatz: FAQ, Kundenservice, Lead-Capture.',
        inputs: [
            { id: 'messages',      label: 'Nachrichten / Monat',       type: 'number',   default: 1000, min: 1, unit: 'Msgs' },
            { id: 'include_brevo', label: 'E-Mail Follow-up (Brevo)',  type: 'checkbox', default: false }
        ],
        stacks: ['openai_n8n'],
        calculate(inputs, stack) {
            const msgs      = Math.max(0, parseFloat(inputs.messages) || 0);
            const inclBrevo = inputs.include_brevo === true || inputs.include_brevo === 'true';
            const result    = { items: [], total: 0, plan_recommendation: null };
            const inputToks  = msgs * TOOLS.openai.avg_tokens_per_message * 0.6;
            const outputToks = msgs * TOOLS.openai.avg_tokens_per_message * 0.4;
            const llmCost    = (inputToks  / 1_000_000 * TOOLS.openai.gpt4o_mini_input_per_1m)
                             + (outputToks / 1_000_000 * TOOLS.openai.gpt4o_mini_output_per_1m);
            result.items.push({ tool: 'OpenAI GPT-4o-mini', detail: `${msgs} Nachrichten × ~500 Tokens`, cost: llmCost });
            result.items.push({ tool: 'n8n (unser Server)', detail: 'Workflow-Automatisierung',           cost: 0      });
            if (inclBrevo) {
                result.items.push({ tool: 'Brevo Free', detail: 'bis 9.000 E-Mails/Monat', cost: 0 });
            }
            result.total = llmCost;
            result.plan_recommendation = 'OpenAI API (pay-as-you-go)';
            return result;
        }
    },

    lead_capture: {
        id: 'lead_capture',
        name: 'Lead Capture System',
        icon: 'target',
        description: 'Formular → KI-Qualifizierung → E-Mail → CRM. Vollautomatischer Lead-Funnel.',
        inputs: [
            { id: 'leads',  label: 'Leads / Monat',   type: 'number', default: 100, min: 1, unit: 'Leads'   },
            { id: 'emails', label: 'E-Mails / Monat', type: 'number', default: 200, min: 0, unit: 'E-Mails' }
        ],
        stacks: ['openai_n8n'],
        calculate(inputs, stack) {
            const leads  = Math.max(0, parseFloat(inputs.leads)  || 0);
            const emails = Math.max(0, parseFloat(inputs.emails) || 0);
            const result = { items: [], total: 0, plan_recommendation: null };
            const inputToks  = leads * 1000 * 0.7;
            const outputToks = leads * 1000 * 0.3;
            const llmCost    = (inputToks  / 1_000_000 * TOOLS.openai.gpt4o_mini_input_per_1m)
                             + (outputToks / 1_000_000 * TOOLS.openai.gpt4o_mini_output_per_1m);
            const brevoPlan  = emails <= 9000 ? TOOLS.brevo.plans[0] : TOOLS.brevo.plans[1];
            result.items.push({ tool: 'OpenAI GPT-4o-mini',       detail: `${leads} Leads × ~$0.01/Lead`, cost: llmCost          });
            result.items.push({ tool: 'n8n (unser Server)',        detail: 'Workflow-Automatisierung',     cost: 0                });
            result.items.push({ tool: `Brevo (${brevoPlan.name})`, detail: `${emails} E-Mails/Monat`,     cost: brevoPlan.monthly });
            result.items.push({ tool: 'Firebase',                  detail: 'Datenbank (Free-Tier)',        cost: 0                });
            result.total = llmCost + brevoPlan.monthly;
            result.plan_recommendation = emails <= 9000 ? 'Brevo Free reicht aus' : `Brevo Starter ($${TOOLS.brevo.plans[1].monthly}/mo)`;
            return result;
        }
    },

    whatsapp_bot: {
        id: 'whatsapp_bot',
        name: 'WhatsApp-Bot',
        icon: 'smartphone',
        description: 'KI beantwortet Kundennachrichten via WhatsApp. Einsatz: Bestellungen, Support, Reservierungen, FAQ. ⚠️ WhatsApp-Preise verifizieren!',
        inputs: [
            { id: 'conversations', label: 'Konversationen / Monat', type: 'number', default: 300, min: 1, unit: 'Konvs' },
            { id: 'conv_type',     label: 'Nachrichtentyp',         type: 'select', default: 'utility', options: [
                { value: 'service',   label: 'Service — Kundenanfragen (kostenlos seit 2024)' },
                { value: 'utility',   label: 'Utility — Bestätigungen, Termine (~$0.03/Konv)' },
                { value: 'marketing', label: 'Marketing — Kampagnen, Angebote (~$0.10/Konv)' },
            ]},
            { id: 'ai_responses', label: 'KI-Antworten (OpenAI)', type: 'checkbox', default: true }
        ],
        stacks: ['meta_n8n'],
        calculate(inputs, stack) {
            const convs     = Math.max(0, parseFloat(inputs.conversations) || 0);
            const convType  = inputs.conv_type || 'utility';
            const aiEnabled = inputs.ai_responses === true || inputs.ai_responses === 'true';
            const result    = { items: [], total: 0, plan_recommendation: null };
            const rateMap   = { service: TOOLS.whatsapp.service_per_conv, utility: TOOLS.whatsapp.utility_per_conv, marketing: TOOLS.whatsapp.marketing_per_conv };
            const typeLabel = { service: 'Service', utility: 'Utility', marketing: 'Marketing' };
            const rate      = rateMap[convType] || TOOLS.whatsapp.utility_per_conv;
            const waCost    = convs * rate;
            result.items.push({ tool: `WhatsApp API (${typeLabel[convType]})`, detail: `${convs} Konvs × $${rate.toFixed(4)}`, cost: waCost });
            if (aiEnabled) {
                const msgs       = convs * 3; // avg 3 messages per conv
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

    sms_kampagne: {
        id: 'sms_kampagne',
        name: 'SMS-Kampagne',
        icon: 'mail',
        description: 'Personalisierter SMS-Outbound via Twilio. Einsatz: Terminerinnerungen, Angebote, Follow-ups, Reaktivierungskampagnen.',
        inputs: [
            { id: 'sms_count',       label: 'SMS / Monat',                  type: 'number',   default: 500, min: 1, unit: 'SMS' },
            { id: 'personalization', label: 'KI-Personalisierung (OpenAI)', type: 'checkbox', default: true },
            { id: 'sms_inbound',     label: 'Antworten erwarten (Inbound)', type: 'checkbox', default: false }
        ],
        stacks: ['twilio_n8n'],
        calculate(inputs, stack) {
            const sms         = Math.max(0, parseFloat(inputs.sms_count) || 0);
            const personalize = inputs.personalization === true || inputs.personalization === 'true';
            const inbound     = inputs.sms_inbound === true || inputs.sms_inbound === 'true';
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

    termin_reservierung: {
        id: 'termin_reservierung',
        name: 'Termine & Reservierungen',
        icon: 'calendar',
        description: 'KI nimmt Buchungen entgegen, trägt sie in den Kalender ein und sendet SMS-Bestätigungen. Ideal für Restaurants, Friseursalons, Arztpraxen.',
        inputs: [
            { id: 'anrufe',           label: 'Anrufe / Monat',         type: 'number',   default: 200, min: 1, unit: 'Anrufe' },
            { id: 'avg_min',          label: 'Ø Gesprächsdauer',       type: 'range',    default: 3, min: 1, max: 15, unit: ' Min' },
            { id: 'sms_bestaetigung', label: 'SMS-Bestätigung senden', type: 'checkbox', default: true },
            { id: 'nummer_typ',       label: 'Rufnummer-Typ',          type: 'select',   default: 'lokal', options: [
                { value: 'lokal', label: 'Lokale Festnetz-Nummer ($1.15/mo)' },
                { value: 'mobil', label: 'Mobile DE-Nummer ($15.00/mo)' },
            ]},
        ],
        stacks: ['elevenlabs_allinone'],
        calculate(inputs, stack) {
            const anrufe     = Math.max(0, parseFloat(inputs.anrufe)   || 0);
            const avgMin     = Math.max(1, parseFloat(inputs.avg_min)  || 3);
            const totalMin   = anrufe * avgMin;
            const smsBest    = inputs.sms_bestaetigung === true || inputs.sms_bestaetigung === 'true';
            const numberCost = inputs.nummer_typ === 'mobil'
                ? TOOLS.twilio.number_de_mobile_monthly
                : TOOLS.twilio.number_de_local_monthly;
            const result = { items: [], total: 0, plan_recommendation: null };
            const convai = totalMin * TOOLS.elevenlabs.convAI_per_min;
            const plan   = TOOLS.elevenlabs.plans[1].monthly;
            const calls  = totalMin * TOOLS.twilio.inbound_de;
            result.items.push({ tool: 'ElevenLabs ConvAI',  detail: `${anrufe} × ${avgMin} Min = ${totalMin} Min × $0.10`,       cost: convai     });
            result.items.push({ tool: 'ElevenLabs Plan',    detail: 'Creator (min. für ConvAI)',                                  cost: plan, is_plan: true });
            result.items.push({ tool: 'Twilio Inbound DE',  detail: `${totalMin} Min × $${TOOLS.twilio.inbound_de}`,             cost: calls      });
            result.items.push({ tool: 'Twilio DE-Nummer',   detail: inputs.nummer_typ === 'mobil' ? 'Mobile-Nummer' : 'Lokale Nummer', cost: numberCost });
            result.total += convai + plan + calls + numberCost;
            if (smsBest) {
                const smsCost = anrufe * TOOLS.twilio.sms_outbound_de;
                result.items.push({ tool: 'Twilio SMS (Bestätigung)', detail: `${anrufe} SMS × $${TOOLS.twilio.sms_outbound_de}`, cost: smsCost });
                result.total += smsCost;
            }
            result.items.push({ tool: 'Google Calendar API', detail: 'Terminverwaltung (kostenlos)',    cost: 0 });
            result.items.push({ tool: 'n8n (unser Server)',   detail: 'Buchungslogik / Webhooks',       cost: 0 });
            result.plan_recommendation = `ElevenLabs Creator ($${TOOLS.elevenlabs.plans[1].monthly}/mo)`;
            return result;
        }
    },

    crm_automation: {
        id: 'crm_automation',
        name: 'CRM & Kundenverwaltung',
        icon: 'database',
        description: 'Leads erfassen, KI qualifiziert und weist zu, automatische E-Mail-Sequenzen, CRM-Sync. Vollautomatisches Vertriebssystem.',
        inputs: [
            { id: 'leads',    label: 'Neue Leads / Monat', type: 'number', default: 100, min: 1, unit: 'Leads' },
            { id: 'emails',   label: 'E-Mails / Monat',    type: 'number', default: 500, min: 0, unit: 'Mails' },
            { id: 'crm_tool', label: 'CRM-System',         type: 'select', default: 'firebase', options: [
                { value: 'firebase',        label: 'Firebase (kostenlos — unsere DB)' },
                { value: 'hubspot_free',    label: 'HubSpot Free ($0/mo)' },
                { value: 'hubspot_starter', label: 'HubSpot Starter ($45/mo)' },
                { value: 'pipedrive',       label: 'Pipedrive Essential ($14/mo)' },
            ]},
        ],
        stacks: ['openai_n8n'],
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
            result.items.push({ tool: 'n8n (unser Server)', detail: 'Workflows + CRM-Sync',          cost: 0      });
            const brevoPlan = emails <= 9000 ? TOOLS.brevo.plans[0] : TOOLS.brevo.plans[1];
            result.items.push({ tool: `Brevo (${brevoPlan.name})`, detail: `${emails} E-Mails/Monat`, cost: brevoPlan.monthly });
            const crmCostMap  = { firebase: 0, hubspot_free: 0, hubspot_starter: 45, pipedrive: 14 };
            const crmNameMap  = { firebase: 'Firebase', hubspot_free: 'HubSpot Free', hubspot_starter: 'HubSpot Starter', pipedrive: 'Pipedrive Essential' };
            const crmCost = crmCostMap[crm] || 0;
            result.items.push({ tool: crmNameMap[crm], detail: '/ Monat', cost: crmCost });
            result.total = llmCost + brevoPlan.monthly + crmCost;
            result.plan_recommendation = crmCost === 0
                ? 'Firebase reicht für die meisten Kunden — kostenlos!'
                : `${crmNameMap[crm]} — für erweiterte Pipeline-Funktionen`;
            return result;
        }
    },

    rechnungen: {
        id: 'rechnungen',
        name: 'Rechnungen & Dokumente',
        icon: 'file-text',
        description: 'KI extrahiert Daten aus Rechnungen und Belegen, kategorisiert automatisch. Einsatz: Buchhaltungs-Automation, Belegerfassung, Lexoffice-Export.',
        inputs: [
            { id: 'belege',      label: 'Belege / Monat',  type: 'number', default: 50,   min: 1, unit: 'Belege' },
            { id: 'llm_quality', label: 'Qualität',        type: 'select', default: 'mini', options: [
                { value: 'mini',  label: 'GPT-4o-mini — günstig, gut für strukturierte Belege' },
                { value: 'gpt4o', label: 'GPT-4o — besser für komplexe / handgeschriebene Belege' },
            ]},
            { id: 'email_notify', label: 'E-Mail-Benachrichtigung bei neuem Beleg', type: 'checkbox', default: true }
        ],
        stacks: ['openai_n8n'],
        calculate(inputs, stack) {
            const belege    = Math.max(0, parseFloat(inputs.belege) || 0);
            const qual      = inputs.llm_quality || 'mini';
            const emailNot  = inputs.email_notify === true || inputs.email_notify === 'true';
            const result    = { items: [], total: 0, plan_recommendation: null };
            let llmCost;
            if (qual === 'gpt4o') {
                const inp  = belege * 2000 * 0.7 / 1_000_000 * TOOLS.openai.gpt4o_input_per_1m;
                const outp = belege * 2000 * 0.3 / 1_000_000 * TOOLS.openai.gpt4o_output_per_1m;
                llmCost = inp + outp;
                result.items.push({ tool: 'OpenAI GPT-4o', detail: `${belege} Belege × ~2.000 Tokens`, cost: llmCost });
            } else {
                const inp  = belege * 2000 * 0.7 / 1_000_000 * TOOLS.openai.gpt4o_mini_input_per_1m;
                const outp = belege * 2000 * 0.3 / 1_000_000 * TOOLS.openai.gpt4o_mini_output_per_1m;
                llmCost = inp + outp;
                result.items.push({ tool: 'OpenAI GPT-4o-mini', detail: `${belege} Belege × ~2.000 Tokens`, cost: llmCost });
            }
            result.items.push({ tool: 'n8n (unser Server)', detail: 'Automatisierung + Routing', cost: 0 });
            result.items.push({ tool: 'Firebase',            detail: 'Belegspeicher (Free-Tier)', cost: 0 });
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

    komplett_paket: {
        id: 'komplett_paket',
        name: 'Komplett-Paket',
        icon: 'award',
        description: 'Vollständige KI-Infrastruktur: Telefonbot + WhatsApp + Lead Capture + E-Mail-Automation + CRM. Für Kunden die alles wollen.',
        inputs: [
            { id: 'voice_min',  label: 'Telefonminuten / Monat',   type: 'number', default: 300, min: 0, unit: 'Min'   },
            { id: 'wa_convs',   label: 'WhatsApp-Konversationen',  type: 'number', default: 300, min: 0, unit: 'Konvs' },
            { id: 'leads',      label: 'Neue Leads / Monat',       type: 'number', default: 50,  min: 0, unit: 'Leads' },
            { id: 'emails',     label: 'E-Mails / Monat',          type: 'number', default: 500, min: 0, unit: 'Mails' },
        ],
        stacks: ['elevenlabs_allinone'],
        calculate(inputs, stack) {
            const voiceMin = Math.max(0, parseFloat(inputs.voice_min) || 0);
            const waConvs  = Math.max(0, parseFloat(inputs.wa_convs)  || 0);
            const leads    = Math.max(0, parseFloat(inputs.leads)     || 0);
            const emails   = Math.max(0, parseFloat(inputs.emails)    || 0);
            const result   = { items: [], total: 0, plan_recommendation: null };

            // === Telefonbot ===
            const convai   = voiceMin * TOOLS.elevenlabs.convAI_per_min;
            const elevPlan = TOOLS.elevenlabs.plans[1].monthly;
            const twilioIn = voiceMin * TOOLS.twilio.inbound_de;
            const twilioNr = TOOLS.twilio.number_de_local_monthly;
            result.items.push({ tool: '── Telefonbot ──────────────────────', detail: '', cost: null, is_section: true });
            result.items.push({ tool: 'ElevenLabs ConvAI', detail: `${voiceMin} Min × $0.10`, cost: convai });
            result.items.push({ tool: 'ElevenLabs Plan',   detail: 'Creator',                 cost: elevPlan, is_plan: true });
            result.items.push({ tool: 'Twilio (Inbound + Nummer)', detail: `${voiceMin} Min + Festnetz-Nr.`, cost: twilioIn + twilioNr });

            // === WhatsApp ===
            const waRate = TOOLS.whatsapp.utility_per_conv;
            const waCost = waConvs * waRate;
            const waMsgs = waConvs * 3;
            const waLlm  = (waMsgs * TOOLS.openai.avg_tokens_per_message * 0.6 / 1_000_000 * TOOLS.openai.gpt4o_mini_input_per_1m)
                         + (waMsgs * TOOLS.openai.avg_tokens_per_message * 0.4 / 1_000_000 * TOOLS.openai.gpt4o_mini_output_per_1m);
            result.items.push({ tool: '── WhatsApp-Bot ─────────────────────', detail: '', cost: null, is_section: true });
            result.items.push({ tool: 'WhatsApp API (Utility)', detail: `${waConvs} Konvs × $${waRate.toFixed(4)}`, cost: waCost });
            result.items.push({ tool: 'OpenAI (WA-Antworten)',  detail: `${waConvs} Konvs × ~3 Msgs`,              cost: waLlm  });

            // === Lead Capture + CRM ===
            const leadLlm   = (leads * 1000 * 0.7 / 1_000_000 * TOOLS.openai.gpt4o_mini_input_per_1m)
                            + (leads * 1000 * 0.3 / 1_000_000 * TOOLS.openai.gpt4o_mini_output_per_1m);
            const brevoPlan = emails <= 9000 ? TOOLS.brevo.plans[0] : TOOLS.brevo.plans[1];
            result.items.push({ tool: '── Lead Capture & CRM ───────────────', detail: '', cost: null, is_section: true });
            result.items.push({ tool: 'OpenAI (Lead-Analyse)',     detail: `${leads} Leads × ~1.000 Tokens`, cost: leadLlm          });
            result.items.push({ tool: `Brevo (${brevoPlan.name})`, detail: `${emails} E-Mails/Monat`,        cost: brevoPlan.monthly });
            result.items.push({ tool: 'Firebase',                  detail: 'Datenbank (Free-Tier)',           cost: 0                });

            // === Shared ===
            result.items.push({ tool: '── Infrastruktur ────────────────────', detail: '', cost: null, is_section: true });
            result.items.push({ tool: 'n8n (unser Server)', detail: 'Alle Workflows (inklusive)', cost: 0 });

            result.total = convai + elevPlan + twilioIn + twilioNr + waCost + waLlm + leadLlm + brevoPlan.monthly;
            result.plan_recommendation = `ElevenLabs Creator ($${elevPlan}/mo) + Brevo ${brevoPlan.name} — ⚠️ WhatsApp-Preise vor Angebot verifizieren`;
            return result;
        }
    }
};

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
    const margin       = currentMargin < 100 ? currentMargin / 100 : 0.99;
    const customerNetto = currentCostEUR / (1 - margin);
    const profit        = customerNetto - currentCostEUR;

    // Brutto (inkl. 19% MwSt)
    const mwstBetrag    = customerNetto * MwSt;
    const customerBrutto = customerNetto * (1 + MwSt);

    // Einmalkosten Brutto
    const setupBrutto   = currentSetupEUR * (1 + MwSt);

    const cpEl = document.getElementById('customerPrice');
    const prEl = document.getElementById('ourProfit');
    if (cpEl) cpEl.textContent = fmtEUR(customerNetto);
    if (prEl) prEl.textContent = fmtEUR(profit);

    // Netto/MwSt/Brutto Zeilen
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('monthlyNetto',        fmtEUR(customerNetto));
    setEl('mwstBetrag',          fmtEUR(mwstBetrag));
    setEl('customerPriceBrutto', fmtEUR(customerBrutto));

    // Setup-Zeilen (nur anzeigen wenn Setup > 0)
    const setupRow      = document.getElementById('setupMwstRow');
    const setupBruttoR  = document.getElementById('setupBruttoRow');
    const hasSetup      = currentSetupEUR > 0;
    if (setupRow)     setupRow.style.display     = hasSetup ? 'flex' : 'none';
    if (setupBruttoR) setupBruttoR.style.display = hasSetup ? 'flex' : 'none';
    setEl('setupNettoDisplay',  fmtEUR(currentSetupEUR));
    setEl('setupBruttoDisplay', fmtEUR(setupBrutto));
}

// ============================
// EINMALKOSTEN & ANFAHRT
// ============================

function updateSetup() {
    const hourlyRate    = parseFloat(document.getElementById('hourlyRate')?.value)    || 0;
    const hoursKonzept  = parseFloat(document.getElementById('hoursKonzept')?.value)  || 0;
    const hoursDev      = parseFloat(document.getElementById('hoursDev')?.value)      || 0;
    const hoursTesting  = parseFloat(document.getElementById('hoursTesting')?.value)  || 0;

    const stundenkostenNetto = (hoursKonzept + hoursDev + hoursTesting) * hourlyRate;

    // Anfahrt
    let anfahrtNetto = 0;
    const anfahrtEnabled = document.getElementById('anfahrtEnabled')?.checked;
    if (anfahrtEnabled) {
        const km             = parseFloat(document.getElementById('anfahrtKm')?.value)           || 0;
        const kmSatz         = parseFloat(document.getElementById('kmSatz')?.value)              || 0.35;
        const fahrtzeit      = parseFloat(document.getElementById('fahrzeitStunden')?.value)     || 0;
        const uebernachtung  = document.getElementById('uebernachtung')?.checked;

        const kmKosten       = km * 2 * kmSatz;
        const fahrtKosten    = fahrtzeit * 2 * hourlyRate;
        const hotelKosten    = uebernachtung ? 120 : 0;
        anfahrtNetto         = kmKosten + fahrtKosten + hotelKosten;

        // Anfahrt Aufschlüsselung anzeigen
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
    const datum = new Date().toLocaleDateString('de-DE');
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
