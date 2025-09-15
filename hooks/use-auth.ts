import { useSession, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const user = session?.user;

  const logout = async () => {
    await signOut({ callbackUrl: "/authentication" });
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    session,
  };
}
