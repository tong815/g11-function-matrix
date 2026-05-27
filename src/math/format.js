export const EPS = 1e-9;

export function fmt(n) {
  if (!Number.isFinite(n)) return "?";
  const rounded = Math.round(n * 1000) / 1000;
  if (Math.abs(rounded) < EPS) return "0";
  if (Number.isInteger(rounded)) return String(rounded);
  return String(rounded);
}

export function signedTerm(coeff, variable) {
  const abs = fmt(Math.abs(coeff));
  if (Math.abs(coeff) < EPS) return "";
  const sign = coeff >= 0 ? " + " : " - ";
  if (variable === "") return sign + abs;
  if (Math.abs(Math.abs(coeff) - 1) < EPS && variable) return sign + variable;
  return sign + abs + variable;
}

export function rootBracket(root) {
  if (Math.abs(root) < EPS) return "(x)";
  if (root > 0) return "(x - " + fmt(root) + ")";
  return "(x + " + fmt(-root) + ")";
}
