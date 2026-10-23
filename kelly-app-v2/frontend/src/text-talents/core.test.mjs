import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizePhone,prepareContacts,splitContacts,contactsCsv,campaignPrompt} from './core.ts'
import {openWorkbook,sheetRows,findColumns,findHeader} from './workbook.ts'
import * as XLSX from 'xlsx'
const contact=i=>({name:`Demo ${i}`,phone:`305555${String(i).padStart(4,'0')}`,row:i+2})
test('batches never exceed 180 records; source order and totals preserved at boundaries',()=>{
 for(const count of [0,1,179,180,181,360,361,1204]){
  const source=Array.from({length:count},(_,i)=>contact(i)),batches=splitContacts(source)
  assert.ok(batches.every(b=>b.length>0&&b.length<=180));assert.deepEqual(batches.flat(),source)
  assert.equal(batches.length,Math.ceil(count/180))
 }
 for(const size of [0,-1,181,1.5,NaN])assert.throws(()=>splitContacts([contact(0)],size))
 assert.throws(()=>contactsCsv(Array.from({length:181},(_,i)=>contact(i))))
})
test('US phone normalization handles numeric cells, punctuation and country code; rejects ambiguous values',()=>{
 assert.equal(normalizePhone(3055550101),'3055550101')
 assert.equal(normalizePhone('+1 (305) 555-0101'),'3055550101')
 for(const bad of ['',null,'3055550101 ext 7','3.055550101E+9','305555010','+443055550101'])assert.equal(normalizePhone(bad),'')
})
test('blank, missing and duplicate rows are explicit; mapping can change and export only includes mapped fields',()=>{
 const rows=[['Substitute','Phone','Private'],['Demo A','3055550101','not-exported'],[],['Demo B','+1 305 555 0101','hidden'],['Demo C','','hidden'],['','3055550102','hidden']]
 const result=prepareContacts(rows,0,1,1)
 assert.equal(result.contacts.length,1);assert.equal(result.blankRows,1);assert.equal(result.duplicates,1)
 assert.deepEqual(result.skipped.map(x=>x.row),[4,5,6]);assert.equal(prepareContacts(rows,0,1,1,false).contacts.length,2)
 assert.throws(()=>prepareContacts(rows,-1,1,1));assert.throws(()=>prepareContacts(rows,1,1,1))
 assert.ok(!contactsCsv(result.contacts).includes('hidden'));assert.ok(!contactsCsv(result.contacts).includes('Private'))
})
test('CSV preserves Unicode, escapes quotes and newlines, protects formulas and uses only two columns',()=>{
 const csv=contactsCsv([{name:'José, "Demo"\nSecond line',phone:'3055550101',row:2},{name:'=SUM(1,2)',phone:'3055550102',row:3}])
 const rows=XLSX.utils.sheet_to_json(XLSX.read(csv,{type:'string',raw:true}).Sheets.Sheet1,{header:1,raw:true})
 assert.deepEqual(rows[0],['Name','Phone']);assert.deepEqual(rows[1],['José, "Demo"\nSecond line','3055550101']);assert.equal(rows[2][0],"'=SUM(1,2)")
 assert.match(contactsCsv([contact(1)],true),/13055550001/)
})
test('Excel detects headers after a title; reads only selected sheet and rejects absent and oversized worksheets',()=>{
 const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([['Report'],[],['Substitute','Identifier','Phone'],['Demo',123,3055550101]]),'List')
 XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([['Name','Phone'],['Other','3055550102']]),'Other')
 const parsed=openWorkbook(XLSX.write(book,{type:'array',bookType:'xlsx'}));const rows=sheetRows(parsed,'List');assert.equal(findHeader(rows),3)
 assert.deepEqual(findColumns(rows[2]),{name:0,phone:2});assert.equal(rows[3][0],'Demo');assert.throws(()=>sheetRows(parsed,'Missing'))
 assert.equal(prepareContacts(sheetRows(parsed,'Other'),0,1,1).contacts[0].name,'Other')
 assert.deepEqual(findColumns(['Email','Address']),{name:-1,phone:-1})
 assert.throws(()=>sheetRows({SheetNames:['Huge'],Sheets:{Huge:{'!fullref':'A1:B100001'}}},'Huge'))
})
test('prompt uses verified campaign details, date and CTA without receiving contact data',()=>{
 const prompt=campaignPrompt({date:'2026-10-26',location:'Demo Area',sender:'Demo Team',language:'English',tone:'Friendly',details:'Grades K–5',cta:'Reply YES for help finding work.'})
 assert.match(prompt,/Monday, October 26, 2026/);assert.match(prompt,/Reply YES/);assert.match(prompt,/240 characters/);assert.match(prompt,/Do not invent pay/);assert.match(prompt,/Do not request or include a contact list/)
 assert.ok(!prompt.includes('3055550101'));assert.match(campaignPrompt({date:'',location:'',sender:'',language:'',tone:'',details:'',cta:''}),/\[WORK DATE\]/)
})
