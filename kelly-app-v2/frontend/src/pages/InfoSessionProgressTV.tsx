import { useEffect, useState } from 'react'
import { getInfoSessionWorkflowProgress, updateInfoSessionWorkflowProgress, type InfoSessionWorkflowProgress } from '../services/api'

export default function InfoSessionProgressTV() {
  const [rows, setRows] = useState<InfoSessionWorkflowProgress[]>([])
  const [selected, setSelected] = useState<InfoSessionWorkflowProgress | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    try { setRows(await getInfoSessionWorkflowProgress()) } catch { /* keep last screen */ }
  }

  useEffect(() => {
    load()
    const timer = setInterval(load, 5000)
    const fields = [
    ['ob_sent', 'OB Sent'],
    ['ob_completed', 'OB Completed'],
    ['i9_sent', 'I-9 Sent'],
    ['i9_completed', 'I-9 Completed'],
    ['existing_i9', 'Existing I-9'],
    ['needs_schedule_fp', 'Need FP'],
    ['existing_fp', 'Existing FP'],
    ['pending_drug_screening', 'Pending Drug Screening'],
    ['drug_screening_complete', 'Drug Screening Complete'],
    ['trainings_sent', 'Trainings Sent'],
    ['nho_scheduled', 'NHO Scheduled'],
  ] as const

  const toggle = async (field: string, value: boolean) => {
    if (!selected) return
    const key = `${selected.info_session_id}:${field}`
    setSaving(key)
    const previous = selected
    const optimistic = {
      ...selected,
      progress: { ...selected.progress, [field]: value },
    }
    optimistic.completed_count = Object.values(optimistic.progress).filter(Boolean).length
    optimistic.total_count = Object.keys(optimistic.progress).length
    optimistic.percent_complete = Math.round((optimistic.completed_count / optimistic.total_count) * 100)
    setSelected(optimistic)
    setRows(current => current.map(row => row.info_session_id === optimistic.info_session_id ? optimistic : row))
    try {
      const updated = await updateInfoSessionWorkflowProgress(selected.info_session_id, field, value)
      setSelected(updated)
      setRows(current => current.map(row => row.info_session_id === updated.info_session_id ? updated : row))
    } catch {
      setSelected(previous)
      setRows(current => current.map(row => row.info_session_id === previous.info_session_id ? previous : row))
      alert('Could not save the progress update.')
    } finally {
      setSaving(null)
    }
  }

  return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-tight">INFO SESSION PROGRESS</h1>
            <p className="mt-2 text-xl text-gray-400">Live office workflow</p>
          </div>
          <div className="text-right text-lg text-gray-400">Updates automatically</div>
        </div>

        <div className="grid gap-5">
          {rows.map(row => (
            <button
              key={row.info_session_id}
              onClick={() => setSelected(row)}
              className="grid w-full grid-cols-[120px_1fr_2fr] items-center gap-8 rounded-2xl border border-gray-700 bg-gray-900 p-6 text-left transition hover:border-green-500 hover:bg-gray-800"
            >
              <div className="text-5xl font-black">{row.display_label || row.initials}</div>
              <div>
                <div className="text-sm uppercase tracking-widest text-gray-500">Recruiter</div>
                <div className="mt-1 text-3xl font-bold">{row.assigned_recruiter_name || '—'}</div>
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xl font-semibold">Progress</span>
                  <span className="text-3xl font-black">{row.percent_complete}%</span>
                </div>
                <div className="h-5 overflow-hidden rounded-full bg-gray-700">
                  <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${row.percent_complete}%` }} />
                </div>
                <div className="mt-2 text-right text-gray-400">{row.completed_count} of {row.total_count} steps</div>
              </div>
            </button>
          ))}
          {rows.length === 0 && <div className="py-24 text-center text-3xl text-gray-500">No Info Session visitors yet.</div>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black">{selected.display_label || selected.initials}</h2>
                <p className="text-gray-600">Recruiter: {selected.assigned_recruiter_name || '—'}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 font-bold hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {fields.map(([field, label]) => {
                const key = `${selected.info_session_id}:${field}`
                return (
                  <label key={field} className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={!!selected.progress[field]}
                      disabled={saving === key}
                      onChange={(e) => toggle(field, e.target.checked)}
                      className="h-6 w-6 accent-green-600"
                    />
                    <span className="text-lg font-semibold">{label}</span>
                  </label>
                )
              })}
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between font-bold">
                <span>Progress</span>
                <span>{selected.percent_complete}%</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full bg-green-600" style={{ width: `${selected.percent_complete}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
