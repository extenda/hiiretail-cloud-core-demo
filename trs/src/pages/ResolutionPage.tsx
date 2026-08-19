import type { ReactNode } from "react";
import { Panel } from "../components/Panel";
import { StatusPill } from "../components/StatusPill";

const Mono = ({ children }: { children: ReactNode }) => (
  <span className="font-mono text-xs">{children}</span>
);

const LAYERS = [
  {
    layer: "default",
    writer: "the module's own repo, through its CI pipeline",
    carries: "value, description and parameters — it declares which keys exist",
    tags: "en-US only",
  },
  {
    layer: "managed",
    writer: "Extenda, with an Extenda-tenant token",
    carries: "the translated value alone",
    tags: "any language tag",
  },
  {
    layer: "tenant",
    writer: "the tenant itself, with its own token",
    carries: "the translated value alone",
    tags: "any language tag, en-US included",
  },
];

const STEPS = [
  <>
    A read names a module, a language tag and — on the tenant route — a tenant.
    The service takes the <Mono>default</Mono> and <Mono>managed</Mono> files
    published for <em>that exact tag</em>, plus the tenant's own file on the
    tenant route. It never reaches for another tag.
  </>,
  <>
    Whatever was never published drops out. If none of the three exists the read
    is a <StatusPill status={404} />.
  </>,
  <>
    The merge is field level, in layer order: the later layer's{" "}
    <Mono>value</Mono> wins, while <Mono>description</Mono> and{" "}
    <Mono>parameters</Mono> stay as the layer that declared them wrote them. A
    translation restates the copy, never the contract.
  </>,
  <>
    The response is labelled <Mono>layer: "resolved"</Mono> and never says which
    layer a value came from — compare two reads if you need to see that.
  </>,
];

const CONSEQUENCES = [
  <>
    Because <Mono>default</Mono> exists only for <Mono>en-US</Mono>, an{" "}
    <Mono>en-US</Mono> read carries the descriptions and parameters, and a read
    of any other tag carries values alone.
  </>,
  <>
    An untranslated key is <strong>absent</strong>, never null, and there is no
    server-side fallback. A client fetches its target tag and{" "}
    <Mono>en-US</Mono>, then falls back key by key.
  </>,
  <>
    A publish replaces the whole file. A key left out of the body is deleted from
    that layer.
  </>,
];

const EDGE_CASES: { status: number; rule: ReactNode }[] = [
  {
    status: 404,
    rule: (
      <>
        Nothing published for that module and tag. Cached briefly —{" "}
        <Mono>public, max-age=30</Mono> — so a first publish still shows up
        quickly.
      </>
    ),
  },
  {
    status: 404,
    rule: (
      <>
        <Mono>{"GET /modules/{moduleId}/language-tags"}</Mono> for a module with
        nothing published. The list is never an empty array. It also never lists
        a tenant's own languages — the endpoint is anonymous.
      </>
    ),
  },
  {
    status: 200,
    rule: (
      <>
        A tenant read where that tenant published nothing returns the base file
        rather than a 404 — the tenant object simply drops out of the merge.
      </>
    ),
  },
  {
    status: 422,
    rule: (
      <>
        A publish naming a key the module's <Mono>default/en-US</Mono> file never
        declared, a <Mono>managed</Mono> or <Mono>tenant</Mono> file carrying{" "}
        <Mono>description</Mono> or <Mono>parameters</Mono>, or a value using a{" "}
        <Mono>{"{placeholder}"}</Mono> the key never declared.
      </>
    ),
  },
  {
    status: 400,
    rule: (
      <>
        A <Mono>default</Mono> publish for a tag other than <Mono>en-US</Mono>,
        or a <Mono>tenant</Mono> publish whose token carries no tenant id.
      </>
    ),
  },
  {
    status: 304,
    rule: (
      <>
        A revalidation that hits. It is answered from object metadata alone, so
        no layer is downloaded.
      </>
    ),
  },
];

const CACHING = [
  <>
    The <Mono>ETag</Mono> is built from the versions of the files behind the
    response, so it changes on every publish — even a republish of identical
    bytes.
  </>,
  <>
    <Mono>Last-Modified</Mono> is the newest of those files, at second
    resolution.
  </>,
  <>
    <Mono>Cache-Control: public, max-age=300, stale-while-revalidate=86400</Mono>{" "}
    — the reads are anonymous and safe to cache at the edge.
  </>,
  <>
    <Mono>If-None-Match</Mono> takes precedence over{" "}
    <Mono>If-Modified-Since</Mono>, per RFC 9110. Keep the ETag; it is the
    stronger validator.
  </>,
];

const HEAD =
  "px-4 py-2 text-left text-[10px] font-semibold tracking-wider text-stone-500 uppercase";

function Rules({ items }: { items: ReactNode[] }) {
  return (
    <ol className="list-inside list-decimal space-y-2 px-4 py-3 text-sm text-stone-700">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  );
}

export function ResolutionPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-normal text-stone-900">How it resolves</h1>
        <p className="mt-1 text-sm text-stone-500">
          Three layers, one merged response, and the handful of rules a consumer
          has to know.
        </p>
      </div>

      <Panel title="The layers" subtitle="default → managed → tenant">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className={HEAD}>Layer</th>
              <th className={HEAD}>Who writes it</th>
              <th className={HEAD}>What it carries</th>
              <th className={HEAD}>Language tags</th>
            </tr>
          </thead>
          <tbody>
            {LAYERS.map((row) => (
              <tr key={row.layer} className="border-b border-stone-50 align-top">
                <td className="px-4 py-2 font-mono text-xs text-stone-700">
                  {row.layer}
                </td>
                <td className="px-4 py-2 text-sm text-stone-700">{row.writer}</td>
                <td className="px-4 py-2 text-sm text-stone-700">
                  {row.carries}
                </td>
                <td className="px-4 py-2 text-sm text-stone-700">{row.tags}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="What a read does">
        <Rules items={STEPS} />
      </Panel>

      <Panel title="What that means for a consumer">
        <Rules items={CONSEQUENCES} />
      </Panel>

      <Panel title="Edge cases worth knowing">
        <ul className="divide-y divide-stone-50">
          {EDGE_CASES.map(({ status, rule }, index) => (
            <li key={index} className="flex items-start gap-3 px-4 py-2.5">
              <span className="shrink-0 pt-0.5">
                <StatusPill status={status} />
              </span>
              <span className="text-sm text-stone-700">{rule}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Caching and revalidation">
        <Rules items={CACHING} />
      </Panel>
    </div>
  );
}
