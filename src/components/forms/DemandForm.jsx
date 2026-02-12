
import { useState, useEffect } from "react";
import { dataService } from "@/services/dataService";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { X, Calendar, Clock, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function DemandForm({ onClose, onSuccess, type = 'GENERIC' }) {
    const [clients, setClients] = useState([]);
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        client_id: "",
        service_id: "",
        scheduled_date: "",
        scheduled_time: "",
        briefing_notes: "",
        platform: "Instagram" // Default for content
    });

    useEffect(() => {
        async function loadOptions() {
            try {
                const [clientsData, servicesData] = await Promise.all([
                    dataService.clients.getAll(),
                    dataService.services.getAll()
                ]);
                setClients(clientsData || []);
                setServices(servicesData || []);
            } catch (error) {
                console.error("Falha ao carregar opções:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadOptions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Combine date and time
            const fullDate = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);

            // Construct payload
            const payload = {
                title: formData.title,
                client_id: formData.client_id,
                service_id: formData.service_id,
                scheduled_at: fullDate.toISOString(),
                status: type === 'CONTENT' ? 'IDEA' : 'TODO', // Default status depends on type
                priority: 'Medium',
                type: type, // Use the prop
                briefing_data: {
                    notes: formData.briefing_notes,
                    original_time_input: formData.scheduled_time,
                    platform: type === 'CONTENT' ? formData.platform : undefined
                }
            };

            await dataService.demands.create(payload);
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            console.error("Erro ao criar demanda:", error);
            alert("Erro ao criar demanda. Verifique os dados.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#111121] text-white">
            <div className="flex items-center justify-between p-6 border-b border-[#2d2d42]">
                <h2 className="text-xl font-bold">Nova Demanda</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-avaloon-orange" />
                    </div>
                ) : (
                    <form id="demand-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Título do Projeto</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                                placeholder="Ex: Campanha de Inverno"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Client & Service */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Cliente</label>
                                <select
                                    required
                                    className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                                    value={formData.client_id}
                                    onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Serviço</label>
                                <select
                                    required
                                    className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                                    value={formData.service_id}
                                    onChange={e => setFormData({ ...formData, service_id: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            {type === 'CONTENT' && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Plataforma</label>
                                    <select
                                        className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                                        value={formData.platform}
                                        onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                    >
                                        <option value="Instagram">Instagram</option>
                                        <option value="TikTok">TikTok</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="YouTube">YouTube</option>
                                        <option value="Facebook">Facebook</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Data
                                </label>
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none color-scheme-dark"
                                    value={formData.scheduled_date}
                                    onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Horário
                                </label>
                                <input
                                    required
                                    type="time"
                                    className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none color-scheme-dark"
                                    value={formData.scheduled_time}
                                    onChange={e => setFormData({ ...formData, scheduled_time: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Additional Notes (Questionnaire "etc") */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Detalhes Adicionais (Briefing)</label>
                            <textarea
                                className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none h-32 resize-none"
                                placeholder="Descreva mais detalhes sobre a demanda..."
                                value={formData.briefing_notes}
                                onChange={e => setFormData({ ...formData, briefing_notes: e.target.value })}
                            />
                        </div>
                    </form>
                )}
            </div>

            <div className="p-6 border-t border-[#2d2d42] bg-[#1e1e2d]">
                <ButtonAvaloon
                    type="submit"
                    form="demand-form"
                    variant="primary"
                    className="w-full justify-center"
                    disabled={isSubmitting || isLoading}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Criando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Criar Demanda
                        </>
                    )}
                </ButtonAvaloon>
            </div>
        </div>
    );
}
