import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { grievanceApi, feedbackApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'

function statusVariant(status) {
  if (status === 'RESOLVED') return 'success'
  if (status === 'IN_PROGRESS') return 'secondary'
  if (status === 'PENDING') return 'warning'
  return 'outline'
}

export function CitizenComplaintsPage() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [feedbackForm, setFeedbackForm] = useState({ grievanceId: null, rating: 5, comment: '', reopenRequested: false })

  const load = async () => {
    setLoading(true)
    try {
      const data = await grievanceApi.mine(token)
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

  const filtered = useMemo(() => (filter === 'ALL' ? items : items.filter((item) => item.status === filter)), [items, filter])

  const submitFeedback = async () => {
    if (!feedbackForm.grievanceId) return
    try {
      await feedbackApi.submit(feedbackForm, token)
      toast.success('Feedback submitted')
      setFeedbackForm({ grievanceId: null, rating: 5, comment: '', reopenRequested: false })
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <AppLayout title="My Complaints" subtitle="Track status, review timeline, and submit feedback">
      <div className="mb-4 flex flex-wrap gap-2">
        {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((option) => (
          <Button key={option} variant={filter === option ? 'default' : 'outline'} onClick={() => setFilter(option)}>{option}</Button>
        ))}
      </div>

      <div className="grid gap-4">
        {loading && <Card><CardContent className="p-6">Loading complaints...</CardContent></Card>}
        {!loading && filtered.length === 0 && <Card><CardContent className="p-6">No complaints found.</CardContent></Card>}

        {filtered.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">#{item.id} {item.title}</CardTitle>
                <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{item.description}</p>

              <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <p><b>Category:</b> {item.category}</p>
                <p><b>Priority:</b> {item.priority || 'MEDIUM'}</p>
                <p><b>Officer:</b> {item.assignedOfficer || 'Not assigned'}</p>
                <p><b>Zone:</b> {item.zone || 'N/A'}</p>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="mb-2 text-sm font-semibold">Timeline</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• Submitted: {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '-'}</p>
                  <p>• Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'}</p>
                  <p>• Resolved: {item.resolvedAt ? new Date(item.resolvedAt).toLocaleString() : '-'}</p>
                </div>
              </div>

              {(item.status === 'RESOLVED' || item.status === 'CLOSED') && (
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="mb-2 text-sm font-semibold">Rate Resolution / Reopen</p>
                  <div className="mb-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`rounded px-2 py-1 text-lg ${feedbackForm.grievanceId === item.id && feedbackForm.rating >= star ? 'bg-yellow-100' : 'bg-muted'}`}
                        onClick={() => setFeedbackForm((v) => ({ ...v, grievanceId: item.id, rating: star }))}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Share feedback"
                    value={feedbackForm.grievanceId === item.id ? feedbackForm.comment : ''}
                    onChange={(e) =>
                      setFeedbackForm((v) => ({
                        ...v,
                        grievanceId: item.id,
                        comment: e.target.value,
                      }))
                    }
                  />
                  <label className="mt-2 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={feedbackForm.grievanceId === item.id ? feedbackForm.reopenRequested : false}
                      onChange={(e) =>
                        setFeedbackForm((v) => ({
                          ...v,
                          grievanceId: item.id,
                          reopenRequested: e.target.checked,
                        }))
                      }
                    />
                    Request reopen
                  </label>
                  <Button className="mt-3" onClick={submitFeedback}>Submit Feedback</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  )
}
