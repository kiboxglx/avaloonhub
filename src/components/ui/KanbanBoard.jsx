import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, ArrowRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/utils/cn";
import { dataService } from "@/services/dataService";
import { AREA_CONFIG } from "@/components/ui/AreaSelector";
import { format } from "date-fns";

const COLUMNS = [
    { id: "TODO", title: "A Fazer", color: "bg-slate-500/10 border-slate-500/20 text-muted" },
    { id: "DOING", title: "Em Produção", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
    { id: "REVIEW", title: "Revisão", color: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
    { id: "DONE", title: "Concluído", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
];

const PRIORITY_STYLE = {
    High: "text-red-400 border-red-500/30 bg-red-500/10",
    Medium: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    Low: "text-muted border-slate-500/30 bg-slate-500/10",
};

function KanbanCard({ task, onMove, onOpenDetail, currentColId, canMoveAll, canMoveOwn, currentUserId }) {
    const areaCfg = AREA_CONFIG[task.area || "GENERIC"] || AREA_CONFIG.GENERIC;
    const colCount = COLUMNS.length;
    const colIdx = COLUMNS.findIndex(c => c.id === currentColId);

    // Permite mover se for admin/manager OU se tiver permissão de mover a própria e for o responsável
    const canMove = canMoveAll || (canMoveOwn && task.assigned_to === currentUserId);

    return (
        <motion.div
            layoutId={task.id}
            key={task.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-card border border-border rounded-xl shadow-lg hover:shadow-avaloon-orange/10 hover:border-white/10 transition-all group relative cursor-pointer select-none"
            onClick={() => onOpenDetail(task)}
        >
            {/* Area accent line */}
            <div className={`h-0.5 w-full rounded-t-xl ${areaCfg.dot}`} />

            <div className="p-4">
                {/* Area badge + priority */}
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${areaCfg.bgColor} ${areaCfg.textColor}`}>
                            {areaCfg.label}
                        </span>
                        {task.priority && (
                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.Low)}>
                                {task.priority}
                            </span>
                        )}
                    </div>
                    {/* Stop click propagation on the ⋯ button */}
                    <button
                        className="text-slate-600 hover:text-main transition-colors p-0.5 rounded"
                        onClick={e => { e.stopPropagation(); onOpenDetail(task); }}
                        title="Ver detalhes"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>

                <h4 className="font-bold text-main text-sm mb-0.5 leading-snug">{task.title}</h4>
                <p className="text-xs text-dim mb-3">{task.clients?.name || "—"}</p>

                <div className="flex items-center justify-between pt-2.5 border-t border-border">
                    <div className="flex items-center gap-1.5">
                        {task.services?.name ? (
                            <span className="px-2 py-0.5 rounded bg-[#1a1a1a] text-[10px] text-slate-300 border border-border">
                                {task.services.name}
                            </span>
                        ) : <span />}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Assignee avatar */}
                        {task.assignee && (
                            <img
                                src={task.assignee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignee.name)}&background=1e1e2d&color=ec5b13&bold=true&size=32`}
                                alt={task.assignee.name}
                                title={task.assignee.name}
                                className="w-5 h-5 rounded-full ring-1 ring-[#1a1a1a]"
                            />
                        )}
                        <div className="flex items-center gap-1 text-xs text-dim">
                            <Calendar className="w-3 h-3" />
                            <span>{task.scheduled_at ? format(new Date(task.scheduled_at), 'dd/MM') : '\u2014'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick-move actions (hover only) */}
            {canMove && (
                <div
                    className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pb-2 pointer-events-none group-hover:pointer-events-auto"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="bg-card shadow-xl border border-border rounded-full px-2 py-1 flex gap-1">
                        {colIdx > 0 && (
                            <button
                                onClick={() => onMove(task.id, COLUMNS[colIdx - 1].id)}
                                className="p-1 hover:bg-main/10 rounded-full text-muted hover:text-main"
                                title="Voltar etapa"
                            >
                                <ArrowRight className="w-3 h-3 rotate-180" />
                            </button>
                        )}
                        {colIdx < colCount - 1 && (
                            <button
                                onClick={() => onMove(task.id, COLUMNS[colIdx + 1].id)}
                                className="p-1 hover:bg-main/10 rounded-full text-muted hover:text-main"
                                title="Avançar etapa"
                            >
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export const KanbanBoard = ({
    tasks = [],
    onTaskUpdate,
    onOptimisticUpdate,
    onAddDemand,
    onOpenDetail,
    canAdd = false,
    canMoveAll = false,
    canMoveOwn = false,
    currentUserId = null
}) => {
    const moveTask = async (taskId, newStatus) => {
        // Optimistic update — instant visual feedback
        if (onOptimisticUpdate) onOptimisticUpdate(taskId, newStatus);
        try {
            await dataService.demands.updateStatus(taskId, newStatus);
            if (onTaskUpdate) onTaskUpdate();
        } catch (error) {
            console.error("Failed to move task", error);
            // Revert on failure
            if (onTaskUpdate) onTaskUpdate();
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-6 h-full min-h-[500px]">
            {COLUMNS.map(col => {
                const colTasks = tasks.filter(t => t.status === col.id);
                return (
                    <div key={col.id} className="min-w-[280px] w-full flex-1 flex flex-col">
                        {/* Column Header */}
                        <div className={cn("flex items-center justify-between p-3 rounded-t-xl mb-3 backdrop-blur-md border", col.color)}>
                            <h3 className="font-bold text-sm uppercase tracking-wider">{col.title}</h3>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-main/10">
                                {colTasks.length}
                            </span>
                        </div>

                        {/* Cards */}
                        <div className="flex-1 space-y-3 p-1 overflow-y-auto">
                            <AnimatePresence mode="popLayout">
                                {colTasks.map(task => (
                                    <KanbanCard
                                        key={task.id}
                                        task={task}
                                        currentColId={col.id}
                                        onMove={moveTask}
                                        onOpenDetail={onOpenDetail || (() => { })}
                                        canMoveAll={canMoveAll}
                                        canMoveOwn={canMoveOwn}
                                        currentUserId={currentUserId}
                                    />
                                ))}
                            </AnimatePresence>

                            {/* Add button */}
                            {canAdd && (
                                <button
                                    onClick={onAddDemand}
                                    className="w-full py-2 rounded-lg border border-dashed border-border text-dim text-xs font-medium hover:border-avaloon-orange/50 hover:text-main transition-colors flex items-center justify-center gap-2 mt-1"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Adicionar
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
