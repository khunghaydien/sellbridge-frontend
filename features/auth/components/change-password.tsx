"use client";

import { useTranslations } from "next-intl";
import { Box, Typography, Button, Alert } from "@mui/material";
import { useChangePassword } from "../hooks/use-change-password";
import FormInput from "@/components/forms/form-input";
import { withRequireAuth } from "@/components";

function ChangePassword() {
  const t = useTranslations();
  const { form, error, success, onSubmit } = useChangePassword();
  const { formState: { isSubmitting } } = form;

  return (
    <Box className="max-w-md mx-auto p-6">
      <Typography variant="h4" className="text-center mb-6">
        {t("change_password")}
      </Typography>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" className="mb-4">
            {success}
          </Alert>
        )}

        <FormInput
          name="currentPassword"
          label={t("current_password")}
          type="password"
          placeholder={t("enter_current_password")}
          form={form}
          required
        />

        <FormInput
          name="newPassword"
          label={t("new_password")}
          type="password"
          placeholder={t("enter_new_password")}
          form={form}
          required
        />

        <FormInput
          name="confirmNewPassword"
          label={t("confirm_new_password")}
          type="password"
          placeholder={t("confirm_new_password")}
          form={form}
          required
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          className="mt-4"
        >
          {isSubmitting ? t("loading") : t("change_password")}
        </Button>
      </form>
    </Box>
  );
}

export { ChangePassword };
export default withRequireAuth(ChangePassword);
