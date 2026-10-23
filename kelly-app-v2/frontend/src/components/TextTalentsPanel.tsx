import { lazy, Suspense, useEffect, useState } from 'react'
const TextTalents = lazy(() => import('../text-talents/TextTalents'))
export default function TextTalentsPanel({active}: {active:boolean}) {
  const [opened,setOpened] = useState(active)
  useEffect(()=>{if(active)setOpened(true)},[active])
  return <section hidden={!active} aria-label="Text Talents">{opened && <Suspense fallback={<p role="status">Loading Text Talents…</p>}><TextTalents /></Suspense>}</section>
}
