import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import ReactQueryProvider from "@/providers/QueryClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeLint - AI-Powered Code Reviews",
  description: "Transform your development workflow with intelligent code analysis. Catch bugs before they ship, improve code quality, and accelerate your team's velocity with AI that understands your codebase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
          <ReactQueryProvider>
            <main>
                {children}
            </main>
          </ReactQueryProvider>
      </body>
    </html>
  );
}
