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

/** Linear factor (x − r) or (x + |r|) with parentheses. */
export function formatFactor(root) {
  if (Math.abs(root) < EPS) return "(x)";
  if (root > 0) return `(x - ${fmt(root)})`;
  return `(x + ${fmt(-root)})`;
}

/** Leading coefficient in factored form: omit 1, use − for −1. */
export function formatLeadingCoefficient(a) {
  if (Math.abs(a - 1) < EPS) return "";
  if (Math.abs(a + 1) < EPS) return "-";
  return fmt(a);
}

/** Factored quadratic body without "y = " prefix, e.g. (x - 2)(x - 3) or -(x - 1)(x + 4). */
export function buildFactoredExpression(a, r1, r2) {
  const aPart = formatLeadingCoefficient(a);
  const factor1 = formatFactor(r1);
  if (Math.abs(r1 - r2) < EPS) {
    return `${aPart}${factor1}²`;
  }
  const factor2 = formatFactor(r2);
  return `${aPart}${factor1}${factor2}`;
}

export function rootBracket(root) {
  return formatFactor(root);
}
