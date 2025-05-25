"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
import { ArrowLeft, Trash2, UserCircle } from "lucide-react"
import { toast } from "react-toastify";
import { getSocket } from "@/utils/socket"; // make sure this is correct path


interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  role: "admin" | "staff" | "technician" | "customer";
  createdAt: string;
  updatedAt: string;
}

export default function StaffDetailsPage() {
  const { getStaffById, deleteUser } = useApi()
  const params = useParams()
  const [onlineStaffIds, setOnlineStaffIds] = useState<string[]>([])
  const [staff, setStaff] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const id = params.id as string

    if (!id) {
      setError("No staff ID found")
      return
    }

    const fetchStaff = async () => {
      try {
        const staffData = await getStaffById(id)

        setStaff(staffData)

      } catch (err) {
        setError("Failed to fetch staff details")
      }
    }

    fetchStaff()
  }, [params.id])
 useEffect(() => {
  const token = localStorage.getItem("token")
  if (!token) return

  const socket = getSocket(token)

  const handleOnlineUsers = (data: any) => {
    if (data?.staff?.length) {
      setOnlineStaffIds(data.staff.map((s: any) => s._id))
    } else {
      setOnlineStaffIds([])
    }
  }

  socket.on("onlineUsers", handleOnlineUsers)

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id)
  })

  return () => {
    socket.off("onlineUsers", handleOnlineUsers)
    socket.disconnect()
  }
}, [])


  const handleDelete = async () => {
    // Show an alert (toast) before asking for confirmation
    toast.info(
      <div className="text-center p-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Delete Staff?
        </h3>
        <p className="text-sm text-gray-600 mt-5">
          This action cannot be undone. Are you sure you want to proceed?
        </p>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={async () => {
              try {
                await deleteUser(staff._id);
                toast.success("Technician deleted successfully");
                router.push("/staff"); // Redirect to technician list or another page
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
        bodyClassName: "p-0", // remove internal body padding
      }
    );
  };

  if (error) {
    return <div>{error}</div>
  }

if (!staff) {
  return <div className="flex items-center justify-center h-screen">Loading...</div>
}

const isOnline = onlineStaffIds.includes(staff._id)

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/staff">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">Staff Details</h1>
        </div>

        <Button
          variant="destructive"
          onClick={handleDelete}
          className="w-full sm:w-auto"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Staff
        </Button>
      </div>



      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <UserCircle className="h-10 w-10 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{staff.name}</CardTitle>
              <CardDescription className="flex items-center mt-1 gap-3">
                <span className="capitalize">{staff.role}</span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${isOnline ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </CardDescription>


            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Email:</span>
                  <span>{staff.email}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Phone:</span>
                  <span>{staff.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Address:</span>
                  <span>{staff.address || "Not provided"}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">City:</span>
                  <span>{staff.city || "Not provided"}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">State:</span>
                  <span>{staff.state || "Not provided"}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Country:</span>
                  <span>{staff.country || "Not provided"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Account Info</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Role:</span>
                  <span>{staff.role}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Created:</span>
                  <span>{staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Updated:</span>
                  <span>{staff.updatedAt ? new Date(staff.updatedAt).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Access & Permissions</h3>
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm">
                This user has <strong>{staff.role}</strong> privileges.
              </p>
              <ul className="list-disc list-inside mt-2 text-sm">
                {staff.role === "admin" && (
                  <>
                    <li>Admin panel</li>
                    <li>Staff management</li>
                  </>
                )}
                {staff.role === "staff" && <li>Customer support</li>}
                {staff.role === "technician" && <li>Technical support</li>}
                {staff.role === "customer" && <li>View tickets</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
