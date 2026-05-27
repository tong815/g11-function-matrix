import { EPS, fmt } from "./format.js";

export const DEFAULT_EXPONENTIAL = { a: 1, b: 2, h: 0, k: 0 };

export function evaluateExponential(x, params) {
  const { a, b, h, k } = params;
  return a * Math.pow(b, x - h) + k;
}

export function validateExponentialParams({ a, b, h, k }) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(h) || !Number.isFinite(k)) {
    return { valid: false, error: "invalid" };
  }
  if (Math.abs(a) < EPS) return { valid: false, error: "aZero" };
  if (b <= 0 || Math.abs(b - 1) < EPS) return { valid: false, error: "bInvalid" };
  return { valid: true, a, b, h, k };
}

export function validateGrowthDecayParams({ A, r }) {
  if (!Number.isFinite(A) || !Number.isFinite(r)) {
    return { valid: false, error: "invalid" };
  }
  if (Math.abs(A) < EPS) return { valid: false, error: "aZero" };
  if (r <= 0 || Math.abs(r - 1) < EPS) return { valid: false, error: "bInvalid" };
  return { valid: true, A, r };
}

function growthOrDecayLabel(b, lang) {
  if (b > 1 + EPS) return lang === "zh" ? "增长 (growth)" : "growth";
  if (b < 1 - EPS) return lang === "zh" ? "衰减 (decay)" : "decay";
  return lang === "zh" ? "常数底" : "constant base";
}

export function buildBasicFormText(b) {
  if (Math.abs(b - 1) < EPS) return "y = 1";
  if (Math.abs(b - Math.E) < 0.001) return "y = e^x";
  return "y = " + fmt(b) + "^x";
}

export function buildTransformedFormText(a, b, h, k) {
  let text = "y = " + fmt(a);
  if (Math.abs(h) < EPS) text += "·" + fmt(b) + "^x";
  else if (h > 0) text += "·" + fmt(b) + "^(x - " + fmt(h) + ")";
  else text += "·" + fmt(b) + "^(x + " + fmt(-h) + ")";
  if (Math.abs(k) >= EPS) text += k > 0 ? " + " + fmt(k) : " - " + fmt(Math.abs(k));
  return text;
}

export function buildGrowthDecayFormText(A, r) {
  return "y = " + fmt(A) + "·" + fmt(r) + "^x";
}

export function getExponentialFeatures(params, currentLang) {
  const check = validateExponentialParams(params);
  if (!check.valid) {
    return {
      valid: false,
      error: check.error,
      base: null,
      asymptoteY: null,
      yIntercept: null,
      growthOrDecay: null,
      basicFormText: "",
      transformedFormText: "",
      growthDecayFormText: "",
      domainText: "",
      rangeText: ""
    };
  }

  const { a, b, h, k } = check;
  const yIntercept = evaluateExponential(0, { a, b, h, k });
  const lang = currentLang === "zh" ? "zh" : "en";
  const growth = growthOrDecayLabel(b, lang);

  const domainText =
    lang === "zh" ? "定义域：全体实数 ℝ" : "Domain: all real numbers ℝ";
  const kNearZero = Math.abs(k) < EPS;
  let rangeText;
  if (a > 0) {
    rangeText = kNearZero
      ? lang === "zh"
        ? "值域：y > 0"
        : "Range: y > 0"
      : lang === "zh"
        ? "值域：y > " + fmt(k)
        : "Range: y > " + fmt(k);
  } else {
    rangeText = kNearZero
      ? lang === "zh"
        ? "值域：y < 0"
        : "Range: y < 0"
      : lang === "zh"
        ? "值域：y < " + fmt(k)
        : "Range: y < " + fmt(k);
  }

  return {
    valid: true,
    error: null,
    a,
    b,
    h,
    k,
    base: b,
    asymptoteY: k,
    yIntercept,
    growthOrDecay: growth,
    basicFormText: buildBasicFormText(b),
    transformedFormText: buildTransformedFormText(a, b, h, k),
    growthDecayFormText: buildGrowthDecayFormText(a, b),
    domainText,
    rangeText
  };
}
