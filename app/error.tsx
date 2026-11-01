"use client";

export default function Error() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Something went wrong.</h1>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
