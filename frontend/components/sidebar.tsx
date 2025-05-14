"use client"

import React, { createContext, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Ticket,
  Users,
  BarChart2,
  FileText,
  MessageSquare,
  AlertTriangle,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Context to manage sidebar state for mobile views
type SidebarContextType = {
  isMobileOpen: boolean
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const SidebarContext = createContext<SidebarContextType>({
  isMobileOpen: false,
  setIsMobileOpen: () => {},
})

type NavItem = {
  name: string
  href: string
  icon: React.ReactNode
}

const adminNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: <Home className="h-5 w-5 mr-2" /> },
  { name: "Tickets", href: "/tickets", icon: <Ticket className="h-5 w-5 mr-2" /> },
  { name: "Technicians", href: "/technicians", icon: <Users className="h-5 w-5 mr-2" /> },
  { name: "Staff", href: "/staff", icon: <Users className="h-5 w-5 mr-2" /> },
  // { name: "Technician Reports", href: "/technician-reports", icon: <FileText className="h-5 w-5 mr-2" /> },
  // { name: "Customers", href: "/customers", icon: <Users className="h-5 w-5 mr-2" /> },
  // { name: "Customer Feedback", href: "/customer-feedback", icon: <MessageSquare className="h-5 w-5 mr-2" /> },
  { name: "Reports", href: "/reports", icon: <BarChart2 className="h-5 w-5 mr-2" /> },
  { name: "Complaints", href: "/complaints", icon: <AlertTriangle className="h-5 w-5 mr-2" /> },
  // { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5 mr-2" /> },
]

const staffNavItems: NavItem[] = [
  { name: "Staff Dashboard", href: "/staff-dashboard", icon: <Home className="h-5 w-5 mr-2" /> },
  { name: "Tickets", href: "/tickets", icon: <Ticket className="h-5 w-5 mr-2" /> },
  { name: "Technicians", href: "/technicians", icon: <Users className="h-5 w-5 mr-2" /> },
  // { name: "Customers", href: "/customers", icon: <Users className="h-5 w-5 mr-2" /> },
  // { name: "Technician Reports", href: "/technician-reports", icon: <FileText className="h-5 w-5 mr-2" /> },
  // { name: "Customer Feedback", href: "/customer-feedback", icon: <MessageSquare className="h-5 w-5 mr-2" /> },
  { name: "Complaints", href: "/complaints", icon: <AlertTriangle className="h-5 w-5 mr-2" /> },
  // { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5 mr-2" /> },
]

const technicianNavItems: NavItem[] = [
  { name: "My Dashboard", href: "/technician-dashboard", icon: <Home className="h-5 w-5 mr-2" /> },
  { name: "My Tickets", href: "/tickets", icon: <Ticket className="h-5 w-5 mr-2" /> },
  // { name: "Submit Complaint", href: "/submit-complaint", icon: <AlertTriangle className="h-5 w-5 mr-2" /> },
  // { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5 mr-2" /> },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    const role = localStorage.getItem("userRole") || ""
    setUserRole(role)
  }, [])

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  let navItems: NavItem[] = technicianNavItems
  if (userRole === "admin") navItems = adminNavItems
  else if (userRole === "staff") navItems = staffNavItems

  if (pathname === "/login" || pathname === "/" ) return null

  return (
    <aside className="w-64 border-r bg-muted p-4 hidden md:block h-[calc(100vh-56px)] sticky top-[56px] overflow-y-auto">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive(item.href) ? "secondary" : "ghost"}
              className="w-full justify-start font-normal"
            >
              {item.icon}
              {item.name}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
