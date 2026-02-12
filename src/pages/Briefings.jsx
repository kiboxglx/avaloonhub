import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/ui/KanbanBoard";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { Plus, LayoutTemplate, ListFilter, Folder, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DemandForm } from "@/components/forms/DemandForm";
import { dataService } from "@/services/dataService";

export default function Briefings() {
    const [view, setView] = useState('board');
    const [driveLink, setDriveLink] = useState('');
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [showNewDemandForm, setShowNewDemandForm] = useState(false);
    const [demands, setDemands] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const savedLink = localStorage.getItem('avaloon_drive_folder');
        if (savedLink) setDriveLink(savedLink);
        loadDemands();
    }, []);

    const loadDemands = async () => {
        setIsLoading(true);
        try {
            const data = await dataService.demands.getAll();
            setDemands(data || []);
        } catch (error) {
            console.error("Failed to load demands", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDrive = () => {
        localStorage.setItem('avaloon_drive_folder', driveLink);
        setIsConfiguring(false);
    };

    return (
        <div className="h-full flex flex-col space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Pipeline de Produção
                    </h2>
                    <p className="text-slate-400">Gerencie o fluxo de trabalho e arquivos.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-[#1e1e2d] rounded-lg p-1 border border-[#2d2d42]">
                        <button
                            onClick={() => setView('board')}
                            className={`p-2 rounded-md transition-colors ${view === 'board' ? 'bg-avaloon-orange/20 text-avaloon-orange' : 'text-slate-500 hover:text-white'}`}
                            title="Quadro Kanban"
                        >
                            <LayoutTemplate className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-avaloon-orange/20 text-avaloon-orange' : 'text-slate-500 hover:text-white'}`}
                            title="Lista"
                        >
                            <ListFilter className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView('drive')}
                            className={`p-2 rounded-md transition-colors ${view === 'drive' ? 'bg-avaloon-orange/20 text-avaloon-orange' : 'text-slate-500 hover:text-white'}`}
                            title="Arquivos (Google Drive)"
                        >
                            <Folder className="w-5 h-5" />
                        </button>
                    </div>

                    <ButtonAvaloon variant="primary" onClick={() => setShowNewDemandForm(true)}>
                        <Plus className="w-4 h-4" /> Novo Projeto
                    </ButtonAvaloon>
                </div>
            </div>

            <div className="flex-1 overflow-hidden min-h-[600px] flex flex-col">
                {view === 'board' && (
                    <KanbanBoard
                        tasks={demands}
                        onTaskUpdate={loadDemands}
                        onAddDemand={() => setShowNewDemandForm(true)}
                    />
                )}

                {view === 'list' && (
                    <div className="text-center py-20 text-slate-500 border border-dashed border-[#2d2d42] rounded-xl flex-1">
                        Visualização em lista (Em desenvolvimento)
                    </div>
                )}

                {view === 'drive' && (
                    <div className="flex-1 bg-[#1e1e2d] border border-[#2d2d42] rounded-xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-[#2d2d42] flex justify-between items-center bg-[#111121]">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Folder className="w-4 h-4 text-avaloon-orange" />
                                Google Drive do Workspace
                            </h3>
                            <button
                                onClick={() => setIsConfiguring(!isConfiguring)}
                                className="text-xs text-slate-400 hover:text-white underline"
                            >
                                {isConfiguring ? 'Cancelar' : 'Configurar Pasta'}
                            </button>
                        </div>

                        {isConfiguring ? (
                            <div className="p-8 flex flex-col items-center justify-center space-y-4">
                                <p className="text-slate-300">Cole o link da pasta compartilhada do Google Drive:</p>
                                <input
                                    type="text"
                                    value={driveLink}
                                    onChange={(e) => setDriveLink(e.target.value)}
                                    placeholder="https://drive.google.com/drive/folders/..."
                                    className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                                />
                                <ButtonAvaloon onClick={handleSaveDrive} variant="primary">
                                    <Save className="w-4 h-4" /> Salvar Integração
                                </ButtonAvaloon>
                            </div>
                        ) : driveLink ? (
                            <div className="flex-1 relative w-full h-full">
                                <iframe
                                    src={driveLink}
                                    className="w-full h-full border-none"
                                    title="Google Drive"
                                ></iframe>
                                <div className="absolute bottom-4 right-4 bg-black/80 p-2 rounded text-xs text-slate-400 pointer-events-none">
                                    Se não carregar, <a href={driveLink} target="_blank" rel="noreferrer" className="text-avaloon-orange pointer-events-auto hover:underline">abra no navegador</a>.
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                                <Folder className="w-16 h-16 mb-4 opacity-20" />
                                <p>Nenhuma pasta vinculada.</p>
                                <button onClick={() => setIsConfiguring(true)} className="text-avaloon-orange hover:underline mt-2">
                                    Vincular Pasta do Drive
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Demand Form Modal */}
            <AnimatePresence>
                {showNewDemandForm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNewDemandForm(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#111121] border-l border-[#2d2d42] z-50 shadow-2xl"
                        >
                            <DemandForm
                                onClose={() => setShowNewDemandForm(false)}
                                onSuccess={() => {
                                    loadDemands();
                                    setShowNewDemandForm(false);
                                }}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
