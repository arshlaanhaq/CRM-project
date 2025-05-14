import type React from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";

interface LayoutWithSidebarProps {
  children: React.ReactNode;
}

export default function LayoutWithSidebar({ children }: LayoutWithSidebarProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1">
        {/* Sidebar on the left */}
        <Sidebar />

        {/* Right side: main content + footer */}
        <div className="flex flex-col flex-1">
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        {/* Footer only inside the main area  <Footer />  */}
        </div>
      </div>
    </div>
  );
}
