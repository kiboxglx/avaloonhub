import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
    const { user, role } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <GlassCard className="p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-orange-600 to-red-600 opacity-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-end -mt-4">
                    <img
                        src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&size=128`}
                        alt="Profile"
                        className="w-32 h-32 rounded-xl border-4 border-slate-900 shadow-2xl"
                    />
                    <div className="flex-1 mb-2">
                        <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
                        <span className="text-orange-500 font-semibold uppercase text-sm tracking-wider">
                            {role?.replace('_', ' ')}
                        </span>
                    </div>
                    <ButtonAvaloon variant="outline" className="mb-2">
                        Editar Perfil
                    </ButtonAvaloon>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Informações Pessoais</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold">Email</label>
                            <p className="text-slate-200">{user?.email}</p>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold">Telefone</label>
                            <p className="text-slate-200">+55 (11) 99999-9999</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Estatísticas</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-slate-800/50">
                            <span className="text-2xl font-bold text-white">12</span>
                            <p className="text-xs text-slate-400 uppercase">Projetos Ativos</p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-800/50">
                            <span className="text-2xl font-bold text-emerald-400">98%</span>
                            <p className="text-xs text-slate-400 uppercase">Pontualidade</p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
