export const BATCH_LIMIT = 180
export type Contact = { name: string; phone: string; row: number }
export type Skipped = { row: number; reason: string }
export function normalizePhone(value: unknown): string {
  const text = String(value ?? '').trim()
  if (!text || !/^[+\d\s().-]+$/.test(text)) return ''
  const digits = text.replace(/\D/g, '')
  // The supplied US report contains ten-digit numbers. Preserve them as text.
  if (/^\d{10}$/.test(digits)) return digits
  if (/^1\d{10}$/.test(digits)) return digits.slice(1)
  return ''
}
export function prepareContacts(rows: unknown[][], nameColumn: number, phoneColumn: number, headerRow: number, deduplicate = true) {
  if (nameColumn < 0 || phoneColumn < 0 || nameColumn === phoneColumn) throw new Error('Select different name and phone columns.')
  const contacts: Contact[] = [], skipped: Skipped[] = [], seen = new Set<string>()
  let blankRows = 0, duplicates = 0
  rows.forEach((cells, index) => {
    if (index < headerRow) return
    if (!cells.some(cell => String(cell ?? '').trim())) { blankRows++; return }
    const row = index + 1
    const name = String(cells[nameColumn] ?? '').trim()
    const phone = normalizePhone(cells[phoneColumn])
    if (!name || !phone) { skipped.push({row, reason: !name ? 'Missing name' : 'Missing or unsupported US phone'}); return }
    if (deduplicate && seen.has(phone)) { duplicates++; skipped.push({row, reason: 'Duplicate phone'}); return }
    seen.add(phone); contacts.push({name, phone, row})
  })
  return {contacts, skipped, blankRows, duplicates}
}
export function splitContacts(contacts: Contact[], size = BATCH_LIMIT): Contact[][] {
  if (!Number.isInteger(size) || size < 1 || size > BATCH_LIMIT) throw new Error('Batch size must be from 1 to 180.')
  return Array.from({length: Math.ceil(contacts.length / size)}, (_, i) => contacts.slice(i * size, (i + 1) * size))
}
function csvCell(value: string) {
  // Prevent spreadsheet formula execution when exported names are opened in Excel.
  const safe = /^[\s]*[=+@-]/.test(value) ? "'" + value : value
  return '"' + safe.replace(/"/g, '""') + '"'
}
export function contactsCsv(contacts: Contact[], countryCode = false) {
  if (contacts.length > BATCH_LIMIT) throw new Error('A CSV cannot contain more than 180 contacts.')
  return [['Name','Phone'], ...contacts.map(c => [c.name, (countryCode ? '1' : '') + c.phone])].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n'
}
export type Campaign = {date:string; location:string; sender:string; language:string; tone:string; details:string; cta:string}
export function campaignPrompt(c: Campaign) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(c.date) ? new Date(c.date + 'T12:00:00').toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}) : '[WORK DATE]'
  return `Write 3 SMS invitation options for Kelly Education substitute teachers to pick up work on ${date}.
Output language: ${c.language || 'English'}. Tone: ${c.tone || 'Warm and encouraging'}.
Sender/team: ${c.sender.trim() || 'Kelly Education Miami-Dade'}.
Area/schools: ${c.location.trim() || '[AREA OR SCHOOLS]'}.
Verified details: ${c.details.trim() || 'No additional details supplied.'}
Call to action: ${c.cta.trim() || 'Reply YES if you are available and our team will help you find an assignment.'}

Lead with an engaging, respectful hook and the opportunity to make a positive impact on students. Make the work date clear. End with one simple, actionable CTA. Include one warmer re-engagement option for substitutes who have not worked recently, without guilt or pressure. Aim for 240 characters or fewer per option; report each character count. Use only the verified details above. Do not invent pay, bonuses, availability, deadlines, links, or guaranteed assignments. Do not imply an assignment is confirmed. Avoid unnecessary emojis and keep it easy to read on a phone. If personalization is useful, show [First name] as a placeholder; do not invent Sense merge tags. Return the 3 options, then recommend the strongest and explain briefly why. Do not request or include a contact list.`
}
