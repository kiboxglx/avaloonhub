import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { DollarSign, Video, Download, Filter } from "lucide-react";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";

const productionSpendData = [
    { name: 'Jan', value: 1200 },
    { name: 'Fev', value: 2100 },
    { name: 'Mar', value: 1500 },
    { name: 'Abr', value: 3200 },
    { name: 'Mai', value: 1800 },
    { name: 'Jun', value: 2500 },
    { name: 'Jul', value: 2900 },
];

const expenses = [
    { id: 1, videomaker: "Lucas Silva", project: "Comercial de Verão", date: "Hoje, 10:00", amount: "R$ 450,00", status: "Pago" },
    { id: 2, videomaker: "Ana Costa", project: "Cobertura de Evento", date: "Ontem, 16:30", amount: "R$ 300,00", status: "Pendente" },
    { id: 3, videomaker: "Pedro Santos", project: "Edição Institucional", date: "10 Ago, 09:15", amount: "R$ 600,00", status: "Pago" },
    { id: 4, videomaker: "Lucas Silva", project: "Shoot Externo", date: "08 Ago, 14:00", amount: "R$ 450,00", status: "Pago" },
    { id: 5, videomaker: "Carla Dias", project: "Drone Footage", date: "05 Ago, 11:20", amount: "R$ 800,00", status: "Processando" },
];

export default function Finance() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Financeiro de Produção
                    </h2>
                    <p className="text-slate-400">Controle de pagamentos de diárias e despesas de filmagem.</p>
                </div>
                <div className="flex gap-2">
                    <ButtonAvaloon variant="outline">
                        <Download className="w-4 h-4" /> Exportar Relatório
                    </ButtonAvaloon>
                    <ButtonAvaloon variant="primary">
                        <DollarSign className="w-4 h-4" /> Registrar Pagamento
                    </ButtonAvaloon>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Gasto em Produção" value="R$ 15.200,00" trend="+5% mês">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={productionSpendData}>
                            <defs>
                                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec5b13" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ec5b13" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} itemStyle={{ color: '#ec5b13' }} />
                            <Area type="monotone" dataKey="value" stroke="#ec5b13" fillOpacity={1} fill="url(#colorSpend)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </StatCard>
                <StatCard label="Diárias Pagas (Mês)" value="34" trend="+3">
                    <div className="flex items-center justify-center h-full text-slate-400 font-medium">
                        <Video className="w-5 h-5 mr-2 text-avaloon-orange" />
                        Filmagens Confirmadas
                    </div>
                </StatCard>
                <StatCard label="Pagamentos Pendentes" value="R$ 1.850,00" trend="Atenção">
                    <div className="flex items-center justify-center h-full text-yellow-500 font-bold">
                        3 Faturas Abertas
                    </div>
                </StatCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Histórico de Pagamentos</h3>
                        <ButtonAvaloon variant="ghost" className="text-xs h-8">
                            <Filter className="w-3 h-3 mr-1" /> Filtrar
                        </ButtonAvaloon>
                    </div>
                    <div className="space-y-4">
                        {expenses.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                                        {item.videomaker.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{item.videomaker}</p>
                                        <p className="text-xs text-slate-400">{item.project} • {item.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-white block">{item.amount}</span>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${item.status === 'Pago' ? 'bg-emerald-500/10 text-emerald-500' :
                                            item.status === 'Pendente' ? 'bg-yellow-500/10 text-yellow-500' :
                                                'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Regras de Pagamento</h3>
                    <div className="space-y-4 text-sm text-slate-300">
                        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                            <strong className="block text-white mb-1">Diária Padrão</strong>
                            Pagamento realizado até 2 dias úteis após a confirmação do material bruto.
                        </div>
                        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                            <strong className="block text-white mb-1">Reembolso de Transporte</strong>
                            Necessário anexar comprovantes (Uber/Combustível) no briefing do projeto.
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5">
                        <ButtonAvaloon variant="outline" className="w-full justify-center">
                            Configurar Tabelas de Preços
                        </ButtonAvaloon>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
