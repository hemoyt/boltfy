import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function ModeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme()

    // Cycle through: system -> light -> dark -> system
    const toggleTheme = () => {
        if (theme === "system") {
            setTheme("light")
        } else if (theme === "light") {
            setTheme("dark")
        } else {
            setTheme("system")
        }
    }

    const getIcon = () => {
        if (theme === "system") {
            return <Monitor className="h-[1.2rem] w-[1.2rem] text-primary" />
        }
        if (resolvedTheme === "dark") {
            return <Moon className="h-[1.2rem] w-[1.2rem] text-indigo-400" />
        }
        return <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500" />
    }

    const getLabel = () => {
        if (theme === "system") return "System theme"
        if (theme === "light") return "Light mode"
        return "Dark mode"
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTheme}
                    className="relative h-10 w-10 rounded-full border-border bg-background hover:bg-muted transition-all duration-300"
                    aria-label={`Current: ${getLabel()}. Click to toggle theme.`}
                >
                    {getIcon()}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{getLabel()}</p>
            </TooltipContent>
        </Tooltip>
    )
}
