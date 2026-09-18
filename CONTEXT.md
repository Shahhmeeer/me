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

**CV**:
The PDF a visitor downloads from Contact or Home: every Role and every piece of
work, in one document. The site shows the best of the work; the CV has all of
it, and the two never disagree on an employer, a title or a date.
_Avoid_: resume, résumé

**Profile**:
An account of Shahmeer's on another site that a visitor opens to check him:
LinkedIn, GitHub, Trailhead. Offered on Home and again on Contact, with the CV
beside them; the CV is not a Profile, because it is his own document and not
an account.
_Avoid_: social, socials, account, external link

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
One of the five places a Nav link goes: Home, Work, Skills, Experience,
Contact. Each has a heading and a line under it. On a large display a Panel
is made of one or more Spreads, side by side; on a small display a Panel
stacks its content top to bottom and there are no Spreads.
_Avoid_: page, section, screen, slide, chapter

**Spread**:
One screen-wide stop on the Strip, inside a Panel: the eyebrow naming the
Panel, one thing shown large, and a card, or a few, holding its detail. A
visitor slides from one Spread to the next. A Panel with little to say is one
Spread; Home has the Hero and then the certifications; Work has one per Case
Study and one per four Projects; Experience has one per Role.
A Spread carries an id a link can land on, its Case Study's, its Role's or
the Projects'; the address a visitor copies names the Panel, never the Spread.
A Spread exists only on a large display: on a small one the Panel stacks.
_Avoid_: screen, slide, page, frame, step

**Hero**:
Home's first Spread: the greeting, the Headline, the pitch, the button, the
Profiles and the About sentences, with the portrait rising out of the Disc
beside them. It is the one Spread with no card, so it lays itself out, and
the one the page opens on.
_Avoid_: hero section, landing, above the fold, intro

**Strip**:
The row the Spreads of the five Panels sit in on a large display, one screen
tall, that the visitor slides sideways, one Spread at a time. On a small
display the Panels stack instead and there is no Strip.
_Avoid_: carousel, slider, track, horizontal page

**Nav**:
The frosted pill that floats at the top of every Panel. It holds one link per
Panel and the "Get in touch" button, which goes to Contact, where the Form and
the email address both are. Clicking a link slides to that Panel; the link for
the Panel on screen is lit.
_Avoid_: header, nav header, dock, menu, navbar

**Blob**:
A slowly moving colour shape behind a Panel, drawn in the palette colours,
soft as a wash except for the Disc. It is decoration and carries no
information, so a visitor who asks for less motion sees it still.
_Avoid_: gradient, background, glow

**Disc**:
The one Blob drawn crisp: the teal circle behind the portrait on Home, its
top edge crossing the hair so the head rises out of it. It drifts as every
Blob does, a shorter way, and is still under less motion like the rest.
_Avoid_: circle, badge, avatar ring

### How a visitor writes

**Form**:
The three boxes on Contact, Name, Email and Message, with a Send button,
that reach Shahmeer from any machine, a locked-down laptop with no mail
client included. It is the second way to write; the email address beside it
is the first.
_Avoid_: enquiry form, contact widget, message form

**Message**:
What a visitor sends through the Form: their name, an address to answer at,
and what they wrote. The box labelled Message holds only the words; the
Message is all three, and it is either sent to Shahmeer or the visitor is
told it was not, with the email address, so they still have a way.
_Avoid_: submission, enquiry, entry, post

**Honeypot**:
A fourth box on the Form that no human ever sees, so anything in it was put
there by a bot. A Message that filled it is told it was sent and goes
nowhere, so the bot learns nothing.
_Avoid_: spam trap, hidden field, decoy

**Token**:
The proof, issued by Cloudflare Turnstile, that a person and not a script
filled the Form, posted with the Message and checked before it is sent. A
Message with no Token came without JavaScript or from a script, and either
way is answered with the email address rather than sent.
_Avoid_: captcha, challenge, verification code

**Mail**:
A Message as it reaches Shahmeer's inbox: from the site's own address, to
his, with the visitor's address as Reply-To, so it is not filed as spam and
his answer is one click. It is the Message's delivery, not a second thing
the visitor wrote.
_Avoid_: email, notification, alert
