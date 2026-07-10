export function ensureUsername(username: string) {
  if (!username.trim()) {
    throw new Error('Kullanici adi bos birakilamaz.');
  }
}

export function ensurePassword(password: string) {
  if (!password.trim()) {
    throw new Error('Sifre alani bos birakilamaz.');
  }
}

export function ensureEmail(email: string) {
  if (!email.trim()) {
    throw new Error('E-posta alani bos birakilamaz.');
  }
}

export function trimEdgeSpaces(value: string) {
  return value.replace(/^\s+|\s+$/g, '');
}

export function sanitizeUsernameInput(value: string) {
  return trimEdgeSpaces(value);
}
