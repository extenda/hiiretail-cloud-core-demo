import { useState } from "react";
import type { HttpMethod } from "./MethodBadge";

const PUBLIC_BASE_URL = "https://crs-api.retailsvc.com/api/v1";

type SnippetTab = "curl" | "fetch";

export function CodeSnippet({
  method,
  path,
  body,
}: {
  method: HttpMethod;
  path: string;
  body: unknown;
}) {
  const [tab, setTab] = useState<SnippetTab>("curl");
  const [copied, setCopied] = useState(false);

  const url = `${PUBLIC_BASE_URL}${path}`;
  const bodyJson = body === undefined ? "" : JSON.stringify(body, null, 2);

  const curl = buildCurl(method, url, bodyJson);
  const fetchSnippet = buildFetch(method, url, bodyJson);
  const text = tab === "curl" ? curl : fetchSnippet;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5">
        <div className="flex gap-1">
          <TabButton active={tab === "curl"} onClick={() => setTab("curl")}>
            curl
          </TabButton>
          <TabButton active={tab === "fetch"} onClick={() => setTab("fetch")}>
            fetch
          </TabButton>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-auto bg-slate-900 p-4 text-xs leading-relaxed text-slate-100 font-mono max-h-80">
        <code>{text}</code>
      </pre>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-xs font-medium font-mono ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function buildCurl(method: HttpMethod, url: string, bodyJson: string) {
  const lines = [
    `curl -X ${method} '${url}' \\`,
    `  -H 'Authorization: Bearer $BEARER_TOKEN' \\`,
    `  -H 'Content-Type: application/json'`,
  ];
  if (bodyJson) {
    lines[lines.length - 1] += " \\";
    lines.push(`  -d '${bodyJson}'`);
  }
  return lines.join("\n");
}

function buildFetch(method: HttpMethod, url: string, bodyJson: string) {
  const init: string[] = [
    `  method: '${method}',`,
    `  headers: {`,
    `    'Authorization': \`Bearer \${BEARER_TOKEN}\`,`,
    `    'Content-Type': 'application/json',`,
    `  },`,
  ];
  if (bodyJson) {
    init.push(`  body: JSON.stringify(${bodyJson}),`);
  }
  return [
    `const response = await fetch('${url}', {`,
    ...init,
    `});`,
    ``,
    `const data = response.status === 204 ? null : await response.json();`,
    `console.log(response.status, data);`,
  ].join("\n");
}
