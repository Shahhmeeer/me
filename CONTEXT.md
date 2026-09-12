# Portfolio

The personal site of Shahmeer Asim. Its job is to make a stranger believe he can
do the work, and then contact him.

## Language

### People who visit

**Recruiter**:
A hiring person who skims for role, stack, and fit. The primary visitor: the
site is written for them first.
_Avoid_: HR, hiring manager

**Engineer**:
A technical reader who checks whether the work is real. The secondary visitor.
_Avoid_: dev, tech lead

**Client**:
A person who would pay for freelance work. The third visitor.
_Avoid_: customer, buyer

### What is shown

**Headline**:
The line at the top of the home page that states who Shahmeer is. Currently
"Senior Salesforce Developer". One line, one identity.
_Avoid_: tagline, bio, hero text

**Case Study**:
One piece of past work, written as problem, what Shahmeer did, and result. It
has no link to click, because the work lives inside a client's private system.
_Avoid_: project, portfolio item, work sample

**Project**:
A thing Shahmeer built that a visitor can open: a live URL or a public repo.
A Case Study is not a Project, because a Case Study has nothing to click.
_Avoid_: app, demo, side project

**Result**:
The outcome line of a Case Study. States what changed for the business, not
what was built.
_Avoid_: impact, outcome, achievement

**Role**:
One job in the Experience block: an employer, a title, a location, whether it
was worked remotely, and its dates. Typed as `ExperienceEntry`, because a
Recruiter reads the block as a history rather than as a list of titles.
_Avoid_: position, posting, stint

**Highlight**:
A one-line piece of past work inside the Experience block. It is work that was
real but did not earn a full Case Study. A Highlight always hangs off the Role
it was built for, because credit given to the wrong employer is a lie.
_Avoid_: bullet, minor project

**Education**:
The degree, with the dates it ran. It is not a Role, so it is not an
`ExperienceEntry`, but a Recruiter checking for gaps reads the two together.
_Avoid_: academic background, schooling

**Skill**:
Something Shahmeer does. A verb, not a product: "third-party integration",
"Experience Cloud portal development". Listed in its own block.
_Avoid_: technology, competency, expertise

**Tool**:
A product, language, or platform Shahmeer works with: Apex, Stripe, GitLab. A
Tool is not a Skill. Listed in its own block, because recruiters search for
these names.
_Avoid_: tech, stack, technology

**Share Card**:
What the site says about itself when a link to it is shared or indexed: the
live URL, a title naming Shahmeer and the Headline, a description, and one
picture. Read without the page, so it must stand for the site on its own.
_Avoid_: SEO, meta tags, OG image

**Tech Tag**:
A Tool named on one Case Study or Project card, with its year. It says "this was
used here, then". It is not a claim of present ability, so a Tech Tag does not
have to appear in the Tools block.
_Avoid_: stack, tag

Both the Skills block and the Tools block obey one rule: an item goes there only
if Shahmeer would be happy to be questioned on it in an interview today.
Everything else stays a Tech Tag.

### How it is laid out

**Panel**:
One screen of the site on a large display. Panels sit side by side, and the
visitor slides from one to the next. On a small display they stack top to
bottom instead. There are five: Home, Work, Skills, Experience, Contact.
_Avoid_: page, section, screen, slide

**Strip**:
The row the five Panels sit in on a large display, one screen tall, that the
visitor slides sideways. On a small display the same Panels stack instead and
there is no Strip.
_Avoid_: carousel, slider, track, horizontal page

**Nav**:
The frosted pill that floats at the top of every Panel. It holds one link per
Panel and the "Get in touch" button. Clicking a link slides to that Panel; the
link for the Panel on screen is lit.
_Avoid_: header, nav header, dock, menu, navbar

**Blob**:
A soft, slowly moving colour shape behind a Panel, drawn in the palette
colours. It is decoration and carries no information, so a visitor who asks
for less motion sees it still.
_Avoid_: gradient, background, glow
