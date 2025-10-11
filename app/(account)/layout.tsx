"use client";

import AppHeader from "@/components/layout/app-header";
import { withRequireAuth } from "@/hooks/with-auth";

function AccountLayout({ children}: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center">
            <AppHeader />
            {children}
        </div>
    )
}

export default withRequireAuth(AccountLayout);   