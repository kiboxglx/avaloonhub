import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Bell, Lock, Target, Building2, Save, Loader2, CheckCircle2,
    AlertTriangle, Eye, EyeOff, Video, Palette, TrendingUp, Briefcase,
    Moon, Sun, Globe, ChevronRight, Zap, Shield, Settings as SettingsIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/services/supabase";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { AREA_CONFIG } from "@/components/ui/AreaSelector";

// ── Helpers ────────────────────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-bold text-slate-300">{label}</label>
        {children}
        {hint && <p className="text-xs text-dim">{hint}</p>}
    </div>
);

const TextInput = ({ value, onChange, placeholder, type = "text", disabled, className = "" }) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-main placeholder-slate-500 focus:border-avaloon-orange focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    />
);

const SaveFeedback = ({ msg, isError }) => {
    if (!msg) return null;
    return (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 text-sm font-bold ${isError ? "text-red-400" : "text-emerald-400"}`}>
            {isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {msg}
        </motion.div>
    );
};

const Toggle = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-sm text-slate-300 group-hover:text-main transition-colors">{label}</span>
        <button
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-avaloon-orange" : "bg-[#1a1a1a]"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
        </button>
    </label>
);

// Local storage keys
const LS_GOALS = "avaloon_monthly_goals";
const LS_NOTIFS = "avaloon_notifications";
const LS_WS = "avaloon_workspace";

const DEFAULT_GOALS = { videomaker: 20, design: 80, traffic: 10, accounts: 15 };
const DEFAULT_NOTIFS = { newDemand: true, statusChange: true, approval: true, dailyDigest: false, weeklyReport: true };
const DEFAULT_WS = { agencyName: "", driveRoot: "", defaultView: "kanban", language: "pt-BR" };

// ── TABS ──────────────────────────────────────────────────────────────────
const TABS = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "appearance", label: "Aparência", icon: Palette },
    { id: "goals", label: "Metas Mensais", icon: Target },
    { id: "notifs", label: "Notificações", icon: Bell },
    { id: "workspace", label: "Workspace", icon: Building2 },
    { id: "security", label: "Segurança", icon: Lock },
];

export default function Settings() {
    const { user, role } = useAuth();
    const { theme, changeTheme } = useTheme();
    const [activeTab, setActiveTab] = useState("profile");

    // ── Profile ───────────────────
    const [fullName, setFullName] = useState(user?.name || "");
    const [phone, setPhone] = useState("");
    const [position, setPosition] = useState("");
    const [profileSaveMsg, setProfileSaveMsg] = useState(null);
    const [profileSaveErr, setProfileSaveErr] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    // ── Goals ─────────────────────
    const [goals, setGoals] = useState(() => {
        try { return { ...DEFAULT_GOALS, ...JSON.parse(localStorage.getItem(LS_GOALS) || "{}") }; }
        catch { return DEFAULT_GOALS; }
    });
    const [goalsSaved, setGoalsSaved] = useState(false);

    const saveGoals = () => {
        localStorage.setItem(LS_GOALS, JSON.stringify(goals));
        setGoalsSaved(true);
        setTimeout(() => setGoalsSaved(false), 2000);
    };

    // ── Notifications ─────────────
    const [notifs, setNotifs] = useState(() => {
        try { return { ...DEFAULT_NOTIFS, ...JSON.parse(localStorage.getItem(LS_NOTIFS) || "{}") }; }
        catch { return DEFAULT_NOTIFS; }
    });
    const [notifSaved, setNotifSaved] = useState(false);

    const saveNotifs = () => {
        localStorage.setItem(LS_NOTIFS, JSON.stringify(notifs));
        setNotifSaved(true);
        setTimeout(() => setNotifSaved(false), 2000);
    };

    // ── Workspace ─────────────────
    const [ws, setWs] = useState(() => {
        try { return { ...DEFAULT_WS, ...JSON.parse(localStorage.getItem(LS_WS) || "{}") }; }
        catch { return DEFAULT_WS; }
    });
    const [wsSaved, setWsSaved] = useState(false);

    const saveWs = () => {
        localStorage.setItem(LS_WS, JSON.stringify(ws));
        setWsSaved(true);
        setTimeout(() => setWsSaved(false), 2000);
    };

    // ── Security ──────────────────
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [pwSaveMsg, setPwSaveMsg] = useState(null);
    const [pwSaveErr, setPwSaveErr] = useState(false);
    const [savingPw, setSavingPw] = useState(false);

    const handleProfileSave = async () => {
        setSavingProfile(true);
        setProfileSaveMsg(null);
        try {
            // Update Supabase auth profile if logged in via Supabase
            const { error } = await supabase.auth.updateUser({ data: { full_name: fullName, phone, position } });
            if (error) throw error;
            // Also update localStorage user
            const stored = JSON.parse(localStorage.getItem("avaloon_user") || "{}");
            localStorage.setItem("avaloon_user", JSON.stringify({ ...stored, name: fullName, phone, position }));
            setProfileSaveMsg("Perfil salvo com sucesso!");
            setProfileSaveErr(false);
        } catch (e) {
            // Fallback: just update localStorage
            const stored = JSON.parse(localStorage.getItem("avaloon_user") || "{}");
            localStorage.setItem("avaloon_user", JSON.stringify({ ...stored, name: fullName, phone, position }));
            setProfileSaveMsg("Perfil salvo localmente.");
            setProfileSaveErr(false);
        } finally {
            setSavingProfile(false);
            setTimeout(() => setProfileSaveMsg(null), 3000);
        }
    };

    const handlePasswordChange = async () => {
        if (newPw !== confirmPw) { setPwSaveMsg("As senhas não coincidem."); setPwSaveErr(true); return; }
        if (newPw.length < 6) { setPwSaveMsg("A senha deve ter pelo menos 6 caracteres."); setPwSaveErr(true); return; }
        setSavingPw(true);
        setPwSaveMsg(null);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPw });
            if (error) throw error;
            setPwSaveMsg("Senha atualizada com sucesso!");
            setPwSaveErr(false);
            setCurrentPw(""); setNewPw(""); setConfirmPw("");
        } catch (e) {
            setPwSaveMsg(e.message || "Erro ao atualizar senha.");
            setPwSaveErr(true);
        } finally {
            setSavingPw(false);
            setTimeout(() => setPwSaveMsg(null), 4000);
        }
    };

    const AREA_GOAL_CONFIG = [
        { key: "videomaker", label: "Videomaker", icon: Video, color: "text-red-400", units: "vídeos/mês" },
        { key: "design", label: "Design", icon: Palette, color: "text-green-400", units: "artes/mês" },
        { key: "traffic", label: "Tráfego", icon: TrendingUp, color: "text-blue-400", units: "campanhas/mês" },
        { key: "accounts", label: "Contas", icon: Briefcase, color: "text-purple-400", units: "reuniões/mês" },
    ];

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || user?.name || "User")}&background=1e1e2d&color=ec5b13&bold=true&size=256`;

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-main tracking-tight">Configurações</h2>
                <p className="text-muted text-sm mt-1">Personalize seu perfil, metas e preferências do workspace.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="md:col-span-1">
                    <div className="bg-card border border-border rounded-2xl p-2 space-y-0.5 sticky top-24">
                        {/* User mini profile */}
                        <div className="p-3 mb-2 border-b border-border">
                            <img src={avatarUrl} alt="avatar" className="w-12 h-12 rounded-xl mb-2" />
                            <p className="text-main font-bold text-sm truncate">{fullName || user?.name || "Usuário"}</p>
                            <p className="text-xs text-dim">{user?.email || "—"}</p>
                            <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-avaloon-orange/20 text-avaloon-orange border border-avaloon-orange/30">{role || "admin"}</span>
                        </div>

                        {TABS.filter(tab => {
                            if (role !== 'admin' && (tab.id === 'goals' || tab.id === 'workspace')) return false;
                            return true;
                        }).map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? "bg-avaloon-orange/20 text-avaloon-orange" : "text-muted hover:text-main hover:bg-main/5"}`}>
                                    <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{tab.label}</span>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? "rotate-90" : ""}`} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="md:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                            {/* ── PERFIL ── */}
                            {activeTab === "profile" && (
                                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                                    <h3 className="text-lg font-bold text-main flex items-center gap-2"><User className="w-5 h-5 text-avaloon-orange" /> Editar Perfil</h3>

                                    {/* Avatar */}
                                    <div className="flex items-center gap-5">
                                        <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-2xl ring-2 ring-[#1a1a1a]" />
                                        <div>
                                            <p className="text-sm text-main font-bold mb-0.5">Foto de Perfil</p>
                                            <p className="text-xs text-dim">Gerada automaticamente pelo nome cadastrado.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Nome Completo">
                                            <TextInput value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome completo" />
                                        </Field>
                                        <Field label="Email" hint="O email não pode ser alterado aqui.">
                                            <TextInput value={user?.email || ""} disabled />
                                        </Field>
                                        <Field label="Cargo / Função">
                                            <TextInput value={position} onChange={e => setPosition(e.target.value)} placeholder="Ex: Gestor de Tráfego" />
                                        </Field>
                                        <Field label="Telefone / WhatsApp">
                                            <TextInput value={phone} onChange={e => setPhone(e.target.value)} placeholder="(55) 99999-9999" />
                                        </Field>
                                    </div>

                                    <div className="pt-4 border-t border-border flex items-center justify-between">
                                        <AnimatePresence><SaveFeedback msg={profileSaveMsg} isError={profileSaveErr} /></AnimatePresence>
                                        <ButtonAvaloon variant="primary" onClick={handleProfileSave} disabled={savingProfile} className="ml-auto">
                                            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Salvar Perfil
                                        </ButtonAvaloon>
                                    </div>
                                </div>
                            )}

                            {/* ── APARÊNCIA ── */}
                            {activeTab === "appearance" && (
                                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                                    <h3 className="text-lg font-bold text-main flex items-center gap-2">
                                        <Palette className="w-5 h-5 text-avaloon-orange" /> Tema e Cores
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { id: "dark", label: "Dark (Padrão)", icon: Moon, desc: "Visual premium escuro", color: "bg-[#000000]" },
                                            { id: "light", label: "White", icon: Sun, desc: "Claro e minimalista", color: "bg-[#f8fafc]" },
                                            { id: "red", label: "Red", icon: Zap, desc: "Modo foco / urgência", color: "bg-[#1a0505]" }
                                        ].map(t => {
                                            const active = theme === t.id;
                                            return (
                                                <div key={t.id} onClick={() => changeTheme(t.id)}
                                                    className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${active ? "border-avaloon-orange" : "border-border hover:border-avaloon-orange/50"} bg-background relative overflow-hidden group`}>

                                                    {/* Color Preview Block */}
                                                    <div className={`h-16 w-full rounded-md mb-3 border border-border flex items-center justify-center ${t.color}`}>
                                                        <t.icon className={`w-6 h-6 ${t.id === 'light' ? 'text-black' : t.id === 'red' ? 'text-red-500' : 'text-white'}`} />
                                                    </div>

                                                    <h4 className="font-bold text-main">{t.label}</h4>
                                                    <p className="text-xs text-dim mt-1">{t.desc}</p>

                                                    {active && (
                                                        <div className="absolute top-2 right-2 bg-avaloon-orange text-white rounded-full p-1 shadow-lg">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="mt-4 p-4 rounded-xl border border-border bg-background/50">
                                        <p className="text-sm font-bold text-main mb-1">Dica de Produtividade</p>
                                        <p className="text-xs text-dim">Alternar temas pode ajudar no brilho da tela dependendo do horário ou no seu foco durante a entrega de demandas críticas.</p>
                                    </div>
                                </div>
                            )}

                            {/* ── METAS ── */}
                            {activeTab === "goals" && (
                                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-main flex items-center gap-2"><Target className="w-5 h-5 text-avaloon-orange" /> Metas Mensais por Área</h3>
                                        <p className="text-sm text-dim mt-1">Estas metas são usadas nos KPIs e relatórios para calcular % de atingimento.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {AREA_GOAL_CONFIG.map(({ key, label, icon: Icon, color, units }) => (
                                            <div key={key} className="bg-background border border-border rounded-xl p-4">
                                                <div className={`flex items-center gap-2 mb-3 ${color}`}>
                                                    <Icon className="w-4 h-4" />
                                                    <span className="text-sm font-bold text-main">{label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number" min="0"
                                                        value={goals[key]}
                                                        onChange={e => setGoals(g => ({ ...g, [key]: parseInt(e.target.value) || 0 }))}
                                                        className="w-24 bg-card border border-border rounded-lg px-3 py-2 text-main font-bold text-center focus:border-avaloon-orange outline-none text-lg"
                                                    />
                                                    <span className="text-xs text-dim">{units}</span>
                                                </div>
                                                {/* Progress preview (goal vs last month placeholder) */}
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-[10px] text-dim mb-1">
                                                        <span>Meta: {goals[key]}</span>
                                                        <span>—/mês</span>
                                                    </div>
                                                    <div className="h-1.5 bg-[#1a1a1a] rounded-full"><div className="h-full bg-gradient-to-r from-avaloon-orange to-red-500 rounded-full" style={{ width: "0%" }} /></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-border flex items-center justify-between">
                                        <AnimatePresence>
                                            {goalsSaved && <SaveFeedback msg="Metas salvas!" />}
                                        </AnimatePresence>
                                        <ButtonAvaloon variant="primary" onClick={saveGoals} className="ml-auto">
                                            <Save className="w-4 h-4" /> Salvar Metas
                                        </ButtonAvaloon>
                                    </div>
                                </div>
                            )}

                            {/* ── NOTIFICATIONS ── */}
                            {activeTab === "notifs" && (
                                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                                    <h3 className="text-lg font-bold text-main flex items-center gap-2"><Bell className="w-5 h-5 text-avaloon-orange" /> Preferências de Notificação</h3>

                                    <div className="space-y-4">
                                        <div className="bg-background border border-border rounded-xl p-4 space-y-4">
                                            <p className="text-xs font-bold text-dim uppercase tracking-wider">Alertas em Tempo Real</p>
                                            <Toggle checked={notifs.newDemand} onChange={v => setNotifs(n => ({ ...n, newDemand: v }))} label="Nova demanda criada" />
                                            <Toggle checked={notifs.statusChange} onChange={v => setNotifs(n => ({ ...n, statusChange: v }))} label="Mudança de status de demanda" />
                                            <Toggle checked={notifs.approval} onChange={v => setNotifs(n => ({ ...n, approval: v }))} label="Post enviado para aprovação" />
                                        </div>
                                        <div className="bg-background border border-border rounded-xl p-4 space-y-4">
                                            <p className="text-xs font-bold text-dim uppercase tracking-wider">Resumos Periódicos</p>
                                            <Toggle checked={notifs.dailyDigest} onChange={v => setNotifs(n => ({ ...n, dailyDigest: v }))} label="Resumo diário (mensagem)" />
                                            <Toggle checked={notifs.weeklyReport} onChange={v => setNotifs(n => ({ ...n, weeklyReport: v }))} label="Relatório semanal" />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border flex items-center justify-between">
                                        <AnimatePresence>{notifSaved && <SaveFeedback msg="Preferências salvas!" />}</AnimatePresence>
                                        <ButtonAvaloon variant="primary" onClick={saveNotifs} className="ml-auto">
                                            <Save className="w-4 h-4" /> Salvar
                                        </ButtonAvaloon>
                                    </div>
                                </div>
                            )}

                            {/* ── WORKSPACE ── */}
                            {activeTab === "workspace" && (
                                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                                    <h3 className="text-lg font-bold text-main flex items-center gap-2"><Building2 className="w-5 h-5 text-avaloon-orange" /> Configurações do Workspace</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Nome da Agência">
                                            <TextInput value={ws.agencyName} onChange={e => setWs(w => ({ ...w, agencyName: e.target.value }))} placeholder="Ex: Avaloon Marketing" />
                                        </Field>
                                        <Field label="Idioma">
                                            <select value={ws.language} onChange={e => setWs(w => ({ ...w, language: e.target.value }))}
                                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none">
                                                <option value="pt-BR">Português (BR)</option>
                                                <option value="en-US">English (US)</option>
                                                <option value="es-ES">Español</option>
                                            </select>
                                        </Field>
                                        <Field label="Pasta Raiz do Google Drive" hint="Link para a pasta raiz da agência no Drive.">
                                            <TextInput value={ws.driveRoot} onChange={e => setWs(w => ({ ...w, driveRoot: e.target.value }))} placeholder="https://drive.google.com/drive/folders/..." />
                                        </Field>
                                        <Field label="Visualização Padrão do Pipeline">
                                            <select value={ws.defaultView} onChange={e => setWs(w => ({ ...w, defaultView: e.target.value }))}
                                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none">
                                                <option value="kanban">Kanban</option>
                                                <option value="list">Lista</option>
                                                <option value="calendar">Calendário</option>
                                            </select>
                                        </Field>
                                    </div>

                                    <div className="pt-4 border-t border-border flex items-center justify-between">
                                        <AnimatePresence>{wsSaved && <SaveFeedback msg="Workspace salvo!" />}</AnimatePresence>
                                        <ButtonAvaloon variant="primary" onClick={saveWs} className="ml-auto">
                                            <Save className="w-4 h-4" /> Salvar
                                        </ButtonAvaloon>
                                    </div>
                                </div>
                            )}

                            {/* ── SECURITY ── */}
                            {activeTab === "security" && (
                                <div className="space-y-4">
                                    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                                        <h3 className="text-lg font-bold text-main flex items-center gap-2"><Lock className="w-5 h-5 text-avaloon-orange" /> Alterar Senha</h3>

                                        <div className="space-y-4">
                                            <Field label="Senha Atual">
                                                <div className="relative">
                                                    <TextInput value={currentPw} onChange={e => setCurrentPw(e.target.value)} type={showPw ? "text" : "password"} placeholder="••••••••" />
                                                    <button onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-main">
                                                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </Field>
                                            <Field label="Nova Senha">
                                                <TextInput value={newPw} onChange={e => setNewPw(e.target.value)} type={showPw ? "text" : "password"} placeholder="Mínimo 6 caracteres" />
                                            </Field>
                                            <Field label="Confirmar Nova Senha">
                                                <TextInput value={confirmPw} onChange={e => setConfirmPw(e.target.value)} type={showPw ? "text" : "password"} placeholder="Repita a nova senha" />
                                            </Field>
                                        </div>

                                        {/* Password strength */}
                                        {newPw && (
                                            <div>
                                                <div className="flex gap-1 mb-1">
                                                    {[1, 2, 3, 4].map(l => (
                                                        <div key={l} className={`h-1 flex-1 rounded-full ${newPw.length >= l * 3 ? l <= 2 ? "bg-red-500" : l === 3 ? "bg-yellow-500" : "bg-emerald-500" : "bg-[#1a1a1a]"}`} />
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-dim">{newPw.length < 6 ? "Fraca" : newPw.length < 10 ? "Média" : newPw.length < 12 ? "Forte" : "Muito forte"}</p>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-border flex items-center justify-between">
                                            <AnimatePresence><SaveFeedback msg={pwSaveMsg} isError={pwSaveErr} /></AnimatePresence>
                                            <ButtonAvaloon variant="primary" onClick={handlePasswordChange} disabled={savingPw || !newPw} className="ml-auto">
                                                {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                                Alterar Senha
                                            </ButtonAvaloon>
                                        </div>
                                    </div>

                                    {/* Security info */}
                                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
                                        <div className="flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-main">Conta Protegida pelo Supabase Auth</p>
                                                <p className="text-xs text-dim mt-1">Suas credenciais são criptografadas e gerenciadas pelo Supabase. Nunca compartilhe sua senha.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
