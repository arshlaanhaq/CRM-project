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
  const { getTicketsPerTechnician, getAllTickets } = useApi()
  const [data, setData] = useState<TechnicianPerformance[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignedStats, allTickets] = await Promise.all([
          getTicketsPerTechnician(),
          getAllTickets(),
        ])

        const resolvedMap: Record<string, number> = {}

        // Count resolved tickets per technician
        allTickets.forEach((ticket: any) => {
          const technician = ticket.assignedTo
          const status = ticket.status?.toLowerCase()

          if (
            technician &&
            (status === "resolved" || status === "closed")
          ) {
            resolvedMap[technician] = (resolvedMap[technician] || 0) + 1
          }
        })

        // Merge assigned and resolved
        const combined: TechnicianPerformance[] = assignedStats.map(
          (item: any) => ({
            name: item.technicianName,
            assigned: item.ticketCount,
            resolved: resolvedMap[item.technicianName] || 0,
          })
        )

        setData(combined)
      } catch (error) {
        console.error("Error loading technician performance:", error)
      }
    }

    fetchData()
  }, [getTicketsPerTechnician, getAllTickets])

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
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
