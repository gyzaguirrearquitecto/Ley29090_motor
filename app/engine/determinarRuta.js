import { normalizeStr } from "./utils.js";

export function determinarRuta(rules, scope, modalidad, input) {
  if (scope !== "edificacion") return { ruta_id: "N/A", descripcion: "Ruta no implementada para este scope." };
  if (modalidad === "EXENTA") return { ruta_id: "SIN_LICENCIA", descripcion: "No corresponde ruta de licencia (excepción)." };
  if (modalidad === "A") return { ruta_id: "AUTOMATICA", descripcion: "Aprobación automática con firma de profesionales." };

  const pref = normalizeStr(input.ruta_evaluacion_preferida);

  if (modalidad === "B") {
    if (pref.includes("revisores")) return { ruta_id: "revisores_urbanos_evaluacion_previa", descripcion: "Evaluación previa por Revisores Urbanos." };
    return { ruta_id: "municipalidad_evaluacion", descripcion: "Evaluación por Municipalidad." };
  }

  if (modalidad === "C" || modalidad === "D") {
    if (pref.includes("revisores")) return { ruta_id: "revisores_urbanos", descripcion: "Evaluación previa por Revisores Urbanos." };
    return { ruta_id: "comision_tecnica", descripcion: "Evaluación previa por Comisión Técnica." };
  }

  return { ruta_id: "INDETERMINADA", descripcion: "No se pudo determinar ruta." };
}
