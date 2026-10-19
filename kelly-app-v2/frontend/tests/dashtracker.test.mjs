import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import vm from 'node:vm'
const base=new URL('../public/dashtracker/',import.meta.url)
const html=readFileSync(new URL('index.html',base),'utf8')
function setup(profile=null){
 const el=()=>({addEventListener(){},style:{},classList:{add(){},remove(){}},value:'',textContent:''})
 const nodes=new Map();
 const ctx=vm.createContext({location:{hash:profile?'#'+encodeURIComponent(JSON.stringify(profile)):''},document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,el());return nodes.get(id)},addEventListener(){},readyState:'loading'},localStorage:{getItem(){return null}},console,setTimeout(){}})
 vm.runInContext(readFileSync(new URL('integration.js',base),'utf8'),ctx)
 const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function parseRows'))
 vm.runInContext(script,ctx);vm.runInContext('buildDash=()=>{}',ctx);return ctx
}
test('original pending rules and complete rows survive integration',()=>{
 const ctx=setup();ctx.rows=[{'Applicant Name':'Alex Demo','Talent Email':'demo@example.test','MDPS Training':'Pass','FP Screening':'Approved','I-9':'Completed'},{'Applicant Name':'Sam Demo','MDPS Training':'Pending','FP Screening':'Info Requested','I-9':'Initiated'}];vm.runInContext('parseRows(rows)',ctx)
 assert.equal(vm.runInContext('talents.length',ctx),2)
 assert.equal(vm.runInContext('talents[0].missing.length',ctx),0)
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(talents[1].missing)',ctx)),['MDPS Training','I-9','FP Screening (Info Requested)'])
})
test('spreadsheet HTML is escaped and CSV quotes/formulas are safe',()=>{
 const ctx=setup();assert.equal(vm.runInContext('escapeTrackerHtml("<img onerror=x>")',ctx),'&lt;img onerror=x&gt;')
 assert.equal(vm.runInContext('trackerCsvCell(\'Alex "Demo"\')',ctx),'"Alex ""Demo"""')
 assert.equal(vm.runInContext('trackerCsvCell("=1+1")',ctx),'"\'=1+1"')
})
test('PDF template and Help are bundled',()=>{
 assert.ok(readFileSync(new URL('drug_form.pdf',base)).subarray(0,5).equals(Buffer.from('%PDF-')))
 assert.match(readFileSync(new URL('manual.html',base),'utf8'),/Scanner/)
})

test('FP Info Requested is counted consistently with its detail list',()=>{const ctx=setup();assert.equal(vm.runInContext("trackerHasMissing({missing:['FP Screening (Info Requested)']},'FP Screening')",ctx),true);assert.equal(vm.runInContext("trackerHasMissing({missing:['I-9']},'FP Screening')",ctx),false)})

