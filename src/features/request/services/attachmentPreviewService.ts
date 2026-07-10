export function getAttachmentMimeType(fileName: string) {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith('.pdf')) {
    return 'application/pdf';
  }

  if (lowerName.endsWith('.png')) {
    return 'image/png';
  }

  if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  if (lowerName.endsWith('.doc')) {
    return 'application/msword';
  }

  if (lowerName.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  if (lowerName.endsWith('.xls')) {
    return 'application/vnd.ms-excel';
  }

  if (lowerName.endsWith('.xlsx')) {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }

  return 'application/octet-stream';
}

export function supportsInlinePreview(fileName: string) {
  const mimeType = getAttachmentMimeType(fileName);
  return mimeType === 'application/pdf' || mimeType.startsWith('image/');
}

export function createPreviewHtml(fileName: string, base64Content: string) {
  const mimeType = getAttachmentMimeType(fileName);
  const dataUri = `data:${mimeType};base64,${base64Content}`;

  if (mimeType.startsWith('image/')) {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #111827;
      }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    </style>
  </head>
  <body>
    <img src="${dataUri}" alt="${fileName}" />
  </body>
</html>`;
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #f3f4f6;
      }
      iframe {
        width: 100%;
        height: 100%;
        border: 0;
        background: #ffffff;
      }
    </style>
  </head>
  <body>
    <iframe src="${dataUri}"></iframe>
  </body>
</html>`;
}
