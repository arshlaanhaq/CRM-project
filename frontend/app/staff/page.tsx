"use client"

import { useEffect, useState } from "react"
import LayoutWithSidebar from "@/components/layout-with-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, Clock, Users } from "lucide-react"
import RoleGuard from "@/components/role-guard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useApi } from "@/contexts/api-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { getSocket } from "@/utils/socket"

// Define the shape of a staff member object
type StaffMember = {
  _id: string
  name: string
  email: string
  status?: "active" | "inactive" | string
  department?: string
  performance?: number
  teamSize?: number
  teamPerformance?: number
  ticketsHandled?: number
  responseTime?: string
}
function isUserActive(status?: string): boolean {
  return status?.toLowerCase() === "active"
}


export default function StaffPage() {
  const { getStaff } = useApi()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [onlineStaffIds, setOnlineStaffIds] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [activeStaff, setActiveStaff] = useState<number>(0)
  const [totalStaff, setTotalStaff] = useState<number>(0)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true)
        const data = await getStaff()
        setStaff(data)

        const active = data.filter((s: StaffMember) => s.status === "active" || !s.status).length
        setActiveStaff(active)
        setTotalStaff(data.length)

        setError("")
      } catch (err) {
        console.error("Failed to fetch staff:", err)
        setError("Failed to load staff data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [getStaff])

  useEffect(() => {
    const token = localStorage.getItem("token") || ""
    if (!token) return

    const socket = getSocket(token)

    socket.on("onlineUsers", (data) => {
            if (data && Array.isArray(data.staff)) {
       
        const onlineIds = data.staff.map((s: any) => s._id)
       
        setOnlineStaffIds(onlineIds)
      } else {
        console.warn("No staff array found in onlineUsers data")
        setOnlineStaffIds([])
      }
    })

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id)
    })

    return () => {
      socket.off("onlineUsers")
      socket.disconnect()
    }
  }, [])

  // Helper to check if a staff member is online
  const isOnline = (id: string) => onlineStaffIds.includes(id)

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <LayoutWithSidebar>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <Link href="/settings/add-staff">
            <Button className="mt-2 md:mt-0">Add Staff</Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">
                  {loading
                    ? "Loading..."
                    : `${onlineStaffIds.length}/${staff.length}`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {loading
                  ? ""
                  : `${staff.length - onlineStaffIds.length} staff currently offline`}
              </p>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </CardContent>
          </Card>

          {/* You can uncomment and type additional cards similarly if needed */}

        </div>

        <Tabs defaultValue="all-staff">
          {/* TabsList is commented out in your original */}

          <TabsContent value="all-staff">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">All Staff Members</h2>
                {loading ? (
                  <div className="py-8 text-center">Loading staff data...</div>
                ) : error ? (
                  <div className="py-8 text-center text-red-500">{error}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Department</th>
                          <th className="text-left p-2">Performance</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-4">
                              No staff members found
                            </td>
                          </tr>
                        ) : (
                          staff.map((member) => (
                            <tr key={member._id} className="border-b hover:bg-muted/50">
                              <td className="p-2">{member.name}</td>
                              <td className="p-2">{member.email}</td>
                              <td className="p-2">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOnline(member._id)
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                    }`}
                                >
                                  {isOnline(member._id) ? "Online" : "Offline"}
                                </span>
                              </td>
                              <td className="p-2">{member.department || "Support"}</td>
                              <td className="p-2 w-40">
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={member.performance ?? Math.floor(Math.random() * 40) + 60}
                                    className="h-2"
                                  />
                                  <span className="text-xs">
                                    {member.performance ?? Math.floor(Math.random() * 40) + 60}%
                                  </span>
                                </div>
                              </td>
                              <td className="p-2">
                                <Link href={`/staff/${member._id}`}>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>


          {/* You can add more TabsContent if needed */}
        </Tabs>
      </LayoutWithSidebar>
    </RoleGuard>
  )
}
