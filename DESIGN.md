---
name: SF ProPadel
description: E-commerce de artículos de pádel — sistema de dos acentos (teal + lima) extraídos del logo real de la marca, sobre una base neutra en blanco/negro.
colors:
  primary: "oklch(0.4247 0.0697 213.01)"
  primary-foreground: "oklch(0.985 0 0)"
  lime: "oklch(0.8077 0.1818 115.67)"
  lime-foreground: "oklch(0.145 0 0)"
  ink: "oklch(0.145 0 0)"
  surface: "oklch(1 0 0)"
  surface-muted: "oklch(0.97 0 0)"
  ink-muted: "oklch(0.556 0 0)"
  border: "oklch(0.922 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontWeight: 800
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.015em"
  title:
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontWeight: 500
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  3xl: "22px"
  4xl: "26px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 10px"
  button-primary-hover:
    backgroundColor: "oklch(0.4247 0.0697 213.01 / 0.8)"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "32px"
  button-cta:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    height: "48px"
    padding: "0 24px"
  badge-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.4xl}"
    height: "20px"
    padding: "0 8px"
  badge-lime:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.lime-foreground}"
    rounded: "{rounded.4xl}"
    height: "20px"
    padding: "0 8px"
  price-emphasis:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.display}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: SF ProPadel

## Overview

**Creative North Star: "True Colors, Turned Up"**

SF ProPadel just received its real brand logo, and the placeholder orange that stood in for a brand accent through every earlier round of this system is retired. The real identity is a **two-accent hierarchy**, extracted directly from the isotipo (not eyeballed — sampled pixel-by-pixel from `public/logo.jpeg` and cross-checked two independent ways): a **dark teal** (`oklch(0.4247 0.0697 213.01)`, `#0e5865`) as the dominant structural color, and a **lime green** (`oklch(0.8077 0.1818 115.67)`, `#bccd0f`) as a secondary, sparing highlight — mirroring the logo's own visual weight, where teal is the racket's dominant shape and lime is the highlight/rim at the top. Ink stays exactly as it was: the logo sets "PRO PADEL" in solid black, confirming the system's existing near-black `ink` token needed no change at all.

Everything built during the "Turned Up" phase (Geist Sans headings, the Angled Corner motif, the Court-Line texture, the CTA's bigger presence) stays exactly as architected — only the **hue** running through the accent-colored parts of that system changes, from a single placeholder orange to a deliberate two-color hierarchy with real brand backing.

**Key Characteristics:**
- **Two accents, not one, with a strict hierarchy:** teal is the structural/primary accent (buttons, focus, price, wordmark); lime is the secondary energy accent (badges, small decorative details) — see The Two-Accent Hierarchy Rule under Colors. They never combine on the same element.
- Near-black, not pure black — `oklch(0.145 0 0)`, matching Tailwind's `neutral-950` — unchanged, and now confirmed by the logo's own black wordmark.
- Flat-by-default surfaces; the hairline ring is still the default separator. The primary CTA is the one named exception that earns a resting shadow (now teal-tinted, not orange-tinted).
- A deliberate two-family type pairing: Geist Sans for every heading tier (display/headline/title), system-ui for body — unchanged by the color migration.
- Light mode only, **by deliberate product decision, not oversight** — see The Light-Only Rule under Colors.

## Colors

The palette is Tailwind's default neutral scale plus two saturated hues, both extracted from the real SF ProPadel logo — no placeholder colors remain in the system. Every color below is defined as an OKLCH CSS custom property in `src/app/globals.css`; OKLCH is the project's canonical format — treat it as the source of truth over any hex approximation.

### Primary — Dark Teal
- **SF Teal** (`oklch(0.4247 0.0697 213.01)` ≈ `#0e5865`): the structural brand accent — replaces orange as the system's primary hue. Used for the wordmark's "ProPadel" in the header, primary buttons, the "Agregar al carrito" CTA, focus rings, selected-variant emphasis, the product detail page's price plate, and — as a large solid fill — the footer background. This is the dominant color in the logo itself (the racket's main shape), so it now carries the dominant role in the UI too.
- **Deliberately excluded:** the admin-access icon (`AdminAccessLink`, the lock icon in the header) stays `text-muted-foreground` (neutral gray) — it does not pick up either accent. Keeping it neutral preserves its original low-priority intent: a customer browsing the storefront shouldn't read it as a brand/structural element, just a quiet utility link.

### Secondary Accent — Lime Green
- **SF Lime** (`oklch(0.8077 0.1818 115.67)` ≈ `#bccd0f`): a sparing, secondary highlight — mirrors the logo's own lime rim, which appears only as a small top accent on the icon, never as the dominant shape. Used for the discount/offer badge and small decorative details (see the Angled Corner motif under Shapes). **Never as a large fill, and never as body or interactive text color** — at 80% lightness, lime text fails contrast on white (this is exactly why the logo itself never sets lime as text; it's a shape-highlight, not a reading color). Pairs with `{colors.lime-foreground}` (`oklch(0.145 0 0)`, the same ink token) wherever it appears as a fill, never white.

