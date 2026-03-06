import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Calendar, Instagram, Facebook, Linkedin, Youtube, Globe,
    ArrowRight, Loader2, X, CheckCircle2, XCircle, Clock, Edit3,
    Smartphone, FileText, ChevronLeft, ChevronRight, Filter
} from "lucide-react";
import { cn } from "@/utils/cn";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { dataService } from "@/services/dataService";
import { DemandForm } from "@/components/forms/DemandForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ── Platform helpers ──────────────────────────────────────────────────────────
const PLATFORMS = {
    Instagram: { icon: Instagram, color: "text-pink-500", bg: "bg-pink-500/15" },
    TikTok: { icon: Smartphone, color: "text-cyan-400", bg: "bg-cyan-500/15" },
    LinkedIn: { icon: Linkedin, color: "text-blue-500", bg: "bg-blue-500/15" },
    Facebook: { icon: Facebook, color: "text-blue-400", bg: "bg-blue-600/15" },
    YouTube: { icon: Youtube, color: "text-red-500", bg: "bg-red-500/15" },
    Pinterest: { icon: Globe, color: "text-red-400", bg: "bg-red-400/15" },
    Outro: { icon: Globe, color: "text-muted", bg: "bg-slate-500/15" },
};

const platformCfg = (p) => PLATFORMS[p] || PLATFORMS.Outro;

