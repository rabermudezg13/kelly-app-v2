import { createWorker, PSM } from 'tesseract.js'
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'
import { candidateName, clampCover, profilePhoto, type Cover } from './geometry'

export async function analyze(image: HTMLImageElement, signal: AbortSignal) {
  const base=new URL('/capture-assets/',location.origin).href
  let worker: Awaited<ReturnType<typeof createWorker>> | undefined
  let detector: FaceDetector | undefined
  const stop=()=> { void worker?.terminate() }
  signal.addEventListener('abort',stop)
  let name='', covers:Cover[]=[], warnings:string[]=[]
  try {
    try {
      worker=await createWorker('eng',1,{workerPath:base+'worker.min.js',corePath:base+'core',langPath:base+'lang',cacheMethod:'none',workerBlobURL:false})
      if(signal.aborted) return {name,covers,warnings}
      await worker.setParameters({tessedit_pageseg_mode:PSM.SPARSE_TEXT})
      // Keep OCR focused on the profile header, avoiding the eligibility table.
      const header=document.createElement('canvas'); header.width=image.naturalWidth; header.height=Math.round(image.naturalHeight*0.55)
      header.getContext('2d')!.drawImage(image,0,0)
      const result=await new Promise<Awaited<ReturnType<typeof worker.recognize>>>((resolve,reject)=>{
        const cancel=()=>reject(new Error('Cancelled'))
        signal.addEventListener('abort',cancel,{once:true})
        worker!.recognize(header).then(resolve,reject).finally(()=>signal.removeEventListener('abort',cancel))
        if(signal.aborted)cancel()
      })
      name=candidateName(result.data.text)
      if(!name) warnings.push('Enter the first and last name: they could not be read reliably.')
    } catch { warnings.push('The name could not be read. You can enter it manually.') }
    if(signal.aborted) return {name,covers,warnings}
    if(name) {
      const pixels=document.createElement('canvas'); pixels.width=image.naturalWidth; pixels.height=image.naturalHeight
      const ctx=pixels.getContext('2d')!; ctx.drawImage(image,0,0)
      const suggestion=profilePhoto(ctx.getImageData(0,0,pixels.width,pixels.height).data,pixels.width,pixels.height)
      if(suggestion) return {name,covers:[suggestion],warnings:['Photo cover suggested for this layout. Check every edge of the photo.']}
    }
    try {
      detector=await FaceDetector.createFromOptions(await FilesetResolver.forVisionTasks(base+'vision'),{baseOptions:{modelAssetPath:base+'face.tflite',delegate:'CPU'},runningMode:'IMAGE',minDetectionConfidence:0.4})
      if(signal.aborted) return {name,covers,warnings}
      // A crop keeps small profile photographs large enough for the face model.
      const crop=document.createElement('canvas'); crop.width=Math.ceil(image.naturalWidth*0.4); crop.height=Math.ceil(image.naturalHeight*0.55)
      crop.getContext('2d')!.drawImage(image,0,0)
      const result=detector.detect(crop)
      covers=result.detections.flatMap(d=>d.boundingBox ? [clampCover({x:d.boundingBox.originX-d.boundingBox.width*0.5,y:d.boundingBox.originY-d.boundingBox.height*0.65,width:d.boundingBox.width*2,height:d.boundingBox.height*2.1},image.naturalWidth,image.naturalHeight)] : [])
      if(!covers.length) warnings.push('No photo was detected. Click it to place the X and adjust the cover.')
    } catch { warnings.push('Automatic detection is unavailable. Place the X on the photo to cover it.') }
    return {name,covers,warnings}
  } finally { signal.removeEventListener('abort',stop); await worker?.terminate(); detector?.close() }
}
