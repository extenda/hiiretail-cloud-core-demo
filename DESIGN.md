# Demo UI design guide

Visual and layout rules for the demo UIs in this repo. Goal: a demo that reads as **Hii Retail**
on a screen share, built in one pass by an AI agent, with no design-system dependency.

Procedure for building a new demo lives in [`.agents/skills/demo-ui/SKILL.md`](.agents/skills/demo-ui/SKILL.md).
This document is only the *look*.

## Scope and provenance

These demos are **local-only developer explorers**, not product surfaces. They are not reused,
not deployed, and not shipped to customers.

This repo is **public**. Every value below comes from a publicly observable source:

| Token | Value | Source |
|---|---|---|
| brand plum | `#A35D7F` | `extendaretail.com`, `developer.hiiretail.com` |
| brand ink | `#411E4F` | `extendaretail.com` |
| brand tint | `#FFDBE6` | `extendaretail.com` |
| canvas | `#F1EEEC` | `extendaretail.com` |
| typeface | Poppins | `extendaretail.com` (`font-family: Poppins, sans-serif`) |

Everything else is a Tailwind built-in or an interpolation of the values above. **Do not copy tokens,
typography scales, or component code out of internal repos or the private
`@hiiretail/react-foundation-ui` package into this repo.** Getting close is the requirement; being
exact is not.

## Stack

React 19 + Vite + **Tailwind v4** + React Query + a typed client generated from the service's
OpenAPI spec. No component library. Rationale: the real product uses MUI via a private-registry
package that a public repo cannot install, so a component library buys no extra fidelity here —
the resemblance comes from the tokens, not from MUI. Hand-built primitives also let each new demo
start by copying the previous one.

## Tokens

Tailwind v4 needs no config file. Put this at the top of `src/index.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap");
@import "tailwindcss";

@theme {
  --color-brand-50: #fdf4f7;
  --color-brand-100: #ffdbe6;
  --color-brand-200: #f2c4d5;
  --color-brand-300: #dda3bb;
  --color-brand-400: #c17f9c;
  --color-brand-500: #a35d7f;
  --color-brand-600: #8b4f6c;
  --color-brand-700: #6e3e55;
  --color-brand-800: #522e40;
  --color-brand-900: #411e4f;

  --color-canvas: #f1eeec;

  --font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif;
}
```

`--color-brand-500` is the primary action colour. `--color-brand-900` is the dark ink used for the
brand mark and any dark surface. Tailwind's `rounded-lg` is already 8px — no radius override needed.

### Neutrals: `stone`, never `slate`

Use Tailwind's **`stone`** scale for all text, borders and greys. `stone` is warm and sits correctly
next to `#F1EEEC`; `slate` is cool and makes the canvas look dirty. This is the single biggest
difference between the older demos and this guide.

### Semantic colours

Tailwind built-ins, used sparingly so they never compete with the brand:

| Meaning | Class |
|---|---|
| success / active | `emerald-600` |
| warning / pending | `amber-600` |
| error / destructive | `red-700` |
| info / neutral highlight | `sky-600` |

Brand plum is reserved for the primary action and the active nav item. If plum shows up on a status
badge, the primary button stops reading as primary.

## Typography

- Poppins throughout, weights 300–600 only.
- **Headings use weight 400, not bold.** Product headings are light and airy; `font-bold` on an `h1`
  is the fastest way to look off-brand. Use size and colour for hierarchy instead.
- Dense body copy: `text-sm` (14px) default, `text-xs` for labels and metadata.
- Page title `text-xl font-normal text-stone-900`; section title `text-base font-medium`.
- Section labels above nav groups and filter blocks: `text-[10px] font-semibold uppercase tracking-wider text-stone-500`.
- `font-mono` for ids, language tags, permission names, JSON and anything machine-oriented.

## Shell layout

56px top header + collapsible left sidebar. This is the layout that makes the demo read as the
product rather than as a dev tool.

```
┌────────────────────────────────────────────────────┐
│ ◆  Translation Service      [ search ]         ⬤  │  56px header
├────────┬───────────────────────────────────────────┤
│ MODULES│                                           │
│ ▸ Read │   page content on canvas                  │
│ ▸ Pub  │                                           │
│        │                                           │
│  «     │                                           │
└────────┴───────────────────────────────────────────┘
  224px, collapses to 56px
```

