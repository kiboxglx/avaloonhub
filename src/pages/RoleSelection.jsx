import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { UserCog, Video, Briefcase, Palette, Megaphone } from "lucide-react";
import { motion } from "framer-motion";

const ROLES = [
    { id: "admin", title: "Gestão", icon: UserCog, description: "Controle total: Clientes, Equipe e Relatórios.", color: "from-blue-600 to-indigo-600" },
    { id: "account_manager", title: "Gerente de Contas", icon: Briefcase, description: "Gestão de Clientes, Atendimento e Aprovações.", color: "from-purple-500 to-pink-500" },
    { id: "videomaker", title: "Videomaker", icon: Video, description: "Briefings, Calendário de Filmagens e Uploads.", color: "from-orange-500 to-red-500" },
    { id: "designer", title: "Design", icon: Palette, description: "Criação de Artes, Thumbnails e Visual.", color: "from-green-500 to-emerald-500" },
    { id: "traffic", title: "Tráfego", icon: Megaphone, description: "Campanhas, Anúncios e Resultados.", color: "from-blue-500 to-cyan-500" },
];

export default function RoleSelection() {
    const { selectRole, role, isAdmin, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Non-admin users already have their role resolved from team_members.system_role
        // Skip this screen and go directly to the dashboard
        if (role && !isAdmin) {
            navigate("/dashboard", { replace: true });
        }
    }, [role, isAdmin, navigate]);

    const handleSelect = (roleId) => {
        selectRole(roleId);
        navigate("/dashboard");
    };

    const firstName = user?.email?.split("@")[0] || "usuário";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ec5b1322,_#000000_80%)] opacity-80 pointer-events-none" />

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="z-10 text-center mb-10">
                <h1 className="text-4xl font-black text-main mb-2">
                    Olá, <span className="text-avaloon-orange capitalize">{firstName}</span> 👋
                </h1>
                <p className="text-muted">
                    {isAdmin ? "Selecione o espaço de trabalho para continuar" : "Carregando seu workspace..."}
                </p>
            </motion.div>

            {/* Only admin sees the role picker */}
            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 w-full max-w-7xl z-10">
                    {ROLES.map((r, i) => (
                        <motion.div key={r.id}
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => handleSelect(r.id)}
                            className="cursor-pointer">
                            <Card className="h-full hover:border-avaloon-orange/50 transition-colors group relative overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                <div className={`p-3 rounded-xl inline-block bg-gradient-to-br ${r.color} mb-4 shadow-lg`}>
                                    <r.icon className="w-6 h-6 text-main" />
                                </div>
                                <h3 className="text-xl font-bold text-main mb-1">{r.title}</h3>
                                <p className="text-muted text-sm">{r.description}</p>
                                <div className="mt-6 text-sm font-medium text-dim group-hover:text-main transition-colors">
                                    Entrar →
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
