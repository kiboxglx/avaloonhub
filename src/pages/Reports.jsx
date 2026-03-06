import { useState, useEffect } from "react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
    ResponsiveContainer, BarChart, Bar, Legend, CartesianGrid
} from "recharts";
import {
    ArrowUpRight, TrendingUp, Users, Activity, Video, Palette, Target,
    Award, Briefcase, Loader2, CheckCircle2, Clock, AlertTriangle
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { AREA_CONFIG } from "@/components/ui/AreaSelector";

// ── Shared helpers ────────────────────────────────────────────────────────────
const SimpleCard = ({ children, className }) => (
    <div className={`bg-card border border-border rounded-xl shadow-lg overflow-hidden ${className}`}>
        {children}
    </div>
);

const TooltipStyle = {
    contentStyle: { backgroundColor: '#000000', border: '1px solid #1a1a1a', borderRadius: '8px' },
    itemStyle: { color: '#fff' },
};

const KPICard = ({ title, value, icon: Icon, color, subtext, loading }) => {
    const colorClasses = {
        green: "text-green-400 bg-green-500/10 border-green-500/20",
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        red: "text-red-400 bg-red-500/10 border-red-500/20",
    };
    const style = colorClasses[color] || colorClasses.blue;
    return (
        <SimpleCard className="p-6 relative">
            <div className={`p-3 rounded-xl border w-fit mb-4 ${style}`}>
                <Icon className="w-5 h-5" />
            </div>
            {loading ? (
                <div className="animate-pulse space-y-2">
                    <div className="h-8 w-24 bg-main/10 rounded" />
                    <div className="h-3 w-16 bg-main/10 rounded" />
                </div>
            ) : (
                <>
                    <h3 className="text-3xl font-black text-main mb-1">{value ?? "—"}</h3>
                    <p className="text-muted text-xs font-bold uppercase tracking-wider">{title}</p>
                    {subtext && <p className="text-dim text-[10px] mt-1">{subtext}</p>}
                </>
            )}
        </SimpleCard>
    );
};

// ── Area colours for pie chart ────────────────────────────────────────────────
const AREA_COLORS = {
    VIDEOMAKER: "#ef4444",
    ACCOUNTS: "#a855f7",
    DESIGN: "#22c55e",
    TRAFFIC: "#3b82f6",
    GENERIC: "#6b7280",
};

const SECTOR_PALETTE = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec5b13", "#06b6d4", "#f43f5e"];

// ── Recharts Custom Tooltip ───────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-background border border-border rounded-xl px-3 py-2 shadow-2xl text-xs">
            {label && <p className="text-muted mb-1 font-bold">{label}</p>}
            {payload.map((p, i) => (
                <p key={i} className="font-bold" style={{ color: p.color || "#fff" }}>{p.name}: {p.value}</p>
            ))}
        </div>
    );
};

