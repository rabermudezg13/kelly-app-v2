import { useEffect, useState } from 'react'
import { getInfoSessionWorkflowProgress, type InfoSessionWorkflowProgress } from '../services/api'

export default function InfoSessionProgressTV() {
  const [rows, setRows] = useState<InfoSessionWorkflowProgress[]>([])
  const [now, setNow] = useState(new Date())

  const load = async () => {
    try {
      setRows(await getInfoSessionWorkflowProgress())
    } catch {
      // Keep the last successful state on screen.
    }
  }

  useEffect(() => {
    load()
    const dataTimer = setInterval(load, 5000)
    const clockTimer = setInterval(() => setNow(new Date()), 30000)
    return () => {
      clearInterval(dataTimer)
      clearInterval(clockTimer)
    }
  }, [])

  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06110d] px-6 py-7 text-white sm:px-8 lg:px-10">
      {/* Subtle aurora background */}
      <div className="pointer-events-none absolute -left-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-emerald-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-teal-400/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-16rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-green-300/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-[1800px]">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-5 rounded-[28px] border border-white/10 bg-white/[0.06] px-7 py-6 shadow-2xl backdrop-blur-xl">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-sm font-extrabold tracking-[0.18em] text-emerald-200">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                LIVE
              </span>
              <span className="text-base font-semibold text-white/55">{dateLabel}</span>
            </div>
            <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              INFO SESSION <span className="text-emerald-300">LIVE</span>
            </h1>
            <p className="mt-2 text-lg font-medium text-white/55">Office workflow · updates every 5 seconds</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-6 py-4 text-right backdrop-blur-lg">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">Visitors</div>
              <div className="text-4xl font-black text-white">{rows.length}</div>
            </div>
          </div>
        </header>

        <main className={`grid gap-5 ${
          rows.length <= 4
            ? 'grid-cols-1 lg:grid-cols-2'
            : rows.length <= 8
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-3'
        }`}>
          {rows.map(row => (
            <article
              key={row.info_session_id}
              className="group relative overflow-visible rounded-[30px] border border-white/10 bg-white/[0.07] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/35 hover:bg-white/[0.09]"
            >
              <div className="mb-6 flex items-start justify-between gap-5">
                <a
                  href="/info-session-progress/"
                  className="group/name relative flex h-24 min-w-24 items-center justify-center rounded-[24px] border border-emerald-300/20 bg-gradient-to-br from-emerald-300/20 to-emerald-500/5 px-5 text-4xl font-black tracking-tight text-emerald-100 shadow-inner transition hover:border-emerald-300/60 hover:bg-emerald-300/20 hover:text-white focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
                  aria-label={`Open progress editor for ${row.full_name || row.display_label || row.initials}`}
                >
                  {row.display_label || row.initials}
                  <span className="pointer-events-none absolute bottom-full left-0 z-30 mb-3 hidden whitespace-nowrap rounded-xl border border-white/15 bg-[#102019]/95 px-4 py-2 text-base font-bold text-white shadow-2xl backdrop-blur-xl group-hover/name:block group-focus/name:block">
                    {row.full_name || row.display_label || row.initials}
                  </span>
                </a>

                <div className="min-w-0 flex-1 pt-1">
                  <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/40">Recruiter</div>
                  <div className="mt-1 truncate text-2xl font-black text-white sm:text-3xl">
                    {row.assigned_recruiter_name || '—'}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center">
                  <div className="text-3xl font-black text-emerald-300">{row.percent_complete}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Progress</div>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3">
                <div className={`rounded-2xl border px-4 py-3 ${
                  row.progress.ob_completed
                    ? 'border-emerald-300/20 bg-emerald-400/10'
                    : 'border-amber-300/20 bg-amber-300/10'
                }`}>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/40">Onboarding</div>
                  <div className={`mt-1 text-lg font-black ${row.progress.ob_completed ? 'text-emerald-200' : 'text-amber-200'}`}>
                    {row.progress.ob_completed ? '✓ OB Complete' : '○ OB Pending'}
                  </div>
                </div>

                <div className={`rounded-2xl border px-4 py-3 ${
                  row.progress.i9_completed || row.progress.existing_i9
                    ? 'border-emerald-300/20 bg-emerald-400/10'
                    : 'border-amber-300/20 bg-amber-300/10'
                }`}>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/40">I-9</div>
                  <div className={`mt-1 text-lg font-black ${
                    row.progress.i9_completed || row.progress.existing_i9 ? 'text-emerald-200' : 'text-amber-200'
                  }`}>
                    {row.progress.existing_i9
                      ? '✓ Existing I-9'
                      : row.progress.i9_completed
                      ? '✓ I-9 Complete'
                      : '○ I-9 Pending'}
                  </div>
                </div>

                <div className={`rounded-2xl border px-4 py-3 ${
                  row.progress.drug_screening_complete
                    ? 'border-emerald-300/20 bg-emerald-400/10'
                    : 'border-amber-300/20 bg-amber-300/10'
                }`}>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/40">Drug Screening</div>
                  <div className={`mt-1 text-lg font-black ${row.progress.drug_screening_complete ? 'text-emerald-200' : 'text-amber-200'}`}>
                    {row.progress.drug_screening_complete ? '✓ DS Complete' : '○ DS Pending'}
                  </div>
                </div>

                <div className={`rounded-2xl border px-4 py-3 ${
                  row.progress.needs_schedule_fp
                    ? 'border-orange-300/25 bg-orange-300/10'
                    : row.progress.existing_fp
                    ? 'border-emerald-300/20 bg-emerald-400/10'
                    : 'border-white/10 bg-white/[0.035]'
                }`}>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/40">Fingerprints</div>
                  <div className={`mt-1 text-lg font-black ${
                    row.progress.needs_schedule_fp
                      ? 'text-orange-200'
                      : row.progress.existing_fp
                      ? 'text-emerald-200'
                      : 'text-white/45'
                  }`}>
                    {row.progress.needs_schedule_fp
                      ? '! Need FP'
                      : row.progress.existing_fp
                      ? '✓ Existing FP'
                      : '— FP Status'}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-white/40">
                  <span>Overall progress</span>
                  <span>{row.completed_count} / {row.total_count} steps</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-black/30">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.35)] transition-all duration-700"
                    style={{ width: `${row.percent_complete}%` }}
                  />
                </div>
              </div>
            </article>
          ))}
        </main>

        {rows.length === 0 && (
          <div className="rounded-[32px] border border-white/10 bg-white/[0.06] px-8 py-24 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-300/20 bg-emerald-400/10 text-4xl">✓</div>
            <div className="text-3xl font-black text-white">No visitors waiting</div>
            <div className="mt-2 text-lg text-white/45">New Info Session visitors will appear here automatically.</div>
          </div>
        )}
      </div>
    </div>
  )
}
