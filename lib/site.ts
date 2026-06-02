// Single source of truth for the canonical origin + site identity.
// Canonical host is the apex (alexng.dev). If you switch back to www, change
// SITE_URL here and set Vercel's primary domain to match (with a *permanent*
// redirect from the other host).
export const SITE_URL = "https://alexng.dev";

export const SITE = {
  name: "Alexander Ng",
  title: "Alexander Ng",
  description:
    "Alexander Ng — founding software engineer at Futurity, based in Vancouver. Full-stack TypeScript/React/Next, with Rust side projects. Writing about code and building things.",
  author: "Alexander Ng",
  locale: "en_CA",
} as const;
