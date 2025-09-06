// Main authentication features
export { default as Authentication } from './authentication';
export { default as SignIn } from './sign-in';
export { default as SignUp } from './sign-up';
export { default as ChangePassword } from './change-password';
export { default as ForgotPassword } from './forgot-password';
export { default as SocialAuth } from './social-auth';

// Shared utilities (now in component)
export { useAuth, withAuth, withRequireAuth, withGuestOnly } from '@/component';

// Types
export type { SignInData } from './sign-in';
export type { SignUpData } from './sign-up';
export type { ChangePasswordData } from './change-password';
export type { ForgotPasswordData } from './forgot-password';
export type { SocialProvider } from './social-auth';
