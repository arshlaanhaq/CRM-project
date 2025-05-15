"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import LayoutWithSidebar from "@/components/layout-with-sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useApi } from "@/contexts/api-context"

type Technician = {
  _id: string
  name: string
  email: string
  status?: "active" | "inactive" | string
  ticketsAssigned?: number
  ticketsResolved?: number
  avatar?: string
  initials?: string
  expertise?: string[]
  workload?: number
}

export default function AssignTicketClient() {
  const router = useRouter()
  const { id } = useParams()
  const { updateTicket, getTechnicians } = useApi()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState("")
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setLoading(true)
        const data: Technician[] = await getTechnicians()
        setTechnicians(data)
        setError("")
      } catch (err) {
        console.error("Failed to fetch technicians:", err)
        setError("Failed to load technicians. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicians()
  }, [getTechnicians])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTechnician) return
    setIsSubmitting(true)

    try {
      await updateTicket(id, { assignedTo: selectedTechnician })
      router.push(`/tickets/${id}`)
    } catch (error) {
      console.error("Error assigning ticket:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <LayoutWithSidebar>
      <div className="px-4 sm:px-6">
        <div className="flex items-center mb-4 sm:mb-6">
          <Link href={`/dashboard`}>
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">Assign Ticket #{id}</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Assign to Technician</CardTitle>
              <CardDescription>
                Select a technician to assign this ticket to
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Filter by Expertise</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All expertise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All expertise</SelectItem>
                    {/* Optional: dynamic filters */}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Available Technicians</Label>
                <RadioGroup
                  value={selectedTechnician}
                  onValueChange={setSelectedTechnician}
                >
                  {technicians.map((tech) => (
                    <div
                      key={tech._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border p-4 rounded-md"
                    >
                      <div className="flex items-start sm:items-center gap-3 flex-1">
                        <RadioGroupItem value={tech._id} id={`tech-${tech._id}`} />
                        <Label
                          htmlFor={`tech-${tech._id}`}
                          className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer"
                        >
                          <Avatar>
                            <AvatarImage
                              src={tech.avatar || "/placeholder.svg"}
                              alt={tech.name}
                            />
                            <AvatarFallback>
                              {tech.initials || tech.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <p className="font-medium">{tech.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tech.expertise?.map((skill) => (
                                <span
                                  key={skill}
                                  className="text-xs bg-muted px-2 py-0.5 rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Workload: </span>
                        <span
                          className={
                            tech.workload! > 70
                              ? "text-red-500"
                              : tech.workload! > 50
                              ? "text-yellow-500"
                              : "text-green-500"
                          }
                        >
                          {tech.workload ?? 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
              <Button
                variant="outline"
                type="button"
                className="w-full sm:w-auto"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isSubmitting || !selectedTechnician}
              >
                {isSubmitting ? "Assigning..." : "Assign Ticket"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </LayoutWithSidebar>
  )
}
