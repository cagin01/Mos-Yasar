import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mapOperationsToDomain } from '../src/features/request/services/operationMapper.ts';

describe('operationMapper', () => {
  it('creates default approve/reject operations when remote operations are empty', () => {
    assert.deepEqual(mapOperationsToDomain({ operations: [], descriptionRequirement: 1 }), [
      {
        operationName: 'Onay',
        statusCode: 1,
        requiresDescription: 1,
        backgroundColor: '#D6F2D1',
        textColor: '#51D23C',
        displayOrder: 0,
      },
      {
        operationName: 'Red',
        statusCode: 2,
        requiresDescription: 1,
        backgroundColor: '#FDEBEB',
        textColor: '#FF4848',
        displayOrder: 1,
      },
    ]);
  });

  it('deduplicates and sorts remote operations by display order then status', () => {
    const operations = mapOperationsToDomain({
      operations: [
        {
          operationName: 'Red',
          statusCode: 2,
          requiresDescription: 0,
          descriptionRequirement: 1,
          color: '',
          backgroundColor: '#FDEBEB',
          textColor: '#FF4848',
          displayOrder: 2,
        },
        {
          operationName: 'Onay',
          statusCode: 1,
          requiresDescription: 0,
          descriptionRequirement: 0,
          color: '',
          backgroundColor: '#D6F2D1',
          textColor: '#51D23C',
          displayOrder: 1,
        },
        {
          operationName: 'Red',
          statusCode: 2,
          requiresDescription: 0,
          descriptionRequirement: 1,
          color: '',
          backgroundColor: '#FDEBEB',
          textColor: '#FF4848',
          displayOrder: 2,
        },
      ],
    });

    assert.deepEqual(operations, [
      {
        operationName: 'Onay',
        statusCode: 1,
        requiresDescription: 0,
        backgroundColor: '#D6F2D1',
        textColor: '#51D23C',
        displayOrder: 1,
      },
      {
        operationName: 'Red',
        statusCode: 2,
        requiresDescription: 1,
        backgroundColor: '#FDEBEB',
        textColor: '#FF4848',
        displayOrder: 2,
      },
    ]);
  });
});