### Neutral
- **Ink** (`oklch(0.145 0 0)` ≈ `#0a0a0a`, `neutral-950`): body text and headings. This is the project's "black" — always this near-black token, never literal `#000` as a UI surface. Confirmed by the real logo, which sets "PRO PADEL" in solid black. (The footer's inverted surface moved from this ink fill to a solid teal fill — see the footer note under Navigation.)
- **Surface** (`oklch(1 0 0)`, pure white): page background, card/popover/dialog backgrounds.
- **Surface Muted** (`oklch(0.97 0 0)` ≈ `#f5f5f5`): secondary buttons, muted/skeleton backgrounds, hover backgrounds on ghost controls, image placeholders (`bg-muted`) behind product photos before they load.
- **Ink Muted** (`oklch(0.556 0 0)` ≈ `#737373`, `neutral-500`): secondary text — captions, helper copy, struck-through prices, muted icons.
- **Border** (`oklch(0.922 0 0)` ≈ `#e5e5e5`, `neutral-200`): all hairline borders and input outlines.

### Functional
- **Destructive Red** (`oklch(0.577 0.245 27.325)` ≈ `#dc2626`, `red-600`): unaffected by the logo migration — stays reserved for genuinely negative/urgent signals only (low-stock and out-of-stock messaging, destructive actions, error states). Not part of the brand's two-accent hierarchy; never used decoratively.

### Named Rules
**The Two-Accent Hierarchy Rule (replaces the One Accent Rule).** SF ProPadel now runs on two saturated hues instead of one, with a strict hierarchy taken directly from the logo's own visual weight: **teal leads, lime highlights, and they never share an element.**

- **Teal is structural.** It carries the site's confident, load-bearing brand presence: the wordmark, primary and CTA buttons, focus rings, selected-variant emphasis, and the singular detail-page price plate. If a new component needs the "this is SF ProPadel, act on this" signal, it reaches for teal.
- **Lime is a highlight, not a second primary.** It marks urgency/energy in small, bounded doses: the discount/offer badge, and small decorative details (the Angled Corner motif's accent line, the Ofertas section's wash — see Shapes). It never fills a large surface and never carries body or interactive text, matching how the logo itself uses lime only as a small rim highlight, never as the dominant shape or as lettering.
- **The two accents never appear on the same element.** A button, a badge, a price plate, a card — each accented element picks exactly one of the two hues, never both. Mixing them on one object reads as disorganized rather than energetic; keeping them apart is what makes the hierarchy legible at a glance.

**Correct combinations:**
- The "Comprar por WhatsApp" CTA: solid teal fill, white text, teal-tinted shadow. No lime anywhere on the button, including its focus ring (which is also teal).
- A discount badge ("-15%") sitting in the corner of a product card whose price text below is plain ink (no fill at all) — the badge is lime, the price is neutral, they never touch or blend into one visual object.
- The header wordmark: "SF" in ink, "ProPadel" in teal. Lime never appears in the wordmark text — exactly like the real logo, which never sets its lettering in lime.

**Incorrect combinations:**
- A teal button with a lime border, ring, or icon accent inside it — mixing both accents on one interactive element muddies which hue means what.
- Lime used as the focus-ring color anywhere — focus rings are teal-only, both by role assignment and because lime fails visible-focus contrast expectations at that lightness.
- A lime "sale" ribbon drawn overlapping or touching a teal price plate in the same compact unit — even if each color is "correct" in isolation, compressing both accents into one small visual object breaks the separation the hierarchy depends on. Keep them in bounded, separate shapes instead (as the discount badge and price already are on the product card).

**The Near-Black Rule.** "Black" in this system is always `oklch(0.145 0 0)` (the `--foreground` / `ink` token), not `#000`. The one exception is literal `black/50`–`black/60` used as a translucent gradient scrim behind text overlaid on photography (hero banners, category tiles) — that's an image-legibility technique, not a surface color, and should not be reused as a fill. Unchanged.

**The Light-Only Rule.** SF ProPadel ships in light mode only, **on purpose** — confirmed as a deliberate product decision, not an unfinished corner of the app. The `.dark` block in `globals.css` (colors, `--sidebar-*`, everything) is a leftover from the shadcn scaffold: it is not wired to any theme provider, there is no `next-themes`/`ThemeProvider` in `layout.tsx`, and there is no toggle anywhere in the UI. Every device this system actually ships — the Court-Line texture, the Angled Corner motif, the Ofertas ambient wash, the CTA's brand-tinted shadow — was designed, tuned, and reviewed against a white/near-white ground only; none of it has been checked against a dark surface. If dark mode is ever wanted, treat it as its own design pass (new contrast checks, new texture/wash opacities, a real decision on how the two accents behave on a dark ground), not as flipping on the inherited `.dark` tokens.

## Typography

