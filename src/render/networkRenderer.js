function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderTagList(items) {
  if (!items?.length) return "";
  return `<div class="flow-tags">${items.map((item) => `<span class="flow-tag">${escapeHtml(item)}</span>`).join("")}</div>`;
}

function renderLines(lines, { numbered = false, mono = false } = {}) {
  if (!lines?.length) return "";
  const cls = mono ? "flow-line mono" : "flow-line";
  return lines
    .map((line, index) => {
      const prefix = numbered ? `${index + 1}. ` : "";
      return `<span class="${cls}">${prefix}${escapeHtml(line)}</span>`;
    })
    .join("");
}

function renderLegacySections(data, suffix) {
  let html = "";
  data.sections.forEach((section) => {
    html += `<div class="flow-section"><span class="flow-heading">${escapeHtml(section.heading)}${suffix}</span>`;
    html += renderLines(section.lines, { numbered: section.numbered, mono: section.mono });
    html += "</div>";
  });
  return html;
}

function renderExamFlow(data, labels) {
  let html = `<div class="flow-route">${escapeHtml(data.route)}</div>`;

  if (data.known?.length || data.target?.length) {
    html += '<div class="flow-block flow-params">';
    if (data.known?.length) {
      html += `<div class="flow-param-row"><span class="flow-heading">${escapeHtml(labels.known)}</span>${renderTagList(data.known)}</div>`;
    }
    if (data.target?.length) {
      html += `<div class="flow-param-row"><span class="flow-heading">${escapeHtml(labels.target)}</span>${renderTagList(data.target)}</div>`;
    }
    html += "</div>";
  }

  if (data.formulas?.length) {
    html += `<div class="flow-section flow-formulas"><span class="flow-heading">${escapeHtml(labels.formulas)}</span>`;
    html += renderLines(data.formulas, { mono: true });
    html += "</div>";
  }

  if (data.algorithm?.length) {
    html += `<div class="flow-section flow-algorithm flow-algorithm-primary"><span class="flow-heading flow-heading-strong">${escapeHtml(labels.algorithm)}</span>`;
    html += `<ol class="flow-algorithm-list">${data.algorithm.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`;
    html += "</div>";
  }

  if (data.example) {
    html += `<div class="flow-section flow-example"><span class="flow-heading">${escapeHtml(labels.example)}</span>`;
    const exampleLines = [data.example.given, ...(data.example.steps || [])].filter(Boolean);
    html += `<pre class="flow-example-block">${exampleLines.map(escapeHtml).join("\n")}</pre>`;
    html += "</div>";
  }

  if (data.mistakes?.length) {
    html += `<div class="flow-section flow-mistakes"><span class="flow-heading flow-heading-warn">${escapeHtml(labels.mistakes)}</span>`;
    html += `<ul class="flow-mistakes-list">${data.mistakes.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}</ul>`;
    html += "</div>";
  }

  if (data.notes?.length) {
    html += `<div class="flow-section flow-notes"><span class="flow-heading">${escapeHtml(labels.notes)}</span>`;
    html += renderLines(data.notes);
    html += "</div>";
  }

  if (data.intuition?.lines?.length) {
    const title = data.intuition.title || labels.intuition;
    html += `<details class="flow-intuition"><summary>${escapeHtml(title)}</summary>`;
    html += renderLines(data.intuition.lines);
    html += "</details>";
  }

  return html;
}

export function renderFlowHtml({ ruleId, flowContent, currentLang, i18n }) {
  const entry = flowContent[ruleId];
  if (!entry) return "";
  const data = entry[currentLang];
  if (!data) return "";
  const t = i18n[currentLang];
  const suffix = currentLang === "zh" ? "：" : ":";

  if (data.sections) {
    let html = `<div class="flow-route">${escapeHtml(data.route)}</div>`;
    html += renderLegacySections(data, suffix);
    return html;
  }

  const labels = {
    known: t.flowKnown,
    target: t.flowTarget,
    formulas: t.flowFormulas,
    algorithm: t.flowAlgorithm,
    example: t.flowExample,
    mistakes: t.flowMistakes,
    notes: t.flowNotes,
    intuition: t.flowIntuition
  };
  return renderExamFlow(data, labels);
}

export function renderFlowUnavailable({ i18n, currentLang }) {
  return `<div class="flow-no-rule">${escapeHtml(i18n[currentLang].flowNoDirectRule)}</div>`;
}
