# Design System — DreamHome

## Product Context
- **What this is:** A real estate marketplace where users buy, sell, or rent property.
- **Who it's for:** Buyers browsing listings, sellers submitting properties for admin approval, and admins moderating/reporting.
- **Space/industry:** Real estate / proptech, positioned as a modern startup rather than a traditional brokerage.
- **Project type:** Multi-page web app (plain HTML/CSS/JS frontend, Express + MongoDB backend).
- **Memorable thing:** Sharp, modern, premium-feeling — the kind of polish that signals the team behind it is competent, not a spreadsheet of listings bolted onto a login form.

## Aesthetic Direction
- **Direction:** Modern minimal proptech.
- **Decoration level:** Intentional — soft shadows, rounded corners, a floating glass-ish search bar on the hero; not fully expressive, not flat/brutalist.
- **Mood:** Clean, trustworthy, premium, but startup-fast rather than old-money luxury brokerage.
- **Reference research:** Zillow/Redfin/Compass category norms — full-bleed hero with prominent search, tab-style Buy/Rent/Sell switcher, filter rail + photo-first card grid, mobile-first. Compass in particular leans near-monochrome + photography; this system deliberately uses a blue/green SaaS-style palette instead, reading as "modern proptech" rather than "luxury brokerage" — a deliberate departure, not an oversight.

## Typography
- **Script/Identity:** Alex Brush, weight 400 — used for `h1` on every page (the "first moment" headline: hero, page-header, panel title) and the brand wordmark (`.logo`, `.auth-logo`, `.auth-logo-static`) everywhere it appears. Never used for body copy, labels, buttons, or nav links — a cursive script is illegible at UI sizes, so it's deliberately concentrated on large, singular moments rather than applied broadly.
- **Headings (H2/H3/H4):** Poppins, weight 700 — carries the "confident, bold" identity everywhere script would hurt legibility (card titles, section sub-headings, dense admin/dashboard panels).
- **Body/UI/Labels:** Manrope, weights 400 (body), 500-600 (UI labels/emphasis), up to 800 available for stat numbers.
- **Data/Prices:** Manrope with `font-variant-numeric: tabular-nums`.
- **Loading:** Self-hosted — fetch Google Fonts' woff2 files (Alex Brush 400, Poppins 600/700, Manrope variable 400-800) and self-host under `/fonts`. Do not rely on a live Google Fonts `<link>` at runtime.
- **Scale:** h1 (script) 38-64px · H2 22-30px · H3 19px · H4 16px · body 15-16px · UI label/caption 12-13px.

## Color
- **Approach:** Warm luxury — gold/terracotta primary against a deep warm charcoal, green reserved strictly for semantic "success/available" state. Replaces the earlier blue/white proptech palette by explicit request (2026-08-08).
- **Primary:** `#B8863B` (amber-gold) — buttons, links, focus rings, primary CTAs. Hover/ink: `#96692A`.
- **Secondary:** `#221B15` (deep warm charcoal) — dashboard sidebar, admin nav, any "dark UI" surface, auth illustration panels.
- **Background:** `#FBF7F1` (warm cream) — page canvas.
- **Surface/Cards:** `#FFFFFF` — cards, inputs, modals.
- **Accent:** `#3F7D4E` (forest green) — success/available status only, never decorative.
- **Text:** `#2B241E` primary text, `#8A7A6B` muted text.
- **Semantic (separate from accent):** warning `#C2410C` (burnt orange, pending), danger `#A8291F` (deep brick red, errors/rejected), reuse accent green for "available/approved". Chosen to stay hue-distinct from the gold primary despite the overall warm palette.
- **Borders:** `#E8DFD1`.
- **Dark mode:** Not implemented for the product itself (out of scope for this pass) — the product is light-mode-first per the approved design.

## Spacing
- **Base unit:** 8px.
- **Density:** Comfortable — large whitespace per the brief, not compact.
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64).

## Layout
- **Approach:** Hybrid — creative-editorial full-bleed hero on the homepage; grid-disciplined filter+card layout for listings, dashboard, and admin (data density matters there).
- **Grid:** Listing/property cards: 3 columns desktop, 2 tablet, 1 mobile.
- **Max content width:** ~1080-1200px for content sections.
- **Border radius:** sm 8px (inputs, small controls) · md/default 14px (cards, buttons use pill/999px) · lg 18px (hero panels, modals).
- **Shadows:** Soft resting shadow `0 4px 16px rgba(43,36,30,.07), 0 1px 3px rgba(43,36,30,.09)`; lifted/hover shadow `0 16px 32px rgba(43,36,30,.16), 0 4px 10px rgba(43,36,30,.10)`.

## Motion
- **Approach:** Noticeably lively (updated 2026-08-08, was "intentional, not expressive") — buttons and cards use a spring easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`) with a visible lift + scale on hover, a shine-sweep across buttons, nav links get an animated underline, sidebar items nudge sideways, stat-card icons pop and rotate. Still no scroll-driven choreography — the energy lives in hover/interaction feedback, not ambient motion.
- **Respect `prefers-reduced-motion`.**

## Components (shared library to build)
Buttons (primary/secondary/ghost, pill-shaped), status pills/badges (available=green, pending=amber, sold/rented=neutral gray — semantic colors, not the brand accent used decoratively), cards (property card, stat card), form inputs, alerts/inline messages, modals, simple pagination, a sidebar nav pattern (dashboard/admin), toast-style confirmation messages.

## Icons
Lucide icons (via CDN script or inline SVG), replacing the emoji currently used as icons/markers.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-05 | Initial design system created | User supplied a fully-specified brief (colors, fonts, page inventory) inspired by Zillow but distinct. Created by `/design-consultation`; light competitive research on Zillow/Redfin/Compass confirmed structural alignment with the category and validated the blue/green palette as a deliberate, positive departure from the category leader's monochrome-photo look. |
| 2026-08-05 | Scope: restyle + build core pages | User chose to restyle all existing working pages and add a real property-details page and a proper user dashboard (saved/my-listings/profile), using only data already in MongoDB — no social login, messaging, or external maps/places APIs. |
| 2026-08-05 | Inter + Poppins kept despite being common defaults | User explicitly named both fonts. Applied a small internal contrast by giving them distinct roles (Poppins display-only, Inter everything else) rather than treating them as interchangeable. |
| 2026-08-08 | Full re-skin: Alex Brush + Poppins Bold + Manrope, warm luxury palette, lively motion | User requested a new font combination (replacing Inter with Manrope, adding Alex Brush), a new color direction (moved off blue/white to warm gold/terracotta + deep charcoal after picking from 3 proposed directions), and more expressive hover/animation throughout. Alex Brush was scoped to `h1` + brand wordmark only, not body/UI text, after flagging that cursive script hurts legibility at small sizes — user accepted that compromise. |
