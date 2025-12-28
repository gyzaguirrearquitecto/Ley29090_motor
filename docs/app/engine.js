export function normalizeInput(raw){const o={...raw};for(const k of Object.keys(o)){if(o[k]==="")o[k]=null;}return o;}
function isNil(v){return v===null||v===undefined;}
function evalOp(op,left,right){
  const ln=(typeof left==="string"&&left.trim()!==""&&!isNaN(Number(left)))?Number(left):left;
  const rn=(typeof right==="string"&&right.trim()!==""&&!isNaN(Number(right)))?Number(right):right;
  switch(op){
    case "eq": return ln===rn;
    case "neq": return ln!==rn;
    case "in": return Array.isArray(rn)?rn.includes(ln):false;
    case "gt": return (typeof ln==="number"&&typeof rn==="number")?ln>rn:false;
    case "gte": return (typeof ln==="number"&&typeof rn==="number")?ln>=rn:false;
    case "lt": return (typeof ln==="number"&&typeof rn==="number")?ln<rn:false;
    case "lte": return (typeof ln==="number"&&typeof rn==="number")?ln<=rn:false;
    case "exists": return !isNil(ln);
    default: return false;
  }
}
function evalCondition(cond,input){
  if(cond.all) return cond.all.every(c=>evalCondition(c,input));
  if(cond.any) return cond.any.some(c=>evalCondition(c,input));
  if(cond.not) return !evalCondition(cond.not,input);
  if(cond.field&&cond.op){
    const v=input[cond.field];
    if(cond.op==="exists") return evalOp("exists",v,null);
    return evalOp(cond.op,v,cond.value);
  }
  return false;
}
function requiredFields(){return ["scope","es_patrimonio_cultural","regimen_propiedad_exclusiva_y_comun"];}
export function evaluate(ruleset,rawInput){
  const input=normalizeInput(rawInput);
  const missing=[]; for(const f of requiredFields()){ if(isNil(input[f])) missing.push(f); }
  const rules=[...ruleset.rules].sort((a,b)=>(b.priority||0)-(a.priority||0));
  const fired=[];
  for(const r of rules){
    if(r.scope&&input.scope&&r.scope!==input.scope) continue;
    const ok=evalCondition(r.when||{},input);
    if(ok){
      fired.push({id:r.id,name:r.name,priority:r.priority,fuente:r.fuente});
      return {...r.then,rule_id:r.id,rule_name:r.name,fuente:r.fuente,debug:{fired,missing}};
    }
  }
  return {outcome_type:"indeterminado",label:"No se pudo clasificar.",alertas:["Completa campos clave y reintenta."],debug:{fired,missing}};
}
