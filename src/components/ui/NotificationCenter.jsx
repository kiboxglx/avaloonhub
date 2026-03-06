import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, Loader2, BellOff, Zap, Edit3, UserPlus, XCircle, ArrowRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/context/AuthContext";

// Map notification types to icons and colors
const TYPE_CONFIG = {
    NEW_DEMAND: { icon: Zap, color: "text-avaloon-orange", bg: "bg-avaloon-orange/10" },
    DEMAND_UPDATE: { icon: Edit3, color: "text-blue-400", bg: "bg-blue-500/10" },
    DEMAND_REJECTED: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
    DEMAND_DELEGATED: { icon: ArrowRight, color: "text-avaloon-orange", bg: "bg-avaloon-orange/10" },
    DEMAND_DELEGATION_FYI: { icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    MENTION: { icon: UserPlus, color: "text-green-400", bg: "bg-green-500/10" },
    DEFAULT: { icon: Bell, color: "text-muted", bg: "bg-main/5" },
};

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Agora mesmo";
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
}

export function NotificationCenter() {
    const { teamMemberId } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const panelRef = useRef(null);

    // ── Fetch notifications from Supabase ────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        if (!teamMemberId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", teamMemberId)
                .order("updated_at", { ascending: false })
                .limit(25);

            if (!error && data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read_at).length);
            }
        } catch (_) { /* silent */ } finally {
            setLoading(false);
        }
    }, [teamMemberId]);

    // ── Initial load ─────────────────────────────────────────────────────────
    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    // ── Real-time subscription (Supabase WebSocket) ───────────────────────────
    useEffect(() => {
        if (!teamMemberId) return;

        const channel = supabase
            .channel(`notif_center_${teamMemberId}`)
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "notifications",
                filter: `user_id=eq.${teamMemberId}`,
            }, () => {
                // Re-fetch when any change happens
                fetchNotifications();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [teamMemberId, fetchNotifications]);

    // ── Close panel on outside click ─────────────────────────────────────────
    useEffect(() => {
        function handler(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        }
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // ── Mark single notification as read ─────────────────────────────────────
    const markAsRead = async (notif) => {
        if (notif.read_at) return;
        setNotifications(prev =>
            prev.map(n => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(c => Math.max(0, c - 1));
        await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notif.id);

        // Navigate to the action url if any
        const url = notif.content?.action_url;
        if (url) { setOpen(false); navigate(url); }
    };

    // ── Mark all as read ─────────────────────────────────────────────────────
    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
        setUnreadCount(0);
        if (!teamMemberId) return;
        await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", teamMemberId).is("read_at", null);
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* ── Bell Button ─────────────────────────────────────────────── */}
            <button
                onClick={() => setOpen(o => !o)}
                className="relative flex size-9 items-center justify-center rounded-lg bg-[#1f1f1f] text-main hover:bg-[#2a2a2a] transition-colors"
            >
                <Bell className={`w-4 h-4 transition-all ${open ? "text-avaloon-orange" : "text-gray-300"}`} />
                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-0.5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-background">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* ── Dropdown Panel ──────────────────────────────────────────── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-96 rounded-2xl border border-border bg-card shadow-2xl z-[200] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-avaloon-orange" />
                                <h3 className="text-sm font-bold text-main">Notificações</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {unreadCount} novas
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-1 text-[11px] text-avaloon-orange hover:text-white transition-colors"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/50">
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-avaloon-orange" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 gap-2 text-dim">
                                    <BellOff className="w-8 h-8" />
                                    <p className="text-sm font-medium">Nenhuma notificação ainda</p>
                                    <p className="text-xs">Você está em dia!</p>
                                </div>
                            ) : (
                                notifications.map(notif => {
                                    const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.DEFAULT;
                                    const Icon = cfg.icon;
                                    const isUnread = !notif.read_at;
                                    return (
                                        <button
                                            key={notif.id}
                                            onClick={() => markAsRead(notif)}
                                            className={`w-full flex items-start gap-3 p-4 text-left transition-colors ${isUnread ? "bg-avaloon-orange/5 hover:bg-avaloon-orange/10" : "hover:bg-main/5"}`}
                                        >
                                            {/* Icon */}
                                            <div className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${cfg.bg}`}>
                                                <Icon className={`w-4 h-4 ${cfg.color}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between gap-2">
                                                    <p className={`text-xs ${isUnread ? "font-bold text-main" : "font-medium text-muted"} truncate`}>
                                                        {notif.content?.title || notif.type}
                                                    </p>
                                                    {isUnread && <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-avaloon-orange mt-1" />}
                                                </div>
                                                <p className="text-[11px] text-dim leading-relaxed mt-0.5 line-clamp-2">
                                                    {notif.content?.message}
                                                    {notif.group_count > 1 && (
                                                        <span className="ml-1 text-[10px] bg-main/10 text-muted px-1.5 py-0.5 rounded-full">
                                                            ×{notif.group_count}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-dim/60 mt-1">{timeAgo(notif.updated_at)}</p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-border bg-background text-center">
                                <p className="text-[10px] text-dim">Últimas 25 notificações exibidas</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
