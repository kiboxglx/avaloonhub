export const GlassCard = ({ children, className }) => (
    <div className={`bg-card/80 backdrop-blur-xl border border-avaloon-orange/20 rounded-xl shadow-2xl ${className}`}>
        {children}
    </div>
);
