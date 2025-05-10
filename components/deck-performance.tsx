"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface DeckPerformanceProps {
  data: {
    id: number
    name: string
    value: number
    winRate: number
  }[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF5733"]

export function DeckPerformance({ data }: DeckPerformanceProps) {
  const cleanedData = data.map((d) => ({
    ...d,
    value: Number(d.value),
    winRate: Number(d.winRate),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>

        <Pie
          data={cleanedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        
        <Tooltip
          formatter={(value, name, props) => {
            if (name === "value") return [`${value} tournaments`, "Tournaments Played"]
            if (name === "winRate") return [`${value}%`, "Win Rate"]
            return [value, name]
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
