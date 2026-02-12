
import { useState } from "react";
import { dataService } from "@/services/dataService";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { X, Save, Loader2, Upload } from "lucide-react";

export function ClientForm({ onClose, onSuccess }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        sector: "",
        tier: "Standard",
        monthly_value: "",
        logo_url: "",
        drive_link: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                monthly_value: formData.monthly_value ? parseFloat(formData.monthly_value) : null,
                status: 'Ativo'
            };

            await dataService.clients.create(payload);
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            console.error("Erro ao criar cliente:", error);
            alert("Erro ao criar cliente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#111121] text-white">
            <div className="flex items-center justify-between p-6 border-b border-[#2d2d42]">
                <h2 className="text-xl font-bold">Novo Cliente</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nome da Empresa</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                            placeholder="Ex: Alpha Business"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Setor</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                                placeholder="Ex: Tecnologia"
                                value={formData.sector}
                                onChange={e => setFormData({ ...formData, sector: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Plano (Tier)</label>
                            <select
                                className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                                value={formData.tier}
                                onChange={e => setFormData({ ...formData, tier: e.target.value })}
                            >
                                <option value="Standard">Standard</option>
                                <option value="Premium">Premium</option>
                                <option value="Enterprise">Enterprise</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Valor Mensal (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                            placeholder="0.00"
                            value={formData.monthly_value}
                            onChange={e => setFormData({ ...formData, monthly_value: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">URL do Logo (Opcional)</label>
                        <input
                            type="url"
                            className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                            placeholder="https://..."
                            value={formData.logo_url}
                            onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Link do Google Drive (Opcional)</label>
                        <input
                            type="url"
                            className="w-full bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 text-white focus:border-avaloon-orange outline-none"
                            placeholder="https://drive.google.com/..."
                            value={formData.drive_link}
                            onChange={e => setFormData({ ...formData, drive_link: e.target.value })}
                        />
                    </div>
                </form>
            </div>

            <div className="p-6 border-t border-[#2d2d42] bg-[#1e1e2d]">
                <ButtonAvaloon
                    type="submit"
                    form="client-form"
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
                            Cadastrar Cliente
                        </>
                    )}
                </ButtonAvaloon>
            </div>
        </div>
    );
}
