import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { grievanceApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Select } from '../components/ui/select'
import { Input } from '../components/ui/input'

function stepsForStatus(status) {
  const all = ['PENDING', 'IN_PROGRESS', 'RESOLVED']
  const idx = all.indexOf(status)
  return all.map((step, i) => ({ step, done: i <= idx }))
}

export function OfficerPage() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [active, setActive] = useState(null)
  const [comparison, setComparison] = useState(50)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await grievanceApi.byOfficer(token)
      setItems(data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const timeline = useMemo(() => stepsForStatus(active?.status || 'PENDING'), [active?.status])

  const save = async () => {
    if (!active) return
    try {
      await grievanceApi.officerUpdate(active.id, {
        status: active.status,
        remarks: active.remarks,
        officerComment: active.officerComment,
        resolutionImageBase64: active.resolutionImageBase64,
      }, token)
      toast.success('Officer update saved')
      setActive(null)
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleAfterImage = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setActive((v) => ({ ...v, resolutionImageBase64: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  return (
    <AppLayout title="Officer Work Queue" subtitle="Assigned tasks, progress timeline, and resolution proof">
      <Card>
        <CardHeader>
          <CardTitle>Assigned Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading...</p>}
          {!loading && items.length === 0 && <p>No assigned complaints right now.</p>}

          <div className="grid gap-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">#{item.id} {item.title}</p>
                  <Button size="sm" variant="outline" onClick={() => setActive({ ...item })}>Update</Button>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-1 text-xs">Status: {item.status} | Priority: {item.priority || 'MEDIUM'}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {active && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4" onClick={() => setActive(null)}>
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-lg font-bold">Update Complaint #{active.id}</h3>

            <div className="mb-3 rounded-lg border border-border bg-muted/20 p-3">
              <p className="mb-2 text-sm font-semibold">Timeline Progress</p>
              <div className="flex gap-2">
                {timeline.map((node) => (
                  <div key={node.step} className={`rounded-full px-3 py-1 text-xs ${node.done ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {node.step}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Select value={active.status || 'PENDING'} onChange={(e) => setActive((v) => ({ ...v, status: e.target.value }))}>
                {['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => <option key={status}>{status}</option>)}
              </Select>
              <Input placeholder="Officer comment" value={active.officerComment || ''} onChange={(e) => setActive((v) => ({ ...v, officerComment: e.target.value }))} />
            </div>
            <Textarea className="mt-2" placeholder="Remarks" value={active.remarks || ''} onChange={(e) => setActive((v) => ({ ...v, remarks: e.target.value }))} />

            <div className="mt-3 rounded-lg border border-border p-3">
              <p className="mb-2 text-sm font-semibold">Before / After Comparison</p>
              <input type="file" accept="image/*" onChange={(e) => handleAfterImage(e.target.files?.[0])} />
              {active.imageBase64 && active.resolutionImageBase64 && (
                <div className="relative mt-3 h-52 overflow-hidden rounded-lg border border-border">
                  <img src={active.imageBase64} alt="before" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${comparison}%` }}>
                    <img src={active.resolutionImageBase64} alt="after" className="h-full w-full object-cover" />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={comparison}
                    onChange={(e) => setComparison(Number(e.target.value))}
                    className="absolute bottom-3 left-3 right-3"
                  />
                </div>
              )}
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
              <Button onClick={save}>Save Update</Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
