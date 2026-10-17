# Evermark

**Live website:** [Open Evermark](https://evermark-website-phi.vercel.app/)

A brand-protection website and saved review workspace. Five pages cover brand brief preparation, review links, an interactive identity studio and searchable questions. Local fonts, imagery, WebGL geometry and reduced-motion support are included.

## Development

Use Node 22.13 or newer. Run `npm install`, `npm run dev`, `npm run check` and `npm test`. `npm run build` first generates the complete HTML documents from `src/pages/` and `src/partials/`, then builds the Worker. Styles, browser scripts and media live in `public/`.

## Vercel hosting

Import the repository with its included `vercel.json`. `node scripts/build-vercel.mjs` generates the five pages, copies local media into `site-output/`, and adds an account-availability page. No package installation is needed for the static build.

The Vercel site supports page navigation, motion, the identity studio and searchable questions. Sign-in, saved briefs, saved review links and access-request storage require the configured backend described below and are unavailable on this deployment. Account endpoints report that availability without accepting or claiming to save customer records.

## Database and identity

Create a Cloudflare D1 database, put its ID in `vite.config.ts`, and apply `drizzle/0000_dusty_donald_blake.sql` to it. Copy `.dev.vars.example` to `.dev.vars` for local settings, and configure equivalent runtime values in production.

Protect the application with Cloudflare Access and configure its team hostname and application audience as `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD`. The Worker verifies the Access JWT signature, issuer, audience and expiry before setting the internal workspace identity. Caller-supplied identity headers are discarded. Sign-in and sign-out use Access; no demo accounts or production secrets are included. Without configured identity, workspace operations require sign-in and cannot save records.

Set `SITE_URL` to the production origin when building page metadata. Build with `npm run build`; deploy with `npm run deploy`. The full account-backed app needs Workers, D1 and Access; the Vercel build serves the public website separately.

## Service scope

Brand briefs, review links and access requests belong to the authenticated user. Official trademark filing, marketplace monitoring and legal-notice delivery require external providers and are not connected. The interface states these limits at the relevant actions.

Fonts and included vendor CSS retain their licence files. Brand artwork is included in `public/assets/`.
