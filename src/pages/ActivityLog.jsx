import { useState } from "react";
import {
    Search, Filter, History, User, FilePlus, FileEdit, Trash2,
    CheckCircle, AlertCircle, Calendar, Video, Palette, Briefcase
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const MOCK_LOGS = [
    { id: 1, user: "João Silva", role: "Videomaker", action: "create", target: "Projeto Alpha Externa", sector: "Video", time: "Há 10 min" },
    { id: 2, user: "Maria Costa", role: "Editora", action: "update", target: "Status Reels Beta", sector: "Video", time: "Há 30 min", detail: "Mudou de 'Edição' para 'Aprovação'" },
    { id: 3, user: "Ana Social", role: "Gerente", action: "delete", target: "Post Dia 15 Cancelado", sector: "Social", time: "Há 2 horas" },
    { id: 4, user: "Carlos Design", role: "Designer", action: "create", target: "Carrossel Dicas", sector: "Design", time: "Há 3 horas" },
    { id: 5, user: "Admin", role: "Gestão", action: "update", target: "Contrato Delta", sector: "Financeiro", time: "Ontem" },
    { id: 6, user: "João Silva", role: "Videomaker", action: "update", target: "Inventário: Sony A7S", sector: "Equipment", time: "Ontem", detail: "Marcou como 'Em Uso'" },
];

export default function ActivityLog() {
    const [filter, setFilter] = useState("Todos");
    const [searchTerm, setSearchTerm] = useState("");

    const getIcon = (action) => {
        switch (action) {
            case 'create': return <FilePlus className="w-4 h-4 text-green-500" />;
            case 'update': return <FileEdit className="w-4 h-4 text-blue-500" />;
            case 'delete': return <Trash2 className="w-4 h-4 text-red-500" />;
            default: return <History className="w-4 h-4 text-slate-500" />;
        }
    };

    const getSectorIcon = (sector) => {
        switch (sector) {
            case 'Video': return <Video className="w-3 h-3" />;
            case 'Design': return <Palette className="w-3 h-3" />;
            case 'Social': return <User className="w-3 h-3" />;
            case 'Financeiro': return <Briefcase className="w-3 h-3" />;
            default: return <History className="w-3 h-3" />;
        }
    };

    // Filter Logic
    const filteredLogs = MOCK_LOGS.filter(log => {
        const matchesFilter = filter === "Todos" || log.sector === filter;
        const matchesSearch = log.target.toLowerCase().includes(searchTerm.toLowerCase()) || log.user.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
                        <History className="w-8 h-8 text-white" />
                        Histórico de Atividades
                    </h2>
                    <p className="text-slate-400">Rastreabilidade completa de ações por setor.</p>
                </div>
            </div>

            {/* Filters */}
            <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {["Todos", "Video", "Design", "Social", "Financeiro"].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === cat
                                    ? "bg-avaloon-orange text-white"
                                    : "bg-[#111121] text-slate-400 hover:text-white"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar usuário ou ação..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#111121] border border-[#2d2d42] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-avaloon-orange outline-none"
                    />
                </div>
            </GlassCard>

            {/* Timeline Log */}
            <div className="space-y-4">
                {filteredLogs.map((log) => (
                    <div key={log.id} className="bg-[#1e1e2d] border border-[#2d2d42] rounded-xl p-4 flex items-start gap-4 hover:bg-[#252546] transition-colors group">
                        {/* User Avatar */}
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0 border-2 border-[#1e1e2d] group-hover:border-avaloon-orange/50 transition-colors">
                            {log.user.substring(0, 2)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white text-sm">
                                        <span className="font-bold">{log.user}</span>
                                        <span className="text-slate-500 mx-1">
                                            {log.action === 'create' ? 'criou' : log.action === 'update' ? 'atualizou' : 'excluiu'}
                                        </span>
                                        <span className="font-bold text-avaloon-orange">{log.target}</span>
                                    </p>
                                    {log.detail && (
                                        <p className="text-xs text-slate-400 mt-1 italic">"{log.detail}"</p>
                                    )}
                                </div>
                                <span className="text-xs text-slate-500 font-mono flex-shrink-0">{log.time}</span>
                            </div>

                            <div className="flex items-center gap-3 mt-3">
                                {/* Sector Badge */}
                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 bg-[#111121] px-2 py-1 rounded border border-[#2d2d42]">
                                    {getSectorIcon(log.sector)}
                                    {log.sector}
                                </div>

                                {/* Action Badge */}
                                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded border ${log.action === 'create' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                        log.action === 'update' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                            'bg-red-500/10 border-red-500/20 text-red-500'
                                    }`}>
                                    {getIcon(log.action)}
                                    {log.action === 'create' ? 'Criação' : log.action === 'update' ? 'Edição' : 'Exclusão'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredLogs.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Nenhuma atividade encontrada.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
