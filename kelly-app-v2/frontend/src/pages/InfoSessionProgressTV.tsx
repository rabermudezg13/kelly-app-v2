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
  ['needs_schedule_fp', 'Need FP'],
  ['existing_fp', 'Existing FP'],
  ['pending_drug_screening', 'Pending Drug Screening'],
  ['drug_screening_complete', 'Drug Screening Complete'],
  ['trainings_sent', 'Trainings Sent'],
  ['nho_scheduled', 'NHO Scheduled'],
] as const

export default function InfoSessionProgressTV() {
  const [rows, setRows] = useState<InfoSessionWorkflowProgress[]>([])
  const [selected, setSelected] = useState<InfoSessionWorkflowProgress | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await getInfoSessionWorkflowProgress()
      setRows(data)
      setSelected(current => {
        if (!current) return current
        return data.find(row => row.info_session_id === current.info_session_id) || current
      })
    } catch {
      // Keep the last rendered state if a refresh fails.
    }
  }

  useEffect(() => {
    load()
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [])

  const toggle = async (field: string, value: boolean) => {
    if (!selected) return

    const key = `${selected.info_session_id}:${field}`
    setSaving(key)

    const previous = selected
    const optimistic = {
      ...selected,
      progress: { ...selected.progress, [field]: value },
    }

    if (value) {
      if (field === 'ob_completed') optimistic.progress.ob_sent = false
      if (field === 'i9_completed') {
        optimistic.progress.i9_sent = false
        optimistic.progress.existing_i9 = false
      }
      if (field === 'existing_i9') {
        optimistic.progress.i9_sent = false
        optimistic.progress.i9_completed = false
      }
      if (field === 'drug_screening_complete') optimistic.progress.pending_drug_screening = false
    }

    optimistic.completed_count = Object.values(optimistic.progress).filter(Boolean).length
    optimistic.total_count = Object.keys(optimistic.progress).length
    optimistic.percent_complete = Math.round(
      (optimistic.completed_count / optimistic.total_count) * 100
    )

    setSelected(optimistic)
    setRows(current =>
      current.map(row =>
        row.info_session_id === optimistic.info_session_id ? optimistic : row
      )
    )

    try {
      const updated = await updateInfoSessionWorkflowProgress(
        selected.info_session_id,
        field,
        value
      )
      setSelected(updated)
      setRows(current =>
        current.map(row =>
          row.info_session_id === updated.info_session_id ? updated : row
        )
      )
    } catch {
      setSelected(previous)
      setRows(current =>
        current.map(row =>
          row.info_session_id === previous.info_session_id ? previous : row
        )
      )
      alert('Could not save the progress update.')
    } finally {
      setSaving(null)
    }
  }

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
            <div
              key={row.info_session_id}
              className="grid w-full grid-cols-[120px_1fr_2fr] items-center gap-8 rounded-2xl border border-gray-700 bg-gray-900 p-6"
            >
              <a
                href="/info-session-progress/"
                className="group relative text-left text-5xl font-black underline decoration-transparent underline-offset-8 transition hover:text-green-400 hover:decoration-green-400"
                aria-label={`Open progress editor for ${row.full_name || row.display_label || row.initials}`}
              >
                {row.display_label || row.initials}
                <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-3 hidden whitespace-nowrap rounded-lg bg-white px-4 py-2 text-lg font-bold text-gray-900 shadow-xl group-hover:block">
                  {row.full_name || row.display_label || row.initials}
                </span>
              </a>

              <div>
                <div className="text-sm uppercase tracking-widest text-gray-500">Recruiter</div>
                <div className="mt-1 text-3xl font-bold">{row.assigned_recruiter_name || '—'}</div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xl font-semibold">Progress</span>
                  <span className="text-3xl font-black">{row.percent_complete}%</span>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${
                    row.progress.ob_completed
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {row.progress.ob_completed ? 'OB Complete' : 'OB Pending'}
                  </span>

                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${
                    row.progress.i9_completed || row.progress.existing_i9
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {row.progress.existing_i9
                      ? 'Existing I-9'
                      : row.progress.i9_completed
                      ? 'I-9 Complete'
                      : 'I-9 Pending'}
                  </span>

                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${
                    row.progress.drug_screening_complete
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {row.progress.drug_screening_complete ? 'DS Completed' : 'DS Pending'}
                  </span>

                  {row.progress.needs_schedule_fp && (
                    <span className="rounded-full bg-orange-500/20 px-3 py-1 text-sm font-bold text-orange-300">
                      Need FP
                    </span>
                  )}

                  {row.progress.existing_fp && (
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-bold text-green-300">
                      Existing FP
                    </span>
                  )}
                </div>

                <div className="h-5 overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${row.percent_complete}%` }}
                  />
                </div>
                <div className="mt-2 text-right text-gray-400">
                  {row.completed_count} of {row.total_count} steps
                </div>
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="py-24 text-center text-3xl text-gray-500">
              No Info Session visitors yet.
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black">
                  {selected.display_label || selected.initials}
                </h2>
                <p className="text-gray-600">
                  Recruiter: {selected.assigned_recruiter_name || '—'}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 font-bold hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FIELDS.map(([field, label]) => {
                const key = `${selected.info_session_id}:${field}`
                return (
                  <label
                    key={field}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={!!selected.progress[field]}
                      disabled={saving === key}
                      onChange={e => toggle(field, e.target.checked)}
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
                <div
                  className="h-full bg-green-600"
                  style={{ width: `${selected.percent_complete}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
