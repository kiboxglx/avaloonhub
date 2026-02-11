import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, Legend, CartesianGrid } from "recharts";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, DollarSign, Activity, Video, Palette, Target, Award, Briefcase } from "lucide-react";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";

// --- Mock Data ---

const REVENUE_DATA = [
    { name: 'Jan', value: 125000 },
    { name: 'Fev', value: 132000 },
    { name: 'Mar', value: 145000 },
    { name: 'Abr', value: 142000 },
    { name: 'Mai', value: 158000 },
    { name: 'Jun', value: 175000 },
    { name: 'Jul', value: 189000 },
];

const PROD_DATA = [
    { name: 'Jan', videos: 12, design: 45 },
    { name: 'Fev', videos: 15, design: 52 },
    { name: 'Mar', videos: 18, design: 48 },
    { name: 'Abr', videos: 22, design: 60 },
    { name: 'Mai', videos: 20, design: 65 },
    { name: 'Jun', videos: 25, design: 72 },
    { name: 'Jul', videos: 28, design: 80 },
];

const SECTOR_DATA = [
    { name: 'Varejo', value: 35, color: '#F59E0B' },
    { name: 'Tecnologia', value: 25, color: '#3B82F6' },
    { name: 'Saúde', value: 20, color: '#10B981' },
    { name: 'Serviços', value: 20, color: '#8B5CF6' },
];

const TEAM_PERFORMANCE = [
    { name: 'João Silva', role: 'Videomaker', tasks: 22, rating: 4.8 },
    { name: 'Maria Costa', role: 'Editora', tasks: 18, rating: 4.9 },
    { name: 'Carlos Designer', role: 'Design', tasks: 45, rating: 4.7 },
    { name: 'Ana Social', role: 'Gerente', tasks: 30, rating: 5.0 },
];

// --- Simple Card Component to avoid issues ---
const SimpleCard = ({ children, className }) => (
    <div className={`bg-[#1e1e2d] border border-[#2d2d42] rounded-xl shadow-lg overflow-hidden ${className}`}>
        {children}
    </div>
);

