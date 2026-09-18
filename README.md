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
`CONTEXT.md`, the decisions are in `docs/adr/`, and the confidentiality rules
are in `docs/adr/0001-no-client-names-screenshots-or-code.md`. The mock-ups
the layout was designed from are in `docs/references/`, outside `public`, so
the site never serves them.

## The layout

One page, five Panels under the Nav: Home, Work, Skills, Experience and
Contact, each a `<section>` with the id the Nav links to. On a laptop, at
least 1280px wide, landscape and driven by a mouse or a trackpad, the Panels
sit side by side on the Strip, a screen-tall row that scrolls sideways, and
each Panel beyond Home is one or more Spreads: one screen wide and tall, a
snap point, with the eyebrow, the Panel's line and the item's title on the
left and the card on the right. Work is one Spread per Case Study and then
one per four Projects; Experience is one per Role with the degree under the
last; Skills and Contact are one each; Home is one screen wide and lays
itself out. A Panel with more to show than fits a screen gets more Spreads,
never a wider one, so a wheel roll, an arrow key or a Nav link always lands
on something whole. How a Panel splits is read off the content arrays at
render time, so a Case Study or a Role added to `content/site.ts` gets its
Spread without any layout being written. On a phone, a tablet held either
way or a narrow window the Panels stack and the Spreads stack inside them.
The vocabulary is in `CONTEXT.md` and the decision is ADR-0003.

## Metadata, the Share Card and the icon

`content/site.ts` exports a `shareCard`: the live origin, the document title,
the description and the alt text for the share image. `app/layout.tsx` turns
it into the `<title>`, the description, the canonical link and the Open Graph
and Twitter tags. Two files beside the layout draw pictures from the same
content at build time, so nothing is hand-edited in an image editor:

- `app/opengraph-image.tsx`: the 1200×630 picture on a shared link, the name,
  the Headline and the pitch beside the pencil sketch from `public`. Next.js
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

## The contact form

The Form on Contact posts to `app/api/contact`, which verifies a Cloudflare
Turnstile Token, drops anything that filled the honeypot or overran the
length limits, rate-limits by IP, and sends the Message with Resend
(ADR-0004). It needs three environment variables, set in Vercel and never in
the repo:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: the widget's public key, inlined into the
  page at build time. Without it the widget is not drawn and Send is never
  blocked for a Token.
- `TURNSTILE_SECRET_KEY`: what the route verifies a Token with.
- `RESEND_API_KEY`: a key scoped to `shahmeerasim.me`, what the route sends with.

Without the secrets the route answers every post naming the email address and
sends nothing; without the site key the script's post carries no Token and is
answered the same way. A preview with no keys is honest rather than broken. For
a local run, Cloudflare's test keys render a widget that always passes: site
key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.

`.env.example` lists the three names with no values; `.env.local`, which git
ignores, holds them for a local run. Creating the keys and setting them is
walked through by `docs/agents/keys-wizard.sh` (below), and the Environment
check holds the two files and this section to the names the code reads.

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

### 4. The contact form's keys

```bash
bash docs/agents/keys-wizard.sh
```

The wizard walks through, in order, with a check after each: a Resend API
key with sending access only, pinned to `shahmeerasim.me` and never the
agency's, refused unless Resend's own answers prove the pin; the domain,
already verified in Resend, confirmed by one message to the Gmail inbox; a
Turnstile widget in managed mode for `shahmeerasim.me`, `localhost` and the
Vercel preview hostname, its secret confirmed at siteverify and its site key
confirmed drawn by the local dev server; the three variables set in Vercel
for Production and Preview through the Vercel CLI, the two secrets marked
sensitive, and read back by name after; a fresh
production build carrying the site key, with the live route probed for its
secrets; and one Message through the Form on the live site, read in the
inbox. It writes the same three to `.env.local`, skips any stage whose check
already passes, and removes nothing, so it can be run again after a key is
rotated.

### 5. Check the live site

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
failed check blocks a deploy. All but the last ten read the content module
only, and the Pictures and Environment checks read the files they name. None
asserts anything about class names or components, and none touches the
network.

- **Confidentiality guard**: every string the site publishes is searched, case
  insensitively, for a forbidden end-client name. See
  `docs/adr/0001-no-client-names-screenshots-or-code.md`.
