"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Menu, X, User, Home, Ticket, Users, Settings, MessageSquare, BarChart2,
  AlertTriangle, FileText, UserCog
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import  {socket}  from "@/utils/socket"


export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [showHeader, setShowHeader] = useState(true)

  useEffect(() => {
    if (pathname === "/login" || pathname === "/") {
      setShowHeader(false)
    } else {
      setShowHeader(true)
    }

    const storedUserName = localStorage.getItem("userName") || "User"
    const storedUserRole = localStorage.getItem("userRole") || ""
    setUserName(storedUserName)
    setUserRole(storedUserRole)
  }, [pathname])

const handleLogout = () => {
  // Remove user data from localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("userRole");

  // If you are using a socket ref or variable, disconnect it safely
  if (socket && socket.connected) {
    socket.disconnect();
  
  }

  // Optionally, clear any socket-related state here if you have

  // Redirect user to login page
  router.push("/login");
};



  if (!showHeader) return null

  const adminNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: <Home className="h-5 w-5 mr-2" /> },
    { name: "Tickets", href: "/tickets", icon: <Ticket className="h-5 w-5 mr-2" /> },
    { name: "Technicians", href: "/technicians", icon: <Users className="h-5 w-5 mr-2" /> },
    { name: "Staff", href: "/staff", icon: <UserCog className="h-5 w-5 mr-2" /> },
    { name: "Reports", href: "/reports", icon: <BarChart2 className="h-5 w-5 mr-2" /> },
    { name: "Complaints", href: "/complaints", icon: <AlertTriangle className="h-5 w-5 mr-2" /> },
  ]

  const staffNavItems = [
    { name: "Staff Dashboard", href: "/staff-dashboard", icon: <Home className="h-5 w-5 mr-2" /> },
    { name: "Tickets", href: "/tickets", icon: <Ticket className="h-5 w-5 mr-2" /> },
    { name: "Technicians", href: "/technicians", icon: <Users className="h-5 w-5 mr-2" /> },
    { name: "Complaints", href: "/complaints", icon: <AlertTriangle className="h-5 w-5 mr-2" /> },
  ]

  const technicianNavItems = [
    { name: "My Dashboard", href: "/technician-dashboard", icon: <Home className="h-5 w-5 mr-2" /> },
    { name: "My Tickets", href: "/tickets", icon: <Ticket className="h-5 w-5 mr-2" /> },
  ]

  let navItems = []
  if (userRole === "admin") navItems = adminNavItems
  else if (userRole === "staff") navItems = staffNavItems
  else if (userRole === "technician") navItems = technicianNavItems

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  return (
    <>
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(true)}
            className="text-blue-800 hover:bg-primary-foreground/20 md:hidden mr-2"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <Link
            href={
              userRole === "admin"
                ? "/dashboard"
                : userRole === "staff"
                ? "/staff-dashboard"
                : userRole === "technician"
                ? "/technician-dashboard"
                : "/customer-dashboard"
            }
            className="text-xl font-bold"
          >
            <Image src="/image/new.png" alt="Logo" width={100} height={100} />
          </Link>
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-blue-800 hover:bg-primary-foreground/20">
               
               Hi, {userName}
                <User className="h-4 w-4 mr-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel> 
                  <Badge variant="outline" className=" border-blue-800 text-blue-800">
                    {userRole}
                  </Badge>
                </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${userRole}/profile`}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[240px] p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Menu</h2>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileSidebarOpen(false)}>
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
        </SheetContent>
      </Sheet>
    </>
  )
}