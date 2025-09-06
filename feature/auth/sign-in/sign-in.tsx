"use client";

import { useTranslations } from "next-intl";
import { Button, Link, Alert } from "@mui/material";
import { useSignIn } from "./use-sign-in";
import FormInput from "@/component/form/form-input";

export function SignIn() {
  const t = useTranslations();
  const { form, error, onSubmit } = useSignIn();
  const { formState: { isSubmitting } } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
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

      {/* Remember Me and Forgot Password */}
      <div className="flex items-center justify-between">
        <FormInput
          name="rememberMe"
          label={t("remember_me")}
          type="checkbox"
          form={form}
        />
        <Link
          href="/forgot-password"
          className="cursor-pointer"
        >
          {t("forgot_password")}
        </Link>
      </div>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={isSubmitting}
        className="mt-4"
      >
        {isSubmitting ? t("loading") : t("sign_in")}
      </Button>
    </form>
  );
}

export default SignIn;
