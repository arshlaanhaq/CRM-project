"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import LayoutWithSidebar from "@/components/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Ticket, Users, UserCog, BarChart2, AlertTriangle } from "lucide-react"
import RecentTickets from "@/components/recent-tickets"
import NewTicketInlineForm from "../tickets/new-inline/page"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateTicketModal from "@/components/create-ticket-modal"
import TicketStatusChart from "@/components/ticket-status-chart"
import TechnicianPerformanceChart from "@/components/technician-performance-chart"
import RoleGuard from "@/components/role-guard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/contexts/api-context"
import TicketList from "@/components/ticket-list"

export default function DashboardPage() {
  const router = useRouter()
  const api = useApi()
  const [tickets, setTickets] = useState<any[]>([])
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    averageResolutionTime: 0,
  })
  const [userRole, setUserRole] = useState<string>("")
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
  type Technician = {
    id: string
    name: string
    email: string
    status?: "active" | "inactive" | string
    ticketsAssigned?: number
    ticketsResolved?: number
  }
  const { getStaff, getAllComplaints } = useApi()
  const [staff, setStaff] = useState<any[]>([])  // Corrected type for staff state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeStaff, setActiveStaff] = useState(0)
  const [totalStaff, setTotalStaff] = useState(0)
  const { getTechnicians } = useApi()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [activeTechnicians, setActiveTechnicians] = useState<number>(0)
  const [totalTechnicians, setTotalTechnicians] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>("newest")
  const [selectedStatus, setSelectedStatus] = useState<string>("all") // To handle the selected status filter
  const [complaints, setComplaints] = useState([])
  const [complaintCount, setComplaintCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true)
        const data = await getStaff()
        setStaff(data)

        // Calculate active staff (this is a placeholder - you might have a status field in your actual data)
        // const active = data.filter((s) => s.status === "active" || !s.status).length
        // setActiveStaff(active)
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

  // Get user role from localStorage and fetch analytics
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

  // Only admins should see this page
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <LayoutWithSidebar>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          {/* <CreateTicketModal /> */}
        </div>

        <div className="grid grid-cols-1  xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
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
              <div className="flex items-center">
                <Users className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">
                  {analytics?.activeTechnicians ?? 0}/{analytics?.totalTechnicians ?? 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {(analytics?.totalTechnicians ?? 0) - (analytics?.activeTechnicians ?? 0)} technicians currently offline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UserCog className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{loading ? "Loading..." : `${activeStaff}/${totalStaff}`}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {loading ? "" : `${totalStaff - activeStaff} staff members currently offline`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
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
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
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
            <TabsTrigger value="overview">Overview</TabsTrigger>

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* <TechnicianPerformanceChart /> */}
            </div>

            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResolutionTimeChart />
              <Card>
                <CardHeader>
                  <CardTitle>Customer Satisfaction</CardTitle>
                  <CardDescription>Rating trends over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
                  <p className="text-muted-foreground">Customer satisfaction chart would appear here</p>
                </CardContent>
              </Card>
            </div> */}
          </TabsContent>
          <TabsContent value="managers">
            <Card>
              <CardHeader>
                <CardTitle>Manager Overview</CardTitle>
                <CardDescription>Performance and activity of system managers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">{loading ? "Loading..." : `${staff.length} staff members found`}</div>
                {error && <div className="text-red-500">{error}</div>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="create-ticket">
            <NewTicketInlineForm />
          </TabsContent>
        </Tabs>
      </LayoutWithSidebar>
    </RoleGuard>
  )
}
