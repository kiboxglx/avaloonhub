import { GlassCard } from "./GlassCard";

export const StatCard = ({ label, value, trend, children }) => (
    <GlassCard className="p-5 flex flex-col">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
                <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold ${trend.toString().includes('+') ? 'bg-emerald-500/10 text-emerald-500' :
                    trend.toString().includes('-') ? 'bg-red-500/10 text-red-500' :
                        'bg-slate-500/10 text-slate-400'
                }`}>
                {trend}
            </span>
        </div>
        <div className="mt-auto h-12 w-full">
            {children} {/* Aqui entra o mini-gráfico (Sparkline) */}
        </div>
    </GlassCard>
);
