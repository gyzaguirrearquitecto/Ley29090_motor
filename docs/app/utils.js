export async function fetchJSON(path){const r=await fetch(path,{cache:"no-store"});if(!r.ok) throw new Error(`No se pudo cargar ${path}: ${r.status}`);return await r.json();}
export function escapeHTML(s){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
export function toPrettyJSON(o){return JSON.stringify(o,null,2);}
