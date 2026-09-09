"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { useLanguage } from "@/components/language-provider"

export function OverviewChart({ data }: { data?: any[] }) {
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'

  const defaultMonths = lang === 'es'
    ? ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

  const chartData = data && data.length > 0 ? data : defaultMonths.map(name => ({ name, total: 0 }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
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
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px", color: "var(--foreground)" }}
          itemStyle={{ color: "var(--chart-1)" }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="var(--chart-1)"
          strokeWidth={3}
          dot={{ r: 4, fill: "var(--chart-1)" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
