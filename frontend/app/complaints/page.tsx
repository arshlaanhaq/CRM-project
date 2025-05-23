"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LayoutWithSidebar from "@/components/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, AlertTriangle, CheckCircle, Clock, Filter, Download, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import RoleGuard from "@/components/role-guard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table"
import { useApi } from "@/contexts/api-context"  // Update this import path accordingly

export interface ComplaintPayload {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  productName: string;
  serialNumber: string;
  dateOfPurchase: Date;
  issueDescription: string;
  createdAt?: Date;
  status?: 'Pending' | 'Ticket Created' | 'Closed';
  assignedTo?: string; // New field to store assigned staff member
}

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "Pending":
      return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
    case "Ticket Created":
      return <Badge className="bg-yellow-100 text-yellow-800">Ticket Created</Badge>;
    case "Closed":
      return <Badge className="bg-green-100 text-green-800">Closed</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function ComplaintsPage() {
  const router = useRouter()
  const { getAllComplaints } = useApi()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [complaints, setComplaints] = useState<ComplaintPayload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch complaints using getAllComplaints API
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true)
        const data = await getAllComplaints() // Pass necessary data if required
        setComplaints(data)
      } catch (err) {
        console.error("Error fetching complaints:", err)
        setError("Failed to load complaints. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchComplaints()
  }, [])

  // Filter complaints based on search term and filters
  // Filter complaints based on search term and filters, and sort by createdAt
  const filteredComplaints = complaints
    .filter((complaint) => {
      const matchesSearch =
        searchTerm === "" ||
        complaint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         complaint.email?.toLowerCase().includes(searchTerm.toLowerCase())
        complaint.issueDescription.toLowerCase().includes(searchTerm.toLowerCase())
       

      const matchesStatus = statusFilter === "all" || complaint.status === statusFilter

      let matchesDate = true
      if (dateFilter === "last-week") {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        matchesDate = new Date(complaint.createdAt!) >= oneWeekAgo
      } else if (dateFilter === "last-month") {
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        matchesDate = new Date(complaint.createdAt!) >= oneMonthAgo
      }

      return matchesSearch && matchesStatus && matchesDate
    })
    .sort((a, b) => {
      // Sort complaints by createdAt in descending order (newest first)
      return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    })

  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const ticketCreatedCount = complaints.filter((c) => c.status === "Ticket Created").length;
  const closedCount = complaints.filter((c) => c.status === "Closed").length;

  const handleViewComplaint = (id: string) => {
    router.push(`/complaints/${id}`)
  }

  // const handleDeleteComplaint = async (id: string) => {
  //   if (!confirm("Are you sure you want to delete this complaint?")) return

  //   try {
  //     const response = await fetch(`/api/complaints/${id}`, {
  //       method: "DELETE",
  //     })

  //     if (!response.ok) {
  //       throw new Error("Failed to delete complaint")
  //     }

  //     setComplaints((prev) => prev.filter((c) => c._id !== id))
  //   } catch (err) {
  //     console.error("Error deleting complaint:", err)
  //     alert("Failed to delete complaint. Please try again.")
  //   }
  // }

  // const handleAssignToStaff = async (complaintId: string, staffId: string) => {
  //   try {
  //     const response = await fetch(`/api/complaints/${complaintId}/assign`, {
  //       method: "PUT",
  //       body: JSON.stringify({ assignedTo: staffId }),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     })

  //     if (!response.ok) {
  //       throw new Error("Failed to assign complaint")
  //     }

  //     const updatedComplaint = await response.json()
  //     setComplaints((prev) =>
  //       prev.map((c) =>
  //         c._id === complaintId ? { ...c, assignedTo: updatedComplaint.assignedTo } : c
  //       )
  //     )
  //   } catch (err) {
  //     console.error("Error assigning complaint:", err)
  //     alert("Failed to assign complaint. Please try again.")
  //   }
  // }

  return (
    <RoleGuard allowedRoles={["admin", "staff"]}>
      <LayoutWithSidebar>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Customer Complaints</h1>
              <p className="text-muted-foreground">Manage and resolve customer complaints</p>
            </div>

          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1  xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
            {/* <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">New Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">{ticketCreatedCount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
              </CardContent>
            </Card> */}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-2xl font-bold">{pendingCount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Being addressed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Closed Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold">{closedCount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Successfully addressed</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search complaints..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Ticket Created">Ticket Created</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Complaints Table */}
          {/* Complaints Table Section */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="p-4">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">All Complaints</h2>

              {isLoading ? (
                <div className="py-8 text-center text-sm sm:text-base">Loading complaints data...</div>
              ) : error ? (
                <div className="py-8 text-center text-red-500 text-sm sm:text-base">{error}</div>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Serial</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredComplaints.map((complaint) => (
                        <TableRow key={complaint._id}>
                          <TableCell>{complaint.name}</TableCell>
                          <TableCell>{complaint.email}</TableCell>
                          <TableCell>{complaint.productName}</TableCell>
                          <TableCell>{complaint.serialNumber}</TableCell>
                          <TableCell><StatusBadge status={complaint.status || "Pending"} /></TableCell>
                          <TableCell className="max-w-[200px] truncate">{complaint.issueDescription}</TableCell>
                          <TableCell>{formatDate(complaint.createdAt?.toString() || "")}</TableCell>
                          <TableCell className="text-right">
                           <Button variant="ghost" size="icon" onClick={() => handleViewComplaint(complaint._id!)}>
                                 view
                                </Button>
                            
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          {isLoading && <p>Loading complaints...</p>}
          {error && <p>{error}</p>}
        </div>
      </LayoutWithSidebar>
    </RoleGuard>
  )
}