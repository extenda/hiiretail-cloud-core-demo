# Keysets

`en-US` `default`-layer files for the two consumer apps this demo ships, one directory per
module — the same `<path>/<module-id>/en-US.json` layout the `extenda/actions/translations`
GitHub Action reads (see its `load-translations.js`: `path.join(dir, 'en-US.json')`), so these
files are literally what the service repo's own `translations/demo-landing/en-US.json` and
`translations/demo-service/en-US.json` contain — copy one over the other to keep them in sync:

- [`demo-landing/en-US.json`](demo-landing/en-US.json) — module `demo-landing`
- [`demo-service/en-US.json`](demo-service/en-US.json) — module `demo-service`

Each is a **flat** map of translation keys — `{ key: { value, description, parameters?,
plural? } }`, no top-level `entries` wrapper — because that's what the action's
`loadTranslations()` expects on disk; it wraps the map into a `PublishTranslationFileDto`
(`{ entries }`) itself before it `PUT`s `/modules/{moduleId}/translations/en-US/layers/default`.
(A file already wrapped in `entries` is also accepted and unwrapped, but these are kept flat to
match the action's own files exactly.)

Kept intentionally small (7-8 keys each) for a demo, and each includes one plural key
(`landing.visits.count`, `service.jobs.count`) to exercise the structured-plural path end to
end. Every entry's declared `parameters` match the placeholders actually used in its `value`
and plural `forms`, and both plural keys carry the `one`/`other` forms `en-US` requires —
hand-checked against the same CLDR categories `src/lib/translations.ts`'s
`requiredPluralCategories("en-US")` resolves. The management app has no `default`-layer
authoring UI (that layer is pipeline-only, so it never offered one), which is exactly why
these files exist as plain JSON here rather than being built through a screen.

## Why these aren't published from this repo

The `default` layer is published by a module's own CI/CD pipeline — in the real setup, the
service repo's `.github/workflows/translations-demo.yml`, which runs `extenda/actions/translations@v0`
against its own `translations/demo-landing/` and `translations/demo-service/` directories,
authenticating with a Google service-account key/WIF against an allowed-consumers list. It is
not reachable with a pasted user or client JWT, however many permissions that token holds.
That's also why the management app's Translate panel only ever offers `managed` and `tenant`
(see `layerForSlot`/`slotForLayer` in [`../src/auth/slots.ts`](../src/auth/slots.ts)) — a PM
and a tenant admin are the only writers it supports. These files are a copy of the artifact that pipeline
identity actually publishes; if you ever need to seed them by hand instead (e.g. no access to
the service repo's CI), wrap the flat file into the request body the action itself builds:

```bash
jq -n --slurpfile entries keysets/demo-landing/en-US.json '{entries: $entries[0]}' \
  | curl -X PUT "https://translation.retailsvc.dev/api/v1/modules/demo-landing/translations/en-US/layers/default" \
      -H "Authorization: Bearer $PIPELINE_TOKEN" \
      -H "Content-Type: application/json" \
      --data-binary @-
```

(swap `demo-landing` for `demo-service`, and the host for whichever environment your two
consumer apps' `vite.config.ts` proxies point at). In practice, just push a change to the
service repo's `translations/<module>/en-US.json` and let its own workflow publish it.

## `uk-UA` (Ukrainian)

- [`demo-landing/uk-UA.managed.json`](demo-landing/uk-UA.managed.json)
- [`demo-service/uk-UA.managed.json`](demo-service/uk-UA.managed.json)

These are `managed`-layer files, not `default`, but kept in the same **flat**, unwrapped shape
as the `en-US.json` files next to them — `{ key: { value, plural?: { forms } } }`, no top-level
`entries` — so one JSON format works everywhere in `keysets/`, not just for the CI action. Same
key set as the `en-US` files, same placeholders, but `value`-and-`plural.forms` only:
`description` and `parameters` stay owned by `default`, and `plural.parameter` is omitted since
the service copies it from `default` at publish time (see
`TranslationEntryDto`/`TranslationPluralDto` in `../openapi.json`). Both plural keys carry all
four forms `Intl.PluralRules("uk-UA")` requires — `one`, `few`, `many`, `other` — since
Ukrainian's CLDR plural rules are richer than English's `one`/`other`. The `.managed` in the
filename just marks the layer at a glance; nothing in the format itself says so.

Unlike `default`, `managed` **is** reachable from a browser with the Extenda-tenant token, so
there are three ways to get these in:

- **Upload through the app** — open Translations, pick the module, add `uk-UA` as the language
  tag, then in the Translate panel click **Upload JSON…** and pick one of these files directly:
  `parseUploadedTranslations` (`src/lib/translations.ts`) reads this same flat shape (also
  tolerates a plain `{ key: "value" }` map, or a file still wrapped in `entries`), fills in
  every row it recognizes, and reports how many keys matched — review the filled form, then
  **Save** to publish. This is the fast path for a translator who already has a batch of
  strings as JSON instead of typing each one into the table.
- **Type into the app by hand** — same screen, one field at a time (what a PM would actually
  do without a prepared file).
- **Bulk-seed via curl**, wrapping the flat file into the `PublishTranslationFileDto` body the
  endpoint expects, the same way the `default` example above does, hitting `managed` with a
  pasted user/client JWT instead of a pipeline token:

```bash
jq -n --slurpfile entries keysets/demo-landing/uk-UA.managed.json '{entries: $entries[0]}' \
  | curl -X PUT "https://translation.retailsvc.dev/api/v1/modules/demo-landing/translations/uk-UA/layers/managed" \
      -H "Authorization: Bearer $EXTENDA_TOKEN" \
      -H "Content-Type: application/json" \
      --data-binary @-
```

(swap `demo-landing` for `demo-service` and its matching `uk-UA.managed.json`, and the host as
above).
