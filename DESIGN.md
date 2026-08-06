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
- **Display/Hero:** Poppins, weight 700 — geometric, confident at large sizes.
- **Headings (H2/H3):** Poppins, weight 600.
- **Body/UI/Labels:** Inter, weights 400 (body), 500 (UI labels), 600 (emphasis, tabular data).
- **Data/Prices:** Inter with `font-variant-numeric: tabular-nums`.
- **Loading:** Self-hosted — fetch Google Fonts' woff2 files (Poppins 600/700, Inter variable 400-600) and inline as `@font-face` `data:` URIs, or self-host the files under a `/fonts` static path. Do not rely on a live Google Fonts `<link>` at runtime.
- **Scale:** Hero/display 34-40px · H2 22-24px · H3 16-18px · body 15-16px · UI label/caption 12-13px.

## Color
- **Approach:** Restrained — one primary action color, one dark UI surface, green reserved strictly for semantic "success/available" state.
- **Primary:** `#006AFF` — buttons, links, focus rings, primary CTAs.
- **Secondary:** `#0F172A` — dashboard sidebar, admin nav, any "dark UI" surface.
- **Background:** `#F8FAFC` — page canvas.
- **Surface/Cards:** `#FFFFFF` — cards, inputs, modals.
- **Accent:** `#22C55E` — success/available status only, never decorative.
- **Text:** `#1F2937` primary text, `#5B6472` muted text.
- **Semantic (separate from accent):** warning `#F59E0B` (pending), danger `#EF4444` (errors/rejected), reuse accent green for "available/approved".
- **Borders:** `#E4E9F0`.
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
- **Shadows:** Soft resting shadow `0 4px 16px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.08)`; lifted/hover shadow `0 12px 28px rgba(15,23,42,.12), 0 2px 6px rgba(15,23,42,.08)`.

## Motion
- **Approach:** Intentional, not expressive — hover lift on cards/buttons (translateY(-1px) + shadow), smooth transitions (~120ms), sticky navbar, skeleton loading states while data fetches. No heavy scroll-driven choreography — this should read as professional, not gimmicky.
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
