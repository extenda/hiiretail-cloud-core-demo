import { client } from "./generated/client.gen";
import { getValidAccessToken } from "../auth/token";

client.setConfig({
  baseUrl: "/api",
  auth: () => getValidAccessToken(),
});

export { client };
export {
  listSurveys,
  getSurvey,
  createSurvey,
  updateSurvey,
  createResponse,
  upsertAnswer,
  deleteAnswer,
  completeResponse,
  dismissResponse,
  listResponses,
  getResponse,
} from "./generated";

export type {
  SurveySummaryDto,
  SurveyListResponseDto,
  SurveyDto,
  TextQuestionDto,
  SingleSelectQuestionDto,
  MultiSelectQuestionDto,
  SlidingScaleQuestionDto,
  QuestionOptionDto,
  SurveyWriteDto,
  SurveyUpdateDto,
  SurveyStatus,
  UserType,
  Product,
  PageInfoDto,
  ListSurveysData,
  ResponseContextDto,
  CreateResponseDto,
  AnswerWriteDto,
  SurveyResponseAckDto,
  ResponseStatus,
  SurveyResponseDto,
  SurveyResponseListResponseDto,
  ListResponsesData,
} from "./generated";
