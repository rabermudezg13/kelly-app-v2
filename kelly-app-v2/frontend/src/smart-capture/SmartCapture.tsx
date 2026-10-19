import React, { useEffect, useRef, useState } from 'react'
import { clampCover, fileName, renderCovered, type Cover } from './geometry'
import { listenForImagePaste } from './clipboard'
import './capture.css'

export default function SmartCapture() {
  const [image,setImage]=useState<HTMLImageElement|null>(null)
  const [covers,setCovers]=useState<Cover[]>([]), [selected,setSelected]=useState(0)
  const [name,setName]=useState(''), [status,setStatus]=useState('Ready for your screenshot')
  const [busy,setBusy]=useState(false), [reviewed,setReviewed]=useState(false)
  const canvas=useRef<HTMLCanvasElement>(null), input=useRef<HTMLInputElement>(null)
  const generation=useRef(0), controller=useRef<AbortController|null>(null), currentUrl=useRef('')
  const dragging=useRef(false)
  const clear=()=>{generation.current++;controller.current?.abort();URL.revokeObjectURL(currentUrl.current);currentUrl.current='';setImage(null);setCovers([]);setName('');setReviewed(false);setBusy(false);setStatus('Ready for your screenshot')}
  useEffect(()=>()=>{generation.current++;controller.current?.abort();URL.revokeObjectURL(currentUrl.current)},[])
  useEffect(()=>{
    if(!image||!canvas.current)return
    const out=renderCovered(image,image.naturalWidth,image.naturalHeight,covers)
    canvas.current.width=out.width;canvas.current.height=out.height;canvas.current.getContext('2d')!.drawImage(out,0,0)
  },[image,covers])
  const load=async(file:Blob)=>{
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)){setStatus('Select a PNG, JPEG, or WebP image.');return}
    if(file.size>20*1024*1024){setStatus('The image exceeds 20 MB. Use a smaller screenshot.');return}
    clear();const job=++generation.current;setBusy(true);setStatus('Processing the screenshot on this computer…')
    const url=URL.createObjectURL(file);currentUrl.current=url
    try {
      const img=new Image();img.src=url;await img.decode()
      if(job!==generation.current)return
      if(img.naturalWidth*img.naturalHeight>24000000)throw new Error('The image exceeds 24 megapixels. Crop it before opening.')
      setImage(img);controller.current=new AbortController()
      const {analyze}=await import('./analyze')
      if(job!==generation.current)return
      const result=await analyze(img,controller.current.signal,partial=>{if(job===generation.current){setName(partial.name);setCovers(partial.covers);setSelected(0)}})
      if(job!==generation.current)return
      setName(result.name);setCovers(result.covers);setSelected(0)
      setStatus(result.warnings.join(' ')||'Name and cover suggested. Check that the entire photo is covered.')
    }catch(error){if(job===generation.current)setStatus(error instanceof Error?error.message:'Unable to open the image.')}
    finally{if(job===generation.current)setBusy(false)}
  }
  useEffect(()=>listenForImagePaste(window,file=>{void load(file)}),[])
  const pasteButton=async()=>{try{const items=await navigator.clipboard.read();for(const item of items){const type=item.types.find(t=>t.startsWith('image/'));if(type){await load(await item.getType(type));return}}setStatus('There is no image on the clipboard.')}catch{setStatus('Click this panel and paste with Ctrl+V or ⌘V, or open an image.')}}
  const update=(cover:Cover)=>{if(!image)return;setReviewed(false);setCovers(old=>old.map((r,i)=>i===selected?clampCover(cover,image.naturalWidth,image.naturalHeight):r))}
  const point=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(!image||busy)return
    const b=event.currentTarget.getBoundingClientRect(),x=(event.clientX-b.left)/b.width*image.naturalWidth,y=(event.clientY-b.top)/b.height*image.naturalHeight
    const old=covers[selected]||{x:0,y:0,width:image.naturalWidth*.13,height:image.naturalHeight*.3}
    const r=clampCover({...old,x:x-old.width/2,y:y-old.height/2},image.naturalWidth,image.naturalHeight)
    setReviewed(false);if(covers.length)update(r);else{setCovers([r]);setSelected(0)}
  }
  const download=async()=>{
    if(!image||!reviewed||!name.trim()||!covers.length||busy)return
    const out=renderCovered(image,image.naturalWidth,image.naturalHeight,covers)
    out.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fileName(name);a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)},'image/png')
  }
  const cover=covers[selected]
  return <main className="capture">
    <header><div><span className="eyebrow">KELLY · RECRUITER TOOLS</span><h1>Smart Capture<span>✦</span></h1><p>Your screenshot, ready to save.</p></div><span className="local">● Local processing</span></header>
    <div className="steps"><span>01 <b>Paste or open</b></span><span>02 <b>Review</b></span><span>03 <b>Download</b></span></div>
    <div className="actions"><button onClick={pasteButton} disabled={busy}>Paste image</button><button onClick={()=>input.current?.click()} disabled={busy}>Open image</button><button className="quiet" onClick={clear}>Clear</button><input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void load(file)}} /></div>
    <div className="workspace"><section className="preview"><div className="section-title"><h2>Preview</h2><span>PNG · original quality</span></div>
      {image?<div className="image-stage" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);dragging.current=true;point(e)}} onPointerMove={e=>{if(dragging.current)point(e)}} onPointerUp={()=>{dragging.current=false}} onPointerCancel={()=>{dragging.current=false}}>
        <canvas ref={canvas} aria-label="Preview with solid photo cover"/>
        {covers.map((r,i)=><button key={i} className={`cross ${i===selected?'selected':''}`} aria-label={`Select cover ${i+1}`} style={{left:`${(r.x+r.width/2)/image.naturalWidth*100}%`,top:`${(r.y+r.height/2)/image.naturalHeight*100}%`}} onPointerDown={e=>{e.stopPropagation();setSelected(i);dragging.current=true;(e.currentTarget.parentElement as HTMLElement).setPointerCapture(e.pointerId)}} onClick={()=>setSelected(i)}>×</button>)}
      </div>:<div className="empty" tabIndex={0} role="region" aria-label="Paste screenshot here" onClick={event=>event.currentTarget.focus()}><span className="paste-icon">▧</span><h3>Paste your screenshot here</h3><p>Ctrl+V or ⌘V · PNG, JPEG, or WebP</p><p>You can also open an image from your computer.</p></div>}
      <p className="hint">Click the photo to place the X. Drag on the image to center the cover. The X is not included in the download.</p>
    </section><aside><h2>Prepare download</h2><label htmlFor="candidate">First and last name</label><input id="candidate" value={name} disabled={busy||!image} placeholder="First Last" onChange={e=>{setName(e.target.value);setReviewed(false)}}/><small>{fileName(name)}</small>
      <hr/><h3>Adjust photo cover</h3><p className="hint">Cover the entire photo, including hair and edges.</p>
      {cover&&image&&(['x','y','width','height'] as const).map(key=><label className="range" key={key}>{({x:'Horizontal position',y:'Vertical position',width:'Width',height:'Height'})[key]}<input type="range" min={key==='width'||key==='height'?1:0} max={key==='x'||key==='width'?image.naturalWidth:image.naturalHeight} value={cover[key]} disabled={busy} onChange={e=>update({...cover,[key]:Number(e.target.value)})}/></label>)}
      <button className="secondary" disabled={!image||busy} onClick={()=>{if(!image)return;setCovers(old=>[...old,{x:0,y:0,width:image.naturalWidth*.13,height:image.naturalHeight*.3}]);setSelected(covers.length);setReviewed(false)}}>Add cover</button>
      {cover&&<button className="quiet" disabled={busy} onClick={()=>{setCovers(old=>old.filter((_,i)=>i!==selected));setSelected(0);setReviewed(false)}}>Remove selected cover</button>}
      <label className="confirm"><input type="checkbox" checked={reviewed} disabled={!image||busy||!covers.length} onChange={e=>setReviewed(e.target.checked)}/>I checked the name and confirmed the entire photo is covered.</label>
      <button className="download" disabled={!image||busy||!name.trim()||!covers.length||!reviewed} onClick={download}>Download PNG ↓</button>
    </aside></div>{busy&&image&&<button onClick={()=>{generation.current++;controller.current?.abort();setBusy(false);setStatus('Manual adjustment: enter the name and place the X on the photo.')}}>Continue manually</button>}<p className="status" role="status" aria-live="polite">{busy?'◌ ':''}{status}</p>
    <footer>The image and name stay in this browser. No installation needed. Clearing or closing releases the screenshot; only the PNG you download is saved.</footer>
  </main>
}
