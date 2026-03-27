import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Mic, MicOff, Sparkles, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { grievanceApi } from '../services/api'
import { useSpeechToText } from '../hooks/useSpeechToText'
import { AppLayout } from '../components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select } from '../components/ui/select'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { GoogleMapPicker } from '../components/maps/GoogleMapPicker'

const CATEGORIES = ['WATER', 'STREET_LIGHT', 'ROAD', 'SANITATION', 'DRAINAGE', 'PARK', 'ELECTRICITY', 'OTHER']

function suggestCategory(description, title) {
  const text = `${title} ${description}`.toLowerCase()
  if (text.includes('water') || text.includes('leak')) return 'WATER'
  if (text.includes('light') || text.includes('lamp')) return 'STREET_LIGHT'
  if (text.includes('road') || text.includes('pothole')) return 'ROAD'
  if (text.includes('garbage') || text.includes('waste')) return 'SANITATION'
  if (text.includes('drain') || text.includes('sewer')) return 'DRAINAGE'
  if (text.includes('park') || text.includes('tree')) return 'PARK'
  if (text.includes('electric') || text.includes('power')) return 'ELECTRICITY'
  return 'OTHER'
}

export function CitizenSubmitPage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { supported, listening, start, stop } = useSpeechToText()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'WATER',
    location: '',
    latitude: null,
    longitude: null,
    zone: '',
    imageBase64: '',
  })

  const aiSuggestion = useMemo(() => suggestCategory(form.description, form.title), [form.description, form.title])

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setForm((v) => ({ ...v, imageBase64: String(reader.result) }))
    }
    reader.readAsDataURL(file)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop,
  })

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported in this browser')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = Number(pos.coords.latitude.toFixed(6))
        const longitude = Number(pos.coords.longitude.toFixed(6))
        setForm((v) => ({
          ...v,
          latitude,
          longitude,
          location: `Lat ${latitude}, Lng ${longitude}`,
          zone: latitude > 20 ? 'NORTH' : 'SOUTH',
        }))
        toast.success('Location captured')
      },
      () => toast.error('Unable to fetch location'),
    )
  }

  const onVoice = () => {
    if (!supported) {
      toast.error('Voice input not supported on this browser')
      return
    }

    if (listening) {
      stop()
      return
    }

    start((transcript) => {
      setForm((v) => ({ ...v, description: transcript }))
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        category: form.category || aiSuggestion,
      }
      const created = await grievanceApi.create(payload, token)
      toast.success(`Complaint #${created.id} submitted`)
      navigate('/citizen/my-complaints')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="Submit Complaint" subtitle="AI assisted submission with voice, map, and drag-drop image">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>New Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Complaint title"
                  value={form.title}
                  onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
                  required
                />
                <Select value={form.category} onChange={(e) => setForm((v) => ({ ...v, category: e.target.value }))}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Description</p>
                  <Button type="button" variant="outline" size="sm" onClick={onVoice}>
                    {listening ? <MicOff className="mr-1 h-4 w-4" /> : <Mic className="mr-1 h-4 w-4" />}
                    {listening ? 'Stop Voice' : 'Voice Input'}
                  </Button>
                </div>
                <Textarea
                  placeholder="Describe the issue in detail"
                  value={form.description}
                  onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="Location / Landmark"
                  value={form.location}
                  onChange={(e) => setForm((v) => ({ ...v, location: e.target.value }))}
                />
                <Input
                  placeholder="Zone (North/Central/South)"
                  value={form.zone}
                  onChange={(e) => setForm((v) => ({ ...v, zone: e.target.value.toUpperCase() }))}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={detectLocation}><MapPin className="mr-1 h-4 w-4" />Auto Detect Location</Button>
                <Badge variant="secondary"><Sparkles className="mr-1 h-3 w-3" />AI Suggestion: {aiSuggestion}</Badge>
              </div>

              <GoogleMapPicker
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={({ latitude, longitude }) =>
                  setForm((v) => ({ ...v, latitude, longitude, location: `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}` }))
                }
              />

              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-xl border border-dashed p-6 text-center text-sm ${isDragActive ? 'border-primary bg-primary/10' : 'border-border bg-muted/40'}`}
              >
                <input {...getInputProps()} />
                {form.imageBase64 ? (
                  <div className="space-y-2">
                    <img src={form.imageBase64} alt="preview" className="mx-auto h-36 rounded-lg object-cover" />
                    <p>Image selected. Drop another to replace.</p>
                  </div>
                ) : (
                  <p>Drag and drop complaint image here, or click to upload</p>
                )}
              </div>

              <Button className="w-full" disabled={loading}>{loading ? 'Submitting...' : 'Submit Complaint'}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Include landmark + approximate time to speed officer response.</p>
            <p>• Add image for faster triage and priority detection.</p>
            <p>• Use voice mode for quick field reporting from mobile.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
