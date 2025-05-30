"use client"
import LayoutWithSidebar from "@/components/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Ticket, Users, AlertTriangle } from "lucide-react"
import RecentTickets from "@/components/recent-tickets"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateTicketModal from "@/components/create-ticket-modal"
import TicketStatusChart from "@/components/ticket-status-chart"
import TechnicianPerformanceChart from "@/components/technician-performance-chart"
import RoleGuard from "@/components/role-guard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useApi } from "@/contexts/api-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import TicketList from "@/components/ticket-list"
import { Badge } from "@/components/ui/badge"
import { getSocket } from "@/utils/socket"


export default function StaffDashboardPage() {
  const api = useApi()
  const { getAllComplaints } = useApi()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>("")
  const [complaints, setComplaints] = useState([])
  const [complaintCount, setComplaintCount] = useState(0)
  const [onlineTechnicians, setOnlineTechnicians] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
   const [totalTechnicians, setTotalTechnicians] = useState<number>(0)
  const [error, setError] = useState("")
  const [tickets, setTickets] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    averageResolutionTime: 0,
    activeTechnicians: 0,
    totalTechnicians: 0,
    activeManagers: 0,
    totalManagers: 0,
  })
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    averageResolutionTime: 0,
  })
  type Technician = {
    id: string
    name: string
    email: string
    status?: "active" | "inactive" | string
    ticketsAssigned?: number
    ticketsResolved?: number
  }
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  useEffect(() => {
    const storedUserRole = localStorage.getItem("userRole") || ""
    setUserRole(storedUserRole)

    // Redirect technicians to their dashboard
    if (storedUserRole === "technician") {
      router.push("/technician-dashboard")
    }

    // Fetch analytics data
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAnalyticsSummary()
        setAnalytics(data)
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [router, api])


  useEffect(() => {
  const token = localStorage.getItem("token") || "";
  if (!token) return;

  const socket = getSocket(token);

  
 const handleOnlineUsers = (data: any) => {
  // console.log("Online users data received:", data);
      if (Array.isArray(data)) {
        const technicianList = data.filter((u) => u.role === "technician");

        setOnlineTechnicians(technicianList.map((u) => u._id));

      } else if (typeof data === "object" && data !== null) {
        
        const technicianList = Array.isArray(data.technicians) ? data.technicians : [];
    
        setOnlineTechnicians(technicianList.map((u) => u._id));

      } else {
        console.error("Invalid onlineUsers data:", data);
      }
      setLoading(false);
    };



  socket.on("onlineUsers", handleOnlineUsers);

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  return () => {
    socket.off("onlineUsers", handleOnlineUsers);
    socket.disconnect();
  };
}, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tickets assigned to the technician
        const ticketData = await api.getMyTickets()
        setTickets(ticketData)

        // Calculate stats
        const assigned = ticketData.filter((ticket: any) => ticket.status === "open").length
        const inProgress = ticketData.filter((ticket: any) => ticket.status === "in-progress").length
        const resolved = ticketData.filter((ticket: any) => ticket.status === "resolved").length

        setStats({
          assigned,
          inProgress,
          resolved,
          averageResolutionTime: 2.5, // This would come from the API in a real implementation
        })
      } catch (error) {
        console.error("Error fetching technician data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [api])
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true)
        const data = await getAllComplaints() // API call to fetch complaints
        setComplaints(data)
        setComplaintCount(data.length) // Set total number of complaints here
      } catch (err) {
        console.error("Error fetching complaints:", err)
        setError("Failed to load complaints. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchComplaints()
  }, [])
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Open
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            In Progress
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Resolved
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tickets assigned to the technician
        const ticketData = await api.getAllTickets()
        setTickets(ticketData)

        // Calculate stats
        const assigned = ticketData.filter((ticket: any) => ticket.status === "open").length
        const inProgress = ticketData.filter((ticket: any) => ticket.status === "in-progress").length
        const resolved = ticketData.filter((ticket: any) => ticket.status === "resolved").length

        setStats({
          assigned,
          inProgress,
          resolved,
          averageResolutionTime: 2.5, // This would come from the API in a real implementation
        })
      } catch (error) {
        console.error("Error fetching technician data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [api])
  useEffect(() => {
    const storedUserRole = localStorage.getItem("userRole") || ""
    setUserRole(storedUserRole)

    const fetchTickets = async () => {
      try {
        let ticketData
        if (storedUserRole === "technician") {
          ticketData = await api.getMyTickets()
        } else {
          ticketData = await api.getAllTickets() // will now send token
        }
        setTickets(ticketData)
      } catch (error) {
        console.error("Error fetching tickets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [api])
  const filteredTickets = tickets.filter((ticket) => {
    if (selectedStatus === "all") return true
    return ticket.status === selectedStatus
  })

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }
  return (
    <RoleGuard allowedRoles={["staff", "admin"]}>
      <LayoutWithSidebar>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <CreateTicketModal />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Ticket className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{analytics.openTickets}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.totalTickets > 0
                  ? `${Math.round((analytics.openTickets / analytics.totalTickets) * 100)}% of total tickets`
                  : "No tickets yet"}
              </p>
            </CardContent>
          </Card>

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
                    : `${onlineTechnicians.length}/${analytics.totalTechnicians}`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {!loading && totalTechnicians != null
                  ? `${analytics.totalTechnicians - onlineTechnicians.length} technicians currently offline`
                  : null}

              </p>
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">New Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{complaintCount}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="mb-6">
          {/* <TabsList>
            <TabsTrigger value="overview">Tickets</TabsTrigger>

          </TabsList> */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Tickets</CardTitle>
                  <CardDescription>Latest customer support tickets</CardDescription>
                </CardHeader>
                <CardContent>
                  <TicketList tickets={filteredTickets} loading={loading} />
                </CardContent>
              </Card>

              <TicketStatusChart />
            </div>
          </TabsContent>
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TechnicianPerformanceChart />
              <Card>
                <CardHeader>
                  <CardTitle>Customer Feedback</CardTitle>
                  <CardDescription>Recent customer ratings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">John Smith</h3>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${star <= 4 ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "The technician was very professional and fixed our solar panel issue quickly."
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Ticket #TKT-001 • 2 days ago</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Sarah Johnson</h3>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${star <= 5 ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Excellent service! The installation was done perfectly and the team was very helpful."
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Ticket #TKT-002 • 3 days ago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent> */}
          {/* <TabsContent value="technicians">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technician Performance</CardTitle>
                  <CardDescription>Current workload and efficiency metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Technician
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Assigned Tickets
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Resolved Today
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Avg. Resolution Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                AJ
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium">Alex Johnson</div>
                                <div className="text-sm text-muted-foreground">Team A</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">3</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">2</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">2.5h</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Online
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href="/technicians/alex-johnson">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                DK
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium">David Kim</div>
                                <div className="text-sm text-muted-foreground">Team B</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">4</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">3</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">3.2h</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Online
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href="/technicians/david-kim">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                JR
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium">Jessica Rodriguez</div>
                                <div className="text-sm text-muted-foreground">Team A</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">2</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">1</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">4.0h</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Busy
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href="/technicians/jessica-rodriguez">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link href="/technician-reports">
                      <Button>View Full Reports</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent> */}
          {/* <TabsContent value="customers">
    </TabsContent> */}
        </Tabs>
      </LayoutWithSidebar>
    </RoleGuard>
  )
}
