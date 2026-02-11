import { useState, useEffect } from "react";
import { StatCard } from "@/components/ui/StatCard";
import Calendar from "./Calendar";
import { Video, Film, Users, TrendingUp, Palette } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

const activityData = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 18 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 25 },
    { name: 'Fri', value: 30 },
    { name: 'Sat', value: 10 },
    { name: 'Sun', value: 8 },
];

export default function DashboardHome() {
    const [totalArtes, setTotalArtes] = useState(0);

    useEffect(() => {
        // Calculate Total Arts from Clients
        const savedClients = localStorage.getItem('avaloon_clients');
        if (savedClients) {
            const clients = JSON.parse(savedClients);
            const total = clients.reduce((sum, client) => sum + (client.filesCount || 0), 0);
            setTotalArtes(total);
        }
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Visão Geral
                </h2>
                <p className="text-slate-400">Bem-vindo ao Avaloon Hub. Aqui está o resumo de hoje.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Filmagens Ativas" value="8" trend="+2">
                    <div className="flex items-center justify-center h-full text-avaloon-orange">
                        <Video className="w-8 h-8 opacity-80" />
                    </div>
                </StatCard>
                <StatCard label="Artes Entregues (Design)" value={totalArtes} trend="+5">
                    <div className="flex items-center justify-center h-full text-purple-500">
                        <Palette className="w-8 h-8 opacity-80" />
                    </div>
                </StatCard>
                <StatCard label="Equipe Disponível" value="5/12" trend="Normal">
                    <div className="flex items-center justify-center h-full text-green-500">
                        <Users className="w-8 h-8 opacity-80" />
                    </div>
                </StatCard>
                <StatCard label="Produção Semanal" value="24h" trend="+15%">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData}>
                            <defs>
                                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec5b13" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ec5b13" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} cursor={false} />
                            <Area type="monotone" dataKey="value" stroke="#ec5b13" strokeWidth={2} fill="url(#colorActivity)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </StatCard>
            </div>

            {/* Calendar Section */}
            <div className="pt-4 border-t border-white/5">
                <Calendar />
            </div>
        </div>
    );
}
