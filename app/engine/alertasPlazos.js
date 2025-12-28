export function generarAlertas(rules, scope, modalidad, ruta_id, input) {
  const alertas = [];
  const lic = rules?.licencia;

  if (scope !== "edificacion") return { alertas };

  if (modalidad === "EXENTA") {
    alertas.push({ tipo: "info", mensaje: "Caso exento: no hay vigencia/prórroga/revalidación de licencia aplicable." });
    return { alertas };
  }

  if (lic?.vigencia_general?.vigencia_meses) {
    alertas.push({ tipo: "info", mensaje: `Vigencia estándar de licencia: ${lic.vigencia_general.vigencia_meses} meses desde emisión.` });
  }
  if (lic?.prorroga?.permitida) {
    alertas.push({
      tipo: "warning",
      mensaje: `Prórroga: ${lic.prorroga.duracion_meses} meses (máx. ${lic.prorroga.veces_max} vez). Solicitar dentro de ${lic.prorroga.debe_solicitarse_dentro_de_dias_calendario_antes_vencimiento} días calendario antes del vencimiento.`
    });
  }
  if (lic?.revalidacion?.permitida) {
    alertas.push({
      tipo: "warning",
      mensaje: `Revalidación: máx. ${lic.revalidacion.veces_max} vez; duración ${lic.revalidacion.duracion_meses} meses (sujeto a condiciones).`
    });
  }

  const enPat = input.en_patrimonio_cultural === true;
  if (enPat) {
    alertas.push({ tipo: "warning", mensaje: "Patrimonio Cultural marcado: el silencio administrativo positivo puede no ser aplicable en ciertos supuestos." });
  } else if (modalidad === "B" || modalidad === "C" || modalidad === "D") {
    alertas.push({ tipo: "info", mensaje: "Modalidad con evaluación: registra fechas para control de plazos y posible silencio administrativo (según supuestos aplicables)." });
  }

  return { alertas };
}
