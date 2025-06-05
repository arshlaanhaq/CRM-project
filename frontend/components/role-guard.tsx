"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallbackPath?: string
}

export default function RoleGuard({ children, allowedRoles, fallbackPath = "/dashboard" }: RoleGuardProps) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authorized
    const checkAuth = () => {
      const userRole = localStorage.getItem("userRole")

      if (!userRole) {
        // No role found, redirect to login
        router.push("/login")
        return
      }

      if (allowedRoles.includes(userRole)) {
        setAuthorized(true)
      } else {
        // Redirect to fallback path if not authorized
        router.push(fallbackPath)
      }

      setLoading(false)
    }

    checkAuth()
  }, [allowedRoles, fallbackPath, router])

  // Show nothing while checking authorization
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">   <Image
                  src="/image/new.png" // path relative to public
                  alt="Description"
                  width={100}
                  height={100}
                />  Loading...</div>
  }

  // Render children only if authorized
  return authorized ? <>{children}</> : null
}
