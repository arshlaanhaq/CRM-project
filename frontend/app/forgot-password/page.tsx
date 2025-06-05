"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useApi } from "@/contexts/api-context"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { state, dispatch, forgotPassword } = useApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await forgotPassword(state.email)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto flex min-h-screen flex-col px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center">
            <Link href="/login" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <Image
                src="/image/new.png"
                alt="3i Energy Logo"
                width={100}
                height={100}
              />
              <p className="text-gray-600">Password Recovery</p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-md">
            {state.success ? (
              <div className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Password Reset Email Sent</h3>
                <p className="mt-2 text-sm text-gray-500">
                  We've sent a password reset link to <strong>{state.email}</strong>. Please check your email and follow the
                  instructions to reset your password.
                </p>
                <div className="mt-6">
                  <Button asChild className="w-full">
                    <Link href="/login">Return to Login</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                  <CardDescription>Enter your email to receive a password reset link</CardDescription>
                  {state.success && <p className="text-green-500 text-center">{state.success}</p>}
                  {state.error && <p className="text-red-500 text-center">{state.error}</p>}
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    {state.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{state.error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <input
                        type="email"
                        id="email"
                        value={state.email}
                        onChange={(e) =>
                          dispatch({ type: "SET_EMAIL", payload: e.target.value })
                        }
                        placeholder="Enter your email"
                        required
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={state.loading}>
                      {state.loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                    <div className="text-center text-sm">
                      Remember your password?{" "}
                      <Link href="/login" className="text-primary hover:underline">
                        Back to login
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </>
            )}
          </Card>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© 2023 3i Energy Solutions. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
