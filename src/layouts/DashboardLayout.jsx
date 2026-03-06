import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    Home, Calendar, Users, BarChart3, Settings,
    Video, ShoppingBag, LogOut, Bell, Briefcase, Palette, Box, Layers, History, TrendingUp, BarChart2
} from "lucide-react";
import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { DemandNotificationWatcher } from "@/components/ui/DemandNotificationWatcher";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { BottomNav } from "@/components/ui/BottomNav";

// Prefetch map: when user hovers a nav link, start downloading that page's chunk.
// Uses the same dynamic import as App.jsx lazy() — browser deduplicates and caches automatically.
const ROUTE_PREFETCH = {
    '/dashboard/calendar': () => import('@/pages/Calendar'),
    '/dashboard/reports': () => import('@/pages/Reports'),
    '/dashboard/finance': () => import('@/pages/Finance'),
    '/dashboard/briefings': () => import('@/pages/Briefings'),
    '/dashboard/planning': () => import('@/pages/ContentPlanning'),
    '/dashboard/activity': () => import('@/pages/ActivityLog'),
    '/dashboard/productivity': () => import('@/pages/DesignProductivity'),
    '/dashboard/clients': () => import('@/pages/Clients'),
    '/dashboard/team': () => import('@/pages/TeamDirectory'),
    '/dashboard/settings': () => import('@/pages/Settings'),
    '/dashboard/users': () => import('@/pages/InviteUser'),
    '/dashboard/profile': () => import('@/pages/Profile'),
};

const NAV_ITEMS = {
    admin: [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Calendar, label: "Calendário", path: "/dashboard/calendar" },
        { icon: Layers, label: "Conteúdo", path: "/dashboard/planning" },
        { icon: Video, label: "Demandas", path: "/dashboard/briefings" },
        { icon: Users, label: "Equipe", path: "/dashboard/team" },
        { icon: Settings, label: "Usuários", path: "/dashboard/users" },
        { icon: BarChart3, label: "Inteligência", path: "/dashboard/reports" },
        { icon: ShoppingBag, label: "Financeiro", path: "/dashboard/finance" },
        { icon: Briefcase, label: "Clientes", path: "/dashboard/clients" },
        { icon: History, label: "Histórico", path: "/dashboard/activity" },
        { icon: Palette, label: "Produtividade", path: "/dashboard/productivity" },
        { icon: Settings, label: "Config", path: "/dashboard/settings" },
    ],
    videomaker: [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Video, label: "Demandas", path: "/dashboard/briefings" },
        { icon: Calendar, label: "Agenda", path: "/dashboard/calendar" },
        { icon: Settings, label: "Config", path: "/dashboard/settings" },
    ],
    account_manager: [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Calendar, label: "Calendário", path: "/dashboard/calendar" },
        { icon: Briefcase, label: "Clientes", path: "/dashboard/clients" },
        { icon: Layers, label: "Planejamento", path: "/dashboard/planning" },
        { icon: Video, label: "Demandas", path: "/dashboard/briefings" },
        { icon: Users, label: "Equipe", path: "/dashboard/team" },
        { icon: BarChart3, label: "Relatórios", path: "/dashboard/reports" },
        { icon: Settings, label: "Config", path: "/dashboard/settings" },
    ],
    designer: [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Layers, label: "Pautas", path: "/dashboard/planning" },
        { icon: Palette, label: "Demandas", path: "/dashboard/briefings" },
        { icon: Calendar, label: "Prazos", path: "/dashboard/calendar" },
        { icon: Settings, label: "Config", path: "/dashboard/settings" },
    ],
    traffic: [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: TrendingUp, label: "Campanhas", path: "/dashboard/planning" },
        { icon: Video, label: "Demandas", path: "/dashboard/briefings" },
        { icon: Briefcase, label: "Clientes", path: "/dashboard/clients" },
        { icon: BarChart3, label: "Relatórios", path: "/dashboard/reports" },
        { icon: Settings, label: "Config", path: "/dashboard/settings" },
    ],
    viewer: [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Settings, label: "Config", path: "/dashboard/settings" },
    ]
};

export default function DashboardLayout() {
    const { role, logout, user, loading: authLoading } = useAuth();
    const location = useLocation();

    // Se estiver carregando auth primária, não renderiza itens para evitar "flicker" (piscar)
    if (authLoading && !role) return <div className="min-h-screen bg-background" />;

    // FALLBACK SEGURO: Jamais padrão para 'admin' por segurança.
    const menuItems = NAV_ITEMS[role] || NAV_ITEMS.viewer;

    return (
        <div className="min-h-screen bg-background text-main flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="flex flex-col md:flex-row items-center justify-between border-b border-border bg-background px-6 py-3 sticky top-0 z-50 gap-4 md:gap-0">
                <div className="flex items-center gap-4 text-main self-start md:self-auto">
                    <Logo size="default" />
                </div>

                {/* Center Nav Links - HIDDEN ON MOBILE */}
                <nav className="hidden md:flex flex-wrap items-center justify-center gap-x-4 gap-y-2 w-full md:w-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const prefetch = ROUTE_PREFETCH[item.path];
                        return (
                            <Link
                                to={item.path}
                                key={item.path}
                                onMouseEnter={prefetch}  // starts download on hover
                                onFocus={prefetch}       // keyboard accessibility
                                className={cn(
                                    "text-xs md:text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 px-2 py-1 rounded-md",
                                    isActive ? "text-avaloon-orange font-bold bg-main/5" : "text-[#a1a1aa] hover:text-main hover:bg-main/5"
                                )}
                            >
                                <item.icon className="w-3.5 h-3.5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4 self-end md:self-auto">
                    <NotificationCenter />

                    <div className="h-6 w-[1px] bg-[#1a1a1a] mx-1"></div>

                    <div className="flex items-center gap-3 cursor-pointer" onClick={logout} title="Sair">
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-full size-9 ring-2 ring-avaloon-orange/20"
                            style={{ backgroundImage: `url(https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random)` }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content - ADDED PADDING FOR BOTTOM NAV ON MOBILE */}
            <main className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full flex flex-col flex-1"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Injeta o observador de notificações de aceite de demanda para todo o Dashboard */}
            <DemandNotificationWatcher />

            {/* Mobile Navigation Bar */}
            <BottomNav />
        </div>
    );
}
