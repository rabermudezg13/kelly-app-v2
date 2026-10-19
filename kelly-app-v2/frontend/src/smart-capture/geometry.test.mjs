import test from 'node:test'
import assert from 'node:assert/strict'
import { candidateName, clampCover, fileName, profilePhoto } from './geometry.ts'
test('reads first and last fields, excluding middle name and adjacent columns',()=>{
 assert.equal(candidateName('First Name ANA MARIA  Mailing Address OTHER\nMiddle Name JO\nLast Name DE LA CRUZ  Hair Color Brown'),'ANA MARIA DE LA CRUZ')
 assert.equal(candidateName('First Name\nANA\nLast Name\nPEREZ'),'ANA PEREZ')
 assert.equal(candidateName('No matching fields'), '')
})
test('safe filename retains accents and FP suffix',()=>{
 assert.equal(fileName('  José   Pérez  '),'José Pérez FP.png')
 assert.equal(fileName('A/B:C?'),'ABC FP.png')
 assert.equal(fileName(''),'Candidate FP.png')
})
test('cover remains within image after moving or resizing',()=>{
 assert.deepEqual(clampCover({x:-10,y:100,width:30,height:50},100,100),{x:0,y:50,width:30,height:50})
 assert.deepEqual(clampCover({x:30,y:30,width:200,height:200},100,100),{x:0,y:0,width:100,height:100})
})

test('profile layout detects a connected photo and rejects a blank screenshot',()=>{
 const w=1500,h=680,pixels=new Uint8ClampedArray(w*h*4).fill(255)
 assert.equal(profilePhoto(pixels,w,h),null)
 for(let y=94;y<284;y++)for(let x=68;x<258;x++){const i=(y*w+x)*4;pixels[i]=100;pixels[i+1]=130;pixels[i+2]=150}
 const r=profilePhoto(pixels,w,h);assert.ok(r);assert.ok(r.x<=68&&r.y<=94);assert.ok(r.x+r.width>=258&&r.y+r.height>=284)
})

// Simulate a smaller profile inside an uncropped desktop screenshot.
test('finds a shifted photo outside the old upper-left search without accepting a wide toolbar',()=>{
 const w=1920,h=1300,pixels=new Uint8ClampedArray(w*h*4).fill(255)
 for(let y=0;y<70;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=60}
 for(let y=760;y<890;y++)for(let x=600;x<725;x++){const i=(y*w+x)*4;pixels[i]=100;pixels[i+1]=130;pixels[i+2]=150}
 assert.equal(profilePhoto(pixels,w,h),null)
 const r=profilePhoto(pixels,w,h,true);assert.ok(r)
 assert.ok(r.x<=600&&r.y<=760&&r.x+r.width>=725&&r.y+r.height>=890)
 const blank=new Uint8ClampedArray(w*h*4).fill(255);assert.equal(profilePhoto(blank,w,h,true),null)
})
