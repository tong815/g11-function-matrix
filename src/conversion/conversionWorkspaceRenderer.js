import {
  conversionParamSchemas,
  getDefaultParamsForForm,
  parseConversionParams
} from "./conversionParamSchemas.js";
import { runConversionGenerator } from "./generators/index.js";
import { resolveTransformationRuleId } from "../data/transformationLookup.js";
import {
  ensureValidTransformationState,
  getDefaultTransformationPair
} from "../data/transformationLookup.js";

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

function renderTagList(items) {
  if (!items?.length) return "";
  return `<div class="cw-tags">${items.map((x) => `<span class="cw-tag">${escapeHtml(x)}</span>`).join("")}</div>`;
}

function renderLiveSteps(output, labels) {
  if (output.blocked && output.blockMessage) {
    return `<div class="cw-blocked">${escapeHtml(output.blockMessage)}</div>`;
  }
  if (!output.steps?.length && !output.result) {
    return `<div class="cw-placeholder">${escapeHtml(labels.selectPair)}</div>`;
  }

  let html = "";
  if (output.route) {
    html += `<div class="cw-route">${escapeHtml(output.route)}</div>`;
  }
  if (output.known?.length || output.target?.length) {
    html += '<div class="cw-meta">';
    if (output.known?.length) {
      html += `<div class="cw-meta-row"><span class="cw-meta-label">${escapeHtml(labels.known)}</span>${renderTagList(output.known)}</div>`;
    }
    if (output.target?.length) {
      html += `<div class="cw-meta-row"><span class="cw-meta-label">${escapeHtml(labels.target)}</span>${renderTagList(output.target)}</div>`;
    }
    html += "</div>";
  }
  if (output.formulas?.length) {
    html += `<div class="cw-formulas"><span class="cw-section-label">${escapeHtml(labels.formulas)}</span>`;
    output.formulas.forEach((f) => {
      html += `<div class="cw-formula-line">${escapeHtml(f)}</div>`;
    });
    html += "</div>";
  }

  html += `<div class="cw-steps-live"><span class="cw-section-label cw-section-label-strong">${escapeHtml(labels.liveSteps)}</span>`;
  html += '<ol class="cw-step-list">';
  (output.steps || []).forEach((step, idx) => {
    html += `<li class="cw-step-item"><span class="cw-step-label">${escapeHtml(step.label || `${idx + 1}.`)}</span>`;
    html += '<pre class="cw-step-body">';
    html += (step.lines || []).map(escapeHtml).join("\n");
    html += "</pre></li>";
  });
  html += "</ol></div>";

  if (output.static) {
    html += `<div class="cw-static-badge">${escapeHtml(labels.staticFallback)}</div>`;
  }

  if (output.result && !output.blocked) {
    html += `<div class="cw-final"><span class="cw-section-label">${escapeHtml(labels.final)}</span><div class="cw-final-answer">${escapeHtml(output.result)}</div></div>`;
  }

  if (output.mistakes?.length) {
    html += `<div class="cw-mistakes"><span class="cw-section-label cw-warn">${escapeHtml(labels.mistakes)}</span><ul>`;
    output.mistakes.forEach((m) => {
      html += `<li>${escapeHtml(m)}</li>`;
    });
    html += "</ul></div>";
  }

  if (output.intuition?.lines?.length) {
    const title = output.intuition.title || labels.intuition;
    html += `<details class="cw-intuition"><summary>${escapeHtml(title)}</summary>`;
    output.intuition.lines.forEach((line) => {
      html += `<div class="cw-intuition-line">${escapeHtml(line)}</div>`;
    });
    html += "</details>";
  }

  return html;
}

function readParamsFromDom(formId) {
  const schema = conversionParamSchemas[formId] || [];
  const raw = {};
  schema.forEach((field) => {
    const el = document.getElementById(`cw-param-${field.key}`);
    if (el) raw[field.key] = el.value;
  });
  return parseConversionParams(formId, raw);
}

