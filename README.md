This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Content checks

`npm test` runs the content checks, and `npm run build` runs them first, so a
failed check blocks a deploy. The checks read the content module only. They
assert nothing about markup, class names or components, and they never touch
the network.

- **Confidentiality guard**: every string the site publishes is searched, case
  insensitively, for a forbidden end-client name. See
  `docs/adr/0001-no-client-names-screenshots-or-code.md`.
- **Case Study integrity**: a non-empty Result, and an ownership of solo or
  team where team names the collaborator.
- **Project integrity**: an absolute http or https link, and at least one Tech
  Tag. Every Tech Tag carries a four-digit year.

### The forbidden-name list

This repo is public, so the list of client names is never committed. Supply it
one of two ways:

- **CI and deploys**: set the `FORBIDDEN_CLIENT_NAMES` environment variable.
  Separate names with commas or newlines.
- **Locally**: copy `.forbidden-client-names.example` to
  `.forbidden-client-names`, which is gitignored.

With no list the guard cannot run. It fails the build in CI and prints a
warning locally. It is never silently a pass.
