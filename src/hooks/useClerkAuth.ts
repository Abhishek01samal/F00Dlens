import { useCallback } from "react";
import { useUser, useSignIn, useSignUp, useClerk } from "@clerk/nextjs";

export interface AppUser {
  name: string;
  email: string;
  initials: string;
  avatar?: string;
}

type AuthResult = { success: boolean; error?: string };

/**
 * Drop-in replacement for the old useAuth hook — now powered by Clerk.
 * Exposes the same interface: user, isLoggedIn, isLoading, login, signUp, loginWithGoogle, logout.
 */
export const useClerkAuth = () => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp: clerkSignUp, setActive: setSignUpActive } = useSignUp();
  const { signOut } = useClerk();

  // Map Clerk user to AppUser shape
  const appUser: AppUser | null = clerkUser
    ? {
        name:
          clerkUser.fullName ||
          clerkUser.firstName ||
          clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] ||
          "User",
        email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
        initials: (
          (clerkUser.fullName || clerkUser.firstName || "U")
            .replace(/\s+/g, "")
            .slice(0, 2) || "U"
        ).toUpperCase(),
        avatar: clerkUser.imageUrl || undefined,
      }
    : null;

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!email || !password) return { success: false, error: "Please enter email and password" };
      if (!signIn) return { success: false, error: "Sign-in not available" };
      try {
        const result = await signIn.create({ identifier: email, password });
        if (result.status === "complete") {
          await setSignInActive({ session: result.createdSessionId });
          return { success: true };
        }
        return { success: false, error: "Sign-in requires additional steps." };
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "errors" in err
            ? (err as { errors: Array<{ message: string }> }).errors?.[0]?.message
            : "Sign-in failed. Please try again.";
        return { success: false, error: message || "Sign-in failed." };
      }
    },
    [signIn, setSignInActive]
  );

  const signUpFn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!email || !password) return { success: false, error: "Please enter email and password" };
      if (password.length < 8) return { success: false, error: "Password must be at least 8 characters" };
      if (!clerkSignUp) return { success: false, error: "Sign-up not available" };
      try {
        const result = await clerkSignUp.create({ emailAddress: email, password });
        if (result.status === "complete") {
          await setSignUpActive({ session: result.createdSessionId });
          return { success: true };
        }
        // Email verification required
        await clerkSignUp.prepareEmailAddressVerification({ strategy: "email_code" });
        return {
          success: false,
          error: "Please check your inbox and confirm your email to activate your account.",
        };
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "errors" in err
            ? (err as { errors: Array<{ message: string }> }).errors?.[0]?.message
            : "Sign-up failed. Please try again.";
        return { success: false, error: message || "Sign-up failed." };
      }
    },
    [clerkSignUp, setSignUpActive]
  );

  const loginWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (!signIn) return { success: false, error: "Sign-in not available" };
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
      return { success: true };
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "errors" in err
          ? (err as { errors: Array<{ message: string }> }).errors?.[0]?.message
          : "Google sign-in failed. Please try again.";
      return { success: false, error: message || "Google sign-in failed." };
    }
  }, [signIn]);

  const logout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return {
    user: appUser,
    session: null,
    isLoggedIn: isSignedIn ?? false,
    isLoading: !isLoaded,
    login,
    signUp: signUpFn,
    loginWithGoogle,
    logout,
  };
};
