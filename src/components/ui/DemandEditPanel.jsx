import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader2, Calendar, Clock, User, Briefcase, FileText, AlertCircle } from "lucide-react";
import { dataService } from "@/services/dataService";
import { useAuth } from "@/context/AuthContext";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";

export function DemandEditPanel({ demand, onClose, onUpdate }) {
    const { teamMemberId, teamMember } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [clients, setClients] = useState([]);
    const [members, setMembers] = useState([]);

    const [formData, setFormData] = useState({
        title: demand.title || "",
        client_id: demand.client_id || "",
        assigned_to: demand.assigned_to || "",
        priority: demand.priority || "Medium",
        scheduled_date: demand.scheduled_at ? demand.scheduled_at.split('T')[0] : "",
        scheduled_time: demand.scheduled_at ? new Date(demand.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : "09:00",
        briefing_notes: demand.briefing_data?.notes || "",
    });

    const [areaData, setAreaData] = useState({
        media_type: demand.briefing_data?.media_type || "Digital",
        creative_quantity: demand.briefing_data?.creative_quantity || "",
    });

    useEffect(() => {
        async function loadOptions() {
            try {
                const [c, m] = await Promise.all([
                    dataService.clients.getAll(),
                    dataService.team.getAll(),
                ]);
                setClients(c || []);
                setMembers(m || []);
            } catch (e) {
                console.error("Erro ao carregar opções", e);
            }
        }
        loadOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);
        setError(null);

        try {
            const fullDate = formData.scheduled_date
                ? new Date(`${formData.scheduled_date}T${formData.scheduled_time}:00`).toISOString()
                : null;

            const updates = {
                title: formData.title,
                client_id: formData.client_id,
                assigned_to: formData.assigned_to,
                priority: formData.priority,
                scheduled_at: fullDate,
                briefing_data: {
                    ...demand.briefing_data,
                    notes: formData.briefing_notes,
                    ...areaData,
                }
            };

            await dataService.demands.fullUpdate({
                demandId: demand.id,
                updates,
                editorId: teamMemberId,
                editorName: teamMember?.name || "Editor"
            });

            if (onUpdate) onUpdate();
            onClose();
        } catch (err) {
            console.error("Erro ao atualizar demanda", err);
            setError(err.message || "Erro ao salvar alterações.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Panel */}
            <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute inset-y-0 right-0 w-full max-w-lg bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-card/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                            <Save className="w-5 h-5 text-avaloon-orange" />
                            Editar Demanda
                        </h3>
                        <p className="text-xs text-dim uppercase font-bold tracking-widest mt-1">Alterar informações e responsável</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-dim hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Body */}
                <form id="edit-demand-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Basic Info Group */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-dim uppercase tracking-widest">Informações Principais</p>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 ml-1">Título da Demanda</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-avaloon-orange/50 transition-colors"
                                placeholder="Ex: Campanha de Verão"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1">Cliente</label>
                                <select
                                    name="client_id"
                                    value={formData.client_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-avaloon-orange/50 transition-colors"
                                >
                                    <option value="" className="bg-[#1a1a1a]">Selecione...</option>
                                    {clients.map(c => <option key={c.id} value={c.id} className="bg-[#1a1a1a]">{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1">Prioridade</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-avaloon-orange/50 transition-colors"
                                >
                                    <option value="High" className="bg-[#1a1a1a]">Alta 🔥</option>
                                    <option value="Medium" className="bg-[#1a1a1a]">Normal ⚡</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Scheduling Group */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <p className="text-[10px] font-bold text-dim uppercase tracking-widest">Agendamento e Responsável</p>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 ml-1">Atribuir Responsável</label>
                            <select
                                name="assigned_to"
                                value={formData.assigned_to}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-avaloon-orange/50 transition-colors"
                            >
                                <option value="" className="bg-[#1a1a1a]">Sem Responsável (Backlog)</option>
                                {members.map(m => <option key={m.id} value={m.id} className="bg-[#1a1a1a]">{m.name} ({m.role})</option>)}
                            </select>
                            {formData.assigned_to !== demand.assigned_to && (
                                <p className="text-[10px] text-avaloon-orange font-bold mt-1 px-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Isso reenviará o convite de aceite para o novo profissional.
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1">Data</label>
                                <input
                                    type="date"
                                    name="scheduled_date"
                                    value={formData.scheduled_date}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-avaloon-orange/50 transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1">Horário</label>
                                <input
                                    type="time"
                                    name="scheduled_time"
                                    value={formData.scheduled_time}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-avaloon-orange/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Design Specific Fields */}
                    {demand.area === "DESIGN" && (
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <p className="text-[10px] font-bold text-dim uppercase tracking-widest text-green-400">Detalhes de Design</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Meio de Veiculação</label>
                                    <select
                                        value={areaData.media_type}
                                        onChange={(e) => setAreaData(prev => ({ ...prev, media_type: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                                    >
                                        <option value="Digital" className="bg-[#1a1a1a]">Digital</option>
                                        <option value="Impressa" className="bg-[#1a1a1a]">Impressa</option>
                                        <option value="I.A" className="bg-[#1a1a1a]">I.A</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Qtd. de Criativos</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={areaData.creative_quantity}
                                        onChange={(e) => setAreaData(prev => ({ ...prev, creative_quantity: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                                        placeholder="Ex: 5"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Briefing Notes */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <p className="text-[10px] font-bold text-dim uppercase tracking-widest">Descrição e Briefing</p>
                        <textarea
                            name="briefing_notes"
                            value={formData.briefing_notes}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-avaloon-orange/50 transition-colors resize-none"
                            placeholder="Descreva as instruções principais..."
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-card/50 flex gap-3">
                    <ButtonAvaloon variant="tertiary" onClick={onClose} className="flex-1 justify-center h-12">
                        Descartar
                    </ButtonAvaloon>
                    <ButtonAvaloon
                        type="submit"
                        form="edit-demand-form"
                        variant="primary"
                        disabled={isSaving}
                        className="flex-3 justify-center h-12 shadow-lg shadow-avaloon-orange/20"
                    >
                        {isSaving ? (
                            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Salvando...</>
                        ) : (
                            <><Save className="w-5 h-5 mr-2" /> Salvar Alterações</>
                        )}
                    </ButtonAvaloon>
                </div>
            </motion.div>
        </div>
    );
}