// ── Data loading hook ─────────────────────────────────────────────────────────
function useReportsData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const [kpis, monthlyChart, allDemands, clients, team] = await Promise.all([
                    dataService.dashboard.getKPIs(),
                    dataService.dashboard.getDemandsPerMonth(),
                    dataService.demands.getAll(),
                    dataService.clients.getAll(),
                    dataService.team.getAll(),
                ]);

                // Demands by area
                const areaCount = {};
                allDemands.forEach(d => {
                    const a = d.area || "GENERIC";
                    areaCount[a] = (areaCount[a] || 0) + 1;
                });
                const areaChartData = Object.entries(areaCount).map(([key, value]) => ({
                    name: AREA_CONFIG[key]?.label || key,
                    value,
                    color: AREA_COLORS[key] || "#6b7280",
                }));

                // Demands by status
                const statusCount = {};
                allDemands.forEach(d => { statusCount[d.status] = (statusCount[d.status] || 0) + 1; });

                // Client sectors
                const sectorCount = {};
                clients.forEach(c => { if (c.sector) sectorCount[c.sector] = (sectorCount[c.sector] || 0) + 1; });
                const sectorData = Object.entries(sectorCount)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, value], i) => ({ name, value, color: SECTOR_PALETTE[i % SECTOR_PALETTE.length] }));

                // Top clients by demand count
                const clientDemandCount = {};
                allDemands.forEach(d => {
                    if (d.clients?.name) clientDemandCount[d.clients.name] = (clientDemandCount[d.clients.name] || 0) + 1;
                });
                const topClients = Object.entries(clientDemandCount)
                    .sort((a, b) => b[1] - a[1]).slice(0, 5)
                    .map(([name, value]) => ({ name, value }));

                // Team leaderboard from production_records (proxy by demands assigned)
                const teamLeaderboard = team.map(m => {
                    const memberDemands = allDemands.filter(d => d.assigned_to === m.id || d.profiles?.full_name === m.name);
                    return { name: m.name, role: m.role, tasks: memberDemands.length };
                }).sort((a, b) => b.tasks - a.tasks).slice(0, 5);

                setData({
                    kpis, monthlyChart, areaChartData, sectorData, topClients,
                    teamLeaderboard, statusCount,
                    doneDemands: (allDemands.filter(d => d.status === 'DONE') || []).length,
                    totalClients: clients.length,
                    totalTeam: team.length,
                });
            } catch (e) {
                console.error("Erro ao carregar relatórios:", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return { data, loading };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Reports() {
    const [activeTab, setActiveTab] = useState("overview");
    const { data, loading } = useReportsData();

    const TABS = [
        { id: "overview", label: "Visão Geral", icon: Activity },
        { id: "production", label: "Produção", icon: Video },
        { id: "clients", label: "Clientes", icon: Briefcase },
        { id: "team", label: "Equipe", icon: Users },
    ];

    return (
        <div className="space-y-8 pb-10 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-main tracking-tight mb-2">Central de Inteligência</h1>
                    <p className="text-muted text-sm">Métricas reais da sua agência, atualizadas ao vivo.</p>
                </div>
                <div className="flex flex-wrap bg-card p-1 rounded-xl border border-border gap-1">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                ? "bg-avaloon-orange text-main shadow-lg shadow-avaloon-orange/20"
                                : "text-muted hover:text-main hover:bg-main/5"}`}>
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">

                {/* ── OVERVIEW ── */}
                {activeTab === "overview" && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <KPICard title="Demandas Ativas" value={data?.kpis?.activeDemands} icon={Activity} color="orange" loading={loading} subtext="em andamento agora" />
                            <KPICard title="Concluídas no Mês" value={data?.kpis?.doneDemands} icon={CheckCircle2} color="green" loading={loading} subtext="entregues" />
                            <KPICard title="Clientes Ativos" value={data?.totalClients ?? data?.kpis?.totalClients} icon={Briefcase} color="blue" loading={loading} />
                            <KPICard title="Artes no Drive" value={data?.kpis?.totalArtes} icon={Palette} color="purple" loading={loading} subtext="arquivos este mês" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Monthly Demands Area Chart */}
                            <SimpleCard className="lg:col-span-2 p-6">
                                <h3 className="text-xl font-bold text-main mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-avaloon-orange" /> Demandas por Mês
                                </h3>
                                {loading ? (
                                    <div className="h-[260px] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-avaloon-orange" /></div>
                                ) : (
                                    <div className="h-[260px]">
                                        <ResponsiveContainer width="99%" height="100%">
                                            <AreaChart data={data?.monthlyChart || []}>
                                                <defs>
                                                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ec5b13" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#ec5b13" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                                                <Tooltip content={<ChartTooltip />} />
                                                <Area type="monotone" dataKey="value" name="Demandas" stroke="#ec5b13" strokeWidth={3} fillOpacity={1} fill="url(#g1)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </SimpleCard>

                            {/* Demands by Area donut */}
                            <SimpleCard className="p-6 flex flex-col">
                                <h3 className="text-xl font-bold text-main mb-4">Por Área</h3>
                                {loading ? (
                                    <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-avaloon-orange" /></div>
                                ) : (
                                    <>
                                        <div className="h-[180px] relative">
                                            <ResponsiveContainer width="99%" height="100%">
                                                <PieChart>
                                                    <Pie data={data?.areaChartData || []} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                                                        {(data?.areaChartData || []).map((entry, i) => (
                                                            <Cell key={i} fill={entry.color} stroke="none" />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<ChartTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="text-center">
                                                    <span className="block text-2xl font-black text-main">{data?.kpis?.totalDemands ?? 0}</span>
                                                    <span className="text-[10px] uppercase text-dim font-bold">Total</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            {(data?.areaChartData || []).map((item, i) => (
                                                <div key={i} className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-muted">{item.name}</span></div>
                                                    <span className="text-main font-bold">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </SimpleCard>
                        </div>
                    </>
                )}

                {/* ── PRODUCTION ── */}
                {activeTab === "production" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            {[
                                { title: "Total Demandas", value: data?.kpis?.totalDemands, icon: Activity, color: "orange" },
                                { title: "Videomaker", value: data?.areaChartData?.find(a => a.name === "Videomaker")?.value || 0, icon: Video, color: "red" },
                                { title: "Design", value: data?.areaChartData?.find(a => a.name === "Design")?.value || 0, icon: Palette, color: "purple" },
                                { title: "Concluídas", value: data?.doneDemands, icon: CheckCircle2, color: "green" },
                            ].map(k => <KPICard key={k.title} {...k} loading={loading} />)}
                        </div>

                        <SimpleCard className="p-6">
                            <h3 className="text-xl font-bold text-main mb-6">Demandas por Mês (últimos 6 meses)</h3>
                            {loading ? (
                                <div className="h-[300px] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-avaloon-orange" /></div>
                            ) : (
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="99%" height="100%">
                                        <BarChart data={data?.monthlyChart || []} barSize={32}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                            <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} fontSize={11} />
                                            <YAxis stroke="#6b7280" axisLine={false} tickLine={false} fontSize={11} allowDecimals={false} />
                                            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                            <Bar dataKey="value" name="Demandas" fill="#ec5b13" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </SimpleCard>
                    </div>
                )}

                {/* ── CLIENTS ── */}
                {activeTab === "clients" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <KPICard title="Total de Clientes" value={data?.kpis?.totalClients} icon={Briefcase} color="blue" loading={loading} />
                            <KPICard title="Setores Únicos" value={data?.sectorData?.length || 0} icon={Target} color="orange" loading={loading} />
                            <KPICard title="Artes Produzidas" value={data?.kpis?.totalArtes} icon={Palette} color="green" loading={loading} subtext="arquivos no Drive este mês" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Clients by Demands */}
                            <SimpleCard className="p-6">
                                <h3 className="text-xl font-bold text-main mb-5">Top Clientes por Demandas</h3>
                                {loading ? (
                                    <div className="h-[200px] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-avaloon-orange" /></div>
                                ) : (data?.topClients || []).length === 0 ? (
                                    <div className="text-center py-8 text-dim">Nenhum dado ainda.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {(data?.topClients || []).map((c, i) => {
                                            const maxVal = data.topClients[0]?.value || 1;
                                            const pct = Math.round((c.value / maxVal) * 100);
                                            return (
                                                <div key={i}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-main font-medium">{c.name}</span>
                                                        <span className="text-avaloon-orange font-bold">{c.value} demandas</span>
                                                    </div>
                                                    <div className="h-2 bg-[#1f1f1f] rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-avaloon-orange to-red-500 rounded-full" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </SimpleCard>

                            {/* Client Sectors Pie */}
                            <SimpleCard className="p-6 flex flex-col">
                                <h3 className="text-xl font-bold text-main mb-4">Distribuição por Setor</h3>
                                {loading ? (
                                    <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-avaloon-orange" /></div>
                                ) : (data?.sectorData || []).length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center text-dim text-sm">Nenhum setor cadastrado.</div>
                                ) : (
                                    <>
                                        <div className="h-[180px]">
                                            <ResponsiveContainer width="99%" height="100%">
                                                <PieChart>
                                                    <Pie data={data.sectorData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                                                        {data.sectorData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                                                    </Pie>
                                                    <Tooltip content={<ChartTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-3">
                                            {data.sectorData.map((s, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-muted">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                                                    <span>{s.name} ({s.value})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </SimpleCard>
                        </div>
                    </div>
                )}

                {/* ── TEAM ── */}
                {activeTab === "team" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <KPICard title="Membros na Equipe" value={data?.kpis?.totalTeam} icon={Users} color="blue" loading={loading} />
                            <KPICard title="Disponíveis Agora" value={data?.kpis?.availableTeam} icon={CheckCircle2} color="green" loading={loading} />
                            <KPICard title="Demandas em Andamento" value={data?.kpis?.activeDemands} icon={Clock} color="orange" loading={loading} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Leaderboard */}
                            <SimpleCard className="p-6">
                                <h3 className="text-xl font-bold text-main mb-5 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-500" /> Ranking por Demandas
                                </h3>
                                {loading ? (
                                    <div className="h-48 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-avaloon-orange" /></div>
                                ) : (data?.teamLeaderboard || []).length === 0 ? (
                                    <div className="text-center py-8 text-dim">Sem dados de equipe.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {data.teamLeaderboard.map((member, i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 bg-background rounded-xl border border-border hover:border-avaloon-orange/30 transition-colors">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 ${i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-slate-300 text-black" : i === 2 ? "bg-orange-700 text-main" : "bg-[#1a1a1a] text-muted"
                                                    }`}>{i + 1}</div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-main text-sm truncate">{member.name}</h4>
                                                    <p className="text-xs text-dim">{member.role}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-lg font-black text-avaloon-orange">{member.tasks}</span>
                                                    <span className="text-[10px] uppercase text-dim font-bold">Demandas</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SimpleCard>

                            {/* Status breakdown */}
                            <SimpleCard className="p-6">
                                <h3 className="text-xl font-bold text-main mb-5">Demandas por Status</h3>
                                {loading ? (
                                    <div className="h-48 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-avaloon-orange" /></div>
                                ) : (
                                    <div className="space-y-4">
                                        {[
                                            { label: "A Fazer", key: "TODO", color: "bg-slate-500", track: "bg-slate-500/20" },
                                            { label: "Em Produção", key: "DOING", color: "bg-blue-500", track: "bg-blue-500/20" },
                                            { label: "Em Revisão", key: "REVIEW", color: "bg-orange-500", track: "bg-orange-500/20" },
                                            { label: "Concluído", key: "DONE", color: "bg-emerald-500", track: "bg-emerald-500/20" },
                                        ].map(({ label, key, color, track }) => {
                                            const val = data?.statusCount?.[key] || 0;
                                            const total = data?.kpis?.totalDemands || 1;
                                            const pct = Math.round((val / total) * 100);
                                            return (
                                                <div key={key}>
                                                    <div className="flex justify-between text-sm mb-1.5">
                                                        <span className="text-slate-300 font-medium">{label}</span>
                                                        <span className="text-main font-bold">{val} <span className="text-dim text-xs font-normal">({pct}%)</span></span>
                                                    </div>
                                                    <div className={`h-2 rounded-full overflow-hidden ${track}`}>
                                                        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </SimpleCard>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
