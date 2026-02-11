import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal, Calendar, Instagram, Facebook, Linkedin, Youtube, ExternalLink, ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";

const INITIAL_POSTS = [
    { id: "1", title: "Carrossel Dicas SEO", client: "Alpha Business", platform: "Instagram", status: "DESIGN", date: "20 Ago" },
    { id: "2", title: "Reels Bastidores", client: "Beta Solutions", platform: "TikTok", status: "IDEA", date: "22 Ago" },
    { id: "3", title: "Post Institucional", client: "Gamma Retail", platform: "LinkedIn", status: "APPROVAL", date: "25 Ago" },
    { id: "4", title: "Story Enquete", client: "Alpha Business", platform: "Instagram", status: "SCHEDULED", date: "18 Ago" },
];

const COLUMNS = [
    { id: "IDEA", title: "Ideias", color: "bg-slate-500/10 border-slate-500/20 text-slate-400" },
    { id: "DESIGN", title: "Em Criação", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
    { id: "APPROVAL", title: "Aprovação", color: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
    { id: "SCHEDULED", title: "Agendado", color: "bg-green-500/10 border-green-500/20 text-green-400" },
];

export default function ContentPlanning() {
    const [posts, setPosts] = useState(INITIAL_POSTS);

    const movePost = (postId, newStatus) => {
        setPosts(posts.map(p => p.id === postId ? { ...p, status: newStatus } : p));
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Planejamento de Conteúdo
                    </h2>
                    <p className="text-slate-400">Gerencie posts, stories e vídeos para redes sociais.</p>
                </div>
                <ButtonAvaloon variant="primary">
                    <Plus className="w-4 h-4" /> Novo Post
                </ButtonAvaloon>
            </div>

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
                            <button className="w-full py-2 rounded-lg border border-dashed border-[#2d2d42] text-[#9595c6] text-xs font-medium hover:border-avaloon-orange/50 hover:text-white transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-3 h-3" /> Adicionar Ideia
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
