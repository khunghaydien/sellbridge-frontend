"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Box, TextField } from "@mui/material";
import FormInput from "@/component/form-input";

interface SignUpData {
  email: string;
}

export default function SignUp() {
  const t = useTranslations();

  const schema = yup.object({
    email: yup
      .string()
      .required(t("email_required"))
      .email(t("email_invalid")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: SignUpData) => {
    console.log("Sign up data:", data);
    // TODO: Implement sign up logic
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
      >
        {isSubmitting ? "..." : t("create_account")}
      </Button>
    </Box>
  );
}