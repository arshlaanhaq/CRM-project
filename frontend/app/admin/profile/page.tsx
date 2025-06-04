"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useApi } from "@/contexts/api-context"
import LayoutWithSidebar from "@/components/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Eye, EyeOff, Pencil, Shield } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"

interface AdminProfile {
  _id: string
  name: string
  email: string
  role: string
  phone?: string
  department?: string
  position?: string
  hireDate?: string
  createdAt: string
  updatedAt?: string
}

export default function AdminProfilePage() {
  const router = useRouter()
  const { getAdminProfile, updateAdminProfile } = useApi()

  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: "",
    position: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // console.log("Fetching admin profile...")  // Added log
        const profileData = await getAdminProfile()
        if (!profileData) throw new Error("No profile found")
        // Added log
        setProfile(profileData)

        setFormData({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          department: profileData.department || "",
          position: profileData.position || "",
          password: "",
          confirmPassword: "",
        })
      } catch (err) {
        console.error("Error fetching profile:", err)
        toast.error("Failed to load profile. Please try again.")
        setError("Failed to fetch profile data.")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [getAdminProfile])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear password error when either password field changes
    if (name === "password" || name === "confirmPassword") {
      // toast.success("Password updated successfully")
      setPasswordError("")
    }
  }

  const validateForm = () => {
    // Check if passwords match when a new password is provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      setPasswordError("Passwords do not match")
      return false
    }

    // Check password strength if provided
    if (formData.password && formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      setPasswordError("Password must be at least 8 characters long")
      return false
    }

    return true
  }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validateForm()) return

  setSaving(true)
  setError("")
  setSuccess("")

  try {
    const { confirmPassword, ...dataToSubmit } = formData

    // Send to backend
    const updatedData = await updateAdminProfile(dataToSubmit)

    // Update local profile with backend response
    setProfile(updatedData)
    // setSuccess("Profile updated successfully")

    // Optionally update localStorage
    if (typeof window !== "undefined") {
      const currentEmail = localStorage.getItem("userEmail")
      if (currentEmail === dataToSubmit.email) {
        localStorage.setItem("userName", dataToSubmit.name)
      }
    }

    setFormData((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
    }))
   
    setEditMode(false)
  } catch (err) {
    console.error("Error updating profile:", err)
    toast.error("Failed to update profile. Please try again.")
    setError("Failed to update profile. Please try again.")
  } finally {
    setSaving(false)
  }
}


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <LayoutWithSidebar>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading profile data...</p>
          </div>
        </div>
      </LayoutWithSidebar>
    )
  }

  return (
    <LayoutWithSidebar>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center">
            <Shield className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-2xl font-bold">Admin Profile</h1>
          </div>
        </div>
        {!editMode && (
          <Button onClick={() => setEditMode(true)} variant="outline">
            <Pencil className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-500 text-green-500">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {editMode ? (
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal">
            <TabsList className="mb-4">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="work">Work Information</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="work">
              <Card>
                <CardHeader>
                  <CardTitle>Work Information</CardTitle>
                  <CardDescription>Update your work details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" name="department" value={formData.department} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input id="position" name="position" value={formData.position} onChange={handleChange} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" type="button" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Tabs>
        </form>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile?.phone || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{profile?.role}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Work Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile?.department || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Position</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile?.position || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Hire Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile?.hireDate ? formatDate(profile.hireDate) : "Not specified"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile?.createdAt ? formatDate(profile.createdAt) : "Not available"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile?.updatedAt ? formatDate(profile.updatedAt) : "Not updated yet"}
                  </dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter className="flex justify-end">

            </CardFooter>
          </Card>
        </div>
      )}
    </LayoutWithSidebar>
  )
}
