"use client";

import React, { ComponentType, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { useTranslations } from 'next-intl';
import { Box, CircularProgress, Typography } from '@mui/material';

interface WithAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  showLoading?: boolean;
}

function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo = '/authentication',
    requireAuth = true,
    showLoading = true,
  } = options;

  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations();

    useEffect(() => {
      if (!isLoading) {
        if (requireAuth && !isAuthenticated) {
          router.push(redirectTo);
        } else if (!requireAuth && isAuthenticated) {
          // Redirect authenticated users away from auth pages
          router.push('/');
        }
      }
    }, [isAuthenticated, isLoading, router]);

    // Show loading state
    if (isLoading && showLoading) {
      return (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="200px"
          gap={2}
        >
          <CircularProgress />
          <Typography color="textSecondary">
            {t("loading")}
          </Typography>
        </Box>
      );
    }

    // Don't render if auth requirements aren't met
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        return null; // Will redirect
      }
      if (!requireAuth && isAuthenticated) {
        return null; // Will redirect
      }
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
}

// Helper HOCs for common use cases
export const withRequireAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requireAuth: true });

export const withGuestOnly = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requireAuth: false, redirectTo: '/' });

export default withAuth;
