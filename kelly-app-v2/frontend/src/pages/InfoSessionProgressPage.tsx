import { useEffect, useState } from 'react'
import {
  getInfoSessionWorkflowProgress,
  updateInfoSessionWorkflowProgress,
  type InfoSessionWorkflowProgress,
} from '../services/api'

const FIELDS = [
  ['ob_sent', 'OB Sent'],
  ['ob_completed', 'OB Completed'],
  ['i9_sent', 'I-9 Sent'],
  ['i9_completed', 'I-9 Completed'],
  ['existing_i9', 'Existing I-9'],
  ['needs_schedule_fp', 'Needs Schedule FP'],
  ['existing_fp', 'Existing FP'],
  ['pending_drug_screening', 'Pending Drug Screening'],
  ['drug_screening_complete', 'Drug Screening Complete'],
  ['trainings_sent', 'Trainings Sent'],
  ['nho_scheduled', 'NHO Scheduled'],
] as const

export default function InfoSessionProgressPage() {
  const [rows, setRows] = useState<InfoSessionWorkflowProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const load = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true)
      setRows(await getInfoSessionWorkflowProgress())
    } finally {
      if (!quiet) setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const timer = setInterval(() => load(true), 5000)
    return () => clearInterval(timer)
  }, [])

  const toggle = async (row: InfoSessionWorkflowProgress, field: string) => {
    const key = `${row.info_session_id}:${field}`
    const value = !row.progress[field]
    setSaving(key)
    setRows(current => current.map(item =>
      item.info_session_id === row.info_session_id
        ? { ...item, progress: { ...item.progress, [field]: value } }
        : item
    ))
    try {
      const updated = await updateInfoSessionWorkflowProgress(row.info_session_id, field, value)
      setRows(current => current.map(item => item.info_session_id === updated.info_session_id ? updated : item))
    } catch {
      await load(true)
      alert('Could not save this progress update. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="flex h-[calc(100vh-1rem)] min-h-0 flex-col p-4">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Info Session Progress</h2>
          <p className="text-sm text-gray-600">Today's Info Session visitors. Updates are shared with all staff.</p>
        </div>
        <a href="/info-session-progress/tv" target="_blank" rel="noreferrer"
          className="rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white hover:bg-black">
          Open TV Kiosk
        </a>
      </div>

      {loading ? <p className="py-10 text-center">Loading...</p> : rows.length === 0 ? (
        <p className="rounded-lg bg-gray-50 p-8 text-center text-gray-600">No Info Session visitors today.</p>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-max w-full text-sm">
            <thead className="sticky top-0 z-30 bg-gray-900 text-white shadow-sm">
              <tr>
                <th className="sticky left-0 top-0 z-40 bg-gray-900 px-4 py-3 text-left">Visitor</th>
                <th className="sticky top-0 z-30 bg-gray-900 px-4 py-3 text-left">Recruiter</th>
                {FIELDS.map(([, label]) => <th key={label} className="sticky top-0 z-30 bg-gray-900 px-3 py-3 text-center">{label}</th>)}
                <th className="sticky top-0 z-30 bg-gray-900 px-4 py-3 text-center">Progress</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.info_session_id} className="border-t border-gray-200">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 text-xl font-bold shadow-[2px_0_3px_rgba(0,0,0,0.05)]">{row.display_label || row.initials}</td>
                  <td className="px-4 py-3 font-semibold">{row.assigned_recruiter_name || '—'}</td>
                  {FIELDS.map(([field]) => {
                    const key = `${row.info_session_id}:${field}`
                    return (
                      <td key={field} className="px-3 py-3 text-center">
                        <input type="checkbox" checked={!!row.progress[field]} disabled={saving === key}
                          onChange={() => toggle(row, field)}
                          className="h-6 w-6 cursor-pointer accent-green-600" />
                      </td>
                    )
                  })}
                  <td className="px-4 py-3">
                    <div className="min-w-32">
                      <div className="mb-1 text-center font-bold">{row.percent_complete}%</div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full bg-green-600" style={{ width: `${row.percent_complete}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
