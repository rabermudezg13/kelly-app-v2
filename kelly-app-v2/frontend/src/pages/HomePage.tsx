import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAnnouncements } from '../services/api'
import type { Announcement } from '../types'

function HomePage() {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    loadAnnouncements()
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const loadAnnouncements = async () => {
    try {
      const data = await getAnnouncements()
      setAnnouncements(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading announcements:', error)
      setAnnouncements([])
    }
  }

  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const timeLabel = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-300 via-emerald-100 to-green-200 bg-cover bg-center text-slate-900"
      style={{ backgroundImage: "url('/welcome-aboard.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="rounded-[24px] border border-white/55 bg-white/45 px-6 py-4 shadow-xl backdrop-blur-xl">
            <div className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              <span className="text-green-700">Kelly</span> Education
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-700">Miami-Dade</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
              Substitute Teachers · Stronger Schools · Brighter Futures
            </div>
          </div>

          <div className="rounded-[24px] border border-white/60 bg-white/55 px-6 py-3 text-right shadow-xl backdrop-blur-xl">
            <div className="text-sm font-semibold text-slate-700">{dateLabel}</div>
            <div className="text-3xl font-black tracking-tight">{timeLabel}</div>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-8">
          <section className="mb-7 w-full max-w-3xl rounded-[34px] border border-white/65 bg-white/55 px-7 py-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:px-10">
            <div className="text-2xl font-medium sm:text-3xl">Welcome to</div>
            <h1 className="mt-1 text-4xl font-black tracking-[-0.05em] sm:text-6xl">
              <span className="text-green-700">Kelly</span> Education
            </h1>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-green-600" />
            <p className="mt-4 text-base font-semibold text-slate-700 sm:text-lg">
              People <span className="mx-3 text-green-600">•</span> Opportunity <span className="mx-3 text-green-600">•</span> Community
            </p>
          </section>

          {announcements.length > 0 && (
            <section className="mb-6 w-full max-w-4xl rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-xl backdrop-blur-2xl">
              {announcements.slice(0, 2).map((announcement) => (
                <div key={announcement.id} className="rounded-2xl bg-white/55 px-5 py-3 first:mb-2 last:mb-0">
                  <div className="font-black text-slate-800">{announcement.title}</div>
                  <div className="mt-1 whitespace-pre-line text-sm text-slate-700">{announcement.message}</div>
                </div>
              ))}
            </section>
          )}

          <section className="grid w-full max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
            <button
              onClick={() => navigate('/register-visit')}
              className="group rounded-[34px] border border-white/70 bg-white/60 p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.20)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/75 hover:shadow-[0_30px_80px_rgba(15,23,42,0.24)] focus:outline-none focus:ring-4 focus:ring-green-500/30"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-green-400 to-green-700 text-5xl text-white shadow-[0_16px_40px_rgba(22,163,74,0.35)] transition group-hover:scale-105">♙+</div>
              <div className="mt-5 text-3xl font-black tracking-tight">Register Visit</div>
              <div className="mx-auto mt-2 max-w-sm text-base font-medium text-slate-600">Check in for your Info Session and start your journey with us.</div>
              <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-3xl font-bold text-white shadow-lg transition group-hover:translate-x-1">→</div>
            </button>

            <button
              onClick={() => navigate('/staff/login')}
              className="group rounded-[34px] border border-white/70 bg-white/60 p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.20)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/75 hover:shadow-[0_30px_80px_rgba(15,23,42,0.24)] focus:outline-none focus:ring-4 focus:ring-sky-500/30"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-sky-400 to-blue-700 text-5xl text-white shadow-[0_16px_40px_rgba(2,132,199,0.35)] transition group-hover:scale-105">♟</div>
              <div className="mt-5 text-3xl font-black tracking-tight">Staff</div>
              <div className="mx-auto mt-2 max-w-sm text-base font-medium text-slate-600">Access tools, manage sessions and support our visitors.</div>
              <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white shadow-lg transition group-hover:translate-x-1">→</div>
            </button>
          </section>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-3 pb-2">
          <div className="rounded-2xl border border-white/55 bg-white/50 px-5 py-3 text-sm font-semibold shadow-lg backdrop-blur-xl">🌿 Thank you for supporting our schools!</div>
          <div className="rounded-2xl border border-white/55 bg-white/50 px-6 py-3 text-center text-lg font-black italic shadow-lg backdrop-blur-xl">“Together We Make a Difference”</div>
          <div className="rounded-2xl border border-white/55 bg-white/50 px-5 py-3 text-sm font-semibold shadow-lg backdrop-blur-xl">♥ Great People Change Lives</div>
        </footer>
      </div>
    </div>
  )
}

export default HomePage
