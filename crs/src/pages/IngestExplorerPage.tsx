import {
  EndpointCard,
  type EndpointSpec,
} from "../components/ingest/EndpointCard";
import {
  upsertCustomerByExternalId,
  patchCustomerByExternalId,
  deleteCustomerByExternalId,
  upsertAgentByExternalId,
  patchAgentByExternalId,
  deleteAgentByExternalId,
  upsertProjectByExternalId,
  patchProjectByExternalId,
  deleteProjectByExternalId,
} from "../api/ingest";
import {
  upsertCustomerSample,
  patchCustomerSample,
  deleteCustomerSample,
  upsertAgentSample,
  patchAgentSample,
  deleteAgentSample,
  upsertProjectSample,
  patchProjectSample,
  deleteProjectSample,
} from "../api/ingest-samples";

const PUBLIC_BASE_URL = "https://crs-api.retailsvc.com/api/v1";

type SdkResult = {
  data?: unknown;
  error?: unknown;
  response?: Response;
};

const wrap =
  <B,>(fn: (args: { body: B }) => Promise<SdkResult>) =>
  async (body: unknown) => {
    const res = await fn({ body: body as B });
    return {
      status: res.response?.status ?? 0,
      data: res.data,
      error: res.error,
    };
  };

const customerEndpoints: EndpointSpec[] = [
  {
    id: "upsert-customer",
    method: "PUT",
    path: "/external-ingest/customers",
    summary: "Upsert customer by external id",
    description:
      "Idempotent upsert keyed on externalCustomerId. Use this from your master-data system to push the latest snapshot of a customer; the service inserts or merges based on the external id.",
    permission: "crs.customer.write",
    successStatus: "201 Created",
    fields: [
      { name: "externalCustomerId", type: "string", required: true, description: "Stable id used by your system to identify the customer." },
      { name: "name", type: "string", required: false, description: "Customer account name." },
      { name: "phone", type: "string", required: false },
      { name: "address", type: "string", required: false },
      { name: "businessUnitGroup", type: "string", required: false, description: "Business-unit scope key." },
      { name: "discountPercent", type: "number", required: false },
      { name: "requireRequisition", type: "boolean", required: false },
      { name: "requireIdentification", type: "boolean", required: false },
      { name: "requireProject", type: "boolean", required: false },
      { name: "promotions", type: "object[]", required: false },
      { name: "licenses", type: "string[]", required: false },
      { name: "creditLimit", type: "CreditLimitDto", required: true, description: "{ total, available, versionTimestamp }" },
      { name: "status", type: "'Active' | 'IsCreditBlocked' | 'Inactive'", required: false },
      { name: "additionalInputs", type: "AdditionalInputDto[]", required: false },
    ],
    buildSample: upsertCustomerSample,
    send: wrap(upsertCustomerByExternalId),
  },
  {
    id: "patch-customer",
    method: "PATCH",
    path: "/external-ingest/customers",
    summary: "Partial update customer by external id",
    description:
      "Apply a sparse update to an existing customer identified by externalCustomerId. Only the fields you send are changed.",
    permission: "crs.customer.write",
    successStatus: "201 Created",
    fields: [
      { name: "externalCustomerId", type: "string", required: true },
      { name: "name", type: "string", required: false },
      { name: "phone", type: "string", required: false },
      { name: "address", type: "string", required: false },
      { name: "businessUnitGroup", type: "string", required: false },
      { name: "discountPercent", type: "number", required: false },
      { name: "requireRequisition", type: "boolean", required: false },
      { name: "requireIdentification", type: "boolean", required: false },
      { name: "requireProject", type: "boolean", required: false },
      { name: "creditLimit", type: "CreditLimitDto", required: false },
      { name: "status", type: "CustomerStatus", required: false },
    ],
    buildSample: patchCustomerSample,
    send: wrap(patchCustomerByExternalId),
  },
  {
    id: "delete-customer",
    method: "DELETE",
    path: "/external-ingest/customers",
    summary: "Delete customer by external id",
    description:
      "Soft-delete a customer keyed on externalCustomerId. Provide businessUnitGroup if your system uses it for disambiguation.",
    permission: "crs.customer.write",
    successStatus: "204 No Content",
    fields: [
      { name: "externalCustomerId", type: "string", required: true },
      { name: "businessUnitGroup", type: "string", required: false },
    ],
    buildSample: deleteCustomerSample,
    send: wrap(deleteCustomerByExternalId),
  },
];

