# Dx Design System

This document is the source of truth for the Dx interface. Read it before adding or changing UI. It extends the repository's frontend rules in `docs/frontend.md`; architecture, authorization, data, and testing rules remain in `AGENTS.md`.

The visual direction is a warm Prometheus workspace with restrained Liquid Glass. The important rule is simple:

> **Content is solid. Navigation and temporary controls may be glass.**

The interface should feel calm enough for daily operational use. Liquid Glass is used to clarify hierarchy, not to decorate every surface.

## 1. Design principles

1. **Information before effects.** A user should understand the page, state, owner, next action, and blockers before noticing the glass treatment.
2. **Glass belongs to the UI layer.** Use it for navigation, floating toolbars, compact floating controls, and inspectors. Keep content cards, forms, stages, and tables solid.
3. **One continuous canvas.** The background scene spans behind the application. Do not add white fades, page-wide glass bars, or a colored slab behind page headers.
4. **Warm, technical, restrained.** Prometheus orange is the primary accent. Warm paper neutrals are the default surfaces. Blue/purple neon gradients are outside the system.
5. **Avoid glass-on-glass.** A glass element must not contain another independently refracting glass element.
6. **Harder glass for large surfaces.** Large inspectors use a more opaque material and weaker refraction than small controls.
7. **Reuse before creating.** Prefer shared primitives and existing patterns. A new visual variant needs a real behavioral reason.

## 2. Layer model

Use the following hierarchy when deciding what a component should look like.

| Layer   | Purpose                               | Material                 | Examples                            |
| ------- | ------------------------------------- | ------------------------ | ----------------------------------- |
| Canvas  | Environmental depth                   | Editorial gradient scene | App background                      |
| Content | Work users read/edit                  | Solid warm surfaces      | Cards, table content, stages, forms |
| Chrome  | Navigation and controls above content | Liquid Glass             | Sidebar, floating toolbar island    |
| Focus   | Temporary contextual work             | Opaque warm Liquid Glass | Drawers, popups, and toasts         |
| Modal   | Blocking task                         | Opaque warm Liquid Glass | Create/edit dialogs                 |

If a component does not clearly belong to Chrome or Focus, it should normally **not** use Liquid Glass.

## 3. Color tokens

Runtime colors are defined in `src/app/globals.css`. Use semantic Tailwind tokens whenever possible instead of copying hex values into feature code.

Core palette:

- `primary`: Prometheus burnt orange `#CB4D22`
- `primary strong`: `#A93F1C` for darker semantic accents when needed
- `background`: warm paper `#F4EEEA`
- `card` / `popover`: warm white `#FFFDFA`
- `secondary`: warm beige `#EEE4DB`
- `muted`: `#F3ECE6`
- `border`: `#D8CDC4`
- `foreground`: warm charcoal `#1D1917`
- `muted-foreground`: `#6D645F`

### Accent usage

Use orange for:

- the main action on a page or dialog;
- active navigation icons;
- progress indicators;
- accepted/active semantic cues;
- small labels or focus details.

Do not use orange as a large page background or on every interactive object.

## 4. Background scene

The application scene is rendered by `.app-scene` in `src/app/globals.css` using `public/backgrounds/editorial-gradient.webp`. The previous Spectrum Terracotta experiment is kept separately as `public/backgrounds/spectrum-terracotta.svg` and is not the default canvas.

The scene exists for two reasons:

1. establish Prometheus visual identity;
2. provide structured color underneath Liquid Glass so refraction is visible.

Rules:

- Keep the scene fixed behind the whole authenticated workspace.
- Use `background-size: cover` and centered positioning.
- Keep the wash uniform and light; do not add a white gradient at the top.
- Page headers remain transparent so the canvas reads continuously.
- Do not place text directly on a high-contrast area without checking readability at common viewport sizes.
- If a future background is added, it must use the same terracotta / cream / dusty-blue family unless the whole design system is intentionally revised.

## 5. Liquid Glass

### Implementation

The low-level engine lives in `src/lib/liquid-glass.ts`. React integration lives in `src/components/shared/liquid-glass.tsx`.

The engine creates a rounded-rectangle signed-distance-field lens, derives surface normals, computes refraction, and feeds a displacement map to Chromium through an SVG `feDisplacementMap` backdrop filter. Browsers without that path fall back to normal frosted glass.

Do not duplicate or fork the engine inside a feature.

Every preset uses the same mandatory three-layer DOM contract:

```tsx
<div className="liquid-glass">
  <div className="liquid-glass__optics" aria-hidden="true" />
  <div className="liquid-glass__content">{children}</div>
</div>
```

