import {mkdir,copyFile} from 'node:fs/promises'
const root=new URL('../',import.meta.url), out=new URL('public/dashtracker/vendor/',root)
await mkdir(out,{recursive:true})
for(const [from,to] of [['xlsx/dist/xlsx.full.min.js','xlsx.full.min.js'],['pdf-lib/dist/pdf-lib.min.js','pdf-lib.min.js']]) await copyFile(new URL('node_modules/'+from,root),new URL(to,out))
console.log('Local Dashtracker assets ready.')
