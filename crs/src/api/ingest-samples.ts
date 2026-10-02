import type {
  UpsertCustomerByExternalIdDto,
  PatchCustomerByExternalIdDto,
  DeleteCustomerByExternalIdDto,
  UpsertAgentByExternalIdDto,
  PatchAgentByExternalIdDto,
  DeleteAgentByExternalIdDto,
  UpsertProjectByExternalIdDto,
  PatchProjectByExternalIdDto,
  DeleteProjectByExternalIdDto,
} from "./ingest";

const now = () => new Date().toISOString();

export const upsertCustomerSample = (): UpsertCustomerByExternalIdDto => ({
  externalCustomerId: "EXT-CUST-001",
  name: "Acme Corp",
  phone: "+46 8 123 456",
  address: "Main Street 1, 11122 Stockholm",
  businessUnitGroup: "demo-bug",
  customerType: "CREDIT",
  orderNumber: "PO-2026-001",
  loyalty: { eligible: true, identifier: "+46701234567" },
  requireAgent: false,
  licenses: [{ type: "forklift", level: "B" }],
  creditLimit: {
    total: 10000,
    available: 10000,
    versionTimestamp: now(),
  },
  status: "Active",
  requireProject: false,
});

export const patchCustomerSample = (): PatchCustomerByExternalIdDto => ({
  externalCustomerId: "EXT-CUST-001",
  name: "Acme Corp (renamed)",
  customerType: "CASH",
  loyalty: { eligible: false },
  status: "Active",
});

export const deleteCustomerSample = (): DeleteCustomerByExternalIdDto => ({
  externalCustomerId: "EXT-CUST-001",
  businessUnitGroup: "demo-bug",
});

export const upsertAgentSample = (): UpsertAgentByExternalIdDto => ({
  externalAgentId: "EXT-AGENT-001",
  externalCustomerId: "EXT-CUST-001",
  name: "Jane Doe",
  businessUnitGroup: "demo-bug",
  phone: "+46701234567",
  email: "jane.doe@example.com",
  identityNumber: "19850101-1234",
  requireIdentification: true,
});

export const patchAgentSample = (): PatchAgentByExternalIdDto => ({
  externalAgentId: "EXT-AGENT-001",
  externalCustomerId: "EXT-CUST-001",
  name: "Jane Doe (updated)",
  businessUnitGroup: "demo-bug",
  email: "jane.doe@acme.example.com",
});

export const deleteAgentSample = (): DeleteAgentByExternalIdDto => ({
  externalAgentId: "EXT-AGENT-001",
  externalCustomerId: "EXT-CUST-001",
  businessUnitGroup: "demo-bug",
});

export const upsertProjectSample = (): UpsertProjectByExternalIdDto => ({
  externalProjectId: "EXT-PROJ-001",
  externalCustomerId: "EXT-CUST-001",
  adid: "ADID-4711",
  businessUnitGroup: "demo-bug",
  name: "Demo Project",
  addressLine1: "Site Road 12",
  addressLine2: "Building B",
  zipCode: "11122",
  city: "Stockholm",
  fromDate: "2026-01-01",
  toDate: "2026-12-31",
});

export const patchProjectSample = (): PatchProjectByExternalIdDto => ({
  externalProjectId: "EXT-PROJ-001",
  externalCustomerId: "EXT-CUST-001",
  name: "Demo Project (renamed)",
  city: "Gothenburg",
  adid: "ADID-8899",
});

export const deleteProjectSample = (): DeleteProjectByExternalIdDto => ({
  externalProjectId: "EXT-PROJ-001",
  externalCustomerId: "EXT-CUST-001",
  businessUnitGroup: "demo-bug",
});