- The root establishes positioning, isolation, the outer white rim, and shadow. Its background stays transparent.
- `.liquid-glass__optics` is an absolute, radius-clipped, pointer-events-free background layer. SVG displacement, backdrop filtering, tint, and generated specular highlights belong only here.
- `.liquid-glass__content` is normal DOM content above the optics. It must stay transparent and must never receive `filter`, `backdrop-filter`, tint, or refraction.
- Put flex/grid alignment and padding on `contentClassName`; keep size, radius, border, shadow, and overflow on the glass root.
- Do not add translucent white/card fills to the glass root or content wrapper. Interactive child controls may still use their normal explicit hover/pressed surfaces. Hardened overlays may use stronger tint in their optics layer, but their content remains sharp.

This separation is non-negotiable: the glass bends the editorial canvas behind it, never its own text, icons, buttons, or child surfaces.

### Presets

`LiquidGlass` supports four sanctioned material kinds:

- `navigation` — persistent sidebar or navigation island;
- `toolbar` — compact floating breadcrumb/action groups;
- `control` — small temporary controls such as quick actions;
- `overlay` — drawers, popups, dialogs, and toasts using the same warm hue with a more opaque tint and weaker refraction.

Use the existing preset instead of passing one-off optical values from feature code. Changing a preset changes the design system and should be reviewed globally.

### Where glass is allowed

Use Liquid Glass for:

- authenticated sidebar navigation;
- compact mobile navigation chrome;
- floating breadcrumb or action islands;
- small floating quick-action clusters;
- drawers, popups, dialogs, and toasts through the shared `overlay` preset.

Do **not** use Liquid Glass for:

- cards;
- individual table rows or cells;
- stage/kanban columns;
- forms and form fields;
- status pills;
- alerts;
- nested panels inside a drawer;
- decorative empty-state containers.

### Performance

Refraction maps are generated per glass instance. Keep the number of simultaneous instances small. Prefer one sidebar, up to two toolbar islands, one quick-action cluster, and only the currently visible overlays. Never wrap a repeated list item in `LiquidGlass`.

## 6. Application shell

`src/components/shared/app-shell.tsx` owns global authenticated navigation.

Desktop behavior:

- floating sidebar with outer page breathing room;
- sticky viewport positioning so page content scrolls independently;
- approximately 252 px shell allocation;
- an animated compact state that keeps navigation and account actions available as icons;
- sidebar radius around 30 px;
- brand at the top, grouped navigation in the middle, account control at the bottom;
- no page-wide glass top bar.

Mobile behavior:

- compact floating glass header;
- navigation opens into the opaque warm `overlay` glass preset;
- content is never obscured by a permanently open sidebar.

### Adding a navigation item

Add it to the appropriate navigation group in `app-shell.tsx` and use a 16 px Lucide icon. Do not create a new navigation visual style for one feature.

Only add a navigation item when its route exists. Do not ship dead menu items as placeholders.

## 7. Page headers

Use `PageHeader` for normal pages. For specialized workspace pages, the same principles still apply:

- transparent background;
- eyebrow is optional, mono, small, uppercase;
- title is the strongest typographic element;
- description is muted and constrained in width;
- actions sit beside the header or in a sanctioned toolbar island;
- never wrap the whole header in a card merely for decoration.

The project workspace intentionally places `Client Management System` directly on the scene canvas. That is the reference behavior.

## 8. Content surfaces

### Sections

Prefer normal sections and dividers before adding a card. The content layer should feel stable and materially different from the floating chrome.

### Cards

Use `Card` or a card-like bounded object when the content represents one discrete interactive record or object.

Reference material:

- warm white / `card` surface;
- subtle neutral border;
- low shadow;
- radius around 10–12 px;
- hover may lift 1–2 px for clickable cards;
- no backdrop refraction.

Do not wrap a whole page in one card.

### Kanban/stage columns

Stage columns are **solid structural containers**, not Liquid Glass.

- warm beige surface one step darker than cards;
- readable header separation;
- compact progress indicator;
- 310–320 px reference width on desktop;
- horizontally scroll when the board exceeds the viewport.

Outcome cards sit one visual level above the stage surface.

## 9. Buttons

Use `src/components/ui/button.tsx`.

- `default`: primary page/dialog action; orange fill.
- `outline`: secondary action on solid content.
- `secondary`: low-priority contained action.
- `ghost`: actions inside glass chrome or visually quiet toolbars.
- `destructive`: destructive operations only.
- `link`: inline navigation, not button-like actions.

A view should normally have one dominant primary action per action group.

Do not create custom orange button CSS inside features unless the shared primitive cannot represent the required behavior.

## 10. Status, badges, and chips

Status is semantic, not decorative. Status elements stay solid/translucent CSS surfaces; they are never refracting glass.

