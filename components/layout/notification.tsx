import { IconRing } from "@/icons"
import { clsx } from "clsx"

interface NotificationProps {
    count?: number
    className?: string
}

export default function Notification({ count = 0, className }: NotificationProps) {
    return (
        <button
            className={clsx(
                "relative p-2 rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "text-muted-foreground",
                className
            )}
            aria-label="Notifications"
        >
            <IconRing className="w-5 h-5" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </button>
    )
}
