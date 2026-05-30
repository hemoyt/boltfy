import { cn } from "@/lib/utils";

interface BrandLogoProps {
    className?: string;
    iconOnly?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
}

export const BrandLogo = ({ className, iconOnly = false, size = "md" }: BrandLogoProps) => {
    const sizes = {
        sm: "h-6 w-6",
        md: "h-10 w-10",
        lg: "h-14 w-14",
        xl: "h-20 w-20",
    };

    const textSizes = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-3xl",
        xl: "text-5xl",
    };

    return (
        <div className={cn("flex items-center gap-3 group", className)}>
            <div className={cn(
                "relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-purple-600 p-[2px] shadow-lg group-hover:shadow-primary/25 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3",
                sizes[size]
            )}>
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-2/3 h-2/3 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    >
                        <path
                            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
            </div>

            {!iconOnly && (
                <span className={cn(
                    "font-bold tracking-tighter text-foreground group-hover:text-primary transition-colors duration-300",
                    textSizes[size]
                )}>
                    Boltfy<span className="text-primary">.</span>
                </span>
            )}
        </div>
    );
};
