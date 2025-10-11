
import { cva, type VariantProps } from "class-variance-authority"
import { clsx } from "clsx"
import Logo from "./logo"
import NavigationTabs from "./navigation-tabs"
import Notification from "./notification"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { UserProfile } from "@/components"

const headerVariants = cva(
  // Base classes
  [
    "flex items-center justify-between gap-4",
    "py-3 px-6 rounded-lg",
    "max-w-[1080px] w-full",
    "shadow-md shadow-foreground/10",
    "sticky top-0 z-50",
    "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
    "border-b border-border/40"
  ],
  {
    variants: {
      size: {
        sm: "py-2 px-4 max-w-[800px]",
        default: "py-3 px-6 max-w-[1080px]", 
        lg: "py-4 px-8 max-w-[1200px]"
      },
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm shadow-foreground/5",
        default: "shadow-md shadow-foreground/10",
        lg: "shadow-lg shadow-foreground/15"
      },
      sticky: {
        true: "sticky top-0 z-50",
        false: "relative"
      }
    },
    defaultVariants: {
      size: "default",
      shadow: "default", 
      sticky: true
    }
  }
)

interface AppHeaderProps extends VariantProps<typeof headerVariants> {
  className?: string
}

export default function AppHeader({ 
  className, 
  size, 
  shadow, 
  sticky 
}: AppHeaderProps) {
    return (
        <header
            className={clsx(headerVariants({ size, shadow, sticky }), className)}
        >
            <div className="flex items-center gap-6">
                <h1 className="text-2xl font-bold">SELLBRIDGE</h1>
                <NavigationTabs />
            </div>

            <div className="flex items-center gap-2">
                <Notification />
                <ThemeToggle />
                <UserProfile />
            </div>
        </header>
    )
}