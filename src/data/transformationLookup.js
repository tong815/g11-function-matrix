export function findTransformationRule(rules, fromFormId, toFormId) {
  if (!fromFormId || !toFormId || fromFormId === toFormId) return null;
  return rules.find((r) => r.fromFormId === fromFormId && r.toFormId === toFormId) ?? null;
}

export function listValidToFormIds(forms, fromFormId) {
  return forms.filter((f) => f.id !== fromFormId).map((f) => f.id);
}

export function getDefaultTransformationPair(matrix, rules) {
  const forms = matrix?.forms ?? [];
  if (!forms.length) return { fromFormId: "", toFormId: "" };
  const fromFormId = forms[0].id;
  if (forms.length === 1) return { fromFormId, toFormId: fromFormId };
  const toFormId =
    forms.find((f) => f.id !== fromFormId && findTransformationRule(rules, fromFormId, f.id))?.id ??
    forms.find((f) => f.id !== fromFormId)?.id ??
    forms[1].id;
  return { fromFormId, toFormId };
}

export function ensureValidTransformationState(state, matrix, rules) {
  const forms = matrix?.forms ?? [];
  if (!forms.length) return { fromFormId: "", toFormId: "" };

  let { fromFormId, toFormId } = state;
  if (!forms.some((f) => f.id === fromFormId)) {
    return getDefaultTransformationPair(matrix, rules);
  }

  const validTo = listValidToFormIds(forms, fromFormId);
  if (!validTo.length) return { fromFormId, toFormId: fromFormId };
  if (!validTo.includes(toFormId)) {
    toFormId =
      validTo.find((id) => findTransformationRule(rules, fromFormId, id)) ?? validTo[0];
  }
  return { fromFormId, toFormId };
}

export function resolveTransformationRuleId(rules, fromFormId, toFormId) {
  return findTransformationRule(rules, fromFormId, toFormId)?.id ?? null;
}

/** Pairs with no direct rule (for docs / debugging). */
export function topicSupportsFormConversion(matrix) {
  return (matrix?.forms?.length ?? 0) >= 2;
}

export function listMissingDirectConversions(matrix, rules) {
  const forms = matrix?.forms ?? [];
  const missing = [];
  for (const from of forms) {
    for (const to of forms) {
      if (from.id === to.id) continue;
      if (!findTransformationRule(rules, from.id, to.id)) {
        missing.push({ fromFormId: from.id, toFormId: to.id });
      }
    }
  }
  return missing;
}
