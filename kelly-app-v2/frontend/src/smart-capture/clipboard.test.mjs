import {test} from 'node:test'
import assert from 'node:assert/strict'
import {clipboardImage,listenForImagePaste} from './clipboard.ts'
const image=new File(['synthetic'],'capture.png',{type:'image/png'})
const data={items:[{type:'image/png',getAsFile:()=>image}],files:[image]}
function target(origin='https://kelly.test') {const w=new EventTarget();w.location={origin};w.parent=w;return w}
function paste(w,clipboardData){const e=new Event('paste',{cancelable:true});Object.defineProperty(e,'clipboardData',{value:clipboardData});w.dispatchEvent(e);return e}
test('extracts image once and falls back to files when clipboard item is null',()=>{
 assert.equal(clipboardImage(data),image)
 assert.equal(clipboardImage({items:[{type:'image/png',getAsFile:()=>null}],files:[image]}),image)
 assert.equal(clipboardImage(null),null)
})
test('pasting with focus in parent or editor loads once; cleanup removes both listeners',()=>{
 const parent=target(),child=target();child.parent=parent;const received=[]
 const stop=listenForImagePaste(child,file=>received.push(file))
 assert.equal(paste(parent,data).defaultPrevented,true)
 assert.equal(received.length,1)
 assert.equal(paste(child,data).defaultPrevented,true)
 assert.equal(received.length,2)
 stop();assert.equal(paste(parent,data).defaultPrevented,false);paste(child,data)
 assert.equal(received.length,2)
})
test('standalone listener is not duplicated and text paste remains unchanged',()=>{
 const standalone=target();let calls=0;const stop=listenForImagePaste(standalone,()=>calls++)
 paste(standalone,data);assert.equal(calls,1)
 assert.equal(paste(standalone,{items:[{type:'text/plain'}],files:[]}).defaultPrevented,false)
 assert.equal(calls,1);stop()
})
test('does not attach to cross-origin parent or fail when parent access is blocked',()=>{
 for(const blocked of [false,true]){
  const child=target(),parent=target('https://other.test');child.parent=parent
  if(blocked)Object.defineProperty(parent,'location',{get(){throw new Error('Cross origin')}})
  let calls=0;const stop=listenForImagePaste(child,()=>calls++)
  paste(parent,data);assert.equal(calls,0);paste(child,data);assert.equal(calls,1);stop()
 }
})
