import { EPS, fmt } from "./format.js";
import { buildVertexFormText } from "./quadratic.js";

function horizontalShiftPhrase(h, lang) {
  if (Math.abs(h) < EPS) return null;
  const n = fmt(Math.abs(h));
  if (lang === "zh") return h > 0 ? `右移${n}` : `左移${n}`;
  return h > 0 ? `right ${n}` : `left ${n}`;
}

function reflectionPhrase(a, lang) {
  if (a >= -EPS) return null;
  return lang === "zh" ? "关于x轴翻折" : "reflect over x-axis";
}

function verticalScalePhrase(a, lang) {
  const absA = Math.abs(a);
  if (Math.abs(absA - 1) < EPS) return null;
  const n = fmt(absA);
  if (lang === "zh") {
    return absA > 1 ? `纵向拉伸${n}倍` : `纵向压缩${n}倍`;
  }
  return absA > 1 ? `vertical stretch ${n}` : `vertical compression ${n}`;
}

function verticalShiftPhrase(k, lang) {
  if (Math.abs(k) < EPS) return null;
  const n = fmt(Math.abs(k));
  if (lang === "zh") return k > 0 ? `上移${n}` : `下移${n}`;
  return k > 0 ? `up ${n}` : `down ${n}`;
}

/**
 * Ordered transformation phrases for y = a(x − h)² + k:
 * horizontal shift → reflection → vertical scale → vertical shift.
 */
export function describeVertexTransformations(a, h, k, lang = "en") {
  return [
    horizontalShiftPhrase(h, lang),
    reflectionPhrase(a, lang),
    verticalScalePhrase(a, lang),
    verticalShiftPhrase(k, lang)
  ].filter(Boolean);
}

export function formatVertexTransformExample(a, h, k, lang = "en") {
  const equation = buildVertexFormText(a, h, k).replace(/\s/g, "");
  const parts = describeVertexTransformations(a, h, k, lang);
  const sep = lang === "zh" ? "，" : ", ";
  return `${equation} -> ${parts.join(sep)}`;
}
