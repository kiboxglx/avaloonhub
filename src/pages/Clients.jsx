import { useState, useEffect, useCallback } from "react";
import { dataService } from "@/services/dataService";
import { googleDriveService } from "@/services/googleDriveService";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { AREA_CONFIG } from "@/components/ui/AreaSelector";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import {
    Plus, Search, Folder, Star, X, ExternalLink, Save, HardDrive,
    Instagram, Facebook, Linkedin, Youtube, Globe, Users, FileText,
    StickyNote, RefreshCw, Loader2, CheckCircle2, AlertTriangle,
    Briefcase, TrendingUp, Video, Palette, DollarSign, Clock, Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ClientForm } from "@/components/forms/ClientForm";

// ── Helpers ──────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const isAtivo = status === "Ativo";
    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${isAtivo ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"}`}>
            <span className={`relative flex h-2 w-2`}>
                {isAtivo && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isAtivo ? "bg-green-500" : "bg-yellow-500"}`} />
            </span>
            {status || "Ativo"}
        </div>
    );
};

const SocialIcon = ({ platform }) => {
    const icons = { Instagram: Instagram, Facebook: Facebook, LinkedIn: Linkedin, YouTube: Youtube };
    const Icon = icons[platform] || Globe;
    return <Icon className="w-4 h-4" />;
};

const TIER_COLORS = {
    Black: "bg-zinc-900/80 text-zinc-300 border-zinc-700",
    Premium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    MID: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Padrão: "bg-slate-500/20 text-muted border-slate-500/30",
};

const STATUS_LABELS = { TODO: "A Fazer", DOING: "Em Produção", REVIEW: "Revisão", DONE: "Concluído" };
const STATUS_COLORS = { TODO: "text-muted bg-slate-500/10", DOING: "text-blue-400 bg-blue-500/10", REVIEW: "text-orange-400 bg-orange-500/10", DONE: "text-emerald-400 bg-emerald-500/10" };

// ── Client Panel (slide-in) ───────────────────────────────────────────────────
function ClientPanel({ client, onClose, onUpdate }) {
    const [tab, setTab] = useState("overview"); // overview | demands | drive | social | notes
    const [editDriveLink, setEditDriveLink] = useState(client.drive_link || "");
    const [notes, setNotes] = useState(client.notes || "");
    const [clientDemands, setClientDemands] = useState([]);
    const [isLoadingDemands, setIsLoadingDemands] = useState(false);
    const [isCountingFiles, setIsCountingFiles] = useState(false);
    const [driveCount, setDriveCount] = useState(null);
    const [driveError, setDriveError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState(null);

    const logoUrl = client.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=1e1e2d&color=ec5b13&bold=true&size=128`;

    // Load demands for this client
    useEffect(() => {
        if (tab === "demands") {
            setIsLoadingDemands(true);
            dataService.demands.getAll()
                .then(data => setClientDemands((data || []).filter(d => d.client_id === client.id)))
                .catch(console.error)
                .finally(() => setIsLoadingDemands(false));
        }
    }, [tab, client.id]);

    const saveField = async (field, value) => {
        setIsSaving(true);
        setSaveMsg(null);
        try {
            await dataService.clients.update(client.id, { [field]: value });
            setSaveMsg("Salvo!");
            setTimeout(() => setSaveMsg(null), 2000);
            if (onUpdate) onUpdate({ ...client, [field]: value });
        } catch (e) {
            setSaveMsg("Erro ao salvar.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDrive = () => saveField("drive_link", editDriveLink);
    const handleSaveNotes = () => saveField("notes", notes);

    const handleCountDriveFiles = async () => {
        if (!editDriveLink) return;
        setIsCountingFiles(true);
        setDriveCount(null);
        setDriveError(null);
        try {
            const count = await googleDriveService.getFileCount(editDriveLink);
            setDriveCount(count);
        } catch (e) {
            setDriveError(e.message || "Erro ao contar arquivos.");
        } finally {
            setIsCountingFiles(false);
        }
    };

    const handleUpdateSocials = async (newAccounts) => {
        try {
            await dataService.clients.update(client.id, { social_accounts: newAccounts });
            if (onUpdate) onUpdate({ ...client, social_accounts: newAccounts });
        } catch (e) {
            console.error(e);
        }
    };

    const monthlyValue = typeof client.monthly_value === 'number'
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthly_value)
        : "—";

    const TABS = [
        { id: "overview", label: "Visão Geral", icon: Briefcase },
        { id: "demands", label: "Demandas", icon: FileText },
        { id: "drive", label: "Drive", icon: HardDrive },
        { id: "social", label: "Redes", icon: Users },
        { id: "notes", label: "Notas", icon: StickyNote },
    ];

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-background/65 backdrop-blur-sm z-40" />
            <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 220 }}
                className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background border-l border-border z-50 shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-border bg-card">
                    <div className="flex items-start gap-4">
                        <img src={logoUrl} alt={client.name} className="w-14 h-14 rounded-xl object-cover ring-2 ring-[#1a1a1a]" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h2 className="text-xl font-bold text-main">{client.name}</h2>
                                <StatusBadge status={client.status} />
                                {client.tier && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${TIER_COLORS[client.tier] || TIER_COLORS.Padrão}`}>{client.tier}</span>
                                )}
                            </div>
                            <p className="text-sm text-muted">{client.sector}</p>
                            <p className="text-sm font-bold text-avaloon-orange">{monthlyValue}<span className="text-dim font-normal">/mês</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                            {saveMsg && <span className="text-xs text-emerald-400 font-bold">{saveMsg}</span>}
                            <button onClick={onClose} className="p-2 hover:bg-main/10 rounded-full text-muted hover:text-main transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tab bar */}
                    <div className="flex gap-1 mt-4 overflow-x-auto">
                        {TABS.map(t => {
                            const Icon = t.icon;
                            return (
                                <button key={t.id} onClick={() => setTab(t.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${tab === t.id ? "bg-avaloon-orange/20 text-avaloon-orange" : "text-dim hover:text-main hover:bg-main/5"}`}>
                                    <Icon className="w-3.5 h-3.5" /> {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* ── OVERVIEW ── */}
                    {tab === "overview" && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: "Artes (Mês)", value: client.filesCount || 0, icon: Palette, color: "text-green-400" },
                                    { label: "Valor Mensal", value: monthlyValue, icon: DollarSign, color: "text-avaloon-orange" },
                                    { label: "Status", value: client.status || "Ativo", icon: CheckCircle2, color: "text-blue-400" },
                                    { label: "Tier", value: client.tier || "—", icon: Star, color: "text-yellow-400" },
                                ].map(({ label, value, icon: Icon, color }) => (
                                    <div key={label} className="bg-card border border-border rounded-xl p-4">
                                        <div className={`flex items-center gap-2 mb-2 ${color}`}><Icon className="w-4 h-4" /><span className="text-xs font-bold text-dim uppercase">{label}</span></div>
                                        <p className="text-xl font-black text-main">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Quick action buttons */}
                            <div className="flex gap-3">
                                <ButtonAvaloon variant="outline" className="flex-1 justify-center" onClick={() => setTab("demands")}>
                                    <FileText className="w-4 h-4" /> Ver Demandas
                                </ButtonAvaloon>
                                <ButtonAvaloon variant="outline" className="flex-1 justify-center" onClick={() => setTab("drive")}>
                                    <HardDrive className="w-4 h-4" /> Abrir Drive
                                </ButtonAvaloon>
                            </div>

                            {/* Social accounts quick view */}
                            {(client.social_accounts || []).length > 0 && (
                                <div className="bg-card border border-border rounded-xl p-4">
                                    <p className="text-xs font-bold text-dim uppercase mb-3">Redes Conectadas</p>
                                    <div className="flex flex-wrap gap-2">
                                        {client.social_accounts.map((acc, i) => (
                                            <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-[#1f1f1f] border border-border rounded-lg text-xs text-slate-300">
                                                <SocialIcon platform={acc.platform} />
                                                {acc.username || acc.platform}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── DEMANDS ── */}
                    {tab === "demands" && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-main">Demandas Ativas</p>
                                <span className="text-xs text-dim">{clientDemands.filter(d => d.status !== 'DONE').length} em aberto</span>
                            </div>
                            {isLoadingDemands ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-avaloon-orange" /></div>
                            ) : clientDemands.length === 0 ? (
                                <div className="text-center py-10 text-dim border border-dashed border-border rounded-xl">
                                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p>Nenhuma demanda para este cliente.</p>
                                </div>
                            ) : (
                                clientDemands.map(d => {
                                    const areaCfg = AREA_CONFIG[d.area || "GENERIC"] || AREA_CONFIG.GENERIC;
                                    const statusColor = STATUS_COLORS[d.status] || STATUS_COLORS.TODO;
                                    return (
                                        <div key={d.id} className="bg-card border border-border rounded-xl p-4 hover:border-white/10 transition-colors">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${areaCfg.dot}`} />
                                                        <span className={`text-[10px] font-bold ${areaCfg.textColor}`}>{areaCfg.label}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-main truncate">{d.title}</p>
                                                    {d.scheduled_at && (
                                                        <p className="text-xs text-dim flex items-center gap-1 mt-0.5">
                                                            <Clock className="w-3 h-3" /> {new Date(d.scheduled_at).toLocaleDateString("pt-BR")}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor}`}>
                                                    {STATUS_LABELS[d.status] || d.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* ── DRIVE ── */}
                    {tab === "drive" && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-dim uppercase mb-2 block">Link da Pasta Google Drive</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={editDriveLink}
                                        onChange={e => setEditDriveLink(e.target.value)}
                                        placeholder="https://drive.google.com/drive/folders/..."
                                        className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-main focus:border-avaloon-orange outline-none"
                                    />
                                    <ButtonAvaloon variant="primary" onClick={handleSaveDrive} disabled={isSaving}>
                                        <Save className="w-4 h-4" />
                                    </ButtonAvaloon>
                                    {editDriveLink && (
                                        <a href={editDriveLink} target="_blank" rel="noreferrer">
                                            <ButtonAvaloon variant="outline"><ExternalLink className="w-4 h-4" /></ButtonAvaloon>
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* File counter */}
                            <div className="bg-card border border-border rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-bold text-main flex items-center gap-2"><FileText className="w-4 h-4 text-green-400" /> Contagem de Arquivos</p>
                                    <ButtonAvaloon variant="outline" className="h-8 text-xs" onClick={handleCountDriveFiles} disabled={isCountingFiles || !editDriveLink}>
                                        {isCountingFiles ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                        {isCountingFiles ? "Contando..." : "Contar"}
                                    </ButtonAvaloon>
                                </div>
                                {driveCount !== null && (
                                    <p className="text-3xl font-black text-emerald-400">{driveCount} <span className="text-sm font-normal text-dim">arquivos encontrados</span></p>
                                )}
                                {driveError && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm"><AlertTriangle className="w-4 h-4" /> {driveError}</div>
                                )}
                                {driveCount === null && !driveError && (
                                    <p className="text-sm text-dim">Clique em "Contar" para checar o Drive.</p>
                                )}
                            </div>

                            {/* Drive iframe preview */}
                            {editDriveLink && (
                                <div className="border border-border rounded-xl overflow-hidden aspect-video">
                                    <iframe src={editDriveLink} className="w-full h-full border-none" title="Drive" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── SOCIAL ── */}
                    {tab === "social" && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-bold text-main">Credenciais & Redes Sociais</p>
                                <ButtonAvaloon variant="outline" className="h-8 text-xs" onClick={() => {
                                    const newAcc = { id: Date.now(), platform: "Instagram", username: "", password: "" };
                                    handleUpdateSocials([...(client.social_accounts || []), newAcc]);
                                }}>
                                    <Plus className="w-3 h-3" /> Adicionar
                                </ButtonAvaloon>
                            </div>
                            {(client.social_accounts || []).length === 0 && (
                                <div className="text-center py-8 border border-dashed border-border rounded-xl text-dim text-sm">Nenhuma conta vinculada.</div>
                            )}
                            {(client.social_accounts || []).map((acc, idx) => (
                                <div key={acc.id || idx} className="bg-card border border-border rounded-xl p-4 relative">
                                    <button onClick={() => handleUpdateSocials(client.social_accounts.filter(a => a.id !== acc.id))}
                                        className="absolute top-3 right-3 p-1 text-slate-600 hover:text-red-400 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                        <div>
                                            <label className="text-[10px] text-dim uppercase font-bold">Plataforma</label>
                                            <select className="w-full mt-1 bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-main focus:border-avaloon-orange outline-none"
                                                value={acc.platform}
                                                onChange={e => {
                                                    const updated = client.social_accounts.map(a => a.id === acc.id ? { ...a, platform: e.target.value } : a);
                                                    handleUpdateSocials(updated);
                                                }}>
                                                {["Instagram", "TikTok", "LinkedIn", "Facebook", "YouTube", "Outro"].map(p => <option key={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-dim uppercase font-bold">Usuário / Email</label>
                                            <input className="w-full mt-1 bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-main focus:border-avaloon-orange outline-none"
                                                value={acc.username} placeholder="@usuario"
                                                onChange={e => {
                                                    const updated = client.social_accounts.map(a => a.id === acc.id ? { ...a, username: e.target.value } : a);
                                                    if (onUpdate) onUpdate({ ...client, social_accounts: updated });
                                                }}
                                                onBlur={() => handleUpdateSocials(client.social_accounts)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-dim uppercase font-bold">Senha</label>
                                        <input type="text" className="w-full mt-1 bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-main font-mono focus:border-avaloon-orange outline-none"
                                            value={acc.password} placeholder="••••••••"
                                            onChange={e => {
                                                const updated = client.social_accounts.map(a => a.id === acc.id ? { ...a, password: e.target.value } : a);
                                                if (onUpdate) onUpdate({ ...client, social_accounts: updated });
                                            }}
                                            onBlur={() => handleUpdateSocials(client.social_accounts)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── NOTES ── */}
                    {tab === "notes" && (
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-main">Notas Internas do Cliente</p>
                            <textarea
                                className="w-full bg-card border border-border rounded-xl p-4 text-sm text-main placeholder-slate-500 focus:border-avaloon-orange outline-none resize-none h-64"
                                placeholder="Anotações, preferências, histórico de conversas, informações relevantes sobre o cliente..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                            <ButtonAvaloon variant="primary" onClick={handleSaveNotes} disabled={isSaving} className="w-full justify-center">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar Notas
                            </ButtonAvaloon>
                            {saveMsg && <p className="text-xs text-center text-emerald-400">{saveMsg}</p>}
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Clients() {
    const { teamMemberId } = useAuth();
    const { can } = usePermissions();
    const isAdmin = can("manage_clients");

    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showClientForm, setShowClientForm] = useState(false);
    const [editingClient, setEditingClient] = useState(null); // client being edited
    const [search, setSearch] = useState("");
    const [filterTier, setFilterTier] = useState("ALL");

    const loadClients = async () => {
        try {
            setIsLoading(true);
            // Admin vê todos; account_manager vê apenas os seus
            const data = isAdmin
                ? await dataService.clients.getAll()
                : await dataService.clients.getByManager(teamMemberId);
            setClients(data || []);
        } catch (e) {
            console.error("Erro ao carregar clientes:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadClients(); }, []);

    const handleClientUpdated = useCallback((updatedClient) => {
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
        setSelectedClient(updatedClient);
    }, []);

    const filteredClients = clients.filter(c => {
        const matchSearch = !search.trim() || c.name?.toLowerCase().includes(search.toLowerCase()) || c.sector?.toLowerCase().includes(search.toLowerCase());
        const matchTier = filterTier === "ALL" || c.tier === filterTier;
        return matchSearch && matchTier;
    });

    const tiers = ["ALL", ...new Set(clients.map(c => c.tier).filter(Boolean))];

    return (
        <div className="flex flex-col w-full h-full relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                <div>
                    <h1 className="text-main text-3xl md:text-4xl font-black tracking-tight">
                        {isAdmin ? "Clientes" : "Meus Clientes"}
                    </h1>
                    <p className="text-muted text-sm mt-1">
                        {isAdmin ? `${filteredClients.length} clientes no total` : "Seus clientes atribuídos"}
                    </p>
                </div>
                {can("manage_clients") && (
                    <ButtonAvaloon variant="primary" onClick={() => setShowClientForm(true)}>
                        <Plus className="w-5 h-5" /> Adicionar Cliente
                    </ButtonAvaloon>
                )}
            </div>

            {/* Toolbar */}
            <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-md rounded-xl border border-border p-3 mb-6 shadow-xl">
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
                        <input
                            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-main placeholder-slate-500 focus:border-avaloon-orange outline-none"
                            placeholder="Buscar por nome ou setor..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {/* Tier filter */}
                    <div className="flex gap-1.5 flex-wrap">
                        {tiers.map(tier => (
                            <button key={tier} onClick={() => setFilterTier(tier)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterTier === tier ? "bg-main/10 border-main/20 text-main" : "bg-card border-border text-muted hover:text-main"}`}>
                                {tier === "ALL" ? "Todos" : tier}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-dim ml-auto">{filteredClients.length} clientes</span>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-avaloon-orange" />
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-dim gap-3">
                    <Users className="w-16 h-16 opacity-20" />
                    <p>Nenhum cliente encontrado.</p>
                    <ButtonAvaloon variant="primary" onClick={() => setShowClientForm(true)}><Plus className="w-4 h-4" /> Adicionar</ButtonAvaloon>
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5 pb-20">
                    {filteredClients.map((client, i) => {
                        const logoUrl = client.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=1e1e2d&color=ec5b13&bold=true&size=128`;
                        const tierStyle = TIER_COLORS[client.tier] || TIER_COLORS.Padrão;
                        return (
                            <motion.div key={client.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="break-inside-avoid mb-5">
                                <div className="bg-card border border-border rounded-xl p-5 hover:border-avaloon-orange/40 hover:shadow-lg hover:shadow-avaloon-orange/5 transition-all group relative overflow-hidden">
                                    <div className="absolute top-3 right-3"><StatusBadge status={client.status} /></div>

                                    <div className="flex items-start gap-4 mb-4">
                                        <img src={logoUrl} alt={client.name} className="w-14 h-14 rounded-xl object-cover ring-2 ring-[#1a1a1a] group-hover:ring-avaloon-orange/40 transition-all flex-shrink-0" />
                                        <div className="pt-1 min-w-0">
                                            <h3 className="text-main font-bold text-base leading-tight truncate">{client.name}</h3>
                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                {client.tier && <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${tierStyle}`}>{client.tier}</span>}
                                                <span className="text-xs text-dim flex items-center gap-1"><Star className="w-3 h-3" />{client.sector}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                                        <div className="bg-[#1f1f1f] p-2 rounded-lg border border-main/5">
                                            <span className="block text-dim">Artes (Mês)</span>
                                            <span className="block text-main font-bold text-lg">{client.filesCount || 0}</span>
                                        </div>
                                        <div className="bg-[#1f1f1f] p-2 rounded-lg border border-main/5">
                                            <span className="block text-dim">Valor</span>
                                            <span className="block text-avaloon-orange font-bold text-sm">
                                                {typeof client.monthly_value === 'number'
                                                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthly_value)
                                                    : "—"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Social quick strip */}
                                    <div className="pt-3 border-t border-border mb-4">
                                        <p className="text-[10px] uppercase tracking-wider text-dim font-bold mb-2">Redes</p>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {(client.social_accounts || []).length > 0 ? (
                                                client.social_accounts.map((acc, idx) => (
                                                    <div key={idx} className="w-7 h-7 rounded-full bg-[#1f1f1f] flex items-center justify-center text-muted border border-main/5" title={`${acc.platform}: ${acc.username}`}>
                                                        <SocialIcon platform={acc.platform} />
                                                    </div>
                                                ))
                                            ) : <span className="text-xs text-slate-600 italic">Nenhuma</span>}
                                        </div>
                                    </div>

                                    {/* Manager badge */}
                                    {client.account_manager && (
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-dim">
                                            <Users className="w-3 h-3" />
                                            <span>{client.account_manager.name}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-dim flex items-center gap-1">
                                            <Folder className="w-3 h-3" />{client.drive_link ? "Drive Vinculado" : "Sem Drive"}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            {isAdmin && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); setEditingClient(client); }}
                                                    className="p-1.5 rounded-lg text-dim hover:text-avaloon-orange hover:bg-avaloon-orange/10 transition-colors"
                                                    title="Editar cliente"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button onClick={() => setSelectedClient(client)}
                                                className="text-xs font-bold text-main bg-[#1f1f1f] hover:bg-avaloon-orange px-3 py-1.5 rounded-lg transition-colors">
                                                Gerenciar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Client Panel */}
            <AnimatePresence>
                {selectedClient && (
                    <ClientPanel
                        key={selectedClient.id}
                        client={selectedClient}
                        onClose={() => setSelectedClient(null)}
                        onUpdate={handleClientUpdated}
                    />
                )}
            </AnimatePresence>

            {/* Client Form — create */}
            <AnimatePresence>
                {showClientForm && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowClientForm(false)} className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-border z-50 shadow-2xl">
                            <ClientForm
                                onClose={() => setShowClientForm(false)}
                                onSuccess={() => { loadClients(); setShowClientForm(false); }}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Client Form — edit (admin only) */}
            <AnimatePresence>
                {editingClient && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setEditingClient(null)} className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-border z-50 shadow-2xl">
                            <ClientForm
                                client={editingClient}
                                onClose={() => setEditingClient(null)}
                                onSuccess={() => { loadClients(); setEditingClient(null); }}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
