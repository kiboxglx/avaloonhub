import { cn } from "@/utils/cn";
import { Search } from "lucide-react";

export function Input({ className, icon: Icon, placeholder, type = "text", ...props }) {
    return (
        <div className={cn("relative w-full group", className)}>
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
            )}
            <input
                type={type}
                className={cn(
                    "w-full bg-slate-900 border border-border px-4 py-2.5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-avaloon-orange focus:ring-1 focus:ring-avaloon-orange transition-all duration-200",
                    Icon && "pl-10"
                )}
                placeholder={placeholder}
                {...props}
            />
        </div>
    );
}

export function SearchInput({ ...props }) {
    return <Input icon={Search} placeholder="Search..." {...props} className="w-full max-w-sm" />;
}
