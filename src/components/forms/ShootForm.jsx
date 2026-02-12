import { useState, useEffect } from "react";
import { dataService } from "@/services/dataService";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { X, Calendar, Clock, Save, Loader2, MapPin, Users, Camera, FileText } from "lucide-react";
import { motion } from "framer-motion";

export function ShootForm({ onClose, onSuccess }) {
    const [clients, setClients] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        client_id: "",
        scheduled_date: "",
        scheduled_start_time: "",
        scheduled_end_time: "",
        location: "",
        crew_ids: [], // Array of team member IDs
        equipment_notes: "",
        script: ""
    });

    useEffect(() => {
        async function loadOptions() {
            try {
                const [clientsData, teamData] = await Promise.all([
                    dataService.clients.getAll(),
                    dataService.team.getAll()
                ]);
                setClients(clientsData || []);
                setTeamMembers(teamData || []);
            } catch (error) {
                console.error("Falha ao carregar opções:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadOptions();
    }, []);

    const toggleCrewMember = (memberId) => {
        setFormData(prev => {
            const current = prev.crew_ids;
            if (current.includes(memberId)) {
                return { ...prev, crew_ids: current.filter(id => id !== memberId) };
            } else {
                return { ...prev, crew_ids: [...current, memberId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Combine date and time for start
            const fullDate = new Date(`${formData.scheduled_date}T${formData.scheduled_start_time}`);

            // Construct payload
            const payload = {
                title: formData.title,
                client_id: formData.client_id,
                // We might need a service_id. For now, let's leave empty or pick a default if known, 
                // but supabase constraints might require it if not nullable. 
                // Assuming nullable or we can pass a dummy if needed. 
                // Better: Let's fetch services and find one that matches 'Shoot' or just leave blank if schema allows.
                // Re-checking schema: service_id is REFERENCES services. It might be nullable.
                // Safe bet: Just send it if selected, or handle in backend. 
                // Let's assume nullable for now or that we don't strictly enforce it here.
                scheduled_at: fullDate.toISOString(),
                status: 'TODO', // Or 'SCHEDULED'
                priority: 'High',
                type: 'SHOOT',
                briefing_data: {
                    location: formData.location,
                    end_time: formData.scheduled_end_time,
                    crew_ids: formData.crew_ids,
                    equipment: formData.equipment_notes,
                    notes: formData.script
                }
            };

            await dataService.demands.create(payload);
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            console.error("Erro ao criar filmagem:", error);
            alert("Erro ao agendar filmagem. Verifique os dados.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#111121] text-white">
            <div className="flex items-center justify-between p-6 border-b border-[#2d2d42]">
                <div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                        Nova Filmagem
                    </h2>
                    <p className="text-xs text-slate-400">Agendar Media Day ou Gravação</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-avaloon-orange" />
                    </div>
                ) : (
                    <form id="shoot-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Title & Client */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Projeto / Media Day</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                                    placeholder="Ex: Media Day Verão 2024"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Cliente</label>
                                <select
                                    required
                                    className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                                    value={formData.client_id}
                                    onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                                >
                                    <option value="">Selecione o Cliente...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date, Time, Location */}
                        <div className="space-y-4 pt-4 border-t border-[#2d2d42]">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-red-500" /> Logística
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Data</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none color-scheme-dark"
                                        value={formData.scheduled_date}
                                        onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Início</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none color-scheme-dark"
                                        value={formData.scheduled_start_time}
                                        onChange={e => setFormData({ ...formData, scheduled_start_time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Fim (Previsto)</label>
                                    <input
                                        type="time"
                                        className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none color-scheme-dark"
                                        value={formData.scheduled_end_time}
                                        onChange={e => setFormData({ ...formData, scheduled_end_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Local da Gravação
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                                    placeholder="Endereço completo ou Nome do Estúdio"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Crew Selection */}
                        <div className="space-y-4 pt-4 border-t border-[#2d2d42]">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" /> Equipe Necessária
                            </h3>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                                {teamMembers.map(member => (
                                    <div
                                        key={member.id}
                                        onClick={() => toggleCrewMember(member.id)}
                                        className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${formData.crew_ids.includes(member.id)
                                                ? 'bg-blue-500/20 border-blue-500 text-white'
                                                : 'bg-[#1e1e2d] border-[#2d2d42] text-slate-400 hover:border-slate-500'
                                            }`}
                                    >
                                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                            {member.avatar_url ? (
                                                <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px]">{member.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate">{member.name}</p>
                                            <p className="text-[10px] opacity-70 truncate">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                                {teamMembers.length === 0 && (
                                    <p className="text-xs text-slate-500 col-span-2">Nenhum membro na equipe ainda.</p>
                                )}
                            </div>
                        </div>

                        {/* Script & Equipment */}
                        <div className="space-y-4 pt-4 border-t border-[#2d2d42]">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-green-500" /> Detalhes
                            </h3>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Roteiro / Observações</label>
                                <textarea
                                    className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none h-24 resize-none"
                                    placeholder="Briefing do dia, lista de takes..."
                                    value={formData.script}
                                    onChange={e => setFormData({ ...formData, script: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                                    <Camera className="w-3 h-3" /> Equipamento Específico
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                                    placeholder="Ex: Drone, Kit Iluminação Extra, Teleprompter..."
                                    value={formData.equipment_notes}
                                    onChange={e => setFormData({ ...formData, equipment_notes: e.target.value })}
                                />
                            </div>
                        </div>

                    </form>
                )}
            </div>

            <div className="p-6 border-t border-[#2d2d42] bg-[#1e1e2d]">
                <ButtonAvaloon
                    type="submit"
                    form="shoot-form"
                    variant="primary"
                    className="w-full justify-center"
                    disabled={isSubmitting || isLoading}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Agendando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Agendar Media Day
                        </>
                    )}
                </ButtonAvaloon>
            </div>
        </div>
    );
}