const agentEndpoints: EndpointSpec[] = [
  {
    id: "upsert-agent",
    method: "PUT",
    path: "/external-ingest/agents",
    summary: "Upsert trusted agent by external id",
    description:
      "Insert or update a trusted agent linked to a customer via externalCustomerId.",
    permission: "crs.agent.write",
    successStatus: "Accepted",
    fields: [
      { name: "externalAgentId", type: "string", required: true },
      { name: "externalCustomerId", type: "string", required: true },
      { name: "name", type: "string", required: true },
      { name: "businessUnitGroup", type: "string", required: false },
    ],
    buildSample: upsertAgentSample,
    send: wrap(upsertAgentByExternalId),
  },
  {
    id: "patch-agent",
    method: "PATCH",
    path: "/external-ingest/agents",
    summary: "Partial update trusted agent by external id",
    description:
      "Sparse update of a trusted agent. externalAgentId and externalCustomerId are required to identify the target.",
    permission: "crs.agent.write",
    successStatus: "Accepted",
    fields: [
      { name: "externalAgentId", type: "string", required: true },
      { name: "externalCustomerId", type: "string", required: true },
      { name: "name", type: "string", required: false },
      { name: "businessUnitGroup", type: "string", required: false },
    ],
    buildSample: patchAgentSample,
    send: wrap(patchAgentByExternalId),
  },
  {
    id: "delete-agent",
    method: "DELETE",
    path: "/external-ingest/agents",
    summary: "Delete trusted agent by external id",
    description:
      "Remove a trusted agent. externalCustomerId and businessUnitGroup are optional disambiguators.",
    permission: "crs.agent.write",
    successStatus: "Accepted",
    fields: [
      { name: "externalAgentId", type: "string", required: true },
      { name: "externalCustomerId", type: "string", required: false },
      { name: "businessUnitGroup", type: "string", required: false },
    ],
    buildSample: deleteAgentSample,
    send: wrap(deleteAgentByExternalId),
  },
];

const projectEndpoints: EndpointSpec[] = [
  {
    id: "upsert-project",
    method: "PUT",
    path: "/external-ingest/projects",
    summary: "Upsert project by external id",
    description:
      "Idempotent upsert of a project keyed on externalProjectId. Linked to a customer via externalCustomerId.",
    permission: "crs.project.write",
    successStatus: "200 OK / 201 Created",
    fields: [
      { name: "externalProjectId", type: "string", required: true },
      { name: "externalCustomerId", type: "string", required: true },
      { name: "externalReferenceId", type: "string", required: true },
      { name: "addressLine1", type: "string", required: true },
      { name: "name", type: "string", required: false },
      { name: "addressLine2", type: "string", required: false },
      { name: "zipCode", type: "string", required: false },
      { name: "city", type: "string", required: false },
      { name: "businessUnitGroup", type: "string", required: false },
      { name: "fromDate", type: "string (date)", required: false },
      { name: "toDate", type: "string (date)", required: false },
      { name: "restrictions", type: "object[]", required: false },
    ],
    buildSample: upsertProjectSample,
    send: wrap(upsertProjectByExternalId),
  },
  {
    id: "patch-project",
    method: "PATCH",
    path: "/external-ingest/projects",
    summary: "Partial update project by external id",
    description:
      "Sparse update of a project keyed on externalProjectId. externalCustomerId is required for resolution.",
    permission: "crs.project.write",
    successStatus: "201 Created",
    fields: [
      { name: "externalProjectId", type: "string", required: true },
      { name: "externalCustomerId", type: "string", required: true },
      { name: "externalReferenceId", type: "string", required: false },
      { name: "name", type: "string", required: false },
      { name: "addressLine1", type: "string", required: false },
      { name: "addressLine2", type: "string", required: false },
      { name: "zipCode", type: "string", required: false },
      { name: "city", type: "string", required: false },
      { name: "businessUnitGroup", type: "string", required: false },
      { name: "fromDate", type: "string (date)", required: false },
      { name: "toDate", type: "string (date)", required: false },
      { name: "restrictions", type: "object[]", required: false },
    ],
    buildSample: patchProjectSample,
    send: wrap(patchProjectByExternalId),
  },
  {
    id: "delete-project",
    method: "DELETE",
    path: "/external-ingest/projects",
    summary: "Delete project by external id",
    description:
      "Soft-delete a project keyed on externalProjectId. businessUnitGroup is an optional disambiguator.",
    permission: "crs.project.write",
    successStatus: "204 No Content",
    fields: [
      { name: "externalProjectId", type: "string", required: true },
      { name: "businessUnitGroup", type: "string", required: false },
    ],
    buildSample: deleteProjectSample,
    send: wrap(deleteProjectByExternalId),
  },
];

