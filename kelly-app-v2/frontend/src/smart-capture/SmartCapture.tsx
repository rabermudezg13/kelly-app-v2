import React, { useEffect, useRef, useState } from 'react'
import { clampCover, fileName, renderCovered, type Cover } from './geometry'
import './capture.css'

export default function SmartCapture() {
  const [image,setImage]=useState<HTMLImageElement|null>(null)
  const [covers,setCovers]=useState<Cover[]>([]), [selected,setSelected]=useState(0)
  const [name,setName]=useState(''), [status,setStatus]=useState('Listo para tu captura')
  const [busy,setBusy]=useState(false), [reviewed,setReviewed]=useState(false)
  const [stream,setStream]=useState<MediaStream|null>(null)
  const [capturePending,setCapturePending]=useState(false)
  const canvas=useRef<HTMLCanvasElement>(null), video=useRef<HTMLVideoElement>(null), input=useRef<HTMLInputElement>(null)
  const generation=useRef(0), controller=useRef<AbortController|null>(null), currentUrl=useRef(''), streamRef=useRef<MediaStream|null>(null)
  const dragging=useRef(false), mounted=useRef(true)
  const stopCapture=()=>{streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;setStream(null)}
  const clear=()=>{generation.current++;controller.current?.abort();URL.revokeObjectURL(currentUrl.current);currentUrl.current='';stopCapture();setImage(null);setCovers([]);setName('');setReviewed(false);setBusy(false);setStatus('Listo para tu captura')}
  useEffect(()=>()=>{mounted.current=false;generation.current++;controller.current?.abort();URL.revokeObjectURL(currentUrl.current);streamRef.current?.getTracks().forEach(t=>t.stop())},[])
  useEffect(()=>{if(video.current&&stream)video.current.srcObject=stream},[stream])
  useEffect(()=>{
    if(!image||!canvas.current)return
    const out=renderCovered(image,image.naturalWidth,image.naturalHeight,covers)
    canvas.current.width=out.width;canvas.current.height=out.height;canvas.current.getContext('2d')!.drawImage(out,0,0)
  },[image,covers])
  const load=async(file:Blob)=>{
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)){setStatus('Selecciona una imagen PNG, JPEG o WebP.');return}
    if(file.size>20*1024*1024){setStatus('La imagen supera 20 MB. Usa una captura más pequeña.');return}
    clear();const job=++generation.current;setBusy(true);setStatus('Leyendo la captura en este computador…')
    const url=URL.createObjectURL(file);currentUrl.current=url
    try {
      const img=new Image();img.src=url;await img.decode()
      if(job!==generation.current)return
      if(img.naturalWidth*img.naturalHeight>24000000)throw new Error('La imagen supera 24 megapíxeles. Recórtala antes de abrirla.')
      setImage(img);controller.current=new AbortController()
      const {analyze}=await import('./analyze')
      if(job!==generation.current)return
      const result=await analyze(img,controller.current.signal)
      if(job!==generation.current)return
      setName(result.name);setCovers(result.covers);setSelected(0)
      setStatus(result.warnings.join(' ')||'Nombre y cobertura sugeridos. Verifica que toda la foto quede tapada.')
    }catch(error){if(job===generation.current)setStatus(error instanceof Error?error.message:'No se pudo abrir la imagen.')}
    finally{if(job===generation.current)setBusy(false)}
  }
  useEffect(()=>{
    const paste=(event:ClipboardEvent)=>{const file=Array.from(event.clipboardData?.items||[]).find(i=>i.type.startsWith('image/'))?.getAsFile();if(file){event.preventDefault();void load(file)}}
    window.addEventListener('paste',paste);return()=>window.removeEventListener('paste',paste)
  },[])
  const pasteButton=async()=>{try{const items=await navigator.clipboard.read();for(const item of items){const type=item.types.find(t=>t.startsWith('image/'));if(type){await load(await item.getType(type));return}}setStatus('No hay una imagen en el portapapeles.')}catch{setStatus('Haz clic en este panel y pega con Ctrl+V o ⌘V, o abre una imagen.')}}
  const capture=async()=>{
    if(!navigator.mediaDevices?.getDisplayMedia){setStatus('Este navegador no permite capturar pantalla. Usa una captura del sistema y pégala o abre el archivo.');return}
    if(capturePending||stream)return
    const job=generation.current;setCapturePending(true)
    try{const media=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});if(!mounted.current||job!==generation.current){media.getTracks().forEach(t=>t.stop());return}stopCapture();streamRef.current=media;setStream(media);media.getVideoTracks()[0].addEventListener('ended',stopCapture,{once:true})}
    catch{if(mounted.current)setStatus('Captura cancelada o no disponible. Puedes pegar o abrir una imagen.')}
    finally{if(mounted.current)setCapturePending(false)}
  }
  const freeze=()=>{
    const v=video.current;if(!v?.videoWidth)return
    const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d')!.drawImage(v,0,0)
    stopCapture();c.toBlob(blob=>{if(blob&&mounted.current)void load(blob)},'image/png')
  }
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
    <header><div><span className="eyebrow">KELLY · HERRAMIENTAS DEL RECLUTADOR</span><h1>Smart Capture<span>✦</span></h1><p>Tu captura, lista para guardar.</p></div><span className="local">● Procesamiento local</span></header>
    <div className="steps"><span>01 <b>Pega o captura</b></span><span>02 <b>Verifica</b></span><span>03 <b>Descarga</b></span></div>
    <div className="actions"><button onClick={pasteButton} disabled={busy}>Pegar imagen</button><button onClick={()=>input.current?.click()} disabled={busy}>Abrir imagen</button><button onClick={capture} disabled={busy||capturePending||!!stream}>{capturePending ? 'Elige una ventana…' : 'Tomar captura'}</button><button className="quiet" onClick={clear}>Limpiar</button><input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void load(file)}} /></div>
    {stream&&<section className="live"><video ref={video} autoPlay muted playsInline/><button onClick={freeze}>Usar esta captura</button><button onClick={stopCapture}>Cancelar</button></section>}
    <div className="workspace"><section className="preview"><div className="section-title"><h2>Vista previa</h2><span>PNG · calidad original</span></div>
      {image?<div className="image-stage" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);dragging.current=true;point(e)}} onPointerMove={e=>{if(dragging.current)point(e)}} onPointerUp={()=>{dragging.current=false}} onPointerCancel={()=>{dragging.current=false}}>
        <canvas ref={canvas} aria-label="Vista previa con cobertura sólida"/>
        {covers.map((r,i)=><button key={i} className={`cross ${i===selected?'selected':''}`} aria-label={`Seleccionar cobertura ${i+1}`} style={{left:`${(r.x+r.width/2)/image.naturalWidth*100}%`,top:`${(r.y+r.height/2)/image.naturalHeight*100}%`}} onPointerDown={e=>{e.stopPropagation();setSelected(i);dragging.current=true;(e.currentTarget.parentElement as HTMLElement).setPointerCapture(e.pointerId)}} onClick={()=>setSelected(i)}>×</button>)}
      </div>:<div className="empty"><span className="paste-icon">▧</span><h3>Pega tu captura aquí</h3><p>Ctrl+V o ⌘V · PNG, JPEG o WebP</p><p>También puedes abrir una imagen o capturar una ventana.</p></div>}
      <p className="hint">Pulsa sobre la foto para colocar la X. Arrastra sobre la imagen para centrar el cuadro. La X no se descarga.</p>
    </section><aside><h2>Preparar descarga</h2><label htmlFor="candidate">Nombre y apellido</label><input id="candidate" value={name} disabled={busy||!image} placeholder="Nombre Apellido" onChange={e=>{setName(e.target.value);setReviewed(false)}}/><small>{fileName(name)}</small>
      <hr/><h3>Ajustar cobertura</h3><p className="hint">Cubre la foto completa, incluido el cabello y los bordes.</p>
      {cover&&image&&(['x','y','width','height'] as const).map(key=><label className="range" key={key}>{({x:'Posición horizontal',y:'Posición vertical',width:'Ancho',height:'Alto'})[key]}<input type="range" min={key==='width'||key==='height'?1:0} max={key==='x'||key==='width'?image.naturalWidth:image.naturalHeight} value={cover[key]} disabled={busy} onChange={e=>update({...cover,[key]:Number(e.target.value)})}/></label>)}
      <button className="secondary" disabled={!image||busy} onClick={()=>{if(!image)return;setCovers(old=>[...old,{x:0,y:0,width:image.naturalWidth*.13,height:image.naturalHeight*.3}]);setSelected(covers.length);setReviewed(false)}}>Añadir cobertura</button>
      {cover&&<button className="quiet" disabled={busy} onClick={()=>{setCovers(old=>old.filter((_,i)=>i!==selected));setSelected(0);setReviewed(false)}}>Quitar cuadro seleccionado</button>}
      <label className="confirm"><input type="checkbox" checked={reviewed} disabled={!image||busy||!covers.length} onChange={e=>setReviewed(e.target.checked)}/>Verifiqué el nombre y que toda la foto está cubierta.</label>
      <button className="download" disabled={!image||busy||!name.trim()||!covers.length||!reviewed} onClick={download}>Descargar PNG ↓</button>
    </aside></div>{busy&&image&&<button onClick={()=>{generation.current++;controller.current?.abort();setBusy(false);setStatus('Ajuste manual: escribe el nombre y coloca la X sobre la foto.')}}>Continuar manualmente</button>}<p className="status" role="status" aria-live="polite">{busy?'◌ ':''}{status}</p>
    <footer>La imagen y el nombre permanecen en este navegador. No necesitas instalar nada. Al limpiar o cerrar se libera la captura; únicamente se guarda el PNG que descargues.</footer>
  </main>
}
