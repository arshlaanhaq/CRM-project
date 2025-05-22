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

  const handleDelete = async () => {
    // Show an alert (toast) before asking for confirmation
    toast.info(
      <div>
        <p>Are you sure you want to delete this Staff?</p>
        <div className="mt-2">
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
            className="bg-red-600 text-white px-4 py-2 mr-2 rounded"
          >
            Confirm Deletion
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>,

      {
        // Keep the toast open until manually closed
        closeOnClick: false, // Prevent closing the toast on click
        position: "top-center", // Set the position of the toast
      }
    );
  };

  if (error) {
    return <div>{error}</div>
  }

  if (!staff) {
    return <div className="flex items-center justify-center h-screen" >Loading...</div>
  }

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
              <CardDescription className="flex items-center mt-1">
                {staff.role}
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
