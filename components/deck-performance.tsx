"use client"

import { useState, useMemo } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { schemeDark2 } from "d3-scale-chromatic"

const colorScheme = schemeDark2

interface DeckPerformanceProps {
  data: {
    id: number
    name: string
    format: string
    value: number
    winRate: number
  }[]
}

export function DeckPerformance({ data }: DeckPerformanceProps) {
  const [selectedFormat, setSelectedFormat] = useState("All")

  const cleanedData = data.map((d) => ({
    ...d,
    value: Number(d.value),
    winRate: Number(d.winRate),
  }))

  const formats = useMemo(() => {
    const uniqueFormats = Array.from(new Set(data.map((d) => d.format)))
    return ["All", ...uniqueFormats]
  }, [data])

  const filteredData = useMemo(() => {
    return selectedFormat === "All"
      ? cleanedData
      : cleanedData.filter((d) => d.format === selectedFormat)
  }, [selectedFormat, cleanedData])

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-medium">
        Select Format:
        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="ml-2 border rounded px-2 py-1"
        >
          {formats.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
      </label>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorScheme[index % colorScheme.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => {
              if (name === "value") return [`${value} tournaments`, "Tournaments Played"]
              if (name === "winRate") return [`${value}%`, "Win Rate"]
              return [value, name]
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
