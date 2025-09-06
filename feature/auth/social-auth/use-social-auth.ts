"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export type SocialProvider = "google" | "facebook";

export function useSocialAuth() {
  const router = useRouter();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState<{[key in SocialProvider]?: boolean}>({});
  const [error, setError] = useState<string | null>(null);

  const signInWithProvider = async (provider: SocialProvider) => {
    try {
      setIsLoading(prev => ({ ...prev, [provider]: true }));
      setError(null);

      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError(`Failed to sign in with ${provider}`);
      } else if (result?.ok) {
        router.push("/");
      }
    } catch (error) {
      setError(`An error occurred while signing in with ${provider}`);
    } finally {
      setIsLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const signInWithGoogle = () => signInWithProvider("google");
  const signInWithFacebook = () => signInWithProvider("facebook");

  return {
    signInWithGoogle,
    signInWithFacebook,
    isLoading,
    error,
    setError,
  };
}
