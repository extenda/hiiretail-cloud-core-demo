import * as jwt from 'jsonwebtoken'

export function verifyJwt(token: string): Record<string, unknown> {
  return jwt.decode(token) as Record<string, unknown>;
}