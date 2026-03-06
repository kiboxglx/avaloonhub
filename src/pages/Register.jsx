import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import {
    User, Mail, Lock, Sparkles, Video, Palette,
    BarChart3, Briefcase, ChevronRight, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ALLOWED_ROLES = [
    { id: "videomaker", label: "Videomaker", icon: Video, desc: "Produção e edição de vídeo" },
    { id: "designer", label: "Designer", icon: Palette, desc: "Criação de artes e layouts" },
    { id: "traffic", label: "Gestor de Tráfego", icon: BarChart3, desc: "Anúncios e performance" },
    { id: "account_manager", label: "Gerente de Contas", icon: Briefcase, desc: "Gestão de clientes e pautas" },
];

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", password: "", systemRole: "videomaker" });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await register(form);
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.message || "Falha ao criar conta. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <GlassCard className="p-10 text-center max-w-md border-emerald-500/30">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-black text-main mb-2">Bem-vindo à Avaloon!</h2>
                        <p className="text-muted mb-6">
                            Conta criada com sucesso. Você será redirecionado para o login em instantes...
                        </p>
                        <div className="h-1 w-full bg-main/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-emerald-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3 }}
                            />
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_#ec5b1333,_#000000_70%)] opacity-40 pointer-events-none" />

            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center relative z-10">
                {/* Left Side: Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="hidden md:block"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-avaloon-orange rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Sparkles className="text-main w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-main uppercase italic">Avaloon Hub</span>
                    </div>
                    <h1 className="text-5xl font-black text-main leading-tight mb-6">
                        Junte-se à Elite da <span className="text-avaloon-orange">Produção.</span>
                    </h1>
                    <p className="text-muted text-lg mb-8 max-w-sm">
                        Crie seu perfil e acesse a ferramenta definitiva para gestão de pautas, cronogramas e entregas de conteúdo.
                    </p>

                    <div className="space-y-4">
                        {["Pipeline inteligente", "Controle de KPIs", "Agilidade na produção"].map((feature) => (
                            <div key={feature} className="flex items-center gap-3 text-slate-300 font-medium">
                                <div className="w-5 h-5 bg-avaloon-orange/10 rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-avaloon-orange rounded-full" />
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Side: Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <GlassCard className="p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-main mb-2">Crie sua conta</h2>
                            <p className="text-dim text-sm">Registre-se como um novo membro da equipe.</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-3"
                            >
                                <Lock className="w-4 h-4" /> {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Nome"
                                    icon={User}
                                    placeholder="Seu nome"
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                                <Input
                                    label="E-mail"
                                    icon={Mail}
                                    type="email"
                                    placeholder="email@agencia.com"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>

                            <Input
                                label="Senha"
                                icon={Lock}
                                type="password"
                                placeholder="••••••••"
                                required
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                            />

                            <div>
                                <label className="text-xs font-bold text-dim uppercase tracking-wider mb-3 block">
                                    Sua Função na Equipe
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {ALLOWED_ROLES.map((role) => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => setForm({ ...form, systemRole: role.id })}
                                            className={`
                                                flex flex-col items-start p-3 rounded-xl border transition-all text-left group
                                                ${form.systemRole === role.id
                                                    ? 'bg-avaloon-orange/10 border-avaloon-orange/50 ring-1 ring-avaloon-orange/20'
                                                    : 'bg-[#1a1a1a] border-[#2d2d42] hover:border-slate-700'}
                                            `}
                                        >
                                            <div className={`p-2 rounded-lg mb-2 transition-colors ${form.systemRole === role.id ? 'bg-avaloon-orange text-main' : 'bg-background text-dim group-hover:text-main'}`}>
                                                <role.icon className="w-4 h-4" />
                                            </div>
                                            <p className={`text-xs font-bold ${form.systemRole === role.id ? 'text-main' : 'text-muted'}`}>
                                                {role.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <ButtonAvaloon
                                type="submit"
                                className="w-full py-4 mt-4"
                                disabled={isLoading}
                            >
                                {isLoading ? "Criando conta..." : "Criar minha conta"}
                                {!isLoading && <ChevronRight className="w-4 h-4" />}
                            </ButtonAvaloon>
                        </form>

                        <div className="mt-8 pt-6 border-t border-main/5 text-center">
                            <p className="text-dim text-sm">
                                Já tem acesso?{" "}
                                <Link to="/login" className="text-avaloon-orange font-bold hover:underline">
                                    Fazer Login
                                </Link>
                            </p>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
}
