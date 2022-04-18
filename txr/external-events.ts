const port = 8080;
const server = Deno.listen({ port });
console.log(
  `Listening for external events at: http://localhost:${port}/events`,
);

function processExternalEvent(
  body: { data: string; type: string },
  headers: Record<string, string>,
) {
  switch (body.type) {
    case "exe.events.v1": {
      console.log("Received ping event:", JSON.parse(atob(body.data)));
      break;
    }
    case "txr.transactions.v1": {
      console.log("Received transaction");
      break;
    }
    case "txr.sequencegaps.v1": {
      const data = JSON.parse(atob(body.data));
      console.log("Received sequence gap:", { data, body, headers });
      break;
    }
  }
}

for await (const conn of server) {
  for await (const req of Deno.serveHttp(conn)) {
    const method = req.request.method;
    const path = new URL(req.request.url).pathname;

    console.log(method, path);

    if (method === "POST" && path === "/events") {
      try {
        const headers = Object.fromEntries(req.request.headers.entries());
        const body = await req.request.json();

        processExternalEvent(body, headers);
      } catch (_ignored) {
        console.error(`Received invalid event.`);
      }
    }

    req.respondWith(new Response("OK", { status: 200 }));
  }
}
