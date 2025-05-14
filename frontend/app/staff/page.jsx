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

export default function StaffPage() {
  const { getStaff } = useApi()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeStaff, setActiveStaff] = useState(0)
  const [totalStaff, setTotalStaff] = useState(0)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true)
        const data = await getStaff()
        setStaff(data)

        const active = data.filter((s) => s.status === "active" || !s.status).length
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
                <span className="text-2xl font-bold">{loading ? "Loading..." : `${activeStaff}/${totalStaff}`}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {loading ? "" : `${totalStaff - activeStaff} staff members currently offline`}
              </p>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tickets Managed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">42</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">+12 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">1.8h</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">-0.3h from last week</p>
            </CardContent>
          </Card> */}
        </div>

        <Tabs defaultValue="all-staff">
          {/* <TabsList className="mb-4">
            <TabsTrigger value="all-staff">All Staff</TabsTrigger>

          </TabsList> */}

          <TabsContent value="all-staff">
            <div className="rounded-md border">
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
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === "inactive"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                    }`}
                                >
                                  {member.status || "Active"}
                                </span>
                              </td>
                              <td className="p-2">{member.department || "Support"}</td>
                              <td className="p-2 w-40">
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={member.performance || Math.floor(Math.random() * 40) + 60}
                                    className="h-2"
                                  />
                                  <span className="text-xs">
                                    {member.performance || Math.floor(Math.random() * 40) + 60}%
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


          <TabsContent value="managers">
            <div className="rounded-md border">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">Managers</h2>
                {loading ? (
                  <div className="py-8 text-center">Loading managers data...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Team Size</th>
                          <th className="text-left p-2">Team Performance</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.filter((s) => s.department === "Management").length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-4">
                              No managers found
                            </td>
                          </tr>
                        ) : (
                          staff
                            .filter((s) => s.department === "Management")
                            .map((manager) => (
                              <tr key={manager._id} className="border-b hover:bg-muted/50">
                                <td className="p-2">{manager.name}</td>
                                <td className="p-2">{manager.email}</td>
                                <td className="p-2">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${manager.status === "inactive"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800"
                                      }`}
                                  >
                                    {manager.status || "Active"}
                                  </span>
                                </td>
                                <td className="p-2">{manager.teamSize || Math.floor(Math.random() * 5) + 3}</td>
                                <td className="p-2 w-40">
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={manager.teamPerformance || Math.floor(Math.random() * 20) + 75}
                                      className="h-2"
                                    />
                                    <span className="text-xs">
                                      {manager.teamPerformance || Math.floor(Math.random() * 20) + 75}%
                                    </span>
                                  </div>
                                </td>
                                <td className="p-2">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
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

          <TabsContent value="support">
            <div className="rounded-md border">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">Support Agents</h2>
                {loading ? (
                  <div className="py-8 text-center">Loading support agents data...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Tickets Handled</th>
                          <th className="text-left p-2">Response Time</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.filter((s) => s.department !== "Management").length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-4">
                              No support agents found
                            </td>
                          </tr>
                        ) : (
                          staff
                            .filter((s) => s.department !== "Management")
                            .map((agent) => (
                              <tr key={agent._id} className="border-b hover:bg-muted/50">
                                <td className="p-2">{agent.name}</td>
                                <td className="p-2">{agent.email}</td>
                                <td className="p-2">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.status === "inactive"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800"
                                      }`}
                                  >
                                    {agent.status || "Active"}
                                  </span>
                                </td>
                                <td className="p-2">{agent.ticketsHandled || Math.floor(Math.random() * 50) + 20}</td>
                                <td className="p-2">{agent.responseTime || (Math.random() * 2 + 0.5).toFixed(1)}h</td>
                                <td className="p-2">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
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
        </Tabs>
      </LayoutWithSidebar>
    </RoleGuard>
  )
}
