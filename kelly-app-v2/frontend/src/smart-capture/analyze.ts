import { createWorker, PSM } from 'tesseract.js'
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'
import { candidateName, clampCover, profilePhoto, type Cover } from './geometry'

export async function analyze(image: HTMLImageElement, signal: AbortSignal, onProgress?: (result: {name:string,covers:Cover[]}) => void) {
  const base=new URL('/capture-assets/',location.origin).href
  let worker: Awaited<ReturnType<typeof createWorker>> | undefined
  let detector: FaceDetector | undefined
  const stop=()=> { void worker?.terminate() }
  signal.addEventListener('abort',stop)
  let name='', covers:Cover[]=[], warnings:string[]=[]
  try {
    // A photo suggestion must not depend on OCR succeeding. Screenshots may
    // contain browser chrome or a profile positioned away from the top-left.
    const pixels=document.createElement('canvas'); pixels.width=image.naturalWidth; pixels.height=image.naturalHeight
    const ctx=pixels.getContext('2d')!; ctx.drawImage(image,0,0)
    const data=ctx.getImageData(0,0,pixels.width,pixels.height).data
    const suggestion=profilePhoto(data,pixels.width,pixels.height) || profilePhoto(data,pixels.width,pixels.height,true)
    if(suggestion){covers=[suggestion];onProgress?.({name,covers})}
    try {
      // Tesseract can leave initialization pending after a language-fetch error.
      // Bound startup and expose errors so the editor can fall back to manual mode.
      worker=await new Promise<Awaited<ReturnType<typeof createWorker>>>((resolve,reject)=>{
        let settled=false
        const finishError=(error:unknown)=>{if(settled)return;settled=true;clearTimeout(timer);signal.removeEventListener('abort',cancel);reject(error)}
        const cancel=()=>finishError(new Error('Cancelled'))
        const timer=setTimeout(()=>finishError(new Error('OCR startup timed out')),30000)
        signal.addEventListener('abort',cancel,{once:true})
        createWorker('eng',1,{workerPath:base+'worker.min.js',corePath:base+'core',langPath:base+'lang',cacheMethod:'none',workerBlobURL:false,errorHandler:finishError}).then(created=>{
          clearTimeout(timer);signal.removeEventListener('abort',cancel)
          if(settled){void created.terminate();return}
          settled=true;resolve(created)
        },finishError)
        if(signal.aborted)cancel()
      })
      if(signal.aborted) return {name,covers,warnings}
      await worker.setParameters({tessedit_pageseg_mode:PSM.SPARSE_TEXT})
      const recognize=async(fullScreenshot:boolean)=>{
        const sourceHeight=Math.round(image.naturalHeight*(fullScreenshot?1:.55))
        // Enlarge small text without allocating an unbounded OCR canvas.
        const scale=Math.min(2,Math.max(1,2000/image.naturalWidth),Math.sqrt(6000000/(image.naturalWidth*sourceHeight)))
        const page=document.createElement('canvas');page.width=Math.round(image.naturalWidth*scale);page.height=Math.round(sourceHeight*scale)
        page.getContext('2d')!.drawImage(image,0,0,image.naturalWidth,sourceHeight,0,0,page.width,page.height)
        return await new Promise<Awaited<ReturnType<typeof worker.recognize>>>((resolve,reject)=>{
          const cleanup=()=>{clearTimeout(timer);signal.removeEventListener('abort',cancel)}
          const cancel=()=>{cleanup();reject(new Error('Cancelled'))}
          const timer=setTimeout(()=>{cleanup();reject(new Error('OCR recognition timed out'));void worker?.terminate()},30000)
          signal.addEventListener('abort',cancel,{once:true})
          if(signal.aborted){cancel();return}
          worker!.recognize(page).then(value=>{cleanup();resolve(value)},error=>{cleanup();reject(error)})
        })
      }
      name=candidateName((await recognize(false)).data.text)
      // The profile may be below the cropped header in a full-screen capture.
      if(!name && !signal.aborted) name=candidateName((await recognize(true)).data.text)
      onProgress?.({name,covers})
      if(!name) warnings.push('Enter the first and last name: they could not be read reliably.')
    } catch { warnings.push('The name could not be read. You can enter it manually.') }
    if(signal.aborted) return {name,covers,warnings}
    if(covers.length) return {name,covers,warnings:[...warnings,'Photo cover suggested for this layout. Check every edge of the photo.']}
    try {
      detector=await FaceDetector.createFromOptions(await FilesetResolver.forVisionTasks(base+'vision'),{baseOptions:{modelAssetPath:base+'face.tflite',delegate:'CPU'},runningMode:'IMAGE',minDetectionConfidence:0.4})
      if(signal.aborted) return {name,covers,warnings}
      // Preserve the close-up pass for small photos; retry the full screenshot
      // when the profile is outside that region.
      const crop=document.createElement('canvas');crop.width=Math.ceil(image.naturalWidth*.4);crop.height=Math.ceil(image.naturalHeight*.55)
      crop.getContext('2d')!.drawImage(image,0,0)
      let result=detector.detect(crop)
      if(!result.detections.length)result=detector.detect(image)
      covers=result.detections.flatMap(d=>d.boundingBox ? [clampCover({x:d.boundingBox.originX-d.boundingBox.width*0.5,y:d.boundingBox.originY-d.boundingBox.height*0.65,width:d.boundingBox.width*2,height:d.boundingBox.height*2.1},image.naturalWidth,image.naturalHeight)] : [])
      if(!covers.length) warnings.push('No photo was detected. Click it to place the X and adjust the cover.')
    } catch { warnings.push('Automatic detection is unavailable. Place the X on the photo to cover it.') }
    return {name,covers,warnings}
  } finally { signal.removeEventListener('abort',stop); await worker?.terminate(); detector?.close() }
}
