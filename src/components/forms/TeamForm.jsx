import { useState } from "react";
import { dataService } from "@/services/dataService";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import {
    X, Save, Loader2, Video, Plane, Lightbulb, Monitor, Mic, Hammer,
    Plus, AlertTriangle, CheckCircle2, MapPin, Mail, Phone
} from "lucide-react";
import { AREA_CONFIG } from "@/components/ui/AreaSelector";

// ── Kit presets ───────────────────────────────────────────────────────────────
const KITS_PRESETS = [
    { icon: Video, name: "Câmera Cinema Line (Sony/RED)" },
    { icon: Plane, name: "Drone (DJI Mavic/Inspire)" },
    { icon: Lightbulb, name: "Kit Iluminação (Aputure/Godox)" },
    { icon: Monitor, name: "Workstation Edição (Mac Studio/PC)" },
    { icon: Mic, name: "Kit Áudio (Zoom/Sennheiser)" },
    { icon: Hammer, name: "Grip & Maquinária" },
];

const AREA_OPTIONS = [
    { id: "VIDEOMAKER", label: "Videomaker" },
    { id: "DESIGN", label: "Design" },
    { id: "TRAFFIC", label: "Tráfego" },
    { id: "ACCOUNTS", label: "Gerente de Contas" },
    { id: "GENERIC", label: "Geral" },
];

// ── Tag input for specialties ─────────────────────────────────────────────────
function TagInput({ tags, onChange }) {
    const [input, setInput] = useState("");

    const addTag = (val) => {
        const trimmed = val.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInput("");
    };

    const handleKey = (e) => {
        if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); }
        if (e.key === "Backspace" && !input && tags.length > 0) onChange(tags.slice(0, -1));
    };

    return (
        <div className="flex flex-wrap gap-2 bg-card border border-border rounded-lg p-2 min-h-[44px] focus-within:border-avaloon-orange transition-colors">
            {tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-avaloon-orange/20 text-avaloon-orange border border-avaloon-orange/30 rounded text-xs font-bold">
                    {tag}
                    <button type="button" onClick={() => onChange(tags.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors">×</button>
                </span>
            ))}
            <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                onBlur={() => addTag(input)}
                placeholder={tags.length === 0 ? "Ex: Drone, Edição... (Enter para adicionar)" : ""}
                className="flex-1 min-w-[120px] bg-transparent text-main text-sm placeholder-slate-500 outline-none"
            />
        </div>
    );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export function TeamForm({ onClose, onSuccess }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        area: "VIDEOMAKER",
        location: "",
        email: "",
        phone: "",
        status: "Available",
        avatar_url: "",
        specialties: [],
        kit: [],
    });

    const set = (k, v) => setFormData(f => ({ ...f, [k]: v }));

    const toggleKit = (name) => {
        const exists = formData.kit.some(k => k.name === name);
        set("kit", exists ? formData.kit.filter(k => k.name !== name) : [...formData.kit, { name }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.role.trim()) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await dataService.team.create({
                ...formData,
                specialties: formData.specialties,
                kit: formData.kit,
            });
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (err) {
            console.error(err);
            setError(err.message || "Erro ao adicionar membro.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const avatarUrl = formData.avatar_url ||
        (formData.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=1e1e2d&color=ec5b13&bold=true&size=128` : null);
    const areaCfg = AREA_CONFIG[formData.area] || AREA_CONFIG.GENERIC;

    const field = (label, children, hint) => (
        <div className="space-y-1.5">
            <label className="block text-sm font-bold text-muted">{label}</label>
            {children}
            {hint && <p className="text-xs text-dim">{hint}</p>}
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-background text-main">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-card">
                <div>
                    <h2 className="text-lg font-bold text-main">Novo Membro da Equipe</h2>
                    <p className="text-xs text-dim">Preencha os dados do colaborador</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-main/10 rounded-xl text-muted hover:text-main transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
                <form id="team-form" onSubmit={handleSubmit} className="space-y-5">
                    {/* Avatar preview */}
                    {avatarUrl && (
                        <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                            <img src={avatarUrl} alt="preview" className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                                <p className="text-sm font-bold text-main">{formData.name || "Nome do Membro"}</p>
                                <p className={`text-xs font-bold ${areaCfg.textColor}`}>{formData.role || "Cargo"}</p>
                            </div>
                        </div>
                    )}

                    {/* Name */}
                    {field("Nome Completo *",
                        <input required type="text" placeholder="Ex: Carlos Andrade"
                            className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none transition-colors"
                            value={formData.name} onChange={e => set("name", e.target.value)} />
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {/* Role */}
                        {field("Cargo / Função *",
                            <input required type="text" placeholder="Ex: Videomaker"
                                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none transition-colors"
                                value={formData.role} onChange={e => set("role", e.target.value)} />
                        )}
                        {/* Area */}
                        {field("Área",
                            <select value={formData.area} onChange={e => set("area", e.target.value)}
                                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none">
                                {AREA_OPTIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                            </select>
                        )}
                    </div>

                    {/* Status */}
                    {field("Status Inicial",
                        <div className="flex gap-2">
                            {[{ id: "Available", label: "Disponível" }, { id: "On-Set", label: "Em Gravação" }, { id: "Offline", label: "Offline" }].map(s => (
                                <button key={s.id} type="button" onClick={() => set("status", s.id)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${formData.status === s.id ? "bg-avaloon-orange/20 border-avaloon-orange text-avaloon-orange" : "bg-card border-border text-muted hover:text-main"}`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {/* Location */}
                        {field("Localização",
                            <input type="text" placeholder="Ex: São Paulo"
                                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none transition-colors"
                                value={formData.location} onChange={e => set("location", e.target.value)} />
                        )}
                        {/* Phone */}
                        {field("Telefone / WhatsApp",
                            <input type="text" placeholder="(55) 99999-9999"
                                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none transition-colors"
                                value={formData.phone} onChange={e => set("phone", e.target.value)} />
                        )}
                    </div>

                    {/* Email */}
                    {field("Email",
                        <input type="email" placeholder="email@agencia.com"
                            className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none transition-colors"
                            value={formData.email} onChange={e => set("email", e.target.value)} />
                    )}

                    {/* Specialties — tag input */}
                    {field("Especialidades", <TagInput tags={formData.specialties} onChange={v => set("specialties", v)} />, "Pressione Enter ou vírgula para adicionar uma tag")}

                    {/* Kits */}
                    {field("Equipamentos / Kits",
                        <div className="grid grid-cols-2 gap-2">
                            {KITS_PRESETS.map((preset) => {
                                const isSelected = formData.kit.some(k => k.name === preset.name);
                                return (
                                    <button key={preset.name} type="button" onClick={() => toggleKit(preset.name)}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-all ${isSelected ? "bg-avaloon-orange/20 border-avaloon-orange text-main" : "bg-card border-border text-muted hover:border-slate-500"}`}>
                                        <preset.icon className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{preset.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Avatar URL */}
                    {field("Foto de Perfil (URL opcional)",
                        <input type="url" placeholder="https://..."
                            className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-main focus:border-avaloon-orange outline-none transition-colors"
                            value={formData.avatar_url} onChange={e => set("avatar_url", e.target.value)} />,
                        "Se vazio, será gerado automaticamente com as iniciais do nome."
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
                        </div>
                    )}
                </form>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-border bg-card">
                <ButtonAvaloon type="submit" form="team-form" variant="primary" className="w-full justify-center" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> Adicionar Membro</>}
                </ButtonAvaloon>
            </div>
        </div>
    );
}
