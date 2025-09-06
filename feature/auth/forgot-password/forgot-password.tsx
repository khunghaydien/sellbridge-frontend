"use client";

import { useTranslations } from "next-intl";
import { Box, Typography, Button, Alert } from "@mui/material";
import { useForgotPassword } from "./use-forgot-password";
import { withGuestOnly } from '@/component/auth/with-auth';
import FormInput from "@/component/form/form-input";

function ForgotPassword() {
  const t = useTranslations();
  const { form, error, success, onSubmit } = useForgotPassword();
  const { formState: { isSubmitting } } = form;

  return (
    <Box className="max-w-md mx-auto p-6">
      <Typography variant="h4" className="text-center mb-2">
        {t("forgot_password")}
      </Typography>
      
      <Typography className="text-center text-muted-foreground mb-6">
        {t("forgot_password_description")}
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
          name="email"
          label={t("email")}
          type="email"
          placeholder={t("email")}
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
          {isSubmitting ? t("loading") : t("send_reset_email")}
        </Button>

        <div className="text-center">
          <Button
            variant="text"
            size="small"
            onClick={() => window.location.href = "/authentication"}
          >
            {t("back_to_sign_in")}
          </Button>
        </div>
      </form>
    </Box>
  );
}

export { ForgotPassword };
export default withGuestOnly(ForgotPassword);
