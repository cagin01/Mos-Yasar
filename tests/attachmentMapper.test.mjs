import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mapAttachmentsToDomain } from '../src/features/request/services/attachmentMapper.ts';

describe('attachmentMapper', () => {
  it('maps remote attachment name, id, url and request id aliases', () => {
    assert.deepEqual(
      mapAttachmentsToDomain([
        {
          attachmentId: 'att-1',
          fileName: 'dosya.pdf',
          fileUrl: 'https://example.com/dosya.pdf',
          requestid: 'req-1',
        },
      ]),
      [
        {
          id: 'att-1',
          name: 'dosya.pdf',
          url: 'https://example.com/dosya.pdf',
          requestId: 'req-1',
        },
      ],
    );
  });

  it('falls back to generated attachment names and ids', () => {
    assert.deepEqual(mapAttachmentsToDomain([{}]), [
      {
        id: 'Ek 1-0',
        name: 'Ek 1',
      },
    ]);
  });
});
