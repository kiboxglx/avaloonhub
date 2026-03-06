import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, MapPin, Briefcase, FileText, BarChart2, Video, Plane, Lightbulb,
    Monitor, Mic, Hammer, Wand2, CheckCircle2, Clock, Loader2, Save,
    Palette, TrendingUp, Users, Phone, Mail, Edit3, Trash2, AlertTriangle, Lock
} from "lucide-react";
import { AREA_CONFIG } from "@/components/ui/AreaSelector";
import { dataService } from "@/services/dataService";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { usePermissions } from "@/hooks/usePermissions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ── helpers ───────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
    { id: "Available", label: "Disponível", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { id: "On-Set", label: "Em Gravação", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    { id: "Offline", label: "Offline", color: "text-muted", bg: "bg-slate-500/10 border-slate-500/20" },
];

const STATUS_MAP = { DONE: "Concluído", DOING: "Em Produção", REVIEW: "Revisão", TODO: "A Fazer" };
const STATUS_COLOR = { DONE: "text-emerald-400", DOING: "text-blue-400", REVIEW: "text-orange-400", TODO: "text-muted" };

const getKitIcon = (name = "") => {
    if (name.includes("Camera") || name.includes("Cinema") || name.includes("Sony")) return Video;
    if (name.includes("Drone") || name.includes("DJI") || name.includes("Mavic")) return Plane;
    if (name.includes("Light") || name.includes("Iluminação") || name.includes("Aputure")) return Lightbulb;
    if (name.includes("Edit") || name.includes("Monitor") || name.includes("Mac") || name.includes("Workstation")) return Monitor;
    if (name.includes("Mic") || name.includes("Áudio") || name.includes("Audio") || name.includes("Zoom")) return Mic;
    return Hammer;
};

const AREA_ICON = { VIDEOMAKER: Video, ACCOUNTS: Briefcase, DESIGN: Palette, TRAFFIC: TrendingUp };

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
    { id: "profile", label: "Perfil", icon: Users },
    { id: "demands", label: "Demandas", icon: FileText },
    { id: "history", label: "Produção", icon: BarChart2 },
];

