import { TENANT_ID } from "../constants.ts";

export const config = {
  // time to wait before sending transactions
  msBetweenIngests: 1000,

  // if left undefined, will not be changed in transactions
  businessUnitId: "07",
  workstationId: "007",
  operatorId: "1",

  // values to start from, will be incremented from transaction to transaction
  sequenceNumber: 1,
  receiptNumber: 1,

  // default values, will be used if left undefined
  countryCode: "NO",
  tenantId: TENANT_ID,
};
