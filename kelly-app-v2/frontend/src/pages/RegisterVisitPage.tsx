import { useNavigate } from 'react-router-dom'

function RegisterVisitPage() {
  const navigate = useNavigate()

  const visitTypes = [
    { id: 'info-session', title: 'Info Session', icon: '📋', description: 'Information session registration', route: '/info-session', accent: 'from-emerald-400 to-green-700' },
    { id: 'new-hire-orientation', title: 'Substitute Orientation', icon: '👔', description: 'Mandatory Orientation', route: '/new-hire-orientation', accent: 'from-sky-400 to-blue-700' },
    { id: 'badges', title: 'Badges', icon: '🪪', description: 'Badge processing and creation', route: '/badges', accent: 'from-violet-400 to-indigo-700' },
    { id: 'fingerprints', title: 'Fingerprints', icon: '👆', description: 'Fingerprint appointment scheduling', route: '/fingerprints', accent: 'from-amber-400 to-orange-600' },
    { id: 'team-visit', title: 'Team Visit', icon: '👥', description: 'Team or group visit registration', route: '/team-visit', accent: 'from-cyan-400 to-teal-700' },
    { id: 'paraprofessionals', title: 'Paraprofessionals', icon: '🎓', description: 'Paraprofessional registration', route: '/paraprofessionals', accent: 'from-rose-400 to-pink-700' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-sky-950" />
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-sky-400/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-green-300/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-5 flex items-center justify-between sm:mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/10"
          >
            <span className="text-lg">←</span> Home
          </button>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-right text-white shadow-lg backdrop-blur-xl">
            <div className="text-lg font-black tracking-tight"><span className="text-emerald-300">Kelly</span> Education</div>
            <div className="text-xs font-semibold text-white/65">Miami-Dade</div>
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center">
          <section className="mb-6 text-center sm:mb-9">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200 backdrop-blur-xl">
              Visitor Check-In
            </div>
            <h1 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">What brings you in today?</h1>
            <p className="mx-auto mt-3 max-w-2xl text-base font-medium text-white/65 sm:text-lg">Choose your visit type below. We’ll take you directly to the right check-in.</p>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {visitTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => navigate(type.route)}
                className="group relative overflow-hidden rounded-[26px] border border-white/20 bg-white/90 p-4 text-left shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_28px_70px_rgba(0,0,0,0.30)] focus:outline-none focus:ring-4 focus:ring-emerald-300/30 sm:rounded-[32px] sm:p-6"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${type.accent}`} />
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br ${type.accent} text-3xl shadow-lg transition duration-300 group-hover:scale-110 sm:h-16 sm:w-16 sm:rounded-[20px] sm:text-4xl`}>
                    {type.icon}
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-xl font-black text-slate-500 transition group-hover:bg-slate-900 group-hover:text-white">→</div>
                </div>
                <h2 className="mt-4 text-lg font-black leading-tight tracking-tight text-slate-900 sm:text-2xl">{type.title}</h2>
                <p className="mt-2 hidden text-sm font-medium leading-relaxed text-slate-500 sm:block">{type.description}</p>
                <div className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-400 sm:mt-6">Tap to continue</div>
              </button>
            ))}
          </section>
        </main>

        <footer className="mt-6 text-center text-xs font-semibold text-white/45 sm:mt-8 sm:text-sm">
          Select the option that best matches your visit · Kelly Education Miami-Dade
        </footer>
      </div>
    </div>
  )
}

export default RegisterVisitPage
