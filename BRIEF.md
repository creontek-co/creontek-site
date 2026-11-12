# CreonTek Website — Build Prompt

> Paste this whole document into Claude Code (or save it as `BRIEF.md` in the repo and tell Claude Code to follow it). For Lovable, paste it in the four phases listed at the end, one at a time.

---

## 0. Your role

You are a senior creative developer and motion designer who builds award-level agency websites (Awwwards / FWA standard). Build the CreonTek website exactly as specified below. The feel is premium, cinematic and calm: dark obsidian sections that shutter open onto warm light sections, scroll-driven storytelling, sharp typography, and restrained motion where every animation has a purpose.

Do not use generic templates, stock illustrations, emoji, gradient blobs, or default component-library styling. Every section must feel custom-made.

---

## 1. The business

**CreonTek** builds technology that moves businesses forward. It runs two separate commercial offers under one umbrella brand. Prospects are sent directly to each offer's page, so each page must stand on its own.

1. **Studio:** premium digital experiences, engineered for business. Premium websites, web applications, and e-commerce. *"We don't build generic websites. We create digital experiences that communicate a brand's value, elevate its perception and turn visitors into customers."* It sells quality, creativity, craftsmanship and business value. Recurring revenue comes from a monthly care plan (hosting, maintenance, updates, ongoing development).
2. **Growth Engine:** *"We build AI Growth Systems that help businesses attract more customers, convert more opportunities, and grow revenue."* Every business has a different growth problem:
   - it can't find enough new customers;
   - it gets enquiries but struggles to convert them;
   - it loses potential customers because nobody follows up;
   - it spends too much time on repetitive sales and marketing work.

   CreonTek builds connected systems (AI agents, automations, CRM, follow-up sequences, lead generation, qualification, marketing automation) that fix the specific problem. *"We don't sell individual AI tools. We build interconnected systems that help businesses grow."* The pricing model is an implementation fee plus monthly management.

Future branches, **Academy** and **Labs**, appear only in the footer with a "Coming soon" badge.

- **Primary market:** United States, but the offers are open to any business.
- **Primary CTA everywhere:** book a strategy call at `https://calendly.com/abrahamosas/strategy-session`.
- **Domain:** creontek.co

---

## 2. Tech stack

**Claude Code:**
- Next.js (App Router) + TypeScript + Tailwind CSS.
- GSAP 3 with ScrollTrigger and SplitText (or a custom splitter) for scroll and text animation.
- Lenis for smooth scrolling, synced to the GSAP ticker.
- three.js (via React Three Fiber + drei, or plain three.js in a client component) for the 3D logo hero only. Use `SVGLoader` + `ExtrudeGeometry` on `/public/brand/creontek-logo-white.svg`.
- Deploy on Vercel.

**Lovable:** React + Vite + TypeScript + Tailwind, using the same GSAP, Lenis and R3F libraries.

**Rules:**
- Animate only `transform` and `opacity`. Never animate layout properties.
- Register every ScrollTrigger inside a `useLayoutEffect`/`useGSAP` context and clean it up on unmount.
- Respect `prefers-reduced-motion`: disable smooth scroll, pinning and scrubbing, and show every section in its final, fully drawn state.
- Desktop-first, fully responsive. Mobile keeps the story but simplifies the effects (see §9).

---

## 3. Brand system

### Colours (CSS variables)
| Token | Value | Use |
|---|---|---|
| `--obsidian` | `#0B0B0C` | Dark sections, hero, footer |
| `--paper` | `#EEECE7` | Light sections (warm off-white) |
| `--ink` | `#17181A` | Text on light, blueprint walls |
| `--graphite` | `#8C8A85` | Secondary text, construction lines, labels |
| `--white` | `#FFFFFF` | Text on dark |
| `--gallery` | `#F7F4EF` | Studio page background (warm gallery white) |
| `--blue` | `#2F5BFF` | **Accent only.** CTAs, blueprint "system" lines, active states, light in videos. Replace with the final brand hex. |

The blue must stay rare: only CTAs, active states and the "system" elements. Light sections use the drafting-paper grid: a 24px minor grid and a 120px major grid, drawn as 1px lines in blue at 4–9% opacity.

