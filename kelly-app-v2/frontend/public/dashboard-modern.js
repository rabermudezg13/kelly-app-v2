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

    // Find the nearest common ancestor, then identify the two direct children
    // under that ancestor. This works even when React wraps Row Generator and
    // Info Session Progress at different DOM depths.
    const rowAncestors = []
    let node = rowHeading
    while (node && node !== page) {
      rowAncestors.push(node)
      node = node.parentElement
    }

    let progressNode = progressHeading
    while (progressNode && progressNode !== page) {
      const parent = progressNode.parentElement
      if (!parent) break
      const rowNode = rowAncestors.find((candidate) => candidate.parentElement === parent)
      if (rowNode && rowNode !== progressNode) {
        if (rowNode.previousElementSibling !== progressNode) {
          parent.insertBefore(progressNode, rowNode)
        }
        return
      }
      progressNode = parent
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