import XLSX from 'xlsx'
const recruiterCases=[['Rodrigo','Rodrigo'],['Rodrigo Bermudez','Rodrigo'],['Miccael Val','Miccael'],['Jorge Silva','Jorge'],['Demetrius Lee','Demetrius']]
function workbook(format='xlsx') {
 const wb=XLSX.utils.book_new();
 for(const name of ['Landing Page','Recruiting','Rodrigo','Miccael','Jorge','Demetrius','Nicolette','Info Requested','Template']) {
  const rows=[['Applicant Name','KSN ID','I-9'],[name+' Example','123','Completed']];
  if(['Miccael','Jorge','Demetrius'].includes(name))rows.unshift(['Legend']);
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),name);
 }
 return XLSX.write(wb,{type:'buffer',bookType:format});
}
for(const format of ['xlsx','xls'])test('only assigned worksheet is parsed: '+format,()=>{
 const ctx=setup();ctx.bytes=workbook(format);ctx.reader=XLSX;
 for(const [name,sheet] of recruiterCases){
  ctx.profile={scope:'test',name};
  const selected=vm.runInContext('trackerReadWorkbook(bytes,profile,reader)',ctx);
  assert.equal(selected.name,sheet);
  ctx.selected=selected;
  const rows=vm.runInContext('trackerRowsFromSheet(selected.sheet,reader)',ctx);
  assert.equal(rows.length,1);assert.equal(rows[0]['Applicant Name'],sheet+' Example');
 }
})
test('unknown, missing, standalone and ambiguous matches never fall back',()=>{
 const ctx=setup();ctx.names=['Landing Page','Recruiting','Jorge','Rodrigo Archive'];
 for(const profile of [{scope:'test',name:'Rodrigo'},{scope:'test',name:'Nicolette'},{scope:'standalone',name:'Jorge Silva'},{scope:'test',name:''}]){
  ctx.profile=profile;assert.throws(()=>vm.runInContext('trackerResolveSheet(names,profile)',ctx));
 }
 ctx.profile={scope:'test',name:'Rodrigo'};ctx.names=['Rodrigo',' RODRIGO '];assert.throws(()=>vm.runInContext('trackerResolveSheet(names,profile)',ctx));
 ctx.names=['  RÓDRIGO  ','Rodrigo Archive'];assert.equal(vm.runInContext('trackerResolveSheet(names,profile)',ctx),'  RÓDRIGO  ');
})
test('reader inspects metadata then requests only assigned sheet; sender edits cannot change it',()=>{
 const ctx=setup();const calls=[];ctx.profile={scope:'test',name:'Miccael Val'};
 ctx.reader={read(_data,options){calls.push(options);return options.bookSheets?{SheetNames:['Recruiting','Miccael','Rodrigo']}:{Sheets:{Miccael:{}}}}};
 vm.runInContext("SENDER.name='Rodrigo';trackerReadWorkbook(new Uint8Array(),profile,reader)",ctx);
 assert.equal(calls.length,2);assert.equal(calls[0].bookSheets,true);assert.equal(calls[1].sheets,'Miccael');
})
test('rejects malformed header and treats an empty assigned sheet as empty',()=>{
 const ctx=setup();ctx.reader=XLSX;ctx.sheet=XLSX.utils.aoa_to_sheet([['Other','Headers'],['Example','123']]);
 assert.throws(()=>vm.runInContext('trackerRowsFromSheet(sheet,reader)',ctx));
 ctx.sheet=XLSX.utils.aoa_to_sheet([['Applicant Name','KSN ID']]);assert.equal(vm.runInContext('trackerRowsFromSheet(sheet,reader).length',ctx),0);
})
test('failed replacement clears prior applicants and CSV never reaches parser',()=>{
 const ctx=setup({id:'test',name:'Rodrigo'});let parseCount=0;const readers=[];
 ctx.FileReader=class{constructor(){readers.push(this)}readAsArrayBuffer(){}};
 ctx.XLSX={read(){parseCount++;return {SheetNames:['Jorge']}}};
 vm.runInContext("talents=[{name:'Previous Example'}];curList=talents;loadFile({name:'other.xlsx'})",ctx);
 readers[0].onload({target:{result:new ArrayBuffer(1)}});
 assert.equal(vm.runInContext('talents.length+curList.length',ctx),0);
 assert.match(ctx.document.getElementById('tracker-import-error').textContent,/not found/);
 vm.runInContext("loadFile({name:'unscoped.csv'})",ctx);assert.equal(parseCount,1);
 assert.match(ctx.document.getElementById('tracker-import-error').textContent,/CSV/);
})
test('an earlier file load cannot overwrite a newer request',()=>{
 const ctx=setup({id:'test',name:'Rodrigo'});const readers=[];let count=0;
 ctx.FileReader=class{constructor(){readers.push(this)}readAsArrayBuffer(){}};
 ctx.XLSX={read(){count++;throw new Error('Not needed')}};
 vm.runInContext("loadFile({name:'old.xlsx'});loadFile({name:'new.xlsx'})",ctx);
 readers[0].onload({target:{result:new ArrayBuffer(1)}});assert.equal(count,0);
})
