"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Box, TextField, Checkbox, FormControlLabel, Link } from "@mui/material";
import FormInput from "@/component/form-input";

interface SignInData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function SignIn() {    
  const t = useTranslations();

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: SignInData) => {
    console.log("Sign in data:", data);
    // TODO: Implement sign in logic
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
    // TODO: Navigate to forgot password page or open modal
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormInput
        label={t("email")}
        error={errors.email?.message}
        required
      >
        <TextField
          type="email"
          placeholder={t("email")}
          {...register("email")}
        />
      </FormInput>

      <FormInput
        label={t("password")}
        error={errors.password?.message}
        required
      >
        <TextField
          type="password"
          placeholder={t("password")}
          {...register("password")}
        />
      </FormInput>

      {/* Remember Me and Forgot Password */}
      <div className="flex items-center justify-between">
        <FormControlLabel
          control={
            <Checkbox
              {...register("rememberMe")}
              size="small"
            />
          }
          label={t("remember_me")}
          className="text-sm"
        />
        
        <Link
          component="button"
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-primary"
        >
          {t("forgot_password")}
        </Link>
      </div>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
      >
        {isSubmitting ? "..." : t("sign_in")}
      </Button>
    </Box>
  );
}