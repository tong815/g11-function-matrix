import { fmt } from "../math/format.js";

export function labelVertex(g) {
  return "V(" + fmt(g.h) + "," + fmt(g.k) + ")";
}

export function labelYInt(g) {
  return "(0," + fmt(g.c) + ")";
}

export function labelAxis(g) {
  return "x=h≈" + fmt(g.h);
}

export function labelRoot1(g) {
  return "r₁≈" + fmt(g.roots[0]);
}

export function labelRoot2(g) {
  return "r₂≈" + fmt(g.roots[1]);
}

export function labelDoubleRoot(g, t) {
  return "r≈" + fmt(g.roots[0]) + " (" + t.markerDoubleRoot + ")";
}

export const quadraticFormBoost = {
  qStandard: ["yint", "opening"],
  qFactored: ["xint"],
  qVertex: ["vertex", "axis", "extreme"]
};
