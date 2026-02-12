
import { useState } from "react";
import { dataService } from "@/services/dataService";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { X, Save, Loader2, Video, Plane, Lightbulb, Monitor, Mic, Hammer, Wand2, Aperture, Headphones } from "lucide-react";

const KITS_PRESETS = [
    { icon: Video, name: "Câmera Cinema Line (Sony/RED)" },
    { icon: Plane, name: "Drone (DJI Mavic/Inspire)" },
    { icon: Lightbulb, name: "Kit Iluminação (Aputure/Godox)" },
    { icon: Monitor, name: "Workstation Edição (Mac Studio/PC)" },
    { icon: Mic, name: "Kit Áudio (Zoom/Sennheiser)" },
    { icon: Hammer, name: "Grip & Maquinária" }
];

export function TeamForm({ onClose, onSuccess }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        location: "",
        status: "Available",
        avatar_url: "",
        specialties: "",
        kit: []
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
                kit: JSON.stringify(formData.kit) // Store as JSON string or raw JSON depending on Supabase client handling
            };

            // Supabase client handles JSON automatically if column is jsonb, passing object is fine.
            // But let's check `dataService`. Usually strict types.
            // Let's pass array of objects.
            payload.kit = formData.kit;

            await dataService.team.create(payload);
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            console.error("Erro ao adicionar membro:", error);
            alert("Erro ao adicionar membro.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleKit = (preset) => {
        const exists = formData.kit.find(k => k.name === preset.name);
        if (exists) {
            setFormData({ ...formData, kit: formData.kit.filter(k => k.name !== preset.name) });
        } else {
            // Store only name for simplicity in DB JSON, but UI expects icon/name.
            // Let's store full object. Note: component reference 'icon' won't serialize to JSON well.
            // We should store 'iconName' string or similar.
            // For simplicity, let's just store the name and re-map icons in display.
            setFormData({ ...formData, kit: [...formData.kit, { name: preset.name, icon: 'default' }] });
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#111121] text-white">
            <div className="flex items-center justify-between p-6 border-b border-[#2d2d42]">
                <h2 className="text-xl font-bold">Novo Membro da Equipe</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <form id="team-form" onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                            placeholder="Ex: Sarah Jenkins"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Cargo / Função</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                                placeholder="Ex: Lead Videographer"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Localização</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                                placeholder="Ex: Studio A"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Status Inicial</label>
                        <select
                            className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Available">Disponível (Available)</option>
                            <option value="On-Set">Em Gravação (On-Set)</option>
                            <option value="Offline">Offline</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Especialidades (separadas por vírgula)</label>
                        <input
                            type="text"
                            className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                            placeholder="Ex: Drone, Edição, Color Grading"
                            value={formData.specialties}
                            onChange={e => setFormData({ ...formData, specialties: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Equipamentos / Kits</label>
                        <div className="grid grid-cols-2 gap-2">
                            {KITS_PRESETS.map((preset, idx) => {
                                const isSelected = formData.kit.some(k => k.name === preset.name);
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => toggleKit(preset)}
                                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition-all ${isSelected
                                                ? 'bg-avaloon-orange/20 border-avaloon-orange text-white'
                                                : 'bg-[#1e1e2d] border-[#2d2d42] text-slate-400 hover:border-slate-500'
                                            }`}
                                    >
                                        <preset.icon className="w-4 h-4 shrink-0" />
                                        <span>{preset.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Foto de Perfil (URL)</label>
                        <input
                            type="url"
                            className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                            placeholder="https://..."
                            value={formData.avatar_url}
                            onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
                        />
                    </div>
                </form>
            </div>

            <div className="p-6 border-t border-[#2d2d42] bg-[#1e1e2d]">
                <ButtonAvaloon
                    type="submit"
                    form="team-form"
                    variant="primary"
                    className="w-full justify-center"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Adicionar Membro
                        </>
                    )}
                </ButtonAvaloon>
            </div>
        </div>
    );
}
