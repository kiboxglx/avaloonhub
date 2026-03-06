import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, XCircle, Loader2, AlertTriangle, UserCheck, ArrowRight, Users } from "lucide-react";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { dataService } from "@/services/dataService";

// Pre-defined reason chips
const REASON_CHIPS = [
    { id: "NO_TIME", label: "⏰ Sem tempo hábil" },
    { id: "MISSING_INFO", label: "📋 Faltam informações" },
    { id: "WRONG_SCOPE", label: "🔄 Escopo incorreto" },
    { id: "WRONG_BRIEF", label: "📝 Briefing incompleto" },
    { id: "OTHER", label: "💬 Outro motivo" },
];

const MAX_DELEGATIONS = 3;

/**
 * DemandRejectionModal
 * @param {object}   demand       - The full demand object being rejected
 * @param {array}    teamMembers  - All team members (will be filtered here)
 * @param {string}   currentUserId - ID of the user rejecting (excluded from dropdown)
 * @param {function} onConfirm   - Called with ({ chips, text, delegateeId, delegateeName })
 * @param {function} onCancel    - Called when user dismisses without action
 */
export function DemandRejectionModal({ demand, currentUserId, onConfirm, onCancel }) {
    const [selectedChips, setSelectedChips] = useState([]);
    const [reasonText, setReasonText] = useState("");
    const [delegateeId, setDelegateeId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(true);

    // Fetch team members on mount
    useEffect(() => {
        dataService.team.getAll()
            .then(data => setTeamMembers(data))
            .finally(() => setLoadingMembers(false));
    }, []);

    const delegationLog = demand?.briefing_data?.delegation_log || [];
    const delegationCount = delegationLog.length;
    const alreadyRejectedIds = new Set(delegationLog.map(e => e.user_id));

    // Filter team members for delegation dropdown:
    // same area as demand, available, not the current rejector, not already in delegation log
    const eligibleMembers = useMemo(() => {
        return (teamMembers || []).filter(m =>
            m.id !== currentUserId &&
            !alreadyRejectedIds.has(m.id) &&
            (m.status === 'Available' || !m.status) // fallback for members without status
        );
    }, [teamMembers, currentUserId, alreadyRejectedIds]);

    const selectedDelegate = eligibleMembers.find(m => m.id === delegateeId) || null;

    const toggleChip = (id) => {
        setSelectedChips(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    };

    const isValid = selectedChips.length > 0 || reasonText.trim().length >= 10;
    const showError = touched && !isValid;

    const handleConfirm = async () => {
        setTouched(true);
        if (!isValid) return;
        setSubmitting(true);
        try {
            await onConfirm({
                chips: selectedChips,
                text: reasonText.trim(),
                delegateeId: delegateeId || null,
                delegateeName: selectedDelegate?.name || null,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const isDelegate = !!delegateeId;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                {/* Backdrop — no dismiss on click (intentional) */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.94, opacity: 0, y: 16 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.94, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.3 }}
                    className="relative z-10 w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Red accent bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-red-600 to-red-400" />

                    {/* Header */}
                    <div className="flex items-start justify-between p-5 border-b border-border bg-background">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-500/15">
                                <XCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-main text-base">Recusar Demanda</h3>
                                <p className="text-xs text-dim mt-0.5 truncate max-w-[280px]">{demand?.title || "—"}</p>
                            </div>
                        </div>
                        <button onClick={onCancel} className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-main/10 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">

                        {/* ── Delegation limit warning ── */}
                        {delegationCount >= MAX_DELEGATIONS && (
                            <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2.5 text-xs text-yellow-400">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                <span>Esta demanda foi delegada <strong>{delegationCount}×</strong>. Considere devolvê-la ao mandante para reatribuição direta.</span>
                            </div>
                        )}

                        {/* ── Reason chips ── */}
                        <div>
                            <p className="text-xs font-bold text-dim uppercase tracking-wider mb-2">
                                Motivo da Recusa <span className="text-red-400">*</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {REASON_CHIPS.map(chip => {
                                    const active = selectedChips.includes(chip.id);
                                    return (
                                        <button key={chip.id} type="button"
                                            onClick={() => { toggleChip(chip.id); setTouched(false); }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active
                                                ? "bg-red-500/20 border-red-500/60 text-red-300"
                                                : "bg-card border-border text-muted hover:border-red-400/40 hover:text-main"}`}
                                        >
                                            {chip.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Free text ── */}
                        <div>
                            <p className="text-xs font-bold text-dim uppercase tracking-wider mb-2">
                                Detalhes Adicionais
                                {selectedChips.length === 0 && <span className="text-red-400 ml-1">*</span>}
                            </p>
                            <textarea rows={2} value={reasonText}
                                onChange={e => { setReasonText(e.target.value); setTouched(false); }}
                                placeholder="Descreva brevemente... (mínimo 10 caracteres se nenhum chip marcado)"
                                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-main resize-none focus:border-red-400/60 outline-none transition-colors placeholder:text-dim/60"
                            />
                            <p className="text-right text-[10px] text-dim/50 mt-1">{reasonText.length}/300</p>
                        </div>

                        {/* ── Delegation section ── */}
                        <div className="border border-border rounded-xl overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2.5 bg-background/60 border-b border-border">
                                <Users className="w-3.5 h-3.5 text-avaloon-orange flex-shrink-0" />
                                <p className="text-xs font-bold text-dim uppercase tracking-wider">
                                    Delegar para outro colega <span className="text-dim font-normal normal-case tracking-normal">(opcional)</span>
                                </p>
                            </div>
                            <div className="p-3">
                                {eligibleMembers.length === 0 ? (
                                    <p className="text-xs text-dim/70 text-center py-2">
                                        Nenhum membro disponível para delegação no momento.
                                    </p>
                                ) : (
                                    <select
                                        value={delegateeId}
                                        onChange={e => setDelegateeId(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-main focus:border-avaloon-orange/60 outline-none transition-colors"
                                    >
                                        <option value="">— Nenhum (apenas recusar) —</option>
                                        {eligibleMembers.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.name}{m.area ? ` · ${m.area}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {/* Selected delegate preview */}
                                {selectedDelegate && (
                                    <div className="mt-2.5 flex items-center gap-2 bg-avaloon-orange/5 border border-avaloon-orange/20 rounded-lg px-2.5 py-2">
                                        <UserCheck className="w-3.5 h-3.5 text-avaloon-orange flex-shrink-0" />
                                        <p className="text-xs text-main">
                                            A demanda será enviada para <strong>{selectedDelegate.name}</strong> para aceite.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Validation error ── */}
                        {showError && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-xs text-red-400">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                Selecione ao menos um motivo ou descreva com pelo menos 10 caracteres.
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border bg-background">
                        <button onClick={onCancel}
                            className="px-4 py-2 text-sm font-semibold text-muted hover:text-main rounded-xl border border-border hover:border-main/30 transition-colors">
                            Cancelar
                        </button>
                        <ButtonAvaloon type="button" onClick={handleConfirm} disabled={submitting}
                            className={`gap-2 ${isDelegate
                                ? "bg-avaloon-orange hover:bg-avaloon-orange/90 text-white border-avaloon-orange"
                                : "bg-red-600 hover:bg-red-500 text-white border-red-600"}`}
                        >
                            {submitting
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
                                : isDelegate
                                    ? <><ArrowRight className="w-4 h-4" /> Recusar e Delegar</>
                                    : <><XCircle className="w-4 h-4" /> Confirmar Recusa</>
                            }
                        </ButtonAvaloon>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
