"use client"
import { exportToExcel } from "@/utils/exportToExcel"
import { useState, useEffect } from "react"
import LayoutWithSidebar from "@/components/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon, Download, BarChart2, PieChart, LineChart } from "lucide-react"
import TicketStatusChart from "@/components/ticket-status-chart"
import { cn } from "@/lib/utils"
import RoleGuard from "@/components/role-guard"
import { useApi } from "@/contexts/api-context"
import { Badge } from "@/components/ui/badge"
import TechnicianPerformanceChart from "@/components/technician-performance-chart"
interface ReportParams {
  from?: string;
  to?: string;
  technicianId?: string;
}
interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  history: {
    status: string;
    updatedBy?: string;
    updatedAt: string;
    _id: string;
  }[];
}

export default function ReportsPage() {
  const api = useApi()
  const [page, setPage] = useState(1);
  const ticketsPerPage = 10;
  const [loading, setLoading] = useState(true)
  const [clicked, setClicked] = useState(false); // track if clicked once
  const [reportType, setReportType] = useState("tickets")
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [error, setError] = useState<string>("")
  const [hasGenerated, setHasGenerated] = useState(false);
  const [status, setStatus] = useState("all")
  const [technician, setTechnician] = useState("all")
  const [reportData, setReportData] = useState<{ tickets: Ticket[]; total: number } | null>(null)
  const [technicians, setTechnicians] = useState<any[]>([])
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [staff, setStaff] = useState<any[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState("all")
  // Calculate the indexes for slicing tickets to show
  const indexOfLastTicket = page * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = reportData?.tickets.slice(indexOfFirstTicket, indexOfLastTicket) || [];

  const totalPages = Math.ceil((reportData?.tickets.length || 0) / ticketsPerPage);

  const { getReports, getAnalyticsSummary, getTechnicians, getStaff } = useApi()

  const [type, setType] = useState<ReportParams>()

  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined)
  const [range, setRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true)
        const data = await getStaff()
        setStaff(data)
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



  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const techData = await api.getTechnicians()

        setTechnicians(techData)
      } catch (error) {
        console.error("Error fetching technicians:", error)
      }
    }

    fetchTechnicians()
  }, [api])

  const handleGenerateReport = async () => {
    setClicked(true)
    setLoading(true)

    // Save filters to state if needed
    setType({ technicianId: technician !== "all" ? technician : undefined })
    setRange(dateRange)

    try {
      const params: ReportParams = {
        from: dateRange.from.toISOString().split("T")[0],
        to: dateRange.to.toISOString().split("T")[0],
      }

      if (status !== "all") params.status = status
      if (technician !== "all") params.assignedTo = technician
      if (selectedStaffId !== "all") params.createdBy = selectedStaffId

      const response = await getReports(params)
      console.log(response)
      setReportData(response)
    } catch (error) {
      console.error("Failed to fetch reports", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (Array.isArray(reportData.tickets) && reportData.tickets.length > 0) {
      const simplifiedData = reportData.tickets.map((ticket: any) => ({
        Title: ticket.title,
        Customer: ticket.customer?.name || "N/A",
        "Assigned To": ticket.assignedTo?.name || "Unassigned",
        Status: ticket.status,
        Priority: ticket.priority,
        "Created At": new Date(ticket.createdAt).toLocaleString(), // format as needed
        "Created By": ticket.createdBy?.name || "N/A", // created by
      }))

      exportToExcel(simplifiedData, "report.xlsx")
    } else {
      console.error("Invalid reportData structure", reportData)
    }
  }



  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getAnalyticsSummary()
        setSummary(data)
      } catch (error) {
        console.error("Error fetching analytics summary", error)
      }
    }

    fetchSummary()
  }, [getAnalyticsSummary])
  const downloadReport = () => {
    // In a real app, this would generate a CSV or PDF
    alert("Report download functionality would be implemented here")
  }
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
  return (
    <RoleGuard allowedRoles={["admin", "staff"]}>
      <LayoutWithSidebar>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and analyze system reports</p>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
            <CardDescription>Configure the parameters for your report</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {/* Report Type */}
              <div className="space-y-2 ">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tickets">Ticket Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2 ">
                <label className="text-sm font-medium">Date Range</label>
                <div className="grid gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) =>
                          setDateRange(range || { from: new Date(), to: new Date() })
                        }
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2 space-x-6">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Technician */}
              <div className="space-y-2 space-x-4">
                <label className="text-sm font-medium">Technician</label>
                <Select value={technician} onValueChange={setTechnician}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Technicians</SelectItem>
                    {technicians.map((tech) => (
                      <SelectItem key={tech._id} value={tech._id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ticket by Staff */}
              <div className="space-y-2 space-x-3">
                <label className="text-sm font-medium">Ticket by Staff</label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>


            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleDownload}
                loading={loading}
              >
                Download Report
              </Button>

              <Button onClick={handleGenerateReport} loading={loading}>
                {!clicked ? "Generate Report" : (loading ? "Generating..." : "Generate Report")}
              </Button>
            </div>
          </CardContent>
        </Card>


        {reportData && (
          <Tabs defaultValue="table" className="mb-6">
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Report</CardTitle>
                  <CardDescription>Showing {reportData?.total || 0} tickets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-x-auto grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6 ">
                    <table className="min-w-[600px] w-full table-auto text-sm">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="p-2">Title</th>
                          <th className="p-2">Customer</th>
                          <th className="p-2">Assigned To</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Priority</th>
                          <th className="p-2">Created At</th>
                          <th className="p-2">Created by</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTickets.map((ticket) => (
                          <tr key={ticket._id} className="border-b hover:bg-muted/50">
                            <td className="p-2 max-w-[200px] truncate">{ticket.title}</td>
                            <td className="p-2">{ticket.customer.name}</td>
                            <td className="p-2">{ticket.assignedTo?.name || "Unassigned"}</td>
                            <td className="p-2">{getStatusBadge(ticket.status)}</td>
                            <td className="p-2">{getPriorityBadge(ticket.priority)}</td>
                            <td className="p-2">{format(new Date(ticket.createdAt), "PPpp")}</td>
                            <td className="p-2">{ticket.createdBy?.name || "Not found"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex justify-center items-center gap-6 mt-6">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200
      ${page === 1 ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}
    `}
                      aria-label="Previous Page"
                    >
                      &larr; Prev
                    </button>

                    <div className="text-gray-700 font-medium">
                      Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
                    </div>

                    <button
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200
      ${page === totalPages ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}
    `}
                      aria-label="Next Page"
                    >
                      Next &rarr;
                    </button>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chart">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TicketStatusChart />
                <TechnicianPerformanceChart />
              </div>
            </TabsContent>


            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Report Summary</CardTitle>
                  <CardDescription>Key metrics and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground">Total Tickets</div>
                      <div className="text-2xl font-bold mt-2">{summary?.totalTickets ?? 0}</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground">Open Tickets</div>
                      <div className="text-2xl font-bold mt-2">{summary?.openTickets ?? 0}</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground">In Progress</div>
                      <div className="text-2xl font-bold mt-2">{summary?.inProgressTickets ?? 0}</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground">Closed Tickets</div>
                      <div className="text-2xl font-bold mt-2">{summary?.closedTickets ?? 0}</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground">Total Technicians</div>
                      <div className="text-2xl font-bold mt-2">{summary?.totalTechnicians ?? 0}</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground">Total Staff</div>
                      <div className="text-2xl font-bold mt-2">{summary?.totalStaff ?? 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!reportData && !loading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Report Data</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Configure the report parameters above and click "Generate Report" to view your data.
              </p>
            </CardContent>
          </Card>
        )}
      </LayoutWithSidebar>
    </RoleGuard>
  )
}
