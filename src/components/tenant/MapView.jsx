import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { formatKES } from '../../utils/formatters'

// Fix leaflet default marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const greenIcon = L.divIcon({
  html: `<div style="background:#22c55e;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  className: '',
})

export default function MapView({ houses }) {
  const center = houses.length > 0
    ? [houses[0].lat || -1.2921, houses[0].lng || 36.8219]
    : [-1.2921, 36.8219]

  return (
    <div className="h-[600px] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#2A2A2A]">
      <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {houses.map(h => (
          <Marker key={h.id} position={[h.lat || -1.2921, h.lng || 36.8219]} icon={greenIcon}>
            <Popup>
              <div className="p-1 min-w-[180px]">
                <img src={h.images?.[0]} alt={h.title} className="w-full h-24 object-cover rounded-lg mb-2" onError={e => e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&q=60'} />
                <div className="font-semibold text-sm text-gray-900 mb-0.5 line-clamp-1">{h.title}</div>
                <div className="text-xs text-gray-500 mb-1">{h.location}</div>
                <div className="font-mono font-bold text-brand-600 text-sm mb-2">{formatKES(h.price)}/mo</div>
                <Link to={`/house/${h.id}`} className="block text-center text-xs bg-brand-500 text-white py-1.5 rounded-lg font-semibold hover:bg-brand-600 transition-colors">
                  View Property
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}