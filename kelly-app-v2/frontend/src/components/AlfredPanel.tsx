import {lazy,Suspense} from 'react'
const Alfred=lazy(()=>import('../alfred/Alfred'))
export default function AlfredPanel({active}:{active:boolean}) {
  return <section hidden={!active} aria-label="Alfred">{active&&<Suspense fallback={<p role="status">Loading Alfred…</p>}><Alfred/></Suspense>}</section>
}
