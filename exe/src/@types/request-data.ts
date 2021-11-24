import { CloudEvent } from './cloud-event';

export interface RequestData {
  body: CloudEvent,
  createdAt: Date,
  id: string,
  headers: Record<string, unknown>,
  token: Record<string, unknown>,
  signatureCorrect?: boolean,
}