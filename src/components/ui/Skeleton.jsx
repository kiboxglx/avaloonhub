/**
 * Avaloon Hub — Skeleton Screens
 * Use these instead of spinners for content-aware loading states.
 * They give users a sense of the layout before data arrives.
 */

// ─── Base atom ────────────────────────────────────────────────────────────────
export function Skeleton({ className = "" }) {
    return (
        <div
            className={`animate-pulse rounded-lg bg-white/5 ${className}`}
            aria-hidden="true"
        />
    );
}

// ─── Full page skeleton (used as Suspense fallback for lazy routes) ───────────
export function PageSkeleton() {
    return (
        <div className="space-y-6 p-1 w-full" aria-busy="true" aria-label="Carregando página">
            {/* Page header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-52" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* KPI cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-2xl" />
                ))}
            </div>

            {/* Main content block */}
            <Skeleton className="h-64 rounded-2xl" />

            {/* Two-column row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-48 rounded-2xl" />
            </div>
        </div>
    );
}

// ─── Kanban board skeleton ─────────────────────────────────────────────────────
export function KanbanSkeleton() {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4" aria-busy="true">
            {[...Array(4)].map((_, col) => (
                <div key={col} className="w-72 flex-shrink-0 space-y-3">
                    <Skeleton className="h-6 w-32" />
                    {[...Array(3)].map((_, row) => (
                        <div key={row} className="space-y-2 bg-card border border-border rounded-xl p-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                            <div className="flex justify-between pt-1">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-5 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

// ─── Modal skeleton (used when loading DemandForm or heavy modals lazily) ─────
export function ModalSkeleton() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-lg space-y-4 mx-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                </div>
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
            </div>
        </div>
    );
}

// ─── Calendar skeleton ─────────────────────────────────────────────────────────
export function CalendarSkeleton() {
    return (
        <div className="space-y-4" aria-busy="true">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
            <div className="grid grid-cols-7 gap-2">
                {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {[...Array(35)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
            </div>
        </div>
    );
}

// ─── Table / list skeleton ─────────────────────────────────────────────────────
export function TableSkeleton({ rows = 5 }) {
    return (
        <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-10 w-full rounded-xl" />
            {[...Array(rows)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
        </div>
    );
}
