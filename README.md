# shahmeerasim.me

The personal site of Shahmeer Asim, a Senior Salesforce Developer. Next.js, deployed
on Vercel, live at [www.shahmeerasim.me](https://www.shahmeerasim.me).

## Working on it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # the content checks
npx tsc --noEmit   # types
npx eslint         # lint
```

Every word the site publishes lives in `content/site.ts`. The vocabulary is in
`CONTEXT.md`, and the confidentiality rules are in
`docs/adr/0001-no-client-names-screenshots-or-code.md`.

## Metadata, the Share Card and the icon

`content/site.ts` exports a `shareCard`: the live origin, the document title,
the description and the alt text for the share image. `app/layout.tsx` turns
it into the `<title>`, the description, the canonical link and the Open Graph
and Twitter tags. Two files beside the layout draw pictures from the same
content at build time, so nothing is hand-edited in an image editor:

- `app/opengraph-image.tsx`: the 1200×630 picture on a shared link. Next.js
  puts it on both the Open Graph and the Twitter card.
- `app/icon.tsx`: the browser-tab icon, Shahmeer's initials on the accent
  colour.

Both read their colours from `app/picture-colours.ts`, a copy of the tokens
in `app/globals.css` that the theme check holds equal to the stylesheet.

Check a deploy with `curl -s https://www.shahmeerasim.me | grep -E "og:|twitter:|canonical|icon"`.

## Analytics

Vercel Web Analytics, through `@vercel/analytics`, mounted once in
`app/layout.tsx`. It records nothing in development, and it records nothing in
production until Analytics is switched on for the project in the Vercel
dashboard (below).

## Continuous integration

`.github/workflows/checks.yml` runs the type check, the lint, the content
checks and a production build on every push and pull request. The forbidden
name list reaches it through a repository secret (below). Without the secret
the guard fails the run: never silently a pass.

## Going live

The code side is done in this repo. The steps below need Shahmeer's own hands
in three dashboards, because an agent has no login to any of them. They are
listed in the order they have to happen.

### 1. GitHub: the CI secret

Settings → Secrets and variables → Actions → New repository secret.

- Name: `FORBIDDEN_END_CLIENT_NAMES`
- Value: the end-client names, separated by commas or newlines.

Until this exists, every CI run fails at the confidentiality guard. That is
the intended behaviour.

### 2. Vercel: the project

1. vercel.com → Add New → Project → import `Shahhmeeer/me`. Framework preset:
   Next.js. Build command and output: leave the defaults, so `npm run build`
   runs the content checks before `next build`.
2. Project Settings → Environment Variables → add
   `FORBIDDEN_END_CLIENT_NAMES` with the same value as the GitHub secret,
   applied to Production, Preview and Development, marked Sensitive. Vercel
   reads it at build time, so the first deploy must come after this.
3. Project Settings → Analytics → Enable. `@vercel/analytics` sends nothing
   until this is on.
4. Deploy. The production branch is `main`.

### 3. The registrar and Vercel: the domain

1. Vercel Project Settings → Domains → add `www.shahmeerasim.me` and
   `shahmeerasim.me`, with the apex set to redirect to `www`. That is what
   makes the two resolve to one canonical site, and it is the one
   `shareCard.url` in `content/site.ts` names.
2. Vercel shows the DNS records it wants. At the registrar's DNS panel, set
   them: an `A` record on the apex pointing at Vercel's IP, and a `CNAME` on
   `www` pointing at `cname.vercel-dns.com`. (Copy the exact values from the
   Vercel page rather than from here; they are Vercel's to change.)
3. Wait for DNS to propagate. Vercel issues the HTTPS certificate on its own
   once it sees the records.

### 4. Check the live site

```bash
curl -sI https://www.shahmeerasim.me | head -1              # 200
curl -sI https://shahmeerasim.me | grep -i location         # → https://www.shahmeerasim.me/
curl -sI http://shahmeerasim.me | grep -i location          # → https://
curl -sI https://www.shahmeerasim.me/Shahmeer_Asim_Resume.pdf | grep -iE "^HTTP|content-type"
```

The last line should say `200` and `application/pdf`: the CV downloads. Then
paste the URL into a chat app or the [opengraph.xyz](https://www.opengraph.xyz)
checker and see the Share Card, not a blank preview.

## Content checks

`npm test` runs the content checks, and `npm run build` runs them first, so a
failed check blocks a deploy. All but the last three read the content module
only, and the Pictures check reads the files it names. None asserts anything
about class names or components, and none touches the network.

- **Confidentiality guard**: every string the site publishes is searched, case
  insensitively, for a forbidden end-client name. See
  `docs/adr/0001-no-client-names-screenshots-or-code.md`.
- **Case Study integrity**: a non-empty Result, and an ownership of solo or
  team where team names the collaborator.
- **Project integrity**: an absolute http or https link, and at least one Tech
  Tag.
- **Tech Tag integrity**: every Tech Tag anywhere in the content module carries
  a four-digit year.
- **History integrity**: every Experience and Education date is a month and a
  year, no date range runs backwards, no two roles claim the same months, and a
  Highlight stays one sentence.
- **Share Card**: the title names Shahmeer Asim and the Headline, the
  description and the image alt text are not blank, and the canonical URL is
  the bare https origin `https://www.shahmeerasim.me`.
- **Phone number**: nothing dialable is published anywhere. An address a
  stranger can email is an invitation; a number they can ring is not.
- **GitHub links**: the profile link opens one account over https and nothing
  deeper, and every other GitHub URL on the site is a repo under that account.
- **Pictures**: the sketch and each certification badge are files under
  `public`, on disk at the size the content claims, with alt text; the
  sketch's names Shahmeer and a badge's names its certification. A path is
  only a promise, and a badge renamed would otherwise ship as a broken image.
- **Theme**: reads `app/globals.css` and holds it to one colour scheme
  (ADR-0002) built from the five palette colours, measures every pair the page
  reads text in against WCAG AA and the teal hover border at 3:1, fails any
  `:hover` or `:focus-within` rule that moves what it styles, and holds the Nav
  to a backdrop blur over a translucent surface token. `--portfolio-border` is
  not measured: it draws a hairline around a card and a chip, where the words
  carry the meaning and the line is decoration. `--portfolio-accent-border` is
  teal for borders and shapes only, because teal fails AA as text. It also
  holds the Strip to native snap scroll and to one screen tall on a large
  display, so the document never scrolls up and down (ADR-0003), a card to a
  fixed width on the Strip, so a row of cards grows its Panel sideways and
  never down, the Blobs to a keyframe that moves by translate only over
  twenty to forty seconds and takes no pointer, and every transition,
  animation and smooth scroll to a `prefers-reduced-motion: no-preference`
  block, so a visitor who has asked for less movement never has to be given
  a reduce rule that someone forgot.
  It reads tokens and rules rather than markup, so rewriting the layout
  cannot break it.
- **Rendered page**: renders the home page to static HTML, as a browser first
  receives it, and reads that: five Panels by id in order, each labelled by
  its heading, in one focusable `<main>`; a labelled Nav with one anchor per
  Panel and the "Get in touch" button; no footer; the Headline as the one h1
  and no heading skipping a level; Home reading greeting, Headline, pitch,
  button, profile links, then About, with the sketch and the three badges as
  the only pictures, each with alt text; each Panel beyond Home reading its
  heading and then its one line before anything else, and drawing two or
  more Blobs no other Panel draws; Work keeping the Case Study note, a
  Result label per Case Study and every Tech Tag; Contact ending on the
  copyright line. It reads landmarks, ids, headings, alt text and the inline
  style a Blob is placed by, never class names, so a restyle cannot break it
  and a dropped Panel cannot pass it.
- **Blob**: renders the shared Blob on its own and reads that it is hidden
  from a screen reader, carries no text, and draws each shape asked for in
  the colour and place asked for.

### The forbidden-name list

This repo is public, so the list of end-client names is never committed. Supply it
one of two ways:

- **CI and deploys**: set the `FORBIDDEN_END_CLIENT_NAMES` environment variable.
  Separate names with commas or newlines. In Vercel this is Project Settings →
  Environment Variables, applied to Production, Preview and Development, and
  marked Sensitive. A deploy after that must be a fresh build, because Vercel
  reads the variable at build time.
- **Locally**: copy `.forbidden-end-client-names.example` to
  `.forbidden-end-client-names`, which is gitignored.

With no list the guard cannot run. It fails the build in CI and prints a
warning locally. It is never silently a pass.
