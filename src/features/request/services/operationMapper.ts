import type { RemoteRequestItemDto } from '@/src/features/request/api/contracts';

export function mapOperationsToDomain(item: { operations: RemoteRequestItemDto['operations']; descriptionRequirement?: number }) {
  const ops = item.operations ?? [];
  if (ops.length === 0) {
    const req = item.descriptionRequirement ?? 0;
    return [
      { operationName: 'Onay', statusCode: 1, requiresDescription: req, backgroundColor: '#D6F2D1', textColor: '#51D23C', displayOrder: 0 },
      { operationName: 'Red', statusCode: 2, requiresDescription: req, backgroundColor: '#FDEBEB', textColor: '#FF4848', displayOrder: 1 },
    ];
  }
  const seen = new Set<string>();
  return ops
    .filter((op) => {
      const key = `${op.statusCode}-${op.operationName}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const aOrder = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
      return aOrder !== bOrder ? aOrder - bOrder : a.statusCode - b.statusCode;
    })
    .map((op) => ({
      operationName: op.operationName,
      statusCode: op.statusCode,
      requiresDescription: op.descriptionRequirement,
      backgroundColor: op.backgroundColor,
      textColor: op.textColor,
      displayOrder: op.displayOrder,
    }));
}
