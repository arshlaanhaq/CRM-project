"use client"

import { useEffect, useState } from "react"
import LayoutWithSidebar from "@/components/layout-with-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TicketList from "@/components/ticket-list"
import NewTicketInlineForm from "./new-inline/page"
import CreateTicketModal from "@/components/create-ticket-modal"
import { useApi } from "@/contexts/api-context"
import { Search } from "lucide-react"

export default function TicketsPage() {
  const [userRole, setUserRole] = useState<string>("")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const api = useApi()

  type Ticket = {
    id: string
    title: string
    description: string
    status: "open" | "in-progress" | "resolved" | "closed"
    priority: "low" | "medium" | "high"
    createdAt: string
    updatedAt: string
  }

  useEffect(() => {
    const storedUserRole = localStorage.getItem("userRole") || ""
    setUserRole(storedUserRole)

    const fetchTickets = async () => {
      try {
        const ticketData =
          storedUserRole === "technician"
            ? await api.getMyTickets()
            : await api.getAllTickets()
        setTickets(ticketData)
      } catch (error) {
        console.error("Error fetching tickets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [api])

  const filteredTickets = tickets.filter((ticket) =>
    selectedStatus === "all" ? true : ticket.status === selectedStatus
  )

  return (
    <LayoutWithSidebar>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Ticket Management</h1>
        {userRole === "staff" && <CreateTicketModal />}
      </div>

      <Tabs defaultValue="list" className="w-full">
        

        <TabsContent value="list">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full">
            <Select onValueChange={(value) => setSelectedStatus(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tickets</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="flex flex-wrap gap-2 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>

            {/* Responsive Ticket Cards */}
            {["all", "open", "in-progress", "resolved", "closed"].map((status) => (
              <TabsContent key={status} value={status} className="w-full">
                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {status === "all"
                          ? "All Tickets"
                          : `${status.charAt(0).toUpperCase() + status.slice(1)} Tickets`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TicketList
                        tickets={
                          status === "all"
                            ? filteredTickets
                            : filteredTickets.filter((ticket) => ticket.status === status)
                        }
                        loading={loading}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {(userRole === "admin" || userRole === "staff") && (
          <TabsContent value="create">
            <NewTicketInlineForm />
          </TabsContent>
        )}
      </Tabs>
    </LayoutWithSidebar>
  )
}
