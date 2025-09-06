"use client";

import { useTranslations } from "next-intl";
import { Button, Alert } from "@mui/material";
import { useSignUp } from "./use-sign-up";
import FormInput from "@/component/form/form-input";

export function SignUp() {
  const t = useTranslations();
  const { form, error, success, onSubmit } = useSignUp();
  const { formState: { isSubmitting } } = form;

  return (
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

      <FormInput
        name="password"
        label={t("password")}
        type="password"
        placeholder={t("password")}
        form={form}
        required
      />

      <FormInput
        name="confirmPassword"
        label={t("confirm_password")}
        type="password"
        placeholder={t("confirm_password")}
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
        {isSubmitting ? t("loading") : t("create_account")}
      </Button>
    </form>
  );
}

export default SignUp;
