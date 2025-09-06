"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { AuthService } from "@/service/auth.service";

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export function useChangePassword() {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const schema = yup.object({
    currentPassword: yup
      .string()
      .required(t("current_password_required")),
    newPassword: yup
      .string()
      .required(t("new_password_required"))
      .min(6, t("password_min_length")),
    confirmNewPassword: yup
      .string()
      .required(t("confirm_new_password_required"))
      .oneOf([yup.ref("newPassword")], t("passwords_must_match")),
  });

  const form = useForm<ChangePasswordData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ChangePasswordData) => {
    try {
      setError(null);
      setSuccess(null);

      await AuthService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setSuccess(t("password_changed_success"));
      form.reset();
    } catch (error: any) {
      setError(error.message || t("change_password_error"));
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
