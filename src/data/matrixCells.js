/**
 * Matrix cell helpers — supports sparse cells and optional { readability } metadata.
 * readability: "direct" | "derivable" | "weak" | "not-natural"
 */

export function getMatrixCell(matrix, infoKey, formId) {
  const row = matrix?.cells?.[infoKey];
  if (!row) return null;
  if (!Object.prototype.hasOwnProperty.call(row, formId)) return null;
  const entry = row[formId];
  if (entry === null || entry === undefined) return null;
  return entry;
}

export function normalizeReadability(entry) {
  if (entry === null || entry === undefined) return null;
  if (typeof entry === "string") return entry;
  if (typeof entry === "object" && entry.readability) return entry.readability;
  return null;
}

export function getMatrixCellReadability(matrix, infoKey, formId) {
  return normalizeReadability(getMatrixCell(matrix, infoKey, formId));
}

export function isMatrixCellPresent(matrix, infoKey, formId) {
  const readability = getMatrixCellReadability(matrix, infoKey, formId);
  if (!readability) return false;
  if (readability === "not-natural") return false;
  return true;
}

/** Level string used by LevelClass / status pills (only direct | derivable | weak). */
export function getMatrixCellLevel(matrix, infoKey, formId) {
  const readability = getMatrixCellReadability(matrix, infoKey, formId);
  if (readability === "direct" || readability === "derivable" || readability === "weak") {
    return readability;
  }
  return null;
}
