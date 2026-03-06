import { useState, useEffect } from "react";
import { dataService } from "@/services/dataService";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { X, Save, Loader2, AlertTriangle, Users } from "lucide-react";

const TIER_OPTIONS = ["Padrão", "MID", "Premium", "Black"];

// ── Field helper ──────────────────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-bold text-muted uppercase">{label}</label>
        {children}
        {hint && <p className="text-[10px] text-dim">{hint}</p>}
    </div>
);

const Input = ({ ...props }) => (
    <input {...props} className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none transition-colors placeholder-slate-500" />
);

// ── Main ──────────────────────────────────────────────────────────────────────
/**
 * ClientForm — cria ou edita um cliente.
 * @param {object} [client]   - Se fornecido, entra em modo de edição
 * @param {function} onClose
 * @param {function} onSuccess
 */
export function ClientForm({ client = null, onClose, onSuccess }) {
    const isEditMode = !!client;
    const { teamMemberId } = useAuth();
    const { can } = usePermissions();
    const isAdmin = can("manage_clients");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [managers, setManagers] = useState([]);
    const [formData, setFormData] = useState({
        name: client?.name || "",
        sector: client?.sector || "",
        tier: client?.tier || "Padrão",
        monthly_value: client?.monthly_value || "",
        logo_url: client?.logo_url || "",
        drive_link: client?.drive_link || "",
        account_manager_id: client?.account_manager_id || (isAdmin ? "" : teamMemberId || ""),
    });

    const set = (k, v) => setFormData(f => ({ ...f, [k]: v }));

    // Load account managers (only admin needs the dropdown)
    useEffect(() => {
        if (isAdmin) {
            dataService.team.getAccountManagers()
                .then(setManagers)
                .catch(console.error);
        } else if (teamMemberId && !isEditMode) {
            // Auto-update manager ID for managers creating clients
            set("account_manager_id", teamMemberId);
        }
    }, [isAdmin, teamMemberId, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const payload = {
                ...formData,
                monthly_value: formData.monthly_value ? parseFloat(formData.monthly_value) : null,
                account_manager_id: formData.account_manager_id || null,
                status: client?.status || "Ativo",
            };

            if (isEditMode) {
                await dataService.clients.update(client.id, payload);
            } else {
                await dataService.clients.create(payload);
            }

            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (err) {
            console.error(err);
            setError(err.message || "Erro ao salvar cliente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const logoPreview = formData.logo_url || (formData.name
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=1e1e2d&color=ec5b13&bold=true&size=64`
        : null);

    return (
        <div className="flex flex-col h-full bg-background text-main">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-card">
                <div>
                    <h2 className="text-lg font-bold text-main">
                        {isEditMode ? "Editar Cliente" : "Novo Cliente"}
                    </h2>
                    <p className="text-xs text-dim">
                        {isEditMode ? `Editando: ${client.name}` : "Preencha os dados da empresa"}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-main/10 rounded-xl text-muted hover:text-main transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
                <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
                    {/* Logo preview */}
                    {logoPreview && (
                        <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                            <img src={logoPreview} alt="logo" className="w-10 h-10 rounded-lg object-contain bg-[#1f1f1f]" />
                            <div>
                                <p className="text-sm font-bold text-main">{formData.name || "Nome da empresa"}</p>
                                <p className="text-xs text-dim">{formData.sector || "Setor"} · {formData.tier}</p>
                            </div>
                        </div>
                    )}

                    <Field label="Nome da Empresa *">
                        <Input required placeholder="Ex: Alpha Business" value={formData.name} onChange={e => set("name", e.target.value)} />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Setor">
                            <Input placeholder="Ex: Tecnologia" value={formData.sector} onChange={e => set("sector", e.target.value)} />
                        </Field>
                        <Field label="Plano (Tier)">
                            <select value={formData.tier} onChange={e => set("tier", e.target.value)}
                                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none">
                                {TIER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </Field>
                    </div>

                    <Field label="Valor Mensal (R$)">
                        <Input type="number" step="0.01" placeholder="0.00" value={formData.monthly_value} onChange={e => set("monthly_value", e.target.value)} />
                    </Field>

                    {/* Responsável — dropdown para admin, info para account_manager */}
                    <Field label="Gerente de Contas Responsável" hint={!isAdmin ? "Você será automaticamente vinculado como responsável por este cliente." : ""}>
                        {isAdmin ? (
                            <select value={formData.account_manager_id} onChange={e => set("account_manager_id", e.target.value)}
                                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none">
                                <option value="">— Sem responsável —</option>
                                {managers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main font-bold border-l-4 border-l-avaloon-orange">
                                <Users className="w-4 h-4 text-avaloon-orange" />
                                <span>{useAuth().teamMember?.name || "Você (Identificado)"}</span>
                            </div>
                        )}
                    </Field>

                    <Field label="URL do Logo (Opcional)">
                        <Input type="url" placeholder="https://..." value={formData.logo_url} onChange={e => set("logo_url", e.target.value)} />
                    </Field>

                    <Field label="Link Google Drive (Opcional)">
                        <Input type="url" placeholder="https://drive.google.com/..." value={formData.drive_link} onChange={e => set("drive_link", e.target.value)} />
                    </Field>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                        </div>
                    )}
                </form>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-border bg-card">
                <ButtonAvaloon type="submit" form="client-form" variant="primary" className="w-full justify-center" disabled={isSubmitting}>
                    {isSubmitting
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                        : <><Save className="w-4 h-4" /> {isEditMode ? "Salvar Alterações" : "Cadastrar Cliente"}</>
                    }
                </ButtonAvaloon>
            </div>
        </div>
    );
}
