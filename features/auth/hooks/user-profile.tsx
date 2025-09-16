"use client";

import { useAuth } from "../../../hooks/use-auth";
import { Avatar, Box, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

export default function UserProfile() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const t = useTranslations();

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center p-4">
        <Typography>{t("loading")}</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Avatar src={user?.image || undefined} alt={user?.name || t("user")} className="cursor-pointer" onClick={logout}>
      {user?.name?.charAt(0)}
    </Avatar>
  );
}
