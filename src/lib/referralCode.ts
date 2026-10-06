// referralCode.ts
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // 31 chars, no look-alikes

export function generateReferralCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let out = '';
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `SEALIFY-${out}`;
}
