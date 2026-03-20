/**
 * BarChartWidget - Reusable bar chart.
 * Props: data, xKey, yKey, title, color, height, layout
 * layout: "horizontal" (default) or "vertical" for horizontal bars.
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function BarChartWidget({
  data,
  xKey,
  yKey,
  title,
  color = '#6366f1',
  height = 300,
  layout = 'horizontal',
}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    )
  }

  const isVertical = layout === 'vertical'

  return (
    <div>
      {title && <h3>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={isVertical ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {isVertical ? (
            <>
              <XAxis type="number" />
              <YAxis type="category" dataKey={xKey} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} />
              <YAxis />
            </>
          )}
          <Tooltip />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
