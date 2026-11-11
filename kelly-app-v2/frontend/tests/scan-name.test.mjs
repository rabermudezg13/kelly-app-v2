import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import {readFileSync} from 'node:fs'
const code=readFileSync(new URL('../public/dashtracker/scan-name.js',import.meta.url),'utf8')
const ctx=vm.createContext({});vm.runInContext(code,ctx)
test('manual Drug Screening filename preserves readable names and removes unsafe characters',()=>{
 assert.equal(ctx.drugScreenFilename(' Alex Example '),'Alex Example Drug Screening.pdf')
 assert.equal(ctx.drugScreenFilename('Alex / Example:*\n'),'Alex Example Drug Screening.pdf')
 assert.equal(ctx.drugScreenFilename(''),'Candidate Drug Screening.pdf')
 assert.ok(ctx.drugScreenFilename('x'.repeat(200)).length<130)
})
function scanner(){
 const html=readFileSync(new URL('../public/dashtracker/index.html',import.meta.url),'utf8')
 const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(x=>x.includes('function generateScanPDF'))
 const nodes=new Map(),messages=[],pages=[]
 const node=()=>({value:'',textContent:'',style:{},hidden:true,removeAttribute(){},click(){this.clicked=true},getContext(){return {fillRect(){},drawImage(){}}},toDataURL(){return 'data:image/jpeg;base64,QQ=='}})
 const browser=vm.createContext({document:{getElementById(id){if(id.startsWith('scan-ocr')||id==='scan-name-reviewed')throw Error('Removed OCR control accessed');if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},createElement:node},toast:x=>messages.push(x),setTimeout,Blob,atob,URL:{createObjectURL:()=> 'blob:synthetic-pdf',revokeObjectURL(){}},Image:class{naturalWidth=600;naturalHeight=800;set src(x){queueMicrotask(()=>this.onload())}},PDFLib:{PDFDocument:{async create(){return {async embedJpg(){return {width:600,height:800}},addPage(dimensions){pages.push(dimensions);return {drawImage(){}}},async save(){return new Uint8Array([37,80,68,70])}}}}},console})
 vm.runInContext(code,browser);vm.runInContext(script,browser)
 return {browser,nodes,messages,pages}
}
test('manual names keep Drug Screening, Education and RFPI filenames',()=>{
 const {browser}=scanner();browser.document.getElementById('scan-name').value='Alex Example'
 for(const [type,sub,expected] of [['drug',null,'Alex Example Drug Screening.pdf'],['rfpi',null,'RFPI_Alex_Example.pdf'],['edu','Bachelors','Education_Bachelors_Alex_Example.pdf']]){
  browser.type=type;browser.sub=sub;vm.runInContext('scanDocType=type;scanEduSub=sub;updateScanFilename()',browser)
  assert.equal(vm.runInContext('getScanFilename()',browser),expected)
 }
})
test('manual Scanner generates one page per photo without OCR confirmation and still requires a name',async()=>{
 const {browser,nodes,messages,pages}=scanner()
 vm.runInContext("scanDocType='drug';scanPhotos=[{dataURL:'demo'},{dataURL:'demo2'}]",browser)
 await browser.generateScanPDF();assert.equal(pages.length,0);assert.match(messages.at(-1),/enter the candidate name/)
 browser.document.getElementById('scan-name').value='Alex Example'
 await browser.generateScanPDF();assert.equal(pages.length,2)
 const link=nodes.get('scan-download-link');assert.equal(link.download,'Alex Example Drug Screening.pdf');assert.equal(link.hidden,false);assert.equal(link.clicked,true)
 assert.equal(nodes.get('scan-gen-btn').disabled,false)
})
