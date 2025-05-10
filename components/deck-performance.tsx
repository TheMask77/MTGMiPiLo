"use client"

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { schemeDark2 } from "d3-scale-chromatic"

interface DeckPerformanceProps {
  data: {
    id: number
    name: string
    value: number
    winRate: number
  }[]
}

export function DeckPerformance({ data }: DeckPerformanceProps) {
  console.log("DeckPerformance data:", data)

  const cleanedData = data.map((d) => ({
    ...d,
    value: Number(d.value),
    winRate: Number(d.winRate),
  }))

  cleanedData.forEach((entry) => {
    if (typeof entry.name !== "string" || typeof entry.value !== "number") {
      console.warn("Invalid entry in data:", entry)
    }
  })

  // Generate colors (cycle through d3's schemeCategory10 if more are needed)
  const colors = cleanedData.map(
    (_, index) => schemeDark2[index % schemeDark2.length]
  )

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
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {cleanedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => {
            if (name === "value")
              return [`${value} tournaments`, "Tournaments Played"]
            if (name === "winRate") return [`${value}%`, "Win Rate"]
            return [value, name]
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