- **Case Study integrity**: an id of lower-case letters, digits and hyphens,
  because it is the Case Study's Spread's element id and so its address; a
  non-empty Result; and an ownership of solo or team where team names the
  collaborator.
- **Project integrity**: an id of the same shape, an absolute http or https
  link, and at least one Tech Tag.
- **Tech Tag integrity**: every Tech Tag anywhere in the content module carries
  a four-digit year.
- **History integrity**: every Role's id is of the same shape, because it is
  the Role's Spread's element id and so its address; every Experience and
  Education date is a month and a year, no date range runs backwards, no two
  roles claim the same months, and a Highlight stays one sentence.
- **Share Card**: the title names Shahmeer Asim and the Headline, the
  description and the image alt text are not blank, and the canonical URL is
  the bare https origin `https://www.shahmeerasim.me`.
- **Phone number**: nothing dialable is published anywhere. An address a
  stranger can email is an invitation; a number they can ring is not.
- **GitHub links**: the profile link opens one account over https and nothing
  deeper, and every other GitHub URL on the site is a repo under that account.
- **Contact form**: every label, placeholder and line is said, the form
  posts to a path on this site, its four fields, the honeypot included,
  post under four distinct names the route can read, the failure line names
  the email address, and the success line promises a reply within a day.
- **Pictures**: the sketch, its cutout and each certification badge are files
  under `public`, on disk at the size the content claims, with alt text; the
  sketch's and the cutout's name Shahmeer and a badge's names its
  certification. The cutout is a PNG with an alpha channel at the sketch's
  size, under a lower-case hyphenated name. A path is only a promise, and a
  badge renamed would otherwise ship as a broken image.
- **Theme**: reads `app/globals.css` and holds it to one colour scheme
  (ADR-0002) built from the five palette colours, measures every pair the page
  reads text in against WCAG AA and the teal hover border at 3:1, fails any
  `:hover` or `:focus-within` rule that moves what it styles, and holds the Nav
  to a backdrop blur over a translucent surface token. `--portfolio-border` is
  not measured: it draws a hairline around a card and a chip, where the words
  carry the meaning and the line is decoration. `--portfolio-accent-border` is
  teal for borders and shapes only, because teal fails AA as text. It also
  holds the `large` variant, the one place that says which display gets the
  Strip, to at least 1280px wide, landscape and a fine pointer, a mouse or a
  trackpad, so a laptop slides and a phone, a tablet held either way and a
  narrow window stack (ADR-0003), and lets no other rule ask about the
  display; the Strip to native snap scroll, snapped to a Spread, and to one
  screen tall on that display, so the document never scrolls up and down; a
  Spread to exactly one screen wide and tall on it, so a wheel roll lands on
  something whole; a card to no width of its own on the Strip, so it fills
  its Spread's column and never grows a Panel sideways; the
  Blobs to a keyframe that moves by translate only, three stops from rest
  along a path that bends once to 14vw by 10vh in a 20 second cycle, and
  takes no pointer; a Blob to a 0.34 fade; the disc behind the portrait to a
  Blob drawn crisp, no blur and no fade, that goes part of the way along the
  same path; and every transition,
  animation and smooth scroll to a `prefers-reduced-motion: no-preference`
  block, so a visitor who has asked for less movement never has to be given
  a reduce rule that someone forgot.
  It reads tokens and rules rather than markup, so rewriting the layout
  cannot break it.
