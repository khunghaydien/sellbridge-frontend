"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Button } from "@mui/material";
import UserProfile from "@/features/auth/hooks/user-profile";

export default function Home() {
  const t = useTranslations();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="font-bold">{t("hello")}</h1>
      
      {isAuthenticated ? (
        <div className="space-y-4">
          <h2 className="font-semibold">{t("welcome_back")}</h2>
          <UserProfile />
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="font-semibold">{t("please_sign_in_to_continue")}</h2>
          <Link href="/authentication">
            <Button variant="contained" color="primary">
              {t("sign_in")}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
