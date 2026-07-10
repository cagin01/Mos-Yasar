import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createPreviewHtml,
  getAttachmentMimeType,
  supportsInlinePreview,
} from '../src/features/request/services/attachmentPreviewService.ts';

describe('attachmentPreviewService', () => {
  it('detects common attachment mime types', () => {
    assert.equal(getAttachmentMimeType('file.pdf'), 'application/pdf');
    assert.equal(getAttachmentMimeType('photo.JPG'), 'image/jpeg');
    assert.equal(getAttachmentMimeType('sheet.xlsx'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    assert.equal(getAttachmentMimeType('unknown.bin'), 'application/octet-stream');
  });

  it('supports inline preview only for pdf and images', () => {
    assert.equal(supportsInlinePreview('file.pdf'), true);
    assert.equal(supportsInlinePreview('photo.png'), true);
    assert.equal(supportsInlinePreview('document.docx'), false);
  });

  it('creates image and pdf preview html with data uri content', () => {
    const imageHtml = createPreviewHtml('photo.png', 'abc123');
    const pdfHtml = createPreviewHtml('file.pdf', 'def456');

    assert.match(imageHtml, /<img src="data:image\/png;base64,abc123"/);
    assert.match(pdfHtml, /<iframe src="data:application\/pdf;base64,def456"/);
  });
});
