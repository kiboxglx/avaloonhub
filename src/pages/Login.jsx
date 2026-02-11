import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

export default function Login() {
    const [email, setEmail] = useState("admin@avaloon.com");
    const [password, setPassword] = useState("123");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!email.trim() || !password.trim()) {
            setError("Por favor, preencha todos os campos");
            setLoading(false);
            return;
        }

        try {
            await login(email.trim(), password.trim());
            // Success -> Redirect to Role Selection
            navigate("/roles");
        } catch (err) {
            setError("Credenciais inválidas (tente admin@avaloon.com / 123)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-background opacity-50 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <GlassCard className="p-8 w-full">
                    <div className="flex flex-col items-center mb-8">
                        <Logo size="large" className="mb-2" />
                        <p className="text-slate-400 text-sm mt-1">Faça login no seu workspace de produção</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            icon={Mail}
                            placeholder="Endereço de Email"
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
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                            >
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </motion.div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-avaloon-orange focus:ring-avaloon-orange" />
                                Lembrar de mim
                            </label>
                            <a href="#" className="text-avaloon-orange hover:text-avaloon-red transition-colors font-medium">Esqueceu a senha?</a>
                        </div>

                        <ButtonAvaloon
                            className="w-full h-11 text-lg"
                            disabled={loading}
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </ButtonAvaloon>
                    </form>
                </GlassCard>

                <div className="text-center mt-6 text-slate-500 text-xs">
                    &copy; {new Date().getFullYear()} Avaloon Hub. Powered by Alpha Team.
                </div>
            </motion.div>
        </div>
    );
}
