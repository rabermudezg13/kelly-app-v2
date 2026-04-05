import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getStorageByCode } from '../services/api'
import type { StorageLocation } from '../services/api'

const TYPE_LABELS: Record<string, string> = {
  'box': '📦 Box',
  'storage-room': '🏠 Storage Room',
  'shelf': '🗄️ Shelf',
  'other': '📁 Other',
}

function StorageScanPage() {
  const { code } = useParams<{ code: string }>()
  const [location, setLocation] = useState<StorageLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (code) {
      getStorageByCode(code)
        .then(setLocation)
        .catch(() => setError('Storage location not found.'))
        .finally(() => setLoading(false))
    }
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    )
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <p className="text-4xl mb-4">❌</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Not Found</h2>
          <p className="text-gray-500">{error || 'This QR code is no longer active.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <p className="text-5xl mb-3">{TYPE_LABELS[location.storage_type]?.split(' ')[0] || '📦'}</p>
          <h1 className="text-3xl font-bold text-gray-900">{location.name}</h1>
          <p className="text-gray-500 mt-1">{TYPE_LABELS[location.storage_type] || location.storage_type}</p>
        </div>

        {location.notes && (
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm text-gray-600 italic">{location.notes}</p>
          </div>
        )}

        {(location.items || []).length > 0 ? (
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Contents ({location.items!.length} items)
            </h2>
            <ul className="space-y-2">
              {location.items!.map((item, i) => (
                <li key={i} className="flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-lg border border-teal-100">
                  <span className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0" />
                  <span className="text-gray-800 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-gray-400 text-sm py-4">No items listed for this location.</p>
        )}

        <p className="text-center text-xs text-gray-300 mt-6">Kelly Education — Storage System</p>
      </div>
    </div>
  )
}

export default StorageScanPage
