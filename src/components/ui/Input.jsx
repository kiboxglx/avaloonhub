import { cn } from "@/utils/cn";
import { Search } from "lucide-react";

export function Input({ label, className, icon: Icon, placeholder, type = "text", ...props }) {
    return (
        <div className={cn("w-full space-y-1.5", className)}>
            {label && <label className="text-xs font-bold text-dim uppercase tracking-wide ml-1">{label}</label>}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main transition-colors">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "w-full bg-card border border-border px-4 py-2.5 rounded-lg text-main placeholder-gray-500 focus:outline-none focus:border-avaloon-orange focus:ring-1 focus:ring-avaloon-orange transition-all duration-200",
                        Icon && "pl-10"
                    )}
                    placeholder={placeholder}
                    {...props}
                />
            </div>
        </div>
    );
}

export function SearchInput({ ...props }) {
    return <Input icon={Search} placeholder="Search..." {...props} className="w-full max-w-sm" />;
}
