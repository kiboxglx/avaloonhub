export const Logo = ({ className, size = "default" }) => {
    // Large sizes for maximum visibility
    const sizes = {
        small: "h-20",     // Navbar mobile
        default: "h-20",   // Navbar desktop
        large: "h-40 md:h-48" // Login screen
    };

    const currentSize = sizes[size] || sizes.default;

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <img
                src="/logo.png"
                alt="Avaloon Hub"
                className={`${currentSize} w-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(236,91,19,0.3)]`}
            />
        </div>
    );
};
