import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { UserCog, Video, Briefcase, Palette } from "lucide-react";
import { motion } from "framer-motion";

const ROLES = [
    {
        id: "admin",
        title: "Gestão",
        icon: UserCog,
        description: "Controle total: Financeiro, Equipe e Relatórios.",
        color: "from-blue-600 to-indigo-600",
    },
    {
        id: "videomaker",
        title: "Videomakers",
        icon: Video,
        description: "Acesso a Briefings, Calendário de Filmagens e Uploads.",
        color: "from-orange-500 to-red-500",
    },
    {
        id: "account_manager",
        title: "Gerente de Contas",
        icon: Briefcase,
        description: "Gestão de Clientes, Atendimento e Aprovações.",
        color: "from-green-500 to-emerald-500",
    },
    {
        id: "designer",
        title: "Design",
        icon: Palette,
        description: "Criação de Artes, Thumbnails e Identidade Visual.",
        color: "from-purple-500 to-pink-500",
    },
];

export default function RoleSelection() {
    const { selectRole, user } = useAuth();
    const navigate = useNavigate();

    const handleSelect = (roleId) => {
        selectRole(roleId);
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-background to-background opacity-80 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 text-center mb-12"
            >
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
                    Bem-vindo de volta, {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-slate-400 text-lg">Selecione seu espaço de trabalho para continuar</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl z-10">
                {ROLES.map((role, index) => (
                    <motion.div
                        key={role.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(role.id)}
                        className="cursor-pointer"
                    >
                        <Card className="h-full hover:border-avaloon-orange/50 transition-colors group relative overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                            <div className={`p-4 rounded-xl inline-block bg-gradient-to-br ${role.color} mb-6 shadow-lg`}>
                                <role.icon className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2">{role.title}</h3>
                            <p className="text-slate-400">{role.description}</p>

                            <div className="mt-8 flex items-center text-sm font-medium text-slate-500 group-hover:text-white transition-colors">
                                Entrar no Workspace &rarr;
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
