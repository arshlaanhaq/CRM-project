"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useApi } from "@/contexts/api-context"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

interface TicketListProps {
  tickets: any[] // Assuming 'tickets' is an array of ticket objects
  loading?: boolean
  status?: string
}

export default function TicketList({ tickets = [], loading = false, status }: TicketListProps) {
  const api = useApi()
  const router = useRouter()
  const { resolveTicket, closeTicket, deleteTicket, markTicketInProgress } = useApi()
  const [userRole, setUserRole] = useState("")

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    if (role) setUserRole(role)
  }, [])

 const filteredTickets = (status ? tickets.filter((ticket) => ticket.status === status) : tickets)
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open</Badge>
      case "in-progress":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>
      case "resolved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>
      case "closed":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Closed</Badge>
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
      await resolveTicket(id)
      toast.success("Ticket resolved successfully")
      router.refresh()
    } catch (error: any) {
      console.error("Error resolving ticket:", error)
      toast.error(error.response?.data?.message || "Failed to resolve ticket")
    }
  }

  const handleCloseTicket = async (id: string) => {
    try {
      await closeTicket(id)
      toast.success("Ticket closed successfully")
      router.refresh()
    } catch (error: any) {
      console.error("Close Ticket Error:", error)
      toast.error(error.response?.data?.message || "Failed to close ticket")
    }
  }

  const handleDeleteTicket = async (id: string) => {
    // Show an alert (toast) before asking for confirmation
    toast.info(
      <div className="text-center p-4">
    <h3 className="text-lg font-semibold text-gray-900">
      Delete Ticket?
    </h3>
        <p className="text-sm text-gray-600 mt-5">
      This action cannot be undone. Are you sure you want to proceed?
    </p>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={async () => {
              try {
                await deleteTicket(id);
                toast.success("Technician deleted successfully");
                router.push("/tickets"); // Redirect to technician list or another page
              } catch (error) {
                toast.error("Failed to delete technician");
              }
              toast.dismiss()
            }}
           className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md text-sm font-medium transition"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss()}
             className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-md text-sm font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
         icon: false, // 💥 this removes the icon AND space
    closeOnClick: false,
    position: "top-center",
    autoClose: false,
    draggable: false,
    className: "p-0 shadow-none bg-transparent", // optional: remove toast padding/border
    bodyClassName: "p-0",
      }
    );
  }
  const handleMarkInProgress = async (id: string) => {
    try {
      await markTicketInProgress(id)
      toast.success("Ticket marked as In Progress")
      router.refresh()
    } catch (error: any) {
      console.error("Error marking in-progress:", error)
      toast.error(error.response?.data?.message || "Failed to mark ticket in-progress")
    }
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (filteredTickets.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">No tickets found.</p>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTickets.map((ticket, index) => {
            // Generate formatted ID based on the index
            const formattedId = `#TKT-${String(index + 1).padStart(3, "0")}`;

            // Use unique identifier for the key
            const uniqueKey = ticket._id || ticket.id || `${ticket.title}-${index}`;

            return (
              <TableRow key={uniqueKey}>
                <TableCell className="font-medium">{formattedId}</TableCell>
                <TableCell className="max-w-[200px] truncate">{ticket.title}</TableCell>
                <TableCell>{ticket.customer?.name || "Unknown"}</TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                <TableCell>{ticket.assignedTo?.name || "Unassigned"}</TableCell>
                <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Link href={`/tickets/${ticket._id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {userRole === "technician" && ticket.status === "open" && (
                          <DropdownMenuItem onClick={() => handleMarkInProgress(ticket._id)}>
                            Mark In Progress
                          </DropdownMenuItem>
                        )}
                        {userRole === "technician" && ticket.status !== "resolved" && (
                          <DropdownMenuItem onClick={() => handleResolveTicket(ticket._id)}>
                            Mark as Resolved
                          </DropdownMenuItem>
                        )}
                        {/* {userRole === "technician" && ticket.status !== "in-progress" && (
                          <DropdownMenuItem onClick={() => handleResolveTicket(ticket._id)}>
                            Mark as In-Progress
                          </DropdownMenuItem>
                        )} */}
                        {userRole === "staff" && ticket.status !== "closed" && (
                          <DropdownMenuItem onClick={() => handleCloseTicket(ticket._id)}>
                            Close Ticket
                          </DropdownMenuItem>
                        )}
                        {(userRole === "admin" || userRole === "staff") && (
                          <Link href={`/tickets/${ticket._id}/assign`}>
                            <DropdownMenuItem>Assign Technician</DropdownMenuItem>
                          </Link>
                        )}
                        {(userRole === "admin" || userRole === "staff") && (
                          <Link href={`/tickets/${ticket._id}`}>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </Link>
                        )}
                        {userRole === "admin" && (
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTicket(ticket._id)}>
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
