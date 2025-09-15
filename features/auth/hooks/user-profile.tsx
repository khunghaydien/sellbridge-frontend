"use client";

import { useAuth } from "../../../hooks/use-auth";
import { Button, Avatar, Box, Typography } from "@mui/material";
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
    <Box className="flex items-center gap-4 p-4 border rounded-lg">
      <Avatar src={user?.image || undefined} alt={user?.name || t("user")}>
        {user?.name?.charAt(0)}
      </Avatar>
      <Box className="flex-1">
        <Typography variant="h6">{user?.name}</Typography>
        <Typography color="text.secondary">
          {user?.email}
        </Typography>
      </Box>
      <Button variant="outlined" onClick={logout}>
        {t("sign_out")}
      </Button>
    </Box>
  );
}
