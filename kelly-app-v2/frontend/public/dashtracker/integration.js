// Local adaptation of rabermudezg13/dashtracker; no API requests or candidate storage.
const trackerProfile = (() => {
  try { const p=JSON.parse(decodeURIComponent(location.hash.slice(1))); return {scope:String(p.id||'standalone'),name:String(p.name||''),email:String(p.email||'')}; }
  catch { return {scope:'standalone',name:'',email:''}; }
})();
function escapeTrackerHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function trackerCsvCell(value) {
  let text=String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text)) text="'"+text;
  return '"'+text.replace(/"/g,'""')+'"';
}

function trackerHasMissing(talent,mod) { return talent.missing.some(m=>m===mod || m.startsWith(mod+' (')); }
