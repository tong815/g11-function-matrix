export function renderCards({ mountId, i18n, currentLang, formulas, title }) {
  const mount = document.getElementById(mountId);
  const items = formulas || [];
  mount.innerHTML = `
    <div class="formula-group-card">
      <h3>${title}</h3>
      <div class="formula-group-list">
        ${items.map(card => `
          <div class="formula-row">
            <b>${currentLang === "zh" ? card.titleZH : card.titleEN}</b>
            ${card.expr}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}
