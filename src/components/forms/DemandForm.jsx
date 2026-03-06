import { useState, useEffect, useRef } from "react";
import { dataService } from "@/services/dataService";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { useAuth } from "@/context/AuthContext";
import {
    X, Calendar, Clock, Save, Loader2, MapPin, Users, DollarSign,
    Target, Smartphone, FileText, AlertCircle, Flame, Minus, ChevronDown,
    CheckCircle2, AlertTriangle
} from "lucide-react";
import { AREA_CONFIG } from "@/components/ui/AreaSelector";
import { logger } from "@/utils/logger";

// ── Priority picker ───────────────────────────────────────────────────────────
const PRIORITIES = [
    { id: "Low", label: "Baixa", icon: Minus, color: "text-muted", bg: "bg-slate-500/10 border-slate-500/30" },
    { id: "Medium", label: "Média", icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
    { id: "High", label: "Alta", icon: Flame, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
];

function PriorityPicker({ value, onChange }) {
    return (
        <div className="flex gap-2">
            {PRIORITIES.map(p => {
                const Icon = p.icon;
                const active = value === p.id;
                return (
                    <button key={p.id} type="button" onClick={() => onChange(p.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-bold transition-all ${active ? `${p.bg} ${p.color}` : "bg-card border-border text-dim hover:text-main"}`}>
                        <Icon className="w-3.5 h-3.5" />{p.label}
                    </button>
                );
            })}
        </div>
    );
}

// ── Area-specific fields (unchanged) ─────────────────────────────────────────
function VideomakerFields({ data, onChange }) {
    const cls = "w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-red-500 outline-none";
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> Local da Gravação</label>
                <input type="text" className={cls} placeholder="Ex: Estúdio Avaloon..." value={data.location || ""} onChange={e => onChange({ ...data, location: e.target.value })} />
            </div>
            <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><FileText className="w-3 h-3" /> Tipo de Produção</label>
                <select className={cls} value={data.production_type || "MEDIA_DAY"} onChange={e => onChange({ ...data, production_type: e.target.value })}>
                    <option value="MEDIA_DAY">Media Day</option>
                    <option value="GRAVACAO">Gravação Simples</option>
                    <option value="EDICAO">Edição / Pós-Produção</option>
                    <option value="TRANSMISSAO">Transmissão ao Vivo</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Duração Estimada</label>
                <select className={cls} value={data.duration_hours || 1} onChange={e => onChange({ ...data, duration_hours: Number(e.target.value) })}>
                    <option value={1}>1 Hora</option>
                    <option value={2}>2 Horas</option>
                    <option value={3}>3 Horas</option>
                    <option value={4}>4 Horas (Meia Diária)</option>
                    <option value={8}>8 Horas (Diária Completa)</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><Users className="w-3 h-3" /> Equipe / Equipamentos</label>
                <textarea className={`${cls} h-20 resize-none`} placeholder="Ex: João (Câmera), Maria (Drone)..." value={data.crew_notes || ""} onChange={e => onChange({ ...data, crew_notes: e.target.value })} />
            </div>
        </div>
    );
}

function AccountsFields({ data, onChange }) {
    const cls = "w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-purple-500 outline-none";
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><FileText className="w-3 h-3" /> Tipo de Reunião</label>
                <select className={cls} value={data.meeting_type || "ALINHAMENTO"} onChange={e => onChange({ ...data, meeting_type: e.target.value })}>
                    <option value="ALINHAMENTO">Alinhamento Mensal</option>
                    <option value="APRESENTACAO">Apresentação de Resultados</option>
                    <option value="ONBOARDING">Onboarding de Cliente</option>
                    <option value="FOLLOWUP">Follow-up</option>
                    <option value="RENOVACAO">Renovação de Contrato</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><Users className="w-3 h-3" /> Participantes</label>
                <input type="text" className={cls} placeholder="Ex: Ana (Contas), Carlos (Cliente)..." value={data.participants || ""} onChange={e => onChange({ ...data, participants: e.target.value })} />
            </div>
            <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><FileText className="w-3 h-3" /> Pauta / Objetivos</label>
                <textarea className={`${cls} h-20 resize-none`} placeholder="Tópicos a discutir..." value={data.agenda || ""} onChange={e => onChange({ ...data, agenda: e.target.value })} />
            </div>
        </div>
    );
}

function DesignFields({ data, onChange }) {
    const cls = "w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-green-500 outline-none";
    const platforms = ["Instagram", "TikTok", "LinkedIn", "Facebook", "YouTube", "Pinterest", "Outro"];
    const formats = ["Post Feed", "Stories", "Reels/TikTok", "Carrossel", "Banner", "Thumbnail", "Identidade Visual"];
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><Smartphone className="w-3 h-3" /> Plataforma</label>
                    <select className={cls} value={data.platform || "Instagram"} onChange={e => onChange({ ...data, platform: e.target.value })}>
                        {platforms.map(p => <option key={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><FileText className="w-3 h-3" /> Formato</label>
                    <select className={cls} value={data.format || "Post Feed"} onChange={e => onChange({ ...data, format: e.target.value })}>
                        {formats.map(f => <option key={f}>{f}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><FileText className="w-3 h-3" /> Briefing da Arte</label>
                <textarea className={`${cls} h-20 resize-none`} placeholder="Estilo, cores, referências visuais..." value={data.design_brief || ""} onChange={e => onChange({ ...data, design_brief: e.target.value })} />
            </div>
        </div>
    );
}

function TrafficFields({ data, onChange }) {
    const cls = "w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-blue-500 outline-none";
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><Smartphone className="w-3 h-3" /> Plataforma de Ads</label>
                    <select className={cls} value={data.ads_platform || "Meta Ads"} onChange={e => onChange({ ...data, ads_platform: e.target.value })}>
                        {["Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads", "Pinterest Ads"].map(p => <option key={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Verba (R$)</label>
                    <input type="number" min={0} className={cls} placeholder="0,00" value={data.budget || ""} onChange={e => onChange({ ...data, budget: e.target.value })} />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><Target className="w-3 h-3" /> Objetivo</label>
                <select className={cls} value={data.campaign_objective || "ALCANCE"} onChange={e => onChange({ ...data, campaign_objective: e.target.value })}>
                    {[["ALCANCE", "Alcance / Reconhecimento"], ["ENGAJAMENTO", "Engajamento"], ["TRAFEGO", "Tráfego para Site"], ["CONVERSAO", "Conversão / Vendas"], ["LEADS", "Geração de Leads"], ["AB_TEST", "Teste A/B"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><FileText className="w-3 h-3" /> Observações</label>
                <textarea className={`${cls} h-20 resize-none`} placeholder="Público-alvo, KPIs esperados..." value={data.campaign_notes || ""} onChange={e => onChange({ ...data, campaign_notes: e.target.value })} />
            </div>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function DemandForm({ onClose, onSuccess, area = "GENERIC", type = "GENERIC" }) {
    const { teamMemberId, teamMember } = useAuth();
    const [clients, setClients] = useState([]);
    const [services, setServices] = useState([]);
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [areaData, setAreaData] = useState({});

    // ── Abort Controller to prevent ghost requests on unmount ──────────────
    const abortControllerRef = useRef(new AbortController());

    const areaConfig = AREA_CONFIG[area] || AREA_CONFIG.GENERIC;

    const [formData, setFormData] = useState({
        title: "",
        client_id: "",
        service_id: "",
        scheduled_date: "",
        scheduled_time: "",
        briefing_notes: "",
        priority: "Medium",
        assigned_to: teamMemberId || "",
    });

    const set = (k, v) => setFormData(f => ({ ...f, [k]: v }));

    useEffect(() => {
        const controller = abortControllerRef.current;

        async function loadOptions() {
            try {
                const [c, s, m] = await Promise.all([
                    dataService.clients.getAll(),
                    dataService.services.getAll(),
                    dataService.team.getAll(),
                ]);
                setClients(c || []);
                setServices(s || []);
                setMembers(m || []);

                if (teamMemberId && !formData.assigned_to) {
                    set("assigned_to", teamMemberId);
                }
            } catch (e) {
                // Only log if it's NOT an abort error
                if (e.name !== 'AbortError') {
                    logger.error('FALHA_CARREGAR_OPCOES_DEMANDA', 'Falha ao carregar opções do select', { error: e.message }, teamMemberId);
                }
            } finally {
                setIsLoading(false);
            }
        }

        loadOptions();

        return () => {
            // Cancel any in-flight requests when component unmounts
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e) => {
        // 1. Prevent native form reload and double submission
        if (e) e.preventDefault();
        if (isSubmitting) return;

        // Basic validation before starting heavy logic
        if (!formData.title.trim() || !formData.client_id) {
            setError("Por favor, preencha o título e selecione um cliente.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const signal = abortControllerRef.current.signal;

        try {
            const fullDate = new Date(
                `${formData.scheduled_date}T${formData.scheduled_time || "09:00"}`
            );

            // 2. Conflict Check (Before Creation)
            // Decoupled from unmount signal to prevent AbortError if component closes while processing
            const duration = areaData.duration_hours || 1;
            if (formData.assigned_to && formData.scheduled_date && formData.scheduled_time) {
                try {
                    const conf = await dataService.demands.checkConflict(
                        formData.assigned_to,
                        formData.scheduled_date,
                        formData.scheduled_time,
                        duration,
                        null // No signal for user-triggered submission
                    );

                    if (conf && conf.conflict) {
                        setError(`Conflito de Agenda: O membro já possui uma demanda ("${conf.conflictingDemand.title}") agendada das ${conf.existingStart} às ${conf.existingEnd}.`);
                        setIsSubmitting(false);
                        return;
                    }
                } catch (confErr) {
                    // Ignore abort errors even if they happen locally
                    if (confErr.name === 'AbortError' || confErr.message?.includes('aborted')) return;
                    throw confErr; // Propagate real database/logic errors
                }
            }

            // 3. Payload Construction
            const isAssignedToOther = formData.assigned_to && formData.assigned_to !== teamMemberId;
            const notificationData = {
                created_by: teamMemberId,
                is_accepted: isAssignedToOther ? false : true
            };

            const payloadForRpc = {
                p_title: formData.title,
                p_client_id: formData.client_id,
                p_assigned_to: formData.assigned_to || null,
                p_scheduled_at: formData.scheduled_date ? fullDate.toISOString() : null,
                p_duration_hours: duration,
                p_area: area,
                p_type: type,
                p_priority: formData.priority,
                p_status: "TODO",
                p_briefing_data: {
                    notes: formData.briefing_notes,
                    ...areaData,
                    ...notificationData,
                    created_by_name: teamMember?.name || null,
                },
            };

            // 4. Secure Creation via RPC
            // Decoupled from unmount signal
            const newDemand = await dataService.demands.createSafely(payloadForRpc, null);

            // 5. Success Flow
            logger.info('DEMANDA_CRIADA', `Demanda criada com sucesso na área ${area}`, {
                demand_id: newDemand?.id,
                title: formData.title
            }, teamMemberId);

            if (onSuccess) onSuccess();
            if (onClose) onClose();

        } catch (err) {
            // Silence AbortErrors (browser native or manual)
            if (err.name === 'AbortError' || err.message?.includes('aborted')) {
                console.log("[DemandForm] Submission decoupled/finished silently or aborted.");
                return;
            }

            // Real errors logging
            logger.error('FALHA_CRIACAO_DEMANDA', 'Falha ao processar ou salvar a demanda no banco', {
                error: err.message || err.toString(),
                code: err.code
            }, teamMemberId);

            if (err.message && err.message.includes('SCHEDULING_CONFLICT')) {
                setError("Conflito de Agenda: O profissional selecionado já possui um agendamento neste horário.");
            } else {
                setError(err.message || "Erro ao criar demanda. Verifique sua conexão.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = "w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none transition-colors";

    const TITLE_PLACEHOLDER = {
        VIDEOMAKER: "Ex: Media Day - Cliente XYZ",
        ACCOUNTS: "Ex: Reunião de Alinhamento - Março",
        DESIGN: "Ex: Post Semana 1 - Instagram",
        TRAFFIC: "Ex: Campanha Black Friday - Meta Ads",
    }[area] || "Título da demanda...";

    return (
        <div className="flex flex-col h-full bg-background text-main">
            {/* Top accent */}
            <div className={`h-1 w-full ${areaConfig.dot || "bg-avaloon-orange"}`} />

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${areaConfig.bgColor} ${areaConfig.textColor}`}>
                        {areaConfig.label}
                    </span>
                    <h2 className="text-lg font-bold text-main">Nova Demanda</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-main/10 rounded-xl text-muted hover:text-main">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-avaloon-orange" />
                    </div>
                ) : (
                    <form id="demand-form" onSubmit={handleSubmit} className="space-y-4">

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase mb-1.5">Título *</label>
                            <input required type="text" className={inputCls} placeholder={TITLE_PLACEHOLDER}
                                value={formData.title} onChange={e => set("title", e.target.value)} />
                        </div>

                        {/* Client & Service */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-1.5">Cliente *</label>
                                <select required className={inputCls} value={formData.client_id} onChange={e => set("client_id", e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-1.5">Serviço</label>
                                <select className={inputCls} value={formData.service_id} onChange={e => set("service_id", e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Data</label>
                                <input type="date" className={inputCls} value={formData.scheduled_date} onChange={e => set("scheduled_date", e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Horário</label>
                                <input type="time" className={inputCls} value={formData.scheduled_time} onChange={e => set("scheduled_time", e.target.value)} />
                            </div>
                        </div>

                        {/* Prioridade */}
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase mb-1.5">Prioridade</label>
                            <PriorityPicker value={formData.priority} onChange={v => set("priority", v)} />
                        </div>

                        {/* Responsável */}
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-1"><Users className="w-3 h-3" /> Responsável</label>
                            <select className={inputCls} value={formData.assigned_to} onChange={e => set("assigned_to", e.target.value)}>
                                <option value="">— Sem responsável —</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} {m.area ? `(${m.area})` : ""}</option>
                                ))}
                            </select>
                        </div>

                        {/* Area-specific fields */}
                        {area !== "GENERIC" && (
                            <div className={`border rounded-xl p-4 ${areaConfig.bgColor || "bg-main/5"}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${areaConfig.textColor}`}>
                                    Detalhes de {areaConfig.label}
                                </p>
                                {area === "VIDEOMAKER" && <VideomakerFields data={areaData} onChange={setAreaData} />}
                                {area === "ACCOUNTS" && <AccountsFields data={areaData} onChange={setAreaData} />}
                                {area === "DESIGN" && <DesignFields data={areaData} onChange={setAreaData} />}
                                {area === "TRAFFIC" && <TrafficFields data={areaData} onChange={setAreaData} />}
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase mb-1.5">Observações Gerais</label>
                            <textarea className={`${inputCls} h-20 resize-none`} placeholder="Informações adicionais..."
                                value={formData.briefing_notes} onChange={e => set("briefing_notes", e.target.value)} />
                        </div>

                        {/* Error banner */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                            </div>
                        )}
                    </form>
                )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-border bg-card">
                <ButtonAvaloon type="submit" form="demand-form" variant="primary" className="w-full justify-center" disabled={isSubmitting || isLoading}>
                    {isSubmitting
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</>
                        : <><Save className="w-4 h-4" /> Criar Demanda</>
                    }
                </ButtonAvaloon>
            </div>
        </div>
    );
}
