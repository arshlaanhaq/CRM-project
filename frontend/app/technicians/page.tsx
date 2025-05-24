"use client"

import { useEffect, useState } from "react"
import LayoutWithSidebar from "@/components/layout-with-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Users } from "lucide-react"
import TechnicianPerformanceChart from "@/components/technician-performance-chart"
import RoleGuard from "@/components/role-guard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useApi } from "@/contexts/api-context"
import { getSocket } from "@/utils/socket"

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
 const [onlineTechnicians, setOnlineTechnicians] = useState<string[]>([]);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    averageResolutionTime: 0,
  })

  function isUserActive(status?: string): boolean {
    return status?.toLowerCase() === "active"
  }

  // Initialize socket connection and listen for onlineTechnicians event

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (!token) return;

    const socket = getSocket(token);

  socket.on("onlineUsers", (data) => {
  console.log("Received onlineUsers data:", data);
  if (data && Array.isArray(data.technicians)) {
    console.log("Technicians array:", data.technicians);
    const onlineTechIds = data.technicians.map((t: any) => t._id);
    console.log("Online technicians IDs:", onlineTechIds);
    setOnlineTechnicians(onlineTechIds);
  } else {
    console.warn("No technicians array found in onlineUsers data");
    setOnlineTechnicians([]);
  }
});



    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    return () => {
      socket.off("onlineUsers");
      socket.disconnect();
    };
  }, []);

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

  if (userRole === null) return null

  return (
    <RoleGuard allowedRoles={["admin", "staff"]}>
      <LayoutWithSidebar>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Technician Dashboard</h1>
          {userRole === "admin" && (
            <Link href="/settings/add-technician">
              <Button>Add Technician</Button>
            </Link>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1  xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-start">
                <Users className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">
                  {loading
                    ? "Loading..."
                    : `${onlineTechnicians.length}/${totalTechnicians}`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {loading
                  ? ""
                  : `${totalTechnicians - onlineTechnicians.length} technicians currently offline`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tickets Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">{stats.resolved}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average resolution: {stats.averageResolutionTime}h
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all-technicians">
          <TabsContent value="all-technicians">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
              <div className="p-4">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">All Technicians</h2>

                {loading ? (
                  <div className="py-8 text-center text-sm sm:text-base">Loading technicians data...</div>
                ) : error ? (
                  <div className="py-8 text-center text-red-500 text-sm sm:text-base">{error}</div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="min-w-full text-sm sm:text-base">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2 whitespace-nowrap">Tickets Assigned</th>
                          <th className="text-left p-2 whitespace-nowrap">Tickets Resolved</th>
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
                            
                            <tr key={tech._id || `tech-${index}`} className="border-b hover:bg-muted/50">
                              <td className="p-2">{tech.name}</td>
                              <td className="p-2">{tech.email}</td>
                              <td className="p-2">
                                <span
                                  className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${onlineTechnicians.includes(tech._id)
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                                >
                                  {onlineTechnicians.includes(tech._id) ? "Online" : "Offline"}
                                </span>
                              </td>
                              <td className="p-2 whitespace-nowrap">{tech.ticketsAssigned ?? 0}</td>
                              <td className="p-2 whitespace-nowrap">{tech.ticketsResolved ?? 0}</td>
                              <td className="p-2">
                                <Link href={`/technicians/${tech._id}`}>
                                  <Button size="sm" variant="outline">View</Button>
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
        </Tabs>

        <TechnicianPerformanceChart />
      </LayoutWithSidebar>
    </RoleGuard>
  )
}
