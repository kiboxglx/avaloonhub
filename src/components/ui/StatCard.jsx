import { GlassCard } from "./GlassCard";

// Skeleton pulse line helper
const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-main/10 rounded ${className}`} />
);

export const StatCard = ({ label, value, trend, icon: Icon, subLabel, loading = false, children, accentColor = "text-avaloon-orange" }) => {
    if (loading) {
        return (
            <GlassCard className="p-5 flex flex-col gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-12 w-full mt-auto" />
            </GlassCard>
        );
    }

    const trendStr = trend?.toString() || "";
    const trendColor = trendStr.includes('+') ? 'bg-emerald-500/10 text-emerald-400'
        : trendStr.includes('-') ? 'bg-red-500/10 text-red-400'
            : 'bg-slate-500/10 text-muted';

    return (
        <GlassCard className="p-5 flex flex-col group hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    {Icon && (
                        <div className={`p-2 rounded-lg bg-main/5 ${accentColor}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                    <p className="text-xs font-semibold text-dim uppercase tracking-wide leading-tight">{label}</p>
                </div>
                {trendStr && (
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${trendColor}`}>{trendStr}</span>
                )}
            </div>
            <h3 className="text-3xl font-black text-main mb-0.5">{value ?? "—"}</h3>
            {subLabel && <p className="text-xs text-dim">{subLabel}</p>}
            <div className="mt-auto h-12 w-full pt-2">
                {children}
            </div>
        </GlassCard>
    );
};
