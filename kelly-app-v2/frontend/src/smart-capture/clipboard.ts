/** Paste events do not cross iframe boundaries. Read the event, not clipboard.read permissions. */
export function clipboardImage(data: Pick<DataTransfer, 'items' | 'files'> | null): File | null {
  for (const item of Array.from(data?.items || [])) {
    if (!item.type.startsWith('image/')) continue
    const file = item.getAsFile()
    if (file) return file
  }
  return Array.from(data?.files || []).find(file => file.type.startsWith('image/')) || null
}

export function listenForImagePaste(editor: Window, onImage: (file: File) => void): () => void {
  const targets = [editor]
  // Only the same-origin Kelly dashboard may provide a parent paste event.
  try {
    if (editor.parent !== editor && editor.parent.location.origin === editor.location.origin) targets.push(editor.parent)
  } catch { /* Standalone or cross-origin embedding: listen inside the editor only. */ }
  const paste = (event: ClipboardEvent) => {
    const file = clipboardImage(event.clipboardData)
    if (!file) return // Preserve normal text pasting into names and dashboard inputs.
    event.preventDefault()
    onImage(file)
  }
  targets.forEach(target => target.addEventListener('paste', paste))
  return () => targets.forEach(target => target.removeEventListener('paste', paste))
}
