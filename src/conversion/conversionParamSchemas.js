/** Parameter fields shown when a form is selected as FROM. */
export const conversionParamSchemas = {
  qStandard: [
    { key: "a", label: "a" },
    { key: "b", label: "b" },
    { key: "c", label: "c" }
  ],
  qVertex: [
    { key: "a", label: "a" },
    { key: "h", label: "h" },
    { key: "k", label: "k" }
  ],
  qFactored: [
    { key: "a", label: "a" },
    { key: "r1", label: "r₁" },
    { key: "r2", label: "r₂" }
  ],
  lSlope: [
    { key: "m", label: "m" },
    { key: "b", label: "b" }
  ],
  lPoint: [
    { key: "m", label: "m" },
    { key: "x1", label: "x₁" },
    { key: "y1", label: "y₁" }
  ],
  lStandard: [
    { key: "A", label: "A" },
    { key: "B", label: "B" },
    { key: "C", label: "C" }
  ],
  eTransformed: [
    { key: "a", label: "a" },
    { key: "b", label: "b" },
    { key: "h", label: "h" },
    { key: "k", label: "k" }
  ]
};

export const conversionDefaultParams = {
  qStandard: { a: 1, b: 0, c: 0 },
  qVertex: { a: 1, h: 0, k: 0 },
  qFactored: { a: 1, r1: 0, r2: 0 },
  lSlope: { m: 1, b: 0 },
  lPoint: { m: 1, x1: 0, y1: 0 },
  lStandard: { A: 1, B: -1, C: 0 },
  eTransformed: { a: 1, b: 2, h: 0, k: 0 }
};

export function getDefaultParamsForForm(formId) {
  const d = conversionDefaultParams[formId];
  return d ? { ...d } : {};
}

export function parseConversionParams(formId, raw) {
  const schema = conversionParamSchemas[formId] || [];
  const out = {};
  for (const field of schema) {
    const v = Number(raw[field.key]);
    out[field.key] = Number.isFinite(v) ? v : NaN;
  }
  return out;
}

export function paramsValid(formId, params) {
  const schema = conversionParamSchemas[formId] || [];
  return schema.every((f) => Number.isFinite(params[f.key]));
}
