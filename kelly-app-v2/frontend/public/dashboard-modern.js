(() => {
  const path = window.location.pathname.toLowerCase()
  const isTarget = path.includes('/recruiter/') || path.includes('/management') || path.includes('/frontdesk')
  if (!isTarget) return

  const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase()

  const keepRecruiterRowScroller = (page) => {
    if (!path.includes('/recruiter/')) return
    Array.from(page.querySelectorAll('h3')).forEach((heading) => {
      if (normalize(heading.textContent) !== 'row generator') return
      const container = heading.parentElement
      if (!container) return
      const fields = container.querySelector('.space-y-3, .recruiter-row-scroll')
      if (!fields) return
      fields.classList.remove('grid', 'grid-cols-1', 'sm:grid-cols-2', 'xl:grid-cols-3', 'gap-3', 'items-start')
      fields.classList.add('recruiter-row-scroll')
    })
  }

  const moveRecruiterProgressAboveRows = (page) => {
    if (!path.includes('/recruiter/')) return

    const headings = Array.from(page.querySelectorAll('h2,h3,h4'))
    const rowHeading = headings.find((el) => normalize(el.textContent) === 'row generator')
    const progressHeading = headings.find((el) => normalize(el.textContent) === 'info session progress')
    if (!rowHeading || !progressHeading) return

    const rowAncestors = []
    let rowNode = rowHeading
    while (rowNode && rowNode !== page) {
      rowAncestors.push(rowNode)
      rowNode = rowNode.parentElement
    }

    let progressNode = progressHeading
    while (progressNode && progressNode !== page) {
      const parent = progressNode.parentElement
      const rowBlock = rowAncestors.find((node) => node.parentElement === parent)
      if (parent && rowBlock && progressNode !== rowBlock) {
        if (rowBlock.previousElementSibling !== progressNode) parent.insertBefore(progressNode, rowBlock)
        return
      }
      progressNode = progressNode.parentElement
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
        if (labels.includes('info') || labels.includes('session') || labels.includes('badge') || labels.includes('fingerprint')) el.classList.add('kelly-dashboard-nav')
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
    window.requestAnimationFrame(() => { queued = false; enhance() })
  })
  const root = document.getElementById('root')
  if (root) observer.observe(root, { childList: true, subtree: true })
})()
