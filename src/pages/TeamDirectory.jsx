import { useState } from "react";
import {
    Bell, Settings, ChevronRight, Download, Plus, Search,
    LayoutGrid, List, SlidersHorizontal, MapPin, ChevronDown,
    Video, Aperture, Home, Plane, Clock, Mic, Headphones,
    Lightbulb, Monitor, HardDrive, Hammer, Film, Wand2
} from "lucide-react";
import { motion } from "framer-motion";

const TEAM_MEMBERS = [
    {
        id: 1,
        name: "Sarah Jenkins",
        role: "Lead Videographer",
        location: "Studio A, London",
        status: "On-Set",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
        specialties: ["Steadicam", "4K Cinema", "Directing"],
        kit: [
            { icon: Video, name: "Sony FX6 Cinema Line" },
            { icon: Aperture, name: "GM 24-70mm f/2.8" }
        ],
        lastActive: "Just now"
    },
    {
        id: 2,
        name: "Davide Russo",
        role: "Drone Operator",
        location: "Remote / On-Call",
        status: "Available",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
        specialties: ["Aerial Photog", "FPV Racing"],
        kit: [
            { icon: Plane, name: "DJI Mavic 3 Cine" }
        ],
        lastActive: "2h ago"
    },
    {
        id: 3,
        name: "Elena Rodriguez",
        role: "Sound Engineer",
        location: "Returns Monday",
        status: "Offline",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150",
        specialties: ["Field Recording", "Post-Prod"],
        kit: [
            { icon: Mic, name: "Zoom F8n Pro" },
            { icon: Headphones, name: "Sennheiser MKH 416" }
        ],
        lastActive: "2d ago"
    },
    {
        id: 4,
        name: "Marcus Chen",
        role: "Lighting Director",
        location: "Downtown Set B",
        status: "On-Set",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
        specialties: ["Gaffer", "DMX Control"],
        kit: [
            { icon: Lightbulb, name: "Aputure 600d Pro" }
        ],
        lastActive: "5m ago"
    },
    {
        id: 5,
        name: "Jessica Lee",
        role: "Editor / Colorist",
        location: "Home Studio",
        status: "Available",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150",
        specialties: ["DaVinci Resolve", "VFX", "Motion Graphics"],
        kit: [
            { icon: Monitor, name: "Mac Studio M2 Ultra" }
        ],
        lastActive: "10m ago"
    },
    {
        id: 6,
        name: "Alex Thompson",
        role: "Grip",
        location: "Exterior Location D",
        status: "On-Set",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150",
        specialties: ["Dolly Ops", "Rigging"],
        kit: [
            { icon: Hammer, name: "Standard Grip Truck" }
        ],
        lastActive: "4h ago"
    }
];

const StatusBadge = ({ status }) => {
    if (status === "On-Set") {
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">On-Set</span>
            </div>
        );
    }
    if (status === "Available") {
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">Available</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-500/10 border border-gray-500/20">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Offline</span>
        </div>
    );
};

