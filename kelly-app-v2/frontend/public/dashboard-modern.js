(() => {
  const path = window.location.pathname.toLowerCase()
  const isTarget = path.includes('/recruiter/') || path.includes('/management') || path.includes('/frontdesk')
  if (!isTarget) return

  const closePanel = () => document.getElementById('info-progress-drawer')?.classList.remove('open')
  const openPanel = () => document.getElementById('info-progress-drawer')?.classList.add('open')

  const addProgressPanel = () => {
    if (document.getElementById('info-progress-panel-trigger')) return
    const page = document.getElementById('root')?.firstElementChild
    if (!(page instanceof HTMLElement)) return

    const trigger = document.createElement('button')
    trigger.id = 'info-progress-panel-trigger'
    trigger.type = 'button'
    trigger.className = 'info-progress-panel-trigger'
    trigger.innerHTML = '<span class="info-progress-trigger-dot"></span><span>Info Session Progress</span><span aria-hidden="true">›</span>'
    trigger.addEventListener('click', openPanel)

    const header = page.querySelector('h1')?.parentElement
    if (header) header.appendChild(trigger)
    else page.prepend(trigger)

    const drawer = document.createElement('div')
    drawer.id = 'info-progress-drawer'
    drawer.className = 'info-progress-drawer'
    drawer.innerHTML = `
      <button type="button" class="info-progress-backdrop" aria-label="Close Info Session Progress"></button>
      <aside class="info-progress-sheet" role="dialog" aria-modal="true" aria-label="Info Session Progress">
        <div class="info-progress-sheet-header">
          <div><span class="info-progress-eyebrow">LIVE WORKFLOW</span><h2>Info Session Progress</h2><p>View and update progress without leaving your dashboard.</p></div>
          <button type="button" class="info-progress-close" aria-label="Close">×</button>
        </div>
        <div class="info-progress-frame-wrap">
          <iframe class="info-progress-frame" src="/info-session-progress" title="Info Session Progress"></iframe>
        </div>
      </aside>`
    document.body.appendChild(drawer)
    drawer.querySelector('.info-progress-backdrop')?.addEventListener('click', closePanel)
    drawer.querySelector('.info-progress-close')?.addEventListener('click', closePanel)
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closePanel() })
  }

  const enhance = () => {
    const root = document.getElementById('root')
    const page = root?.firstElementChild
    if (!(page instanceof HTMLElement)) return
    page.classList.add('kelly-modern-dashboard')

    const headings = Array.from(page.querySelectorAll('h1'))
    headings.forEach((heading) => {
      const card = heading.closest('.bg-white')
      if (card) card.classList.add('kelly-dashboard-hero')
    })

    const candidates = Array.from(page.querySelectorAll('div'))
    candidates.forEach((el) => {
      if (!(el instanceof HTMLElement) || el.classList.contains('kelly-dashboard-nav')) return
      const buttons = Array.from(el.children).filter((child) => child.tagName === 'BUTTON')
      if (buttons.length >= 4 && buttons.length === el.children.length) {
        const labels = buttons.map((b) => (b.textContent || '').toLowerCase()).join(' ')
        if (labels.includes('info') || labels.includes('session') || labels.includes('badge') || labels.includes('fingerprint')) el.classList.add('kelly-dashboard-nav')
      }
    })
    addProgressPanel()
  }

  enhance()
  const observer = new MutationObserver(() => window.requestAnimationFrame(enhance))
  const root = document.getElementById('root')
  if (root) observer.observe(root, { childList: true, subtree: true })
})()
