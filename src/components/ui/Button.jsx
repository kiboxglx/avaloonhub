import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

export function Button({ className, variant = "primary", size = "md", isLoading, children, ...props }) {
    const variants = {
        primary: "bg-avaloon-gradient text-white hover:opacity-90 shadow-lg shadow-primary/20",
        secondary: "bg-card border border-border text-white hover:bg-white/5",
        ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
        outline: "border border-primary text-primary hover:bg-primary/10",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        icon: "p-2",
    };

    return (
        <button
            className={cn(
                "rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}
