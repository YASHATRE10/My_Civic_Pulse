import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { grievanceApi, feedbackApi } from '../services/api'
import { connectRealtime } from '../services/realtime'
import { useAuth } from '../context/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import { AnalyticsCharts } from '../components/charts/AnalyticsCharts'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Badge } from '../components/ui/badge'

function heatLevel(value) {
  if (value >= 20) return 'bg-rose-600 text-white'
  if (value >= 10) return 'bg-amber-500 text-black'
  if (value >= 5) return 'bg-emerald-500 text-white'
  return 'bg-slate-300 text-slate-900'
}

export function AnalyticsPage() {
  const { token } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [score, setScore] = useState(0)
  const [filters, setFilters] = useState({ from: '', to: '', category: '', zone: '' })

  const load = async () => {
    try {
      const [a, s] = await Promise.all([
        grievanceApi.analytics(filters, token),
        feedbackApi.transparencyScore(token),
      ])
      setAnalytics(a)
      setScore(s.score || 0)
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const disconnect = connectRealtime(
      () => {
        toast('Realtime grievance update received', { icon: '📡' })
        load()
      },
      () => {
        toast('Realtime feedback update received', { icon: '⭐' })
        load()
      },
    )

    return disconnect
  }, [JSON.stringify(filters)])

  const zoneDensity = useMemo(() => Object.entries(analytics?.complaintsByZone || {}), [analytics])

  return (
    <AppLayout title="Analytics & Transparency" subtitle="Charts, heatmap, SLA prediction, and realtime updates">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-5">
            <Input type="datetime-local" value={filters.from} onChange={(e) => setFilters((v) => ({ ...v, from: e.target.value }))} />
            <Input type="datetime-local" value={filters.to} onChange={(e) => setFilters((v) => ({ ...v, to: e.target.value }))} />
            <Select value={filters.category} onChange={(e) => setFilters((v) => ({ ...v, category: e.target.value }))}>
              <option value="">All Categories</option>
              {['WATER', 'STREET_LIGHT', 'ROAD', 'SANITATION', 'DRAINAGE', 'PARK', 'ELECTRICITY', 'OTHER'].map((cat) => <option key={cat}>{cat}</option>)}
            </Select>
            <Select value={filters.zone} onChange={(e) => setFilters((v) => ({ ...v, zone: e.target.value }))}>
              <option value="">All Zones</option>
              {['NORTH', 'CENTRAL', 'SOUTH'].map((zone) => <option key={zone}>{zone}</option>)}
            </Select>
            <button className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" onClick={load}>Apply</button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Public Transparency Score</CardTitle></CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-emerald-600">{score}%</p>
            <p className="text-sm text-muted-foreground">Department rating based on citizen feedback</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>SLA Breach Prediction</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(analytics?.predictedBreachByPriority || {}).map(([name, value]) => (
              <Badge key={name} variant="outline">{name}: {value}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts analytics={analytics} />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Map Heatmap (Zone Density)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {zoneDensity.map(([zone, count]) => (
              <div key={zone} className={`rounded-xl p-6 text-center ${heatLevel(Number(count))}`}>
                <p className="text-lg font-black">{zone}</p>
                <p className="text-3xl font-black">{count}</p>
                <p className="text-xs uppercase tracking-wider">Complaints</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
