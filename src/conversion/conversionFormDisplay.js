import { fmt } from "../math/format.js";
import { buildTransformedFormText } from "../math/exponential.js";
import {
  buildVertexFormText,
  buildFactoredText,
  buildSlopeIntercept,
  buildPointSlope
} from "./conversionMath.js";
import { conversionParamSchemas, paramsValid } from "./conversionParamSchemas.js";
import { equationForForm } from "../functionRegistry/index.js";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formLabel(form, i18n, lang) {
  return i18n[lang][form.labelKey] || form.id;
}

function buildSelectOptions(forms, selectedId, i18n, lang, { excludeId } = {}) {
  return forms
    .filter((f) => f.id !== excludeId)
    .map((f) => {
      const sel = f.id === selectedId ? " selected" : "";
      return `<option value="${escapeHtml(f.id)}"${sel}>${escapeHtml(formLabel(f, i18n, lang))}</option>`;
    })
    .join("");
}

export function getFormRecord(matrix, formId) {
  return matrix?.forms?.find((f) => f.id === formId) ?? null;
}

/** Name + abstract template from matrix.forms (equation field). */
export function getFormDisplay(matrix, formId, i18n, lang) {
  const form = getFormRecord(matrix, formId);
  if (!form) return { name: formId, template: "" };
  const name = i18n[lang][form.labelKey] || form.id;
  return { name, template: form.equation || "" };
}

export function buildConcreteEquation(formId, params) {
  if (!paramsValid(formId, params)) return null;
  switch (formId) {
    case "qStandard": {
      const { a, b, c } = params;
      let t = "y = " + fmt(a) + "x²";
      if (Math.abs(b) >= 1e-9) t += b > 0 ? " + " + fmt(b) + "x" : " − " + fmt(Math.abs(b)) + "x";
      if (Math.abs(c) >= 1e-9) t += c > 0 ? " + " + fmt(c) : " − " + fmt(Math.abs(c));
      return t;
    }
    case "qVertex":
      return buildVertexFormText(params.a, params.h, params.k);
    case "qFactored":
      return buildFactoredText(params.a, params.r1, params.r2);
    case "lSlope":
      return buildSlopeIntercept(params.m, params.b);
    case "lPoint":
      return buildPointSlope(params.m, params.x1, params.y1);
    case "lStandard": {
      const { A, B, C } = params;
      const parts = [];
      if (Math.abs(A) >= 1e-9) parts.push(`${fmt(A)}x`);
      if (Math.abs(B) >= 1e-9) parts.push(`${B >= 0 ? "+ " : "− "}${fmt(Math.abs(B))}y`);
      if (Math.abs(C) >= 1e-9) parts.push(`${C >= 0 ? "+ " : "− "}${fmt(Math.abs(C))}`);
      return (parts.join(" ") || "0") + " = 0";
    }
    case "eTransformed":
      return buildTransformedFormText(params.a, params.b, params.h, params.k);
    default:
      return null;
  }
}

export function buildParamMappings(formId, params) {
  const schema = conversionParamSchemas[formId] || [];
  return schema.map((field) => ({
    key: field.key,
    label: field.label,
    value: params[field.key],
    display: Number.isFinite(params[field.key]) ? fmt(params[field.key]) : "?"
  }));
}

/** Single representation header: dropdown + abstract equation (same DOM on all viewports). */
export function renderRepresentationCards({ matrix, fromFormId, toFormId, i18n, lang, labels }) {
  const current = getFormDisplay(matrix, fromFormId, i18n, lang);
  const target = getFormDisplay(matrix, toFormId, i18n, lang);
  const forms = matrix?.forms ?? [];

  return `
    <div class="cw-representation-cards">
      <div class="cw-representation-card cw-representation-from">
        <span class="cw-representation-role">${escapeHtml(labels.currentRepresentation)}</span>
        <select id="cwFromSelect" class="cw-representation-select" aria-label="${escapeHtml(labels.currentRepresentation)}">${buildSelectOptions(forms, fromFormId, i18n, lang)}</select>
        <div class="cw-representation-equation">${escapeHtml(current.template)}</div>
      </div>
      <span class="cw-representation-arrow" aria-hidden="true">→</span>
      <div class="cw-representation-card cw-representation-to">
        <span class="cw-representation-role">${escapeHtml(labels.targetRepresentation)}</span>
        <select id="cwToSelect" class="cw-representation-select" aria-label="${escapeHtml(labels.targetRepresentation)}">${buildSelectOptions(forms, toFormId, i18n, lang, { excludeId: fromFormId })}</select>
        <div class="cw-representation-equation">${escapeHtml(target.template)}</div>
      </div>
    </div>
  `;
}

export function renderParamIdentification({ formId, params, labels, rootFunction, currentLang, i18n }) {
  const schema = conversionParamSchemas[formId] || [];
  if (!schema.length) return "";

  const concrete =
    rootFunction && i18n && currentLang
      ? equationForForm(rootFunction, formId, currentLang, i18n)
      : buildConcreteEquation(formId, params);
  const mappings = buildParamMappings(formId, params);

  let html = `<div class="cw-param-ident"><span class="cw-section-label">${escapeHtml(labels.paramIdentification)}</span>`;
  if (concrete) {
    html += `<div class="cw-param-ident-input"><span class="cw-param-ident-label">${escapeHtml(labels.inputEquation)}</span><code class="cw-param-ident-eq">${escapeHtml(concrete)}</code></div>`;
  }
  html += '<div class="cw-param-ident-mappings">';
  mappings.forEach((m) => {
    html += `<span class="cw-param-map-tag"><span class="cw-param-map-var">${escapeHtml(m.label)}</span><span class="cw-param-map-eq">=</span><span class="cw-param-map-val">${escapeHtml(m.display)}</span></span>`;
  });
  html += "</div></div>";
  return html;
}
