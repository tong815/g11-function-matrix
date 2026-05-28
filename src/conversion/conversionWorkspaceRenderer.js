import {
  conversionParamSchemas,
  getDefaultParamsForForm,
  parseConversionParams
} from "./conversionParamSchemas.js";
import { runConversionGenerator } from "./generators/index.js";
import { resolveTransformationRuleId } from "../data/transformationLookup.js";
import {
  ensureValidTransformationState,
  getDefaultTransformationPair,
  topicSupportsFormConversion
} from "../data/transformationLookup.js";
import { renderRepresentationCards, renderParamIdentification } from "./conversionFormDisplay.js";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderTagList(items) {
  if (!items?.length) return "";
  return `<div class="cw-tags">${items.map((x) => `<span class="cw-tag">${escapeHtml(x)}</span>`).join("")}</div>`;
}

function renderLiveSteps(output, labels, paramIdentificationHtml = "") {
  let html = paramIdentificationHtml;

  if (output.blocked && output.blockMessage) {
    html += `<div class="cw-blocked">${escapeHtml(output.blockMessage)}</div>`;
    return html;
  }
  if (!output.steps?.length && !output.result) {
    html += `<div class="cw-placeholder">${escapeHtml(labels.selectPair)}</div>`;
    return html;
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
 * Unified Conversion Workspace: form header + params + live steps.
 * Parameter steps update only on Update Conversion (or Enter), not on each keystroke.
 */
export function renderConversionWorkspace({
  mountId,
  topic,
  conversionState,
  i18n,
  currentLang,
  onStateChange,
  rootFunction = null
}) {
  const mount = document.getElementById(mountId);
  const t = i18n[currentLang];
  const matrix = topic.matrix;
  const canConvert = topicSupportsFormConversion(matrix);

  if (!canConvert) {
    mount.innerHTML = `<div class="conversion-workspace cw-workspace-inactive"><p class="cw-empty-topic">${escapeHtml(t.cwNoFormConversion)}</p></div>`;
    return;
  }

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

  const displayLabels = {
    currentRepresentation: t.cwCurrentRepresentation,
    targetRepresentation: t.cwTargetRepresentation,
    paramIdentification: t.cwParamIdentification,
    inputEquation: t.cwInputEquation
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
    selectPair: t.flowNoDirectRule,
    noParams: t.cwNoParams,
    ...displayLabels
  };

  const representationCardsHtml = renderRepresentationCards({
    matrix,
    fromFormId,
    toFormId,
    i18n,
    lang: currentLang,
    labels: displayLabels
  });

  const paramIdentificationHtml = renderParamIdentification({
    formId: fromFormId,
    params,
    labels: displayLabels,
    rootFunction: rootFunction?.functionType === topic.id ? rootFunction : null,
    currentLang,
    i18n
  });

  const hasParamSchema = (conversionParamSchemas[fromFormId] || []).length > 0;

  mount.innerHTML = `
    <div class="conversion-workspace">
      ${representationCardsHtml}
      <section class="cw-panel cw-panel-params">
        <h3 class="cw-panel-title">${escapeHtml(t.cwParamInputTitle)}</h3>
        <div class="cw-param-grid" id="cwParamGrid">${renderParamInputs(fromFormId, params, labels)}</div>
        <button type="button" id="cwUpdateBtn" class="btn-cw-update"${!ruleId || !hasParamSchema ? " disabled" : ""}>${escapeHtml(t.cwUpdateConversionBtn)}</button>
      </section>
      <section class="cw-panel cw-panel-steps">
        <h3 class="cw-panel-title">${escapeHtml(t.cwLiveStepsTitle)}</h3>
        <div class="cw-steps-body" id="cwStepsBody">${renderLiveSteps(output, labels, paramIdentificationHtml)}</div>
      </section>
    </div>
  `;

  const fromSelect = mount.querySelector("#cwFromSelect");
  const toSelect = mount.querySelector("#cwToSelect");

  fromSelect.addEventListener("change", () => {
    const nextFrom = fromSelect.value;
    let nextTo = toSelect.value;
    if (nextTo === nextFrom) {
      nextTo = ensureValidTransformationState(
        { fromFormId: nextFrom, toFormId: nextTo },
        matrix,
        rules
      ).toFormId;
    }
    onStateChange({
      fromFormId: nextFrom,
      toFormId: nextTo
    });
  });

  toSelect.addEventListener("change", () => {
    onStateChange({
      fromFormId: fromSelect.value,
      toFormId: toSelect.value
    });
  });

  const updateBtn = mount.querySelector("#cwUpdateBtn");
  const commitParams = () => {
    if (updateBtn?.disabled) return;
    onStateChange({
      fromFormId: fromSelect.value,
      toFormId: toSelect.value,
      params: readParamsFromDom(fromSelect.value)
    });
  };

  updateBtn?.addEventListener("click", commitParams);

  mount.querySelectorAll(".cw-param-input").forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitParams();
      }
    });
  });
}

export function getDefaultConversionState(topic, getParamsForForm) {
  const pair = getDefaultTransformationPair(topic.matrix, topic.transformations.rules);
  const custom = getParamsForForm?.(pair.fromFormId);
  const params =
    custom !== undefined ? custom : getDefaultParamsForForm(pair.fromFormId);
  return {
    ...pair,
    params
  };
}
