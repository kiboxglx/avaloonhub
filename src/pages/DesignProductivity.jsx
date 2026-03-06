import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Palette, Link as LinkIcon, RefreshCw, Target, TrendingUp,
    CheckCircle, AlertCircle, Loader2, Save, BarChart3, Calendar,
    ExternalLink, Plus, X
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { googleDriveService } from "@/services/googleDriveService";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";

// --- Sub-component: KPI Bar ---
function KpiBar({ current, goal }) {
    const pct = goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0;
    const color = pct >= 100 ? "bg-green-500" : pct >= 60 ? "bg-avaloon-orange" : "bg-red-500";
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">Progresso da Meta</span>
                <span className={`font-bold ${pct >= 100 ? "text-green-400" : pct >= 60 ? "text-orange-400" : "text-red-400"}`}>{pct}%</span>
            </div>
            <div className="w-full bg-[#1f1f1f] rounded-full h-2">
                <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-[11px] mt-1 text-dim">
                <span>{current} arquivos</span>
                <span>Meta: {goal}</span>
            </div>
        </div>
    );
}

// --- Sub-component: Designer Card ---
function DesignerCard({ member, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [driveUrl, setDriveUrl] = useState(member.drive_folder_url || "");
    const [goal, setGoal] = useState(member.monthly_goal || 30);
    const [counting, setCounting] = useState(false);
    const [liveCount, setLiveCount] = useState(null);
    const [countError, setCountError] = useState(null);

    const currentMonth = new Date().toISOString().slice(0, 7); // "2026-03"
    const thisMonthRecord = (member.production_records || []).find(r => r.month_year === currentMonth);
    const fileCount = liveCount ?? (thisMonthRecord?.file_count ?? 0);

    const handleSaveSettings = async () => {
        try {
            await dataService.team.update(member.id, {
                drive_folder_url: driveUrl,
                monthly_goal: goal
            });
            setIsEditing(false);
            onUpdate();
        } catch (e) {
            alert("Erro ao salvar configurações.");
        }
    };

    const handleCountNow = async () => {
        setCountError(null);
        setCounting(true);
        setLiveCount(null);
        const folderId = googleDriveService.extractFolderId(member.drive_folder_url);
        if (!folderId) {
            setCountError("Link do Drive inválido ou não configurado.");
            setCounting(false);
            return;
        }
        try {
            const count = await googleDriveService.getFileCount(folderId);
            setLiveCount(count);
            // Save to production_records
            await dataService.productionRecords.upsert({
                team_member_id: member.id,
                file_count: count,
                month_year: currentMonth,
                recorded_at: new Date().toISOString()
            });
            onUpdate();
        } catch (e) {
            setCountError(`Erro: ${e.message}`);
        } finally {
            setCounting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 hover:border-avaloon-orange/30 transition-all"
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <div
                    className="size-12 rounded-full bg-cover bg-center ring-2 ring-[#1a1a1a] flex-shrink-0"
                    style={{ backgroundImage: `url(${member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`})` }}
                />
                <div className="flex-1 min-w-0">
                    <h3 className="text-main font-bold text-base leading-tight truncate">{member.name}</h3>
                    <p className="text-avaloon-orange text-xs font-medium">{member.role}</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1.5 rounded-lg text-dim hover:text-main hover:bg-main/10 transition-colors"
                    title="Configurar"
                >
                    {isEditing ? <X className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                </button>
            </div>

            {/* Edit Panel */}
            {isEditing && (
                <div className="bg-background rounded-xl p-4 space-y-3 border border-border">
                    <div>
                        <label className="text-[11px] uppercase font-bold text-muted mb-1 block">Pasta do Google Drive</label>
                        <input
                            type="url"
                            value={driveUrl}
                            onChange={e => setDriveUrl(e.target.value)}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-main focus:border-avaloon-orange outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] uppercase font-bold text-muted mb-1 block">Meta Mensal (arquivos)</label>
                        <input
                            type="number"
                            min={1}
                            value={goal}
                            onChange={e => setGoal(parseInt(e.target.value) || 30)}
                            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-main focus:border-avaloon-orange outline-none"
                        />
                    </div>
                    <ButtonAvaloon variant="primary" className="w-full justify-center" onClick={handleSaveSettings}>
                        <Save className="w-3.5 h-3.5 mr-1" /> Salvar
                    </ButtonAvaloon>
                </div>
            )}

            {/* KPI Block */}
            {!isEditing && (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background rounded-xl p-3 border border-border text-center">
                            <p className="text-[11px] text-muted uppercase font-bold mb-1">Arquivos ({currentMonth})</p>
                            <p className="text-3xl font-black text-main">{fileCount}</p>
                        </div>
                        <div className="bg-background rounded-xl p-3 border border-border text-center">
                            <p className="text-[11px] text-muted uppercase font-bold mb-1">Meta</p>
                            <p className="text-3xl font-black text-avaloon-orange">{member.monthly_goal || 30}</p>
                        </div>
                    </div>

                    <KpiBar current={fileCount} goal={member.monthly_goal || 30} />

                    {/* Error */}
                    {countError && (
                        <div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{countError}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        <ButtonAvaloon
                            variant="secondary"
                            className="flex-1 justify-center"
                            onClick={handleCountNow}
                            disabled={counting || !member.drive_folder_url}
                            title={!member.drive_folder_url ? "Configure o link do Drive primeiro" : ""}
                        >
                            {counting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            <span className="ml-1.5">{counting ? "Contando..." : "Atualizar"}</span>
                        </ButtonAvaloon>
                        {member.drive_folder_url && (
                            <a
                                href={member.drive_folder_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-lg bg-[#1f1f1f] text-muted hover:text-main hover:bg-[#2f2f55] transition-colors border border-border"
                                title="Abrir pasta no Drive"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>

                    {/* Monthly History */}
                    {(member.production_records || []).length > 0 && (
                        <div>
                            <p className="text-[11px] uppercase font-bold text-dim mb-2 flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" /> Histórico Mensal
                            </p>
                            <div className="flex gap-1.5 overflow-x-auto pb-1">
                                {[...member.production_records]
                                    .sort((a, b) => a.month_year.localeCompare(b.month_year))
                                    .slice(-6)
                                    .map(rec => (
                                        <div key={rec.id} className="flex-shrink-0 text-center bg-background rounded-lg px-2 py-1.5 border border-border min-w-[52px]">
                                            <p className="text-[10px] text-dim">{rec.month_year.slice(5)}/{rec.month_year.slice(2, 4)}</p>
                                            <p className="text-sm font-bold text-main">{rec.file_count}</p>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}

// --- Main Page ---
export default function DesignProductivity() {
    const [designers, setDesigners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadDesigners = async () => {
        try {
            setIsLoading(true);
            const all = await dataService.team.getAll();
            // Filter to design roles and load their production records
            const designRoles = ["Designer", "Design", "Motion", "Social Media", "Criativo", "Arte"];
            const filtered = all.filter(m =>
                designRoles.some(r => (m.role || "").toLowerCase().includes(r.toLowerCase()))
            );
            // Load production records for each
            const withRecords = await Promise.all(filtered.map(async m => {
                try {
                    const records = await dataService.productionRecords.getByMember(m.id);
                    return { ...m, production_records: records || [] };
                } catch {
                    return { ...m, production_records: [] };
                }
            }));
            setDesigners(withRecords);
        } catch (e) {
            console.error("Erro ao carregar designers:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDesigners();
    }, []);

    const totalThisMonth = designers.reduce((sum, m) => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const rec = (m.production_records || []).find(r => r.month_year === currentMonth);
        return sum + (rec?.file_count ?? 0);
    }, 0);

    const totalGoal = designers.reduce((sum, m) => sum + (m.monthly_goal || 30), 0);

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-main flex items-center gap-3">
                        <Palette className="w-8 h-8 text-avaloon-orange" />
                        Produtividade Design
                    </h1>
                    <p className="text-muted mt-1">Controle de arquivos e KPIs mensais por designer via Google Drive.</p>
                </div>
            </div>

            {/* Summary KPI Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-muted text-sm">Total Produzido (Mês)</p>
                    <p className="text-4xl font-black text-main mt-1">{totalThisMonth}</p>
                    <p className="text-xs text-dim mt-1">arquivos entregues</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-muted text-sm">Meta Coletiva (Mês)</p>
                    <p className="text-4xl font-black text-avaloon-orange mt-1">{totalGoal}</p>
                    <p className="text-xs text-dim mt-1">soma das metas individuais</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-muted text-sm">Desempenho Geral</p>
                    <p className={`text-4xl font-black mt-1 ${totalGoal > 0 && Math.round((totalThisMonth / totalGoal) * 100) >= 80 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalGoal > 0 ? Math.round((totalThisMonth / totalGoal) * 100) : 0}%
                    </p>
                    <p className="text-xs text-dim mt-1">da meta coletiva atingida</p>
                </div>
            </div>

            {/* Designers Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-dim">
                    <Loader2 className="w-8 h-8 animate-spin mr-3" />
                    <span>Carregando designers...</span>
                </div>
            ) : designers.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-2xl text-dim">
                    <Palette className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-bold text-muted">Nenhum designer encontrado.</p>
                    <p className="text-sm mt-1">Adicione membros com a função "Designer" na página de Equipe.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {designers.map(m => (
                        <DesignerCard key={m.id} member={m} onUpdate={loadDesigners} />
                    ))}
                </div>
            )}
        </div>
    );
}
