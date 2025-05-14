// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ApiProvider } from "@/contexts/api-context";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { ToastContainer } from 'react-toastify';
import Footer from "@/components/footer"
import 'react-toastify/dist/ReactToastify.css';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "3i Energy CRM",
  description: "Customer Support CRM for 3i Energy and SolarFix",
  generator: "developers",
  icons: {
    icon: "/image/logo1.png", // <-- Path to your favicon
  },
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/image/logo1.png" type="image/png" />
      </head>
      <body className={inter.className}>
        <ApiProvider>
          <ToastProvider>
            {children}
            <ToastViewport />
          </ToastProvider>
          <ToastContainer />
        </ApiProvider>
      </body>
    </html>
  )
}

