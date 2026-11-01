import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cloudAuth } from "@/integrations/cloud/index";

export interface AppUser {
  name: string;
  email: string;
  initials: string;
  avatar?: string;
}

type AuthResult = { success: boolean; error?: string };

function toAppUser(supabaseUser: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): AppUser {
  const email = supabaseUser.email ?? "";
  const meta = (supabaseUser.user_metadata ?? {}) as Record<string, unknown>;
  const nameRaw =
    (typeof meta["full_name"] === "string" && meta["full_name"]) ||
    (typeof meta["name"] === "string" && meta["name"]) ||
    (typeof meta["user_name"] === "string" && meta["user_name"]) ||
    email.split("@")[0] ||
    "User";
  const name = nameRaw ? nameRaw.charAt(0).toUpperCase() + nameRaw.slice(1) : "User";
  const initials = (name.replace(/\s+/g, "").slice(0, 2) || "U").toUpperCase();
  const avatar =
    typeof meta["avatar_url"] === "string" && meta["avatar_url"] ? meta["avatar_url"] : undefined;
  const appUser: AppUser = { name, email, initials };
  if (avatar) appUser.avatar = avatar;
  return appUser;
}

export const useAuth = () => {
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSupabaseUser(data.session?.user ?? null);
        setIsLoading(false);
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (
        event !== "SIGNED_IN" &&
        event !== "SIGNED_OUT" &&
        event !== "USER_UPDATED" &&
        event !== "INITIAL_SESSION"
      ) {
        return;
      }
      setSupabaseUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const appUser: AppUser | null = useMemo(() => {
    if (!supabaseUser) return null;
    return toAppUser(supabaseUser);
  }, [supabaseUser]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!email || !password) return { success: false, error: "Please enter email and password" };
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: "Sign-in failed. Please try again." };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!email || !password) return { success: false, error: "Please enter email and password" };
    if (password.length < 8)
      return { success: false, error: "Password must be at least 8 characters" };
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) return { success: false, error: error.message };
      if (!data.session) {
        return {
          success: false,
          error: "Please check your inbox and confirm your email to activate your account.",
        };
      }
      return { success: true };
    } catch {
      return { success: false, error: "Sign-up failed. Please try again." };
    }
  }, []);

  // Google OAuth through the managed broker
  const loginWithGoogle = useCallback(async (): Promise<AuthResult> => {
    try {
      const result = await cloudAuth.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        return { success: false, error: result.error.message ?? "Google sign-in failed." };
      }
      // Either the browser redirected to Google, or the session is already set.
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message ?? "Google sign-in failed. Please try again.",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const isLoggedIn = !!supabaseUser;

  return {
    user: appUser,
    session: null,
    isLoggedIn,
    isLoading,
    login,
    signUp,
    loginWithGoogle,
    logout,
  };
};
