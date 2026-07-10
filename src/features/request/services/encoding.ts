export function encodeAsciiToBase64(value: string) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  for (let i = 0; i < value.length; i += 3) {
    const b1 = value.charCodeAt(i);
    const has2 = i + 1 < value.length;
    const has3 = i + 2 < value.length;
    const b2 = has2 ? value.charCodeAt(i + 1) : 0;
    const b3 = has3 ? value.charCodeAt(i + 2) : 0;
    const chunk = (b1 << 16) | (b2 << 8) | b3;
    output += chars[(chunk >> 18) & 63];
    output += chars[(chunk >> 12) & 63];
    output += has2 ? chars[(chunk >> 6) & 63] : '=';
    output += has3 ? chars[chunk & 63] : '=';
  }
  return output;
}