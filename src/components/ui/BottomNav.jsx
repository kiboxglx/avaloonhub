import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Home, Calendar, Video, Layers, Settings, Users, Briefcase } from "lucide-react";
import { cn } from "@/utils/cn";

// Fallback icons for missing specialized imports
const Palette = (props) => <Layers {...props} />;
const TrendingUp = (props) => <Video {...props} />;

const NAV_ITEMS_MOBILE = {
    admin: [
        { icon: Home, label: "Home", path: "/dashboard" },
        { icon: Video, label: "Demandas", path: "/dashboard/briefings" },
        { icon: Calendar, label: "Agenda", path: "/dashboard/calendar" },
        { icon: Layers, label: "Conteúdo", path: "/dashboard/planning" },
        { icon: Settings, label: "Config", path: "/dashboard/settings" },
    ],
    videomaker: [
        { icon: Home, label: "Home", path: "/dashboard" },
        { icon: Video, label: "Demandas", path: "/dashboard/briefings" },
        { icon: Calendar, label: "Agenda", path: "/dashboard/calendar" },
        { icon: Settings, label: "Config", path: "/dashboard/settings" },
    ],
    account_manager: [
        { icon: Home, label: "Home", path: "/dashboard" },
        { icon: Video, label: "Demandas", path: "/dashboard/briefings" },
        { icon: Calendar, label: "Agenda", path: "/dashboard/calendar" },
        { icon: Users, label: "Equipe", path: "/dashboard/team" },
        { icon: Settings, label: "Config", path: "/dashboard/settings" },
    ],
    designer: [
        { icon: Home, label: "Home", path: "/dashboard" },
        { icon: Palette, label: "Demandas", path: "/dashboard/briefings" },
        { icon: Calendar, label: "Agenda", path: "/dashboard/calendar" },
        { icon: Settings, label: "Config", path: "/dashboard/settings" },
    ],
    traffic: [
        { icon: Home, label: "Home", path: "/dashboard" },
        { icon: Video, label: "Demandas", path: "/dashboard/briefings" },
        { icon: Briefcase, label: "Clientes", path: "/dashboard/clients" },
        { icon: TrendingUp, label: "Campanhas", path: "/dashboard/planning" },
        { icon: Settings, label: "Config", path: "/dashboard/settings" },
    ],
    viewer: [
        { icon: Home, label: "Home", path: "/dashboard" },
        { icon: Settings, label: "Config", path: "/dashboard/settings" },
    ]
};

export function BottomNav() {
    const { role } = useAuth();
    const location = useLocation();

    // Fallback and icons mapping
    const items = NAV_ITEMS_MOBILE[role] || NAV_ITEMS_MOBILE.viewer;

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-xl border-t border-border px-2 pb-safe-offset-2 pt-2">
            <div className="flex items-center justify-around max-w-md mx-auto">
                {items.slice(0, 5).map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all active:scale-90",
                                isActive ? "text-avaloon-orange" : "text-muted hover:text-main"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

