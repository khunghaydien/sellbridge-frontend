"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { AuthService } from "../services/auth.service";

export interface ForgotPasswordData {
  email: string;
}

export function useForgotPassword() {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const schema = yup.object({
    email: yup
      .string()
      .required(t("email_required"))
      .email(t("email_invalid")),
  });

  const form = useForm<ForgotPasswordData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      setError(null);
      setSuccess(null);

      await AuthService.forgotPassword(data.email);
      setSuccess(t("reset_email_sent"));
    } catch (error: any) {
      setError(error.message || t("forgot_password_error"));
    }
  };

  return {
    form,
    error,
    success,
    onSubmit,
    setError,
    setSuccess,
  };
}
