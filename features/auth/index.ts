// Auth Feature Public API
export * from './components';
export * from './hooks';
export * from './services';

// Re-export commonly used items
export { 
  Authentication,
  SignIn,
  SignUp,
  ChangePassword,
  ForgotPassword,
  SocialAuth
} from './components';

export {
  useSignIn,
  useSignUp,
  useChangePassword,
  useForgotPassword,
  useSocialAuth
} from './hooks';

export { AuthService } from './services';