import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/common/Toast";
import { WebSocketProvider } from "@/components/providers/WebSocketProvider";

export const metadata: Metadata = {
  title: "Grand Hotel & Dining | Digital Culinary Menu",
  description: "Exquisite dining selections, artisanal recipes, and digital hospitality menu",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#F8F7F3] text-[#17201B] antialiased selection:bg-brand-900 selection:text-gold-300">
        <QueryProvider>
          <ToastProvider>
            <WebSocketProvider>
              {children}
            </WebSocketProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
