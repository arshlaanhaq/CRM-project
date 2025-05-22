"use client"

import { useEffect, useState } from "react"
import { useApi } from "@/contexts/api-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface TechnicianPerformance {
  name: string
  assigned: number
  resolved: number
}

export default function TechnicianPerformanceChart({
  title = "Technician Performance",
  description = "Tickets assigned and resolved per technician",
}: {
  title?: string
  description?: string
}) {
  const { getAllTickets } = useApi()
  const [data, setData] = useState<TechnicianPerformance[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketData = await getAllTickets()

        const technicianMap: Record<string, TechnicianPerformance> = {}

        ticketData.forEach((ticket: any) => {
          const tech = ticket.assignedTo
          if (tech && tech.name) {
            if (!technicianMap[tech.name]) {
              technicianMap[tech.name] = {
                name: tech.name,
                assigned: 0,
                resolved: 0,
              }
            }

            technicianMap[tech.name].assigned += 1

            if (
              ticket.status === "resolved" ||
              ticket.status === "closed"
            ) {
              technicianMap[tech.name].resolved += 1
            }
          }
        })

        setData(Object.values(technicianMap))
      } catch (error) {
        console.error("Error loading technician performance:", error)
      }
    }

    fetchData()
  }, [getAllTickets])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 50, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="assigned" name="Tickets Assigned" fill="#3b82f6" />
              <Bar dataKey="resolved" name="Tickets Resolved" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
