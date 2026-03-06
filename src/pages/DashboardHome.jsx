import { useState, useEffect } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { dataService } from "@/services/dataService";
import { AREA_CONFIG } from "@/components/ui/AreaSelector";
import {
    Video, Users, TrendingUp, Briefcase, Palette, CheckCircle2,
    Clock, AlertCircle, LayoutDashboard, Camera, Clapperboard, Film,
    Megaphone, MousePointerClick, Target, DollarSign, Smartphone,
    PlayCircle, BarChart2
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from "recharts";
import { motion } from "framer-motion";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtCurrency = (v) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
            <p className="text-muted mb-1">{label}</p>
            <p className="text-main font-bold">{payload[0].value} demandas</p>
        </div>
    );
};

// ── Mini Row (inside area card) ───────────────────────────────────────────────
const MiniRow = ({ icon: Icon, label, value, color = "text-main" }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-main/5 last:border-0">
        <div className="flex items-center gap-2">
            <Icon className={`w-3.5 h-3.5 ${color}`} />
            <span className="text-xs text-muted">{label}</span>
        </div>
        <span className={`text-sm font-black ${color}`}>{value ?? "—"}</span>
    </div>
);

// ── Area KPI Card ─────────────────────────────────────────────────────────────
function AreaKpiCard({ title, accentClass, dotClass, headerBg, icon: HeaderIcon, children, loading }) {
    return (
        <GlassCard className="p-0 overflow-hidden">
            {/* Colored header */}
            <div className={`${headerBg} px-4 py-3 flex items-center gap-2.5`}>
                <HeaderIcon className={`w-4 h-4 ${accentClass}`} />
                <h3 className={`font-black text-sm uppercase tracking-wider ${accentClass}`}>{title}</h3>
                <div className={`ml-auto w-2 h-2 rounded-full ${dotClass}`} />
            </div>
            <div className="px-4 py-3">
                {loading ? (
                    <div className="space-y-2.5">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse flex justify-between items-center">
                                <div className="h-3 bg-main/10 rounded w-28" />
                                <div className="h-3 bg-main/10 rounded w-6" />
                            </div>
                        ))}
                    </div>
                ) : children}
            </div>
        </GlassCard>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardHome() {
    const [kpis, setKpis] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [recentDemands, setRecentDemands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const [kpiData, monthlyData, allDemands] = await Promise.all([
                    dataService.dashboard.getKPIs(),
                    dataService.dashboard.getDemandsPerMonth(),
                    dataService.demands.getAll(null, null, 6)
                ]);
                setKpis(kpiData);
                setChartData(monthlyData);
                setRecentDemands(allDemands);
            } catch (err) {
                console.error("Erro ao carregar dashboard:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const now = new Date();
    const greeting = now.getHours() < 12 ? "Bom dia" : now.getHours() < 18 ? "Boa tarde" : "Boa noite";
    const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    const monthName = now.toLocaleString("pt-BR", { month: "long" });

    // ── Stat cards row (top 6) ────────────────────────────────────────────────
    const statCards = [
        {
            label: "Demandas Ativas",
            value: kpis?.activeDemands,
            trend: kpis?.activeDemands > 10 ? "⚠️ Alta carga" : "Normal",
            icon: Video,
            accentColor: "text-red-400",
            subLabel: "em andamento agora",
        },
        {
            label: "Entregues este Mês",
            value: kpis?.doneDemands,
            trend: `+${kpis?.doneDemands ?? 0}`,
            icon: CheckCircle2,
            accentColor: "text-emerald-400",
            subLabel: "demandas concluídas",
        },
        {
            label: "Artes Produzidas",
            value: kpis?.totalArtes,
            trend: kpis?.totalArtes > 0 ? `+${kpis?.totalArtes}` : "0",
            icon: Palette,
            accentColor: "text-green-400",
            subLabel: `arquivos no Drive — ${monthName}`,
        },
        {
            label: "Equipe Disponível",
            value: kpis ? `${kpis.availableTeam}/${kpis.totalTeam}` : "—",
            trend: kpis?.availableTeam === 0 ? "Ocupada" : "Disponível",
            icon: Users,
            accentColor: "text-blue-400",
            subLabel: "membros livres",
        },
        {
            label: "Clientes Ativos",
            value: kpis?.activeClients,
            trend: `Total ativo`,
            icon: Briefcase,
            accentColor: "text-purple-400",
            subLabel: "contratos em vigor",
        },
        {
            label: "Receita Mensal",
            value: kpis ? fmtCurrency(kpis.monthlyRevenue) : "—",
            trend: "MRR",
            icon: DollarSign,
            accentColor: "text-yellow-400",
            subLabel: "soma dos contratos",
        },
    ];

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <p className="text-muted text-sm capitalize">{dateStr}</p>
                    <h1 className="text-3xl font-black text-main mt-1">
                        {greeting}, <span className="text-avaloon-orange">Avaloon</span> 👋
                    </h1>
                    <p className="text-dim text-sm mt-0.5">Aqui está o resumo de hoje da sua agência.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm text-muted">
                    <LayoutDashboard className="w-4 h-4 text-avaloon-orange" />
                    Visão Geral
                </div>
            </div>

            {/* ── Top 6 StatCards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <StatCard {...card} loading={loading} />
                    </motion.div>
                ))}
            </div>

            {/* ── Area KPI Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* 🎬 Videomaker */}
                <AreaKpiCard
                    title="Videomaker"
                    headerBg="bg-red-500/10"
                    accentClass="text-red-400"
                    dotClass="bg-red-500"
                    icon={Clapperboard}
                    loading={loading}
                >
                    <div className="mb-3">
                        <p className="text-3xl font-black text-red-400">{kpis?.videomaker?.totalMonth ?? 0}</p>
                        <p className="text-[10px] text-dim uppercase font-bold">produções concluídas em {monthName}</p>
                    </div>
                    <MiniRow icon={Camera} label="Media Days" value={kpis?.videomaker?.mediaDays} color="text-red-300" />
                    <MiniRow icon={PlayCircle} label="Gravações" value={kpis?.videomaker?.gravacoes} color="text-orange-300" />
                    <MiniRow icon={Film} label="Edições" value={kpis?.videomaker?.edicoes} color="text-yellow-300" />
                    <MiniRow icon={Clock} label="Em Produção" value={kpis?.videomaker?.inProgress} color="text-blue-300" />
                    <MiniRow icon={AlertCircle} label="A Fazer" value={kpis?.videomaker?.todo} color="text-muted" />
                </AreaKpiCard>

                {/* 🎨 Design */}
                <AreaKpiCard
                    title="Design"
                    headerBg="bg-green-500/10"
                    accentClass="text-green-400"
                    dotClass="bg-green-500"
                    icon={Palette}
                    loading={loading}
                >
                    <div className="mb-3">
                        <p className="text-3xl font-black text-green-400">{kpis?.design?.artesMonth ?? 0}</p>
                        <p className="text-[10px] text-dim uppercase font-bold">artes no Drive — {monthName}</p>
                    </div>
                    <MiniRow icon={CheckCircle2} label="Concluídas" value={kpis?.design?.done} color="text-emerald-400" />
                    <MiniRow icon={BarChart2} label="Em Revisão" value={kpis?.design?.review} color="text-orange-300" />
                    <MiniRow icon={Clock} label="Em Produção" value={kpis?.design?.inProgress} color="text-blue-300" />
                    <MiniRow icon={Smartphone} label="Plataforma Top" value={kpis?.design?.topPlatform} color="text-green-300" />
                </AreaKpiCard>

                {/* 📣 Traffic */}
                <AreaKpiCard
                    title="Traffic"
                    headerBg="bg-blue-500/10"
                    accentClass="text-blue-400"
                    dotClass="bg-blue-500"
                    icon={Megaphone}
                    loading={loading}
                >
                    <div className="mb-3">
                        <p className="text-3xl font-black text-blue-400">{kpis?.traffic?.active ?? 0}</p>
                        <p className="text-[10px] text-dim uppercase font-bold">campanhas ativas agora</p>
                    </div>
                    <MiniRow icon={CheckCircle2} label="Concluídas (mês)" value={kpis?.traffic?.done} color="text-emerald-400" />
                    <MiniRow icon={AlertCircle} label="A Iniciar" value={kpis?.traffic?.todo} color="text-muted" />
                    <MiniRow icon={Target} label="Investimento (R$)"
                        value={kpis?.traffic?.totalBudget != null ? fmtCurrency(kpis.traffic.totalBudget) : "—"}
                        color="text-yellow-400"
                    />
                    <MiniRow icon={MousePointerClick} label="Plataforma Ads" value="Meta / Google" color="text-blue-300" />
                </AreaKpiCard>
            </div>

            {/* ── Chart + Summary ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-main">Demandas por Mês</h3>
                            <p className="text-xs text-dim">Últimos 6 meses</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-avaloon-orange" />
                    </div>
                    {loading ? (
                        <div className="h-48 animate-pulse bg-main/5 rounded-xl" />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="value" fill="#ec5b13" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>

                <GlassCard className="p-6 flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-main">Resumo Geral</h3>
                    <div className="space-y-2 flex-1">
                        {[
                            { label: "Total de Demandas", value: kpis?.totalDemands, icon: Video, color: "text-red-400" },
                            { label: "Clientes Ativos", value: kpis?.activeClients, icon: Briefcase, color: "text-purple-400" },
                            { label: "Membros da Equipe", value: kpis?.totalTeam, icon: Users, color: "text-blue-400" },
                            { label: "Artes no Drive", value: kpis?.totalArtes, icon: Palette, color: "text-green-400" },
                            { label: "MRR", value: kpis ? fmtCurrency(kpis.monthlyRevenue) : "—", icon: DollarSign, color: "text-yellow-400" },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                <div className="flex items-center gap-2">
                                    <Icon className={`w-4 h-4 ${color}`} />
                                    <span className="text-xs text-muted">{label}</span>
                                </div>
                                {loading
                                    ? <div className="animate-pulse bg-main/10 rounded h-4 w-10" />
                                    : <span className="text-main font-bold text-sm">{value ?? "—"}</span>
                                }
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* ── Recent Demands ── */}
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-main">Demandas Recentes</h3>
                    <a href="/dashboard/briefings" className="text-xs text-avaloon-orange hover:underline font-bold">Ver todas →</a>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-main/5 rounded-xl">
                                <div className="w-2 h-2 rounded-full bg-main/10" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 bg-main/10 rounded w-48" />
                                    <div className="h-2 bg-main/10 rounded w-24" />
                                </div>
                                <div className="h-5 w-16 bg-main/10 rounded" />
                            </div>
                        ))}
                    </div>
                ) : recentDemands.length === 0 ? (
                    <div className="text-center py-10 text-dim">
                        <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>Nenhuma demanda criada ainda.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {recentDemands.map((d, i) => {
                            const area = d.area || "GENERIC";
                            const cfg = AREA_CONFIG[area] || AREA_CONFIG.GENERIC;
                            const STATUS_COLOR = {
                                TODO: "bg-slate-500/20 text-muted",
                                DOING: "bg-blue-500/20 text-blue-400",
                                REVIEW: "bg-orange-500/20 text-orange-400",
                                DONE: "bg-emerald-500/20 text-emerald-400",
                            };
                            const STATUS_LABEL = { TODO: "A Fazer", DOING: "Em Produção", REVIEW: "Revisão", DONE: "Concluído" };
                            const avatarUrl = d.assignee?.avatar_url
                                || (d.assignee?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(d.assignee.name)}&background=1e1e2d&color=ec5b13&bold=true&size=32` : null);
                            return (
                                <motion.div key={d.id}
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-main/5 transition-colors">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-main truncate">{d.title}</p>
                                        <p className="text-xs text-dim">{d.clients?.name || "—"} · {cfg.label}</p>
                                    </div>
                                    {avatarUrl && (
                                        <img src={avatarUrl} alt="" title={d.assignee?.name} className="w-6 h-6 rounded-full ring-1 ring-[#1a1a1a] flex-shrink-0" />
                                    )}
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${STATUS_COLOR[d.status] || STATUS_COLOR.TODO}`}>
                                        {STATUS_LABEL[d.status] || d.status}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