Project outcome reference colors:

- Accepted — Prometheus orange
- For review — clay/brown
- In progress — desaturated steel blue
- Blocked — taupe/brown
- Planned — neutral gray

Use compact mono text for machine/state labels. Use normal sans text for names and descriptive content.

Member/department chips should remain lower contrast than the outcome title.

## 11. Progress

Progress bars use a thin neutral track and primary orange fill. Avoid glow, animated shimmer, or large gauges unless the product requirement specifically needs them.

Progress should communicate actual state. Do not use decorative percentages that are not tied to a defined calculation.

## 12. Forms

Use the repository's existing form stack:

- React Hook Form;
- feature Zod schema;
- `zodResolver`;
- shared `Input`, `Textarea`, `Select`, `Label`, and `FormMessage`;
- repeat validation in the Server Action.

Prototype-only local forms may use simple local state, but production feature work must follow `AGENTS.md` and `docs/creating-a-feature.md`.

Form containers are solid. Inputs should not use Liquid Glass.

## 13. Dialogs

Use `src/components/ui/dialog.tsx` for blocking create/edit/confirm tasks.

Dialogs use:

- highly opaque warm Liquid Glass;
- dim backdrop;
- clear title and optional description;
- footer actions ordered secondary → primary;
- weak refraction so form content stays legible.

## 14. Inspector drawer

Use `src/components/shared/inspector-drawer.tsx` for contextual detail that should stay visually connected to the underlying page.

Reference behavior:

- right aligned;
- floating margin from viewport edges;
- maximum width about 480 px;
- radius about 32 px;
- warm `overlay` Liquid Glass preset;
- high tint/opacity with weaker refraction than toolbar glass;
- normal foreground and semantic colors with strong contrast;
- section dividers inside the drawer are solid/transparent content, not nested glass;
- use an inspector for read/compare/review workflows, not for long multi-step forms.

Use a normal Dialog instead when the user must complete a focused form before returning to the page.

## 15. Tables

Use `LedgerTable` for simple record lists and `AppDataTable` for searchable, sortable, paginated business records. Both use the solid warm-paper ledger material with faint row separators; tables must never use Liquid Glass or sit inside another Card.

Feature code owns columns, filters, URL state, and row actions. The shared table owns the visual pattern.

## 16. Empty, loading, error, and toast states

Reuse:

- `EmptyState`
- `LoadingState`
- `ErrorState`
- `ConfirmationDialog`

Build loading compositions from the shared `Skeleton` primitive. Use its restrained sheen animation, keep repeated content placeholders on solid surfaces, and use Liquid Glass only where the resolved interface also uses glass chrome.

Do not create another visual family for a feature unless its behavior cannot be represented by the shared component.

Use the shared Shadcn/Sonner `Toaster` for transient feedback. Toasts appear at the bottom-right without a separate close control and use the same highly opaque warm glass color as other overlays.

## 17. Typography

Primary interface typeface: Inter through `next/font`.

Use monospace only for:

- eyebrow labels;
- stage numbers;
- compact status labels;
- small system metadata;
- technical identifiers.

Do not use monospace for paragraphs, forms, or long descriptions.

Reference hierarchy:

- workspace/page title: 32–40 px depending on context;
- section title: 14–18 px;
- card title: 13–15 px;
- body: 12–14 px;
- metadata: 9–11 px.

## 18. Radius system

Keep shapes technical rather than bubbly.

- input/button: 8–10 px;
- content card: 10–12 px;
- stage/container: 12–16 px;
- toolbar island: 16–20 px, except compact breadcrumb capsules which are fully rounded;
- sidebar / inspector: 28–32 px;
- pill/status: fully rounded.

Large radii are reserved for floating chrome. Do not apply 24–32 px radii to ordinary cards.

## 19. Shadows and borders

Content surfaces use subtle low-opacity shadows. Glass uses a soft ambient shadow plus a white inner highlight.

Avoid:

- dark heavy shadows;
- neon glow;
- visible bevels on every element;
- thick borders;
- multiple competing shadow styles on one screen.

## 20. Motion

Motion should explain state change.

Allowed patterns:

- 150–200 ms hover/elevation transitions;
- 150–220 ms drawer/dialog entry;
- small icon feedback;
- gentle quick-action expansion.

Respect `prefers-reduced-motion`. Do not add looping background animation to normal business screens.

### Gooey selection transitions

Persistent navigation and compact selection controls may use `liquid-gooey` to make the active surface flow between related choices.

