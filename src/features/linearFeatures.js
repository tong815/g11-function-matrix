import { EPS } from "../math/format.js";
import {
  buildLinearSlopeInterceptText,
  buildLinearPointSlopeText,
  buildLinearStandardText,
  syncLinearFromNormal
} from "../math/linear.js";

/** Canonical { m, b } only — y = mx + b (functions, not vertical relations). */
export function deriveLinearFeatures(canonical) {
  const m = Number(canonical.m);
  const b = Number(canonical.b);
  if (!Number.isFinite(m) || !Number.isFinite(b)) {
    return { valid: false, error: "invalid" };
  }
  const point = [0, b];
  const alt = [1, m + b];
  const displayPoint = Math.abs(m) < EPS ? point : alt;
  const A = m;
  const B = -1;
  const C = b;
  const xInt = Math.abs(m) >= EPS ? -b / m : null;
  return {
    valid: true,
    error: null,
    m,
    b,
    point: displayPoint,
    A,
    B,
    C,
    xInt,
    yIntercept: b,
    slopeInterceptText: buildLinearSlopeInterceptText(m, b),
    pointSlopeText: buildLinearPointSlopeText(m, displayPoint[0], displayPoint[1]),
    standardFormText: buildLinearStandardText(A, B, C)
  };
}

export function linearCanonicalToAdapterParams(canonical) {
  const { m, b } = canonical;
  return syncLinearFromNormal(m, b, [1, m + b]);
}
