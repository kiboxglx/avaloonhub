
import { useState, useEffect } from "react";
import { dataService } from "@/services/dataService";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import {
    Plus, Search, LayoutGrid, List, SlidersHorizontal, MapPin,
    ChevronDown, Folder, Star, X, ExternalLink, Save, HardDrive,
    Instagram, Facebook, Linkedin, Youtube, Twitter, Globe, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper for status badges
const StatusBadge = ({ status }) => {
    if (status === "Ativo") {
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">Ativo</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">{status}</span>
        </div>
    );
};

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null);
    const [editingDriveLink, setEditingDriveLink] = useState("");

    // Load Clients from Supabase
    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setIsLoading(true);
            const data = await dataService.clients.getAll();
            setClients(data || []);
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
            // Fallback or alert could be added here
        } finally {
            setIsLoading(false);
        }
    };

    const handleClientClick = (client) => {
        setSelectedClient(client);
        setEditingDriveLink(client.drive_link || ""); // Note: database uses snake_case
    };

    const handleSaveLink = () => {
        if (!selectedClient) return;
        // Ideally save to DB here too
        const updatedClients = clients.map(c =>
            c.id === selectedClient.id ? { ...c, drive_link: editingDriveLink } : c
        );
        setClients(updatedClients);
        // Also update selected client in place to reflect changes in overlay
        setSelectedClient({ ...selectedClient, drive_link: editingDriveLink });
    };

    return (
        <div className="flex flex-col w-full h-full relative">
            {/* Header Section (Matching TeamDirectory) */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl md:text-4xl font-black tracking-tight">Meus Clientes</h1>
                    <p className="text-[#9595c6] text-base max-w-2xl">
                        Gerencie relacionamentos, arquivos e credenciais de redes sociais.
                    </p>
                </div>
                <div className="flex gap-3">
                    <ButtonAvaloon variant="primary">
                        <Plus className="w-5 h-5" /> Adicionar Cliente
                    </ButtonAvaloon>
                </div>
            </div>

            {/* Controls Toolbar */}
            <div className="sticky top-20 z-30 bg-[#111121]/80 backdrop-blur-md rounded-xl border border-[#2d2d42] p-2 mb-8 shadow-xl">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-[#9595c6]" />
                        </div>
                        <input
                            className="block w-full rounded-lg border-0 py-2.5 pl-10 bg-[#1e1e2d] text-white placeholder:text-[#9595c6] focus:ring-2 focus:ring-avaloon-orange sm:text-sm sm:leading-6"
                            placeholder="Buscar cliente, setor ou status..."
                            type="text"
                        />
                    </div>
                </div>
            </div>

            {/* Masonry Grid */}
            <div className="masonry-grid columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-20">
                {clients.map((client) => {
                    // Determine logo - user avatar API or random placeholder if missing
                    const logoUrl = client.logo_url || `https://ui-avatars.com/api/?name=${client.name}&background=random&color=fff`;

                    return (
                        <motion.div
                            key={client.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid mb-6"
                        >
                            <div className="bg-[#1e1e2d] border border-[#2d2d42] rounded-xl p-5 hover:border-avaloon-orange/40 hover:shadow-lg hover:shadow-avaloon-orange/5 transition-all group relative overflow-hidden flex flex-col h-full">

                                {/* Status Badge */}
                                <div className="absolute top-0 right-0 p-3">
                                    <StatusBadge status={client.status} />
                                </div>

                                {/* Header Info */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="relative">
                                        <div
                                            className="size-16 rounded-xl bg-cover bg-center ring-2 ring-[#2d2d42] group-hover:ring-avaloon-orange/40 transition-all"
                                            style={{ backgroundImage: `url("${logoUrl}")` }}
                                        ></div>
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="text-white font-bold text-lg leading-tight line-clamp-1">{client.name}</h3>
                                        <p className="text-avaloon-orange text-sm font-medium">{client.tier}</p>
                                        <div className="flex items-center gap-1 mt-1 text-[#9595c6] text-xs">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span>{client.sector}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Body */}
                                <div className="space-y-3 flex-1">
                                    {/* Stats Row */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-[#252546] p-2 rounded-lg border border-white/5">
                                            <span className="block text-[#9595c6]">Artes (Mês)</span>
                                            <span className="block text-white font-bold text-lg">{client.filesCount || 0}</span>
                                        </div>
                                        <div className="bg-[#252546] p-2 rounded-lg border border-white/5">
                                            <span className="block text-[#9595c6]">Valor</span>
                                            <span className="block text-white font-bold text-lg">
                                                {/* Format currency if numeric */}
                                                {typeof client.monthly_value === 'number'
                                                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthly_value)
                                                    : (client.value?.split(' ')[1] || '-')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Social Icons Strip */}
                                    <div className="pt-3 border-t border-[#2d2d42]">
                                        <p className="text-[11px] uppercase tracking-wider text-[#9595c6] font-bold mb-2">Redes Conectadas</p>
                                        <div className="flex gap-2">
                                            {(client.social_accounts || []).length > 0 ? (
                                                (client.social_accounts || []).map((acc, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-full bg-[#252546] flex items-center justify-center text-white border border-white/5" title={acc.platform}>
                                                        {acc.platform === 'Instagram' ? <Instagram className="w-4 h-4" /> :
                                                            acc.platform === 'Facebook' ? <Facebook className="w-4 h-4" /> :
                                                                acc.platform === 'LinkedIn' ? <Linkedin className="w-4 h-4" /> :
                                                                    acc.platform === 'YouTube' ? <Youtube className="w-4 h-4" /> :
                                                                        <Globe className="w-4 h-4" />}
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-500 italic">Nenhuma rede vinculada</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="mt-4 pt-4 border-t border-[#2d2d42] flex justify-between items-center bg-[#1e1e2d] -mx-5 -mb-5 p-5">
                                    <span className="text-xs text-[#9595c6] flex items-center gap-1">
                                        <Folder className="w-3 h-3" />
                                        {client.drive_link ? 'Pasta Vinculada' : 'Sem Detalhes'}
                                    </span>
                                    <button
                                        onClick={() => handleClientClick(client)}
                                        className="text-xs font-bold text-white bg-[#252546] hover:bg-avaloon-orange hover:text-white px-3 py-1.5 rounded transition-colors"
                                    >
                                        Gerenciar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Client Overlay (Preserved functionality) */}
            <AnimatePresence>
                {selectedClient && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedClient(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#111121] border-l border-[#2d2d42] z-50 shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-[#2d2d42] flex justify-between items-center bg-[#1e1e2d]">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2>
                                    <p className="text-slate-400 text-sm">{selectedClient.sector}</p>
                                </div>
                                <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                                {/* Drive Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <HardDrive className="w-5 h-5 text-avaloon-orange" />
                                            Pasta do Google Drive
                                        </h3>
                                        {selectedClient.drive_link && (
                                            <a
                                                href={selectedClient.drive_link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs flex items-center gap-1 text-avaloon-orange hover:underline"
                                            >
                                                Abrir externamente <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="bg-[#1e1e2d] border border-[#2d2d42] rounded-xl p-1">
                                        <div className="p-3 border-b border-[#2d2d42] flex flex-col gap-3">
                                            {/* Drive Link Input */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editingDriveLink}
                                                    onChange={(e) => setEditingDriveLink(e.target.value)}
                                                    placeholder="Cole o link da pasta do Google Drive..."
                                                    className="flex-1 bg-[#111121] border border-[#2d2d42] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-avaloon-orange transition-colors"
                                                />
                                            </div>

                                            {/* File Count Input (KPI) */}
                                            <div className="flex items-center justify-between bg-[#111121] rounded p-2 border border-[#2d2d42]">
                                                <span className="text-sm text-slate-400 font-medium pl-1">Artes Entregues (Mês):</span>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={selectedClient.filesCount || 0}
                                                        onChange={(e) => {
                                                            const count = parseInt(e.target.value) || 0;
                                                            setSelectedClient({ ...selectedClient, filesCount: count });
                                                            setClients(clients.map(c => c.id === selectedClient.id ? { ...c, filesCount: count } : c));
                                                        }}
                                                        className="w-20 bg-[#1e1e2d] border border-[#2d2d42] rounded px-2 py-1 text-right text-white font-bold focus:outline-none focus:border-avaloon-orange"
                                                    />
                                                    <ButtonAvaloon onClick={handleSaveLink} variant="outline" className="h-[30px] px-2">
                                                        <Save className="w-3 h-3" />
                                                    </ButtonAvaloon>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="aspect-video w-full bg-[#111121] flex items-center justify-center relative overflow-hidden">
                                            {selectedClient.drive_link ? (
                                                <iframe
                                                    src={selectedClient.drive_link}
                                                    className="w-full h-full border-none"
                                                    title="Client Drive"
                                                />
                                            ) : (
                                                <div className="text-center text-slate-500">
                                                    <Folder className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                                    <p className="text-sm">Nenhuma pasta vinculada a este cliente.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Social Media Vault Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Users className="w-5 h-5 text-avaloon-orange" />
                                            Credenciais & Redes Sociais
                                        </h3>
                                        <ButtonAvaloon
                                            variant="outline"
                                            className="h-8 text-xs"
                                            onClick={() => {
                                                const newAccount = { id: Date.now(), platform: 'Instagram', username: '', password: '' };
                                                const updatedAccounts = [...(selectedClient.social_accounts || []), newAccount];
                                                setSelectedClient({ ...selectedClient, social_accounts: updatedAccounts });
                                                // Note: Updating remote DB for social accounts is skipped for brevity here, mirroring local update only
                                                setClients(clients.map(c => c.id === selectedClient.id ? { ...c, social_accounts: updatedAccounts } : c));
                                            }}
                                        >
                                            <Plus className="w-3 h-3" /> Adicionar Conta
                                        </ButtonAvaloon>
                                    </div>

                                    <div className="space-y-3">
                                        {(selectedClient.social_accounts || []).length === 0 && (
                                            <div className="text-center p-4 border border-dashed border-[#2d2d42] rounded-lg text-slate-500 text-sm">
                                                Nenhuma conta vinculada.
                                            </div>
                                        )}

                                        {(selectedClient.social_accounts || []).map((account, index) => (
                                            <div key={account.id} className="bg-[#1e1e2d] border border-[#2d2d42] rounded-lg p-3 relative group">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                                                    <div>
                                                        <label className="text-[10px] uppercase text-slate-500 font-bold">Plataforma</label>
                                                        <select
                                                            className="w-full bg-[#111121] border border-[#2d2d42] rounded px-2 py-1 text-sm text-white focus:border-avaloon-orange outline-none"
                                                            value={account.platform}
                                                            onChange={(e) => {
                                                                const updated = selectedClient.social_accounts.map(a => a.id === account.id ? { ...a, platform: e.target.value } : a);
                                                                setSelectedClient({ ...selectedClient, social_accounts: updated });
                                                                setClients(clients.map(c => c.id === selectedClient.id ? { ...c, social_accounts: updated } : c));
                                                            }}
                                                        >
                                                            <option>Instagram</option>
                                                            <option>TikTok</option>
                                                            <option>LinkedIn</option>
                                                            <option>Facebook</option>
                                                            <option>YouTube</option>
                                                            <option>Outro</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] uppercase text-slate-500 font-bold">Usuário / Email</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-[#111121] border border-[#2d2d42] rounded px-2 py-1 text-sm text-white focus:border-avaloon-orange outline-none"
                                                            value={account.username}
                                                            onChange={(e) => {
                                                                const updated = selectedClient.social_accounts.map(a => a.id === account.id ? { ...a, username: e.target.value } : a);
                                                                setSelectedClient({ ...selectedClient, social_accounts: updated });
                                                                setClients(clients.map(c => c.id === selectedClient.id ? { ...c, social_accounts: updated } : c));
                                                            }}
                                                            placeholder="@usuario"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase text-slate-500 font-bold">Senha</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-[#111121] border border-[#2d2d42] rounded px-2 py-1 text-sm text-white focus:border-avaloon-orange outline-none font-mono"
                                                        value={account.password}
                                                        onChange={(e) => {
                                                            const updated = selectedClient.social_accounts.map(a => a.id === account.id ? { ...a, password: e.target.value } : a);
                                                            setSelectedClient({ ...selectedClient, social_accounts: updated });
                                                            setClients(clients.map(c => c.id === selectedClient.id ? { ...c, social_accounts: updated } : c));
                                                        }}
                                                        placeholder="Senha..."
                                                    />
                                                </div>
                                                <button
                                                    className="absolute top-2 right-2 p-1 text-slate-600 hover:text-red-500 transition-colors"
                                                    onClick={() => {
                                                        const updated = selectedClient.social_accounts.filter(a => a.id !== account.id);
                                                        setSelectedClient({ ...selectedClient, social_accounts: updated });
                                                        setClients(clients.map(c => c.id === selectedClient.id ? { ...c, social_accounts: updated } : c));
                                                    }}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
