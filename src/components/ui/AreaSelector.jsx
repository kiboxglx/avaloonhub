import { motion } from "framer-motion";
import { X, Video, Briefcase, Palette, TrendingUp } from "lucide-react";

const AREAS = [
    {
        id: "VIDEOMAKER",
        label: "Videomaker",
        icon: Video,
        color: "from-red-600/20 to-red-900/10 border-red-500/30 hover:border-red-500/60",
        iconColor: "text-red-400",
        badge: "bg-red-500/20 text-red-400",
        description: "Media Day, Gravação, Edição de Vídeo",
        examples: ["📹 Media Day", "🎬 Gravação de Vídeo", "✂️ Edição / Pós-Produção"]
    },
    {
        id: "ACCOUNTS",
        label: "Gerente de Contas",
        icon: Briefcase,
        color: "from-purple-600/20 to-purple-900/10 border-purple-500/30 hover:border-purple-500/60",
        iconColor: "text-purple-400",
        badge: "bg-purple-500/20 text-purple-400",
        description: "Reuniões, Apresentações, Follow-ups",
        examples: ["🤝 Reunião de Alinhamento", "📊 Apresentação de Relatório", "📞 Follow-up com Cliente"]
    },
    {
        id: "DESIGN",
        label: "Design",
        icon: Palette,
        color: "from-green-600/20 to-green-900/10 border-green-500/30 hover:border-green-500/60",
        iconColor: "text-green-400",
        badge: "bg-green-500/20 text-green-400",
        description: "Posts, Artes, Planejamento de Conteúdo",
        examples: ["🖼️ Post / Carrossel", "📱 Stories / Reels", "📅 Planejamento Mensal"]
    },
    {
        id: "TRAFFIC",
        label: "Gestor de Tráfego",
        icon: TrendingUp,
        color: "from-blue-600/20 to-blue-900/10 border-blue-500/30 hover:border-blue-500/60",
        iconColor: "text-blue-400",
        badge: "bg-blue-500/20 text-blue-400",
        description: "Campanhas, Boosts, Relatórios de Ads",
        examples: ["🚀 Lançar Campanha", "🧪 Teste A/B", "📈 Relatório de Performance"]
    }
];

export function AreaSelector({ onSelect, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-background border border-border rounded-2xl w-full max-w-2xl shadow-2xl z-10 overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-card">
                    <div>
                        <h2 className="text-xl font-bold text-main">Nova Ação</h2>
                        <p className="text-sm text-muted mt-0.5">Selecione a área responsável pela demanda</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-main/10 rounded-full text-muted hover:text-main transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Area Grid */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {AREAS.map((area, i) => {
                        const Icon = area.icon;
                        return (
                            <motion.button
                                key={area.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                onClick={() => onSelect(area.id)}
                                className={`bg-gradient-to-br ${area.color} border rounded-xl p-5 text-left transition-all group hover:scale-[1.02] hover:shadow-xl`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2.5 rounded-xl bg-background/30 ${area.iconColor} flex-shrink-0`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-main font-bold text-base">{area.label}</h3>
                                        <p className="text-muted text-xs mt-0.5">{area.description}</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-1">
                                    {area.examples.map((ex, j) => (
                                        <p key={j} className="text-xs text-dim group-hover:text-muted transition-colors">{ex}</p>
                                    ))}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}

// Export color/label helpers so Calendar can use them
export const AREA_CONFIG = {
    VIDEOMAKER: { label: "Videomaker", color: "bg-red-500", textColor: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20", dot: "bg-red-500" },
    ACCOUNTS: { label: "Contas", color: "bg-purple-500", textColor: "text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/20", dot: "bg-purple-500" },
    DESIGN: { label: "Design", color: "bg-green-500", textColor: "text-green-400", bgColor: "bg-green-500/10 border-green-500/20", dot: "bg-green-500" },
    TRAFFIC: { label: "Tráfego", color: "bg-blue-500", textColor: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20", dot: "bg-blue-500" },
    GENERIC: { label: "Geral", color: "bg-slate-500", textColor: "text-muted", bgColor: "bg-slate-500/10 border-slate-500/20", dot: "bg-slate-500" },
};