### Typography
- **Display and body:** Geist (Google Fonts), weights 300/400/500/600. Headlines use weight 500 with tight letter-spacing (−0.035 to −0.045em) and a line height of 0.94–1.0.
- **Labels:** Geist Mono, 10–11px, uppercase, letter-spacing 0.12–0.2em. Use it for eyebrows, stage labels, annotations, numbers, and "Sheet 02 · Rev 01"-style marks.
- **Studio only:** Instrument Serif (Google Fonts, regular and italic) for Studio display headlines. This is the only page that uses a serif, so it instantly feels different from the technical Growth Engine page. Everywhere else, Geist is the display face.
- **Type scale:** H1 `clamp(44px, 8.6vw, 128px)` · H2 `clamp(30px, 4.6vw, 68px)` · body 16–19px · labels 10–11px.

### Logo
- **Symbol:** `/public/brand/creontek-logo-white.svg` and `creontek-logo-black.svg` (plus PNG versions).
- **Full wordmark** (symbol + REONTEK): `/public/brand/creontek-wordmark-white.svg` and `creontek-wordmark-black.svg`. Use the wordmark in the nav (about 19px tall) and at the end of the preloader. Never type "CreonTek" as text where the logo belongs.
- **Symbol details:** The mark is a broken "C" ring with six slanted bars inside. The bars carry three tones: solid, 60% and 30% opacity. The SVGs use `currentColor`, so recolour them with CSS.

### UI details
- Pill buttons: 999px radius, 1px border, mono uppercase label. On hover, the pill fills with white or ink.
- The primary CTA button is a blue fill with an arrow icon. On hover it turns ink, and the arrow nudges 4px to the right.
- The fixed nav uses `mix-blend-mode: difference` so it reads on both dark and light sections. It holds the full wordmark SVG, then the links Studio · Growth Engine · Work · About, then a "Let's talk" pill.
- Custom cursor (desktop only): an 8px dot that grows into a 64px ring labelled "View" over project cards and "Drag" over horizontal galleries.
- Magnetic CTA buttons drift toward the cursor, up to 12px.

---

## 4. Motion and text system (use the same rules site-wide)

