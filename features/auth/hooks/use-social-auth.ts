"use client";

import { useState } from "react";
import { AuthService } from "../services";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export type SocialProvider = "google" | "facebook";

export function useSocialAuth() {
  const router = useRouter();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState<{ [key in SocialProvider]?: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  const signInWithProvider = async (provider: SocialProvider) => {
    try {
      setIsLoading(prev => ({ ...prev, [provider]: true }));
      setError(null);

      let response:any;
      if (provider === 'google') {
        response = await AuthService.googleSignIn();
      } else if (provider === 'facebook') {
        response = await AuthService.facebookSignIn();
      }
      if (response && response.success && response.data) {
        const authData = response.data as { authUrl: string };
        if (authData.authUrl) {
          window.location.href = authData.authUrl;
        } else {
          setError(`Failed to get ${provider} authentication URL`);
        }
      } else {
        setError(`Failed to get ${provider} authentication URL`);
      }
    } catch (error: any) {
      setError(error.message || `An error occurred while signing in with ${provider}`);
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
