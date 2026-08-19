import {
  publishLayerFile,
  type PublishableLayer,
  type PublishTranslationFileDto,
} from "./client";

export interface PublishOutcome {
  status: number;
  messages: string[];
}

export interface PublishRequest {
  moduleId: string;
  langTag: string;
  layer: PublishableLayer;
  body: PublishTranslationFileDto;
  token: string;
}

function messagesFrom(error: unknown): string[] {
  if (typeof error === "string") return [error];
  const message = (error as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.map(String);
  if (typeof message === "string") return [message];

  return [];
}

export async function publishLayer({
  moduleId,
  langTag,
  layer,
  body,
  token,
}: PublishRequest): Promise<PublishOutcome> {
  const result = await publishLayerFile({
    path: { moduleId, langTag, layer },
    body,
    headers: { Authorization: `Bearer ${token}` },
  });

  return {
    status: result.response.status,
    messages: result.error ? messagesFrom(result.error) : [],
  };
}
