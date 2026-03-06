import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Calendar, Clock, User, Briefcase, MapPin, Target, DollarSign,
    Smartphone, FileText, ArrowRight, CheckCircle2, Loader2, ExternalLink,
    Video, Palette, TrendingUp, Users, Edit3, XCircle, Lock, Trash2
} from "lucide-react";
import { AREA_CONFIG } from "@/components/ui/AreaSelector";
import { dataService } from "@/services/dataService";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { DemandRejectionModal } from "@/components/ui/DemandRejectionModal";
import { DemandEditPanel } from "@/components/ui/DemandEditPanel";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePermissions } from "@/hooks/usePermissions";

const STATUSES = [
    { id: "TODO", label: "A Fazer", color: "bg-slate-500/20 text-muted border-slate-500/30" },
    { id: "DOING", label: "Em Produção", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { id: "REVIEW", label: "Revisão", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    { id: "DONE", label: "Concluído", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { id: "rejected", label: "Recusada", color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

const PRIORITY_LABELS = { High: "Alta", Medium: "Normal", Low: "Baixa" };

function DetailRow({ icon: Icon, label, value, accent }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${accent || "text-dim"}`} />
            <div>
                <p className="text-[11px] text-dim uppercase font-bold">{label}</p>
                <p className="text-sm text-slate-200 mt-0.5">{value}</p>
            </div>
        </div>
    );
}

const AREA_ICON = {
    VIDEOMAKER: Video,
    ACCOUNTS: Briefcase,
    DESIGN: Palette,
    TRAFFIC: TrendingUp,
    GENERIC: FileText,
};

export function DemandDetailModal({ demand, onClose, onUpdate }) {
    const { teamMemberId, teamMember } = useAuth();
    const { can } = usePermissions();
    const isAdmin = can("edit_team");

    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(demand.status);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showEditPanel, setShowEditPanel] = useState(false);

    const area = demand.area || "GENERIC";
    const areaCfg = AREA_CONFIG[area] || AREA_CONFIG.GENERIC;
    const AreaIcon = AREA_ICON[area] || FileText;

    const scheduledDate = demand.scheduled_at
        ? format(new Date(demand.scheduled_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
        : null;

    const briefingData = demand.briefing_data || {};
    const currentStatusCfg = STATUSES.find(s => s.id === currentStatus) || STATUSES[0];

    const handleStatusChange = async (newStatus) => {
        setIsChangingStatus(true);
        try {
            await dataService.demands.updateStatus(demand.id, newStatus);
            setCurrentStatus(newStatus);
            if (onUpdate) onUpdate();
        } catch (e) {
            console.error("Erro ao mudar status:", e);
        } finally {
            setIsChangingStatus(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Tem certeza que deseja excluir esta demanda? Esta ação não pode ser desfeita.")) return;

        setIsDeleting(true);
        try {
            await dataService.demands.delete(demand.id);
            if (onUpdate) onUpdate();
            onClose();
        } catch (e) {
            console.error("Erro ao excluir demanda:", e);
            alert("Erro ao excluir demanda.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRejectConfirm = async ({ chips, text, delegateeId, delegateeName }) => {
        await dataService.demands.rejectDemand({
            demandId: demand.id,
            demand,
            rejectorName: teamMember?.name || 'Membro da equipe',
            rejectorId: teamMemberId,
            chips,
            text,
            delegateeId,
            delegateeName
        });

        // If delegated, status remains 'pending_acceptance' (but we update local UI state if needed)
        // If just rejected, status becomes 'rejected'
        setCurrentStatus(delegateeId ? 'pending_acceptance' : 'rejected');

        setShowRejectionModal(false);
        if (onUpdate) onUpdate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            />

            {/* Panel - slide from right */}
            <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                className="absolute inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border shadow-2xl flex flex-col z-10 overflow-hidden"
            >
                {/* Top accent bar */}
                <div className={`h-1 w-full ${areaCfg.dot}`} />

                {/* Header */}
                <div className="p-6 border-b border-border bg-card">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${areaCfg.bgColor} ${areaCfg.textColor}`}>
                                    <AreaIcon className="w-3 h-3" />
                                    {areaCfg.label}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${currentStatusCfg.color}`}>
                                    {currentStatusCfg.label}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-main leading-tight">{demand.title}</h2>
                            <p className="text-sm text-muted mt-1">
                                {demand.clients?.name && <span>📁 {demand.clients.name}</span>}
                                {demand.services?.name && <span className="ml-2">• {demand.services.name}</span>}
                            </p>
                        </div>
                        {currentStatus !== 'DONE' ? (
                            <button
                                onClick={() => setShowEditPanel(true)}
                                className="p-2 hover:bg-avaloon-orange/10 rounded-full text-dim hover:text-avaloon-orange transition-colors flex-shrink-0"
                                title="Editar Demanda"
                            >
                                <Edit3 className="w-5 h-5" />
                            </button>
                        ) : (
                            <div className="p-2 text-dim/30" title="Demandas concluídas não podem ser editadas">
                                <Lock className="w-5 h-5" />
                            </div>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-main/10 rounded-full text-muted hover:text-main transition-colors flex-shrink-0">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Status Changer */}
                    <div>
                        <p className="text-xs font-bold text-dim uppercase mb-3">Mover para</p>
                        <div className="grid grid-cols-2 gap-2">
                            {STATUSES.map(s => (
                                <button
                                    key={s.id}
                                    disabled={s.id === currentStatus || isChangingStatus}
                                    onClick={() => handleStatusChange(s.id)}
                                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${s.id === currentStatus
                                        ? `${s.color} cursor-default ring-2 ring-offset-1 ring-offset-[#000000] ring-white/10`
                                        : "bg-card border-border text-muted hover:text-main hover:border-main/20"
                                        }`}
                                >
                                    {isChangingStatus && s.id === currentStatus
                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                        : s.id === currentStatus
                                            ? <CheckCircle2 className="w-3 h-3" />
                                            : <ArrowRight className="w-3 h-3" />
                                    }
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-card rounded-xl border border-border p-4">
                        <p className="text-xs font-bold text-dim uppercase mb-3">Informações</p>
                        <DetailRow icon={Calendar} label="Data Agendada" value={scheduledDate} accent="text-avaloon-orange" />
                        <DetailRow icon={Target} label="Prioridade" value={PRIORITY_LABELS[demand.priority] || demand.priority} accent="text-yellow-400" />
                        <DetailRow icon={User} label="Responsável" value={demand.profiles?.full_name} accent="text-blue-400" />
                    </div>

                    {/* Area-specific details */}
                    {Object.keys(briefingData).length > 0 && (
                        <div className={`rounded-xl border p-4 ${areaCfg.bgColor}`}>
                            <p className={`text-xs font-bold uppercase mb-3 ${areaCfg.textColor}`}>
                                Detalhes de {areaCfg.label}
                            </p>
                            {/* Videomaker */}
                            {briefingData.location && <DetailRow icon={MapPin} label="Local" value={briefingData.location} accent="text-red-400" />}
                            {briefingData.production_type && <DetailRow icon={Video} label="Tipo de Produção" value={briefingData.production_type} accent="text-red-400" />}
                            {briefingData.crew_notes && <DetailRow icon={Users} label="Equipe / Equipamentos" value={briefingData.crew_notes} accent="text-red-400" />}

                            {/* Accounts */}
                            {briefingData.meeting_type && <DetailRow icon={Briefcase} label="Tipo de Reunião" value={briefingData.meeting_type} accent="text-purple-400" />}
                            {briefingData.participants && <DetailRow icon={Users} label="Participantes" value={briefingData.participants} accent="text-purple-400" />}
                            {briefingData.agenda && <DetailRow icon={FileText} label="Pauta" value={briefingData.agenda} accent="text-purple-400" />}

                            {/* Design */}
                            {briefingData.media_type && <DetailRow icon={Smartphone} label="Meio de Veiculação" value={briefingData.media_type} accent="text-green-400" />}
                            {briefingData.creative_quantity && <DetailRow icon={FileText} label="Qtd. de Criativos" value={briefingData.creative_quantity} accent="text-green-400" />}
                            {briefingData.design_brief && <DetailRow icon={Edit3} label="Briefing da Arte" value={briefingData.design_brief} accent="text-green-400" />}

                            {/* Traffic */}
                            {briefingData.ads_platform && <DetailRow icon={Smartphone} label="Plataforma de Ads" value={briefingData.ads_platform} accent="text-blue-400" />}
                            {briefingData.budget && <DetailRow icon={DollarSign} label="Verba" value={`R$ ${briefingData.budget}`} accent="text-blue-400" />}
                            {briefingData.campaign_objective && <DetailRow icon={Target} label="Objetivo" value={briefingData.campaign_objective} accent="text-blue-400" />}
                            {briefingData.campaign_notes && <DetailRow icon={FileText} label="Observações" value={briefingData.campaign_notes} accent="text-blue-400" />}
                        </div>
                    )}

                    {/* General Notes */}
                    {briefingData.notes && (
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs font-bold text-dim uppercase mb-2">Observações Gerais</p>
                            <p className="text-sm text-slate-300 leading-relaxed">{briefingData.notes}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-card flex gap-3">
                    <ButtonAvaloon variant="tertiary" onClick={onClose} className="flex-1 justify-center">
                        Fechar
                    </ButtonAvaloon>

                    {isAdmin && (
                        <ButtonAvaloon
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 justify-center bg-red-600/10 hover:bg-red-600/20 text-red-500 border-red-500/30 hover:border-red-500/50"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Excluir
                        </ButtonAvaloon>
                    )}
                    {/* Reject button — visible when demand is not already rejected/done */}
                    {currentStatus !== 'rejected' && currentStatus !== 'DONE' && (
                        <ButtonAvaloon
                            type="button"
                            onClick={() => setShowRejectionModal(true)}
                            className="flex-1 justify-center bg-red-600/10 hover:bg-red-600/20 text-red-400 border-red-500/30 hover:border-red-500/50"
                        >
                            <XCircle className="w-4 h-4" /> Recusar
                        </ButtonAvaloon>
                    )}
                    {currentStatus !== "DONE" && currentStatus !== 'rejected' && (
                        <ButtonAvaloon
                            variant="primary"
                            className="flex-1 justify-center"
                            onClick={() => handleStatusChange("DONE")}
                            disabled={isChangingStatus}
                        >
                            <CheckCircle2 className="w-4 h-4" /> Concluído
                        </ButtonAvaloon>
                    )}
                </div>
            </motion.div>

            {/* Rejection Modal — rendered at end to stay above detail panel */}
            <AnimatePresence>
                {showRejectionModal && (
                    <DemandRejectionModal
                        demand={demand}
                        currentUserId={teamMemberId}
                        onConfirm={handleRejectConfirm}
                        onCancel={() => setShowRejectionModal(false)}
                    />
                )}
                {showEditPanel && (
                    <DemandEditPanel
                        demand={demand}
                        onClose={() => setShowEditPanel(false)}
                        onUpdate={() => {
                            if (onUpdate) onUpdate();
                            onClose(); // Close details too as data changed significantly
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
