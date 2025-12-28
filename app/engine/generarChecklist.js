import { matchCondition, uniq } from "./utils.js";
export function generarChecklist(rules,scope,modalidad,ruta_id,input){
  const items=[],notas=[],warnings=[];
  if(scope!=="edificacion") return {items,notas:["Checklist no implementado para este scope."],warnings};
  if(modalidad==="EXENTA"){notas.push("Excepción: no corresponde licencia. Conserva evidencia y verifica obligaciones asociadas (si aplica)."); return {items,notas,warnings};}
  const ed=rules.edificacion; const mod=ed?.modalidades?.[modalidad];
  if(!mod) return {items,notas:["No se encontró modalidad en JSON."],warnings:["Revisa reglas_29090.json."]};

  const req=mod.requisitos;
  if(req?.base?.documentacion_tecnica) items.push(...req.base.documentacion_tecnica);
  if(req?.base?.archivo_digital_obligatorio) items.push("archivo_digital_documentacion_tecnica");

  for(const v of (req?.variantes??[])){
    if(matchCondition(input,v.cuando??{})){
      items.push(...(v.documentacion_tecnica??[]));
      if(v.archivo_digital_obligatorio) items.push("archivo_digital_documentacion_tecnica");
      if(v.nota) notas.push(v.nota);
    }
  }

  const rutas=mod.rutas_procedimiento??{};
  const ruta=rutas[ruta_id];
  if(ruta){
    if(Array.isArray(ruta.input_clave)) items.push(...ruta.input_clave);
    if(Array.isArray(ruta.requisitos_adicionales_clave)) items.push(...ruta.requisitos_adicionales_clave);
    for(const c of (ruta.condicionales??[])){
      if(matchCondition(input,c.si)){
        items.push(...(c.entonces?.agregar??[]));
        if(c.entonces?.nota) notas.push(c.entonces.nota);
      }
    }
    if(Array.isArray(ruta.base_requisitos)) notas.push(`Base aplicada (etiquetas del modelo): ${ruta.base_requisitos.join(", ")}`);
  } else {
    warnings.push(`No se encontró configuración de ruta '${ruta_id}' para Modalidad ${modalidad}.`);
  }
  return {items:uniq(items),notas:uniq(notas),warnings:uniq(warnings)};
}
