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

// Dashboard profile, never the editable sender, determines the worksheet.
function trackerNormalizeName(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
}
function trackerAssignedSheet(profile) {
  if (!profile || profile.scope === 'standalone' || !profile.scope) throw new Error('Open Onboarding Tracker from your recruiter dashboard.');
  const assignments = {
    'rodrigo':'Rodrigo', 'rodrigo bermudez':'Rodrigo',
    'miccael val':'Miccael', 'jorge silva':'Jorge', 'demetrius lee':'Demetrius'
  };
  const sheet = assignments[trackerNormalizeName(profile.name)];
  if (!sheet) throw new Error('No tracker worksheet is assigned to this recruiter. Contact your administrator.');
  return sheet;
}
function trackerResolveSheet(sheetNames, profile) {
  const assigned = trackerAssignedSheet(profile);
  const matches = sheetNames.filter(name => trackerNormalizeName(name) === trackerNormalizeName(assigned));
  if (matches.length !== 1) throw new Error(matches.length ? 'The workbook has multiple matching recruiter worksheets.' : 'Your worksheet "'+assigned+'" was not found. No other worksheets were loaded.');
  return matches[0];
}
function trackerReadWorkbook(bytes, profile, reader) {
  trackerAssignedSheet(profile);
  const metadata = reader.read(bytes,{type:'array',bookSheets:true});
  const name = trackerResolveSheet(metadata.SheetNames || [],profile);
  const workbook = reader.read(bytes,{type:'array',sheets:name});
  if (!workbook.Sheets || !workbook.Sheets[name]) throw new Error('Your recruiter worksheet could not be read.');
  return {name, sheet:workbook.Sheets[name]};
}
function trackerRowsFromSheet(sheet, reader) {
  const raw = reader.utils.sheet_to_json(sheet,{header:1,defval:''});
  const isName = value => ['applicant name','talent name'].includes(trackerNormalizeName(value));
  const headerIndex = raw.slice(0,12).findIndex(row => row.some(isName));
  if (headerIndex < 0) throw new Error('Your worksheet is missing the Applicant Name header.');
  const headers = raw[headerIndex], nameIndex = headers.findIndex(isName);
  return raw.slice(headerIndex+1).filter(row => String(row[nameIndex] || '').trim() && !isName(row[nameIndex])).map(row => {
    const record = Object.create(null);
    headers.forEach((header,index) => { if (String(header || '').trim()) record[String(header).trim()] = row[index] ?? ''; });
    return record;
  });
}
