export function renderFlowHtml({ ruleId, flowContent, currentLang }) {
  const entry = flowContent[ruleId];
  if (!entry) return "";
  const data = entry[currentLang];
  if (!data) return "";
  const suffix = currentLang === "zh" ? "：" : ":";
  let html = `<div class="flow-route">${data.route}</div>`;
  data.sections.forEach(section => {
    html += `<div class="flow-section"><span class="flow-heading">${section.heading}${suffix}</span>`;
    section.lines.forEach((line, index) => {
      const prefix = section.numbered ? `${index + 1}) ` : "";
      const monoClass = section.mono ? " mono" : "";
      html += `<span class="flow-line${monoClass}">${prefix}${line}</span>`;
    });
    html += "</div>";
  });
  return html;
}

function localizeNodeName(name, i18n, currentLang) {
  if (currentLang !== "zh") return name;
  const map = {
    Standard: i18n[currentLang].nodeStandard,
    Factored: i18n[currentLang].nodeFactored,
    Vertex: i18n[currentLang].nodeVertex,
    "Slope-Intercept": "斜截式",
    "Point-Slope": "点斜式",
    Basic: "基础式",
    Transformed: "变换式"
  };
  return map[name] || name;
}

export function renderNetwork({ mountId, i18n, currentLang, onRuleClick, transformations }) {
  const mount = document.getElementById(mountId);
  const rules = transformations?.rules || [];
  const html = `
    <div class="transform-diagram">
      ${rules.map(rule => `
        <div class="transform-path">
          <div class="node">${localizeNodeName(rule.from, i18n, currentLang)}</div>
          <button type="button" class="edge-tag" data-edge="${rule.id}">${currentLang === "zh" ? rule.labelZH : rule.labelEN} →</button>
          <div class="node">${localizeNodeName(rule.to, i18n, currentLang)}</div>
        </div>
      `).join("")}
    </div>
  `;
  mount.innerHTML = html;
  mount.querySelectorAll(".edge-tag, .edge-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      onRuleClick(btn.dataset.edge);
    });
  });
}
