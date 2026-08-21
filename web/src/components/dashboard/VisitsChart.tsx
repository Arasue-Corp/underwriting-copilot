"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

export function VisitsChart({ visits }: { visits: any[] }) {
  // Group visits by agent (creator)
  const agentVisits: Record<string, { name: string, completed: number, pending: number, total: number }> = {}

  if (visits && visits.length > 0) {
    visits.forEach(visit => {
      const agentName = visit.creator?.name || "Unknown Agent"
      if (!agentVisits[agentName]) {
        agentVisits[agentName] = { name: agentName, completed: 0, pending: 0, total: 0 }
      }
      agentVisits[agentName].total += 1
      if (visit.status === 'COMPLETED') {
        agentVisits[agentName].completed += 1
      } else {
        agentVisits[agentName].pending += 1
      }
    })
  }

  const chartData = Object.values(agentVisits).sort((a, b) => b.total - a.total).slice(0, 5) // Top 5 agents

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground border border-dashed rounded-lg">
        No visit data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          padding={{ left: 10, right: 10 }}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px", color: "var(--foreground)" }}
          cursor={{ fill: "var(--muted)" }}
        />
        <Bar dataKey="completed" name="Completed" stackId="a" fill="var(--chart-2)" radius={[0, 0, 4, 4]} />
        <Bar dataKey="pending" name="Pending/Canceled" stackId="a" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
