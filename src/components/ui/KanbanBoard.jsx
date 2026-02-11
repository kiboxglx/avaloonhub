import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal, Calendar, User, ArrowRight, MessageSquare } from "lucide-react";
import { cn } from "@/utils/cn";

const INITIAL_TASKS = [
    { id: "1", title: "Campanha Verão 2024", client: "Alpha Inc", status: "TODO", priority: "High", due: "15 Ago", assignee: "SJ" },
    { id: "2", title: "Reels Institucionais", client: "Beta Corp", status: "DOING", priority: "Medium", due: "18 Ago", assignee: "MC" },
    { id: "3", title: "Cobertura Evento Tech", client: "Gamma Ltd", status: "DONE", priority: "Low", due: "10 Ago", assignee: "DR" },
    { id: "4", title: "Edição Podcast #45", client: "Podcast Flow", status: "DOING", priority: "High", due: "Today", assignee: "JL" },
    { id: "5", title: "Color Grading Doc", client: "DocuFilms", status: "REVIEW", priority: "Medium", due: "22 Ago", assignee: "JL" },
];

const COLUMNS = [
    { id: "TODO", title: "A Fazer", color: "bg-slate-500/10 border-slate-500/20 text-slate-400" },
    { id: "DOING", title: "Em Produção", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
    { id: "REVIEW", title: "Revisão", color: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
    { id: "DONE", title: "Concluído", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
];

export const KanbanBoard = () => {
    const [tasks, setTasks] = useState(INITIAL_TASKS);

    const moveTask = (taskId, newStatus) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };

    return (
        <div className="flex gap-6 overflow-x-auto pb-6 h-full min-h-[500px]">
            {COLUMNS.map(col => (
                <div key={col.id} className="min-w-[300px] w-full flex-1 flex flex-col">
                    {/* Column Header */}
                    <div className={cn("flex items-center justify-between p-3 rounded-t-xl mb-2 backdrop-blur-md border", col.color)}>
                        <h3 className="font-bold text-sm uppercase tracking-wider">{col.title}</h3>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 opacity-70">
                            {tasks.filter(t => t.status === col.id).length}
                        </span>
                    </div>

                    {/* Task List */}
                    <div className="flex-1 space-y-3 p-1">
                        <AnimatePresence mode="popLayout">
                            {tasks.filter(t => t.status === col.id).map(task => (
                                <motion.div
                                    layoutId={task.id}
                                    key={task.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-[#1e1e2d] border border-[#2d2d42] p-4 rounded-xl shadow-lg hover:shadow-avaloon-orange/10 transition-shadow group relative"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border",
                                            task.priority === 'High' ? "text-red-400 border-red-500/30 bg-red-500/10" :
                                                task.priority === 'Medium' ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" :
                                                    "text-slate-400 border-slate-500/30 bg-slate-500/10"
                                        )}>
                                            {task.priority}
                                        </span>
                                        <button className="text-slate-500 hover:text-white transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <h4 className="font-bold text-white mb-1">{task.title}</h4>
                                    <p className="text-xs text-[#9595c6] mb-4">{task.client}</p>

                                    <div className="flex items-center justify-between pt-3 border-t border-[#2d2d42]">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-avaloon-orange flex items-center justify-center text-[10px] font-bold text-white border border-[#1e1e2d]" title={task.assignee}>
                                                {task.assignee}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Calendar className="w-3 h-3" />
                                            <span>{task.due}</span>
                                        </div>
                                    </div>

                                    {/* Quick Actions (Hover) */}
                                    <div className="absolute inset-x-0 bottom-[-10px] opacity-0 group-hover:opacity-100 group-hover:bottom-0 transition-all duration-200 flex justify-center pb-2 pointer-events-none group-hover:pointer-events-auto">
                                        <div className="bg-[#1e1e2d] shadow-xl border border-[#2d2d42] rounded-full px-2 py-1 flex gap-1">
                                            {/* Move Left */}
                                            {col.id !== 'TODO' && (
                                                <button
                                                    onClick={() => moveTask(task.id, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) - 1].id)}
                                                    className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"
                                                    title="Mover para Trás"
                                                >
                                                    <ArrowRight className="w-3 h-3 rotate-180" />
                                                </button>
                                            )}
                                            {/* Move Right */}
                                            {col.id !== 'DONE' && (
                                                <button
                                                    onClick={() => moveTask(task.id, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) + 1].id)}
                                                    className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"
                                                    title="Avançar Etapa"
                                                >
                                                    <ArrowRight className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <button className="w-full py-2 rounded-lg border border-dashed border-[#2d2d42] text-[#9595c6] text-xs font-medium hover:border-avaloon-orange/50 hover:text-white transition-colors flex items-center justify-center gap-2">
                            <Plus className="w-3 h-3" /> Adicionar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
