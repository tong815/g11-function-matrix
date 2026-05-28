export function renderIntuition({ mountId, topic, i18n, currentLang }) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  const intuition = topic?.intuition;
  if (!intuition) {
    mount.innerHTML = "";
    return;
  }

  const t = i18n[currentLang];
  const topicTitle = intuition.titleKey ? t[intuition.titleKey] : "";
  const oneLine = t[intuition.oneLineKey] || "";
  const bullets = (intuition.bullets || []).map((key) => `<li>${t[key]}</li>`).join("");
  const contrast = intuition.contrastKey ? `<p class="intuition-contrast">${t[intuition.contrastKey]}</p>` : "";

  mount.innerHTML = `
    ${topicTitle ? `<div class="intuition-topic-title">${topicTitle}</div>` : ""}
    <p class="intuition-oneline">${oneLine}</p>
    <ul class="intuition-bullets">${bullets}</ul>
    ${contrast}
  `;
}
