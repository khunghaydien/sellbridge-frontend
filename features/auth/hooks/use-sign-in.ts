"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { AuthService } from "../services";

export interface SignInData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function useSignIn() {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);

  const schema = yup.object({
    email: yup
      .string()
      .required(t("email_required"))
      .email(t("email_invalid")),
    password: yup
      .string()
      .required(t("password_required"))
      .min(6, t("password_min_length")),
    rememberMe: yup.boolean().default(false),
  });

  const form = useForm<SignInData>({
    resolver: yupResolver(schema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInData) => {
    try {
      setError(null);
      const response = await AuthService.signIn({
        email: data.email,
        password: data.password,
      });
      window.location.href = '/'
    } catch (error: any) {
      setError(error.message);
    }
  };

  return {
    form,
    error,
    onSubmit,
    setError,
  };
}