function renderParamInputs(formId, params, labels) {
  const schema = conversionParamSchemas[formId] || [];
  if (!schema.length) {
    return `<div class="cw-param-empty">${escapeHtml(labels.noParams)}</div>`;
  }
  return schema
    .map((field) => {
      const val = params[field.key] ?? "";
      return `<label class="cw-param-field">
        <span class="cw-param-name">${escapeHtml(field.label)}</span>
        <input type="number" step="any" class="cw-param-input" id="cw-param-${field.key}" value="${escapeHtml(val)}" />
      </label>`;
    })
    .join("");
}

/**
 * Unified Conversion Workspace: selectors + params + live steps.
 */
export function renderConversionWorkspace({
  mountId,
  topic,
  conversionState,
  i18n,
  currentLang,
  onStateChange
}) {
  const mount = document.getElementById(mountId);
  const t = i18n[currentLang];
  const matrix = topic.matrix;
  const rules = topic.transformations.rules;
  const flowContent = topic.transformations.flowContent;
  const { fromFormId, toFormId, params } = conversionState;

  const ruleId = resolveTransformationRuleId(rules, fromFormId, toFormId);
  const output = ruleId
    ? runConversionGenerator(ruleId, params, currentLang, flowContent)
    : {
        ok: false,
        blocked: true,
        blockMessage: t.flowNoDirectRule,
        steps: [],
        mistakes: [],
        intuition: { title: "", lines: [] }
      };

  const labels = {
    known: t.flowKnown,
    target: t.flowTarget,
    formulas: t.flowFormulas,
    liveSteps: t.cwLiveStepsTitle,
    final: t.cwFinalLabel,
    mistakes: t.flowMistakes,
    intuition: t.flowIntuition,
    staticFallback: t.cwStaticFallback,
    selectPair: t.flowNoDirectRule
  };

  mount.innerHTML = `
    <div class="conversion-workspace">
      <div class="cw-selectors">
        <label class="cw-select-field">
          <span class="cw-select-label">${escapeHtml(t.transFromLabel)}</span>
          <select id="cwFromSelect" class="cw-select">${buildSelectOptions(matrix.forms, fromFormId, i18n, currentLang)}</select>
        </label>
        <span class="cw-arrow">→</span>
        <label class="cw-select-field">
          <span class="cw-select-label">${escapeHtml(t.transToLabel)}</span>
          <select id="cwToSelect" class="cw-select">${buildSelectOptions(matrix.forms, toFormId, i18n, currentLang, { excludeId: fromFormId })}</select>
        </label>
      </div>
      <section class="cw-panel cw-panel-params">
        <h3 class="cw-panel-title">${escapeHtml(t.cwParamInputTitle)}</h3>
        <div class="cw-param-grid" id="cwParamGrid">${renderParamInputs(fromFormId, params, { noParams: t.cwNoParams })}</div>
      </section>
      <section class="cw-panel cw-panel-steps">
        <h3 class="cw-panel-title">${escapeHtml(t.cwLiveStepsTitle)}</h3>
        <div class="cw-steps-body" id="cwStepsBody">${renderLiveSteps(output, labels)}</div>
      </section>
    </div>
  `;

  const fromSelect = mount.querySelector("#cwFromSelect");
  const toSelect = mount.querySelector("#cwToSelect");

  fromSelect.addEventListener("change", () => {
    const nextFrom = fromSelect.value;
    const nextParams = getDefaultParamsForForm(nextFrom);
    let nextTo = toSelect.value;
    if (nextTo === nextFrom) {
      const valid = ensureValidTransformationState(
        { fromFormId: nextFrom, toFormId: nextTo },
        matrix,
        rules
      );
      nextTo = valid.toFormId;
    }
    onStateChange({ fromFormId: nextFrom, toFormId: nextTo, params: nextParams });
  });

  toSelect.addEventListener("change", () => {
    onStateChange({ fromFormId: fromSelect.value, toFormId: toSelect.value, params: readParamsFromDom(fromFormId) });
  });

  mount.querySelectorAll(".cw-param-input").forEach((input) => {
    input.addEventListener("input", () => {
      onStateChange({
        fromFormId: fromSelect.value,
        toFormId: toSelect.value,
        params: readParamsFromDom(fromFormId)
      });
    });
  });
}

export function getDefaultConversionState(topic) {
  const pair = getDefaultTransformationPair(topic.matrix, topic.transformations.rules);
  return {
    ...pair,
    params: getDefaultParamsForForm(pair.fromFormId)
  };
}
