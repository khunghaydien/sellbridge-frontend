"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthService } from "../services/auth.service";

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
}

export function useSignUp() {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const schema = yup.object({
    email: yup
      .string()
      .required(t("email_required"))
      .email(t("email_invalid")),
    password: yup
      .string()
      .required(t("password_required"))
      .min(6, t("password_min_length")),
    confirmPassword: yup
      .string()
      .required(t("confirm_password_required"))
      .oneOf([yup.ref("password")], t("passwords_must_match")),
  });

  const form = useForm<SignUpData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: SignUpData) => {
    try {
      setError(null);
      setSuccess(null);

      // Register the user
      await AuthService.signUp({
        email: data.email,
        password: data.password,
      });

      setSuccess(t("account_created_success"));

      // Automatically sign in after successful registration
      setTimeout(async () => {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.ok) {
          router.push("/");
        }
      }, 2000);

    } catch (error: any) {
      setError(error.message || t("sign_up_error"));
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
