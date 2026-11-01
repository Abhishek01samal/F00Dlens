import { supabase } from "../supabase/client";

export type OAuthProvider = "google" | "github" | "apple";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const cloudAuth = {
  auth: {
    signInWithOAuth: async (provider: OAuthProvider, opts?: SignInOptions) => {
      const result = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirect_uri,
          queryParams: opts?.extraParams,
        },
      });

      return result;
    },
  },
};
