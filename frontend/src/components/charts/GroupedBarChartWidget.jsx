/**
 * GroupedBarChartWidget - grouped bar chart for comparing multiple numeric series per category.
 * Props:
 * - data: array of rows
 * - xKey: string (category key)
 * - series: [{ key, label, color }]
 * - title: string
 * - height: number
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function GroupedBarChartWidget({ data, xKey, series, title, height = 280 }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      {title && <h3>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

