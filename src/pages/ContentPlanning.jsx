import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal, Calendar, Instagram, Facebook, Linkedin, Youtube, ExternalLink, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { dataService } from "@/services/dataService";
import { DemandForm } from "@/components/forms/DemandForm";

const COLUMNS = [
    { id: "IDEA", title: "Ideias", color: "bg-slate-500/10 border-slate-500/20 text-slate-400" },
    { id: "DESIGN", title: "Em Criação", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
    { id: "APPROVAL", title: "Aprovação", color: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
    { id: "SCHEDULED", title: "Agendado", color: "bg-green-500/10 border-green-500/20 text-green-400" },
];

export default function ContentPlanning() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDemandForm, setShowDemandForm] = useState(false);

    const loadPosts = async () => {
        setIsLoading(true);
        try {
            const data = await dataService.demands.getAll();
            // Filter for content type demands (either explicit type or inferred)
            const contentDemands = data.filter(d =>
                d.type === 'CONTENT' ||
                (d.services?.name && (d.services.name.toLowerCase().includes('social') || d.services.name.toLowerCase().includes('post') || d.services.name.toLowerCase().includes('reels')))
            );

            const mappedPosts = contentDemands.map(d => {
                const date = new Date(d.scheduled_at);
                const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

                return {
                    id: d.id,
                    title: d.title,
                    client: d.clients?.name || 'Cliente',
                    platform: d.briefing_data?.platform || 'Instagram',
                    status: d.status, // Assuming DB has IDEA, DESIGN, etc. or we map TODO->IDEA
                    date: formattedDate
                };
            });
            setPosts(mappedPosts);
        } catch (error) {
            console.error("Error loading posts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const movePost = async (postId, newStatus) => {
        // Optimistic update
        setPosts(posts.map(p => p.id === postId ? { ...p, status: newStatus } : p));

        try {
            await dataService.demands.updateStatus(postId, newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
            loadPosts(); // Revert on error
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Planejamento de Conteúdo
                    </h2>
                    <p className="text-slate-400">Gerencie posts, stories e vídeos para redes sociais.</p>
                </div>
                <ButtonAvaloon variant="primary" onClick={() => setShowDemandForm(true)}>
                    <Plus className="w-4 h-4" /> Novo Post
                </ButtonAvaloon>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-avaloon-orange" />
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-6 h-full min-h-[500px]">
                    {COLUMNS.map(col => (
                        <div key={col.id} className="min-w-[280px] w-full flex-1 flex flex-col">
                            <div className={cn("flex items-center justify-between p-3 rounded-t-xl mb-2 backdrop-blur-md border", col.color)}>
                                <h3 className="font-bold text-sm uppercase tracking-wider">{col.title}</h3>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 opacity-70">
                                    {posts.filter(p => p.status === col.id).length}
                                </span>
                            </div>

                            <div className="flex-1 space-y-3 p-1">
                                <AnimatePresence mode="popLayout">
                                    {posts.filter(p => p.status === col.id).map(post => (
                                        <motion.div
                                            layoutId={post.id}
                                            key={post.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-[#1e1e2d] border border-[#2d2d42] p-4 rounded-xl shadow-lg hover:shadow-avaloon-orange/10 transition-shadow group relative"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex gap-2">
                                                    <div className={`p-1.5 rounded-full ${post.platform === 'Instagram' ? 'bg-pink-500/20 text-pink-500' :
                                                        post.platform === 'LinkedIn' ? 'bg-blue-600/20 text-blue-500' :
                                                            'bg-slate-500/20 text-white'
                                                        }`}>
                                                        {post.platform === 'Instagram' ? <Instagram className="w-3 h-3" /> :
                                                            post.platform === 'LinkedIn' ? <Linkedin className="w-3 h-3" /> :
                                                                <ExternalLink className="w-3 h-3" />}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase self-center">{post.platform}</span>
                                                </div>
                                                <button className="text-slate-500 hover:text-white transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <h4 className="font-bold text-white mb-1 line-clamp-2">{post.title}</h4>
                                            <p className="text-xs text-[#9595c6] mb-3">{post.client}</p>

                                            <div className="flex items-center justify-between pt-3 border-t border-[#2d2d42]">
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {post.date}
                                                </span>

                                                {/* Simplified Move Controls */}
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {col.id !== 'IDEA' && (
                                                        <button onClick={() => movePost(post.id, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) - 1].id)} className="p-1 hover:bg-white/10 rounded">
                                                            <ArrowRight className="w-3 h-3 rotate-180 text-slate-400 hover:text-white" />
                                                        </button>
                                                    )}
                                                    {col.id !== 'SCHEDULED' && (
                                                        <button onClick={() => movePost(post.id, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) + 1].id)} className="p-1 hover:bg-white/10 rounded">
                                                            <ArrowRight className="w-3 h-3 text-slate-400 hover:text-white" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <button
                                    onClick={() => setShowDemandForm(true)}
                                    className="w-full py-2 rounded-lg border border-dashed border-[#2d2d42] text-[#9595c6] text-xs font-medium hover:border-avaloon-orange/50 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-3 h-3" /> Adicionar Ideia
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Demand Form Modal */}
            <AnimatePresence>
                {showDemandForm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDemandForm(false)}
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
                                type="CONTENT"
                                onClose={() => setShowDemandForm(false)}
                                onSuccess={() => {
                                    loadPosts();
                                    setShowDemandForm(false);
                                }}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
