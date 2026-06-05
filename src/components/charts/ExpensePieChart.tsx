'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface ExpensePieChartProps {
  data: Record<string, number>
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

const categoryLabels: Record<string, string> = {
  food: 'Alimentación',
  transport: 'Transporte',
  housing: 'Vivienda',
  entertainment: 'Entretenimiento',
  health: 'Salud',
  education: 'Educación',
  other: 'Otros',
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1a0d] border border-green-900/50 rounded-xl p-3 text-sm">
        <p className="font-medium" style={{ color: payload[0].payload.fill }}>
          {payload[0].name}
        </p>
        <p className="text-white">${payload[0].value.toFixed(2)}</p>
      </div>
    )
  }
  return null
}

export default function ExpensePieChart({ data }: ExpensePieChartProps) {
  const chartData = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: categoryLabels[key] || key,
      value,
    }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Sin datos de gastos
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '11px' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
