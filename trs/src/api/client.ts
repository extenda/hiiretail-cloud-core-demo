import { client } from "./generated/client.gen";

client.setConfig({ baseUrl: "/api" });

export { client };
export { publishLayerFile } from "./generated";
export type {
  BadRequestDto,
  LanguageTagsDto,
  PublishableLayer,
  PublishTranslationFileDto,
  ResolvedTranslationFileDto,
  TranslationEntryDto,
} from "./generated";
