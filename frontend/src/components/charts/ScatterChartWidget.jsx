/**
 * ScatterChartWidget - Reusable scatter plot.
 * To use: pass your data array and specify which keys map to the X and Y axes.
 * Props: data, xKey, yKey, title, color, height
 */
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function ScatterChartWidget({ data, xKey, yKey, title, color = '#6366f1', height = 300 }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    )
  }

  const plotData = data.map((row) => ({ x: row[xKey], y: row[yKey], ...row }))

  return (
    <div>
      {title && <h3>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" name={xKey} />
          <YAxis dataKey="y" name={yKey} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={plotData} fill={color} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
