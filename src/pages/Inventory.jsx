import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { Plus, Camera, Battery, Search, User, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["Cameras", "Lentes", "Áudio", "Iluminação", "Acessórios"];

const INITIAL_INVENTORY = [
    { id: 1, name: "Sony A7S III (Corpo A)", category: "Cameras", status: "Em Uso", assignee: "João Silva", returnDate: "15/08" },
    { id: 2, name: "Sony A7S III (Corpo B)", category: "Cameras", status: "Disponível", assignee: null },
    { id: 3, name: "Lente 24-70mm GM II", category: "Lentes", status: "Em Uso", assignee: "João Silva", returnDate: "15/08" },
    { id: 4, name: "Lente 16-35mm GM", category: "Lentes", status: "Disponível", assignee: null },
    { id: 5, name: "Rode Wireless Go II", category: "Áudio", status: "Manutenção", assignee: null },
    { id: 6, name: "Amaran 200x", category: "Iluminação", status: "Disponível", assignee: null },
    { id: 7, name: "Cartão SD V90 128GB #1", category: "Acessórios", status: "Disponível", assignee: null },
    { id: 8, name: "Cartão SD V90 128GB #2", category: "Acessórios", status: "Em Uso", assignee: "Maria Costa", returnDate: "14/08" },
];

export default function Inventory() {
    const [items, setItems] = useState(INITIAL_INVENTORY);
    const [filter, setFilter] = useState("Todos");

    const filteredItems = filter === "Todos"
        ? items
        : items.filter(item => item.category === filter);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Inventário de Produção
                    </h2>
                    <p className="text-slate-400">Controle de equipamentos e empréstimos.</p>
                </div>
                <ButtonAvaloon variant="primary">
                    <Plus className="w-4 h-4" /> Novo Equipamento
                </ButtonAvaloon>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setFilter("Todos")}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === "Todos" ? "bg-avaloon-orange text-white" : "bg-[#1e1e2d] text-slate-400 hover:text-white"}`}
                >
                    Todos
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === cat ? "bg-avaloon-orange text-white" : "bg-[#1e1e2d] text-slate-400 hover:text-white"}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={item.id}
                        className="bg-[#1e1e2d] border border-[#2d2d42] rounded-xl p-5 hover:border-avaloon-orange/30 transition-all flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${item.category === 'Cameras' ? 'bg-blue-500/10 text-blue-500' :
                                    item.category === 'Lentes' ? 'bg-purple-500/10 text-purple-500' :
                                        item.category === 'Áudio' ? 'bg-pink-500/10 text-pink-500' :
                                            'bg-slate-500/10 text-slate-400'
                                }`}>
                                {item.category === 'Cameras' ? <Camera className="w-6 h-6" /> :
                                    item.category === 'Áudio' ? <AlertCircle className="w-6 h-6" /> : // Placeholder icon
                                        <Battery className="w-6 h-6" />}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.status === 'Disponível' ? 'bg-green-500/10 text-green-500' :
                                    item.status === 'Em Uso' ? 'bg-orange-500/10 text-orange-500' :
                                        'bg-red-500/10 text-red-500'
                                }`}>
                                {item.status}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-white font-bold text-lg mb-1">{item.name}</h3>
                            <p className="text-[#9595c6] text-xs uppercase font-bold tracking-wider mb-4">{item.category}</p>

                            {item.status === 'Em Uso' ? (
                                <div className="bg-[#111121] rounded p-3 flex items-center gap-3 border border-orange-500/20">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                        {item.assignee?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">{item.assignee}</p>
                                        <p className="text-slate-500 text-xs">Retorno: {item.returnDate}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#111121] rounded p-3 flex items-center gap-2 border border-[#2d2d42] text-slate-500 opacity-60">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm">Item no estoque</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#2d2d42] flex gap-2">
                            <button className="flex-1 py-2 rounded bg-[#252546] hover:bg-white/10 text-xs text-white font-bold transition-colors">
                                Histórico
                            </button>
                            <button className="flex-1 py-2 rounded bg-avaloon-orange hover:bg-orange-600 text-xs text-white font-bold transition-colors">
                                {item.status === 'Disponível' ? 'Emprestar' : 'Devolver'}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
