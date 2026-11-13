const STOP = new Set(("a an the and or of to in on for with by is are was were be been being do does did have has had can could will would shall should may might must it its this that these those as at from into than then so such not no if we our us you your they their there which who whom what when where how any all each per via also only other more most " +
  "el la los las un una unos unas y o de del al en con por para es son fue ser sido hay se su sus lo le les que como cual cuales cuando donde mas menos sobre entre este esta estos estas asi tambien solo otro otra todos todas cada segun tiene tienen dispone disponen existe existen realiza realizan cuenta cuentan").split(" "));

export const CONCEPTS: Record<string, string[]> = {
  mfa: ["mfa", "2fa", "multifactor", "multi factor", "multi-factor", "two factor", "two-factor", "doble factor", "segundo factor", "autenticacion fuerte"],
  encryption: ["encrypt", "encrypted", "encryption", "cifrado", "cifrada", "cifrados", "cifra", "cifran", "aes", "tls", "at rest", "en reposo", "in transit", "en transito"],
  backup: ["backup", "backups", "copia de seguridad", "copias de seguridad", "restore", "restauracion"],
  incident: ["incident", "incidents", "incidente", "incidentes", "breach", "brecha", "data breach"],
  vulnerability: ["vulnerability", "vulnerabilities", "vulnerabilidad", "vulnerabilidades", "patch", "patching", "parche", "parches", "parcheo"],
  pentest: ["pentest", "penetration test", "penetration testing", "pruebas de intrusion", "test de intrusion", "ethical hacking", "red team"],
  access: ["least privilege", "minimo privilegio", "access control", "control de acceso", "rbac", "role based", "roles"],
  logging: ["logging", "logs", "log", "siem", "registro de actividad", "registros", "monitoring", "monitorizacion", "monitoreo"],
  training: ["training", "awareness", "formacion", "concienciacion", "capacitacion", "phishing simulation"],
  continuity: ["business continuity", "continuidad de negocio", "disaster recovery", "recuperacion ante desastres", "bcp", "drp", "rto", "rpo"],
  vendor: ["vendor", "supplier", "subprocessor", "subprocessors", "third party", "third-party", "proveedor", "proveedores", "subencargado", "subencargados", "tercero", "terceros"],
  privacy: ["gdpr", "rgpd", "dpo", "delegado de proteccion de datos", "data protection officer", "privacy", "privacidad", "dpia", "eipd"],
  iso27001: ["iso 27001", "iso27001", "iso/iec 27001", "27001"],
  soc: ["soc 24x7", "24x7", "24/7", "security operations center", "centro de operaciones de seguridad", "mdr"],
  sso: ["sso", "single sign on", "single sign-on", "saml", "oidc", "inicio de sesion unico"],
  retention: ["retention", "retencion", "retain", "retained", "conserva", "conservan", "conservacion", "conservados", "deletion", "delete", "deleted", "suprimen", "suprimir", "supresion", "borrado", "borran"],
  termination: ["termination", "terminated", "end of contract", "end of the contract", "finalizacion", "extincion", "terminacion", "cese"],
  contract: ["contract", "contracts", "contrato", "contratos"],
  annual: ["annually", "annual", "yearly", "once a year", "every year", "per year", "anual", "anualmente", "cada ano", "una vez al ano"],
  assess: ["assess", "assessed", "assessment", "evaluate", "evaluated", "due diligence", "vetted", "evalua", "evaluan", "evaluados", "evaluacion", "se evaluan"],
  engage: ["engage", "engaging", "engagement", "onboarding", "contratacion", "contratar", "contratados"],
  background: ["background check", "background checks", "verificacion de antecedentes", "screening", "antecedentes"],
  insurance: ["cyber insurance", "ciberseguro", "seguro cibernetico", "seguro de ciberriesgos"],
  endpoint: ["edr", "endpoint", "antivirus", "antimalware", "xdr"],
  sdlc: ["sdlc", "secure development", "desarrollo seguro", "code review", "revision de codigo", "sast", "dast"],
};

export function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const PHRASES: [RegExp, string][] = Object.entries(CONCEPTS).flatMap(([c, ws]) =>
  ws.slice().sort((a, b) => b.length - a.length).map((w) => [new RegExp(`(?<![a-z0-9])${fold(w).replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&").replace(/\s+/g, "\\s+")}(?![a-z0-9])`, "g"), `c_${c}`] as [RegExp, string]));

export function stem(w: string): string {
  if (w.length <= 4) return w;
  for (const suf of ["aciones", "acion", "amientos", "amiento", "mente", "ments", "ment", "ings", "ing", "edly", "ed", "ies", "es", "s", "ar", "er", "ir", "ado", "ido", "ada", "ida"]) {
    if (w.endsWith(suf) && w.length - suf.length >= 4) return w.slice(0, -suf.length);
  }
  return w.length > 5 && w.endsWith("e") ? w.slice(0, -1) : w;
}

/** Tokens: stemmed content words plus one token per recognised concept, so EN and ES phrasings meet in the middle. */
export function tokens(text: string): string[] {
  let t = fold(text);
  const concepts: string[] = [];
  for (const [re, c] of PHRASES) { t = t.replace(re, () => { concepts.push(c); return " "; }); }
  const words = (t.match(/[a-z0-9]+/g) ?? []).filter((w) => !STOP.has(w) && w.length > 1).map(stem);
  return [...words, ...concepts];
}
