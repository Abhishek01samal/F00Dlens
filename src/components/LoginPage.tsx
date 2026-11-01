import { LoginPage } from "@/components/ui/animated-characters-login-page";

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSignUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onGoogleLogin?: () => Promise<{ success: boolean; error?: string }>;
}

const Login = ({ onLogin, onSignUp, onGoogleLogin }: LoginProps) => {
  return (
    <LoginPage
      onLogin={onLogin}
      onSignUp={onSignUp}
      {...(onGoogleLogin ? { onGoogleLogin } : {})}
    />
  );
};

export default Login;