// ── Panel ─────────────────────────────────────────────────────────────────────
export function MemberProfilePanel({ member: initialMember, onClose, onUpdate, onDelete }) {
    const [member, setMember] = useState(initialMember);
    const [tab, setTab] = useState("profile");
    const { can } = usePermissions();
    const canEdit = can("edit_team");
    const canStatus = can("change_team_status");
    const [memberDemands, setMemberDemands] = useState([]);
    const [productionRecords, setProductionRecords] = useState([]);
    const [isLoadingDemands, setIsLoadingDemands] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    // Edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState(null);

    const areaCfg = AREA_CONFIG[member.area || "GENERIC"] || AREA_CONFIG.GENERIC;
    const AreaIcon = AREA_ICON[member.area] || Briefcase;
    const currentStatus = STATUS_OPTIONS.find(s => s.id === member.status) || STATUS_OPTIONS[2];
    const avatarUrl = member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1e1e2d&color=ec5b13&bold=true&size=256`;

    // Load demands when tab switches
    useEffect(() => {
        if (tab === "demands") {
            setIsLoadingDemands(true);
            dataService.demands.getAll()
                .then(data => setMemberDemands((data || []).filter(d => d.profiles?.full_name === member.name || d.assigned_to === member.id)))
                .catch(console.error)
                .finally(() => setIsLoadingDemands(false));
        }
        if (tab === "history") {
            setIsLoadingHistory(true);
            dataService.productionRecords.getByMember(member.id)
                .then(setProductionRecords)
                .catch(console.error)
                .finally(() => setIsLoadingHistory(false));
        }
    }, [tab, member.id, member.name]);

    const handleStatusChange = async (newStatus) => {
        if (!canStatus) return;
        setIsChangingStatus(true);
        setShowStatusMenu(false);
        try {
            await dataService.team.updateStatus(member.id, newStatus);
            const updated = { ...member, status: newStatus };
            setMember(updated);
            if (onUpdate) onUpdate(updated);
        } catch (e) {
            console.error(e);
        } finally {
            setIsChangingStatus(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await dataService.team.delete(member.id);
            if (onDelete) onDelete(member.id);
            onClose();
        } catch (e) {
            console.error(e);
            setIsDeleting(false);
        }
    };

    const openEdit = () => {
        setEditData({
            name: member.name || "",
            role: member.role || "",
            area: member.area || "GENERIC",
            location: member.location || "",
            email: member.email || "",
            phone: member.phone || "",
            avatar_url: member.avatar_url || "",
            specialties: Array.isArray(member.specialties) ? member.specialties.join(", ") : "",
        });
        setIsEditing(true);
        setSaveMsg(null);
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        setSaveMsg(null);
        try {
            const payload = {
                ...editData,
                specialties: editData.specialties.split(",").map(s => s.trim()).filter(Boolean),
            };
            const updated = await dataService.team.update(member.id, payload);
            const merged = { ...member, ...payload, ...updated };
            setMember(merged);
            if (onUpdate) onUpdate(merged);
            setSaveMsg("Salvo com sucesso!");
            setTimeout(() => { setSaveMsg(null); setIsEditing(false); }, 1500);
        } catch (e) {
            setSaveMsg("Erro ao salvar: " + (e.message || "tente novamente."));
        } finally {
            setIsSaving(false);
        }
    };

    const AREA_OPTIONS = [
        { id: "VIDEOMAKER", label: "Videomaker" },
        { id: "DESIGN", label: "Design" },
        { id: "TRAFFIC", label: "Tráfego" },
        { id: "ACCOUNTS", label: "Gerente de Contas" },
        { id: "GENERIC", label: "Geral" },
    ];

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-background/65 backdrop-blur-sm z-40" />

            <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 220 }}
                className="fixed inset-y-0 right-0 w-full max-w-xl bg-background border-l border-border z-50 shadow-2xl flex flex-col"
            >
                {/* Area accent bar */}
                <div className={`h-1 w-full ${areaCfg.dot}`} />

                {/* Header */}
                <div className="p-6 border-b border-border bg-card">
                    <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                            <img src={avatarUrl} alt={member.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#1a1a1a]" />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${member.status === 'Available' ? 'bg-green-500' : member.status === 'On-Set' ? 'bg-red-500' : 'bg-slate-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-main leading-tight">{member.name}</h2>
                            <p className="text-sm text-avaloon-orange font-medium">{member.role}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {/* Status badge — clickable only if permitted */}
                                <div className="relative">
                                    <button
                                        onClick={() => canStatus && setShowStatusMenu(s => !s)}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all ${canStatus ? 'hover:opacity-80 cursor-pointer' : 'cursor-default opacity-70'} ${currentStatus.bg} ${currentStatus.color}`}
                                        title={canStatus ? 'Clique para mudar status' : 'Sem permissão para alterar status'}
                                    >
                                        {isChangingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="w-2 h-2 rounded-full bg-current" />}
                                        {currentStatus.label}
                                    </button>
                                    <AnimatePresence>
                                        {showStatusMenu && (
                                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-2xl z-10 overflow-hidden w-40">
                                                {STATUS_OPTIONS.map(s => (
                                                    <button key={s.id} onClick={() => handleStatusChange(s.id)}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-main/5 transition-colors ${s.color} ${s.id === member.status ? 'bg-main/5' : ''}`}>
                                                        <span className="w-2 h-2 rounded-full bg-current" />{s.label}
                                                        {s.id === member.status && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {/* Area badge */}
                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold ${areaCfg.bgColor} ${areaCfg.textColor}`}>
                                    <AreaIcon className="w-3 h-3" />{areaCfg.label}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            {canEdit && (
                                <button onClick={openEdit}
                                    className="p-2 hover:bg-avaloon-orange/10 rounded-xl text-dim hover:text-avaloon-orange transition-colors" title="Editar dados do membro">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            )}
                            {canEdit ? (
                                <button onClick={() => setShowDeleteConfirm(true)}
                                    className="p-2 hover:bg-red-500/10 rounded-xl text-slate-600 hover:text-red-400 transition-colors" title="Remover membro">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            ) : (
                                <div className="p-2 text-slate-700" title="Sem permissão de edição">
                                    <Lock className="w-4 h-4" />
                                </div>
                            )}
                            <button onClick={onClose} className="p-2 hover:bg-main/10 rounded-xl text-muted hover:text-main transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Contact info */}
                    {(member.email || member.phone || member.location) && (
                        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border">
                            {member.location && <span className="flex items-center gap-1 text-xs text-muted"><MapPin className="w-3 h-3" />{member.location}</span>}
                            {member.email && <span className="flex items-center gap-1 text-xs text-muted"><Mail className="w-3 h-3" />{member.email}</span>}
                            {member.phone && <span className="flex items-center gap-1 text-xs text-muted"><Phone className="w-3 h-3" />{member.phone}</span>}
                        </div>
                    )}

                    {/* Tab bar */}
                    <div className="flex gap-1 mt-4">
                        {TABS.map(t => {
                            const Icon = t.icon;
                            return (
                                <button key={t.id} onClick={() => setTab(t.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t.id ? "bg-avaloon-orange/20 text-avaloon-orange" : "text-dim hover:text-main hover:bg-main/5"}`}>
                                    <Icon className="w-3.5 h-3.5" />{t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* ── PERFIL ── */}
                    {tab === "profile" && (
                        <div className="space-y-5">
                            {/* Specialties */}
                            {(member.specialties || []).length > 0 && (
                                <div className="bg-card border border-border rounded-xl p-4">
                                    <p className="text-xs font-bold text-dim uppercase mb-3">Especialidades</p>
                                    <div className="flex flex-wrap gap-2">
                                        {member.specialties.map((s, i) => (
                                            <span key={i} className="px-2.5 py-1 rounded-lg bg-[#1f1f1f] text-xs text-main border border-main/5">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Kit */}
                            {(member.kit || []).length > 0 && (
                                <div className="bg-card border border-border rounded-xl p-4">
                                    <p className="text-xs font-bold text-dim uppercase mb-3">Equipamentos</p>
                                    <div className="space-y-2">
                                        {member.kit.map((k, i) => {
                                            const Icon = getKitIcon(k.name || k);
                                            return (
                                                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                                    <Icon className="w-4 h-4 text-avaloon-orange flex-shrink-0" />
                                                    <span>{k.name || k}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Stats quick view */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: "Área", value: areaCfg.label, color: areaCfg.textColor },
                                    { label: "Status", value: currentStatus.label, color: currentStatus.color },
                                    { label: "Telefone", value: member.phone || "—", color: "text-slate-300" },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-dim uppercase font-bold mb-1">{label}</p>
                                        <p className={`text-sm font-bold ${color}`}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── DEMANDAS ── */}
                    {tab === "demands" && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-bold text-main">Demandas do Membro</p>
                                <span className="text-xs text-dim">{memberDemands.filter(d => d.status !== 'DONE').length} em aberto</span>
                            </div>
                            {isLoadingDemands ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-avaloon-orange" /></div>
                            ) : memberDemands.length === 0 ? (
                                <div className="text-center py-10 border border-dashed border-border rounded-xl text-dim">
                                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Nenhuma demanda atribuída.</p>
                                </div>
                            ) : (
                                memberDemands.map(d => {
                                    const areaCfg = AREA_CONFIG[d.area || "GENERIC"] || AREA_CONFIG.GENERIC;
                                    return (
                                        <div key={d.id} className="bg-card border border-border rounded-xl p-4 hover:border-white/10 transition-colors">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`w-2 h-2 rounded-full ${areaCfg.dot}`} />
                                                        <span className={`text-[10px] font-bold ${areaCfg.textColor}`}>{areaCfg.label}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-main truncate">{d.title}</p>
                                                    <p className="text-xs text-dim">{d.clients?.name || "—"}</p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${STATUS_COLOR[d.status] || "text-muted"}`}>
                                                    {STATUS_MAP[d.status] || d.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* ── HISTORICAL PRODUCTION ── */}
                    {tab === "history" && (
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-main">Histórico de Produção Mensal</p>
                            {isLoadingHistory ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-avaloon-orange" /></div>
                            ) : productionRecords.length === 0 ? (
                                <div className="text-center py-10 border border-dashed border-border rounded-xl text-dim">
                                    <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Sem registros de produção ainda.</p>
                                </div>
                            ) : (
                                productionRecords.map(r => (
                                    <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-main">{r.month_year}</p>
                                            <p className="text-xs text-dim">{r.drive_link ? "Drive vinculado" : "Sem Drive"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-avaloon-orange">{r.file_count}</p>
                                            <p className="text-[10px] text-dim uppercase font-bold">arquivos</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Delete confirm overlay */}
                <AnimatePresence>
                    {showDeleteConfirm && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center p-8 z-20">
                            <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
                            <h3 className="text-xl font-bold text-main mb-2">Remover Membro?</h3>
                            <p className="text-muted text-center text-sm mb-6">Esta ação é irreversível. <strong className="text-main">{member.name}</strong> será removido permanentemente da equipe.</p>
                            <div className="flex gap-3 w-full">
                                <ButtonAvaloon variant="tertiary" className="flex-1 justify-center" onClick={() => setShowDeleteConfirm(false)}>Cancelar</ButtonAvaloon>
                                <ButtonAvaloon variant="secondary" className="flex-1 justify-center !border-red-500/50 !text-red-400" onClick={handleDelete} disabled={isDeleting}>
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Remover
                                </ButtonAvaloon>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit overlay */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                            className="absolute inset-0 bg-background z-20 flex flex-col">
                            {/* Edit header */}
                            <div className="flex items-center justify-between p-5 border-b border-border bg-card">
                                <div>
                                    <h3 className="text-lg font-bold text-main">Editar Membro</h3>
                                    <p className="text-xs text-dim">{member.name}</p>
                                </div>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-main/10 rounded-xl text-muted hover:text-main">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Edit form */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {/* Avatar preview */}
                                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                                    <img
                                        src={editData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(editData.name || member.name)}&background=1e1e2d&color=ec5b13&bold=true&size=128`}
                                        className="w-12 h-12 rounded-xl object-cover"
                                        alt="preview"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-main">{editData.name || "—"}</p>
                                        <p className="text-xs text-avaloon-orange">{editData.role || "—"}</p>
                                    </div>
                                </div>

                                {[
                                    { key: "name", label: "Nome Completo", placeholder: "Ex: Carlos Andrade" },
                                    { key: "role", label: "Cargo / Função", placeholder: "Ex: Videomaker" },
                                    { key: "email", label: "Email", placeholder: "email@agencia.com", type: "email" },
                                    { key: "phone", label: "Telefone / WhatsApp", placeholder: "(55) 99999-9999" },
                                    { key: "location", label: "Localização", placeholder: "Ex: São Paulo" },
                                    { key: "avatar_url", label: "Foto (URL)", placeholder: "https://..." },
                                ].map(({ key, label, placeholder, type = "text" }) => (
                                    <div key={key}>
                                        <label className="block text-xs font-bold text-muted uppercase mb-1.5">{label}</label>
                                        <input
                                            type={type}
                                            value={editData[key]}
                                            onChange={e => setEditData(d => ({ ...d, [key]: e.target.value }))}
                                            placeholder={placeholder}
                                            className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none transition-colors"
                                        />
                                    </div>
                                ))}

                                {/* Area */}
                                <div>
                                    <label className="block text-xs font-bold text-muted uppercase mb-1.5">Área</label>
                                    <select value={editData.area}
                                        onChange={e => setEditData(d => ({ ...d, area: e.target.value }))}
                                        className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none">
                                        {AREA_OPTIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                                    </select>
                                </div>

                                {/* Specialties */}
                                <div>
                                    <label className="block text-xs font-bold text-muted uppercase mb-1.5">Especialidades</label>
                                    <input
                                        type="text"
                                        value={editData.specialties}
                                        onChange={e => setEditData(d => ({ ...d, specialties: e.target.value }))}
                                        placeholder="Ex: Drone, Edição, Color Grading (separadas por vírgula)"
                                        className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none"
                                    />
                                </div>

                                {/* Save feedback */}
                                {saveMsg && (
                                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${saveMsg.startsWith("Erro") ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        }`}>
                                        {saveMsg.startsWith("Erro") ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                        {saveMsg}
                                    </div>
                                )}
                            </div>

                            {/* Edit footer */}
                            <div className="p-5 border-t border-border bg-card flex gap-3">
                                <ButtonAvaloon variant="outline" className="flex-1 justify-center" onClick={() => setIsEditing(false)}>
                                    Cancelar
                                </ButtonAvaloon>
                                <ButtonAvaloon variant="primary" className="flex-1 justify-center" onClick={handleSaveEdit} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Salvar Alterações
                                </ButtonAvaloon>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}
