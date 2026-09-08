import { client } from "./generated/client.gen";

client.setConfig({ baseUrl: "/api" });

export { client };
export {
  publishLayerFile,
  getModuleCoverage,
  getLanguageTagCoverage,
} from "./generated";
export type {
  BadRequestDto,
  BaseLayer,
  KeyCoverageDto,
  LanguageTagCoverageDto,
  LanguageTagKeyCoverageDto,
  LanguageTagsDto,
  ModuleCoverageDto,
  PluralCategory,
  PublishableLayer,
  PublishTranslationFileDto,
  RawTranslationFileDto,
  TranslationEntryDto,
  TranslationPluralDto,
} from "./generated";