### Header — `h-14` (56px)

`sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-stone-200 bg-white px-4`

Left to right:

1. Brand mark — `flex h-7 w-7 items-center justify-center rounded-lg bg-brand-900 text-[10px] font-semibold text-white`, holding the service's 3-letter prefix (`TRS`, `CRS`, `CSS`).
2. Service name — `text-sm font-medium text-stone-900`. No subtitle; the sidebar carries context.
3. Spacer, then optional search — `h-9 flex-1 max-w-md rounded-lg bg-stone-100 pl-9 text-sm` with a left-inset search icon. Include it only if something on screen is actually searchable.
4. Right cluster — the credentials/session control as a muted pill: `rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100`.

### Sidebar — `w-56` expanded (224px), `w-14` collapsed (56px)

`flex flex-col border-r border-stone-200 bg-white transition-[width] duration-150`

- Nav item: `flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm text-stone-700 hover:bg-stone-100`, icon `h-4 w-4`.
- Active item: `bg-brand-50 text-brand-700 font-medium`.
- Group label: the section-label style above, `px-2.5 pt-4 pb-1`. Hidden when collapsed.
- Collapsed: labels hidden, icons centered, `title={label}` for the tooltip.
- Collapse toggle pinned to the bottom behind `border-t border-stone-200`, full width, chevrons `«` / `»`.
- Collapsed state in `useState` only. Do not persist it.

### Content

`flex-1 overflow-y-auto bg-canvas` wrapping `mx-auto max-w-7xl px-6 py-6`.

## Component recipes

Copy these class strings verbatim; consistency matters more than local cleverness.

**Card / surface**
`rounded-lg border border-stone-200 bg-white shadow-sm`
Card header: `flex items-center justify-between border-b border-stone-100 px-4 py-3`.

**Primary button**
`rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed`

**Secondary button**
`rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50`

**Destructive button**
`rounded-lg bg-red-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-red-800`

**Input / select**
`w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none`
Label: `mb-1 block text-xs font-medium text-stone-600`.

**Table**
Inside a card, never full-bleed. Header row `border-b border-stone-200 bg-stone-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-500`; cells `px-4 py-2.5 text-sm`; rows `border-b border-stone-100 hover:bg-stone-50`; selected row `bg-brand-50`.

**Badge / pill**
`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset` plus a
per-status triplet, e.g. `bg-emerald-50 text-emerald-700 ring-emerald-600/20`.

**Modal**
Overlay `fixed inset-0 z-50 bg-stone-900/40`; panel `w-full max-w-2xl rounded-lg bg-white shadow-lg`
with a bordered header (title + `×`), scrollable body `max-h-[70vh] overflow-y-auto p-4`, and a
footer `flex justify-end gap-2 border-t border-stone-100 px-4 py-3` holding Cancel then the primary action.

**Loading / empty / error**
Consistent placeholders inside the card, not layout jumps:
- loading — `animate-spin text-brand-500` spinner, centered, `py-10`
- empty — `py-10 text-center text-sm text-stone-500` with a one-line hint on what to do next
- error — `rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800`

Factor these into shared `components/` on the first duplication.

## Login screen

The demo is gated behind OCMS client credentials, so this is the first thing anyone sees on a
screen share. Give it the same care as the shell.

Centered `max-w-md` card on `bg-canvas`, brand mark at 48px (`h-12 w-12 rounded-xl bg-brand-900`),
service name as `text-xl font-normal`, a one-line explanation in `text-sm text-stone-500`, two
inputs, error block, and a full-width primary button. One line of fine print at the bottom naming
the grant used.

## Do / don't

**Do**
- brand plum for exactly one thing per screen — the primary action
- `stone` neutrals, `bg-canvas` page background, white cards
- `rounded-lg` (8px) everywhere; `rounded-xl` only on the login card
- weight 400 headings, `text-sm` body, `font-mono` for machine values
- real states: loading, empty, error, and `304`/not-modified where the API has it

**Don't**
- indigo, or any Tailwind default accent
- `slate` neutrals, or a `slate` gradient background
- bold or extra-bold headings
- gradient hero banners
- shadows above `shadow-sm` outside modals and popovers
- more than one accent hue per screen
- hardcoded tenant ids, client ids, secrets, or internal URLs anywhere in committed code
