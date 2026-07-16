"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

const data = [
  { name: "Chubb", value: 400 },
  { name: "Travelers", value: 300 },
  { name: "CNA", value: 300 },
  { name: "Liberty Mutual", value: 200 },
]

export function DistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
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
