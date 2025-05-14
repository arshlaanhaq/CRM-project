"use client"

import { useEffect, useState } from "react"
import LayoutWithSidebar from "@/components/layout-with-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Clock, Users } from "lucide-react"
import TechnicianDashboard from "@/components/technician-dashboard"
import RoleGuard from "@/components/role-guard"
import TechnicianPerformanceChart from "@/components/technician-performance-chart"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/contexts/api-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Technician = {
  _id: string
  name: string
  email: string
  status?: "active" | "inactive" | string
  ticketsAssigned?: number
  ticketsResolved?: number
}

export default function TechniciansPage() {
  const api = useApi()
  const { getTechnicians } = useApi()
   const [userRole, setUserRole] = useState<string | null>(null)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [activeTechnicians, setActiveTechnicians] = useState<number>(0)
  const [totalTechnicians, setTotalTechnicians] = useState<number>(0)
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    averageResolutionTime: 0,
  })

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setLoading(true)
        const data: Technician[] = await getTechnicians()
        setTechnicians(data)
        const active = data.filter((tech) => tech.status === "active" || !tech.status).length
        setActiveTechnicians(active)
        setTotalTechnicians(data.length)
        setError("")
      } catch (err) {
        console.error("Failed to fetch technicians:", err)
        setError("Failed to load technicians. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicians()
  }, [getTechnicians])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketData = await api.getAllTickets()
        setTickets(ticketData)

        const assigned = ticketData.filter((ticket: any) => ticket.status === "open").length
        const inProgress = ticketData.filter((ticket: any) => ticket.status === "in-progress").length
        const resolved = ticketData.filter((ticket: any) => ticket.status === "resolved").length

        setStats({
          assigned,
          inProgress,
          resolved,
          averageResolutionTime: 2.5, // Placeholder
        })

        // Map ticket counts into technicians
        setTechnicians((prevTechs) =>
          prevTechs.map((tech) => {
            const assignedCount = ticketData.filter(
              (ticket: any) => ticket.assignedTo?._id === tech._id
            ).length

            const resolvedCount = ticketData.filter(
              (ticket: any) =>
                ticket.assignedTo?._id === tech._id && ticket.status === "resolved"
            ).length

            return {
              ...tech,
              ticketsAssigned: assignedCount,
              ticketsResolved: resolvedCount,
            }
          })
        )
      } catch (error) {
        console.error("Error fetching technician data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [api])
    useEffect(() => {
    setUserRole(localStorage.getItem("userRole"))
  }, [])

  // If user role is not loaded yet, show nothing
  if (userRole === null) {
    return null
  }

  // Different settings view for technicians vs admins
  const isAdmin = userRole === "admin"

  return (
    <RoleGuard allowedRoles={["admin", "staff"]}>
      <LayoutWithSidebar>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Technician Dashboard</h1>
             {userRole === 'admin' && (
        <Link href="/settings/add-technician">
          <Button className="mt-2 md:mt-0">Add Technician</Button>
        </Link>
      )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">
                  {loading ? "Loading..." : `${activeTechnicians}/${totalTechnicians}`}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {loading ? "" : `${totalTechnicians - activeTechnicians} technicians currently offline`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tickets Resolved </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">{stats.resolved}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average resolution: {stats.averageResolutionTime}h</p>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Resolution Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold"> {stats.averageResolutionTime}h</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">-0.5h from last week</p>
            </CardContent>
          </Card> */}
        </div>

        <Tabs defaultValue="all-technicians">
          {/* <TabsList className="mb-4">
           
          </TabsList> */}

          <TabsContent value="all-technicians">
            <div className="rounded-md border">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">All Technicians</h2>

                {loading ? (
                  <div className="py-8 text-center">Loading technicians data...</div>
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
                          <th className="text-left p-2">Tickets Assigned</th>
                          <th className="text-left p-2">Tickets Resolved</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {technicians.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-4">
                              No technicians found
                            </td>
                          </tr>
                        ) : (
                          technicians.map((tech, index) => (
                            <tr key={tech?._id || `tech-${index}`} className="border-b hover:bg-muted/50">
                              <td className="p-2">{tech.name}</td>
                              <td className="p-2">{tech.email}</td>
                              <td className="p-2">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tech.status === "inactive"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                    }`}
                                >
                                  {tech.status
                                    ? tech.status.charAt(0).toUpperCase() + tech.status.slice(1)
                                    : "Active"}
                                </span>
                              </td>
                              <td className="p-2">{tech.ticketsAssigned ?? 0}</td>
                              <td className="p-2">{tech.ticketsResolved ?? 0}</td>
                              <td className="p-2">
                                <Link href={`/technicians/${tech._id}`}>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TechnicianPerformanceChart />
          </div>
        </Tabs>
      </LayoutWithSidebar>
    </RoleGuard>
  )
}