**Body Font:** system-ui stack — `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif` (Tailwind's default `font-sans`, applied globally via `<html class="font-sans">`). Unaffected by the color migration.

**Display / Heading Font:** Geist Sans, self-hosted via `next/font/google` and exposed as `--font-geist-sans` in `layout.tsx`, carrying every heading tier (display, headline, title) at three escalating weights. System-ui remains the body voice. Unaffected by the color migration.

**Loaded but still unused:** Geist Mono remains dormant — `--font-mono` resolves to it correctly, but no component applies `font-mono`.

**Character:** Confident where it counts, plain everywhere else — now with real brand color instead of a placeholder carrying that confidence.

### Hierarchy
- **Display** (800, Geist Sans, `tracking-[-0.02em]`): the hero banner title, the "SF ProPadel" wordmark (header + footer), and the product detail page's price figure.
- **Headline** (700, Geist Sans, `tracking-[-0.015em]`, `text-2xl`/24px): page/section titles (`Ofertas`, `Destacados`, `Descripción`, `También te puede interesar`) and the product detail `<h1>` name.
- **Title** (500, Geist Sans, `text-base`/16px): card, dialog, sheet, and alert-dialog titles, and the filter panel's group labels (`Categoría`, `Marca`, `Género`, `Precio`).
- **Body** (400, system-ui, `text-sm`/14px): default UI copy — nav links, descriptions, form labels, table cells.
- **Emphasis price** — split by context, see The Two-Accent Hierarchy Rule above:
  - **Card price** (700–800, Geist Sans, `text-xl`/20px, ink text, no fill): repeated per grid item, so it stays plain text — neither accent touches it.
  - **Detail page price** (800, Geist Sans, `text-3xl`–`text-4xl`, white text in a solid `price-emphasis` **teal** plate — was orange): the one price that gets the fill treatment, because it appears exactly once per page.
- **Label** (400–500, system-ui, `text-xs`/12px): captions, badge text, footer legal line, helper/error text.

### Named Rules
**The Two-Voice Rule.** Geist Sans speaks for every heading (display/headline/title); system-ui speaks for everything else (body/label). Never mix them within the same role — unaffected by the color migration.

## Layout

Content is capped at `max-w-6xl` and centered with `mx-auto px-6`, the container used consistently across the header, footer, and every homepage/listing section. Vertical rhythm between sections is `py-12` — including "Ofertas" and "Destacados" (see Ofertas / Destacados under Components), which no longer carry the special `pt-10 pb-16` an earlier version used to leave room for a diagonal edge that's since been removed. Product/category grids are responsive column counts: 2 columns on mobile, scaling to 3–5 columns at `sm`/`lg` breakpoints depending on the grid. Density is compact throughout — controls default to `h-8` (32px) — except the CTA button, which deliberately breaks from that density.

**Full-bleed is a named exception, now used twice.** The hero carousel and the home's Category Tiles (see Components) both deliberately break out of `max-w-6xl` to run edge-to-edge (`w-full`, no `mx-auto`/`px-6`) instead of matching the contained width of the sections around them — the hero to read as a wide, immersive banner; the tiles to read as large lifestyle photography rather than a bounded grid. The hero additionally sits flush against the header with no top padding, unlike every other section (including Category Tiles, which keeps normal vertical rhythm between it and its neighbors). A third full-bleed section needs the same bar the second one cleared: a real reason the contained width doesn't serve the content, not decoration for its own sake.

Its height fills exactly what's left of the viewport below the header: `calc(100vh - var(--header-height))`. `--header-height` isn't a static number — the header has a conditional promo bar and an extra search row on mobile, so `SiteHeader` measures its own real rendered height with a `ResizeObserver` and writes it to `:root` on mount (`globals.css` only holds a `140px` fallback for the instant before that runs). On `lg`+ this formula runs uncapped, so desktop sees the hero fill the full screen below the header with no scroll needed. Below `lg`, the same formula is wrapped in `clamp(360px, …, 620px)`: an uncapped fill reads great on desktop but is a known mobile anti-pattern on tall phones (a 100%-remaining-viewport hero can bury every other section below the fold), so it's floored and capped to stay proportional instead.

## Elevation & Depth

Still flat by default: a 1px `ring-foreground/10` hairline remains the primary separation technique for cards, dialog content, and dropdown/select content. `shadow-md` still appears only as a hover/floating-state accent (product cards on hover, open popover/select/dropdown content).

### Named Rules
**The Ring-Over-Shadow Rule.** Unchanged: separation between a static surface and its background is a 1px `ring-foreground/10` hairline, not a shadow.

**The One Lifted Element Rule.** The primary "Agregar al carrito" CTA (**was "Comprar por WhatsApp"** — the cart became the primary conversion path once checkout went through a real cart instead of a single-product WhatsApp message; WhatsApp is now the secondary, immediate-purchase path and lost the shadow along with the demotion) is the single static element in the system permitted a resting shadow — a soft, brand-tinted lift (`shadow-lg shadow-primary/25`) that reads as "press this," not generic elevation. Named, singular exception: it does not extend to other buttons, cards, or panels.

## Shapes

Corner radius scales from a `0.625rem` (10px) base (`--radius`), with named steps derived from it (`sm` 6px, `md` 8px, `lg` 10px, `xl` 14px, `2xl` 18px, `3xl` 22px, `4xl` 26px). Buttons, inputs, and selects use `rounded-lg` (10px); cards, dialogs, and the old (currently unused) category grid use `rounded-xl` (14px); badges use `rounded-4xl`. Full-bleed sections are the exception: the hero banner is a fully sharp rectangle with a single clipped corner instead of `rounded-xl` (see the motif below), and the home's Category Tiles are sharp-edged too, for the same reason — see Category Tiles under Components.

### Signature motif (implemented — one instance, was briefly two)
**The Angled Corner.** A sharp-cornered rectangle with one corner clipped at a diagonal, traced by a short **lime** accent line at the cut (**was orange**, reclassified to lime as a decorative detail).
- **The hero banner** (bottom-right corner, `clip-path: polygon(...)` driven by `--hero-corner-cut`). Replaces that element's `rounded-xl` rather than adding to it. The banner is full-bleed with a `vh`-based height (see Layout) rather than a width-driven `aspect-ratio`, so the cut is expressed in `vh` too — a steady ~8% of the banner's own height at every breakpoint: `3.5vh` base (< 640px), `4vh` at `sm`, `4.5vh` at `md`, `5.5vh` at `lg`+.

**Removed: the second instance, at the Ofertas/Destacados boundary.** For a short window this motif briefly existed in two places — a diagonal edge cut, first lime, then recolored teal once Ofertas and Destacados (briefly renamed "Más Vendidos" at the time — see Ofertas / Destacados under Components) were both made solid lime (a lime line is invisible between two lime sections). It was then removed outright, permanently, at explicit user request rather than kept as a dormant option: the two sections are now plain flat `bg-lime` rectangles with a normal straight boundary, no clip-path, no accent line. `section-highlight-edge`/`section-highlight-fill` (the utilities that implemented it) were deleted from `globals.css`, not just unused. This is left here as history so nobody reintroduces it while implementing a "highlight" tone from an old memory of this doc.

**This is a bounded family of one, not a free-standing pattern.** A second instance — including *reintroducing* the one just removed — needs a real compositional problem it solves, not decoration for its own sake.

### Signature texture (retired)
**The Court-Line Field — removed.** Was a repeating diagonal-hairline background texture behind all storefront content (public site only, excluded from the admin dashboard): `repeating-linear-gradient(45deg, ...)`, 1px ink lines every 28px at 12% ink alpha, along the same 45° diagonal as the Angled Corner motif. Retired at explicit user request as part of a broader decision to make every content background across the whole site — public and admin — flat solid white, no texture, no tint, everywhere except the header's promo bar and the footer's inverted block (both explicitly kept). `--pattern-court-lines` and the `bg-court-lines` utility were deleted from `globals.css`, not just left unused; `(site)/layout.tsx` no longer references either. Left here as history so nobody reintroduces it from an old memory of this doc.

### Named Rules
**The Whisper Texture Rule — retired along with the texture it governed.** Used to require background texture to be always ink at ≤14% alpha (12% in practice), never either brand accent. With the Court-Line Field gone, there's no texture left for this rule to constrain — noted here so its absence reads as a deliberate decision, not a gap someone needs to fill.

**The Angled Corner Family Rule.** The Angled Corner motif appears in exactly one place — the hero banner — sharing its 45° diagonal language with the Court-Line texture. It briefly had a second instance (see the removal note above); that's gone permanently now, not just currently unused. A second instance needs a real compositional problem it solves, not decoration for its own sake — the same bar any future addition has to clear.

## Components

### Buttons
- **Shape:** `rounded-lg` (10px), `h-8` (32px) by default, with `xs`/`sm`/`lg`/`icon` size variants. Unchanged.
- **Primary:** `bg-primary` / `text-primary-foreground` — **now teal, was orange**. Hover fades to `bg-primary/80` (a darker shade of teal, not a shift to lime — hover-darkening on an already-accented button stays within that button's own hue family; introducing the second accent there would violate The Two-Accent Hierarchy Rule).
- **CTA (named exception):** the "Agregar al carrito" button on the product detail page only (**was "Comprar por WhatsApp"** — see Elevation & Depth). `h-12` (48px), `px-6` (24px), `text-base` (16px), Headline typography (700, Geist Sans), plus the resting-shadow exception (`shadow-lg shadow-primary/25`, teal-tinted). Everything else — `rounded-lg`, `bg-primary`/`text-primary-foreground`, `hover:bg-primary/80` — stays teal, consistent with the rest of the button family.
- **Outline:** transparent background, `border-border`, hover fills `bg-muted`. Now also the treatment for the secondary "Comprar por WhatsApp" button next to the cart CTA, and for the outline "Agregar al carrito" button on product cards (grids).
- **Secondary / Ghost / Destructive / Link:** unchanged.

### Badges
- **Style:** `rounded-4xl` (pill), `h-5` (20px), `text-xs`. Unchanged.
- **Default / `badge-primary` (teal):** solid `bg-primary` / `text-primary-foreground`. A generic primary-accent badge archetype, available for any future non-discount badge need — not currently instantiated anywhere in the live UI (see the note on the discount badge below).
- **`badge-lime` (new):** solid `bg-lime` / `text-lime-foreground` (ink text on lime, never white). **The discount percentage badge (`-20%`) moves here — was `badge-primary`/orange, now lime**, matching the explicit "badges de oferta/descuento" bucket. A markdown is exciting, urgent news, which is exactly lime's role; it is a small, bounded pill, so it stays inside lime's "never a large fill" limit.
- **Destructive:** `bg-destructive/10` / `text-destructive` — reserved for genuine stock-outage badges (e.g. "Sin stock" in the admin dashboard). Unaffected by the migration.
- **Secondary:** muted gray fill — the "¡Últimas unidades!" low-stock badge on the storefront. Unaffected.

### Price
- **On product cards (repeated, many per page):** `text-xl`/700–800, Geist Sans, ink color, plain text — no fill, no accent. Unaffected by the migration; neither teal nor lime touches the repeated card price.
- **On the product detail page (singular, once per page):** the `price-emphasis` component — a solid **teal** plate (**was orange**), `rounded-md` (8px), `text-3xl`–`text-4xl`/800, white text, `px-3 py-1`-ish padding.

### Cards / Containers
Unchanged: `rounded-xl` (14px), `bg-card` (white), text `text-card-foreground` (ink), flat at rest (`ring-foreground/10`), `hover:shadow-md` on interactive product cards only, no border, `--card-spacing` 16px/12px.

### Inputs / Fields
Unchanged in shape/behavior: `rounded-lg` (10px), `h-8` (32px), transparent background, `border-input` outline. **Focus ring is now teal** (was orange) — `ring` token maps to teal.

### Navigation
Unchanged in shape/behavior. The header wordmark: "SF" in ink, "ProPadel" in **teal** (**was orange**) — same placement, same Geist Sans display weight (800). Nav-link and icon hover states (`hover:text-primary`) also move to **teal, not lime**: lime at 80% lightness fails text contrast on the white header background, so hover-as-text-color-swap stays in the accent that's actually legible there — lime never functions as reading text, on hover or otherwise. The wishlist counter badge (the small circle on the header's heart icon) is **teal**: it's a notification count, not a deal/urgency signal, so it follows the primary/structural role rather than the energy accent. The admin-access lock icon stays **`text-muted-foreground`** (neutral gray, unchanged — see Colors): it deliberately sits outside the two-accent system to keep its visual priority low relative to customer-facing icons.

**Footer (inverted surface, distinct treatment from the header).** The footer's background is a solid **teal** fill (`bg-primary`, was `bg-foreground`/ink) — the one place teal appears as a large surface rather than a small structural accent, matching the request to carry the exact hue of the "ProPadel" wordmark across the whole block. Because the surface itself is now teal, the wordmark here reads as a single flat "SF ProPadel" in `text-primary-foreground` (white) rather than the header's two-tone ink/teal split — teal-on-teal would be illegible, and lime can't substitute since it never functions as text (see The Two-Accent Hierarchy Rule). Body copy, nav links, and social icons run at `text-primary-foreground/70`, brightening to full `text-primary-foreground` on hover — not to teal, for the same contrast reason.

### Product Card (signature component)
Square, `bg-muted`-backed image area with `object-cover` photography, a top-left discount badge (**now lime**, was orange/teal-track), a top-right wishlist toggle, and price/installment copy below (plain ink text, no accent). The card's restraint — no border, ring + hover shadow only, exactly one accent-colored element (the badge) — still sets the tone for the rest of the UI.

### Ofertas / Destacados (homepage sections — lime wash retired)
Originally solved a real problem found in audit: "Ofertas" and "Destacados" used the identical component with no visual distinction. For a long stretch the fix was both sections sharing `ProductSection`'s `tone="wash"` — solid `bg-lime`, full-bleed — plus, in the last pass before this one, both on `layout="carousel"`. **The `tone`/`wash` mechanism itself is now retired**, at explicit user request, as part of the same broader decision that removed the Court-Line texture: every content background on the site, public and admin, is flat solid white now, with no section-level tint anywhere except the header's promo bar and the footer's inverted block. `ProductSection` no longer takes a `tone` prop — there was exactly one caller of `tone="wash"` (this component, both instances) and once it went away the prop had nothing left to do, so it was deleted rather than kept as a dormant option. Both sections are now plain white, `layout="carousel"`, structurally identical (title and underlying product data are the only difference). **"Destacados" is the section's title again** — it was briefly renamed "Más Vendidos" partway through this doc's history and later renamed back; the underlying data (`getDestacadoProducts()`, the `destacado` flag) never changed, only the homepage label.
- **`layout="carousel"` mechanics (unaffected by the background change):** reuses the same `Carousel`/`CarouselContent`/`CarouselItem` (embla, `@/components/ui/carousel`) the hero banner already runs on — one carousel implementation in the codebase, not several competing ones. `CarouselItem` overrides the default single-slide `basis-full` with `basis-1/2 sm:basis-1/3 lg:basis-1/4`, showing multiple cards per "page" and sliding by that many at a time. No autoplay (unlike the hero) — a product carousel the user is expected to browse at their own pace, not an ambient banner.
- **What the lime wash went through before being retired, in order, so the reasoning isn't lost:** (1) Ofertas alone had a lime wash with a diagonal-cut bottom edge (the Angled Corner motif) and Destacados was plain white — the original audit fix. (2) Destacados was renamed "Más Vendidos" and asked to share Ofertas' background color; first a 6%-alpha lime tint, then bumped to solid `bg-lime` once the 6% read as barely-there (see the note below on why). (3) With both sections solid lime, Ofertas' diagonal accent line stopped marking anything between two identical-looking sections and was removed outright, along with the `section-highlight-edge`/`section-highlight-fill` utilities that implemented it. (4) The title reverted from "Más Vendidos" back to "Destacados." (5) **Both sections' `bg-lime` fill itself was removed** in this pass — the wash outlived its own reason to exist once the site-wide decision became "every content background is white."
- **Why Ofertas' original "6% wash" never looked like 6%** (kept as a general lesson, not tied to code that still exists): its two-layer implementation had a solid `edge` layer sitting *underneath* a translucent `fill`, and `edge` covered more of the section than `fill` did — so translucent-lime-over-opaque-lime (same hue) rendered as just the opaque color, only caught once a real screenshot was compared against the source. Worth remembering if a similar "translucent accent over a solid layer" technique gets reused elsewhere: check what's actually *underneath* the translucent layer, not just its own alpha value.
- The Two-Accent Hierarchy Rule's "lime is never a large fill" tension — flagged here in an earlier pass while both sections were still solid lime — is resolved now, not just dismissed: there's no large lime fill left on the homepage for the rule to be in tension with.

### Category Tiles (home, signature component — replaces the old category grid)
Three large, equal-width photography tiles — "Hombre," "Mujer," "Accesorios" — replacing the home's previous 5-item `rounded-xl` category grid (`category-grid.tsx`, kept in the codebase unused in case a contained grid is needed elsewhere, e.g. a subcategory listing). "Hombre"/"Mujer" link to `/productos?genero=hombre`/`mujer` (the género filter, not a real category); "Accesorios" links to the real Accesorios category and reuses its existing admin-managed image — it doesn't get its own image slot.
- **Full-bleed, the hero's second instance of the technique** (see the Layout exception below): `w-full`, no `mx-auto`/`max-w-6xl`/`px-6`. `grid-cols-1 sm:grid-cols-3`, no gap between tiles — they read as one continuous banner split into three, matching the reference. Each tile is `aspect-[15/14]` (`sm:aspect-[20/21]`) — near-square, 30% shorter than the initial `aspect-[3/4]`/`aspect-[2/3]` pass at the same width, trimmed down after review for a more compact presence.
- **Sharp corners, not `rounded-xl`.** The Radius section's "cards, dialogs, and category tiles use `rounded-xl`" rule describes the old, gapped grid — flush full-bleed tiles butting against each other and the viewport edge would show rounding only at the two outer corners, which reads as a mistake, not a choice. This component follows the hero's full-bleed precedent (sharp edges) instead.
- **Scrim:** a flat `black/50` layer over the full tile (not the old grid's bottom-only gradient — full coverage reads better at this much larger size), darkening to `black/65` on hover. Both values sit inside the already-documented Near-Black Rule range for image scrims, which already named "category tiles" as a use case.
- **Text:** Headline typography per the type ramp (700, Geist Sans, `tracking-[-0.015em]`, `text-2xl` base scaling to `text-3xl` at `sm`+ for presence) in white, bottom-left. Explicitly **not** the reference's script/cursive treatment — the Two-Voice Rule has no third voice for marketing moments; every heading stays in Geist Sans.
- **Hover.** Four things happen together on the hovered tile, all `transform`/`opacity`/color only (never `width`/`height`/`top`/`left`): the image zooms `scale-110` (up from the old grid's `scale-105` — a bigger tile earns a more noticeable zoom), the scrim darkens `black/50` → `black/65` to hold text contrast against the now-larger image, and the label lifts `-translate-y-1` (4px) for a slight "rising" feel. The two *other* tiles simultaneously dim to `opacity-92`, reinforcing which one has focus — driven by a `:has()` selector (`.category-tiles:has(.category-tile:hover) .category-tile:not(:hover)`) since a "dim my siblings, not me" rule isn't expressible as a Tailwind utility on a single element; that one rule lives in `globals.css`, everything else is inline `motion-safe:` variants. All four are `300ms ease-out` and gated behind `@media (prefers-reduced-motion: no-preference)` (via Tailwind's `motion-safe:` for the inline effects, and the same media query wrapping the `:has()` rule) — reduced-motion users get an inert tile, not an instant jump-cut.
- **Images:** "Hombre"/"Mujer" come from two new `SiteSettings` fields (`imagenGeneroHombre`, `imagenGeneroMujer`), uploaded via `/admin/configuracion` through the same `ImageUploader` every other admin image field uses. Missing images fall back to `ImagePlaceholder`, same as everywhere else.

### Contact Page (`/contacto`)
Two-column layout, `lg:grid-cols-5` (`lg:col-span-3` form, `lg:col-span-2` contact panel) — more balanced than the original `2:1` split. Rebuilt after an early pass put lime as the page's own full-bleed background and let it bleed into transparent input borders — a direct violation of "lime is never a large fill, never a text/border color," caught from a screenshot rather than the source. That page background is gone; the page is back to the site's normal (textured, white/surface) background like every other non-homepage route, and **this page uses no lime at all** — there wasn't a real energy/decorative moment to hang it on, and forcing one in just to use the color somewhere would be decoration for its own sake, which the system already argues against elsewhere (see The Angled Corner Family Rule).
- **Form card:** plain `Card`/`CardContent` (`rounded-xl`, `bg-card`, `ring-foreground/10`, no shadow). "Elevated" was the original ask, but a resting shadow is reserved for the CTA button alone (see The One Lifted Element Rule under Elevation & Depth) — so the card reads as elevated through contrast with the page (white card, hairline ring) rather than literally adding a shadow that would violate that rule.
- **Contact panel: solid `bg-primary`/`text-primary-foreground` (teal), not lime, not `surface-muted`.** Mirrors the footer's own inverted-teal treatment directly below it on the page — same token, same reasoning (teal is the structural accent; a page's direct-contact channels are a wayfinding moment, not an energy/deals one). Each row (WhatsApp, Teléfono, Email, Dirección) is a real link (`wa.me`, `tel:`, `mailto:`, a Google Maps search) with a `bg-primary-foreground/10` icon circle for contrast against the teal fill, and the row itself highlights `bg-primary-foreground/10` on hover — the visual cue the original flat-text rows were missing, not just a color-contrast fix.
- **Embedded map:** a plain `<iframe>` pointed at `https://www.google.com/maps?q=...&output=embed` — no API key, no cost, inside a `rounded-lg` frame at the bottom of the teal panel. Only rendered when `SiteSettings.direccion` is set.
- Inputs are untouched — `Input`/`Textarea` already carry `rounded-lg`, `h-8`, teal `focus-visible:ring` globally; the low-contrast/lime look was entirely the page background bleeding through their `bg-transparent`, not anything in the input components themselves.

**On the lime-background bug: there was never a shared `PageHeader`/wrapper component behind it — confirmed twice, not just assumed.** First pass (Contacto/Nosotros): grepped for a shared layout and for `bg-accent`/token-mapping mistakes in `globals.css`; found neither — `(site)/layout.tsx` is the only shared layout across every public route and never had lime in it, and `--accent` maps to a neutral gray, not lime. Second pass, after the same bug turned up on the product listing too: re-grepped the whole `src/` tree for `bg-lime` and confirmed the *only* remaining large-fill instance was `ProductListing`'s own root `<div>` — same copy-pasted `bg-lime min-h-full` as the other two, not a new mechanism. All three were independent copy-paste, not a shared abstraction; there was never a single place to fix this "at the root" because there was no root — just the same manual mistake made three times. All three are fixed now. `ProductListing` is shared by `/productos` and every `/[categoria]` route, so fixing it there fixed every category page in one edit, confirmed live on `/paletas`.

**Full public-route lime audit** (checked live against the running dev server, not just source): `/` — lime only in Ofertas/Destacados (`tone="wash"`, documented, correct) and the small discount badge; `/productos`, `/[categoria]` (checked via `/paletas`), `/productos/[slug]`, `/nosotros`, `/contacto`, `/favoritos` — zero lime outside the discount badge (which doesn't appear at all on routes with no discounted products, e.g. Nosotros/Contacto/Favoritos). No large-fill lime remains anywhere in the public site.

### About Page (`/nosotros`)
Rebuilt from a single continuous text block (same lime-background violation as Contacto — full fix described above) into three parts:
- **Mission hero:** full-bleed `bg-primary`/`text-primary-foreground` band (not lime — same reasoning as the Contact Page's panel: a brand statement is a structural/wayfinding moment, not an energy one), Headline typography, centered, text capped at `max-w-3xl`. `SiteSettings.textoNosotros` now feeds this one short slot specifically, not the whole page — previously it replaced the entire body with one free-text paragraph, which doesn't compose with a structured page. Falls back to a short default mission line when unset.
- **"Por qué elegirnos":** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, each item a `bg-muted` icon circle (`text-primary` icon — teal, not lime) + Title-tier heading + Body-tier description, replacing four plain `<li>` bullets. The brand-names item pulls real names from `getBrandOptions()` (`Prisma.Brand`) instead of a hardcoded string, so it can't drift out of sync with what's actually in the admin.
- **Brand logos considered, not used:** every seeded `Brand.logo` currently points at the exact same placeholder image (`placehold.co`, identical for all four brands) — rendering "logos" today would show four identical gray boxes, a worse result than text. Revisit once real logos are uploaded; nothing in this layout needs to change to swap the brand-names sentence for a logo row later, it's an isolated change.
- **CTA:** a real `Button`/`Link` to `/contacto` (was a plain trailing sentence).

### Product Listing (`/productos`, `/[categoria]`)
Redesigned for more structure without touching the filter/sort logic underneath (still plain URL query params — `categoria`, `marca`, `genero`, `precioMin`/`precioMax`, `oferta`, `orden`, `page` — nothing moved to client state).
- **Filter sidebar is now `Accordion`-based** (new: `src/components/ui/accordion.tsx`, Radix via the project's unified `radix-ui` import, following the same `data-open`/`data-closed` custom-variant convention as `Sheet`/`AlertDialog`). Each group (Categoría, Marca, Género, Precio) is its own `AccordionItem`; Categoría/Marca/Precio default open, **Género defaults collapsed** — it's the newest, least-established group, so it doesn't need to claim vertical space by default the way the other three do.
  - **Named exception to "animate only transform/opacity": the accordion's open/close is a `height` animation, not transform/opacity.** It uses `shadcn/tailwind.css`'s pre-existing `accordion-down`/`accordion-up` keyframes (already shipped in this project's dependencies, driven by Radix's `--radix-accordion-content-height`) — not something newly introduced. A collapsing group has to stop occupying vertical space, and no transform/opacity-only technique does that (`scale-y-0` still reserves its full box in normal flow); animating height is the only correct option here. The chevron rotation is genuinely transform-only (`data-open:[&>svg]:rotate-180`).
- **Per-option counts** (`Categoría (4)`) come from `getFilterFacetCounts()` in `product-query.ts` — three `groupBy` queries (category/brand/género), not a query per option. **Deliberately static, not full faceted search:** counts reflect the whole catalog (or the current category, when on a `/[categoria]` page) — they do *not* recompute as *other* filters are toggled. A fully reactive facet count needs a query per combination of active filters; this is the simpler version that's still a real improvement over no counts.
- **Active filter chips** (new: `active-filters.tsx`) render above the results grid when any filter is set — one removable chip per active value (`Categoría: Paletas ✕`), plus "Limpiar todo". Teal-tinted (`border-primary/30 bg-primary/5 text-primary`) per the Two-Accent Hierarchy Rule — this is a structural/wayfinding element, not a deals one, so it's teal, not lime. Chips animate in with `animate-in fade-in-0 zoom-in-95` (from `tw-animate-css`, already a project dependency) — transform/opacity only, no exception needed here.
- **Sidebar is `md:sticky`**, offset by `var(--header-height)` (the same measured-by-`ResizeObserver` variable the hero uses) plus breathing room, with its own `max-h`/`overflow-y-auto` so a long filter list scrolls internally instead of running off-screen.
- **Grid dropped from 4 columns to 3 at `lg`** (`grid-cols-2 sm:grid-cols-3`, no `lg:grid-cols-4`): the container is still capped at `max-w-6xl`, so a 4th column was squeezing cards to ~200px once the sidebar carried more visual weight — 3 columns gives each card meaningfully more room without needing a wider page.
- **Results header is now a bordered toolbar** (`border-b pb-4`) separating the count/sort row from the grid, with `mt-8` (was `mt-6`) below the page `<h1>` — more air between "Productos" and the controls beneath it, per the ask.
- **Mobile is unchanged in mechanism:** the same `Sheet` drawer wraps the same `FilterForm`, so the accordion upgrade applies there automatically — confirmed live, not just assumed.
- Loading (`ProductListingSkeleton`) and empty-result states were updated to match: the skeleton's sidebar now shows four bordered groups (was two, mismatched from the real four), and the grid skeleton dropped to 3 columns to match the real one.

## Do's and Don'ts

### Do:
- **Do** use teal for structural/primary brand moments: wordmark, primary/CTA buttons, focus rings, the detail-page price plate.
- **Do** use lime only for small, bounded secondary moments: the discount badge, and small decorative details (the hero's Angled Corner accent line) — never as a large fill, never as text. (Ofertas and Destacados are a named, explicit exception, both large lime fills — see the Two-Accent Hierarchy Rule tension noted under Ofertas / Destacados.)
- **Do** keep the two accents on separate elements, always — see The Two-Accent Hierarchy Rule for correct/incorrect examples.
- **Do** use Geist Sans for every heading tier (display/headline/title) and system-ui for body/label — never mix a role's typeface. Unaffected by the color migration.
- **Do** use `oklch(0.145 0 0)` ("ink") wherever the brand needs a "black" surface or text color — body copy and headings are the reference example, confirmed by the logo's own black wordmark. (The footer is the one deliberate exception: it's a solid-teal inverted surface, not ink — see the footer note under Navigation.)
- **Do** default new surfaces to a 1px `ring-foreground/10` hairline for separation before reaching for a shadow — the CTA's (now teal-tinted) resting shadow is the one named exception.
- **Do** keep buttons/inputs/selects at `rounded-lg` (10px) and cards/dialogs/imagery at `rounded-xl` (14px). Unchanged.
- **Do** reserve red (`oklch(0.577 0.245 27.325)`) strictly for error/stock-outage signals — outside the two-accent brand hierarchy entirely.

### Don't:
- **Don't** put both accents on the same element — a button, badge, or price plate picks one hue, never both.
- **Don't** use lime as a text color anywhere, or as a large fill anywhere — both are explicit, hard limits from the brand's own logo usage.
- **Don't** use lime for focus rings, primary buttons, the wordmark, or the detail-page price plate — those are teal's exclusive territory.
- **Don't** use literal `#000` as a fill or text color; use the `ink` token, and reserve raw black only for translucent image scrims (`black/50`–`black/60`). Unchanged.
- **Don't** extend the CTA's resting shadow to other buttons, cards, or panels — it is a named, singular exception.
- **Don't** set body copy in Geist Sans or a heading in system-ui — the two-voice pairing only works if each voice stays in its lane. Unaffected by the color migration.
- **Don't** add a third instance of the Angled Corner motif, or a second ambient-wash surface, without a real layout problem it solves.
- **Don't** push the Court-Line texture opacity past 14%, or use it in either accent color, or apply it to the admin dashboard.
