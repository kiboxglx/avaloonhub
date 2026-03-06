import { useState, useEffect, useCallback } from "react";
import {
    Plus, Search, Download, LayoutGrid, List, Loader2, Users,
    Video, Palette, TrendingUp, Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dataService } from "@/services/dataService";
import { TeamForm } from "@/components/forms/TeamForm";
import { MemberProfilePanel } from "@/components/ui/MemberProfilePanel";
import { AREA_CONFIG } from "@/components/ui/AreaSelector";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { usePermissions } from "@/hooks/usePermissions";

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const config = {
        "On-Set": { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-500", ping: "bg-red-400", label: "Em Gravação" },
        "Available": { color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", dot: "bg-green-500", ping: "bg-green-400", label: "Disponível" },
        "Offline": { color: "text-muted", bg: "bg-slate-500/10 border-slate-500/20", dot: "bg-slate-500", ping: null, label: "Offline" },
    };
    const c = config[status] || config.Offline;
    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.color}`}>
            <span className="relative flex h-2 w-2">
                {c.ping && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.ping} opacity-75`} />}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
            </span>
            {c.label}
        </div>
    );
};

// ── Area filter tabs ──────────────────────────────────────────────────────────
const AREA_FILTERS = [
    { id: "ALL", label: "Todos", icon: Users },
    { id: "VIDEOMAKER", label: "Videomaker", icon: Video },
    { id: "DESIGN", label: "Design", icon: Palette },
    { id: "TRAFFIC", label: "Tráfego", icon: TrendingUp },
    { id: "ACCOUNTS", label: "Contas", icon: Briefcase },
];

const STATUS_FILTERS = ["Todos", "Disponível", "Em Gravação", "Offline"];
const STATUS_MAP_REVERSE = { "Disponível": "Available", "Em Gravação": "On-Set", "Offline": "Offline" };

// ── KPI strip ─────────────────────────────────────────────────────────────────
const KpiStrip = ({ members }) => {
    const available = members.filter(m => m.status === "Available").length;
    const onSet = members.filter(m => m.status === "On-Set").length;
    const offline = members.filter(m => m.status === "Offline").length;
    return (
        <div className="grid grid-cols-4 gap-3 mb-6">
            {[
                { label: "Total", value: members.length, color: "text-main" },
                { label: "Disponíveis", value: available, color: "text-green-400" },
                { label: "Em Gravação", value: onSet, color: "text-red-400" },
                { label: "Offline", value: offline, color: "text-muted" },
            ].map(k => (
                <div key={k.label} className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
                    <p className="text-[10px] text-dim uppercase font-bold mt-0.5">{k.label}</p>
                </div>
            ))}
        </div>
    );
};

