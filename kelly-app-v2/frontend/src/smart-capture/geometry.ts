export type Cover = { x: number; y: number; width: number; height: number }
export function clampCover(r: Cover, width: number, height: number): Cover {
  const w = Math.max(1, Math.min(width, r.width)), h = Math.max(1, Math.min(height, r.height))
  return { x: Math.max(0, Math.min(width-w, r.x)), y: Math.max(0, Math.min(height-h, r.y)), width:w, height:h }
}
export function fileName(name: string) {
  return `${name.normalize('NFC').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').trim().replace(/\s+/g, ' ').slice(0,120) || 'Candidate'} FP.png`
}
// Read the explicit fields, not the middle name or other personal details.
export function candidateName(text: string) {
  const read = (label: string) => {
    const match = text.match(new RegExp(`${label}\\s*:?\\s*([^\\n]+)`, 'i'))
    return match?.[1].split(/\s{2,}|Mailing Address|Sex\b|Apt\/|Hair Color|Race\b|City\b/i)[0].replace(/[^\p{L}\p{M} '\-]/gu, '').trim() || ''
  }
  const first = read('First Name'), last = read('Last Name')
  return first && last ? `${first} ${last}` : ''
}
export function renderCovered(image: CanvasImageSource, width: number, height: number, covers: Cover[]) {
  const canvas = document.createElement('canvas'); canvas.width=width; canvas.height=height
  const ctx=canvas.getContext('2d')!; ctx.drawImage(image,0,0,width,height); ctx.fillStyle='#172033'
  for (const cover of covers) { const r=clampCover(cover,width,height); ctx.fillRect(Math.floor(r.x),Math.floor(r.y),Math.ceil(r.width)+1,Math.ceil(r.height)+1) }
  return canvas
}

// For the supplied profile layout: find a connected photo/frame in the upper-left.
// This is a layout suggestion, not identity or face recognition; always review it.
export function profilePhoto(data: Uint8ClampedArray, width: number, height: number, fullScreenshot = false): Cover | null {
  const step=3, cols=Math.floor(width*(fullScreenshot?1:.22)/step), rows=Math.floor(height*(fullScreenshot?1:.55)/step)
  const seen=new Uint8Array(cols*rows)
  const foreground=(x:number,y:number)=>{const i=(y*step*width+x*step)*4;return data[i+3]>0 && Math.min(data[i],data[i+1],data[i+2])<228}
  let best:Cover|null=null
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const start=y*cols+x;if(seen[start]||!foreground(x,y))continue
    const queue=[start];seen[start]=1;let count=0,minX=x,maxX=x,minY=y,maxY=y
    for(let index=0;index<queue.length;index++){
      const key=queue[index],px=key%cols,py=Math.floor(key/cols);count++;minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py)
      for(const [nx,ny] of [[px-1,py],[px+1,py],[px,py-1],[px,py+1]])if(nx>=0&&nx<cols&&ny>=0&&ny<rows){const k=ny*cols+nx;if(!seen[k]&&foreground(nx,ny)){seen[k]=1;queue.push(k)}}
    }
    const w=(maxX-minX+1)*step,h=(maxY-minY+1)*step
    if(w>Math.max(30,width*(fullScreenshot ? .025 : .06)) && h>Math.max(45,height*(fullScreenshot ? .05 : .12)) && (!fullScreenshot || (w<width*.4 && h<height*.65)) && w/h>.45 && w/h<1.6 && count*step*step>w*h*(fullScreenshot ? .4 : .25)){
      const r=clampCover({x:minX*step-4,y:minY*step-4,width:w+8,height:h+8},width,height)
      if(!best||r.width*r.height>best.width*best.height)best=r
    }
  }
  return best
}
