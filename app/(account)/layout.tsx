import AppHeader from "@/components/layout/app-header";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center">
            <AppHeader />
            {children}
        </div>
    )
}   