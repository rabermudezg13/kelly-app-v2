export type Action = {label:string;icon:string;type:'copy'|'url';value:string}
export type Deck = {version:1;tabs:{id:string;name:string;buttons:(Action|null)[]}[];activeTab:string;gridCols:number}
export const MAX_BACKUP_BYTES = 1_000_000
export function storageKey(user:unknown):string {
  const u=user as {id?:unknown;email?:unknown}|null
  const identity=typeof u?.id==='number'?`id:${u.id}`:typeof u?.email==='string'&&u.email.trim()?`email:${u.email.trim().toLowerCase()}`:''
  if(!identity)throw new Error('Sign in again before saving Alfred buttons.')
  return `kelly:alfred:v1:${encodeURIComponent(identity)}`
}
export function safeUrl(value:string):string {
  let url:URL
  try{url=new URL(value)}catch{throw new Error('Enter a complete https:// or http:// URL.')}
  if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error('Use an http(s) link without embedded credentials.')
  return url.href
}
export function validateAction(value:unknown):Action {
  const a=value as (Omit<Action,'type'>&{type:'copy'|'url'|'script'})|null
  if(!a||typeof a.label!=='string'||!a.label.trim()||a.label.length>60||typeof a.icon!=='string'||a.icon.length>24||!['copy','url','script'].includes(a.type)||typeof a.value!=='string'||!a.value.trim()||a.value.length>10000)throw new Error('Each button needs a label and content (up to 10,000 characters).')
  return {label:a.label.trim(),icon:a.icon.trim(),type:a.type==='script'?'copy':a.type,value:a.type==='url'?safeUrl(a.value.trim()):a.value}
}
export function parseDeck(raw:string):Deck {
  if(new TextEncoder().encode(raw).length>MAX_BACKUP_BYTES)throw new Error('Backup must be smaller than 1 MB.')
  let d:any
  try{d=JSON.parse(raw)}catch{throw new Error('Choose a valid Alfred or KeyForge JSON backup.')}
  if(!d||d.version!==undefined&&d.version!==1||!Array.isArray(d.tabs)||!d.tabs.length||d.tabs.length>20||![3,4,5,6].includes(d.gridCols))throw new Error('Invalid backup: use 1–20 groups and 3–6 columns.')
  const ids=new Set<string>()
  const tabs=d.tabs.map((t:any)=>{
    if(!t||typeof t.id!=='string'||!t.id||t.id.length>100||ids.has(t.id)||typeof t.name!=='string'||!t.name.trim()||t.name.length>40||!Array.isArray(t.buttons)||t.buttons.length>100)throw new Error('Invalid or duplicate group. Maximum 100 buttons per group.')
    ids.add(t.id)
    return {id:t.id,name:t.name.trim(),buttons:t.buttons.map((a:unknown)=>a===null?null:validateAction(a))}
  })
  return {version:1,tabs,activeTab:ids.has(d.activeTab)?d.activeTab:tabs[0].id,gridCols:d.gridCols}
}
export function initialDeck():Deck {
  return {version:1,activeTab:'main',gridCols:4,tabs:[{id:'main',name:'My workspace',buttons:[
    {label:'Welcome message',icon:'👋',type:'copy',value:'Hello! Thank you for connecting with Kelly Education. How can we help you today?'},
    {label:'Follow-up',icon:'💬',type:'copy',value:'Hi! Just checking in. Please reply when you have a moment so we can help with your next steps.'},
    {label:'Kelly Education',icon:'🔗',type:'url',value:'https://www.kellyeducation.com/'}
  ]}]}
}
