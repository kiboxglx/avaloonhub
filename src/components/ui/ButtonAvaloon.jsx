export const ButtonAvaloon = ({ children, variant = "primary", className, ...props }) => {
    const variants = {
        primary: "bg-gradient-to-r from-[#ec5b13] to-[#ef4444] text-white shadow-lg shadow-orange-500/20 hover:scale-[1.02]",
        outline: "border border-slate-700 bg-slate-900/50 text-white hover:bg-slate-800",
        ghost: "text-slate-400 hover:text-white transition-colors"
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
