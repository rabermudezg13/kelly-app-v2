(() => {
  const path = window.location.pathname.toLowerCase()
  const isTarget = path.includes('/recruiter/') || path.includes('/management') || path.includes('/frontdesk')
  if (!isTarget) return

  const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase()

  const findHeading = (page, label) =>
    Array.from(page.querySelectorAll('h2,h3,h4')).find((el) => normalize(el.textContent) === label)

  const stabilizeRecruiterDetails = (page) => {
    if (!path.includes('/recruiter/')) return

    const rowHeading = findHeading(page, 'row generator')
    const progressHeading = findHeading(page, 'info session progress')
    if (!rowHeading || !progressHeading) return

    const rowBlock = rowHeading.parentElement
    const progressBlock = progressHeading.parentElement
    if (!(rowBlock instanceof HTMLElement) || !(progressBlock instanceof HTMLElement)) return

    // React already renders both sections inside the same Session Details stack.
    // Do NOT move DOM nodes. Visual ordering via flex order avoids fighting React.
    const detailsStack = rowBlock.parentElement
    if (detailsStack instanceof HTMLElement && detailsStack === progressBlock.parentElement) {
      detailsStack.style.setProperty('display', 'flex', 'important')
      detailsStack.style.setProperty('flex-direction', 'column', 'important')
      detailsStack.style.setProperty('gap', '1rem', 'important')
      rowBlock.style.setProperty('order', '20', 'important')
      progressBlock.style.setProperty('order', '10', 'important')

      // Everything after Progress/Row keeps its original relative order.
      Array.from(detailsStack.children).forEach((child, index) => {
        if (!(child instanceof HTMLElement) || child === rowBlock || child === progressBlock) return
        child.style.setProperty('order', index < Array.from(detailsStack.children).indexOf(rowBlock) ? '0' : String(30 + index), 'important')
      })
    }

    // Native independent viewport for Row Generator fields.
    const fields = Array.from(rowBlock.children).find((child) =>
      child instanceof HTMLElement && child.tagName === 'DIV'
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

    stabilizeRecruiterDetails(page)
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
