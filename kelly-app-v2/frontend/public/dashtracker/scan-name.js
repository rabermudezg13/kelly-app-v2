/* Printed labels are located locally; only the handwritten name strip leaves the browser. */
(function(root){
 function drugScreenFilename(value){
  const name=String(value||'').normalize('NFKC').replace(/[<>:"/\\|?*\x00-\x1f]/g,'').replace(/\s+/g,' ').trim().replace(/[. ]+$/g,'').slice(0,100)||'Candidate';
  return name+' Drug Screening.pdf';
 }
 function locateNameCrop(words,width,height){
  const clean=w=>String(w.text||'').replace(/[^a-z]/gi,'').toLowerCase();
  for(let i=0;i<words.length-2;i++){
   const a=words[i],b=words[i+1],c=words[i+2];
   if(clean(a)!=='kelly'||clean(b)!=='candidate'||clean(c)!=='name')continue;
   const label={x0:a.bbox.x0,y0:Math.min(a.bbox.y0,b.bbox.y0,c.bbox.y0),x1:c.bbox.x1,y1:Math.max(a.bbox.y1,b.bbox.y1,c.bbox.y1)};
   const lineH=label.y1-label.y0;
   if(lineH<5||label.y0>height*.5)continue;
   const right=words.filter(w=>clean(w)==='candidate'&&w.bbox.x0>label.x1&&Math.abs(w.bbox.y0-label.y0)<lineH*2).sort((a,b)=>a.bbox.x0-b.bbox.x0)[0];
   const below=words.filter(w=>clean(w)==='reason'&&Math.abs(w.bbox.x0-label.x0)<lineH*4&&w.bbox.y0>label.y1&&w.bbox.y0-label.y1<lineH*7).sort((a,b)=>a.bbox.y0-b.bbox.y0)[0];
   // No guessed crop: both adjacent field boundaries must be recognized locally.
   if(!right||!below)continue;
   const glyphH=Math.min(lineH,right.bbox.y1-right.bbox.y0);
   const x=Math.max(0,label.x0-glyphH*.15),y=Math.max(label.y1,right.bbox.y1)+glyphH*.05;
   const w=right.bbox.x0-glyphH*.65-x,h=below.bbox.y0-glyphH*.25-y;
   if(w>100&&h>=10&&w/h>=2&&w/h<=30&&x+w<=width&&y+h<=height)return {x,y,width:w,height:h};
  }
  return null;
 }
 async function readNameField(worker,canvas,width,height,isCurrent=()=>true,onRetry=()=>{}){
  const words=[];
  // AUTO reads the form as a page; SPARSE_TEXT recovers isolated field labels.
  // Both use the same pixels, so verified boundaries can be combined safely.
  for(const mode of ['3','11']){
   if(!isCurrent())return null;
   if(mode==='11')onRetry();
   await worker.setParameters({tessedit_pageseg_mode:mode});
   const result=await worker.recognize(canvas,{}, {blocks:true});
   if(!isCurrent())return null;
   for(const block of result.data.blocks||[])for(const p of block.paragraphs||[])for(const line of p.lines||[])words.push(...line.words);
   const box=locateNameCrop(words,width,height);
   if(box)return box;
  }
  return null;
 }
 root.readDrugNameField=readNameField;
 root.drugScreenFilename=drugScreenFilename;
 root.locateDrugNameCrop=locateNameCrop;
 if(typeof document==='undefined')return;
 let generation=0,lastPhoto=null,lastType=null,suggested='',worker=null,pending=null;
 const get=id=>document.getElementById(id),status=text=>{get('scan-ocr-status').textContent=text};
 function cancel(){generation++;if(worker){worker.terminate();worker=null}if(pending){clearTimeout(pending.timer);pending.reject(Error('cancelled'));pending=null}}
 function imageOf(url){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Photo could not be opened.'));im.src=url})}
 function requestName(crop){return new Promise((resolve,reject)=>{
  if(parent===window){reject(Error('Open Scanner from your recruiter dashboard to recognize a name.'));return}
  const id=crypto.randomUUID(),timer=setTimeout(()=>{pending=null;reject(Error('Recognition timed out. Enter the name manually or retry.'))},70000);
  pending={id,resolve,reject,timer};parent.postMessage({type:'kelly:drug-name',id,crop},location.origin);
 })}
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='kelly:drug-name-result'||e.data.id!==pending?.id)return;
  const p=pending;pending=null;clearTimeout(p.timer);
  if(e.data.error)p.reject(Error(e.data.error));else p.resolve(String(e.data.name||''));
 });
 async function readName(force=false){
  cancel();const ticket=generation,photo=scanPhotos[0],field=get('scan-name'),original=field.value;
  get('scan-name-reviewed').checked=false;get('scan-name-crop').hidden=true;
  if(scanDocType!=='drug'||!photo)return;
  if(!force&&original.trim()&&original!==suggested){status('Name entered manually. Use Read name again to replace it.');return}
  status('Finding Kelly Candidate Name in your photo…');
  let ownWorker;
  try{
   const image=await imageOf(photo.dataURL);if(ticket!==generation)return;
   const scale=Math.min(1,1800/image.naturalWidth),canvas=document.createElement('canvas');canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale*.5);
   canvas.getContext('2d').drawImage(image,0,0,image.naturalWidth,image.naturalHeight*.5,0,0,canvas.width,canvas.height);
   let expired=false,initTimer;
   try{ownWorker=await Promise.race([
    Tesseract.createWorker('eng',1,{workerPath:'/capture-assets/worker.min.js',corePath:'/capture-assets/core',langPath:'/capture-assets/lang',cacheMethod:'none',workerBlobURL:false}).then(w=>{if(expired||ticket!==generation){w.terminate();throw Error('Recognition cancelled.')}return w}),
    new Promise((_,reject)=>{initTimer=setTimeout(()=>{expired=true;reject(Error('Local label reader timed out. Enter the name manually or retry.'))},30000)})
   ])}finally{clearTimeout(initTimer)}
   if(ticket!==generation){await ownWorker.terminate();return}worker=ownWorker;
   const timer=setTimeout(()=>ownWorker.terminate(),30000);
   let box;try{box=await readNameField(ownWorker,canvas,canvas.width,Math.round(image.naturalHeight*scale),()=>ticket===generation,()=>status('Checking the form layout again…'))}finally{clearTimeout(timer)}
   if(ticket!==generation)return;
   await ownWorker.terminate();worker=null;ownWorker=null;
   if(!box){status('The name field could not be located safely. Enter the candidate name manually, or retake a straight, clear photo of the complete form. No crop was sent.');return}
   const strip=document.createElement('canvas'),outScale=Math.min(1,1600/(box.width/scale));strip.width=Math.round(box.width/scale*outScale);strip.height=Math.round(box.height/scale*outScale);
   if(strip.height>320||strip.height<16){status('The name line is too small or unclear. Enter it manually or retake the photo.');return}
   strip.getContext('2d').drawImage(image,box.x/scale,box.y/scale,box.width/scale,box.height/scale,0,0,strip.width,strip.height);
   const crop=strip.toDataURL('image/jpeg',.92);if(crop.length>350000)throw Error('Name crop is too large. Enter the name manually.');
   get('scan-name-crop').src=crop;get('scan-name-crop').hidden=false;status('Reading handwriting with Kelly App…');
   const name=await requestName(crop);
   if(ticket!==generation||scanDocType!=='drug'||scanPhotos[0]!==photo||field.value!==original)return;
   if(!name){status('The handwritten name could not be read reliably. Enter it manually and check it before downloading.');return}
   field.value=name;suggested=name;get('scan-name-reviewed').checked=false;updateScanFilename();status('Name suggested. Compare it with the photo, correct it if needed, then check the confirmation.');
  }catch(e){if(ticket===generation)status(e.message==='cancelled'?'Recognition cancelled.':e.message||'Could not read the name. Enter it manually.')}
  finally{if(ownWorker){await ownWorker.terminate();if(worker===ownWorker)worker=null}}
 }
 root.scanNameEdited=()=>{cancel();get('scan-name-reviewed').checked=false;status('Name changed. Review it before downloading.')};
 root.scanNameChanged=()=>{
  get('scan-name-ocr').hidden=scanDocType!=='drug';
  if(lastPhoto===scanPhotos[0]&&lastType===scanDocType)return;
  cancel();const photoChanged=lastPhoto!==scanPhotos[0];lastPhoto=scanPhotos[0];lastType=scanDocType;
  get('scan-name-reviewed').checked=false;
  if(photoChanged&&get('scan-name').value===suggested){get('scan-name').value='';suggested='';updateScanFilename()}
  if(scanDocType==='drug'&&scanPhotos.length)void readName();else{get('scan-name-crop').hidden=true;get('scan-name-crop').removeAttribute('src');status('Add a photo to read Kelly Candidate Name.')}
 };
 get('scan-ocr-retry').onclick=()=>void readName(true);
 window.addEventListener('pagehide',cancel);
})(globalThis);