const SECTIONS = [
  {
    id: "customer",
    title: "Customer",
    description:
      "Push customer master data into CRS. Each call is keyed on your externalCustomerId so you can re-emit safely.",
    endpoints: customerEndpoints,
  },
  {
    id: "agent",
    title: "Trusted Agent",
    description:
      "Manage the trusted agents that may act on behalf of a customer.",
    endpoints: agentEndpoints,
  },
  {
    id: "project",
    title: "Project",
    description:
      "Manage projects associated with a customer (sites, contracts, jobs).",
    endpoints: projectEndpoints,
  },
];

export function IngestExplorerPage() {
  return (
    <div className="space-y-8">
      <Hero />

      {SECTIONS.map((section) => (
        <section key={section.id} className="space-y-3">
          <div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                {section.title}
              </h2>
              <span className="text-xs text-slate-500">
                {section.endpoints.length} endpoints
              </span>
            </div>
            <p className="text-sm text-slate-600">{section.description}</p>
          </div>
          <div className="space-y-2">
            {section.endpoints.map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>
      ))}

      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wider">
            Developer Reference
          </span>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
            External Ingest API
          </h1>
          <p className="text-sm leading-relaxed text-indigo-100">
            Push customers, trusted agents and projects into CRS from your
            master-data system. Every endpoint is keyed on stable{" "}
            <code className="rounded bg-white/15 px-1 py-0.5 font-mono text-xs">
              external*Id
            </code>{" "}
            values so you can replay calls idempotently. Try requests live,
            then copy the curl/fetch snippet to bootstrap your integration.
          </p>
        </div>
        <div className="space-y-2 text-xs">
          <div>
            <div className="text-indigo-200 uppercase tracking-wider text-[10px] font-semibold">
              Base URL
            </div>
            <code className="block rounded-md bg-black/25 px-3 py-1.5 font-mono text-[11px] text-white">
              {PUBLIC_BASE_URL}
            </code>
          </div>
          <div>
            <div className="text-indigo-200 uppercase tracking-wider text-[10px] font-semibold">
              Auth
            </div>
            <code className="block rounded-md bg-black/25 px-3 py-1.5 font-mono text-[11px] text-white">
              Authorization: Bearer &lt;OCMS token&gt;
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-500 shadow-sm">
      <p>
        Live executions in this explorer go through the dev proxy and use the
        OCMS bearer token negotiated when you logged in. The curl / fetch
        snippets reference the public base URL{" "}
        <code className="font-mono text-slate-700">{PUBLIC_BASE_URL}</code> so
        they are copy-paste ready for use outside the demo &mdash; substitute{" "}
        <code className="font-mono text-slate-700">$BEARER_TOKEN</code> with a
        token from your auth provider.
      </p>
    </div>
  );
}
