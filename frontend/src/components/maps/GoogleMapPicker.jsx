import { useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

export function GoogleMapPicker({ latitude, longitude, onChange }) {
  const mapRef = useRef(null)

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey || !mapRef.current) return

    const loader = new Loader({ apiKey, version: 'weekly' })
    let marker

    loader.load().then(() => {
      const center = { lat: latitude || 28.6139, lng: longitude || 77.209 }
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
      })

      marker = new window.google.maps.Marker({ map, position: center, draggable: true })
      marker.addListener('dragend', (event) => {
        onChange?.({ latitude: event.latLng.lat(), longitude: event.latLng.lng() })
      })
      map.addListener('click', (event) => {
        marker.setPosition(event.latLng)
        onChange?.({ latitude: event.latLng.lat(), longitude: event.latLng.lng() })
      })
    })

    return () => {
      marker = null
    }
  }, [latitude, longitude, onChange])

  return (
    <div className="rounded-xl border border-border bg-card p-2">
      {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
        <div ref={mapRef} className="h-56 w-full rounded-lg" />
      ) : (
        <div className="grid h-56 place-items-center rounded-lg bg-muted text-center text-sm text-muted-foreground">
          Add VITE_GOOGLE_MAPS_API_KEY in frontend/.env to enable map picker.
        </div>
      )}
    </div>
  )
}
