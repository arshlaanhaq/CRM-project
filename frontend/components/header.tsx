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

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    localStorage.removeItem("userName")
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  if (!showHeader) return null

  const adminNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: <Home className="h-5 w-5 mr-2" /> },
    { name: "Tickets", href: "/tickets", icon: <Ticket className="h-5 w-5 mr-2" /> },
    { name: "Technicians", href: "/technicians", icon: <Users className="h-5 w-5 mr-2" /> },
    { name: "Staff", href: "/staff", icon: <UserCog className="h-5 w-5 mr-2" /> },
    // { name: "Customers", href: "/customers", icon: <Users className="h-5 w-5 mr-2" /> },
    // { name: "Customer Feedback", href: "/customer-feedback", icon: <MessageSquare className="h-5 w-5 mr-2" /> },
     { name: "Technician Reports", href: "/technician-reports", icon: <FileText className="h-5 w-5 mr-2" /> },
    { name: "Reports", href: "/reports", icon: <BarChart2 className="h-5 w-5 mr-2" /> },
    { name: "Complaints", href: "/complaints", icon: <AlertTriangle className="h-5 w-5 mr-2" /> },
    // { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5 mr-2" /> },
  ]

  const staffNavItems = [
    { name: "Staff Dashboard", href: "/staff-dashboard", icon: <Home className="h-5 w-5 mr-2" /> },
    { name: "Tickets", href: "/tickets", icon: <Ticket className="h-5 w-5 mr-2" /> },
    { name: "Technicians", href: "/technicians", icon: <Users className="h-5 w-5 mr-2" /> },
    // { name: "Customers", href: "/customers", icon: <Users className="h-5 w-5 mr-2" /> },
    { name: "Technician Reports", href: "/technician-reports", icon: <FileText className="h-5 w-5 mr-2" /> },
    { name: "Complaints", href: "/complaints", icon: <AlertTriangle className="h-5 w-5 mr-2" /> },
    // { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5 mr-2" /> },
  ]

  const technicianNavItems = [
    { name: "My Dashboard", href: "/technician-dashboard", icon: <Home className="h-5 w-5 mr-2" /> },
    { name: "My Tickets", href: "/tickets", icon: <Ticket className="h-5 w-5 mr-2" /> },
    // { name: "Submit Complaint", href: "/submit-complaint", icon: <AlertTriangle className="h-5 w-5 mr-2" /> },
    // { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5 mr-2" /> },
  ]

  // const customerNavItems = [
  //   { name: "Customer Dashboard", href: "/customer-dashboard", icon: <Home className="h-5 w-5 mr-2" /> },
  //   { name: "Tickets", href: "/tickets", icon: <Ticket className="h-5 w-5 mr-2" /> },
  //   { name: "Submit Complaint", href: "/submit-complaint", icon: <AlertTriangle className="h-5 w-5 mr-2" /> },
  // ]

  let navItems = []
  if (userRole === "admin") navItems = adminNavItems
  else if (userRole === "staff") navItems = staffNavItems
  else if (userRole === "technician") navItems = technicianNavItems

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  return (
    <>
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
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
            className="text-xl font-bold text-white"
          >
            <Image src="/image/logo.png" alt="Logo" width={100} height={100} />
          </Link>
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-blue-800 hover:bg-primary-foreground/20"
          >
           {userName}  {mobileMenuOpen ? <X className="h-6 w-6" /> : <User className="h-6 w-6" />}
          </Button>
        </div>

        <div
          className={cn(
            "absolute top-full left-0 right-0 bg-white p-4 md:static md:bg-transparent md:p-0 md:flex md:items-center md:gap-4",
            mobileMenuOpen ? "block" : "hidden md:flex"
          )}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <DropdownMenu>
             <DropdownMenuContent align="end">
                <DropdownMenuLabel> 
                  {userRole && (
                    <Badge variant="outline" className="ml-2 text-xs border-blue-800 text-blue-800">
                      {userRole}
                    </Badge>
                  )}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${userRole}/profile`}>Profile</Link>
                </DropdownMenuItem>
                {/* {userRole !== "customer" && (
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                )} */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
              
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[240px] p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Menu</h2>
            {/* <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button> */}
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
