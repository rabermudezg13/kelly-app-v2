import {useRef,useState} from 'react'
import type {CSSProperties,FormEvent} from 'react'
import {initialDeck,MAX_BACKUP_BYTES,parseDeck,safeUrl,storageKey,validateAction} from './core'
import type {Action,Deck} from './core'
import './alfred.css'
const types={copy:'Copy text',url:'Open link'}
function load(){
 let key=''
 try{key=storageKey(JSON.parse(localStorage.getItem('user')||'null'));const raw=localStorage.getItem(key);return {key,deck:raw?parseDeck(raw):initialDeck(),error:''}}
 catch{return {key,deck:initialDeck(),error:'Saved buttons could not be loaded. Export your work before leaving. Import a valid backup to replace unreadable saved data.'}}
}
export default function Alfred(){
 const [loaded]=useState(load),[deck,setDeck]=useState<Deck>(loaded.deck),[message,setMessage]=useState(loaded.error),[query,setQuery]=useState('')
 const [editor,setEditor]=useState<{index:number|null;action:Action}|null>(null),[groupName,setGroupName]=useState(''),[groupMode,setGroupMode]=useState<'add'|'rename'|null>(null)
 const [error,setError]=useState(''),[manual,setManual]=useState(''),[blocked,setBlocked]=useState(Boolean(loaded.error))
 const dialog=useRef<HTMLDialogElement>(null),groupDialog=useRef<HTMLDialogElement>(null),importInput=useRef<HTMLInputElement>(null)
 const tab=deck.tabs.find(t=>t.id===deck.activeTab)!
 function commit(next:Deck,replace=false){
   try{parseDeck(JSON.stringify(next))}catch(e){setMessage((e as Error).message);return}
   try{if(!loaded.key||blocked&&!replace)throw Error();localStorage.setItem(loaded.key,JSON.stringify(next));setMessage('Saved on this browser.');setBlocked(false)}
   catch{setMessage('Changes are in memory only. Browser storage is unavailable; export a backup before leaving.')}
   setDeck(next)
 }
 function buttons(next:(Action|null)[]){commit({...deck,tabs:deck.tabs.map(t=>t.id===tab.id?{...t,buttons:next}:t)})}
 function edit(index:number|null){setError('');setEditor({index,action:index===null?{label:'',icon:'📋',type:'copy',value:''}:tab.buttons[index]!});dialog.current?.showModal()}
 function save(e:FormEvent){e.preventDefault();if(!editor)return
   try{const action=validateAction(editor.action),next=[...tab.buttons];if(editor.index===null){if(next.length>=100)throw Error('Maximum 100 buttons per group.');next.push(action)}else next[editor.index]=action;buttons(next);dialog.current?.close();setEditor(null)}catch(e){setError((e as Error).message)}
 }
 async function run(a:Action){
   try{await navigator.clipboard.writeText(a.value);setMessage('Copied to clipboard.')}
   catch{setManual(a.value);setMessage('Clipboard access unavailable. Select and copy the text below.')}
 }
 function exportDeck(){const url=URL.createObjectURL(new Blob([JSON.stringify(deck,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='alfred-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage('Backup downloaded. Keep it in a safe place.')}
 async function importDeck(file?:File){if(!file)return
   try{if(file.size>MAX_BACKUP_BYTES)throw Error('Backup must be smaller than 1 MB.');const next=parseDeck(await file.text());if(window.confirm(`Replace your Alfred workspace with ${next.tabs.length} imported group(s)? Export a backup first if needed.`)){commit(next,true);setQuery('')}}catch(e){setMessage((e as Error).message)}finally{if(importInput.current)importInput.current.value=''}
 }
 function openGroup(mode:'add'|'rename'){setGroupMode(mode);setGroupName(mode==='rename'?tab.name:'');setError('');groupDialog.current?.showModal()}
 function saveGroup(e:FormEvent){e.preventDefault();const name=groupName.trim();if(!name){setError('Enter a group name.');return}if(groupMode==='add'){if(deck.tabs.length>=20){setError('Maximum 20 groups.');return}const id=crypto.randomUUID();commit({...deck,tabs:[...deck.tabs,{id,name,buttons:[]}],activeTab:id})}else commit({...deck,tabs:deck.tabs.map(t=>t.id===tab.id?{...t,name}:t)});setQuery('');groupDialog.current?.close()}
 const visible=tab.buttons.map((action,index)=>({action,index})).filter(({action})=>action&&`${action.label} ${action.value}`.toLowerCase().includes(query.toLowerCase()))
 return <div className="alfred">
  <header className="af-header"><div className="af-brand"><span className="af-monogram" aria-hidden="true">A</span><div><span className="af-eyebrow">YOUR PERSONAL STREAM DECK</span><h2>Alfred<span>.</span></h2><p>Your everyday actions, one click away.</p></div></div><div className="af-tools"><button onClick={exportDeck}>↓ Export backup</button><button onClick={()=>importInput.current?.click()}>↑ Import backup</button><button className="af-primary" onClick={()=>edit(null)}>＋ New button</button><input ref={importInput} hidden type="file" accept=".json,application/json" onChange={e=>void importDeck(e.target.files?.[0])}/></div></header>
  <div className="af-local"><span>● Personal workspace</span><span>Saved only in this browser · Export to move to another device</span></div>
  <div className="af-toolbar"><nav aria-label="Alfred groups">{deck.tabs.map(t=><button key={t.id} aria-pressed={t.id===tab.id} onClick={()=>{commit({...deck,activeTab:t.id});setQuery('')}}>{t.name}</button>)}<button aria-label="Add group" onClick={()=>openGroup('add')}>＋</button></nav><label className="af-search">Search buttons<input type="search" placeholder="Find an action…" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
  <div className="af-deck-heading"><div><h3>{tab.name}</h3><p>{tab.buttons.filter(Boolean).length} actions · Make this space work for you</p></div><div className="af-tools"><button onClick={()=>openGroup('rename')}>Rename group</button>{deck.tabs.length>1&&<button onClick={()=>{if(window.confirm(`Delete “${tab.name}” and all its buttons?`))commit({...deck,tabs:deck.tabs.filter(t=>t.id!==tab.id),activeTab:deck.tabs.find(t=>t.id!==tab.id)!.id})}}>Delete group</button>}<label>Columns <select value={deck.gridCols} onChange={e=>commit({...deck,gridCols:Number(e.target.value)})}>{[3,4,5,6].map(n=><option key={n}>{n}</option>)}</select></label></div></div>
  <div className="af-grid" style={{'--af-cols':deck.gridCols} as CSSProperties}>{visible.map(({action:a,index})=>a&&<article className={`af-card af-${a.type}`} key={index}><div className="af-card-top"><span>{types[a.type]}</span><div><button aria-label={`Edit ${a.label}`} onClick={()=>edit(index)}>✎</button><button aria-label={`Delete ${a.label}`} onClick={()=>{if(window.confirm(`Delete “${a.label}”?`))buttons(tab.buttons.filter((_,i)=>i!==index))}}>×</button></div></div>{a.type==='url'?<a className="af-action" href={safeUrl(a.value)} target="_blank" rel="noopener noreferrer"><span className="af-icon" aria-hidden="true">{a.icon||'🔗'}</span><strong>{a.label}</strong><span>Open in new tab ↗</span></a>:<button className="af-action" onClick={()=>void run(a)}><span className="af-icon" aria-hidden="true">{a.icon||'📋'}</span><strong>{a.label}</strong><span>Click to copy ↗</span></button>}</article>)}{!query&&<button className="af-add" onClick={()=>edit(null)}><span>＋</span>Add an action<small>A link or text snippet</small></button>}</div>
  {query&&!visible.length&&<p className="af-empty">No actions match your search.</p>}
  <p className="af-status" role="status">{message||'Ready when you are. Edit any button to make it yours.'}</p>
  {manual&&<label>Copy manually<textarea readOnly value={manual} onFocus={e=>e.target.select()}/><button onClick={()=>setManual('')}>Dismiss</button></label>}
  <footer>Buttons only open links or copy text. Keep passwords and personal candidate information out of your buttons.<br/>Inspired by KeyForge · Rodrigo Bermudez &amp; Cafe Cultura LLC</footer>
  <dialog ref={dialog} onCancel={()=>setEditor(null)} onClose={()=>setEditor(null)}><form onSubmit={save}><div className="af-modal-heading"><h3>{editor?.index===null?'New button':'Edit button'}</h3><button type="button" aria-label="Close editor" onClick={()=>dialog.current?.close()}>×</button></div>{editor&&<><label>Label<input autoFocus required maxLength={60} value={editor.action.label} onChange={e=>setEditor({...editor,action:{...editor.action,label:e.target.value}})}/></label><div className="af-form-row"><label>Icon / emoji<input maxLength={24} value={editor.action.icon} onChange={e=>setEditor({...editor,action:{...editor.action,icon:e.target.value}})}/></label><label>Action type<select value={editor.action.type} onChange={e=>setEditor({...editor,action:{...editor.action,type:e.target.value as Action['type']}})}>{Object.entries(types).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label></div><label>{editor.action.type==='url'?'URL':'Content'}<textarea required maxLength={10000} rows={6} value={editor.action.value} onChange={e=>setEditor({...editor,action:{...editor.action,value:e.target.value}})}/></label></>}<p role="alert">{error}</p><div className="af-tools"><button type="button" onClick={()=>dialog.current?.close()}>Cancel</button><button className="af-primary" type="submit">Save button</button></div></form></dialog>
  <dialog ref={groupDialog}><form onSubmit={saveGroup}><h3>{groupMode==='add'?'New group':'Rename group'}</h3><label>Group name<input autoFocus required maxLength={40} value={groupName} onChange={e=>setGroupName(e.target.value)}/></label><p role="alert">{error}</p><div className="af-tools"><button type="button" onClick={()=>groupDialog.current?.close()}>Cancel</button><button className="af-primary">Save group</button></div></form></dialog>
 </div>
}
