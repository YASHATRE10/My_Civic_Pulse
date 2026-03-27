import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { grievanceApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

function predictPriorityFromText(text) {
  const val = (text || '').toLowerCase()
  if (val.includes('urgent') || val.includes('accident') || val.includes('danger')) return 'CRITICAL'
  if (val.includes('school') || val.includes('hospital') || val.includes('major')) return 'HIGH'
  if (val.includes('minor')) return 'LOW'
  return 'MEDIUM'
}

const STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

export function AdminPage() {
  const { token } = useAuth()
  const [all, setAll] = useState([])
  const [kanban, setKanban] = useState({})
  const [filters, setFilters] = useState({ category: '', status: '', location: '' })
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)
  const [draggingId, setDraggingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [table, board] = await Promise.all([grievanceApi.all(token), grievanceApi.kanban(token)])
      setAll(table)
      setKanban(board)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    return all.filter((item) => {
      const byCategory = !filters.category || item.category === filters.category
      const byStatus = !filters.status || item.status === filters.status
      const byLocation = !filters.location || (item.location || '').toLowerCase().includes(filters.location.toLowerCase())
      return byCategory && byStatus && byLocation
    })
  }, [all, filters])

  const assignWithSuggestion = async (grievance) => {
    try {
      const suggestion = await grievanceApi.autoAssign(grievance.category, token)
      const predictedPriority = predictPriorityFromText(`${grievance.title} ${grievance.description}`)
      setActive({
        ...grievance,
        assignedOfficer: suggestion.suggestedOfficer,
        department: suggestion.suggestedDepartment,
        priority: suggestion.suggestedPriority || predictedPriority,
        status: grievance.status,
        remarks: grievance.remarks || '',
        deadline: grievance.deadline ? String(grievance.deadline).slice(0, 16) : '',
      })
      toast.success('Smart assignment suggestion applied')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const saveAssignment = async () => {
    if (!active) return

    try {
      await grievanceApi.assign(
        {
          grievanceId: active.id,
          assignedOfficer: active.assignedOfficer,
          department: active.department,
          priority: active.priority,
          status: active.status,
          remarks: active.remarks,
          deadline: active.deadline || null,
        },
        token,
      )
      toast.success('Assignment updated')
      setActive(null)
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const dropToStatus = async (status) => {
    if (!draggingId) return
    const target = all.find((item) => item.id === draggingId)
    if (!target) return

    try {
      await grievanceApi.assign(
        {
          grievanceId: target.id,
          assignedOfficer: target.assignedOfficer,
          department: target.department,
          priority: target.priority || 'MEDIUM',
          status,
          remarks: target.remarks,
          deadline: target.deadline,
        },
        token,
      )
      toast.success(`Moved #${target.id} to ${status}`)
      setDraggingId(null)
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <AppLayout title="Admin Control Desk" subtitle="Data table + smart assignment + drag-drop Kanban">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Complaint Data Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 grid gap-2 md:grid-cols-3">
            <Input placeholder="Filter by location" value={filters.location} onChange={(e) => setFilters((v) => ({ ...v, location: e.target.value }))} />
            <Select value={filters.category} onChange={(e) => setFilters((v) => ({ ...v, category: e.target.value }))}>
              <option value="">All Categories</option>
              {['WATER', 'STREET_LIGHT', 'ROAD', 'SANITATION', 'DRAINAGE', 'PARK', 'ELECTRICITY', 'OTHER'].map((cat) => <option key={cat}>{cat}</option>)}
            </Select>
            <Select value={filters.status} onChange={(e) => setFilters((v) => ({ ...v, status: e.target.value }))}>
              <option value="">All Statuses</option>
              {STATUSES.map((status) => <option key={status}>{status}</option>)}
            </Select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Title</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Priority</th>
                  <th className="p-2">Officer</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td className="p-3" colSpan={7}>Loading...</td></tr>
                )}
                {!loading && filtered.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="p-2">#{item.id}</td>
                    <td className="p-2">{item.title}</td>
                    <td className="p-2">{item.category}</td>
                    <td className="p-2"><Badge variant="outline">{item.status}</Badge></td>
                    <td className="p-2">{item.priority || 'MEDIUM'}</td>
                    <td className="p-2">{item.assignedOfficer || '-'}</td>
                    <td className="p-2">
                      <Button size="sm" variant="outline" onClick={() => assignWithSuggestion(item)}>Smart Assign</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kanban Assignment Board</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-4">
            {STATUSES.map((status) => (
              <motion.div
                key={status}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dropToStatus(status)}
                className="min-h-[220px] rounded-xl border border-border bg-muted/20 p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="mb-2 text-sm font-semibold">{status}</p>
                <div className="space-y-2">
                  {(kanban?.[status] || []).map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => setDraggingId(item.id)}
                      className="cursor-grab rounded-lg border border-border bg-card p-2 text-xs"
                    >
                      <p className="font-bold">#{item.id} {item.title}</p>
                      <p className="text-muted-foreground">{item.assignedOfficer || 'Unassigned'}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {active && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4" onClick={() => setActive(null)}>
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-lg font-bold">Manage #{active.id}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Officer username" value={active.assignedOfficer || ''} onChange={(e) => setActive((v) => ({ ...v, assignedOfficer: e.target.value }))} />
              <Input placeholder="Department" value={active.department || ''} onChange={(e) => setActive((v) => ({ ...v, department: e.target.value }))} />
              <Select value={active.priority || 'MEDIUM'} onChange={(e) => setActive((v) => ({ ...v, priority: e.target.value }))}>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((value) => <option key={value}>{value}</option>)}
              </Select>
              <Select value={active.status || 'PENDING'} onChange={(e) => setActive((v) => ({ ...v, status: e.target.value }))}>
                {STATUSES.map((value) => <option key={value}>{value}</option>)}
              </Select>
              <Input type="datetime-local" value={active.deadline || ''} onChange={(e) => setActive((v) => ({ ...v, deadline: e.target.value }))} />
              <Input value={predictPriorityFromText(`${active.title} ${active.description}`)} readOnly />
            </div>
            <Input className="mt-2" placeholder="Remarks" value={active.remarks || ''} onChange={(e) => setActive((v) => ({ ...v, remarks: e.target.value }))} />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
              <Button onClick={saveAssignment}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
