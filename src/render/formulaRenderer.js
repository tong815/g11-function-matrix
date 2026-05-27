export function renderCards({ mountId, i18n, currentLang, formulaCards }) {
  const mount = document.getElementById(mountId);
  const t = i18n[currentLang];
  const groups = [
    { id: "quadratic", title: t.formulaGroupQuadratic },
    { id: "linear", title: t.formulaGroupLinear },
    { id: "trig", title: t.formulaGroupTrig }
  ];
  mount.innerHTML = groups.map(group => {
    const items = formulaCards.filter(card => card.group === group.id);
    return `
      <div class="formula-group-card">
        <h3>${group.title}</h3>
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
  }).join("");
}
