"use client"

import { useState, useEffect } from "react"
import LayoutWithSidebar from "@/components/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import RoleGuard from "@/components/role-guard"
import { useApi } from "@/contexts/api-context"
import TicketList from "@/components/ticket-list"

export default function TechnicianDashboardPage() {
  const api = useApi()
  const [tickets, setTickets] = useState<any[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  // const [sortBy, setSortBy] = useState<string>("newest") 
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    averageResolutionTime: 0,
  })

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
   const formattedId = `#TKT-${String(Math.floor(Math.random() * 10)).padStart(3, "0")}`;

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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Urgent</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleResolveTicket = async (id: string) => {
    try {
     const result=  await api.resolveTicket(id)
      // Refresh tickets after resolving
       console.log("Ticket resolved:", result);
      const updatedTickets = await api.getMyTickets()
      setTickets(updatedTickets)
    } catch (error) {
      console.error("Error resolving ticket:", error.response?.data || error.message);
    }
  }
  const filteredTickets = tickets.filter((ticket) => {
    if (selectedStatus === "all") return true
    return ticket.status === selectedStatus
  })

  return (
    <RoleGuard allowedRoles={["technician", "admin", "staff"]}>
      <LayoutWithSidebar>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Technician Dashboard</h1>
          <p className="text-muted-foreground">Manage your assigned tickets and track your performance</p>
        </div>

        <div className="grid grid-cols-1  xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Assigned Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">{stats.assigned}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Waiting for your action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-2xl font-bold">{stats.inProgress}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently working on</p>
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
        </div>

        <Tabs defaultValue="assigned" className="mb-6">
          <TabsList>
            <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value="assigned">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Tickets</CardTitle>
                  <CardDescription>Latest customer support tickets</CardDescription>
                </CardHeader>
                <CardContent>
                  <TicketList tickets={filteredTickets} loading={loading} />
                </CardContent>
              </Card>


            </div>

          </TabsContent>

          <TabsContent value="in-progress">
            <Card>
              <CardHeader>
                <CardTitle>In Progress Tickets</CardTitle>
                <CardDescription>Tickets you are currently working on</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : tickets.filter((ticket) => ticket.status === "in-progress").length === 0 ? 
                
                (
                  <p className="text-center py-8 text-muted-foreground">No in-progress tickets found.</p>
                ) : (
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Started
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        {tickets
                          .filter((ticket) => ticket.status === "in-progress")
                          
                          .map((ticket) => (
                            <tr key={ticket.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formattedId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{ticket.subject}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{ticket.customer.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {getPriorityBadge(ticket.priority)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {new Date(ticket.updatedAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex space-x-2">
                                  <Link href={`/tickets/${ticket.id}`}>
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                  </Link>
                                  <Button variant="default" size="sm" onClick={() => handleResolveTicket(ticket.id)}>
                                    Mark Resolved
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved">
            <Card>
              <CardHeader>
                <CardTitle>Resolved Tickets</CardTitle>
                <CardDescription>Tickets you have successfully resolved</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : tickets.filter((ticket) => ticket.status === "resolved").length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No resolved tickets found.</p>
                ) : (
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Resolved
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        {tickets
                          ?.filter((ticket) => ticket.status === "resolved")
                          .map((ticket) => (
                            <tr key={ticket.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formattedId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{ticket.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{ticket.customer?.name || "N/A"}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {getPriorityBadge(ticket.priority)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString() : "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Link href={`/tickets/${ticket.id}`}>
                                  <Button variant="outline" size="sm">View</Button>
                                </Link>
                              </td>
                            </tr>
                          ))}

                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* <Card>
          <CardHeader>
            <CardTitle>Your Performance</CardTitle>
            <CardDescription>Track your ticket resolution metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-md">
                <div className="text-sm font-medium text-muted-foreground">Average Resolution Time</div>
                <div className="text-2xl font-bold mt-2">{stats.averageResolutionTime}h</div>
                <div className="text-xs text-green-600 mt-1">5% better than team average</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm font-medium text-muted-foreground">Tickets Resolved This Week</div>
                <div className="text-2xl font-bold mt-2">{stats.resolved}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Out of {stats.assigned + stats.inProgress + stats.resolved} assigned
                </div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm font-medium text-muted-foreground">Customer Satisfaction</div>
                <div className="text-2xl font-bold mt-2">4.8/5</div>
                <div className="text-xs text-green-600 mt-1">Based on 12 ratings</div>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </LayoutWithSidebar>
    </RoleGuard>
  )
}
