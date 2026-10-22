[Español](TECHNICAL.md) | [English](TECHNICAL.en.md)

# Technical notes: not a deployment

First [use the public site](../README.en.md). This checkout contains HTML, CSS, JavaScript and resources; `package.json` provides `npm start`, `npm run dev` (both invoke `serve .`) and `npm test` (`node scripts/verify-vendor-sha256.mjs`). `serve` must be available in your environment; no dependency was installed or changed here. The test checks vendor hashes, not full functionality.

The previous README mentions private v2 source, a `site/` build, GitHub Pages and Cloudflare; it also retains Vercel notes. The private repository was not accessed and that publication chain was not verified. Confirm checkout, revision and responsible owner before changing hosting. Do not push, roll back or deploy as part of this guide. No product code, runtime assets, tests, workflows or packages were modified.

See `../reports/docs-brandkit-verification.json` for the baseline and byte verification. Older logs, audits and brand guidance are retained as records; for the current documentation canon use [this guide](REPOSITORY-DOCUMENTATION.en.md) and the [official brandkit](https://brandkit.jorgesuarez.com.mx/).
