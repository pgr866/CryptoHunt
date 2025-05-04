'use client'
import { LineChart, Line, YAxis } from 'recharts'

export function MiniChart({ data }: { data: number[] }) {
  const chartData = data.map((price, index) => ({ index, price }))
  const isDown = data[0] > data[data.length - 1]
  const strokeColor = isDown ? '#ef4444' : '#22c55e'

  return (
    <LineChart width={100} height={40} data={chartData}>
      <YAxis domain={['dataMin', 'dataMax']} hide type="number" />
      <Line
        type="monotone"
        dataKey="price"
        stroke={strokeColor}
        dot={false}
        strokeWidth={2}
      />
    </LineChart>
  )
}
