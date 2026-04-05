import React, { useState, useEffect } from 'react'
import {
  getStorageLocations,
  createStorageLocation,
  updateStorageLocation,
  deleteStorageLocation,
  type StorageLocation,
} from '../services/api'

const TYPE_LABELS: Record<string, string> = {
  'box': '📦 Box',
  'storage-room': '🏠 Storage Room',
  'shelf': '🗄️ Shelf',
  'other': '📁 Other',
}

const EMPTY_FORM = { name: '', storage_type: 'box', items: [] as string[], notes: '' }

function StorageManagement() {
  const [locations, setLocations] = useState<StorageLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<StorageLocation | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [newItem, setNewItem] = useState('')
  const [saving, setSaving] = useState(false)
  const [qrTarget, setQrTarget] = useState<StorageLocation | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await getStorageLocations()
      setLocations(data)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setNewItem('')
    setShowModal(true)
  }

  const openEdit = (loc: StorageLocation) => {
    setEditing(loc)
    setForm({ name: loc.name, storage_type: loc.storage_type, items: [...(loc.items || [])], notes: loc.notes || '' })
    setNewItem('')
    setShowModal(true)
  }

  const addItem = () => {
    const v = newItem.trim()
    if (v && !form.items.includes(v)) {
      setForm(f => ({ ...f, items: [...f.items, v] }))
      setNewItem('')
    }
  }

  const removeItem = (item: string) => {
    setForm(f => ({ ...f, items: f.items.filter(i => i !== item) }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await updateStorageLocation(editing.id, { name: form.name, storage_type: form.storage_type, items: form.items, notes: form.notes || undefined })
      } else {
        await createStorageLocation({ name: form.name, storage_type: form.storage_type, items: form.items, notes: form.notes || undefined })
      }
      setShowModal(false)
      await load()
    } catch (e) {
      alert('Error saving storage location.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (loc: StorageLocation) => {
    if (!confirm(`Delete "${loc.name}"? This cannot be undone.`)) return
    await deleteStorageLocation(loc.id)
    await load()
  }

  const qrUrl = (loc: StorageLocation) => {
    const scanUrl = `${window.location.origin}/storage/scan/${loc.unique_code}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(scanUrl)}`
  }

  const printQR = (loc: StorageLocation) => {
    const scanUrl = `${window.location.origin}/storage/scan/${loc.unique_code}`
    const imgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(scanUrl)}`
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>QR - ${loc.name}</title>
      <style>body{font-family:sans-serif;text-align:center;padding:40px} h2{margin-bottom:8px} p{color:#666;margin:4px 0}</style>
      </head><body>
      <h2>${loc.name}</h2>
      <p>${TYPE_LABELS[loc.storage_type] || loc.storage_type}</p>
      <img src="${imgSrc}" style="margin:20px auto;display:block"/>
      <p style="font-size:12px;color:#999">${scanUrl}</p>
      <script>window.onload=()=>{window.print()}</script>
      </body></html>`)
    win.document.close()
  }

  const filtered = locations.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.storage_type.toLowerCase().includes(search.toLowerCase()) ||
    (l.items || []).some(i => i.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📦 Storage</h2>
          <p className="text-gray-500 text-sm">Manage storage locations and generate QR codes</p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors"
        >
          + New Location
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, type or item..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-400"
      />

      {/* List */}
      {loading ? (
        <p className="text-center py-8 text-gray-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 text-gray-400">No storage locations found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(loc => (
            <div key={loc.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{loc.name}</h3>
                  <span className="text-sm text-gray-500">{TYPE_LABELS[loc.storage_type] || loc.storage_type}</span>
                </div>
                <img
                  src={qrUrl(loc)}
                  alt="QR"
                  className="w-16 h-16 cursor-pointer border rounded"
                  onClick={() => setQrTarget(loc)}
                  title="Click to enlarge QR"
                />
              </div>

              {loc.notes && (
                <p className="text-xs text-gray-500 italic">{loc.notes}</p>
              )}

              {(loc.items || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Contents ({loc.items.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {loc.items.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-800 text-xs rounded-full border border-teal-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                <button
                  onClick={() => setQrTarget(loc)}
                  className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  🔍 QR
                </button>
                <button
                  onClick={() => openEdit(loc)}
                  className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(loc)}
                  className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold">{editing ? 'Edit Storage Location' : 'New Storage Location'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Box A3, Room 101"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
                  <select
                    value={form.storage_type}
                    onChange={e => setForm(f => ({ ...f, storage_type: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none bg-white"
                  >
                    {Object.entries(TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Location, description..."
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Items</label>
                  {form.items.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {form.items.map((item, i) => (
                        <span key={i} className="flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full text-sm">
                          {item}
                          <button onClick={() => removeItem(item)} className="text-teal-500 hover:text-red-600 font-bold ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newItem}
                      onChange={e => setNewItem(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
                      placeholder="Add item..."
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none"
                    />
                    <button
                      onClick={addItem}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setQrTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-1">{qrTarget.name}</h3>
            <p className="text-gray-500 text-sm mb-4">{TYPE_LABELS[qrTarget.storage_type] || qrTarget.storage_type}</p>
            <img src={qrUrl(qrTarget)} alt="QR Code" className="mx-auto border rounded-xl mb-4" style={{ width: 220, height: 220 }} />
            {(qrTarget.items || []).length > 0 && (
              <div className="text-left mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Contents:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {qrTarget.items.map((item, i) => <li key={i}>• {item}</li>)}
                </ul>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => printQR(qrTarget)}
                className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => setQrTarget(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StorageManagement
