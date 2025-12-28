import { determinarModalidadEdificacion } from "./engine/determinarModalidad.js";
import { determinarRuta } from "./engine/determinarRuta.js";
import { generarChecklist } from "./engine/generarChecklist.js";
import { generarAlertas } from "./engine/alertasPlazos.js";

async function loadRules(){
  const res=await fetch("./data/reglas_29090.json",{cache:"no-store"});
  if(!res.ok) throw new Error(`No se pudo cargar reglas_29090.json: ${res.status}`);
  return await res.json();
}
function readBool(id){return document.getElementById(id).value==="true";}
function readNum(id){const v=Number(document.getElementById(id).value); return Number.isFinite(v)?v:0;}
function readStr(id){return document.getElementById(id).value;}
function buildInput(){
  return {
    tipo_tramite:"edificacion",
    uso_principal:readStr("uso_principal"),
    tipo_intervencion:readStr("tipo_intervencion"),
    area_techada_m2:readNum("area_techada_m2"),
    pisos:readNum("pisos"),
    ocupantes:readNum("ocupantes"),
    tiene_sotano:readBool("tiene_sotano"),
    tiene_semisotano:readBool("tiene_semisotano"),
    usa_explosivos:readBool("usa_explosivos"),
    en_patrimonio_cultural:readBool("en_patrimonio_cultural"),
    regimen_propiedad_exclusiva_y_comun:readBool("regimen_propiedad_exclusiva_y_comun"),
    unica_edificacion_en_lote:readBool("unica_edificacion_en_lote"),
    longitud_cerco_m:readNum("longitud_cerco_m"),
    modificacion_estructural:readBool("modificacion_estructural"),
    cambio_de_uso:readBool("cambio_de_uso"),
    incremento_area_techada:readBool("incremento_area_techada"),
    ruta_evaluacion_preferida:readStr("ruta_evaluacion_preferida")
  };
}
function pill(tipo){const cls=tipo==="ok"?"ok":(tipo==="warn"?"warn":"err");return `<span class="pill ${cls}">${tipo.toUpperCase()}</span>`;}
function render({modalidad,ruta,checklist,alertas}){
  const out=document.getElementById("out");
  const w=(modalidad.warnings??[]).map(x=>`<li>${x}</li>`).join("");
  const ww=w?`<h3>Observaciones</h3><ul>${w}</ul>`:"";
  const items=(checklist.items??[]).map(i=>`<li>${i}</li>`).join("");
  const notas=(checklist.notas??[]).map(n=>`<li>${n}</li>`).join("");
  const cwarn=(checklist.warnings??[]).map(n=>`<li>${n}</li>`).join("");
  const notasHtml=notas?`<h3>Notas</h3><ul>${notas}</ul>`:"";
  const cwarnHtml=cwarn?`<h3>Warnings del checklist</h3><ul>${cwarn}</ul>`:"";
  const al=(alertas.alertas??[]).map(a=>{
    const t=(a.tipo??"info").toLowerCase();
    const p=t==="warning"?pill("warn"):pill("ok");
    return `<li>${p} ${a.mensaje}</li>`;
  }).join("");
  out.innerHTML=`
    <p><b>Modalidad:</b> ${modalidad.resultado} ${modalidad.regla_id?`(criterio: ${modalidad.regla_id})`:""}</p>
    <p><b>Ruta:</b> ${ruta.ruta_id} — ${ruta.descripcion}</p>
    <p class="muted small">${modalidad.explicacion??""}</p>
    ${ww}
    <h3>Checklist</h3>
    ${items?`<ul>${items}</ul>`:`<p class="muted">Sin ítems (revisa reglas).</p>`}
    ${notasHtml}
    ${cwarnHtml}
    <h3>Alertas</h3>
    ${al?`<ul>${al}</ul>`:`<p class="muted">Sin alertas.</p>`}
  `;
}
(async function init(){
  const rules=await loadRules();
  const btn=document.getElementById("btnCalcular");
  const reset=document.getElementById("btnReset");
  const run=()=>{
    const input=buildInput();
    document.getElementById("debug").textContent=JSON.stringify(input,null,2);
    const modalidad=determinarModalidadEdificacion(rules,input);
    const ruta=determinarRuta(rules,modalidad.scope,modalidad.resultado,input);
    const checklist=generarChecklist(rules,modalidad.scope,modalidad.resultado,ruta.ruta_id,input);
    const alertas=generarAlertas(rules,modalidad.scope,modalidad.resultado,ruta.ruta_id,input);
    render({modalidad,ruta,checklist,alertas});
  };
  btn.addEventListener("click",run);
  reset.addEventListener("click",()=>location.reload());
  run();
})().catch(err=>{
  document.getElementById("out").innerHTML=`<p style="color:#c33"><b>Error:</b> ${err.message}</p>`;
});
