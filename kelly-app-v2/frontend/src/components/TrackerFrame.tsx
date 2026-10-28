import {useEffect,useRef} from 'react'
import api from '../services/api'
export default function TrackerFrame({src}:{src:string}) {
 const ref=useRef<HTMLIFrameElement>(null)
 useEffect(()=>{
  const controllers=new Set<AbortController>()
  let busy=false
  async function onMessage(event:MessageEvent){
   if(event.origin!==location.origin||event.source!==ref.current?.contentWindow||event.data?.type!=='kelly:drug-name')return
   const {id,crop}=event.data
   if(typeof id!=='string'||id.length>100)return
   const respond=(value:object)=>ref.current?.contentWindow?.postMessage({type:'kelly:drug-name-result',id,...value},location.origin)
   if(busy){respond({error:'Recognition is busy. Please retry.'});return}
   if(typeof crop!=='string'||crop.length>350000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(crop)){respond({error:'Invalid name crop.'});return}
   const controller=new AbortController();controllers.add(controller);busy=true
   try{
    const binary=atob(crop.split(',')[1]),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0))
    const response=await api.post('/document-ocr/drug-screen-name',bytes,{headers:{'Content-Type':'image/jpeg'},timeout:65000,signal:controller.signal})
    respond({name:response.data.name||''})
   }catch(e:any){respond({error:typeof e.response?.data?.detail==='string'?e.response.data.detail:'Recognition unavailable. Enter the name manually or retry.'})}
   finally{busy=false;controllers.delete(controller)}
  }
  window.addEventListener('message',onMessage)
  return ()=>{window.removeEventListener('message',onMessage);controllers.forEach(c=>c.abort())}
 },[])
 return <iframe ref={ref} title="Kelly Onboarding Tracker" src={src} allow="clipboard-write" style={{width:'100%',height:'90vh',minHeight:700,border:0,borderRadius:18}}/>
}
