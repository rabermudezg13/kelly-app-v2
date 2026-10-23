import * as XLSX from 'xlsx'
export function openWorkbook(data: ArrayBuffer) {
  const book = XLSX.read(data, {type:'array', sheetRows:100002})
  if (!book.SheetNames.length) throw new Error('The workbook has no worksheets.')
  return book
}
export function sheetRows(book: XLSX.WorkBook, name: string): unknown[][] {
  const sheet = book.Sheets[name]
  if (!sheet) throw new Error('Select a worksheet from this workbook.')
  const ref = sheet['!fullref'] || sheet['!ref']
  if (ref && XLSX.utils.decode_range(ref).e.r >= 100000) throw new Error('Use a worksheet with fewer than 100,000 rows.')
  return XLSX.utils.sheet_to_json(sheet, {header:1, raw:true, defval:'', blankrows:true})
}
const key = (v: unknown) => String(v ?? '').toLowerCase().replace(/[^a-z]/g,'')
export function findColumns(headers: unknown[]) {
  return {name: headers.findIndex(v => ['substitute','name','fullname','candidatename'].includes(key(v))), phone: headers.findIndex(v => ['phone','phonenumber','mobile','mobilephone','cellphone','cellphonenumber'].includes(key(v)))}
}
export function findHeader(rows: unknown[][]) {
  const detected = rows.slice(0,25).findIndex(row => {const c=findColumns(row);return c.name>=0 && c.phone>=0})
  return detected >= 0 ? detected + 1 : Math.max(1, rows.findIndex(row=>row.some(v=>String(v??'').trim()))+1)
}
