import { useState, useEffect } from "react";
import { AuthService } from "@/features/auth/services";
import { hasAccessToken } from "@/services/cookie-utils";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response: any = await AuthService.getMe();
      console.log(response.data);
      setUser({
        id: response.data.id,
        name: response.data.username,
        email: response.data.email,
        image: response.data.id,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/authentication';
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    signOut,
    checkAuthStatus,
  };
}