1. **Headlines:** line- and word-by-word mask reveal. Each word sits in an `overflow:hidden` wrapper and animates from `yPercent:110` to 0, with `expo.out` easing, a 0.8s duration and a 0.045s stagger.
2. **Labels and numbers:** scramble-decode. Random characters from `A–Z 0–9 / + ·` resolve left to right over 600–1100ms.
3. **Statements:** word-by-word brightening on scroll, from graphite to white (dark sections) or ink (light sections).
4. **Annotations:** written on stroke by stroke using `stroke-dashoffset`.
5. **Dimension lines:** extend outward, and their numbers count up.
6. **Section transitions from dark to light:** a "shutter" of 8 horizontal paper-coloured bars, each scaling from 0 to 1 on the Y axis with a stagger, scrubbed to scroll.
7. **Smooth scroll:** Lenis with `lerp: 0.09`.
8. **One signature moment per section.** Text must never compete with an animation.
9. **Preloader, "Assemble → Scatter"** (built from the logo's 8 SVG pieces: 2 ring halves and 6 bars). Show it on first visit per session (sessionStorage), and keep it to about 2.5s.
   - **Scattered:** on obsidian, the 8 pieces float at random positions (±520px x, ±340px y, ±140° rotation), in grey at 22% opacity. A mono counter sits bottom-left at `000`, with "Assembling" bottom-right.
   - **Assemble:** the counter is tied to real load progress (window `load` plus the 3D scene being ready; it never waits more than 3.2s). Pieces glide home in order with a `back.out(1.4)` overshoot: ring halves first, then bars light → mid → dark. Each piece turns from grey to white as it locks.
   - **Expand to the full logo:** the assembled symbol starts large (about 2.1×) at screen centre. Once it locks, it shrinks and glides left into the "C" position of the full wordmark (`expo.inOut`, 0.9s). The letters R-E-O-N-T-E-K rise in one by one beside it (opacity 0→1, y 40→0, `expo.out`, 0.05s stagger). Use the real wordmark letter shapes, never typed text.
   - **Lock:** a 1px blue line with a glow sweeps under the full logo, left to right.
   - **Scatter and reveal:**
     - The ring halves burst away from the centre, and the bars shoot out along their own slant, alternating left and right, while fading out. The letters scatter up and down with random rotation, from the centre outward.
     - At the same time, the obsidian screen splits along a diagonal matching the bar slant: the top half slides up and the bottom half slides down (`expo.inOut`, 0.9s), revealing the hero.
     - The 3D logo fades and scales in where the flat logo was, and the hero headline mask-reveals.
   - **Reduced motion:** skip straight to the hero.
   - The page locks scrolling until the preloader finishes. A "Replay intro" button sits in the footer.
10. **Door transition (home → Studio or Growth Engine), about 1.4s.** No door is ever drawn: the clicked card *becomes* the doors.
    - **0–0.15s:** the clicked card lifts (scale 1.02) and the other card fades out. The card then expands to fill the viewport (FLIP: measure its rect and animate it to full-screen with `expo.inOut`).
    - **0.15–0.9s, the doors open:** the card's visual is cloned into two halves (left and right `clip-path` halves of the same video or SVG). With `perspective: 1400px`, the left half rotates on its left edge to `rotateY(-105°)` and the right half on its right edge to `rotateY(105°)`, like a double swing door. Add a soft shadow inside each half as it turns, and a 1px light seam at the centre just before they part.
    - **0.3–1.2s, the camera moves in:** everything behind the doors (the home page) scales from 1 → 1.35 with a 0 → 6px blur, so it feels like walking forward through the opening.
    - **Through the gap:** the destination's background colour (`--paper` with the blueprint grid for Growth Engine, `--gallery` for Studio) is revealed and floods the screen.
    - **1.2s:** route change. The destination hero's intro animation starts immediately, with no white flash.
    - **Implementation:** a persistent `TransitionProvider` in the root layout intercepts clicks on the door links, plays the timeline on a fixed overlay, calls `router.push` at the midpoint, and fades the overlay once the new page signals it's ready. Use the View Transitions API where it's supported, but don't depend on it.
    - **Sound (if on):** a soft air whoosh and a low wooden "swing" thud. Going back, play a quick reverse version.
    - **Reduced motion:** a simple 300ms crossfade.

---

## 5. Sitemap

- `/` Home
- `/studio` Studio (outreach landing page)
- `/growth-engine` Growth Engine (outreach landing page)
- `/work` Work index, and `/work/[slug]` case studies
- `/about`
- `/contact`
- Footer: Academy (Coming soon), Labs (Coming soon), Privacy, Terms

---

## 6. Home page, scene by scene

**Scenes 1–3. The 3D logo hero (obsidian, one pinned section about 380vh tall, mobile about 300vh)**

The 3D logo is built in code from the logo SVG, with no 3D modelling software. Use three.js `SVGLoader` to parse the 8 pieces (2 ring halves and 6 bars). Extrude each piece separately with `ExtrudeGeometry`: depth 70 for the ring and 44 for the bars, with a small bevel (thickness 7, size 4, 5 segments, curveSegments 64). Centre each piece on its own pivot so it can move and spin independently.

- **Materials:**
  - Ring: polished graphite `MeshPhysicalMaterial` (colour `#4A4D55`, metalness 0.92, roughness 0.18, clearcoat 1).
  - Bars: brushed metal in the logo's three tones (`#F3F3F3`, `#A9A9AB`, `#5F6064`), with metalness 0.9 and roughness 0.26.
- **Lighting:** a `RoomEnvironment` reflection map, a white key light from the top-right, and a strong blue (`--blue`) rim light from behind-left plus a blue point light low-right. The blue should catch the bevels as the logo turns.
- **Idle:** the logo floats with a gentle bob, turns slowly on the Y axis (±0.22 rad), and tilts toward the cursor (±0.3 rad), with eased lerp.
- On desktop it sits to the right of the headline.

The scroll-driven timeline, with `p` as section progress from 0 to 1:
1. **p 0 → 0.24, Hero:**
   - Eyebrow (scramble): "Studio · Growth Engine".
   - H1 (mask reveal after the preloader): **"We build technology that moves businesses forward."**
   - Sub: "Exceptional digital experiences and AI growth systems for businesses that refuse to stand still."
   - Pills: "Explore Studio" and "Explore Growth Engine". Footer row: "Scroll" cue and "Est. 2026 · Lagos / London".
   - The hero text fades and drifts up as scrolling begins.
2. **p 0.2 → 0.58, Statement:** "Most businesses don't need more technology. They need technology that works as hard as they do." brightens word by word, from 16% to 100% opacity. The logo stays on the right, slowly turning.
3. **p 0.46 → 0.62:** the logo glides to centre screen.
4. **p 0.5 → 0.9, Break apart:** the logo breaks into its pieces.
   - The two ring halves fly away from the centre (up-right and down-left), pushing back in depth.
   - The six bars shoot outward along their slant, alternating left and right and spreading vertically. They come toward the camera and tumble on all axes.
   - The whole group scales up by 25%.
   - Use eased interpolation (lerp 0.12) so it feels weighty.
5. **p 0.62 → 0.95:** while the pieces fly, "Two offers · One standard" / **"Two ways we move businesses forward."** fades in at centre.
6. **p 0.8 → 0.95:** the pieces fade out, and the shutter wipe into paper begins, leading straight into the two doors.

Performance:
- Pause rendering when the canvas is off-screen (IntersectionObserver), and cap pixel ratio at 2.
- If WebGL is unavailable, show the flat white SVG logo in the same position.

**Scene 4. The two doors (paper)**

This section comes directly after the shutter, so the doors are what the broken logo "opens" onto.
- Heading: "Where do you want to start?" with a mono "Choose a door" label.
- Two tall cards side by side, about 74vh tall.
- Each card tilts slightly in 3D toward the cursor (±6°). The hovered card grows (`flex-grow` 1.35 vs 0.8) with a smooth 0.7s ease, and its arrow line extends.
  - **Studio card:** looping video V4 (frosted glass panels in a sunlit studio). Text: "Studio — Exceptional digital experiences, engineered for business." → `/studio`.
  - **Growth Engine card:** a small animated blueprint in SVG, *not video*. A floor plan draws itself, blue system lines connect the rooms, then the drawing erases and loops. Text: "Growth Engine — AI growth systems that attract, convert and grow." → `/growth-engine`.
- Clicking either card plays the **door transition** (§4.10).
- The full scroll-drawn blueprint does **not** appear on the homepage. It lives only on the Growth Engine page, and this looping card is its teaser.

**Scene 5. Marquee (paper)**
- Giant outline text scrolling horizontally: DESIGN · BUILD · AUTOMATE · GROW.
- The direction reverses with scroll direction, and speed responds to scroll velocity.

**Scene 6. Selected work (paper)**
- The left column is sticky, with the title "Selected work & explorations" and a "View all" link.
- The right side scrolls horizontally through 3–6 project cards. Each card has a muted, looping screen-recording preview, a title, the industry, a one-line result and an "Explore project" link.
- Each card carries a small tag saying which offer it came from (Studio or Growth Engine).
- Until real projects are added, use clearly labelled placeholder cards.

**Scene 7. Who we build for (obsidian)**
- A large list of industries, one per row in big type: Real estate · Home services · Hospitality · Professional services · Architecture & interiors · E-commerce brands.
- Hovering a row reveals an image that follows the cursor, mask-reveals the row's text to white, and shows one line on what CreonTek builds for that industry. For example, Home services: "Systems that answer every enquiry and fill the calendar."
- Rows are separated by thin rules, each with a mono row number.

**Scene 8. How we work (obsidian)**
- Three stacked cards (01 / 03 counter) that slide over each other as you scroll:
  - **Diagnose:** "We find where growth is being lost."
  - **Build:** "We design and engineer the system or experience."
  - **Operate:** "We run, monitor and improve it every month."

**Scene 9. Proof (paper)**
- Large client quotes that crossfade, each with the client's name, company and project.
- Use only real testimonials and real results. **Never invent numbers or quotes.** If none exist yet, hide this section with a feature flag.

**Scene 10. Closing CTA (obsidian)**
- Headline: "Ready to build what's next?" (mask reveal).
- A magnetic blue button labelled "Book a strategy call", plus a secondary "Send an enquiry" link.

**Footer (obsidian)**
- A giant CREONTEK wordmark built from a dot/character grid. Characters near the cursor scramble and light up blue.
- Columns: Studio, Growth Engine, Work, About, Contact. Then Academy and Labs, each with a "Coming soon" badge.
- Live local times for Lagos and London, social links, the email address and the sound toggle.

---

## 7. Growth Engine page (`/growth-engine`): "The Blueprint"

A working prototype (`creontek-site-prototype.html`) is the reference for the preloader, the 3D logo hero, the doors, and this page's **blueprint, problem tabs and title block**. In the prototype, those Growth Engine sections sit under the homepage only for testing. In the real build they live on `/growth-engine` only. The prototype's Growth Engine hero is outdated, so use the hero below instead.

This page must feel completely different from the homepage: no obsidian, no 3D logo, no ghosted logo. It lives entirely on drafting paper and feels technical, precise and engineered.

**Hero: "The Drafting Table" (paper with the blueprint grid, 100vh)**

The page arrives straight from the door transition onto paper.

**Intro sequence (about 2s, plays once):**
1. Thin graphite construction lines sweep across the sheet, horizontal and vertical, each drawn with stroke-dashoffset. They mark out the margins and a title area, like an architect setting up a drawing sheet.
2. The H1 **"We architect growth systems."** is drawn in, line by line, using the mask reveal, with each line snapping onto a construction line.
3. A blue dimension line extends along the width of the headline, with arrowheads at both ends, and its mono label counts up (for example "W 1,280"). A second dimension line measures its height.
4. Small mono annotations appear around the headline, written in with a scramble:
   - "SHEET 01 / 03"
   - "SCALE 1:1"
   - "DRAWN BY CREONTEK"
   - "REV 01"
   - a north-arrow-style mark
5. Sub-line (fades in): "AI-powered systems that help businesses attract more customers, convert more opportunities and grow revenue. Every business has a different growth problem, so every system starts with a blueprint."
6. CTAs: a blue "Book a strategy call" button, and a pill reading "See how it works ↓".

**CAD cursor (desktop only):**
- The cursor becomes a thin blue crosshair whose full-length horizontal and vertical lines span the hero.
- A small mono readout follows it with live X/Y coordinates relative to the sheet (for example "X 0482 · Y 0317").
- Over buttons, the crosshair snaps to the element's edges and the readout says "SELECT".

**Scroll:**
- The grid scales up slightly (1 → 1.15), as if leaning in over the table.
- The construction lines fade out, and the hero hands over directly to the Blueprint section with no shutter. The plan's first walls start drawing as the hero leaves.

**The Blueprint (paper, sticky, about 560vh of scroll)**
- Layout: text column on the left (34%), SVG drawing on the right. A progress rail sits under the text with four segments (Plan · Diagnose · Engineer · Build), each filling as you scroll.
- The drawing is an architect's floor plan of "your business": a double outer wall, interior walls with door openings, and door-swing arcs.
- Rooms: 01 ATTRACT ("Where customers find you"), 02 CONVERT ("Where enquiries become clients"), 03 FOLLOW UP ("Where nobody gets forgotten"), 04 OPERATE ("Where the work gets done").
- Dimension lines: DEMAND / REVENUE across the top, FRONT / BACK down the side.
- Scrubbed timeline stages. The stage text changes with a scramble label, a headline mask reveal and a body fade.
  - **00 Statement:** "Every business loses growth somewhere."
  - **01 Plan:** the walls draw (stroke-dashoffset), then dimensions, doors, and room labels fade in. "We map how your business actually runs."
  - **02 Diagnose:**
    - Dashed leak arrows grow out through the walls, with circles drawn where they cross.
    - Annotations: DEMAND LEFT UNTAPPED · ENQUIRIES LEFT WAITING · QUOTES NEVER CHASED · HOURS LOST TO ADMIN.
    - Text: "Then we find the leaks."
  - **03 Engineer:**
    - The leaks fade to 16%, and blue seal bars close each breach.
    - A blue "Growth Engine" core node pops in at the centre, and blue channels draw out to a node in each room: AI OUTREACH · AI QUALIFY + BOOK · SEQUENCES · AUTOMATION + CRM.
    - A loop arrow runs from Follow up back to Attract.
    - A detail callout circle with a leader line ends at a box reading "DETAIL A · LEAD SCORING · ROUTE · BOOK".
    - Text: "We build the system that seals them."
  - **04 Built:**
    - Dimensions and leaks fade out, and the whole plan rotates into an isometric view (`rotateX 56°`, `rotateZ −38°`, `scale 0.8`).
    - Six stacked clones of the walls, at `translateZ` steps of 7px, fade in to extrude the walls into 3D.
    - Text: "Designed. Engineered. Built."
- A corner mark reads "Sheet 02 · Growth plan · Rev 01".

**"What's your growth problem?" (paper)**
- Four tabs: Not enough customers · Enquiries don't convert · Nobody follows up · Too much manual work.
- Clicking a tab redraws a four-step system diagram: boxes draw via stroke, blue arrows grow between them, and labels fade in. An "Outcome" line appears underneath.

| Problem | Steps | Outcome |
|---|---|---|
| Not enough customers | Ideal-customer map → Lead sourcing → Personalised outreach → Booked sales calls | A steady pipeline that doesn't wait on referrals. |
| Enquiries don't convert | Instant response → AI qualification → Quote or proposal → Booked job | More enquiries turn into paying customers. |
| Nobody follows up | Every lead logged → Timed follow-ups → Old-lead reactivation → Back in the pipeline (plus a blue "Re-engage loop" arrow) | No customer slips through the cracks. |
| Too much manual work | Repetitive-task audit → Automations → CRM sync → Live reporting | Hours back every week for the work that matters. |

**What's included (paper)**
- A spec-sheet table styled like an architectural schedule, with mono headers. Rows: Diagnosis & blueprint · System build & integration · AI agents & automations · CRM & reporting · Monthly management & optimisation.
- Show "Implementation from $2,500" and "Management from $800/month" as starting points.

**Title block CTA**
- A grid styled like a drawing's title block: Project: *Your growth system* · Drawn by: *CreonTek* · Scale: *Built to scale* · Revision: *01*.
- Below it: "Commission your blueprint." with a blue "Book a strategy call" button.

---

## 8. Studio page (`/studio`): "The Gallery"

The world here is bright and sunlit. It's calm, editorial and crafted, the opposite of the blueprint's technical feel. It uses `--gallery` warm white, Instrument Serif headlines, generous white space and soft shadows. There's no grid, no mono-heavy labelling and no 3D logo.

1. **Hero: "The Gallery" (`--gallery`, pinned about 250vh)**
   - **Opening:** after the door transition, the V4 video plays inside a small framed window at the centre of the page, about 28vw wide with a 4:5 ratio. It has a thin warm-grey frame line and a soft drop shadow, like an artwork hung on a gallery wall. A tiny caption sits beneath it in small type, in the style of a museum label: "Studio, 2026 · Digital experiences · Ongoing".
   - **Headline:** in Instrument Serif, large and arranged *around* the frame. "Exceptional digital" sits left of it, "experiences," sits right, and "*engineered for business.*" in italic sits below. Each word fades up softly (opacity plus an 8px blur that clears, 1.2s, `power3.out`, staggered), which is gentler than the mask reveal used elsewhere.
   - **Cursor image trail (desktop only):** moving the cursor over the hero leaves a trail of small project screenshots that appear and fade at the cursor, one every 80px of travel, each living about 0.9s. Use the client work images.
   - **Scroll:** the framed window expands smoothly, its edges growing outward until V4 fills the whole screen (clip-path inset 0 at the end). Meanwhile the serif headline words drift apart and fade, and the caption fades. At full bleed, a short line fades in over the video: "Every pixel, considered." Then the section releases into the statement.
   - **CTAs:** they appear under the headline at rest: a blue "Book a strategy call" button and a "View work" pill.
2. **Statement:** "We don't build generic websites." brightens word by word, followed by the full selling line from §1.
3. **Services:** three large rows (Premium Websites · Web Applications · E-commerce). When a row is hovered, an image from a relevant project follows the cursor and the row's number scrambles.
4. **Work gallery:** a curved 3D carousel of project screenshots that flattens into a grid as you scroll.
5. **Process:** Discover → Design → Build → Launch, laid out as a spec sheet with timelines.
6. **Care plan:** three tiers with "from" pricing (placeholder values). Hosting, maintenance, updates and ongoing development.
7. **CTA:** "Let's build something exceptional." with a booking button.

---

## 9. Mobile behaviour (under 860px)

- Keep every section and its copy. Reduce pinned scroll lengths by about 40%.
- **3D logo hero:** centre the logo above the headline at 80% scale, and keep the break-apart effect with shorter travel distances.
- **Blueprint:** stack the text above the drawing. Keep the drawing animation but skip the isometric extrusion; fade to the final plan instead.
- **Low-power devices:** replace the 3D logo with the flat SVG logo, animated with a gentle CSS float. Detect this with `navigator.hardwareConcurrency < 4` or `saveData`.
- **Effects:** no custom cursor, no magnetic buttons, and the marquee is not tied to scroll velocity.
- **Two doors:** stack vertically, and tap to enter. The door transition still plays, but shorter (about 0.9s) and with no blur.
- **Growth Engine hero:** no CAD cursor. The construction lines and dimension lines still draw.
- **Studio hero:** no cursor image trail. The frame starts at 60vw and expands on scroll, and the serif headline stacks above and below the frame.

---

## 10. Media assets and how to use them

Put videos in `/public/media/`. The only generated video is V4. Everything else (the 3D logo, the blueprints, the preloader) is built in code.

| File | Content | Use |
|---|---|---|
| `v4-studio.mp4` / `.webm` + `v4-poster.jpg` | Frosted glass panels with website layouts in a sunlit studio (seamless 8s loop) | Studio door card and Studio hero background |
| `work/*.mp4` | Client-site screen recordings (20–40s, 1920×1080) | Project card previews |
| `/public/brand/creontek-logo-*.svg` | Logo in black and white | Nav, preloader pieces, 3D extrusion, favicon |

**Looping videos:** `muted playsinline loop autoplay preload="metadata"`. Pause them when off-screen (IntersectionObserver). Provide WebM and MP4 versions plus a poster.

---

## 11. Sound

- **Off by default.** Show a "Sound on / off" toggle in the nav and footer, with a small animated equaliser icon. Remember the choice in localStorage.
- **When on:**
  - A low ambient bed loops at about 20% volume (`/public/audio/ambient.mp3`).
  - The preloader lock plays a soft resonant tone, and the 3D logo break-apart plays an airy whoosh with light metallic chimes, scrubbed in volume with scroll. Generate both with the Web Audio API, or use short licensed SFX files in `/public/audio/`.
  - The Studio door can use V4's own audio (soft room tone and glass whooshes), and only while hovered.
  - Blueprint stage changes play a soft pencil or ruler tick, and tab clicks play a short click. Generate both with the Web Audio API, under 80ms, at low volume.
- Fade the audio in and out over 400ms. Never let sound start before the visitor turns it on.

---

## 12. Forms, SEO, performance and accessibility

**Contact form (`/contact` and a modal from the CTAs):**
- Fields: Name, Email, Company, Website, "I'm interested in" (Studio / Growth Engine / Not sure), Budget (Under $5k / $5–15k / $15–40k / $40k+ / Not sure), Message (at least 20 characters).
- Validate inline, show success and error states, and send through a server action or an edge function to email/CRM.
- Show the Calendly link alongside the form.

**SEO:**
- Per-page titles and meta descriptions, Open Graph images, JSON-LD (`Organization`, `ProfessionalService`), a sitemap and robots.txt.

**Performance budget:**
- LCP under 2.5s on 4G. Lazy-load everything below the fold and dynamic-import R3F.
- Load fonts with `display: swap`. Aim for a Lighthouse score of 90+ on desktop.

**Accessibility:**
- Semantic landmarks and visible focus rings in blue.
- SVG drawings carry `role="img"` with an `aria-label`. Text animations keep their real text in the DOM.
- Keyboard-operable tabs with the proper `tablist`/`tab` roles. Colour contrast must meet AA.
- Full support for `prefers-reduced-motion`, as described in §2.

---

## 13. Build order and acceptance criteria

1. Design tokens, fonts, layout shell, nav, footer, smooth scroll and the shutter component.
2. The Growth Engine page: Drafting Table hero, then the blueprint, problem tabs and title block (match the prototype for these three).
3. The Home page: Assemble → Scatter preloader, 3D logo hero with statement and break-apart, shutter, two doors, door transition, marquee, selected work, who we build for, how we work, proof (only if real testimonials exist), closing CTA and footer.
4. The Studio page (Gallery hero first), Work index and case study template, About and Contact.
5. Sound, mobile pass, reduced-motion pass, SEO and performance pass.

**Done means:**
- Every section has a real resting state.
- There's no layout shift.
- The scroll stays at 60fps on a mid-range laptop.
- All the copy above is used verbatim, unless marked as a placeholder.
- Every CTA links to the booking URL or the contact form.

---

