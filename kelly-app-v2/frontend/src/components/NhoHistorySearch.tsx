import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { isAxiosError } from 'axios'
import { searchNhoHistory } from '../services/api'
import type { NhoHistoryFilters, NhoHistoryPage } from '../services/api'
import type { NewHireOrientationWithSteps } from '../types'
import { formatMiamiTime } from '../utils/dateUtils'

export default function NhoHistorySearch() {
  const [open, setOpen] = useState(false)
  return <>
    <button type="button" onClick={() => setOpen(true)}
      className="px-3 py-1.5 bg-white border border-blue-600 text-blue-800 rounded hover:bg-blue-100 text-sm font-semibold">
      Search history
    </button>
    {open && createPortal(<HistoryDialog onClose={() => setOpen(false)} />, document.body)}
  </>
}

function HistoryDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const request = useRef<AbortController | null>(null)
  const [name, setName] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [filters, setFilters] = useState<NhoHistoryFilters | null>(null)
  const [page, setPage] = useState<NhoHistoryPage | null>(null)
  const [selected, setSelected] = useState<NewHireOrientationWithSteps | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsSignIn, setNeedsSignIn] = useState(false)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const element = dialog.current
    element?.showModal()
    return () => {
      request.current?.abort()
      element?.close()
      previousFocus?.focus()
    }
  }, [])

  async function search(nextFilters: NhoHistoryFilters, offset = 0) {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setError('')
    setNeedsSignIn(false)
    setLoading(true)
    setSelected(null)
    setPage(null)
    setFilters(nextFilters)
    try {
      const result = await searchNhoHistory(nextFilters, offset, controller.signal)
      if (!controller.signal.aborted) setPage(result)
    } catch (failure) {
      if (!controller.signal.aborted) {
        const status = isAxiosError(failure) ? failure.response?.status : undefined
        setNeedsSignIn(status === 401)
        setError(status === 401
          ? 'Sign in to your staff account to search NHO history.'
          : status === 403
            ? 'A staff account is required to search NHO history.'
            : 'Could not search history. Please try again.')
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  return <dialog ref={dialog} onCancel={event => { event.preventDefault(); onClose() }}
    aria-labelledby="nho-history-title"
    className="m-auto w-[calc(100%_-_2rem)] max-w-5xl max-h-[90vh] rounded-xl p-0 shadow-xl backdrop:bg-black/50">
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h2 id="nho-history-title" className="text-xl font-bold text-gray-900">New Hire Orientation history</h2>
        <button type="button" onClick={onClose} className="px-3 py-2 border rounded hover:bg-gray-100">Close</button>
      </div>
      <p className="text-sm text-gray-600 mb-5">Search past registrations by name or date. Dates and times use Miami time.</p>
      <form onSubmit={event => {
        event.preventDefault()
        if (!name.trim() && !from && !to) {
          setError('Enter a name or at least one date.')
          return
        }
        if (from && to && from > to) {
          setError('Start date must not be after end date.')
          return
        }
        void search({ q: name.trim(), date_from: from || undefined, date_to: to || undefined })
      }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <label className="text-sm font-medium">Name or surname
          <input autoFocus value={name} onChange={e => setName(e.target.value)} maxLength={200}
            placeholder="e.g. Laurent Fletes" className="block w-full mt-1 border rounded px-3 py-2" />
        </label>
        <label className="text-sm font-medium">From (optional)
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="block w-full mt-1 border rounded px-3 py-2" />
        </label>
        <label className="text-sm font-medium">To (optional)
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="block w-full mt-1 border rounded px-3 py-2" />
        </label>
        <button type="submit" disabled={loading}
          className="self-end px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>
      {error && <p role="alert" className="text-red-700 bg-red-50 p-3 rounded mb-4">{error}
        {needsSignIn && <a href="/staff/login" className="ml-2 underline font-semibold">Sign in</a>}
      </p>}
      <div aria-live="polite" aria-busy={loading}>
        {!page && !loading && !error && <p className="text-gray-500 py-6 text-center">Enter a name, a date range, or both to search the history.</p>}
        {loading && <p className="py-6 text-center text-gray-600">Searching history…</p>}
        {page && <>
          <p className="text-sm text-gray-600 mb-3">{page.total} matching registration{page.total === 1 ? '' : 's'}</p>
          {page.items.length === 0 ? <p className="py-6 text-center text-gray-600">No registrations found for this search.</p> :
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100"><tr>
                  {['Name', 'Registered (Miami)', 'Time slot', 'Status', 'Details'].map(label => <th key={label} scope="col" className="p-3">{label}</th>)}
                </tr></thead>
                <tbody>{page.items.map(item => <tr key={item.id} className="border-b">
                  <td className="p-3 font-medium">{item.first_name} {item.last_name}</td>
                  <td className="p-3">{formatMiamiTime(item.created_at)}</td>
                  <td className="p-3">{item.time_slot}</td>
                  <td className="p-3">{item.status}</td>
                  <td className="p-3"><button type="button" onClick={() => setSelected(item)}
                    aria-label={`View details for ${item.first_name} ${item.last_name}, record ${item.id}`}
                    className="text-blue-700 underline">View details</button></td>
                </tr>)}</tbody>
              </table>
            </div>}
          {page.total > page.limit && <div className="flex items-center justify-between gap-3 mt-4">
            <button type="button" disabled={page.offset === 0 || loading} onClick={() => filters && void search(filters, Math.max(0, page.offset - page.limit))}
              className="border rounded px-3 py-2 disabled:opacity-40">Previous</button>
            <span className="text-sm">Page {Math.floor(page.offset / page.limit) + 1} of {Math.ceil(page.total / page.limit)}</span>
            <button type="button" disabled={page.offset + page.limit >= page.total || loading} onClick={() => filters && void search(filters, page.offset + page.limit)}
              className="border rounded px-3 py-2 disabled:opacity-40">Next</button>
          </div>}
        </>}
      </div>
      {selected && <section aria-label="Registration details" className="mt-5 border rounded-lg p-4 bg-blue-50">
        <div className="flex justify-between gap-3">
          <h3 className="font-bold">{selected.first_name} {selected.last_name} — #{selected.id}</h3>
          <button type="button" onClick={() => setSelected(null)} className="text-blue-700 underline">Hide details</button>
        </div>
        <dl className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
          {[
            ['Registered (Miami)', formatMiamiTime(selected.created_at)],
            ['Completed (Miami)', formatMiamiTime(selected.completed_at)],
            ['Time slot', selected.time_slot], ['Status', selected.status],
            ['Process status', selected.process_status || '—'], ['Badge status', selected.badge_status || '—'],
            ['Missing steps', selected.missing_steps || '—'],
          ].map(([label, value]) => <div key={label}><dt className="text-gray-600">{label}</dt><dd className="font-medium break-words">{value}</dd></div>)}
        </dl>
        <ul className="mt-3 text-sm space-y-1">{selected.steps.map(step => <li key={step.step_name}>
          {step.is_completed ? '✓ Completed' : 'Pending'} — {step.step_description || step.step_name}
        </li>)}</ul>
      </section>}
    </div>
  </dialog>
}
