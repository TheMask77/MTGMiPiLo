"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface OverviewProps {
  data: {
    name: string
    wins: number
    losses: number
  }[]
}

export function Overview({ data }: OverviewProps) {
  const cleanedData = data.map(d => ({
    ...d,
    wins: Number(d.wins),
    losses: Number(d.losses),
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={cleanedData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={true} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 'dataMax + 2']}/>
        <Tooltip />
        <Bar dataKey="wins" fill="#4ade80" radius={[4, 4, 0, 0]} />
        <Bar dataKey="losses" fill="#f87171" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
