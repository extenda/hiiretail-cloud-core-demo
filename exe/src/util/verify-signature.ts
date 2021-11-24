import crypto from 'crypto';

export function verifySignature(signature: string, data: string, key: string) {
  const signed = crypto
    .createHmac('sha256', key)
    .update(data)
    .digest('hex');
  return signed === signature;
}