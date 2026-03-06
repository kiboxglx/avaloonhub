export const ButtonAvaloon = ({ children, variant = "primary", className, ...props }) => {
    const variants = {
        primary: "bg-gradient-to-r from-[#ec5b13] to-[#ef4444] text-main shadow-lg shadow-orange-500/20 hover:scale-[1.02]",
        outline: "border border-border bg-card text-main hover:bg-[#1a1a1a]",
        ghost: "text-muted hover:text-main transition-colors"
    };

    return (
        <button
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 font-bold transition-all active:scale-[0.98] ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
