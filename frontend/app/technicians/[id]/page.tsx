"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useApi } from "@/contexts/api-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2 } from "lucide-react"
import {
  ArrowLeft,
  Mail,
  Phone,
  Star,
  Wrench,
  Globe,
  MapPin,
  Map,
  Building2,
  CheckCircle,
  Clock,
} from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { formatDistanceToNow } from "date-fns"
import { toast } from "react-toastify";

interface TechnicianDetails {
  technician: {
    id: string
    name: string
    email: string
    phone: string
    avatar?: string
    team?: string
    status?: string
    address?: string
    city?: string
    state?: string
    country?: string
    ticketsAssigned: number
    ticketsResolved: number
    workload: number
  }
  assignedTickets: {
    id: string
    title: string
    status: string
    createdAt: string
  }[]
  history: {
    status: string;
    updatedBy?: string;
    updatedAt: string;
    _id: string;
  }[];
}

export default function TechnicianDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { deleteUser } = useApi()
  const api = useApi()
  const [technicianDetails, setTechnicianDetails] = useState<TechnicianDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTechnicianDetails = async () => {
      try {
        const { technician, assignedTickets } = await api.getTechnicianById(params.id as string)
        setTechnicianDetails({ technician, assignedTickets })
      } catch (error) {
        console.error("Error fetching technician details:", error)
        toast({
          title: "Error",
          description: "Failed to load technician details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchTechnicianDetails()
  }, [params.id, api])
  const handleDelete = async () => {
    // Show an alert (toast) before asking for confirmation
    toast.info(
      <div className="text-center p-4">
    <h3 className="text-lg font-semibold text-gray-900">
      Delete Technician?
    </h3>
    <p className="text-sm text-gray-600 mt-5">
      This action cannot be undone. Are you sure you want to proceed?
    </p>
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={async () => {
              try {
                await deleteUser(technician._id);
                toast.success("Technician deleted successfully");
                router.push("/technicians"); // Redirect to technician list or another page
              } catch (error) {
                toast.error("Failed to delete technician");
              }
              toast.dismiss()
            }}
             className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md text-sm font-medium transition"
          >
            Confirm Deletion
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
    bodyClassName: "p-0", // remove internal body padding
      }
    );
  };

  const formatStatus = (status?: string) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"


  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Loading technician details...</h1>
        </div>
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded-md w-1/3"></div>
              <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded-md w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded-md w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!technicianDetails?.technician) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Technician not found</h1>
        </div>
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <p>The requested technician could not be found.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/technicians")}>Return to Technicians List</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const { technician, assignedTickets } = technicianDetails

  // Calculate total assigned and resolved tickets
  const assignedCount = assignedTickets.length
  const resolvedCount = assignedTickets.filter(ticket => ticket.status === "resolved").length
  const inProgressCount = assignedTickets.filter(ticket => ticket.status === "in-progress").length

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-6">
        {/* Back Button and Heading */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Technician Details</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={handleDelete}
            className="bg-red-600 text-white w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Technician
          </Button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {technician.avatar ? (
                  <img src={technician.avatar} alt={technician.name} className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <Wrench className="h-12 w-12 text-primary" />
                )}
              </div>
              <CardTitle>{technician.name}</CardTitle>
              <CardDescription className="mt-1">{technician.team}</CardDescription>
              <div className="mt-2 flex items-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${technician.status === "online"
                    ? "bg-green-100 text-green-800"
                    : technician.status === "busy"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                    }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full mr-1 ${technician.status === "online"
                      ? "bg-green-400"
                      : technician.status === "busy"
                        ? "bg-yellow-400"
                        : "bg-gray-400"
                      }`}
                  ></span>
                  {formatStatus(technician.status)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{technician.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{technician.phone}</span>
                  </div>
                  {technician.city && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{technician.city}, {technician.state}</span>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Address</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center"><Map className="h-4 w-4 mr-2" />{technician.address}</div>
                  <div className="flex items-center"><Building2 className="h-4 w-4 mr-2" />{technician.city}, {technician.state}</div>
                  <div className="flex items-center"><Globe className="h-4 w-4 mr-2" />{technician.country}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{assignedCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Tickets Assigned</div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{resolvedCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Tickets Resolved</div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{inProgressCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Resolution Rate</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {technicianDetails?.assignedTickets
                  ?.filter((ticket) => ticket.status?.toLowerCase() !== "open") // Exclude open tickets
                  .flatMap((ticket) => {
                    // Sort ticket history by updatedAt (most recent first)
                    const sortedHistory = ticket.history
                      ?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

                    // Map the sorted history
                    return sortedHistory?.map((entry) => {
                      const status = entry.status?.toLowerCase()

                      const icon =
                        status === "resolved" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : status === "in-progress" ? (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Star className="h-5 w-5 text-blue-500" />
                        )

                      return (
                        <div className="flex items-start" key={entry._id}>
                          <div className="mr-4 mt-1">{icon}</div>
                          <div>
                            <p className="text-sm font-medium">
                              {entry.status?.charAt(0).toUpperCase() + entry.status?.slice(1)} –{" "}
                              <span className="font-normal">{ticket.title}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      )
                    }) ?? []
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
