import { useState, useEffect, useCallback, useMemo } from "react";
import { KanbanBoard } from "@/components/ui/KanbanBoard";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { DemandDetailModal } from "@/components/ui/DemandDetailModal";
import { AreaSelector, AREA_CONFIG } from "@/components/ui/AreaSelector";
import { DemandForm } from "@/components/forms/DemandForm";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import {
    Plus, LayoutTemplate, ListFilter, Folder, Save, Search, Loader2, X,
    Flame, AlertCircle, Minus, CheckCircle2, Clock, BarChart2, ListTodo, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dataService } from "@/services/dataService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ── Constants ─────────────────────────────────────────────────────────────────
const ALL_AREAS = ["ALL", "VIDEOMAKER", "ACCOUNTS", "DESIGN", "TRAFFIC"];

const PRIORITY_OPTIONS = [
    { id: "ALL", label: "Todas", icon: Layers },
    { id: "High", label: "Alta", icon: Flame, color: "text-red-400" },
    { id: "Medium", label: "Média", icon: AlertCircle, color: "text-yellow-400" },
    { id: "Low", label: "Baixa", icon: Minus, color: "text-muted" },
];

const STATUS_CONFIG = {
    TODO: { label: "A Fazer", color: "text-muted", bg: "bg-slate-500/10" },
    DOING: { label: "Em Produção", color: "text-blue-400", bg: "bg-blue-500/10" },
    REVIEW: { label: "Revisão", color: "text-orange-400", bg: "bg-orange-500/10" },
    DONE: { label: "Concluído", color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

const PRIORITY_COLOR = { High: "text-red-400", Medium: "text-yellow-400", Low: "text-muted" };

// ── KPI Strip ─────────────────────────────────────────────────────────────────
function KpiStrip({ demands }) {
    const total = demands.length;
    const todo = demands.filter(d => d.status === "TODO").length;
    const doing = demands.filter(d => d.status === "DOING").length;
    const done = demands.filter(d => d.status === "DONE").length;
    const high = demands.filter(d => d.priority === "High").length;

    const kpis = [
        { label: "Total", value: total, icon: Layers, color: "text-main", bg: "bg-main/5" },
        { label: "A Fazer", value: todo, icon: ListTodo, color: "text-slate-300", bg: "bg-slate-500/10" },
        { label: "Em Produção", value: doing, icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Concluídas", value: done, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: "Alta Prioridade", value: high, icon: Flame, color: "text-red-400", bg: "bg-red-500/10" },
    ];

    return (
        <div className="grid grid-cols-5 gap-3">
            {kpis.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`${bg} border border-main/5 rounded-xl p-3 flex items-center gap-3`}>
                    <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                    <div>
                        <p className={`text-xl font-black ${color}`}>{value}</p>
                        <p className="text-[10px] text-dim uppercase font-bold">{label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Briefings() {
    const { teamMemberId } = useAuth();
    const { can, role } = usePermissions();
    const isAdmin = can("edit_team"); // admins have full access

    const [view, setView] = useState("board");
    const [driveLink, setDriveLink] = useState("");
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [showAreaSelector, setShowAreaSelector] = useState(false);
    const [showNewDemandForm, setShowNewDemandForm] = useState(false);
    const [selectedArea, setSelectedArea] = useState(null);
    const [selectedDemand, setSelectedDemand] = useState(null);
    const [demands, setDemands] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterArea, setFilterArea] = useState("ALL");
    const [filterPriority, setFilterPriority] = useState("ALL");
    const [search, setSearch] = useState("");
    const [mineOnly, setMineOnly] = useState(!isAdmin && role !== "account_manager");

    // 30-day default window: 15 days ago to 15 days ahead
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    useEffect(() => {
        const savedLink = localStorage.getItem("avaloon_drive_folder");
        if (savedLink) setDriveLink(savedLink);
        loadDemands();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadDemands = useCallback(async () => {
        setIsLoading(true);
        try {
            // Include date filters in service calls
            const data = (!isAdmin && mineOnly && teamMemberId)
                ? await dataService.demands.getByMember(teamMemberId, dateRange.start, dateRange.end)
                : await dataService.demands.getAll(dateRange.start, dateRange.end);
            setDemands(data || []);
        } catch (e) {
            console.error("Falha ao carregar demandas", e);
        } finally {
            setIsLoading(false);
        }
    }, [isAdmin, mineOnly, teamMemberId, dateRange]);

    // Reload when scope toggle changes
    useEffect(() => { loadDemands(); }, [loadDemands]);

    // Optimistic status update — no full reload
    const handleOptimisticStatusUpdate = useCallback((demandId, newStatus) => {
        setDemands(prev => prev.map(d => d.id === demandId ? { ...d, status: newStatus } : d));
    }, []);

    const handleSaveDrive = () => {
        localStorage.setItem("avaloon_drive_folder", driveLink);
        setIsConfiguring(false);
    };

    const handleAreaSelected = (area) => {
        setSelectedArea(area);
        setShowAreaSelector(false);
        setShowNewDemandForm(true);
    };

    // ── Filters ────────────────────────────────────────────────────────────────
    const filteredDemands = useMemo(() => demands.filter(d => {
        const matchArea = filterArea === "ALL" || (d.area || "GENERIC") === filterArea;
        const matchPriority = filterPriority === "ALL" || d.priority === filterPriority;
        const matchSearch = !search.trim()
            || d.title?.toLowerCase().includes(search.toLowerCase())
            || d.clients?.name?.toLowerCase().includes(search.toLowerCase())
            || d.assignee?.name?.toLowerCase().includes(search.toLowerCase());
        return matchArea && matchPriority && matchSearch;
    }), [demands, filterArea, filterPriority, search]);

    const totalByArea = (area) => demands.filter(d => (d.area || "GENERIC") === area).length;

    return (
        <div className="h-full flex flex-col space-y-4 relative">
            {/* ── Header ── */}
            <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black text-main tracking-tight">Pipeline de Produção</h1>
                    <p className="text-muted text-sm mt-0.5">
                        {isAdmin || (!mineOnly && role === 'account_manager')
                            ? "Visão geral de toda a equipe e fluxos ativos"
                            : "Suas demandas e cronograma pessoal"}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    {/* Scope toggle — non-admins see "mine / all" */}
                    {!isAdmin && (
                        <div className="flex items-center gap-2">
                            {dateRange.start && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-avaloon-orange/10 border border-avaloon-orange/20 rounded-xl">
                                    <span className="text-[10px] font-bold text-avaloon-orange uppercase">Período: 30 Dias</span>
                                    <button
                                        onClick={() => setDateRange({ start: null, end: null })}
                                        className="text-avaloon-orange hover:text-white transition-colors"
                                        title="Ver todo o histórico"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            <div className="flex bg-card rounded-lg p-1 border border-border">
                                <button onClick={() => setMineOnly(true)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${mineOnly ? "bg-avaloon-orange/20 text-avaloon-orange" : "text-dim hover:text-main"}`}>
                                    Minhas
                                </button>
                                <button onClick={() => setMineOnly(false)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${!mineOnly ? "bg-avaloon-orange/20 text-avaloon-orange" : "text-dim hover:text-main"}`}>
                                    Todas
                                </button>
                            </div>
                        </div>
                    )}
                    {/* View switch */}
                    <div className="flex bg-card rounded-lg p-1 border border-border">
                        {[{ id: "board", Icon: LayoutTemplate, title: "Kanban" }, { id: "list", Icon: ListFilter, title: "Lista" }, { id: "drive", Icon: Folder, title: "Drive" }].map(({ id, Icon, title }) => (
                            <button key={id} onClick={() => setView(id)} title={title}
                                className={`p-2 rounded-md transition-colors ${view === id ? "bg-avaloon-orange/20 text-avaloon-orange" : "text-dim hover:text-main"}`}>
                                <Icon className="w-4 h-4" />
                            </button>
                        ))}
                    </div>
                    <ButtonAvaloon variant="primary" onClick={() => setShowAreaSelector(true)}>
                        <Plus className="w-4 h-4" /> Nova Demanda
                    </ButtonAvaloon>
                </div>
            </div>

            {/* ── KPIs ── */}
            <KpiStrip demands={demands} />

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Area filters */}
                <div className="flex flex-wrap gap-1.5">
                    {ALL_AREAS.map(area => {
                        const cfg = area === "ALL" ? { label: "Todas", dot: "bg-white", textColor: "text-main" } : AREA_CONFIG[area];
                        const count = area === "ALL" ? demands.length : totalByArea(area);
                        const active = filterArea === area;
                        return (
                            <button key={area} onClick={() => setFilterArea(area)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${active ? "bg-main/10 border-main/20 text-main" : "bg-card border-border text-muted hover:text-main"}`}>
                                <div className={`w-2 h-2 rounded-full ${cfg?.dot || "bg-white"}`} />
                                {cfg?.label || "Todos"}
                                <span className="px-1 bg-main/10 rounded text-[10px]">{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Priority filter */}
                <div className="flex gap-1.5 ml-2 pl-2 border-l border-border">
                    {PRIORITY_OPTIONS.map(({ id, label, icon: Icon, color }) => (
                        <button key={id} onClick={() => setFilterPriority(id)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterPriority === id ? "bg-main/10 border-main/20 text-main" : "bg-card border-border text-muted hover:text-main"}`}>
                            <Icon className={`w-3 h-3 ${filterPriority === id && color ? color : ""}`} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
                    <input type="text" placeholder="Buscar demanda, cliente ou responsável..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="bg-card border border-border rounded-xl pl-9 pr-8 py-2 text-sm text-main placeholder-slate-500 focus:border-avaloon-orange outline-none w-64" />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-main">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <span className="text-xs text-dim">{filteredDemands.length} demandas</span>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-hidden min-h-[400px] flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-dim">
                        <Loader2 className="w-8 h-8 animate-spin mr-3 text-avaloon-orange" />
                        Carregando demandas...
                    </div>
                ) : view === "board" ? (
                    <KanbanBoard
                        tasks={filteredDemands}
                        onTaskUpdate={loadDemands}
                        onOptimisticUpdate={handleOptimisticStatusUpdate}
                        onAddDemand={() => setShowAreaSelector(true)}
                        onOpenDetail={setSelectedDemand}
                        canAdd={can("create_demands")}
                        canMoveAll={can("edit_kanban")}
                        canMoveOwn={can("move_own_demands")}
                        currentUserId={teamMemberId}
                    />
                ) : view === "list" ? (
                    <div className="overflow-auto flex-1 rounded-xl border border-border bg-card">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left bg-background">
                                    {["Título", "Área", "Cliente", "Responsável", "Prioridade", "Status", "Data"].map(h => (
                                        <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase text-dim tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDemands.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-12 text-dim">Nenhuma demanda encontrada.</td></tr>
                                ) : filteredDemands.map((d, i) => {
                                    const areaCfg = AREA_CONFIG[d.area || "GENERIC"] || AREA_CONFIG.GENERIC;
                                    const statusCfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.TODO;
                                    const avatarUrl = d.assignee?.avatar_url
                                        || (d.assignee?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(d.assignee.name)}&background=1e1e2d&color=ec5b13&bold=true&size=32` : null);
                                    return (
                                        <motion.tr key={d.id}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                            onClick={() => setSelectedDemand(d)}
                                            className={`border-b border-border hover:bg-main/5 cursor-pointer transition-colors ${i % 2 !== 0 ? "bg-white/[0.02]" : ""}`}>
                                            <td className="px-4 py-3 text-main font-medium max-w-[200px] truncate">{d.title}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${areaCfg.bgColor} ${areaCfg.textColor}`}>{areaCfg.label}</span>
                                            </td>
                                            <td className="px-4 py-3 text-muted text-xs">{d.clients?.name || "—"}</td>
                                            <td className="px-4 py-3">
                                                {d.assignee ? (
                                                    <div className="flex items-center gap-1.5">
                                                        {avatarUrl && <img src={avatarUrl} className="w-5 h-5 rounded-full" alt="" />}
                                                        <span className="text-xs text-slate-300">{d.assignee.name}</span>
                                                    </div>
                                                ) : <span className="text-slate-600 text-xs">—</span>}
                                            </td>
                                            <td className={`px-4 py-3 text-xs font-bold ${PRIORITY_COLOR[d.priority] || "text-muted"}`}>{d.priority || "—"}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusCfg.bg} ${statusCfg.color}`}>{statusCfg.label}</span>
                                            </td>
                                            <td className="px-4 py-3 text-dim text-xs">
                                                {d.scheduled_at ? format(new Date(d.scheduled_at), "dd/MM/yy", { locale: ptBR }) : "—"}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Drive view */
                    <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-background">
                            <h3 className="text-main font-bold flex items-center gap-2"><Folder className="w-4 h-4 text-avaloon-orange" /> Google Drive</h3>
                            <button onClick={() => setIsConfiguring(v => !v)} className="text-xs text-muted hover:text-main underline">
                                {isConfiguring ? "Cancelar" : "Configurar Pasta"}
                            </button>
                        </div>
                        {isConfiguring ? (
                            <div className="p-8 flex flex-col items-center space-y-4">
                                <input type="text" value={driveLink} onChange={e => setDriveLink(e.target.value)}
                                    placeholder="https://drive.google.com/drive/folders/..."
                                    className="w-full max-w-xl bg-card border border-border rounded-xl p-3 text-main focus:border-avaloon-orange outline-none" />
                                <ButtonAvaloon onClick={handleSaveDrive} variant="primary"><Save className="w-4 h-4" /> Salvar</ButtonAvaloon>
                            </div>
                        ) : driveLink ? (
                            <iframe src={driveLink} className="w-full flex-1 border-none" title="Google Drive" />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-dim">
                                <Folder className="w-16 h-16 mb-4 opacity-20" />
                                <p>Nenhuma pasta vinculada.</p>
                                <button onClick={() => setIsConfiguring(true)} className="text-avaloon-orange hover:underline mt-2 text-sm">Vincular Pasta</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            <AnimatePresence>
                {showAreaSelector && <AreaSelector onSelect={handleAreaSelected} onClose={() => setShowAreaSelector(false)} />}
            </AnimatePresence>

            <AnimatePresence>
                {showNewDemandForm && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowNewDemandForm(false)} className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border z-50 shadow-2xl overflow-y-auto">
                            <DemandForm area={selectedArea || "GENERIC"}
                                onClose={() => setShowNewDemandForm(false)}
                                onSuccess={() => { loadDemands(); setShowNewDemandForm(false); }} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedDemand && (
                    <DemandDetailModal demand={selectedDemand}
                        onClose={() => setSelectedDemand(null)}
                        onUpdate={() => { loadDemands(); setSelectedDemand(null); }} />
                )}
            </AnimatePresence>
        </div>
    );
}
