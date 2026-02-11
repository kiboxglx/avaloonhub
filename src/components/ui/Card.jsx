import { cn } from "@/utils/cn";

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "bg-card border border-border rounded-xl shadow-lg relative overflow-hidden backdrop-blur-sm",
                className
            )}
            {...props}
        >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-transparent blur-3xl opacity-10 pointer-events-none" />
            {/* Content */}
            <div className="relative z-10 p-6 flex flex-col gap-4">
                {children}
            </div>
        </div>
    );
}

export function CardHeader({ title, subtitle, className }) {
    return (
        <div className={cn("flex flex-col gap-1", className)}>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
    );
}
