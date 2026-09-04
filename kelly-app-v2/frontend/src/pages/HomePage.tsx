import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAnnouncements } from '../services/api'
import type { Announcement } from '../types'

function HomePage() {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [now, setNow] = useState(new Date())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  const timeLabel = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const heroImage = '/welcome-aboard.jp.png'

  const mobileNavigate = (path: string) => {
    setMobileMenuOpen(false)
    navigate(path)
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-sky-100 text-slate-900">
      <div className="absolute inset-0 hidden bg-cover bg-center sm:block" style={{ backgroundImage: `url('${heroImage}')` }} />
      <div className="absolute inset-x-0 top-0 h-[58vh] min-h-[390px] bg-cover bg-center bg-no-repeat sm:hidden" style={{ backgroundImage: `url('${heroImage}')` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/10 to-sky-100/65 sm:bg-white/10" />
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 sm:px-8 sm:py-5 lg:px-12">
        <header className="relative flex items-start justify-between gap-3 sm:gap-4">
          <div className="rounded-[20px] border border-white/60 bg-white/55 px-4 py-3 shadow-xl backdrop-blur-xl sm:rounded-[24px] sm:px-6 sm:py-4">
            <div className="text-2xl font-black tracking-[-0.04em] sm:text-4xl"><span className="text-green-700">Kelly</span> Education</div>
            <div className="mt-1 text-base font-semibold text-slate-700 sm:text-lg">Miami-Dade</div>
            <div className="mt-1 hidden text-xs font-bold uppercase tracking-[0.16em] text-slate-600 sm:block">Substitute Teachers · Stronger Schools · Brighter Futures</div>
          </div>

          <div className="hidden rounded-[20px] border border-white/60 bg-white/60 px-4 py-3 text-right shadow-xl backdrop-blur-xl sm:block sm:rounded-[24px] sm:px-6">
            <div className="text-sm font-semibold text-slate-700">{dateLabel}</div>
            <div className="text-3xl font-black tracking-tight">{timeLabel}</div>
          </div>

          <div className="relative sm:hidden">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-3xl font-black leading-none shadow-xl backdrop-blur-2xl active:scale-95"
            >
              ⋮
            </button>
            {mobileMenuOpen && (
              <div className="absolute right-0 top-16 z-30 w-64 overflow-hidden rounded-[24px] border border-white/70 bg-white/90 p-2 shadow-2xl backdrop-blur-2xl">
                <button onClick={() => mobileNavigate('/register-visit')} className="flex w-full items-center gap-3 rounded-[18px] px-4 py-4 text-left font-black text-slate-800 transition hover:bg-green-50">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-xl text-white">+</span>
                  <span><span className="block">Register Visit</span><span className="block text-xs font-medium text-slate-500">Visitor check-in</span></span>
                </button>
                <button onClick={() => mobileNavigate('/staff/login')} className="mt-1 flex w-full items-center gap-3 rounded-[18px] px-4 py-4 text-left font-black text-slate-800 transition hover:bg-blue-50">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg text-white">♟</span>
                  <span><span className="block">Staff</span><span className="block text-xs font-medium text-slate-500">Staff access</span></span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-end pb-4 pt-[43vh] sm:justify-center sm:py-8">
          <section className="mb-4 w-full max-w-3xl rounded-[28px] border border-white/70 bg-white/68 px-5 py-4 text-center shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:mb-7 sm:rounded-[34px] sm:px-10 sm:py-6">
            <div className="text-xl font-medium sm:text-3xl">Welcome to</div>
            <h1 className="mt-1 text-4xl font-black tracking-[-0.05em] sm:text-6xl"><span className="text-green-700">Kelly</span> Education</h1>
            <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-green-600 sm:mt-4" />
          </section>

          {announcements.length > 0 && (
            <section className="mb-4 w-full max-w-4xl rounded-[22px] border border-white/60 bg-white/68 p-3 shadow-xl backdrop-blur-2xl sm:mb-6 sm:rounded-[24px] sm:p-4">
              {announcements.slice(0, 2).map((announcement) => (
                <div key={announcement.id} className="rounded-2xl bg-white/55 px-4 py-3 first:mb-2 last:mb-0 sm:px-5">
                  <div className="font-black text-slate-800">{announcement.title}</div>
                  <div className="mt-1 whitespace-pre-line text-sm text-slate-700">{announcement.message}</div>
                </div>
              ))}
            </section>
          )}

          <section className="hidden w-full max-w-4xl grid-cols-2 gap-5 sm:grid">
            <button onClick={() => navigate('/register-visit')} className="group rounded-[34px] border border-white/70 bg-white/72 p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.20)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/80 focus:outline-none focus:ring-4 focus:ring-green-500/30">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-green-400 to-green-700 text-5xl text-white shadow-lg transition group-hover:scale-105">♙+</div>
              <div className="mt-5 text-3xl font-black tracking-tight">Register Visit</div>
              <div className="mx-auto mt-2 max-w-sm text-base font-medium text-slate-600">Check in for your Info Session and start your journey with us.</div>
              <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-3xl font-bold text-white shadow-lg">→</div>
            </button>
            <button onClick={() => navigate('/staff/login')} className="group rounded-[34px] border border-white/70 bg-white/72 p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.20)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/80 focus:outline-none focus:ring-4 focus:ring-sky-500/30">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-sky-400 to-blue-700 text-5xl text-white shadow-lg transition group-hover:scale-105">♟</div>
              <div className="mt-5 text-3xl font-black tracking-tight">Staff</div>
              <div className="mx-auto mt-2 max-w-sm text-base font-medium text-slate-600">Access tools, manage sessions and support our visitors.</div>
              <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white shadow-lg">→</div>
            </button>
          </section>
        </main>

        <footer className="grid gap-2 pb-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          <div className="rounded-2xl border border-white/55 bg-white/68 px-4 py-3 text-center text-sm font-semibold shadow-lg backdrop-blur-xl sm:px-5">🌿 Thank you for supporting our schools!</div>
          <div className="rounded-2xl border border-white/55 bg-white/68 px-4 py-3 text-center text-base font-black italic shadow-lg backdrop-blur-xl sm:px-6 sm:text-lg">“Together We Make a Difference”</div>
          <div className="rounded-2xl border border-white/55 bg-white/68 px-4 py-3 text-center text-sm font-semibold shadow-lg backdrop-blur-xl sm:px-5">♥ Great People Change Lives</div>
        </footer>
      </div>
    </div>
  )
}

export default HomePage
