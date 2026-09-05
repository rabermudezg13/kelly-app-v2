(() => {
  const path = window.location.pathname.toLowerCase()
  const isTarget = path.includes('/recruiter/') || path.includes('/management') || path.includes('/frontdesk')
  if (!isTarget) return

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
        if (labels.includes('info') || labels.includes('session') || labels.includes('badge') || labels.includes('fingerprint')) {
          el.classList.add('kelly-dashboard-nav')
        }
      }
    })
  }

  enhance()
  const observer = new MutationObserver(() => window.requestAnimationFrame(enhance))
  const root = document.getElementById('root')
  if (root) observer.observe(root, { childList: true, subtree: true })
})()
