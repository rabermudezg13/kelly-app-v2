import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
const root=new URL('../',import.meta.url), assets=new URL('public/capture-assets/',root)
await mkdir(assets,{recursive:true})
await cp(new URL('node_modules/tesseract.js/dist/worker.min.js',root),new URL('worker.min.js',assets))
await mkdir(new URL('core/',assets),{recursive:true})
for(const file of await readdir(new URL('node_modules/tesseract.js-core/',root))) {
 if(file.startsWith('tesseract-core') && /\.(js|wasm)$/.test(file)) await cp(new URL('node_modules/tesseract.js-core/'+file,root),new URL('core/'+file,assets))
}
await cp(new URL('node_modules/@mediapipe/tasks-vision/wasm/',root),new URL('vision/',assets),{recursive:true})
await mkdir(new URL('lang/',assets),{recursive:true})
await cp(new URL('node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz',root),new URL('lang/eng.traineddata.gz',assets))
const expected='b4578f35940bf5a1a655214a1cce5cab13eba73c1297cd78e1a04c2380b0152f'
const path=new URL('face.tflite',assets)
let model;try{model=await readFile(path)}catch{}
const hash=data=>createHash('sha256').update(data).digest('hex')
if(!model||hash(model)!==expected){
 const response=await fetch('https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',{signal:AbortSignal.timeout(60000)})
 if(!response.ok)throw new Error('Face model download failed: '+response.status)
 model=Buffer.from(await response.arrayBuffer());if(hash(model)!==expected)throw new Error('Face model checksum mismatch')
 await writeFile(path,model)
}
console.log('Local Smart Capture assets ready (model checksum verified).')
