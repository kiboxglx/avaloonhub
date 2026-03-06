import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, role } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email.trim() || !password.trim()) {
            setError("Preencha o email e a senha.");
            return;
        }
        setLoading(true);
        try {
            await login(email.trim(), password.trim());
            // Navigation handled below after state settles — small delay lets resolveProfile finish
            setTimeout(() => navigate("/roles"), 300);
        } catch (err) {
            setError(
                err.message?.includes("Invalid login")
                    ? "Email ou senha inválidos."
                    : err.message || "Erro ao entrar. Tente novamente."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_#ec5b1333,_#000000_70%)] opacity-40 pointer-events-none" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
                <GlassCard className="p-8 w-full">
                    <div className="flex flex-col items-center mb-8">
                        <Logo size="large" className="mb-2" />
                        <p className="text-muted text-sm mt-1">Faça login no seu workspace de produção</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            icon={Mail}
                            placeholder="Seu email de acesso"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            icon={Lock}
                            placeholder="Senha"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                            </motion.div>
                        )}

                        <ButtonAvaloon type="submit" className="w-full py-3" disabled={loading}>
                            {loading ? "Entrando..." : "Entrar no Dashboard"}
                        </ButtonAvaloon>

                        <div className="mt-6 pt-6 border-t border-main/5 text-center">
                            <p className="text-dim text-sm">
                                Novo na equipe?{" "}
                                <Link to="/register" className="text-avaloon-orange font-bold hover:underline">
                                    Criar conta
                                </Link>
                            </p>
                        </div>
                    </form>
                </GlassCard>

                <div className="text-center mt-6 text-slate-600 text-xs">
                    © {new Date().getFullYear()} Avaloon Hub. Acesso restrito.
                </div>
            </motion.div>
        </div>
    );
}
