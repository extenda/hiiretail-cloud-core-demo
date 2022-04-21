import { serve } from "https://deno.land/std@0.136.0/http/server.ts";

function processExternalEvent(
  body: { data: string; type: string },
  _headers: Record<string, string>,
) {
  switch (body.type) {
    case "exe.events.v1": {
      console.log("Received ping event:", JSON.parse(atob(body.data)));
      break;
    }
    case "txr.transactions.v1":
    case "txr.transactions-staging.v1": {
      console.log("Received transaction");
      break;
    }
    case "txr.sequence-gaps.v1":
    case "txr.sequence-gaps-staging.v1": {
      const data = JSON.parse(atob(body.data));
      console.log("Received sequence gap:", data);
      break;
    }
    default: {
      console.log("received unknown event:", body.type);
      break;
    }
  }
}

const port = 8080;
console.log(
  `Listening for external events at: http://localhost:${port}/events`,
);
await serve(async (request) => {
  const method = request.method;
  const path = new URL(request.url).pathname;

  console.log(method, path);

  if (method === "POST" && path === "/events") {
    try {
      const headers = Object.fromEntries(request.headers.entries());
      const body = await request.json();

      processExternalEvent(body, headers);
    } catch (_ignored) {
      console.error(`Received invalid event.`);
    }
  }

  return new Response("OK", { status: 200 });
}, { port });