const KPICard = ({ title, value, change, icon: Icon, color, subtext }) => {
    const colorClasses = {
        green: "text-green-500 bg-green-500/10 border-green-500/20",
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
        purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
        red: "text-red-500 bg-red-500/10 border-red-500/20"
    };

    const style = colorClasses[color] || colorClasses.blue;

    return (
        <SimpleCard className="p-6 relative">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl border ${style}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${change >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                        {change > 0 && "+"}{change}%
                        {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    </div>
                )}
            </div>
            <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                {subtext && <p className="text-slate-500 text-[10px] mt-2">{subtext}</p>}
            </div>

            {/* Background Decoration */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 blur-2xl pointer-events-none ${style.split(' ')[0].replace('text-', 'bg-')}`}></div>
        </SimpleCard>
    );
};

export default function Reports() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="space-y-8 pb-10 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                        Central de Inteligência
                    </h1>
                    <p className="text-[#9595c6]">
                        Métricas estratégicas para tomada de decisão baseada em dados.
                    </p>
                </div>
                <div className="flex flex-wrap bg-[#1e1e2d] p-1 rounded-xl border border-[#2d2d42]">
                    {[
                        { id: 'overview', label: 'Visão Geral', icon: Activity },
                        { id: 'finance', label: 'Financeiro', icon: DollarSign },
                        { id: 'production', label: 'Produção', icon: Video },
                        { id: 'team', label: 'Equipe', icon: Users },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                    ? "bg-avaloon-orange text-white shadow-lg shadow-avaloon-orange/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dashboard Content - Direct Rendering without Animation for Stability */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <>
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KPICard title="Faturamento Mensal" value="R$ 189.000" change={12.5} icon={DollarSign} color="green" subtext="Meta: R$ 200k" />
                            <KPICard title="Novos Clientes" value="+8" change={5.2} icon={Users} color="blue" subtext="Total: 42 Ativos" />
                            <KPICard title="Projetos Entregues" value="108" change={-2.4} icon={Target} color="purple" subtext="Vídeos + Design" />
                            <KPICard title="Taxa de Cancelamento" value="1.2%" change={-0.5} icon={Activity} color="orange" subtext="Churn Rate Baixo" />
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <SimpleCard className="lg:col-span-2 p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-avaloon-orange" />
                                    Crescimento Anual (MRR)
                                </h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="99%" height="100%">
                                        <AreaChart data={REVENUE_DATA}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d42" vertical={false} />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#111121', border: '1px solid #2d2d42', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                                formatter={(value) => [`R$ ${value.toLocaleString()}`, "Faturamento"]}
                                            />
                                            <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </SimpleCard>

                            {/* Sector Distribution */}
                            <SimpleCard className="p-6 flex flex-col">
                                <h3 className="text-xl font-bold text-white mb-6">Distribuição por Setor</h3>
                                <div className="flex-1 h-[200px] relative w-full">
                                    <ResponsiveContainer width="99%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={SECTOR_DATA}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {SECTOR_DATA.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#111121', border: '1px solid #2d2d42', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <span className="block text-2xl font-bold text-white">42</span>
                                            <span className="text-[10px] uppercase text-slate-500 font-bold">Clientes</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {SECTOR_DATA.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span>{item.name} ({item.value}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </SimpleCard>
                        </div>
                    </>
                )}

                {activeTab === 'production' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <KPICard title="Vídeos Produzidos" value="380" change={15} icon={Video} color="red" />
                            <KPICard title="Artes Entregues" value="1.250" change={8} icon={Palette} color="purple" />
                            <KPICard title="Projetos em Atraso" value="0" change={0} icon={Target} color="green" subtext="Meta: 0" />
                        </div>

                        <SimpleCard className="p-6">
                            <h3 className="text-xl font-bold text-white mb-6">Produção Mensal (Vídeo vs Design)</h3>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="99%" height="100%">
                                    <BarChart data={PROD_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2d2d42" vertical={false} />
                                        <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                                        <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: '#ffffff05' }}
                                            contentStyle={{ backgroundColor: '#111121', border: '1px solid #2d2d42', borderRadius: '8px' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="videos" name="Vídeos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="design" name="Artes (Design)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </SimpleCard>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Leaderboard */}
                            <SimpleCard className="p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-500" />
                                    Ranking de Produtividade
                                </h3>
                                <div className="space-y-4">
                                    {TEAM_PERFORMANCE.sort((a, b) => b.tasks - a.tasks).map((member, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 bg-[#111121] rounded-lg border border-[#2d2d42] relative overflow-hidden group hover:border-avaloon-orange/30 transition-colors">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${i === 0 ? "bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]" :
                                                    i === 1 ? "bg-slate-300 text-black" :
                                                        i === 2 ? "bg-orange-700 text-white" : "bg-[#2d2d42] text-slate-400"
                                                }`}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-white text-sm">{member.name}</h4>
                                                <p className="text-xs text-slate-500">{member.role}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-lg font-bold text-avaloon-orange">{member.tasks}</span>
                                                <span className="text-[10px] uppercase text-slate-500 font-bold">Entregas</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SimpleCard>

                            {/* Employee of Month Card */}
                            <div className="bg-gradient-to-br from-avaloon-orange to-red-600 rounded-xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between text-white border border-white/10">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                                        <Award className="w-4 h-4 text-white" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Destaque do Mês</span>
                                    </div>
                                    <h3 className="text-3xl font-black mb-1">Ana Social</h3>
                                    <p className="text-white/80 font-medium mb-6">Gerente de Contas</p>

                                    <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
                                        <p className="text-sm italic">"Ana superou todas as metas de engajamento e trouxe 3 novos clientes estratégicos este mês!"</p>
                                    </div>
                                </div>

                                <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4 pointer-events-none">
                                    <Award className="w-64 h-64 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'finance' && (
                    <div className="flex items-center justify-center h-[400px] bg-[#1e1e2d] border border-[#2d2d42] rounded-xl border-dashed">
                        <div className="text-center">
                            <DollarSign className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold text-white">Módulo Financeiro Avançado</h3>
                            <p className="text-slate-400 max-w-md mx-auto mt-2">
                                Conecte suas contas bancárias ou integre com ERP para visualizar fluxo de caixa em tempo real.
                            </p>
                            <ButtonAvaloon className="mt-6" variant="primary">
                                <Briefcase className="w-4 h-4" /> Configurar Integração
                            </ButtonAvaloon>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
