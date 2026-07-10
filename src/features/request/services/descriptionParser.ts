export function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function parseDescriptionValue(lines: string[], labels: string[]) {
  const normalizedLabels = labels.map(normalizeSearchText);
  const matchedLine = lines.find((line) => {
    const [rawLabel] = line.split(':');
    return rawLabel ? normalizedLabels.includes(normalizeSearchText(rawLabel.trim())) : false;
  });
  if (!matchedLine) return undefined;
  const [, ...valueParts] = matchedLine.split(':');
  const value = valueParts.join(':').trim();
  return value || undefined;
}

export function getDescriptionLines(description?: string) {
  if (!description) return [];
  return description.split('\n').map((line) => line.trim()).filter(Boolean);
}