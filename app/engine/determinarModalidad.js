import { matchCondition, normalizeStr } from "./utils.js";

export function determinarModalidadEdificacion(rules,input){
  const warnings=[];const ed=rules?.edificacion;
  if(!ed){return{scope:"edificacion",resultado:"INDETERMINADO",regla_id:null,explicacion:"No se encontró el bloque 'edificacion' en reglas_29090.json.",warnings:["Verifica la estructura del JSON."]};}

  const ti=normalizeStr(input.tipo_intervencion);
  const enPat=input.en_patrimonio_cultural===true;

  for(const ex of (ed.excepciones_sin_licencia??[])){
    if(ex.id==="acondicionamiento_refaccion"){
      if((ti==="acondicionamiento"||ti==="refaccion")&&!enPat){return{scope:"edificacion",resultado:"EXENTA",regla_id:ex.id,explicacion:ex.descripcion,warnings};}
    }
    if(ex.id==="cerco_frontal_hasta_20m"){
      const m=Number(input.longitud_cerco_m??0);const enReg=input.regimen_propiedad_exclusiva_y_comun===true;
      if(ti==="cerco"&&m>0&&m<=20&&!enPat&&!enReg){return{scope:"edificacion",resultado:"EXENTA",regla_id:ex.id,explicacion:ex.descripcion,warnings};}
    }
    if(ex.id==="instalacion_temporal"){
      if(ti==="instalacion_temporal"&&!enPat){return{scope:"edificacion",resultado:"EXENTA",regla_id:ex.id,explicacion:ex.descripcion,warnings};}
    }
  }

  const mods=ed.modalidades??{};
  const matchMod=(key)=>{
    const mod=mods[key]; if(!mod) return null;
    for(const c of (mod.criterios_elegibilidad??[])){
      if(matchCondition(input,c.si)){ return {resultado:key,regla_id:c.id,explicacion:`Modalidad ${key}: coincide con criterio '${c.id}'.`}; }
    }
    return null;
  };

  let r=matchMod("A");
  if(r){ if(enPat) warnings.push("Patrimonio Cultural marcado: normalmente Modalidad A no aplica; revisa C/D."); return {scope:"edificacion",...r,warnings}; }

  r=matchMod("B");
  if(r){ if(enPat) warnings.push("Patrimonio Cultural marcado: el modelo sugiere C/D; valida si B corresponde."); return {scope:"edificacion",...r,warnings}; }

  r=matchMod("D"); if(r) return {scope:"edificacion",...r,warnings};
  r=matchMod("C"); if(r) return {scope:"edificacion",...r,warnings};

  return {scope:"edificacion",resultado:"INDETERMINADO",regla_id:null,explicacion:"No se encontró criterio coincidente en A/B/C/D. Revisa inputs o completa reglas.",warnings:["Valida campos mínimos y criterios en el JSON."]};
}
