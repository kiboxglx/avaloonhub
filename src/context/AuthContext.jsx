import { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/services/supabase";
import { dataService } from "@/services/dataService";
import { logger } from "@/utils/logger";

const AuthContext = createContext(null);

// Mapeia o papel do sistema para as strings esperadas pelas permissões
const ROLE_MAP = {
    admin: "admin",
    account_manager: "account_manager",
    videomaker: "videomaker",
    designer: "designer",
    traffic: "traffic",
    viewer: "viewer",
};

// Mapeia o systemRole para o Nome de Exibição e a Área técnica da Avaloon
const getSystemMapping = (sysRole) => {
    const map = {
        admin: { roleName: 'Administrador', area: 'ADMIN' },
        account_manager: { roleName: 'Gerente de Contas', area: 'ACCOUNTS' },
        videomaker: { roleName: 'Videomaker', area: 'VIDEOMAKER' },
        designer: { roleName: 'Designer', area: 'DESIGN' },
        traffic: { roleName: 'Gestor de Tráfego', area: 'TRAFFIC' }
    };
    return map[sysRole] || { roleName: 'Membro da Equipe', area: 'GENERIC' };
};

export function AuthProvider({ children }) {
    // 1. Synchronous Cache Read (Zero-Spinner Bootstrap)
    // We read FROM local storage directly to avoid the "Flash of Logout" on refresh
    const getCachedAuth = () => {
        try {
            const projectRef = "hslmnfojscbvccvkxmuz";
            const sessionData = localStorage.getItem(`sb-${projectRef}-auth-token`);
            const session = sessionData ? JSON.parse(sessionData) : null;

            const profileKeys = Object.keys(sessionStorage).filter(k => k.startsWith('profile_'));
            const profile = profileKeys.length > 0 ? JSON.parse(sessionStorage.getItem(profileKeys[0])) : null;

            return {
                user: session?.user || null,
                profile: profile,
                role: profile ? (ROLE_MAP[profile.system_role] || localStorage.getItem("avaloon_role")) : null
            };
        } catch { return { user: null, profile: null, role: null }; }
    };

    const cacheState = getCachedAuth();

    const [user, setUser] = useState(cacheState.user);
    const [teamMember, setTeamMember] = useState(cacheState.profile);
    const [role, setRole] = useState(cacheState.role);
    const [teamMemberId, setTeamMemberId] = useState(cacheState.profile?.id || null);

    // If we have cached both user AND profile, we can start with loading=false to avoid spinners
    const [loading, setLoading] = useState(!(cacheState.user && cacheState.role));
    const [initialized, setInitialized] = useState(false);

    // ─── Refs to escape stale-closure trap in useEffect([]) ───────────────────
    // These always hold the latest value, even inside old closures.
    const profileLoadedRef = useRef(false);

    const resolveProfile = async (authUser) => {
        if (!authUser?.email) {
            setLoading(false);
            return;
        }

        // 1. Instant Hydration from Cache
        const cached = sessionStorage.getItem(`profile_${authUser.email}`);
        if (cached) {
            try {
                const p = JSON.parse(cached);
                setTeamMember(p);
                setTeamMemberId(p.id);
                setRole(ROLE_MAP[p.system_role] || "viewer");
                setLoading(false); // Stop loading immediately if we have a cache
            } catch (e) { console.warn("Cache corrompido", e); }
        }

        try {
            const memberPromise = dataService.team.getByEmail(authUser.email);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), 20000)
            );

            const member = await Promise.race([memberPromise, timeoutPromise]);

            if (member) {
                if (member.status === 'pending') {
                    setRole('pending');
                    setLoading(false);
                    return;
                }

                setTeamMember(member);
                setTeamMemberId(member.id);
                const mappedRole = ROLE_MAP[member.system_role];

                // Cache it for next time
                sessionStorage.setItem(`profile_${authUser.email}`, JSON.stringify(member));

                // Para Admin, permite alternar visualização se houver escolha salva
                if (mappedRole === "admin") {
                    const stored = localStorage.getItem("avaloon_role");
                    setRole(stored || "admin");
                } else {
                    // Para membros (Maria Luiza, etc), força o cargo real do banco
                    const finalRole = mappedRole || "viewer";
                    setRole(finalRole);
                    localStorage.setItem("avaloon_role", finalRole);
                }

                // Mark profile as loaded so we don't re-fetch on token refreshes
                profileLoadedRef.current = true;
            } else {
                setRole("viewer");
            }
        } catch (e) {
            logger.error('FALHA_OBTENCAO_PERFIL_AUTH', 'Falha ao recuperar perfil do usuario do banco de dados', { error: e.message, email: authUser.email }, null);
            // ⚠️ KEY FIX: Use functional setState to read the CURRENT role value.
            // The plain `role` variable is always null in closures captured by useEffect([]).
            // setRole(prev => prev || "viewer") reads the actual current state, not the stale closure value.
            setRole(prev => prev || "viewer");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setInitialized(true);

        // Forced unlock timer - reduced to 2s for even faster perception
        const timer = setTimeout(() => { if (loading) setLoading(false); }, 2000);

        // Load session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                resolveProfile(session.user);
            } else {
                setLoading(false);
            }
        }).catch(() => setLoading(false));

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                // TOKEN_REFRESHED and USER_UPDATED fire automatically every ~1h on JWT expiry.
                // They do NOT require re-fetching the profile — just update the user object silently.
                if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                    if (session?.user) setUser(session.user);
                    return;
                }

                if (event === 'SIGNED_OUT' || !session?.user) {
                    profileLoadedRef.current = false;
                    setUser(null);
                    setTeamMember(null);
                    setTeamMemberId(null);
                    setRole(null);
                    setLoading(false);
                    return;
                }

                // SIGNED_IN: only hit the DB if we haven't loaded the profile yet.
                // profileLoadedRef is a ref (not state), so it's never stale in closures.
                if (session?.user && !profileLoadedRef.current) {
                    setUser(session.user);
                    await resolveProfile(session.user);
                }
            }
        );

        return () => {
            clearTimeout(timer);
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                logger.warn('FALHA_LOGIN', 'Tentativa de login falhou', { email, error: error.message }, null);
                throw error;
            }
            logger.info('SUCESSO_LOGIN', 'Membro realizou login com sucesso', { email }, data.user.id);
            return data.user;
        } catch (err) {
            throw err;
        }
    };

    const register = async ({ name, email, password, systemRole }) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        const mapping = getSystemMapping(systemRole);

        // Verifica se já existe um registro com esse email (criado pelo Admin previamente)
        const { data: existing } = await supabase
            .from('team_members')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existing) {
            // Se já existe, apenas atualiza os dados necessários
            const { error: updErr } = await supabase
                .from('team_members')
                .update({
                    name,
                    role: mapping.roleName,
                    area: mapping.area,
                    system_role: systemRole,
                    status: 'pending' // Volta para pendente para aprovação do novo login
                })
                .eq('id', existing.id);
            if (updErr) throw updErr;
        } else {
            // Se não existe, cria um novo
            const { error: memberErr } = await supabase
                .from('team_members')
                .insert([{
                    name,
                    email,
                    role: mapping.roleName,
                    area: mapping.area,
                    system_role: systemRole,
                    status: 'pending'
                }]);
            if (memberErr) throw memberErr;
        }

        return data;
    };

    const inviteUser = async ({ email, password, teamMemberId: memberId, systemRole }) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        const mapping = getSystemMapping(systemRole);

        if (memberId) {
            const { error: updErr } = await supabase
                .from('team_members')
                .update({
                    email,
                    system_role: systemRole,
                    role: mapping.roleName,
                    area: mapping.area,
                    status: 'Available' // Agora fica 'Disponível' (Online) imediatamente
                })
                .eq('id', memberId);
            if (updErr) throw updErr;
        } else {
            const { error: insErr } = await supabase
                .from('team_members')
                .insert([{
                    name: email.split('@')[0],
                    email,
                    system_role: systemRole,
                    role: mapping.roleName,
                    area: mapping.area,
                    status: 'Available'
                }]);
            if (insErr) throw insErr;
        }
        return data;
    };

    const selectRole = (newRole) => {
        setRole(newRole);
        localStorage.setItem("avaloon_role", newRole);
    };

    const logout = async () => {
        const id = teamMemberId;
        await supabase.auth.signOut();
        localStorage.removeItem("avaloon_role");
        setUser(null); setTeamMember(null); setTeamMemberId(null); setRole(null);
        if (id) {
            logger.info('SUCESSO_LOGOUT', 'Usuário realizou logout', {}, id);
        }
    };

    const value = useMemo(() => ({
        user,
        teamMember,
        teamMemberId,
        role,
        isAdmin: role === "admin",
        login,
        logout,
        selectRole,
        register,
        inviteUser,
        loading,
    }), [user, teamMember, teamMemberId, role, loading]);

    return (
        <AuthContext.Provider value={value}>
            {loading && !role ? (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
                    <div className="w-12 h-12 border-4 border-[#ec5b13] border-t-transparent rounded-full animate-spin" />
                    <p className="text-main font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Iniciando Avaloon...</p>
                </div>
            ) : role === 'pending' ? (
                <div className="min-h-screen flex items-center justify-center bg-background p-6">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="w-16 h-16 border-4 border-avaloon-orange border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-main italic uppercase tracking-tighter">Acesso Restrito</h2>
                        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                            <p className="text-muted text-sm">
                                Sua solicitação foi recebida. Um <b>Administrador</b> precisa validar seu acesso.
                            </p>
                        </div>
                        <button onClick={logout} className="text-avaloon-orange font-bold hover:underline text-sm uppercase tracking-widest">
                            Sair / Trocar Conta
                        </button>
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
