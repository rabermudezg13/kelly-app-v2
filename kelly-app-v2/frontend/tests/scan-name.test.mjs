import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import {readFileSync} from 'node:fs'
const ctx=vm.createContext({});vm.runInContext(readFileSync(new URL('../public/dashtracker/scan-name.js',import.meta.url),'utf8'),ctx)
const w=(text,x,y,width=40,height=12)=>({text,bbox:{x0:x,y0:y,x1:x+width,y1:y+height}})
const words=[w('Kelly',50,100),w('Candidate',95,100,65),w('Name',165,100),w('Candidate',400,100,65),w('Reason',50,155)]
test('crop is bounded by printed fields and excludes adjacent ID and next row',()=>{
 const b=ctx.locateDrugNameCrop(words,900,1200);assert.ok(b);assert.ok(b.y>112);assert.ok(b.y+b.height<155);assert.ok(b.x+b.width<400)
 for(const invalid of [words.filter(w=>w.text!=='Reason'),words.slice(0,3),[]])assert.equal(ctx.locateDrugNameCrop(invalid,900,1200),null)
})
test('filename preserves readable names and removes path/control characters',()=>{
 assert.equal(ctx.drugScreenFilename(' Alex Example '),'Alex Example Drug Screening.pdf')
 assert.equal(ctx.drugScreenFilename('Alex / Example:*\n'),'Alex Example Drug Screening.pdf')
 assert.equal(ctx.drugScreenFilename(''),'Candidate Drug Screening.pdf')
 assert.ok(ctx.drugScreenFilename('x'.repeat(200)).length<130)
})
test('manual correction cancels pending OCR and late results cannot overwrite it',async()=>{
 const nodes=new Map(),events=new Map(),requests=[];
 const node=()=>({value:'',checked:false,hidden:true,textContent:'',removeAttribute(){},getContext(){return {drawImage(){}}},toDataURL(){return 'data:image/jpeg;base64,QQ=='}})
 const parent={postMessage(message){requests.push(message)}}
 const browser=vm.createContext({
  document:{getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},createElement:node},
  scanPhotos:[{dataURL:'demo'}],scanDocType:'drug',location:{origin:'https://example.test'},parent,
  crypto:{randomUUID:()=> 'test-request'},setTimeout,clearTimeout,updateScanFilename(){},
  Image:class{naturalWidth=900;naturalHeight=1200;set src(value){queueMicrotask(()=>this.onload())}},
  Tesseract:{async createWorker(){return {
   async terminate(){},
   async recognize(){return {data:{blocks:[{paragraphs:[{lines:[{words}]}]}]}}}
  }}}
 })
 browser.window=browser;browser.addEventListener=(name,fn)=>events.set(name,fn)
 vm.runInContext(readFileSync(new URL('../public/dashtracker/scan-name.js',import.meta.url),'utf8'),browser)
 browser.scanNameChanged();await new Promise(resolve=>setImmediate(resolve));assert.equal(requests.length,1)
 nodes.get('scan-name').value='Jordan Example';nodes.get('scan-name-reviewed').checked=true;browser.scanNameEdited()
 events.get('message')({origin:'https://example.test',source:parent,data:{type:'kelly:drug-name-result',id:'test-request',name:'Wrong Example'}})
 await new Promise(resolve=>setImmediate(resolve));assert.equal(nodes.get('scan-name').value,'Jordan Example');assert.equal(nodes.get('scan-name-reviewed').checked,false)
 events.get('pagehide')()
})
