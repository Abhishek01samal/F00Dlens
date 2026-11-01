import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "FOODLENS AI - Smart Food Product Analysis",
  description:
    "Analyze food products with AI-powered vision technology. Get instant health scores, ingredient analysis, and healthier homemade alternatives.",
  keywords: [
    "food analysis",
    "AI nutrition",
    "product scanner",
    "ingredient checker",
    "health score",
    "nutrition facts",
  ],
  authors: [{ name: "FOODLENS AI" }],
  openGraph: {
    title: "FOODLENS AI - Smart Food Product Analysis",
    description:
      "Analyze food products with AI-powered vision technology. Get instant health scores, ingredient analysis, and healthier homemade alternatives.",
    type: "website",
    images: ["https://foodlens.ai/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FOODLENS AI - Smart Food Product Analysis",
    description: "Analyze food products with AI-powered vision technology",
    images: ["https://foodlens.ai/og-image.png"],
  },
};

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
      <html lang="en" data-theme="sunrise">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Pacifico&display=swap"
          />
        </head>
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
