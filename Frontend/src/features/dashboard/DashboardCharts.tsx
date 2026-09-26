import type { ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { labelOf, sifLabel } from '@/constants/labels'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { buildMetrics } from '@/lib/metrics'

const tooltipStyle = {
  border: '1px solid #e1e5ea',
  borderRadius: 4,
  fontSize: 12,
  boxShadow: 'none',
}

const axis = { fontSize: 11, fill: '#5e6b7c' }

type Metrics = ReturnType<typeof buildMetrics>

function ChartFrame({ children, empty }: { children: ReactNode; empty: boolean }) {
  if (empty) return <p className="panel-note">No points to plot.</p>
  return <div className="chart-box">{children}</div>
}

export function DashboardCharts({ metrics }: { metrics: Metrics }) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const animation = !reduceMotion
  const sif = metrics.sif.map((item) => ({ name: sifLabel[item.key] ?? item.key, count: item.count }))
  const barriers = metrics.barriers.map((item) => ({ name: labelOf(item.key), count: item.count }))

  return (
    <>
      <div className="grid-2">
        <section className="panel">
          <header className="panel-header">
            <div>
              <h2>Reporting volume</h2>
              <p>Archive totals by month. August and September follow the current register.</p>
            </div>
          </header>
          <ChartFrame empty={!metrics.monthly.length}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e1e5ea" vertical={false} />
                <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} interval={0} angle={-40} textAnchor="end" height={54} />
                <YAxis tick={axis} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="reports" name="Reports" fill="#1e4f86" radius={[2, 2, 0, 0]} isAnimationActive={animation} />
                <Bar dataKey="high" name="High SIF" fill="#a3262a" radius={[2, 2, 0, 0]} isAnimationActive={animation} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </section>
        <section className="panel">
          <header className="panel-header">
            <div>
              <h2>SIF potential</h2>
              <p>Rule results in the current register. Not accident probability.</p>
            </div>
          </header>
          <ChartFrame empty={!sif.some((item) => item.count)}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sif} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e1e5ea" vertical={false} />
                <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Reports" fill="#1e4f86" radius={[2, 2, 0, 0]} isAnimationActive={animation} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </section>
      </div>
      <div className="grid-2">
        <section className="panel">
          <header className="panel-header">
            <div>
              <h2>Hazard categories</h2>
              <p>Reports in the register, grouped by hazard category.</p>
            </div>
          </header>
          <ChartFrame empty={!metrics.hazards.length}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.hazards} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#e1e5ea" horizontal={false} />
                <XAxis type="number" tick={axis} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={axis} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Reports" fill="#1e4f86" barSize={12} radius={[0, 2, 2, 0]} isAnimationActive={animation} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </section>
        <section className="panel">
          <header className="panel-header">
            <div>
              <h2>Barrier status</h2>
              <p>Current condition of controls in the barrier register.</p>
            </div>
          </header>
          <ChartFrame empty={!barriers.some((item) => item.count)}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barriers} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e1e5ea" vertical={false} />
                <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={axis} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Barriers" fill="#8a5a08" radius={[2, 2, 0, 0]} isAnimationActive={animation} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </section>
      </div>
    </>
  )
}
