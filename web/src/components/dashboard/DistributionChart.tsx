"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

export function DistributionChart({ data }: { data?: any[] }) {
  const chartData = data && data.length > 0 ? data : [
    { name: "Sin datos", value: 1 }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`var(--chart-${index + 1})`} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px", color: "var(--foreground)" }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