- Use the shared Gooey navigation pattern for the sidebar active indicator. The route must change immediately; never delay navigation so an animation can finish.
- Prefer the library's `move` effect for active navigation, tabs, and segmented selectors. Keep the tuning calm: low wobble, restrained stretch, and a short trailing bridge.
- Use `morph` only when a compact control genuinely expands, collapses, merges, or separates. Do not apply it to normal page content.
- Keep labels, icons, links, focus rings, ARIA, and hit targets in the crisp DOM content layer. The filtered silhouette is visual feedback only.
- Use one moving liquid indicator per selection group instead of one effect per item.
- Use warm semantic fills that work with the Prometheus canvas. Gooey motion must not introduce neon colors or become a second visual theme.
- Do not use Gooey as a full-page wipe, on tables or forms, for repeated record cards, or for passive decoration.
- Component-driven motion must collapse to an instant state change under `prefers-reduced-motion`. Preserve a clear static active state when motion is disabled or unsupported.
- Similar transitions are appropriate for persistent sidebar selection, compact tab bars, segmented view switches, and sanctioned quick-action clusters when those controls share one spatial context.

## 21. Icons

Use Lucide icons unless a feature already uses an approved shared animated icon. Normal interface icon size is 16 px. Icons support labels; they should not replace clear text for unfamiliar actions.

## 22. Responsive behavior

Design desktop-first for dense operational screens, but every route must remain usable at mobile widths.

- sidebar becomes compact mobile navigation;
- kanban boards scroll horizontally;
- forms collapse to one column;
- inspector occupies almost the full viewport on small screens;
- primary actions remain reachable without hover;
- never rely on tooltips as the only mobile label.

## 23. Accessibility

Every addition must preserve:

- semantic heading order;
- keyboard access;
- visible focus rings;
- sufficient text/background contrast;
- labels for form fields;
- accessible names for icon-only buttons;
- correct dialog focus management;
- reduced-motion behavior.

Liquid Glass is never an excuse for lower text contrast.

## 24. Where new components belong

Use this order before creating anything:

1. Can an existing `src/components/ui` primitive do it? Use it.
2. Is it a reusable application-wide composition? Put it in `src/components/shared`.
3. Is it specific to one product capability? Put it in `src/features/<feature>/components`.
4. Is it only route composition/data loading? Keep it in `src/app/...`.

Business rules and authorization do not belong in visual components.

## 25. Component decision guide

| Need                                 | Use                                              |
| ------------------------------------ | ------------------------------------------------ |
| Primary/secondary action             | `Button`                                         |
| Record status                        | `Badge` or feature status chip                   |
| Discrete record/object               | `Card` or feature card                           |
| Searchable business list             | `AppDataTable`                                   |
| Simple record list                   | `LedgerTable`                                    |
| Standard page heading                | `PageHeader`                                     |
| No-data view                         | `EmptyState`                                     |
| Blocking create/edit flow            | `Dialog`                                         |
| Confirm destructive action           | `ConfirmationDialog`                             |
| Contextual read/review details       | `InspectorDrawer`                                |
| Global navigation                    | `AppShell`                                       |
| Floating navigation/control material | `LiquidGlass` through an approved shared pattern |
| Repeated content surface             | Solid section/card, **not** Liquid Glass         |

## 26. Adding a new feature

Before implementation:

1. Read `AGENTS.md`, `DESIGN.md`, `docs/business-context.md`, and the feature spec.
2. Copy `docs/feature-spec.md` to `docs/features/<feature>.md`.
3. Resolve roles, scope, ownership, validation, and audit requirements.
4. Identify which existing shared UI patterns cover the workflow.
5. Add only the minimum new components needed.

During implementation:

- Server Components first;
- client components only at interaction boundaries;
- shared tokens, no feature-level theme fork;
- one primary action per action group;
- no repeated Liquid Glass surfaces.

Before completion run the verification commands required by `AGENTS.md`.

## 27. Anti-patterns

Do not add:

- glass cards in a list;
- a full-page frosted overlay;
- per-row/per-cell glass or a feature-local glass table implementation;
- nested glass;
- blue/purple neon blobs unrelated to the Prometheus palette;
- a white gradient hiding the background at the top of the page;
- a background slab behind normal page headers;
- one-off button, input, or card systems inside a feature;
- excessive rounded rectangles;
- decorative animations that run continuously;
- dead sidebar destinations.

## 28. Current reference implementation

The `/projects` route is the reference for the intended hierarchy:

- continuous editorial gradient canvas;
- floating Liquid Glass application sidebar;
- compact Liquid Glass project toolbar islands;
- transparent project header;
- solid stage columns and outcome cards;
- opaque warm Liquid Glass create/edit dialogs;
- opaque warm Liquid Glass right-hand inspector;
- Liquid Glass quick-action cluster.

When a future screen conflicts with this reference, preserve usability and product semantics first, then update this document if the design-system rule itself needs to change.
