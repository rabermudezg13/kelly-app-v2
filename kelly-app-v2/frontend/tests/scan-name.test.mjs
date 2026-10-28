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
   async setParameters(){},
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

test('two layouts combine verified boundaries when neither alone identifies the field',async()=>{
 const page=words.filter(w=>!(w.text==='Candidate'&&w.bbox.x0===400));
 const sparse=[words.find(w=>w.text==='Candidate'&&w.bbox.x0===400)];
 assert.equal(ctx.locateDrugNameCrop(page,900,1200),null);assert.equal(ctx.locateDrugNameCrop(sparse,900,1200),null);
 const modes=[],results=[page,sparse];let calls=0,retries=0;
 const worker={async setParameters(p){modes.push(p.tessedit_pageseg_mode)},async recognize(){calls++;return {data:{blocks:[{paragraphs:[{lines:[{words:results.shift()}]}]}]}}}};
 const box=await ctx.readDrugNameField(worker,{},900,1200,()=>true,()=>retries++);
 assert.ok(box);assert.ok(box.x+box.width<400);assert.deepEqual(modes,['3','11']);assert.equal(calls,2);assert.equal(retries,1);
})
test('layout retry stops on success, missing labels and cancelled generation',async()=>{
 let calls=0,current=true;
 const good={async setParameters(){},async recognize(){calls++;return {data:{blocks:[{paragraphs:[{lines:[{words}]}]}]}}}};
 assert.ok(await ctx.readDrugNameField(good,{},900,1200));assert.equal(calls,1);
 calls=0;
 const empty={async setParameters(){},async recognize(){calls++;return {data:{blocks:[]}}}};
 assert.equal(await ctx.readDrugNameField(empty,{},900,1200),null);assert.equal(calls,2);
 calls=0;
 const cancelled={async setParameters(){},async recognize(){calls++;current=false;return {data:{blocks:[]}}}};
 assert.equal(await ctx.readDrugNameField(cancelled,{},900,1200,()=>current),null);assert.equal(calls,1);
})
