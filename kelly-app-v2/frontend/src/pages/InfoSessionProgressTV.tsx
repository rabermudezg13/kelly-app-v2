import { useEffect, useState } from 'react'
import { getInfoSessionWorkflowProgress, type InfoSessionWorkflowProgress } from '../services/api'

export default function InfoSessionProgressTV() {
  const [rows, setRows] = useState<InfoSessionWorkflowProgress[]>([])

  const load = async () => {
    try { setRows(await getInfoSessionWorkflowProgress()) } catch { /* keep last screen */ }
  }

  useEffect(() => {
    load()
    const timer = setInterval(load, 5000)
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
            <div key={row.info_session_id} className="grid grid-cols-[120px_1fr_2fr] items-center gap-8 rounded-2xl border border-gray-700 bg-gray-900 p-6">
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
            </div>
          ))}
          {rows.length === 0 && <div className="py-24 text-center text-3xl text-gray-500">No Info Session visitors yet.</div>}
        </div>
      </div>
    </div>
  )
}
