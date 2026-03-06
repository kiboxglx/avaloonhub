import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataService } from "@/services/dataService";
import { supabase } from "@/services/supabase";
import { Bell, CheckCircle2, Calendar, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buildGoogleCalendarUrl } from "@/utils/googleCalendar";
import { logger } from "@/utils/logger";

export function DemandNotificationWatcher() {
    const { teamMemberId } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [creatorNotifications, setCreatorNotifications] = useState([]);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        if (!teamMemberId) return;

        const loadPendingDemands = async () => {
            try {
                // Find demands assigned to me that aren't accepted yet
                const data = await dataService.demands.getByMember(teamMemberId);
                const pending = data.filter(d =>
                    d.status === "TODO" &&
                    d.briefing_data?.is_accepted === false
                );
                setNotifications(pending);
            } catch (err) {
                console.error("Erro ao verificar demandas pendentes:", err);
            }
        };

        const loadCreatorNotifications = async () => {
            try {
                // Get demands I created that have a status update I need to see
                const fetched = await dataService.demands.getCreatorNotifications(teamMemberId);
                setCreatorNotifications(fetched);
            } catch (err) {
                console.error("Erro ao verificar notificacoes criador", err);
            }
        };

        loadPendingDemands();
        loadCreatorNotifications();

        // Optimized Subscription: Listen to the 'notifications' table instead of 'demands'
        // This table is specifically for alerts and much lighter.
        const notificationsChannel = supabase
            .channel(`watcher-${teamMemberId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${teamMemberId}`
                },
                (payload) => {
                    // When a new notification arrives, refresh the watcher state
                    const type = payload.new.type;
                    if (['NEW_DEMAND', 'DEMAND_DELEGATED'].includes(type)) {
                        loadPendingDemands();
                    } else if (['DEMAND_REJECTED', 'DEMAND_UPDATE'].includes(type)) {
                        loadCreatorNotifications();
                    }
                }
            )
            .subscribe();

        return () => {
            notificationsChannel.unsubscribe();
        };
    }, [teamMemberId]);

    const handleAccept = async (demand) => {
        try {
            await dataService.demands.update(demand.id, {
                status: "DOING",
                briefing_data: {
                    ...demand.briefing_data,
                    is_accepted: true,
                    creator_notified: false
                }
            });
            // Remover imediatamente do estado local para ser mais responsivo
            setNotifications(prev => prev.filter(n => n.id !== demand.id));
            logger.info('DEMANDA_ACEITA', 'O usuário aceitou a demanda atribuída.', { demand_id: demand.id }, teamMemberId);
        } catch (err) {
            logger.error('FALHA_ACEITE_DEMANDA', 'Erro ao aceitar demanda no banco', { error: err.message, demand_id: demand.id }, teamMemberId);
        }
    };

    const handleReject = async (demand) => {
        if (!rejectReason.trim()) return;

        try {
            // Volta pro backlog (sem responsável) e marca a recusa nos logs internos do JSON
            await dataService.demands.update(demand.id, {
                assigned_to: null,
                briefing_data: {
                    ...demand.briefing_data,
                    is_accepted: false,
                    rejected_by: teamMemberId,
                    rejection_reason: rejectReason,
                    creator_notified: false
                }
            });
            setNotifications(prev => prev.filter(n => n.id !== demand.id));
            setRejectingId(null);
            setRejectReason("");
            logger.info('DEMANDA_RECUSADA', 'O usuário recusou a demanda atribuída.', { demand_id: demand.id, reason: rejectReason }, teamMemberId);
        } catch (err) {
            logger.error('FALHA_RECUSA_DEMANDA', 'Erro ao recusar demanda no banco', { error: err.message, demand_id: demand.id }, teamMemberId);
        }
    };

    const handleDismissCreatorNotification = async (demand) => {
        try {
            await dataService.demands.update(demand.id, {
                briefing_data: {
                    ...demand.briefing_data,
                    creator_notified: true
                }
            });
            setCreatorNotifications(prev => prev.filter(n => n.id !== demand.id));
        } catch (err) {
            console.error("Erro ao dar ciencia", err);
        }
    };

    if (notifications.length === 0 && creatorNotifications.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {/* Notificações para o ASSIGNEE agir (Aceitar/Recusar) */}
                {notifications.map((demand) => (
                    <motion.div
                        key={demand.id}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="pointer-events-auto bg-card border border-avaloon-orange/30 shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-avaloon-orange/20 rounded-2xl p-5 w-80 md:w-96 relative overflow-hidden"
                    >
                        {/* Glow effect no topo */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                                <Bell className="w-5 h-5 text-avaloon-orange animate-pulse" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-main font-bold text-sm mb-0.5 truncate uppercase tracking-wider">Nova Demanda</h4>
                                <p className="text-slate-300 text-sm mb-1 truncate pr-2">
                                    <span className="font-semibold text-avaloon-orange">{demand.clients?.name || "Cliente"}</span> • {demand.title}
                                </p>
                                {demand.briefing_data?.created_by_name && (
                                    <p className="text-dim text-[11px] mb-1">
                                        Enviado por: <span className="text-slate-300 font-semibold">{demand.briefing_data.created_by_name}</span>
                                    </p>
                                )}
                                <p className="text-dim text-[11px] mb-4 leading-tight">
                                    Aceite para iniciar e mover automaticamente para Em Produção.
                                </p>

                                {rejectingId === demand.id ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-2 mt-2"
                                    >
                                        <textarea
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            placeholder="Por qual motivo não pode assumir?"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-slate-200 resize-none h-20 focus:outline-none focus:border-avaloon-orange/50"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setRejectingId(null); setRejectReason(""); }}
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs font-bold transition-all"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => handleReject(demand)}
                                                disabled={!rejectReason.trim()}
                                                className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-500 hover:text-red-400 border border-red-500/30 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Confirmar Recusa
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAccept(demand)}
                                                className="flex-1 flex items-center justify-center gap-1.5 bg-avaloon-orange hover:bg-[#ff691e] text-main py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-orange-500/20"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Aceitar
                                            </button>
                                            <button
                                                onClick={() => setRejectingId(demand.id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-500 hover:text-red-400 border border-red-500/30 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Recusar
                                            </button>
                                        </div>

                                        <a
                                            href={buildGoogleCalendarUrl({
                                                title: demand.title,
                                                startDateIso: demand.scheduled_at,
                                                durationHours: demand.briefing_data?.duration_hours || 1,
                                                location: demand.briefing_data?.location
                                            })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/10 text-main py-2 rounded-xl text-xs font-bold transition-colors"
                                        >
                                            <Calendar className="w-3.5 h-3.5" /> Adicionar na minha Agenda
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Notificações para o MANAGER visualizar se aceitaram/recusaram sua pauta */}
                {creatorNotifications.map((notif) => (
                    <motion.div
                        key={`creator-${notif.id}`}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className="pointer-events-auto bg-card border border-blue-500/30 shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-blue-500/20 rounded-2xl p-5 w-80 md:w-96 relative overflow-hidden"
                    >
                        {/* Glow */}
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${notif.briefing_data?.is_accepted ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500'}`} />

                        <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${notif.briefing_data?.is_accepted ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                {notif.briefing_data?.is_accepted ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-main font-bold text-sm mb-0.5 truncate uppercase tracking-wider">Resposta à Demanda</h4>
                                <p className="text-slate-300 text-sm mb-1 truncate pr-2">
                                    <span className="font-semibold text-blue-400">{notif.title}</span>
                                </p>

                                {notif.briefing_data?.is_accepted ? (
                                    <p className="text-green-400/90 text-[12px] mb-4 leading-relaxed font-medium">O responsável aceitou a sua demanda e ela já está no fluxo!</p>
                                ) : (
                                    <div className="mb-4">
                                        <p className="text-red-400/90 text-[12px] mb-1 font-medium">A demanda foi recusada e devolvida ao backlog.</p>
                                        <p className="text-slate-400 text-[11px] italic bg-black/20 p-2 rounded border border-white/5">"{notif.briefing_data?.rejection_reason || 'Sem justificativa fornecida.'}"</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleDismissCreatorNotification(notif)}
                                    className="w-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                    Ciente, Ocultar Aviso
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
