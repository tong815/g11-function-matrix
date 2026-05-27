import { EPS, fmt } from "./format.js";

export const DEFAULT_LINEAR = { mode: "normal", m: 2, b: -1, point: [1, 1], A: 2, B: -1, C: -1, xConst: null };

export function buildLinearSlopeInterceptText(m, b) {
  if (Math.abs(m) < EPS) return "y = " + fmt(b);
  let s = "y = ";
  if (Math.abs(m - 1) < EPS) s += "x";
  else if (Math.abs(m + 1) < EPS) s += "-x";
  else s += fmt(m) + "x";
  if (Math.abs(b) >= EPS) s += b > 0 ? " + " + fmt(b) : " - " + fmt(Math.abs(b));
  return s;
}

export function buildLinearPointSlopeText(m, x1, y1) {
  const yPart = Math.abs(y1) < EPS ? "y" : (y1 > 0 ? "y - " + fmt(y1) : "y + " + fmt(Math.abs(y1)));
  const xPart = Math.abs(x1) < EPS ? "x" : (x1 > 0 ? "x - " + fmt(x1) : "x + " + fmt(Math.abs(x1)));
  return yPart + " = " + fmt(m) + "(" + xPart + ")";
}

export function buildLinearStandardText(A, B, C) {
  const term = (coeff, variable) => {
    if (Math.abs(coeff) < EPS) return "";
    const sign = coeff >= 0 ? " + " : " - ";
    const abs = fmt(Math.abs(coeff));
    if (!variable) return sign + abs;
    if (Math.abs(coeff - 1) < EPS && variable) return sign + variable;
    if (Math.abs(coeff + 1) < EPS && variable) return sign + variable;
    return sign + abs + variable;
  };
  let s = "";
  if (Math.abs(A) >= EPS) {
    if (Math.abs(A - 1) < EPS) s = "x";
    else if (Math.abs(A + 1) < EPS) s = "-x";
    else s = fmt(A) + "x";
  }
  s += term(B, "y");
  s += term(C, "");
  if (s.startsWith(" + ")) s = s.slice(3);
  if (s.startsWith(" - ")) s = "-" + s.slice(3);
  if (!s) s = "0";
  return s + " = 0";
}

export function syncLinearFromNormal(m, b, point) {
  const x1 = point ? point[0] : 1;
  const y1 = point ? point[1] : m * x1 + b;
  return { mode: "normal", m, b, point: [x1, y1], A: m, B: -1, C: b, xConst: null };
}

export function syncLinearFromVertical(A, B, C, xConst) {
  return { mode: "vertical", m: null, b: null, point: [xConst, 0], A, B, C, xConst };
}

export function getLinearFeatures(lin) {
  if (lin.mode === "vertical") {
    return { valid: true, isVertical: true, xConst: lin.xConst, A: lin.A, B: lin.B, C: lin.C, m: null, b: null, point: [lin.xConst, 0], slopeInterceptText: null, pointSlopeText: null, standardFormText: buildLinearStandardText(lin.A, lin.B, lin.C) };
  }
  const { m, b, point, A, B, C } = lin;
  if (!Number.isFinite(m) || !Number.isFinite(b) || !point) return { valid: false, error: "invalid" };
  const xInt = Math.abs(A) >= EPS ? -C / A : null;
  const yInt = Math.abs(B) >= EPS ? -C / B : b;
  return { valid: true, isVertical: false, m, b, point, A, B, C, xInt, yInt, slopeInterceptText: buildLinearSlopeInterceptText(m, b), pointSlopeText: buildLinearPointSlopeText(m, point[0], point[1]), standardFormText: buildLinearStandardText(A, B, C) };
}

export function getSlopeInterceptParams(lin) {
  const lf = getLinearFeatures(lin);
  if (!lf.valid) return { isVertical: false, m: lin.m, b: lin.b };
  return { isVertical: lf.isVertical, m: lf.m, b: lf.b };
}

export function getPointSlopeParams(lin) {
  const lf = getLinearFeatures(lin);
  if (!lf.valid || lf.isVertical) return { isVertical: true, m: null, x1: null, y1: null };
  return { isVertical: false, m: lf.m, x1: lf.point[0], y1: lf.point[1] };
}

export function getLinearStandardParams(lin) {
  const lf = getLinearFeatures(lin);
  if (!lf.valid) return { A: lin.A, B: lin.B, C: lin.C };
  return { A: lf.A, B: lf.B, C: lf.C };
}

export function linearFromStandard(A, B, C) {
  if (Math.abs(A) < EPS && Math.abs(B) < EPS) return { valid: false, error: "abZero" };
  if (Math.abs(B) <= EPS) {
    if (Math.abs(A) < EPS) return { valid: false, error: "abZero" };
    const xConst = -C / A;
    return { valid: true, state: syncLinearFromVertical(A, B, C, xConst) };
  }
  const m = -A / B;
  const b = -C / B;
  return { valid: true, state: syncLinearFromNormal(m, b, [1, m + b]) };
}
