export const GlassCard = ({ children, className }) => (
    <div className={`bg-slate-900/80 backdrop-blur-xl border border-orange-500/10 rounded-xl shadow-2xl ${className}`}>
        {children}
    </div>
);
