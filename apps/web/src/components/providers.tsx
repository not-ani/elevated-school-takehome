"use client";

import { env } from "@elevated-school/env/web";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ConvexProvider, ConvexReactClient } from "convex/react";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ConvexProvider client={convex}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </ConvexProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
