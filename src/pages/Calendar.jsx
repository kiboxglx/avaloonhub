import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Video, MonitorPlay } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayEvents, setSelectedDayEvents] = useState(null);

    // Helper to get dates relative to today
    const getRelativeDate = (daysOffset) => {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);
        return date.getDate();
    };

    // MOCK DATA FOR SHOOTS AND EVENTS
    const [events] = useState([
        {
            id: 1,
            title: "Gravação Alpha Business",
            client: "Alpha Corp",
            type: "SHOOT",
            day: getRelativeDate(0), // Today
            time: "09:00 - 14:00",
            location: "Estúdio A",
            crew: ["JS", "MC"]
        },
        {
            id: 2,
            title: "Edição Reels Beta",
            client: "Beta Solutions",
            type: "POST_PRODUCTION",
            day: getRelativeDate(1), // Tomorrow
            time: "Tarde",
            location: "Remoto",
            crew: ["DR"]
        },
        {
            id: 3,
            title: "Reunião de Pauta",
            client: "Interno",
            type: "MEETING",
            day: getRelativeDate(3),
            time: "10:00 - 11:30",
            location: "Sala de Reunião",
            crew: ["Todos"]
        },
        {
            id: 4,
            title: "Gravação Externa Gamma",
            client: "Gamma Retail",
            type: "SHOOT",
            day: getRelativeDate(5),
            time: "08:00 - 18:00",
            location: "Centro da Cidade",
            crew: ["JS", "MC", "DR"]
        },
        {
            id: 5,
            title: "Entrega Final Delta",
            client: "Delta Inc",
            type: "DEADLINE",
            day: getRelativeDate(9),
            time: "Até 18:00",
            location: "Drive",
            crew: ["JL"]
        },
    ]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Agenda de Produção
                    </h2>
                    <p className="text-slate-400">Planejamento de filmagens e entregas.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#1e1e2d] rounded-lg p-1 border border-[#2d2d42]">
                        <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="min-w-[120px] text-center font-bold text-white">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <ButtonAvaloon variant="primary">
                        <Plus className="w-4 h-4" /> Nova Filmagem
                    </ButtonAvaloon>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 bg-[#1e1e2d] px-4 py-2 rounded-lg border border-[#2d2d42] w-fit shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <span>Gravação</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    <span>Edição</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span>Entrega/Prazo</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
                    <span>Reunião</span>
                </div>
            </div>

            {/* Calendar Grid - High Density Optimization */}
            {/* Removed overflow-hidden to allow tooltips to pop out */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-[#2d2d42] border border-[#2d2d42] rounded-xl shadow-2xl relative z-0">
                {/* Weekday Headers */}
                {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((day) => (
                    <div key={day} className="bg-[#1e1e2d] py-3 text-center text-xs font-bold text-slate-500 tracking-widest">
                        {day}
                    </div>
                ))}

                {/* Empty cells for padding */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-[#111121]/80 min-h-[100px]" />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
                    const dayEvents = events.filter(e => e.day === day);
                    const hasEvents = dayEvents.length > 0;

                    return (
                        <div
                            key={day}
                            onClick={() => setSelectedDayEvents({ day, events: dayEvents })}
                            className={`bg-[#1e1e2d] min-h-[100px] p-3 transition-colors cursor-pointer group hover:bg-[#252546] flex flex-col justify-between relative ${isToday ? 'bg-[#1e1e2d] ring-1 ring-inset ring-avaloon-orange/50' : ''
                                }`}
                        >
                            {/* Hover Tooltip/Popover */}
                            {hasEvents && (
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-[#111121] border border-[#2d2d42] rounded-xl shadow-2xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 invisible group-hover:visible">
                                    <div className="text-xs font-bold text-white mb-2 border-b border-[#2d2d42] pb-1 flex justify-between">
                                        <span>{day} de {monthNames[currentDate.getMonth()]}</span>
                                        <span className="text-slate-500">{dayEvents.length} eventos</span>
                                    </div>
                                    <div className="space-y-2">
                                        {dayEvents.slice(0, 5).map(e => (
                                            <div key={e.id} className="flex items-start gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${e.type === 'SHOOT' ? 'bg-red-500' :
                                                    e.type === 'POST_PRODUCTION' ? 'bg-blue-500' :
                                                        e.type === 'DEADLINE' ? 'bg-green-500' : 'bg-slate-500'
                                                    }`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-slate-300 font-bold leading-tight truncate">{e.title}</p>
                                                    <p className="text-[9px] text-slate-500 truncate">{e.time} • {e.client}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {dayEvents.length > 5 && (
                                            <p className="text-[9px] text-center text-slate-500 italic">+ {dayEvents.length - 5} outros</p>
                                        )}
                                    </div>
                                    {/* Arrow */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#2d2d42]"></div>
                                </div>
                            )}

                            <div className="flex justify-between items-start">
                                <span className={`text-sm font-bold flex items-center justify-center w-7 h-7 rounded-full ${isToday ? 'bg-avaloon-orange text-white shadow-lg shadow-avaloon-orange/20' : 'text-slate-400 group-hover:text-white'
                                    }`}>
                                    {day}
                                </span>
                                {hasEvents && (
                                    <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                                        {dayEvents.length}
                                    </span>
                                )}
                            </div>

                            {/* Event Indicators (Dots/Bars) */}
                            <div className="space-y-1 mt-2">
                                {dayEvents.slice(0, 3).map((event, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${event.type === 'SHOOT' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                                            event.type === 'POST_PRODUCTION' ? 'bg-blue-500' :
                                                event.type === 'DEADLINE' ? 'bg-green-500' : 'bg-slate-500'
                                            }`} />
                                        <span className="text-[10px] font-medium text-slate-400 truncate w-full hidden lg:block group-hover:text-slate-200 transition-colors">
                                            {event.title}
                                        </span>
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className="text-[10px] text-slate-600 pl-1 font-bold">+ {dayEvents.length - 3} mais</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Day Overlay */}
            <AnimatePresence>
                {selectedDayEvents && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedDayEvents(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            key="modal"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-[#1e1e2d] border border-[#2d2d42] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] z-10"
                        >
                            {/* Header */}
                            <div className="p-6 bg-[#111121] border-b border-[#2d2d42] flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {selectedDayEvents.day} de {monthNames[currentDate.getMonth()]}
                                    </h3>
                                    <p className="text-slate-400 text-sm">
                                        {selectedDayEvents.events.length > 0
                                            ? `${selectedDayEvents.events.length} compromissos agendados`
                                            : "Nenhum compromisso para este dia"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedDayEvents(null)}
                                    className="p-2 bg-[#252546] rounded-full text-slate-400 hover:text-white hover:bg-red-500/20 hover:text-red-500 transition-all"
                                >
                                    <span className="sr-only">Fechar</span>
                                    <Plus className="w-5 h-5 rotate-45" />
                                </button>
                            </div>

                            {/* Event List */}
                            <div className="p-6 overflow-y-auto space-y-4">
                                {selectedDayEvents.events.length > 0 ? (
                                    selectedDayEvents.events.map((event) => (
                                        <div key={event.id} className="relative pl-6 pb-2 group">
                                            {/* Timeline Line */}
                                            <div className="absolute left-0 top-2 bottom-0 w-px bg-[#2d2d42] group-last:hidden" />
                                            <div className={`absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full border-2 border-[#1e1e2d] ${event.type === 'SHOOT' ? 'bg-red-500' :
                                                event.type === 'POST_PRODUCTION' ? 'bg-blue-500' :
                                                    event.type === 'DEADLINE' ? 'bg-green-500' : 'bg-slate-500'
                                                }`} />

                                            <div className="bg-[#252546]/50 border border-[#2d2d42] rounded-xl p-4 hover:bg-[#252546] hover:border-avaloon-orange/30 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${event.type === 'SHOOT' ? 'bg-red-500/10 text-red-500' :
                                                        event.type === 'POST_PRODUCTION' ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-green-500/10 text-green-500'
                                                        }`}>
                                                        {event.type === 'SHOOT' ? 'Gravação' : event.type === 'POST_PRODUCTION' ? 'Edição' : 'Entrega'}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {event.time}
                                                    </div>
                                                </div>

                                                <h4 className="text-white font-bold text-lg mb-1">{event.title}</h4>

                                                <div className="flex items-center gap-4 text-sm text-slate-400 mt-3">
                                                    {event.location && (
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="w-4 h-4 text-slate-500" />
                                                            <span>{event.location}</span>
                                                        </div>
                                                    )}
                                                    {event.crew && (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="flex -space-x-2">
                                                                {event.crew.map((c, i) => (
                                                                    <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-[#252546] flex items-center justify-center text-[8px] font-bold text-white uppercase">
                                                                        {c}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-slate-500">
                                        <p>Livre para novos agendamentos!</p>
                                        <ButtonAvaloon variant="outline" className="mt-4">
                                            <Plus className="w-4 h-4" /> Agendar Algo (Em Breve)
                                        </ButtonAvaloon>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
