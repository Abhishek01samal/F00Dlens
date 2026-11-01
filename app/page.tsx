"use client";

import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import Login from "@/components/LoginPage";

// Lazy load the main app for code-splitting (it pulls in three.js, particles, charts)
const FoodLensIndex = lazy(() => import("@/components/FoodLensIndex"));

// Page loading skeleton
const PageSkeleton = () => (
  <div className="min-h-screen bg-background p-8">
    <div className="max-w-4xl mx-auto space-y-8">
      <Skeleton className="h-32 w-64 mx-auto" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-3/4 mx-auto" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const { user, isLoggedIn, isLoading, login, signUp, loginWithGoogle, logout } = useClerkAuth();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!isLoggedIn) {
    return <Login onLogin={login} onSignUp={signUp} onGoogleLogin={loginWithGoogle} />;
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FoodLensIndex user={user} onLogout={logout} />
    </Suspense>
  );
}
