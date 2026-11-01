type AppErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type AppEvents = {
  track?: (event: string, properties?: Record<string, unknown>) => string | null;
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: AppErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __appEvents?: AppEvents;
    __appReportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
  }
}

export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.__appEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
  const stack = error instanceof Error ? error.stack : undefined;
  window.__appReportRuntimeError?.({
    message: describeThrown(error),
    ...(stack !== undefined && { stack }),
    filename: window.location.pathname,
  });
}

export const reportError = reportAppError;

const MAX_SERIALIZED_LENGTH = 2000;

function describeThrown(error: unknown): string {
  if (error instanceof Response) {
    return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
  }
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    const json = JSON.stringify(error);
    if (json && json !== "{}") {
      return json.length > MAX_SERIALIZED_LENGTH
        ? json.slice(0, MAX_SERIALIZED_LENGTH) + "..."
        : json;
    }
  } catch {
    // Cyclic structure, fall through
  }
  return String(error);
}
