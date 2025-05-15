"use client"

import { useEffect, useState } from "react"
import LayoutWithSidebar from "@/components/layout-with-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import TicketList from "@/components/ticket-list"
import NewTicketInlineForm from "./new-inline/page"
import CreateTicketModal from "@/components/create-ticket-modal"
import { useApi } from "@/contexts/api-context"


export default function TicketsPage() {
  const [userRole, setUserRole] = useState<string>("")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all") // To handle the selected status filter
  const [sortBy, setSortBy] = useState<string>("newest") // To handle sorting
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


  // Get user role from localStorage
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
    <LayoutWithSidebar>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ticket Management</h1>
        {(userRole === "staff") && <CreateTicketModal />}
      </div>

      <Tabs defaultValue="list">


        <TabsContent value="list">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search tickets..." className="pl-8" />
            </div> */}
            <Select onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full md:w-[180px]">
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
            {/* <Select onValueChange={handleSortChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select> */}
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Tickets</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>All Tickets</CardTitle>

                  </CardHeader>
                  <CardContent>
                    <TicketList tickets={filteredTickets} loading={loading} />
                  </CardContent>
                </Card>


              </div>
            </TabsContent>

            <TabsContent value="open">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Open Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <TicketList tickets={filteredTickets.filter((ticket) => ticket.status === "open")} loading={loading} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="in-progress">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>In Progress Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <TicketList tickets={filteredTickets.filter((ticket) => ticket.status === "in-progress")} loading={loading} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resolved">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Resolved Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <TicketList tickets={filteredTickets.filter((ticket) => ticket.status === "resolved")} loading={loading} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="closed">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Closed Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <TicketList tickets={filteredTickets.filter((ticket) => ticket.status === "closed")} loading={loading} />
                </CardContent>
              </Card>
            </TabsContent>
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
