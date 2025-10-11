"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { clsx } from "clsx"

const navigationItems = [
    { href: "/", label: "Home" },
]

export default function NavigationTabs() {
    const pathname = usePathname()

    return (
        <nav className="flex items-center gap-1">
            {navigationItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground"
                    )}
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    )
}
