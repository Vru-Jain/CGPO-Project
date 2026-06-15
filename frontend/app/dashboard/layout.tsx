"use client";

import { BackendProvider } from "@/components/backend-connection-manager";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BackendProvider>{children}</BackendProvider>;
}