export default function TeamDirectory() {
    return (
        <div className="flex flex-col w-full h-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[#9595c6] text-sm font-medium mb-1">
                        <span>Home</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white">Team Directory</span>
                    </div>
                    <h1 className="text-white text-3xl md:text-4xl font-black tracking-tight">Team Directory</h1>
                    <p className="text-[#9595c6] text-base max-w-2xl">
                        Manage personnel, monitor status, and track equipment logistics across all media productions.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex h-10 items-center gap-2 px-4 rounded-lg bg-[#252546] text-white text-sm font-bold hover:bg-[#2f2f55] transition-colors border border-transparent hover:border-avaloon-orange/50">
                        <Download className="w-5 h-5" />
                        <span>Export</span>
                    </button>
                    <button className="flex h-10 items-center gap-2 px-4 rounded-lg bg-avaloon-orange text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:opacity-90 transition-all hover:scale-[1.02]">
                        <Plus className="w-5 h-5" />
                        <span>Add Member</span>
                    </button>
                </div>
            </div>

            {/* Controls Toolbar */}
            <div className="sticky top-20 z-40 bg-[#111121]/80 backdrop-blur-md rounded-xl border border-[#2d2d42] p-2 mb-8 shadow-xl">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full lg:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-[#9595c6]" />
                        </div>
                        <input
                            className="block w-full rounded-lg border-0 py-2.5 pl-10 bg-[#1e1e2d] text-white placeholder:text-[#9595c6] focus:ring-2 focus:ring-avaloon-orange sm:text-sm sm:leading-6"
                            placeholder="Search by name, gear, or location..."
                            type="text"
                        />
                    </div>

                    {/* Filters & View Toggle */}
                    <div className="flex w-full lg:w-auto items-center gap-3 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
                        {/* View Toggle */}
                        <div className="flex bg-[#1e1e2d] rounded-lg p-1 border border-[#2d2d42] shrink-0">
                            <button className="p-1.5 rounded-md bg-avaloon-orange/20 text-avaloon-orange shadow-sm hover:bg-avaloon-orange/30 transition-colors">
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button className="p-1.5 rounded-md text-[#9595c6] hover:text-white hover:bg-[#252546] transition-colors">
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="h-8 w-[1px] bg-[#2d2d42] mx-1 shrink-0"></div>

                        {/* Filter Chips */}
                        <div className="flex gap-2 shrink-0">
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#252546] border border-[#2d2d42] text-sm font-medium text-white hover:border-avaloon-orange/50 hover:bg-[#2f2f55] transition-all group">
                                <Plane className="w-4 h-4 text-[#9595c6] group-hover:text-avaloon-orange" />
                                Drone Pilot
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#252546] border border-[#2d2d42] text-sm font-medium text-white hover:border-avaloon-orange/50 hover:bg-[#2f2f55] transition-all group">
                                <Film className="w-4 h-4 text-[#9595c6] group-hover:text-avaloon-orange" />
                                4K Camera
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#252546] border border-[#2d2d42] text-sm font-medium text-white hover:border-avaloon-orange/50 hover:bg-[#2f2f55] transition-all group">
                                <Wand2 className="w-4 h-4 text-[#9595c6] group-hover:text-avaloon-orange" />
                                Color Grading
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-transparent border border-dashed border-[#9595c6] text-sm font-medium text-[#9595c6] hover:text-white hover:border-white transition-all">
                                <SlidersHorizontal className="w-4 h-4" />
                                More Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid View (Masonry) */}
            <div className="masonry-grid columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {TEAM_MEMBERS.map((member) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="break-inside-avoid mb-6"
                    >
                        <div className="bg-[#1e1e2d] border border-[#2d2d42] rounded-xl p-5 hover:border-avaloon-orange/40 hover:shadow-lg hover:shadow-avaloon-orange/5 transition-all group relative overflow-hidden">

                            {/* Status Badge Positioned Top Right */}
                            <div className="absolute top-0 right-0 p-3">
                                <StatusBadge status={member.status} />
                            </div>

                            {/* Header Info */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="relative">
                                    <div
                                        className={`size-16 rounded-full bg-cover bg-center ring-2 ring-[#2d2d42] group-hover:ring-avaloon-orange/40 transition-all ${member.status === 'Offline' ? 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100' : ''}`}
                                        style={{ backgroundImage: `url("${member.avatar}")` }}
                                    ></div>
                                </div>
                                <div className="pt-1">
                                    <h3 className="text-white font-bold text-lg leading-tight">{member.name}</h3>
                                    <p className="text-avaloon-orange text-sm font-medium">{member.role}</p>
                                    <div className="flex items-center gap-1 mt-1 text-[#9595c6] text-xs">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{member.location}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-[#9595c6] font-bold mb-2">Specialties</p>
                                    <div className="flex flex-wrap gap-2">
                                        {member.specialties.map((spec) => (
                                            <span key={spec} className="px-2 py-1 rounded-md bg-[#252546] text-xs text-white border border-white/5">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-[#2d2d42]">
                                    <div className="flex items-center justify-between group/gear cursor-pointer">
                                        <p className="text-[11px] uppercase tracking-wider text-[#9595c6] font-bold">Current Kit</p>
                                        <ChevronDown className="w-4 h-4 text-[#9595c6] group-hover/gear:text-white transition-colors" />
                                    </div>
                                    <div className="mt-2 text-sm text-gray-400">
                                        {member.kit.map((k, i) => (
                                            <div key={i} className="flex items-center gap-2 mb-1">
                                                <k.icon className="w-4 h-4 text-avaloon-orange" />
                                                <span>{k.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-4 pt-4 border-t border-[#2d2d42] flex justify-between items-center">
                                <span className="text-xs text-[#9595c6]">Last active: {member.lastActive}</span>
                                <button className="text-xs font-bold text-white bg-[#252546] hover:bg-avaloon-orange hover:text-white px-3 py-1.5 rounded transition-colors">
                                    View Profile
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
