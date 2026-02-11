import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { Input } from "@/components/ui/Input";
import { User, Bell, Palette, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Configurações
                    </h2>
                    <p className="text-slate-400">Personalize seu workspace e preferências.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="col-span-1 p-4 h-fit">
                    <div className="space-y-2">
                        {['Perfil', 'Notificações', 'Segurança', 'Aparência', 'Workspace'].map((s) => (
                            <div key={s} className="px-4 py-3 rounded-lg hover:bg-white/5 cursor-pointer text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                {s}
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard className="md:col-span-3 p-8">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">Editar Perfil</h3>

                    <div className="flex items-center gap-6 mb-8">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&size=128`}
                            alt="Profile"
                            className="w-24 h-24 rounded-xl border-2 border-slate-700 shadow-xl"
                        />
                        <div>
                            <ButtonAvaloon variant="outline">Alterar Foto</ButtonAvaloon>
                            <p className="text-xs text-slate-500 mt-2">Recomendado: 500x500px, JPG ou PNG.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Nome Completo</label>
                            <Input defaultValue={user?.name} icon={User} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Email Profissional</label>
                            <Input defaultValue={user?.email} disabled={true} icon={User} className="opacity-50" />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
                        <ButtonAvaloon variant="ghost">Cancelar</ButtonAvaloon>
                        <ButtonAvaloon variant="primary">Salvar Alterações</ButtonAvaloon>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