- **Rendered page**: renders the home page to static HTML, as a browser first
  receives it, and reads that: five Panels by id in order, each labelled by
  its heading, in one focusable `<main>`; a labelled Nav listing one anchor
  per Panel and carrying the "Get in touch" button, linked to Contact and
  nothing in it linked by `mailto:`; Home and Contact each linking the email
  address by `mailto:`; no footer; the Headline as the one h1
  and no heading skipping a level; Home reading greeting, Headline, pitch,
  button, profile links, then About, with the cutout of the sketch and the
  three badges as the only pictures, each with alt text, the paper sketch
  drawn nowhere, and a teal Blob drawn just before the cutout, behind it;
  each Panel beyond Home reading its
  heading and then its one line before anything else, and drawing two or
  more Blobs no other Panel draws; Work reading one eyebrow per Case Study
  and one per four Projects, `Work · 01 / 04` through `04 / 04`, with the
  Panel's one h2 in the first and the outline Work, Case Studies, each
  title, Projects, each name, and every Project card on the last Spread;
  each Case Study's id and the Projects id on one Spread each inside Work,
  so a link to `#payment-gateway-integrations` lands on that Spread, and
  every id on the page written once; a
  Panel of one Spread carrying no counter; Work keeping the Case Study note,
  a Result label per Case Study and every Tech Tag; Skills reading its label,
  its line, the Skills heading, every Skill, the Tools heading and every
  Tool, in that order; Experience reading one eyebrow per Role,
  `Experience · 01 / 03` through `03 / 03`, each Role's id on its own Spread
  so `#scaleable-solutions` lands on it, each Role's Highlights inside that
  Role's Spread and nowhere else, and the degree after the last Role's
  Highlights and before Contact; Contact reading its label, its line, the
  email address as a linked heading, each Profile and the CV, and the
  copyright line last, with nothing below it; Contact posting one form to
  the route's path with three labelled, required fields, the email typed
  `email`, and a Send button, and a honeypot hidden from a screen reader,
  the Tab key and autofill; and neither the success nor the failure line
  at first paint. It reads landmarks, ids, headings, form attributes, alt
  text and the inline style a Blob is placed by, never class names, so a
  restyle cannot break it and a dropped Panel cannot pass it.
- **Work Panel**: renders the Work Panel handed five Projects and reads that
  they become two Projects Spreads, four cards and then one, that every
  eyebrow counts the second, that the second says "Projects" again but
  not as a heading, with the note on the first only, and that the Projects
  id is written on the first Spread and not the second.
- **Blob**: renders the shared Blob on its own and reads that it is hidden
  from a screen reader, carries no text, and draws each shape asked for in
  the colour and place asked for; and the Disc on its own, one shape with no
  field around it, hidden the same way, in its colour and place and first in
  its cycle.
- **Spread**: renders one Spread on its own and reads that it opens on its
  eyebrow and then says line, title and card; that the counter is `NN / NN`,
  padded to two digits, and absent on a Panel of one Spread; that only the
  first Spread of a Panel carries the Panel's h2, so the outline stays one
  h2 per Panel however many Spreads it has; that a Spread continuing the
  one before it says its title again as plain text and not a heading; that
  what a Spread is handed to go under its title is read there, before the
  card, and what it is handed as its foot is read last, after it; and that
  a Spread carries the id it is given as its element id, and none when
  given none.
- **Strip**: hands the Strip's key guard what it reads off the focused
  element and reads that ← and → are left to an input, a textarea and
  anything contenteditable, where they move the caret, and taken from a
  button, a link, the Strip itself and nothing focused, where they move the
  Strip.
- **Form**: renders the Form on its own, with a Turnstile site key and
  without, and reads that its one live region is polite, focusable and
  empty at first paint; that it says nothing of sending, success, failure
  or a refused field; that Send is enabled and no box marked invalid, key
  or no key, because a browser with no script must still post; and that
  the widget's box is inside the form, right before Send, only when there
  is a key.
- **Sending**: hands the Form's script a fake route and reads that it posts
  the fields as JSON to the Form's path, and that the route's answers come
  back as sent, one refused field, or failed.
- **Contact route**: calls the handler with a `Request` and fakes for the
  verifier, the sender and the clock, and reads that a good Message is
  sent once from the site's domain with the visitor as Reply-To; that each
  limit refuses naming its field; that the honeypot, a body it cannot
  read, a sixth Message in ten minutes, a missing key, a failing or missing
  Token and a sender that throws each send nothing and answer as
  documented; that a form post with no Token gets the HTML page naming the
  address; and, with `fetch` faked, that the route as it runs posts the
  secret, the Token and the IP to siteverify and sends only once it passes.
- **Environment**: reads the names the route and the page read from
  `process.env`, and holds them to three; holds `.env.example` to those
  names and no other, each with no value, because it is committed; reads
  `.gitignore` as git does and holds `.env.local` ignored and `.env.example`
  not; holds this
  README to naming the three and the wizard; and holds the wizard to living
  with the agent docs, naming the three, and parsing under `bash -n`, so a
  broken wizard cannot ship.

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
