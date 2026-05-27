/** @typedef {"sameGeometry" | "discriminant"} OptionalPanelId */

/** @type {Record<OptionalPanelId, { selector: string }>} */
export const optionalPanelRegistry = {
  sameGeometry: { selector: ".block-same-geo" },
  discriminant: { selector: ".block-disc" }
};

export function applyOptionalPanels(topic) {
  const enabled = new Set(topic.optionalPanels || []);
  for (const [panelId, config] of Object.entries(optionalPanelRegistry)) {
    const el = document.querySelector(config.selector);
    if (el) el.style.display = enabled.has(panelId) ? "block" : "none";
  }
}

export function topicHasOptionalPanel(topic, panelId) {
  return (topic.optionalPanels || []).includes(panelId);
}