// ── Kanban columns ──────────────────────────────────────────────────────────
const COLUMNS = [
    { id: "IDEA", title: "Ideias", color: "bg-slate-500/10 border-slate-500/20 text-muted" },
    { id: "DESIGN", title: "Em Criação", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
    { id: "APPROVAL", title: "Aprovação", color: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
    { id: "SCHEDULED", title: "Agendado", color: "bg-green-500/10 border-green-500/20 text-green-400" },
];

// ── Post Detail Modal ─────────────────────────────────────────────────────────
function PostDetailModal({ post, onClose, onUpdate }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const plat = platformCfg(post.platform);
    const PlatIcon = plat.icon;

    const changeStatus = async (status) => {
        setIsUpdating(true);
        try {
            await dataService.demands.updateStatus(post.id, status);
            if (onUpdate) onUpdate();
        } catch (e) {
            console.error(e);
        } finally {
            setIsUpdating(false);
        }
    };

    const scheduledLabel = post.scheduled_at
        ? format(new Date(post.scheduled_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
        : "Sem data definida";

    const statusLabels = { IDEA: "Ideia", DESIGN: "Em Criação", APPROVAL: "Em Aprovação", SCHEDULED: "Agendado" };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl z-10 overflow-hidden"
            >
                {/* Platform accent */}
                <div className={`h-1 w-full ${plat.bg.replace('/15', '/60')}`} />

                {/* Header */}
                <div className="p-6 border-b border-border bg-card">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1.5 rounded-lg ${plat.bg}`}>
                                    <PlatIcon className={`w-4 h-4 ${plat.color}`} />
                                </div>
                                <span className={`text-[11px] font-bold ${plat.color}`}>{post.platform}</span>
                                <span className="text-dim">•</span>
                                <span className="text-[11px] text-dim font-medium">{statusLabels[post.status]}</span>
                            </div>
                            <h2 className="text-xl font-bold text-main leading-snug">{post.title}</h2>
                            <p className="text-sm text-muted mt-1">📁 {post.client}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-main/10 rounded-full text-muted hover:text-main transition-colors flex-shrink-0">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-card border border-border rounded-xl p-3">
                            <p className="text-[10px] text-dim uppercase font-bold mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Data / Hora</p>
                            <p className="text-sm text-main font-medium">{scheduledLabel}</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-3">
                            <p className="text-[10px] text-dim uppercase font-bold mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Formato</p>
                            <p className="text-sm text-main font-medium">{post.format || "—"}</p>
                        </div>
                    </div>

                    {/* Copy / Brief */}
                    {post.design_brief && (
                        <div className="bg-card border border-border rounded-xl p-4">
                            <p className="text-[10px] text-dim uppercase font-bold mb-2 flex items-center gap-1"><Edit3 className="w-3 h-3" /> Briefing da Arte</p>
                            <p className="text-sm text-slate-300 leading-relaxed">{post.design_brief}</p>
                        </div>
                    )}

                    {/* Approval Actions */}
                    {post.status === "APPROVAL" && (
                        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                            <p className="text-xs font-bold text-orange-400 uppercase mb-3">Aguardando Aprovação</p>
                            <div className="flex gap-3">
                                <ButtonAvaloon
                                    variant="primary"
                                    className="flex-1 justify-center !bg-emerald-600 !shadow-emerald-600/20"
                                    onClick={() => changeStatus("SCHEDULED")}
                                    disabled={isUpdating}
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Aprovar
                                </ButtonAvaloon>
                                <ButtonAvaloon
                                    variant="secondary"
                                    className="flex-1 justify-center !border-red-500/40 !text-red-400"
                                    onClick={() => changeStatus("DESIGN")}
                                    disabled={isUpdating}
                                >
                                    <XCircle className="w-4 h-4" /> Pedir Revisão
                                </ButtonAvaloon>
                            </div>
                        </div>
                    )}

                    {/* Move status bar */}
                    {post.status !== "APPROVAL" && (
                        <div>
                            <p className="text-[11px] text-dim uppercase font-bold mb-2">Avançar Etapa</p>
                            <div className="grid grid-cols-4 gap-1.5">
                                {COLUMNS.map(col => (
                                    <button key={col.id} onClick={() => changeStatus(col.id)}
                                        disabled={col.id === post.status || isUpdating}
                                        className={cn(
                                            "py-1.5 rounded-lg text-[10px] font-bold border transition-all truncate",
                                            col.id === post.status
                                                ? `${col.color} ring-1 ring-offset-1 ring-offset-[#000000] ring-white/10 cursor-default`
                                                : "bg-card border-border text-dim hover:text-main hover:border-main/20"
                                        )}>
                                        {col.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ContentPlanning() {
    const [posts, setPosts] = useState([]);
    const [rawDemands, setRawDemands] = useState([]);
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDemandForm, setShowDemandForm] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [filterClient, setFilterClient] = useState("ALL");
    const [filterPlatform, setFilterPlatform] = useState("ALL");
    const [view, setView] = useState("kanban"); // kanban | calendar

    // Calendar month state
    const [calMonth, setCalMonth] = useState(new Date());
    const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const loadPosts = async () => {
        setIsLoading(true);
        try {
            const [data, clientList] = await Promise.all([
                dataService.demands.getAll(),
                dataService.clients.getAll()
            ]);
            setClients(clientList || []);

            const contentDemands = data.filter(d =>
                d.area === "DESIGN" ||
                d.type === "CONTENT" ||
                (d.services?.name && (
                    d.services.name.toLowerCase().includes("social") ||
                    d.services.name.toLowerCase().includes("post") ||
                    d.services.name.toLowerCase().includes("reels") ||
                    d.services.name.toLowerCase().includes("design")
                ))
            );

            setRawDemands(contentDemands);
            setPosts(contentDemands.map(d => ({
                id: d.id,
                title: d.title,
                client: d.clients?.name || "Cliente",
                client_id: d.client_id,
                platform: d.briefing_data?.platform || "Instagram",
                format: d.briefing_data?.format || null,
                design_brief: d.briefing_data?.design_brief || null,
                status: d.status || "IDEA",
                scheduled_at: d.scheduled_at,
                date: d.scheduled_at ? format(new Date(d.scheduled_at), "dd/MM") : "—",
            })));
        } catch (error) {
            console.error("Error loading posts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadPosts(); }, []);

    const movePost = async (postId, newStatus) => {
        setPosts(p => p.map(x => x.id === postId ? { ...x, status: newStatus } : x));
        try {
            await dataService.demands.updateStatus(postId, newStatus);
        } catch (e) {
            console.error(e);
            loadPosts();
        }
    };

    // Filter logic
    const filteredPosts = posts.filter(p => {
        const matchClient = filterClient === "ALL" || p.client_id === filterClient;
        const matchPlat = filterPlatform === "ALL" || p.platform === filterPlatform;
        return matchClient && matchPlat;
    });

    // Calendar view helpers
    const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();
    const postsInMonth = filteredPosts.filter(p => {
        if (!p.scheduled_at) return false;
        const d = new Date(p.scheduled_at);
        return d.getMonth() === calMonth.getMonth() && d.getFullYear() === calMonth.getFullYear();
    });

    const uniquePlatforms = [...new Set(posts.map(p => p.platform))];

    return (
        <div className="h-full flex flex-col space-y-5 relative">
            {/* Header */}
            <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Planejamento de Conteúdo
                    </h2>
                    <p className="text-muted text-sm">Posts, stories, reels e campanhas por cliente.</p>
                </div>
                <div className="flex gap-2">
                    {/* View toggle */}
                    <div className="flex bg-card rounded-lg p-1 border border-border">
                        <button onClick={() => setView("kanban")} title="Kanban"
                            className={`p-2 rounded-md transition-colors ${view === "kanban" ? "bg-avaloon-orange/20 text-avaloon-orange" : "text-dim hover:text-main"}`}>
                            <Filter className="w-5 h-5" />
                        </button>
                        <button onClick={() => setView("calendar")} title="Calendário"
                            className={`p-2 rounded-md transition-colors ${view === "calendar" ? "bg-avaloon-orange/20 text-avaloon-orange" : "text-dim hover:text-main"}`}>
                            <Calendar className="w-5 h-5" />
                        </button>
                    </div>
                    <ButtonAvaloon variant="primary" onClick={() => setShowDemandForm(true)}>
                        <Plus className="w-4 h-4" /> Novo Post
                    </ButtonAvaloon>
                </div>
            </div>

            {/* Filters toolbar */}
            <div className="flex flex-wrap gap-3 items-center">
                {/* Client filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-dim font-bold uppercase">Cliente:</span>
                    <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
                        className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-main focus:border-avaloon-orange outline-none">
                        <option value="ALL">Todos</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {/* Platform filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-dim font-bold uppercase">Plataforma:</span>
                    <div className="flex gap-1.5 flex-wrap">
                        {["ALL", ...uniquePlatforms].map(p => {
                            const cfg = p === "ALL" ? null : platformCfg(p);
                            const Icon = cfg?.icon;
                            return (
                                <button key={p} onClick={() => setFilterPlatform(p)}
                                    className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all",
                                        filterPlatform === p ? "bg-main/10 border-main/20 text-main" : "bg-card border-border text-muted hover:text-main")}>
                                    {Icon && <Icon className={`w-3 h-3 ${cfg.color}`} />}
                                    {p === "ALL" ? "Todas" : p}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Count badge */}
                <span className="ml-auto text-xs text-dim bg-card border border-border px-3 py-1.5 rounded-lg">
                    {filteredPosts.length} posts
                </span>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-avaloon-orange" />
                </div>
            ) : view === "kanban" ? (
                /* ── KANBAN VIEW ─────────────────────────────── */
                <div className="flex gap-4 overflow-x-auto pb-6 h-full min-h-[500px]">
                    {COLUMNS.map(col => {
                        const colPosts = filteredPosts.filter(p => p.status === col.id);
                        const colIdx = COLUMNS.findIndex(c => c.id === col.id);
                        return (
                            <div key={col.id} className="min-w-[280px] w-full flex-1 flex flex-col">
                                <div className={cn("flex items-center justify-between p-3 rounded-t-xl mb-3 border", col.color)}>
                                    <h3 className="font-bold text-sm uppercase tracking-wider">{col.title}</h3>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-main/10">{colPosts.length}</span>
                                </div>

                                <div className="flex-1 space-y-3 p-1 overflow-y-auto">
                                    <AnimatePresence mode="popLayout">
                                        {colPosts.map(post => {
                                            const plat = platformCfg(post.platform);
                                            const PIcon = plat.icon;
                                            return (
                                                <motion.div
                                                    layoutId={post.id} key={post.id}
                                                    initial={{ opacity: 0, scale: 0.96 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.96 }}
                                                    onClick={() => setSelectedPost(post)}
                                                    className="bg-card border border-border p-4 rounded-xl shadow-lg hover:border-white/10 hover:shadow-avaloon-orange/5 transition-all group cursor-pointer"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className={`p-1.5 rounded-lg ${plat.bg} flex items-center gap-1.5`}>
                                                            <PIcon className={`w-3.5 h-3.5 ${plat.color}`} />
                                                            <span className={`text-[10px] font-bold ${plat.color}`}>{post.platform}</span>
                                                        </div>
                                                        {post.format && (
                                                            <span className="text-[10px] text-dim">{post.format}</span>
                                                        )}
                                                    </div>

                                                    <h4 className="font-bold text-main text-sm mb-0.5 line-clamp-2">{post.title}</h4>
                                                    <p className="text-xs text-dim mb-3">{post.client}</p>

                                                    <div className="flex items-center justify-between pt-2.5 border-t border-[#1f1f1f]">
                                                        <span className="text-xs text-dim flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> {post.date}
                                                        </span>
                                                        {/* Approval indicator */}
                                                        {col.id === "APPROVAL" && (
                                                            <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1">
                                                                <Clock className="w-3 h-3" /> Aguardando
                                                            </span>
                                                        )}
                                                        {col.id === "SCHEDULED" && (
                                                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3" /> Aprovado
                                                            </span>
                                                        )}
                                                        {/* Quick move (hover) */}
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                            {colIdx > 0 && (
                                                                <button onClick={() => movePost(post.id, COLUMNS[colIdx - 1].id)} className="p-1 hover:bg-main/10 rounded">
                                                                    <ArrowRight className="w-3 h-3 rotate-180 text-muted hover:text-main" />
                                                                </button>
                                                            )}
                                                            {colIdx < COLUMNS.length - 1 && (
                                                                <button onClick={() => movePost(post.id, COLUMNS[colIdx + 1].id)} className="p-1 hover:bg-main/10 rounded">
                                                                    <ArrowRight className="w-3 h-3 text-muted hover:text-main" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>

                                    <button onClick={() => setShowDemandForm(true)}
                                        className="w-full py-2 rounded-lg border border-dashed border-border text-dim text-xs font-medium hover:border-avaloon-orange/50 hover:text-main transition-colors flex items-center justify-center gap-2">
                                        <Plus className="w-3.5 h-3.5" /> Adicionar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ── CALENDAR VIEW ───────────────────────────── */
                <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
                    {/* Calendar header */}
                    <div className="flex items-center justify-between p-4 border-b border-border bg-background">
                        <h3 className="text-main font-bold">{MONTH_NAMES[calMonth.getMonth()]} {calMonth.getFullYear()}</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))}
                                className="p-1.5 hover:bg-main/10 rounded-lg text-muted hover:text-main transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCalMonth(new Date())}
                                className="px-2 py-1 text-xs text-muted hover:text-main bg-card border border-border rounded-lg">
                                Hoje
                            </button>
                            <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1))}
                                className="p-1.5 hover:bg-main/10 rounded-lg text-muted hover:text-main transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-px bg-[#1a1a1a] flex-1">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
                            <div key={d} className="bg-background py-2 text-center text-[11px] font-bold text-dim tracking-widest">{d}</div>
                        ))}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`e-${i}`} className="bg-background/70 min-h-[80px]" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const today = new Date();
                            const isToday = day === today.getDate() && calMonth.getMonth() === today.getMonth() && calMonth.getFullYear() === today.getFullYear();
                            const dayPosts = postsInMonth.filter(p => new Date(p.scheduled_at).getDate() === day);
                            return (
                                <div key={day} className={`bg-card min-h-[80px] p-2 flex flex-col ${isToday ? "ring-1 ring-inset ring-avaloon-orange/60" : ""}`}>
                                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? "bg-avaloon-orange text-main" : "text-dim"}`}>{day}</span>
                                    <div className="space-y-0.5">
                                        {dayPosts.slice(0, 3).map(p => {
                                            const cfg = platformCfg(p.platform);
                                            const PIcon = cfg.icon;
                                            return (
                                                <button key={p.id} onClick={() => setSelectedPost(p)}
                                                    className={`w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-left ${cfg.bg} hover:opacity-80 transition-opacity`}>
                                                    <PIcon className={`w-2.5 h-2.5 flex-shrink-0 ${cfg.color}`} />
                                                    <span className="text-[10px] text-main truncate">{p.title}</span>
                                                </button>
                                            );
                                        })}
                                        {dayPosts.length > 3 && <p className="text-[9px] text-dim pl-1">+{dayPosts.length - 3} mais</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Demand Form Panel */}
            <AnimatePresence>
                {showDemandForm && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowDemandForm(false)} className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border z-50 shadow-2xl overflow-y-auto">
                            <DemandForm area="DESIGN" onClose={() => setShowDemandForm(false)}
                                onSuccess={() => { loadPosts(); setShowDemandForm(false); }} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Post Detail Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <PostDetailModal
                        post={selectedPost}
                        onClose={() => setSelectedPost(null)}
                        onUpdate={() => { loadPosts(); setSelectedPost(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
