import { useEffect, useState } from 'react'
import { deleteDataArchiveYear, exportCompleteDataArchive, getDataArchiveSummary } from '../services/api'

interface ArchiveSummary {
  year: number
  counts: Record<string, number>
  total_deletable: number
  protected: string[]
}

function DataArchiveManagement() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear - 1)
  const [summary, setSummary] = useState<ArchiveSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [archiveDownloaded, setArchiveDownloaded] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      setSummary(await getDataArchiveSummary(year))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to load archive summary.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setArchiveDownloaded(false)
    setConfirmation('')
    setSuccess(null)
    loadSummary()
  }, [year])

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    setSuccess(null)
    try {
      await exportCompleteDataArchive(year)
      setArchiveDownloaded(true)
      setSuccess(`The complete ${year} archive was downloaded. Keep it in a secure location.`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to export the complete archive.')
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    if (!archiveDownloaded || confirmation !== `DELETE ${year}`) return
    const finalConfirmation = window.confirm(
      `Permanently delete historical operational records from ${year}? This action cannot be undone inside the app.`
    )
    if (!finalConfirmation) return

    setDeleting(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await deleteDataArchiveYear(year, confirmation)
      setSuccess(`${result.total_deleted} archived records from ${year} were deleted successfully.`)
      setArchiveDownloaded(false)
      setConfirmation('')
      await loadSummary()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to delete the archived records.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Archive</h2>
          <p className="mt-1 text-gray-600">Back up every operational tab before removing historical records.</p>
        </div>
        <select
          value={year}
          onChange={event => setYear(parseInt(event.target.value))}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold"
          aria-label="Archive year"
        >
          {Array.from({ length: currentYear - 2019 }, (_, index) => currentYear - index).map(optionYear => (
            <option key={optionYear} value={optionYear}>{optionYear}</option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">{success}</div>}

      <div className="mb-5 rounded-lg bg-gray-50 p-4">
        <p className="font-semibold text-gray-800">
          {loading ? 'Loading records...' : `${summary?.total_deletable ?? 0} historical records found for ${year}`}
        </p>
        {summary && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            {Object.entries(summary.counts).map(([name, count]) => (
              <div key={name} className="rounded border border-gray-200 bg-white p-2">
                <span className="block text-gray-500">{name}</span>
                <strong className="text-gray-900">{count}</strong>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-sm text-blue-700">
          Recruiters, Storage, and PC List are included as snapshots and are protected from deletion.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-5">
          <h3 className="text-lg font-bold text-green-900">Step 1 — Export Complete Archive</h3>
          <p className="my-3 text-sm text-green-800">Downloads one Excel workbook containing all tabs for {year}.</p>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || loading}
            className="rounded-lg bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : `Download Complete ${year} Archive`}
          </button>
        </div>

        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
          <h3 className="text-lg font-bold text-red-900">Step 2 — Delete Archived Year</h3>
          <p className="my-3 text-sm text-red-800">
            Available only after the archive downloads. Type <strong>DELETE {year}</strong> to continue.
          </p>
          <input
            value={confirmation}
            onChange={event => setConfirmation(event.target.value)}
            disabled={!archiveDownloaded}
            placeholder={`DELETE ${year}`}
            className="mb-3 w-full rounded-lg border border-red-300 px-3 py-2 disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={handleDelete}
            disabled={!archiveDownloaded || confirmation !== `DELETE ${year}` || deleting}
            className="rounded-lg bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? 'Deleting...' : `Delete ${year} Historical Data`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataArchiveManagement
