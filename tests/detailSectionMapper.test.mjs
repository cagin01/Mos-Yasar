import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildDetailSections } from '../src/features/request/services/detailSectionMapper.ts';

function createDetail(overrides = {}) {
  return {
    requestId: 'req-1',
    approver: '',
    referenceDocument: '',
    approved: false,
    operator: '',
    status: 0,
    requestDate: '',
    responseDate: '',
    requesterFullName: '',
    requesterUsername: '',
    subject: 'Genel',
    approvalRequiresDescription: false,
    descriptions: [],
    operations: [],
    attachments: [],
    descriptionRequirement: 0,
    subSubject: null,
    operationDescription: '',
    multipleApprove: false,
    ...overrides,
  };
}

describe('detailSectionMapper', () => {
  it('builds titled sections with pair and text lines', () => {
    const sections = buildDetailSections(createDetail({
      descriptions: [
        { type: 1, data: 'Açıklama metni', color: '', typography: '', descriptionId: '3', line_number: 3 },
        { type: 0, data: 'Proje', color: '', typography: '', descriptionId: '1', line_number: 1 },
        { type: 1, data: 'Proje No: 123', color: '', typography: '', descriptionId: '2', line_number: 2 },
      ],
    }));

    assert.deepEqual(sections, [
      {
        title: 'Proje',
        lines: [
          { kind: 'pair', label: 'Proje No', value: '123' },
          { kind: 'text', value: 'Açıklama metni' },
        ],
      },
    ]);
  });

  it('appends operation description as a separate section', () => {
    const sections = buildDetailSections(createDetail({
      operationDescription: ' Onaylandı ',
    }));

    assert.deepEqual(sections, [
      {
        title: 'Ä°ÅŸlem AÃ§Ä±klamasÄ±',
        lines: [{ kind: 'text', value: 'Onaylandı' }],
      },
    ]);
  });
});
