/**
 * ScatterByCategoryChart - scatter plot colored by a categorical field.
 * Props:
 * - data: array of rows
 * - xKey, yKey: numeric keys
 * - categoryKey: string
 * - categories: [{ value, label, color }]
 * - title: string
 * - height: number
 */
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function ScatterByCategoryChart({
  data,
  xKey,
  yKey,
  categoryKey,
  categories,
  title,
  height = 280,
}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    )
  }

  const groups = categories.map((c) => ({
    ...c,
    points: data
      .filter((row) => row[categoryKey] === c.value)
      .map((row) => ({
        x: row[xKey],
        y: row[yKey],
        category: row[categoryKey],
      })),
  }))

  return (
    <div>
      {title && <h3>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" name={xKey} />
          <YAxis dataKey="y" name={yKey} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          {groups.map((group) => (
            <Scatter
              key={group.value}
              name={group.label}
              data={group.points}
              fill={group.color}
              shape="circle"
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

