import { client } from "./generated/client.gen";
import { getValidAccessToken } from "../auth/token";

client.setConfig({
  baseUrl: "/api",
  auth: () => getValidAccessToken(),
});

export { client };
export {
  searchCustomers,
  getCustomerById,
  patchCustomerById,
  deleteCustomerById,
  searchAgents,
  getAgentById,
  patchAgentById,
  deleteAgentById,
  searchProjects,
  getProjectById,
  patchProjectById,
  deleteProjectById,
  upsertCustomerById,
  createCustomer,
  upsertAgent,
  upsertProjectById,
} from "./generated";

export type {
  CustomerSearchItemDto,
  CustomerSearchResponseDto,
  CustomerResponseDto,
  CustomerStatus,
  CustomerType,
  LicenseDto,
  CreditLimitDto,
  AdditionalInputDto,
  PageInfoDto,
  TrustedAgentResponseDto,
  AgentSearchResponseDto,
  ProjectSearchItemDto,
  ProjectSearchResponseDto,
  ProjectResponseDto,
  ProjectStatus,
  SearchCustomersData,
  SearchAgentsData,
  SearchProjectsData,
  UpsertCustomerDto,
  CreateCustomerRequestDto,
  CustomerCreationAcceptedDto,
  UpsertProjectDto,
  UpsertAgentByIdDto,
  PatchCustomerByIdDto,
  PatchAgentByIdDto,
  PatchProjectByIdDto,
} from "./generated";
