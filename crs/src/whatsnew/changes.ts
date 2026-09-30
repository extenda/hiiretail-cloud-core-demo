export interface Change {
  id: string
  title: string
  summary: string
  where: string
  to?: string
}

export const CHANGES: Change[] = [
  {
    id: 'unified-search',
    title: 'Unified customer search',
    summary:
      'One search box matches name or external id. Case-insensitive, min 2 chars, results ranked exact > prefix > substring.',
    where: 'Customers page, search panel',
    to: '/',
  },
  {
    id: 'customer-type',
    title: 'Customer type',
    summary: 'CASH or CREDIT account type. Independent of the credit limit; absent means unknown.',
    where: 'Customer table, detail card, form',
    to: '/',
  },
  {
    id: 'order-number',
    title: 'Order number',
    summary: 'Customer-level default that the Checkout App pre-fills.',
    where: 'Customer detail card, form',
    to: '/',
  },
  {
    id: 'loyalty',
    title: 'Loyalty',
    summary:
      'Member with identifier, not eligible (never offer loyalty), or absent (cashier is prompted to offer membership).',
    where: 'Customer table, detail card, form',
    to: '/',
  },
  {
    id: 'agent-contact',
    title: 'Agent contact details',
    summary: 'Trusted agent phone (E.164), email and identity number.',
    where: 'Customer detail page, Trusted Agents tab',
  },
  {
    id: 'project-adid',
    title: 'Project ADID',
    summary: 'ERP address id on the project. Stored, returned and searchable (substring, case-insensitive).',
    where: 'Customer detail page, Projects tab',
  },
  {
    id: 'ingest',
    title: 'External ingest',
    summary: 'All new fields accepted on the external-ingest endpoints with the same names and types.',
    where: 'Ingest API page',
    to: '/ingest',
  },
]
