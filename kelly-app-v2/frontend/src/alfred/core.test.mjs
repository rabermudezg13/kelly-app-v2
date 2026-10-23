import test from 'node:test'
import assert from 'node:assert/strict'
import {initialDeck,parseDeck,safeUrl,storageKey,validateAction,MAX_BACKUP_BYTES} from './core.ts'
test('new workspace roundtrips; original KeyForge backups and empty slots remain compatible',()=>{
 const d=initialDeck();assert.deepEqual(parseDeck(JSON.stringify(d)),d)
 delete d.version;d.tabs[0].buttons.push(null);d.activeTab='missing'
 const parsed=parseDeck(JSON.stringify(d));assert.equal(parsed.version,1);assert.equal(parsed.activeTab,'main');assert.equal(parsed.tabs[0].buttons.at(-1),null)
})
test('only complete http(s) URLs without credentials are accepted',()=>{
 for(const u of ['javascript:alert(1)','data:text/html,test','file:///tmp/test','/admin','https://name:pass@example.test','invalid'])assert.throws(()=>safeUrl(u))
 assert.equal(safeUrl('https://example.test/path?q=1'),'https://example.test/path?q=1')
})
test('malformed and oversized imports cannot replace a valid workspace',()=>{
 for(const raw of ['null','[]','{',JSON.stringify({...initialDeck(),version:2}),JSON.stringify({...initialDeck(),tabs:[]}),JSON.stringify({...initialDeck(),gridCols:2}),' '.repeat(MAX_BACKUP_BYTES+1)])assert.throws(()=>parseDeck(raw))
 const d=initialDeck();d.tabs.push({...d.tabs[0]});assert.throws(()=>parseDeck(JSON.stringify(d)))
 d.tabs.pop();d.tabs[0].buttons[0].type='html';assert.throws(()=>parseDeck(JSON.stringify(d)))
})
test('labels render as text and copy content preserves line breaks and whitespace',()=>{
 const a=validateAction({label:'<img src=x onerror=alert(1)>',icon:'📋',type:'copy',value:'  line one\nline two  '})
 assert.equal(a.value,'  line one\nline two  ');assert.ok(a.label.startsWith('<img'))
 for(const a of [{},null,{label:'x',icon:'',type:'copy',value:''},{label:'x',icon:'',type:'copy',value:'x'.repeat(10001)}])assert.throws(()=>validateAction(a))
})
test('browser storage keys isolate users and never fall back to a shared guest deck',()=>{
 assert.notEqual(storageKey({id:1}),storageKey({id:2}));assert.equal(storageKey({id:1,email:'a'}),storageKey({id:1,email:'b'}))
 assert.equal(storageKey({email:' Demo@Example.Test '}),storageKey({email:'demo@example.test'}))
 for(const u of [null,{},'x'])assert.throws(()=>storageKey(u))
})
test('script actions remain inert strings, group and button limits are enforced',()=>{
 const d=initialDeck();d.tabs[0].buttons=[{label:'Command',icon:'⚡',type:'script',value:'python demo.py'}]
 assert.equal(parseDeck(JSON.stringify(d)).tabs[0].buttons[0].value,'python demo.py');assert.equal(parseDeck(JSON.stringify(d)).tabs[0].buttons[0].type,'copy')
 d.tabs[0].buttons=Array(101).fill(d.tabs[0].buttons[0]);assert.throws(()=>parseDeck(JSON.stringify(d)))
})
