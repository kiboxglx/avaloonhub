import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { dataService } from "@/services/dataService";
import { supabase } from "@/services/supabase";
import {
    UserPlus, Mail, Lock, Users, ShieldCheck, CheckCircle2,
    AlertTriangle, Loader2, X, Eye, EyeOff, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SYSTEM_ROLES = [
    { id: "admin", label: "Gestão / Admin", description: "Acesso total ao sistema" },
    { id: "account_manager", label: "Gerente de Contas", description: "Clientes e demandas" },
    { id: "videomaker", label: "Videomaker", description: "Demandas de vídeo" },
    { id: "designer", label: "Designer", description: "Demandas de design" },
    { id: "traffic", label: "Tráfego", description: "Campanhas e anúncios" },
];

export default function InviteUser() {
    const { inviteUser } = useAuth();
    const { can } = usePermissions();

    const [members, setMembers] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);

    const [selectedMember, setSelectedMember] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [systemRole, setSystemRole] = useState("account_manager");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const loadData = async () => {
        setLoadingMembers(true);
        try {
            const data = await dataService.team.getAll();
            setMembers(data || []);
            setActiveUsers((data || []).filter(m => m.email && m.status !== 'pending'));
            setPendingUsers((data || []).filter(m => m.status === 'pending'));
        } catch (e) {
            console.error("Erro ao carregar usuários:", e);
        } finally {
            setLoadingMembers(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = async (memberId) => {
        try {
            const user = pendingUsers.find(u => u.id === memberId);
            const mapping = {
                admin: { role: 'Administrador', area: 'ADMIN' },
                account_manager: { role: 'Gerente de Contas', area: 'ACCOUNTS' },
                videomaker: { role: 'Videomaker', area: 'VIDEOMAKER' },
                designer: { role: 'Designer', area: 'DESIGN' },
                traffic: { role: 'Gestor de Tráfego', area: 'TRAFFIC' }
            }[user?.system_role] || {};

            await dataService.team.update(memberId, {
                status: 'Available',
                ...mapping
            });

            setSuccess("Usuário aprovado e agora aparece como ONLINE!");
            loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError("Erro ao aprovar usuário.");
        }
    };

    const handleReject = async (memberId) => {
        if (!confirm("Remover este pedido de cadastro?")) return;
        try {
            await supabase.from('team_members').delete().eq('id', memberId);
            setSuccess("Removido.");
            loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError("Erro ao remover.");
        }
    };

    const handleMemberSelect = (memberId) => {
        setSelectedMember(memberId);
        const m = members.find(x => x.id === memberId);
        if (m?.email) setEmail(m.email);
        if (m?.system_role) setSystemRole(m.system_role);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email || !password || !systemRole) {
            setError("Preencha todos os campos.");
            return;
        }

        setIsLoading(true);
        try {
            await inviteUser({ email, password, teamMemberId: selectedMember || null, systemRole });
            setSuccess(`Usuário ${email} criado e ativado!`);
            loadData();
            setEmail(""); setPassword(""); setSelectedMember("");
        } catch (err) {
            setError(err.message || "Erro ao criar usuário.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!can("edit_team")) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-dim gap-3">
                <ShieldCheck className="w-12 h-12 opacity-20" />
                <p>Apenas administradores podem acessar esta página.</p>
            </div>
        );
    }

    const inputCls = "w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none transition-colors";

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-main italic uppercase">Equipe & Acessos</h1>
                <p className="text-muted text-sm">Gerenciamento de permissões e controle de novos usuários.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ── Formulário de Criação Direta ── */}
                <GlassCard className="p-6 h-fit border-main/5">
                    <div className="flex items-center gap-2 mb-6 border-b border-main/5 pb-4">
                        <UserPlus className="w-5 h-5 text-avaloon-orange" />
                        <h2 className="text-lg font-bold text-main uppercase tracking-tighter">Novo Acesso Manual</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-dim uppercase mb-2 ml-1 tracking-widest">Vincular a Membro</label>
                                <select className={inputCls} value={selectedMember} onChange={e => handleMemberSelect(e.target.value)}>
                                    <option value="">— Sem vínculo (Novo Membro) —</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name} {m.email ? "✓" : ""}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-dim uppercase mb-2 ml-1 tracking-widest">Email de Acesso</label>
                                <input required type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} placeholder="email@avaloon.com" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-dim uppercase mb-2 ml-1 tracking-widest">Senha Inicial</label>
                                <div className="relative">
                                    <input required type={showPassword ? "text" : "password"} className={inputCls} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 dígitos" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-main transition-colors">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-dim uppercase mb-3 ml-1 tracking-widest">Nível de Acesso</label>
                            <div className="space-y-2">
                                {SYSTEM_ROLES.map(r => (
                                    <label key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${systemRole === r.id ? "bg-avaloon-orange/10 border-avaloon-orange/30 shadow-[0_0_15px_rgba(236,91,19,0.1)]" : "bg-background/20 border-main/5 hover:border-white/10"}`}>
                                        <input type="radio" name="role_sel" checked={systemRole === r.id} onChange={() => setSystemRole(r.id)} className="accent-avaloon-orange scale-110" />
                                        <div>
                                            <p className={`text-sm font-bold ${systemRole === r.id ? "text-avaloon-orange" : "text-main"}`}>{r.label}</p>
                                            <p className="text-[10px] text-dim">{r.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <AnimatePresence>
                            {success && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl font-bold flex items-center gap-2">
                                    <CheckCircle2 size={16} /> {success}
                                </motion.div>
                            )}
                            {error && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
                                    <AlertTriangle size={16} /> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <ButtonAvaloon variant="primary" className="w-full h-12 justify-center font-black uppercase tracking-widest text-xs" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Criar & Ativar Perfil"}
                        </ButtonAvaloon>
                    </form>
                </GlassCard>

                {/* ── Status e Listagem ── */}
                <div className="space-y-6">
                    {/* Pedidos Pendentes */}
                    <GlassCard className={`p-6 border-l-4 ${pendingUsers.length > 0 ? "border-l-avaloon-orange" : "border-l-white/5"}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2 rounded-lg ${pendingUsers.length > 0 ? 'bg-avaloon-orange/20' : 'bg-main/5'}`}>
                                <AlertTriangle className={`w-5 h-5 ${pendingUsers.length > 0 ? 'text-avaloon-orange' : 'text-dim'}`} />
                            </div>
                            <h2 className="text-lg font-bold text-main uppercase tracking-tighter">Aprovações Pendentes</h2>
                            {pendingUsers.length > 0 && (
                                <span className="bg-avaloon-orange text-main text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce h-fit">
                                    {pendingUsers.length}
                                </span>
                            )}
                        </div>

                        <div className="space-y-3">
                            {pendingUsers.length === 0 ? (
                                <p className="text-dim text-sm text-center py-6 italic border border-dashed border-main/5 rounded-xl">Sem novos pedidos.</p>
                            ) : (
                                pendingUsers.map(u => (
                                    <div key={u.id} className="p-4 rounded-xl bg-main/5 border border-main/5 flex items-center justify-between gap-4 group hover:border-avaloon-orange/20 transition-all">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-main group-hover:text-avaloon-orange transition-colors truncate">{u.name}</p>
                                            <p className="text-[10px] text-dim truncate mb-2">{u.email}</p>
                                            <span className="text-[9px] font-black uppercase bg-avaloon-orange/10 text-avaloon-orange px-2 py-0.5 rounded-md">
                                                Candidato: {SYSTEM_ROLES.find(r => r.id === u.system_role)?.label || u.system_role}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => handleApprove(u.id)} className="p-2.5 bg-emerald-500 text-main rounded-xl hover:bg-emerald-600 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                                                <CheckCircle2 size={18} />
                                            </button>
                                            <button onClick={() => handleReject(u.id)} className="p-2.5 bg-main/5 text-muted rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>

                    {/* Usuários Ativos */}
                    <GlassCard className="p-6 border-main/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-main/5 rounded-lg">
                                <Users className="w-5 h-5 text-muted" />
                            </div>
                            <h2 className="text-lg font-bold text-main uppercase tracking-tighter">Equipe Ativa</h2>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {loadingMembers ? (
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-main/5 rounded-xl animate-pulse" />)}
                                </div>
                            ) : activeUsers.length === 0 ? (
                                <p className="text-dim text-sm text-center py-4">Nenhum usuário ativo.</p>
                            ) : (
                                activeUsers.map(m => (
                                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-main/5 border border-transparent hover:border-white/10 transition-all">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-avaloon-orange/20 to-orange-900/40 flex items-center justify-center text-avaloon-orange font-black text-xs ring-1 ring-white/10">
                                            {m.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-main truncate">{m.name}</p>
                                            <p className="text-[10px] text-dim truncate">{m.email}</p>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${m.system_role === 'admin' ? 'bg-blue-500/10 text-blue-400' :
                                            m.system_role === 'account_manager' ? 'bg-purple-500/10 text-purple-400' :
                                                'bg-main/10 text-muted'
                                            }`}>
                                            {m.system_role}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
