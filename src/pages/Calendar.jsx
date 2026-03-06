import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Loader2, X, Clock3, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dataService } from "@/services/dataService";
import { DemandForm } from "@/components/forms/DemandForm";
import { AreaSelector, AREA_CONFIG } from "@/components/ui/AreaSelector";
import { buildGoogleCalendarUrl } from "@/utils/googleCalendar";


const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const ALL_AREAS = ["ALL", "VIDEOMAKER", "ACCOUNTS", "DESIGN", "TRAFFIC", "GENERIC"];

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayEvents, setSelectedDayEvents] = useState(null);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAreaSelector, setShowAreaSelector] = useState(false);
    const [showDemandForm, setShowDemandForm] = useState(false);
    const [selectedArea, setSelectedArea] = useState(null);
    const [filterArea, setFilterArea] = useState("ALL");

    // Extracted to useCallback so it can be called both from useEffect AND from onSuccess callbacks
    const loadEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await dataService.demands.getAll();
            const mapped = data
                .filter(d => d.scheduled_at) // skip demands with no date
                .map(d => {
                    const date = new Date(d.scheduled_at);
                    return {
                        id: d.id,
                        title: d.title,
                        client: d.clients?.name || "Cliente",
                        area: d.area || "GENERIC",
                        type: d.type || "GENERIC",
                        day: date.getDate(),
                        month: date.getMonth(),
                        year: date.getFullYear(),
                        time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                        isoStart: d.scheduled_at,
                        duration: d.briefing_data?.duration_hours || 1,
                        location: d.briefing_data?.location || null,
                        assigneeName: d.assignee?.name || "Sem Responsável",
                        assigneeAvatar: d.assignee?.avatar_url || null,
                        isPending: d.status === 'TODO' && d.briefing_data?.is_accepted === false,
                        createdByName: d.briefing_data?.created_by_name || null,
                    };
                });
            setEvents(mapped);
        } catch (err) {
            console.error("Erro ao carregar eventos:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const visibleEvents = filterArea === "ALL" ? events : events.filter(e => e.area === filterArea);

    const handleAreaSelected = (area) => {
        setSelectedArea(area);
        setShowAreaSelector(false);
        setShowDemandForm(true);
    };

    const getAreaDot = (area) => {
        const cfg = AREA_CONFIG[area] || AREA_CONFIG.GENERIC;
        return cfg.dot;
    };

    return (
        <div className="space-y-6 h-full flex flex-col relative">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Agenda da Agência
                    </h2>
                    <p className="text-muted">Planejamento central de demandas por área.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Month Navigator */}
                    <div className="flex items-center gap-2 bg-card rounded-lg p-1 border border-border">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2 hover:bg-main/10 rounded-md text-muted hover:text-main transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="min-w-[130px] text-center font-bold text-main">
                            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2 hover:bg-main/10 rounded-md text-muted hover:text-main transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <ButtonAvaloon variant="primary" onClick={() => setShowAreaSelector(true)}>
                        <Plus className="w-4 h-4" /> Nova Ação
                    </ButtonAvaloon>
                </div>
            </div>

            {/* Area Filter Legend */}
            <div className="flex flex-wrap gap-2 items-center">
                {ALL_AREAS.map(area => {
                    const cfg = area === "ALL" ? { label: "Todos", textColor: "text-main", dot: "bg-white" } : AREA_CONFIG[area];
                    const isActive = filterArea === area;
                    return (
                        <button
                            key={area}
                            onClick={() => setFilterArea(area)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isActive ? "bg-main/10 border-main/20 text-main" : "bg-card border-border text-muted hover:text-main"}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${cfg?.dot || "bg-white"}`} />
                            {cfg?.label || "Todos"}
                        </button>
                    );
                })}
            </div>

            {/* Calendar Grid */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center bg-[#1a1a1a]/50 border border-border rounded-xl">
                    <Loader2 className="w-10 h-10 animate-spin text-avaloon-orange" />
                </div>
            ) : (
                <div className="flex-1 grid grid-cols-7 gap-px bg-[#1a1a1a] border border-border rounded-xl shadow-2xl overflow-hidden">
                    {/* Weekday headers */}
                    {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map(d => (
                        <div key={d} className="bg-card py-3 text-center text-xs font-bold text-dim tracking-widest">{d}</div>
                    ))}

                    {/* Empty offset cells */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`e-${i}`} className="bg-background/80 min-h-[100px]" />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                        const dayEvents = visibleEvents.filter(e => e.day === day && e.month === currentDate.getMonth() && e.year === currentDate.getFullYear());

                        return (
                            <div
                                key={day}
                                onClick={() => setSelectedDayEvents({ day, events: dayEvents })}
                                className={`bg-card min-h-[100px] p-2 cursor-pointer group hover:bg-[#1f1f1f] transition-colors flex flex-col relative ${isToday ? "ring-1 ring-inset ring-avaloon-orange/60" : ""}`}
                            >
                                {/* Hover Tooltip */}
                                {dayEvents.length > 0 && (
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 bg-background border border-border rounded-xl shadow-2xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 invisible group-hover:visible">
                                        <p className="text-xs font-bold text-main mb-2 pb-1 border-b border-border">{day} de {MONTH_NAMES[currentDate.getMonth()]}</p>
                                        {dayEvents.slice(0, 4).map(e => {
                                            const cfg = AREA_CONFIG[e.area] || AREA_CONFIG.GENERIC;
                                            const gcalLink = buildGoogleCalendarUrl({
                                                title: `[${cfg.label}] ${e.title}`,
                                                startDateIso: e.isoStart,
                                                durationHours: e.duration,
                                                location: e.location
                                            });

                                            return (
                                                <div key={e.id} className="mb-2 p-1.5 rounded-lg bg-background/50 border border-border group/item">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                                                        <div>
                                                            <p className="text-[10px] text-main font-bold truncate">{e.title}</p>
                                                            <p className="text-[9px] text-dim">{e.time} ({e.duration}h) • {cfg.label}</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={gcalLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="pl-3.5 text-[9px] text-blue-400 hover:text-blue-300 transition-colors opacity-0 group-hover/item:opacity-100 flex items-center gap-1"
                                                    >
                                                        <CalendarIcon className="w-2.5 h-2.5" /> Adicionar ao Google
                                                    </a>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Day number */}
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-avaloon-orange text-main" : "text-muted group-hover:text-main"}`}>{day}</span>
                                    {dayEvents.length > 0 && <span className="text-[10px] font-bold text-dim bg-main/5 px-1 rounded">{dayEvents.length}</span>}
                                </div>

                                {/* Event dots/bars */}
                                <div className="space-y-0.5 flex-1">
                                    {dayEvents.slice(0, 3).map((ev, idx) => {
                                        const cfg = AREA_CONFIG[ev.area] || AREA_CONFIG.GENERIC;
                                        return (
                                            <div key={idx} className="flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                                                <span className="text-[10px] text-muted truncate hidden lg:block group-hover:text-slate-200">{ev.title}</span>
                                            </div>
                                        );
                                    })}
                                    {dayEvents.length > 3 && <p className="text-[10px] text-slate-600 font-bold pl-2.5">+{dayEvents.length - 3} mais</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Day Detail Modal */}
            <AnimatePresence>
                {selectedDayEvents && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedDayEvents(null)} className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] z-10">
                            <div className="p-6 bg-background border-b border-border flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-main">{selectedDayEvents.day} de {MONTH_NAMES[currentDate.getMonth()]}</h3>
                                    <p className="text-muted text-sm">{selectedDayEvents.events.length > 0 ? `${selectedDayEvents.events.length} evento(s)` : "Nenhum evento"}</p>
                                </div>
                                <div className="flex gap-2">
                                    <ButtonAvaloon variant="primary" className="h-8 text-xs" onClick={() => { setSelectedDayEvents(null); setShowAreaSelector(true); }}>
                                        <Plus className="w-3.5 h-3.5" /> Adicionar
                                    </ButtonAvaloon>
                                    <button onClick={() => setSelectedDayEvents(null)} className="p-2 bg-[#1f1f1f] rounded-full text-muted hover:text-main transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-3">
                                {selectedDayEvents.events.length > 0 ? (
                                    selectedDayEvents.events.map(ev => {
                                        const cfg = AREA_CONFIG[ev.area] || AREA_CONFIG.GENERIC;
                                        return (
                                            <div key={ev.id} className={`border ${cfg.bgColor} rounded-xl p-4 relative group`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${cfg.bgColor} ${cfg.textColor}`}>{cfg.label}</span>
                                                    <span className="text-xs text-muted font-mono flex items-center gap-1"><Clock className="w-3 h-3" />{ev.time} ({ev.duration}h)</span>
                                                </div>
                                                <h4 className="text-main font-bold text-base mt-2">{ev.title}</h4>

                                                {/* Pending confirmation badge */}
                                                {ev.isPending && (
                                                    <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-2.5 py-1.5 mb-2 text-xs font-bold w-fit">
                                                        <Clock3 className="w-3.5 h-3.5 animate-pulse" />
                                                        Aguardando Confirmação do Responsável
                                                    </div>
                                                )}

                                                <p className="text-sm text-main font-semibold mb-1 flex items-center gap-1.5">
                                                    {ev.assigneeAvatar ? (
                                                        <img src={ev.assigneeAvatar} alt={ev.assigneeName} className="w-5 h-5 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-main/10 flex items-center justify-center text-[10px] font-bold">
                                                            {ev.assigneeName.charAt(0)}
                                                        </div>
                                                    )}
                                                    {ev.assigneeName}
                                                </p>
                                                <p className="text-sm text-muted">Cliente: {ev.client}</p>
                                                {ev.createdByName && (
                                                    <p className="text-xs text-dim mt-0.5">Criado por: <span className="text-slate-400 font-medium">{ev.createdByName}</span></p>
                                                )}
                                                {ev.location && (
                                                    <p className="text-xs text-dim flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{ev.location}</p>
                                                )}

                                                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                                                    <a
                                                        href={buildGoogleCalendarUrl({
                                                            title: `[${cfg.label}] ${ev.title}`,
                                                            startDateIso: ev.isoStart,
                                                            durationHours: ev.duration,
                                                            location: ev.location
                                                        })}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                                                    >
                                                        <CalendarIcon className="w-3.5 h-3.5" /> Google Calendar
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10 text-dim">
                                        <p>Nenhum evento. Deseja adicionar?</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Area Selector Modal */}
            <AnimatePresence>
                {showAreaSelector && (
                    <AreaSelector onSelect={handleAreaSelected} onClose={() => setShowAreaSelector(false)} />
                )}
            </AnimatePresence>

            {/* Demand Form Panel */}
            <AnimatePresence>
                {showDemandForm && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowDemandForm(false)} className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border z-50 shadow-2xl overflow-y-auto">
                            <DemandForm
                                area={selectedArea || "GENERIC"}
                                onClose={() => setShowDemandForm(false)}
                                onSuccess={() => { loadEvents(); setShowDemandForm(false); }}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
