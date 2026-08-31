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
          {chartData.map((entry, index) => {
            const COLORS = [
              'var(--chart-1, #162D59)', 
              'var(--chart-2, #A65E44)', 
              'var(--chart-3, #F2D3AC)', 
              'var(--chart-4, #64748b)', 
              'var(--chart-5, #0511F2)',
              '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
            ];
            return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          })}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px", color: "var(--foreground)" }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          wrapperStyle={{ fontSize: '12px' }}
          formatter={(value) => <span style={{ color: '#475569', fontWeight: 500 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
