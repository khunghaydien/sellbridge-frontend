"use client";

import { useTranslations } from "next-intl";
import { Box, Typography, Alert, Divider, Button, Link } from "@mui/material";
import { useSocialAuth } from "./use-social-auth";
import { IconFacebook, IconGoogle } from "@/icon";

export function SocialAuth() {
  const t = useTranslations();
  const { 
    signInWithGoogle, 
    signInWithFacebook, 
    isLoading, 
    error 
  } = useSocialAuth();

  return (
    <Box className="space-y-4">
      {/* Divider */}
      <Box className="flex items-center gap-4">
        <Divider className="flex-1" />
        <Typography color="textSecondary" className="px-2">
          {t("or")}
        </Typography>
        <Divider className="flex-1" />
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

        {/* Social buttons */}
        <Box className="flex gap-4">
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={signInWithGoogle}
          disabled={isLoading.google || isLoading.facebook}
          startIcon={<IconGoogle />}
          className="justify-start"
        >
          {isLoading.google ? t("loading") : t("google")}
        </Button>

        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={signInWithFacebook}
          disabled={isLoading.google || isLoading.facebook}
          startIcon={<IconFacebook />}
          className="justify-start"
        >
          {isLoading.facebook ? t("loading") : t("facebook")}
        </Button>
      </Box>

      {/* Terms and policies */}
      <Typography color="textSecondary" className="text-center">
        {t("by_continuing")}{" "}
        <Link href="/terms-and-policies" color="primary" className="cursor-pointer">
          {t("terms_and_policies")}
        </Link>
      </Typography>
    </Box>
  );
}

export default SocialAuth;
