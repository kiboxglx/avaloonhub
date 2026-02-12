import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    Home, Calendar, Users, BarChart3, Settings,
    Video, ShoppingBag, LogOut, Bell, Briefcase, Palette, Box, Layers, History
} from "lucide-react";
import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

const NAV_ITEMS = {
    admin: [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Calendar, label: "Calendário", path: "/dashboard/calendar" },
        { icon: Layers, label: "Conteúdo", path: "/dashboard/planning" },
        { icon: Video, label: "Demandas", path: "/dashboard/briefings" },
        { icon: Users, label: "Equipe", path: "/dashboard/team" },
        { icon: BarChart3, label: "Inteligência", path: "/dashboard/reports" },
        { icon: ShoppingBag, label: "Financeiro", path: "/dashboard/finance" },
        { icon: Briefcase, label: "Clientes", path: "/dashboard/clients" },
        { icon: History, label: "Histórico", path: "/dashboard/activity" },
        { icon: Settings, label: "Config", path: "/dashboard/settings" },
    ],
    videomaker: [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Video, label: "Demandas", path: "/dashboard/briefings" },
        { icon: Calendar, label: "Agenda", path: "/dashboard/calendar" },
        { icon: Users, label: "Perfil", path: "/dashboard/profile" },
    ],
    account_manager: [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Briefcase, label: "Clientes", path: "/dashboard/clients" },
        { icon: Layers, label: "Planejamento", path: "/dashboard/planning" },
        { icon: Video, label: "Demandas", path: "/dashboard/briefings" },
        { icon: BarChart3, label: "Relatórios", path: "/dashboard/reports" },
    ],
    designer: [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Layers, label: "Pautas", path: "/dashboard/planning" },
        { icon: Palette, label: "Demandas", path: "/dashboard/briefings" },
        { icon: Calendar, label: "Prazos", path: "/dashboard/calendar" },
        { icon: Users, label: "Perfil", path: "/dashboard/profile" },
    ]
};

export default function DashboardLayout() {
    const { role, logout, user } = useAuth();
    const location = useLocation();

    const menuItems = NAV_ITEMS[role] || NAV_ITEMS.admin;

    return (
        <div className="min-h-screen bg-[#111121] text-white flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="flex flex-col md:flex-row items-center justify-between border-b border-[#2d2d42] bg-[#121221] px-6 py-3 sticky top-0 z-50 gap-4 md:gap-0">
                <div className="flex items-center gap-4 text-white self-start md:self-auto">
                    <Logo size="default" />
                </div>

                {/* Center Nav Links - REMOVED SCROLLBAR, ADDED WRAP */}
                <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 w-full md:w-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                to={item.path}
                                key={item.path}
                                className={cn(
                                    "text-xs md:text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 px-2 py-1 rounded-md",
                                    isActive ? "text-avaloon-orange font-bold bg-white/5" : "text-[#9595c6] hover:text-white hover:bg-white/5"
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
                    <button className="relative flex size-9 items-center justify-center rounded-lg bg-[#252546] text-white hover:bg-[#2f2f55] transition-colors">
                        <Bell className="w-4 h-4 text-gray-300" />
                        <span className="absolute top-2 right-2 size-1.5 rounded-full bg-red-500 border border-[#252546]"></span>
                    </button>

                    <div className="h-6 w-[1px] bg-[#2d2d42] mx-1"></div>

                    <div className="flex items-center gap-3 cursor-pointer" onClick={logout} title="Sair">
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-full size-9 ring-2 ring-avaloon-orange/20"
                            style={{ backgroundImage: `url(https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random)` }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
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
        </div>
    );
}
