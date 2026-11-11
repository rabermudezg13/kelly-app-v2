/* Manual Scanner filename formatting only. */
(function(root){
 function drugScreenFilename(value){
  const name=String(value||'').normalize('NFKC').replace(/[<>:"/\\|?*\x00-\x1f]/g,'').replace(/\s+/g,' ').trim().replace(/[. ]+$/g,'').slice(0,100)||'Candidate';
  return name+' Drug Screening.pdf';
 }
 root.drugScreenFilename=drugScreenFilename;
})(globalThis);
