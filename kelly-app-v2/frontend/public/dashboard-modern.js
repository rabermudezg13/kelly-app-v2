(() => {
  const path = window.location.pathname.toLowerCase()
  const isTarget = path.includes('/recruiter/') || path.includes('/management') || path.includes('/frontdesk')
  if (!isTarget) return

  const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase()

  const keepRecruiterRowScroller = (page) => {
    if (!path.includes('/recruiter/')) return
    Array.from(page.querySelectorAll('h2,h3,h4')).forEach((heading) => {
      if (normalize(heading.textContent) !== 'row generator') return
      const rowBlock = heading.parentElement
      if (!rowBlock) return

      // The React component renders the Row Generator fields as the first div
      // immediately after the heading. Target that exact native container instead
      // of depending on a Tailwind class name that can change during rendering.
      const fields = Array.from(rowBlock.children).find((child) =>
        child instanceof HTMLElement && child.tagName === 'DIV' && child !== heading
      )
      if (!(fields instanceof HTMLElement)) return

      fields.classList.add('recruiter-row-scroll')
      fields.style.setProperty('display', 'block', 'important')
      fields.style.setProperty('height', '360px', 'important')
      fields.style.setProperty('max-height', '46vh', 'important')
      fields.style.setProperty('min-height', '260px', 'important')
      fields.style.setProperty('overflow-y', 'scroll', 'important')
      fields.style.setProperty('overflow-x', 'hidden', 'important')
      fields.style.setProperty('padding-right', '10px', 'important')
      fields.style.setProperty('overscroll-behavior', 'contain', 'important')
      fields.style.setProperty('scrollbar-gutter', 'stable', 'important')
    })
  }

  const moveRecruiterProgressAboveRows = (page) => {
    if (!path.includes('/recruiter/')) return
    const headings = Array.from(page.querySelectorAll('h2,h3,h4'))
    const rowHeading = headings.find((el) => normalize(el.textContent) === 'row generator')
    const progressHeading = headings.find((el) => normalize(el.textContent) === 'info session progress')
    if (!rowHeading || !progressHeading) return

    const rowBlock = rowHeading.parentElement
    const progressBlock = progressHeading.parentElement
    if (!rowBlock || !progressBlock) return

    // In RecruiterDashboard these are sibling sections inside the selected
    // candidate card. Move the existing Progress section, never clone it, so
    // React handlers/state remain attached to the same controls.
    if (rowBlock.parentElement && rowBlock.parentElement === progressBlock.parentElement) {
      if (rowBlock.previousElementSibling !== progressBlock) {
        rowBlock.parentElement.insertBefore(progressBlock, rowBlock)
      }
    }
  }

  const enhance = () => {
    const root = document.getElementById('root')
    const page = root?.firstElementChild
    if (!(page instanceof HTMLElement)) return
    page.classList.add('kelly-modern-dashboard')

    Array.from(page.querySelectorAll('h1')).forEach((heading) => {
      const card = heading.closest('.bg-white')
      if (card) card.classList.add('kelly-dashboard-hero')
    })

    Array.from(page.querySelectorAll('div')).forEach((el) => {
      if (!(el instanceof HTMLElement) || el.classList.contains('kelly-dashboard-nav')) return
      const buttons = Array.from(el.children).filter((child) => child.tagName === 'BUTTON')
      if (buttons.length >= 4 && buttons.length === el.children.length) {
        const labels = buttons.map((b) => normalize(b.textContent)).join(' ')
        if (labels.includes('info') || labels.includes('session') || labels.includes('badge') || labels.includes('fingerprint')) {
          el.classList.add('kelly-dashboard-nav')
        }
      }
    })

    moveRecruiterProgressAboveRows(page)
    keepRecruiterRowScroller(page)
  }

  enhance()
  let queued = false
  const observer = new MutationObserver(() => {
    if (queued) return
    queued = true
    window.requestAnimationFrame(() => {
      queued = false
      enhance()
    })
  })
  const root = document.getElementById('root')
  if (root) observer.observe(root, { childList: true, subtree: true })
})()