// ── List row ──────────────────────────────────────────────────────────────────
const ListRow = ({ member, onClick }) => {
    const areaCfg = AREA_CONFIG[member.area || "GENERIC"] || AREA_CONFIG.GENERIC;
    const avatarUrl = member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1e1e2d&color=ec5b13&bold=true`;
    return (
        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={onClick} className="cursor-pointer hover:bg-main/5 transition-colors group">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <img src={avatarUrl} className="w-9 h-9 rounded-xl object-cover" alt={member.name} />
                    <div>
                        <p className="text-sm font-bold text-main group-hover:text-avaloon-orange transition-colors">{member.name}</p>
                        <p className="text-xs text-dim">{member.role}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3"><span className={`text-xs font-bold ${areaCfg.textColor}`}>{areaCfg.label}</span></td>
            <td className="px-4 py-3"><StatusBadge status={member.status} /></td>
            <td className="px-4 py-3 text-xs text-muted">{member.location || "—"}</td>
            <td className="px-4 py-3">
                <div className="flex gap-1 flex-wrap">
                    {(member.specialties || []).slice(0, 2).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[#1f1f1f] rounded text-[10px] text-slate-300">{s}</span>
                    ))}
                    {(member.specialties || []).length > 2 && <span className="text-[10px] text-dim">+{member.specialties.length - 2}</span>}
                </div>
            </td>
        </motion.tr>
    );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TeamDirectory() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTeamForm, setShowTeamForm] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [search, setSearch] = useState("");
    const [areaFilter, setAreaFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("Todos");
    const [viewMode, setViewMode] = useState("grid"); // grid | list
    const { can } = usePermissions();
    const canAdd = can("add_team");
    const canExport = can("export_data");

    const loadTeam = async () => {
        try {
            setLoading(true);
            const data = await dataService.team.getAll();
            setMembers((data || []).map(m => ({
                ...m,
                kit: Array.isArray(m.kit) ? m.kit : [],
                specialties: Array.isArray(m.specialties) ? m.specialties : [],
            })));
        } catch (e) {
            console.error("Erro ao carregar equipe:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadTeam(); }, []);

    const handleMemberUpdate = useCallback((updated) => {
        setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
        setSelectedMember(updated);
    }, []);

    const handleMemberDelete = useCallback((id) => {
        setMembers(prev => prev.filter(m => m.id !== id));
    }, []);

    // Export CSV
    const handleExport = () => {
        const rows = [
            ["Nome", "Cargo", "Área", "Status", "Localização", "Email", "Telefone", "Especialidades"],
            ...filteredMembers.map(m => [
                m.name, m.role, m.area || "—", m.status, m.location || "—",
                m.email || "—", m.phone || "—",
                (m.specialties || []).join("; ")
            ])
        ];
        const csv = rows.map(r => r.map(f => `"${f}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "equipe-avaloon.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    // Filter
    const filteredMembers = members.filter(m => {
        const q = search.toLowerCase();
        const matchSearch = !q || m.name?.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q) || (m.specialties || []).some(s => s.toLowerCase().includes(q));
        const matchArea = areaFilter === "ALL" || m.area === areaFilter;
        const mappedStatus = STATUS_MAP_REVERSE[statusFilter];
        const matchStatus = statusFilter === "Todos" || m.status === mappedStatus;
        return matchSearch && matchArea && matchStatus;
    });

    const getAreaCounts = () => AREA_FILTERS.reduce((acc, f) => {
        acc[f.id] = f.id === "ALL" ? members.length : members.filter(m => m.area === f.id).length;
        return acc;
    }, {});
    const areaCounts = getAreaCounts();

    return (
        <div className="flex flex-col w-full h-full relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-main text-3xl md:text-4xl font-black tracking-tight">Equipe</h1>
                    <p className="text-muted text-sm mt-1">Gerencie membros, status e equipamentos do time.</p>
                </div>
                <div className="flex gap-2">
                    {canExport && (
                        <ButtonAvaloon variant="outline" onClick={handleExport}>
                            <Download className="w-4 h-4" /> Exportar CSV
                        </ButtonAvaloon>
                    )}
                    {canAdd && (
                        <ButtonAvaloon variant="primary" onClick={() => setShowTeamForm(true)}>
                            <Plus className="w-4 h-4" /> Adicionar Membro
                        </ButtonAvaloon>
                    )}
                </div>
            </div>

            {/* KPI strip */}
            {!loading && <KpiStrip members={members} />}

            {/* Toolbar */}
            <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-md rounded-xl border border-border p-3 mb-6 shadow-xl">
                <div className="flex flex-col gap-3">
                    {/* Row 1 — Search + View toggle + Status */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[180px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
                            <input
                                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-main placeholder-slate-500 focus:border-avaloon-orange outline-none"
                                placeholder="Buscar por nome, cargo ou especialidade..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        {/* Status filter */}
                        <div className="flex gap-1 flex-wrap">
                            {STATUS_FILTERS.map(s => (
                                <button key={s} onClick={() => setStatusFilter(s)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${statusFilter === s ? "bg-main/10 border-main/20 text-main" : "bg-card border-border text-muted hover:text-main"}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                        {/* View toggle */}
                        <div className="flex bg-card rounded-lg p-1 border border-border ml-auto flex-shrink-0">
                            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-avaloon-orange/20 text-avaloon-orange" : "text-dim hover:text-main"}`}>
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-avaloon-orange/20 text-avaloon-orange" : "text-dim hover:text-main"}`}>
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    {/* Row 2 — Area filter tabs */}
                    <div className="flex gap-1.5 overflow-x-auto">
                        {AREA_FILTERS.map(f => {
                            const Icon = f.icon;
                            const areaCfg = AREA_CONFIG[f.id];
                            return (
                                <button key={f.id} onClick={() => setAreaFilter(f.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all flex-shrink-0 ${areaFilter === f.id
                                        ? (areaCfg ? `${areaCfg.bgColor} ${areaCfg.textColor} border-current` : "bg-main/10 border-main/20 text-main")
                                        : "bg-card border-border text-muted hover:text-main"}`}>
                                    <Icon className="w-3.5 h-3.5" />{f.label}
                                    <span className="ml-1 opacity-60">({areaCounts[f.id] || 0})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-avaloon-orange" />
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-dim gap-3">
                    <Users className="w-16 h-16 opacity-20" />
                    <p>Nenhum membro encontrado.</p>
                    {canAdd && <ButtonAvaloon variant="primary" onClick={() => setShowTeamForm(true)}><Plus className="w-4 h-4" /> Adicionar</ButtonAvaloon>}
                </div>
            ) : viewMode === "grid" ? (
                /* ─ GRID ─ */
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5 pb-20">
                    {filteredMembers.map((member, i) => {
                        const areaCfg = AREA_CONFIG[member.area || "GENERIC"] || AREA_CONFIG.GENERIC;
                        const avatarUrl = member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1e1e2d&color=ec5b13&bold=true&size=256`;
                        return (
                            <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="break-inside-avoid mb-5">
                                <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-avaloon-orange/40 hover:shadow-lg hover:shadow-avaloon-orange/5 transition-all group">
                                    {/* Area accent */}
                                    <div className={`h-1 ${areaCfg.dot}`} />
                                    <div className="p-5">
                                        {/* Status top right */}
                                        <div className="flex justify-end mb-3">
                                            <StatusBadge status={member.status} />
                                        </div>
                                        {/* Avatar + info */}
                                        <div className="flex items-start gap-3 mb-4">
                                            <img src={avatarUrl} alt={member.name}
                                                className={`w-14 h-14 rounded-xl object-cover ring-2 ring-[#1a1a1a] group-hover:ring-avaloon-orange/30 flex-shrink-0 transition-all ${member.status === 'Offline' ? 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100' : ''}`} />
                                            <div className="min-w-0">
                                                <h3 className="text-main font-bold text-base leading-tight truncate">{member.name}</h3>
                                                <p className="text-avaloon-orange text-xs font-medium">{member.role}</p>
                                                <span className={`inline-block mt-1 text-[10px] font-bold ${areaCfg.textColor}`}>{areaCfg.label}</span>
                                            </div>
                                        </div>
                                        {/* Specialties */}
                                        {(member.specialties || []).length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-[10px] uppercase tracking-wider text-dim font-bold mb-1.5">Especialidades</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {member.specialties.slice(0, 3).map((s, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-[#1f1f1f] rounded text-[10px] text-slate-300 border border-main/5">{s}</span>
                                                    ))}
                                                    {member.specialties.length > 3 && <span className="text-[10px] text-dim">+{member.specialties.length - 3}</span>}
                                                </div>
                                            </div>
                                        )}
                                        {/* Footer */}
                                        <div className="pt-3 border-t border-border flex justify-between items-center">
                                            <span className="text-xs text-dim">{member.location || "—"}</span>
                                            <button onClick={() => setSelectedMember(member)}
                                                className="text-xs font-bold text-main bg-[#1f1f1f] hover:bg-avaloon-orange px-3 py-1.5 rounded-lg transition-colors">
                                                Ver Perfil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                /* ─ LIST ─ */
                <div className="bg-card border border-border rounded-xl overflow-hidden mb-20">
                    <table className="w-full text-left">
                        <thead className="border-b border-border">
                            <tr className="text-[10px] font-bold uppercase tracking-wider text-dim">
                                {["Membro", "Área", "Status", "Localização", "Especialidades"].map(h => (
                                    <th key={h} className="px-4 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a1a1a]">
                            {filteredMembers.map(m => (
                                <ListRow key={m.id} member={m} onClick={() => setSelectedMember(m)} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Team Form slide-in */}
            <AnimatePresence>
                {showTeamForm && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowTeamForm(false)} className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-border z-50 shadow-2xl">
                            <TeamForm onClose={() => setShowTeamForm(false)}
                                onSuccess={() => { loadTeam(); setShowTeamForm(false); }} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Member Profile Panel */}
            <AnimatePresence>
                {selectedMember && (
                    <MemberProfilePanel
                        key={selectedMember.id}
                        member={selectedMember}
                        onClose={() => setSelectedMember(null)}
                        onUpdate={handleMemberUpdate}
                        onDelete={handleMemberDelete}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
