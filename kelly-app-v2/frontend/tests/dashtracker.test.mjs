import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import vm from 'node:vm'
const base=new URL('../public/dashtracker/',import.meta.url)
const html=readFileSync(new URL('index.html',base),'utf8')
function setup(){
 const el=()=>({addEventListener(){},style:{},classList:{add(){},remove(){}},value:'',textContent:''})
 const ctx=vm.createContext({location:{hash:''},document:{getElementById:el,addEventListener(){},readyState:'loading'},localStorage:{getItem(){return null}},console,setTimeout(){}})
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
