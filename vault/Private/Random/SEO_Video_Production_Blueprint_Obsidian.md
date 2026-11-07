## Complete Scene-by-Scene Production Guide & Editing Blueprint

This document is your **master production blueprint** for the 14-minute faceless motion graphics video (`Project seo - Enhnced.wav`). It merges real tool screen recordings (**SR**), high-resolution screenshots (**SS**), and code-driven motion graphics (**MG**) into a unified, high-retention video timed to every spoken beat.

---

## 1. Executive Summary & Production Overview
| Metric                 | Master Specification                                                                                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Master Voiceover**   | `motion/audio/Project seo - Enhnced.wav`                                                                                                                                                                               |
| **Duration**           | **14m 01.6s** (841.59 seconds)                                                                                                                                                                                         |
| **Total Frame Budget** | **25,248 frames** @ 30.0 fps                                                                                                                                                                                           |
| **Subtitle Segments**  | **204 micro-beats** (`motion/audio/transcript.srt`)                                                                                                                                                                    |
| **Word Alignment**     | **1,746 verified words** (`motion/audio/transcript_words.json`)                                                                                                                                                        |
| **Visual Aesthetic**   | **Monochrome Dark Developer** (`#0A0A0A` canvas, transparent cards with `#2A2A2A` hairline border, `#FFFFFF` titles & active outlines, `#E5E5E5` body, `#A3A3A3` secondary, `#737373` muted, `#1F1F1F` subtle surface) |
| **Typography**         | **Inter only** (400 Regular Body, 600 Semi-Bold Titles/Badges) with tabular numerals                                                                                                                                   |
| **Asset Strategy**     | **Hybrid SR + SS + MG**: Real SaaS screen recordings and screenshots seamlessly framed inside monochrome browser mockups, driven by continuous spring cursors and kinetic callouts.                                    |

---

## 2. Essential Batch Screen Recording & Screenshot Checklist for Ayush

You can capture all required screen recordings in **one single recording session** (~15 minutes) before running renders.

> [!TIP]

> **Recording Settings for Ayush**:

> - **Resolution**: 1920x1080 (or 4K 16:9).

> - **Browser Zoom**: **150%** (so text and metrics are large and punchy on mobile screens).

> - **Theme**: Dark Mode enabled wherever available.

 >- **Privacy**: Use dummy domains (`yourwebsite.com`) or blur confidential client URLs.

| #         | File Path                                                | What to Record                                                                                                                                                                     | Format & Details                                                  | Status            |
| --------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------- |
| **SR-01** | `inputs/screen_recordings/01_3d_webgl_showcase.mp4`      | **Award-Winning 3D/WebGL Sites**: 3 smooth mouse scrolls over visual-heavy sites like Linear.app, Lusion.co, or Spline showcase.                                                   | 60 fps, 1080p, 8–10 sec smooth scroll. Used in **00:00 – 00:08**. | [ ] Needs Capture |
| **SR-02** | `inputs/screen_recordings/02_google_site_search.mp4`     | **Google Search Reality Check**: Clean Google Search page, click search bar, type `site:yourdomain.com`, hit Enter, showing indexed results or "did not match any documents".      | 60 fps, 1080p, 150% zoom. Used in **01:37 – 02:01**.              | [ ] Needs Capture |
| **SR-03** | `inputs/screen_recordings/03_gsc_inspection.mp4`         | **Google Search Console URL Inspection**: Click top URL search bar, paste domain URL, show "URL is not on Google", hover and click "Request Indexing" button.                      | 60 fps, 1080p, clean window. Used in **02:01 – 02:28**.           | [ ] Needs Capture |
| **SR-04** | `inputs/screen_recordings/04_browser_sitemap_robots.mp4` | **Live Browser Sitemap & Robots**: Tab 1: open `yourdomain.com/sitemap.xml` showing XML structure. Tab 2: open `yourdomain.com/robots.txt` showing `User-agent: *` and directives. | 60 fps, 1080p. Used in **02:29 – 03:46**.                         | [ ] Needs Capture |
| **SR-05** | `inputs/screen_recordings/05_gsc_sitemaps_indexing.mp4`  | **GSC Sitemaps & Indexing Reports**: Submitting `sitemap.xml` with "Success" badge, then navigating to "Pages" indexing report highlighting "Excluded by noindex tag".             | 60 fps, 1080p. Used in **03:10 – 03:46**.                         | [ ] Needs Capture |
| **SR-06** | `inputs/screen_recordings/06_semrush_keyword_magic.mp4`  | **Semrush Keyword Magic Tool**: Type "web design", view volume/intent/KD%, click KD% filter dropdown, select "Easy" (0–29%), and browse long-tail results.                         | 60 fps, 1080p. Used in **05:57 – 08:07**.                         | [ ] Needs Capture |
| **SR-07** | `inputs/screen_recordings/07_gsc_performance.mp4`        | **GSC Performance Report**: Overview dashboard showing Total Clicks, Total Impressions, Average CTR, Average Position, and scroll down into the Queries table.                     | 60 fps, 1080p. Used in **11:56 – 12:54**.                         | [ ] Needs Capture |

### Supporting Static Screenshots (SS)
| # | File Path | Screenshot Description | Status |
|---|---|---|---|
| **SS-01** | `inputs/screenshots/portfolio_home.jpg` | **Ayush Thapa Portfolio**: Home screen showing automation projects, tabs, and bio. | ✅ **Captured** |
| **SS-02** | `inputs/screenshots/08_serp_snippet.png` | **Google SERP Snippet**: Clean Google Search result card for target service keyword. | [ ] Needs Capture (or MG mockup) |
| **SS-03** | `inputs/screenshots/09_ga4_or_looker.png` | **GA4 / Looker Studio**: Traffic overview & conversion goals dashboard. | [ ] Needs Capture (or MG mockup) |

---

## 3. Pre-Production Subtitle & Script Corrections

Before finalizing kinetic typography and subtitle overlays, verify that text layers use these standardized technical terms:

| Spoken Phonetic in Raw Audio   | Correct Technical Term  | Display Representation in Video            |
| ------------------------------ | ----------------------- | ------------------------------------------ |
| "sight search" / "cite domain" | `site:` search operator | `site:yourdomain.com`                      |
| "robot text" / "robot dot txt" | `robots.txt` file       | `yourdomain.com/robots.txt`                |
| "site map dot xml"             | `sitemap.xml`           | `yourdomain.com/sitemap.xml`               |
| "search council"               | Google Search Console   | `Google Search Console (GSC)`              |
| "some rush" / "sam rush"       | Semrush                 | `Semrush Keyword Magic Tool`               |
| "no index directive"           | `noindex` tag           | ``<meta name="robots" content="noindex">`` |
| "seater" / "c t r"             | CTR                     | `CTR (Click-Through Rate)`                 |
| "katie percent" / "kd"         | KD%                     | `KD% (Keyword Difficulty: Easy / Hard)`    |
| "ge four" / "g a four"         | GA4                     | `Google Analytics 4 (GA4)`                 |
| "looker"                       | Looker Studio           | `Looker Studio Dashboard`                  |

---

## 4. Exact-Frame Pointer Word Overlays

Whenever the voiceover says demonstrative anchor words like **"this"**, **"here"**, or sequential markers like **"First"**, **"Second"**, our engine triggers micro-overlays (callout bounding boxes, spotlight rings, or cursor clicks) at the exact spoken timestamp:

| Spoken Word | Transcript Word ID | Exact Audio Sec | Visual Pointer Overlay Trigger |
|---|---|---|---|
| *"here"* | `w_0112` | `00:51.72` | 5-step horizontal roadmap pill appears: `[1. Indexing -> 2. Intent -> 3. Keywords -> 4. On-Page -> 5. Tracking]`. |
| *"First,"* | `w_0202` | `01:37.12` | Spotlight zoom snaps onto Google Search bar typing `site:`. |
| *"this."* | `w_0210` | `01:41.02` | Red-border bounding box highlights `site:` operator syntax. |
| *"First,"* | `w_0236` | `01:54.58` | Cursor points to indexed URLs count at top of Google search results. |
| *"this."* | `w_0358` | `02:48.18` | White hairline highlight boxes the URL path `/sitemap.xml`. |
| *"this,"* | `w_0374` | `02:56.28` | XML tree root node pulses open with child branch links. |
| *"this."* | `w_0403` | `03:11.24` | GSC Sitemaps "Success" status pill triggers subtle scale bounce. |
| *"this,"* | `w_0439` | `03:26.70` | Terminal card highlights line `User-agent: * Disallow: /`. |
| *"this"* | `w_0461` | `03:40.36` | Code callout highlights ``<meta name="robots" content="noindex">``. |
| *"Second,"* | `w_0476` | `03:48.00` | Transition wipe from Technical Audit into 2x2 Search Intent Matrix. |
| *"Here,"* | `w_0745` | `06:11.08` | Cursor clicks into Semrush Keyword Magic search input field. |
| *"Here"* | `w_0785` | `06:29.18` | Semrush table header row highlights with white border outline. |
| *"look"* | `w_0791` | `06:30.76` | Spotlight ring focuses on **Intent** column badge. |
| *"First,"* | `w_0793` | `06:32.02` | 1st metric card snaps in: **Relevance (100%)**. |
| *"this"* | `w_0796` | `06:34.30` | 2nd metric card snaps in: **Search Intent Match**. |
| *"Second,"* | `w_0808` | `06:40.40` | 3rd metric card snaps in: **Monthly Volume**. |
| *"Third,"* | `w_0820` | `06:48.50` | 4th metric card snaps in: **Keyword Difficulty (KD%)**. |

---

## 5. Complete Phase-by-Phase Scene Blueprint (Phases 1 to 7)

---

### PHASE 1: The Hook & The AI Website Trap (`00:00:00 – 00:01:10`)

*Frame Budget: `0 – 2100` (70.0s) | Subtitle Beats: 1 – 15*

#### Beat 1.1 (Scenes 1–3): The 3D Ghost Town (`00:00:00 – 00:00:14`)

- **Asset Type**: `SR-01` + `MG` (Screen Recording with Motion Graphic Overlay)

- **Timecode**: `00:00.00 – 00:00.14` | Frames `0 – 420`

- **Voiceover**: *"Your website is amazing. It has beautiful animations, 3D effects and design that looks like it costs thousands of dollars, but there is one problem. Nobody is visiting it."*

- **Visual Action**:

- `00:00 – 00:08`: Smooth 60fps screen recording (`inputs/screen_recordings/01_3d_webgl_showcase.mp4`) scrolling an award-winning 3D website (e.g. Linear.app/Lusion.co) inside a floating dark browser card with subtle perspective tilt.

- `00:08 – 00:14`: Hard tape-stop glitch cut on the spoken word *"problem"*. The 3D site snaps flat into an analytics card showing a flatline graph with a bold white `0` Monthly Visitors and a pulsing `#1F1F1F` .

#### Beat 1.2 (Scenes 4–8): The AI Builder Blindspot (`00:00:15 – 00:00:34`)

- **Asset Type**: `SR` / `MG`

- **Timecode**: `00:00.15 – 00:00.34` | Frames `450 – 1020`

- **Voiceover**: *"AI tools can help you build a website, but they don't automatically make sure Google can find your pages..."*

- **Visual Action**: Fast recording snippet of an AI builder (Lovable/Claude/v0) typing code, followed by an animated Googlebot crawler icon with a confused question mark badge above its head.

#### Beat 1.3 (Scenes 9–12): Flashy 0-Traffic vs. Clean Ranked Site (`00:00:35 – 00:00:57`)

- **Asset Type**: `SS` + `MG` (Split Comparison)

- **Timecode**: `00:00.35 – 00:00.57` | Frames `1050 – 1710`

- **Voiceover**: *"A much simpler website could attract more visitors simply because it is easier to discover..."*

- **Visual Action**: Split-screen card comparison:

- Left Card: "Complex 3D Site" (0 indexed pages, 0 traffic).

- Right Card: "Clean Structured Site" (100% indexed, 4.2k monthly visits).

- Logos of ChatGPT, Claude, and Lovable converge into an architectural SEO blueprint.

#### Beat 1.4 (Scenes 13–15): The 4-Pillar SEO Roadmap (`00:00:58 – 00:01:10`)

- **Asset Type**: `MG` (Kinetic Stack)

- **Timecode**: `00:00.58 – 00:01.10` | Frames `1740 – 2100`

- **Voiceover**: *"Here is a simple SEO process you can follow..."*

- **Visual Action**: 4 vertical transparent glass pillars snap into place in sequence:

1. `[01. Audit]` -> 2. `[02. Keywords]` -> 3. `[03. Optimize]` -> 4. `[04. Promote]`.

---

### PHASE 2: Step 1A — Technical Website Audit (`00:01:12 – 00:03:46`)

*Frame Budget: `2160 – 6780` (154.0s) | Subtitle Beats: 16 – 50*

#### Beat 2.1 (Scenes 16–21): Step Title & X-Ray Inspection (`00:01:12 – 00:01:36`)

- **Asset Type**: `MG`

- **Timecode**: `00:01.12 – 00:01.36` | Frames `2160 – 2880`

- **Voiceover**: *"Before trying to get traffic, we need to check whether there is any basic problem stopping Google..."*

- **Visual Action**: Kinetic header card: `"STEP 01: WEBSITE AUDIT"`. A vertical laser scan line passes across a webpage skeleton, revealing the underlying DOM structure.

#### Beat 2.2 (Scenes 22–28): The `site:` Search Reality Check (`00:01:37 – 00:02:01`)

- **Asset Type**: `SR-02` (Google Search Recording) + `MG` Callout

- **Timecode**: `00:01.37 – 00:02.01` | Frames `2910 – 3630`

- **Voiceover**: *"Open Google search and type site: followed by your domain name... If pages appear, Google has indexed your site. If not, don't panic."*

- **Visual Action**: Screen recording `SR-02` typing `site:yourdomain.com`. Dual-state split showing indexed result cards on the left vs. Google's "did not match any documents" on the right with a monochrome `"Don't Panic"` pill.

#### Beat 2.3 (Scenes 29–34): GSC URL Inspection & Request Indexing (`00:02:01 – 00:02:28`)

- **Asset Type**: `SR-03` (GSC Screen Recording)

- **Timecode**: `00:02.01 – 00:02.28` | Frames `3630 – 4440`

- **Voiceover**: *"Open Google Search Console, use the URL Inspection tool... check why, fix it, and click 'Request Indexing'."*

- **Visual Action**: `SR-03` showing GSC top bar search, status returning "URL is not on Google", followed by cursor clicking the high-contrast "Request Indexing" button with an active outline ring.

#### Beat 2.4 (Scenes 35–44): XML Sitemap Hierarchy & Submission (`00:02:29 – 00:03:12`)

- **Asset Type**: `SR-04` + `MG` (Node Tree) + `SR-05`

- **Timecode**: `00:02.29 – 00:03.12` | Frames `4470 – 5760`

- **Voiceover**: *"Second, check if your website has an XML sitemap... It tells search engines what pages exist and where to find them. Open your browser and type yourdomain.com/sitemap.xml..."*

- **Visual Action**:

- Browser address bar navigates to `/sitemap.xml`.

- XML tree collapses into structured nodes (`/`, `/about`, `/services`, `/blog`).

- Cut to `SR-05` pasting the sitemap URL into GSC and receiving the green "Success" status.

#### Beat 2.5 (Scenes 45–50): Robots.txt & The Accidental `noindex` Trap (`00:03:13 – 00:03:46`)

- **Asset Type**: `SR-04` / `SS` + `MG` (Code Snippet Callout)

- **Timecode**: `00:03.13 – 00:03.46` | Frames `5790 – 6780`

- **Voiceover**: *"Check for issues such as accidental 'noindex' directives... AI tools sometimes leave this on by default while building, which tells search engines 'do not show this page'."*

- **Visual Action**: Browser view of `yourdomain.com/robots.txt` zooming into `Disallow: /`. Transition to an HTML code block spotlighting ``<meta name="robots" content="noindex">`` with a prominent warning box.

---

### PHASE 3: Step 1B — Search Intent & Strategy (`00:03:48 – 00:05:23`)

*Frame Budget: `6840 – 9690` (95.0s) | Subtitle Beats: 51 – 74*

#### Beat 3.1 (Scenes 51–54): Intent Over Keyword Stuffing (`00:03:48 – 00:04:09`)

- **Asset Type**: `MG`

- **Timecode**: `00:03.48 – 00:04.09` | Frames `6840 – 7470`

- **Voiceover**: *"Once Google can find your website, the next step is making sure your pages match what people are searching for. In SEO, we call this search intent..."*

- **Visual Action**: A messy wall of repeated keywords ("best web design web design cheap") dissolves into a clean crosshair target icon labeled **"Search Intent"**.

#### Beat 3.2 (Scenes 55–67): The 4 Intent Types Matrix (GTA 6 Case Study) (`00:04:10 – 00:04:49`)

- **Asset Type**: `MG` + `SS` (2x2 Matrix)

- **Timecode**: `00:04.10 – 00:04.49` | Frames `7500 – 8670`

- **Voiceover**: *"There are four main types of search intent: Informational ('is GTA 6 even coming?'), Navigational ('Rockstar Games'), Commercial Investigation ('best gaming monitors for GTA 6'), and Transactional ('pre-order GTA 6')."*

- **Visual Action**: A 2x2 grid of cards lighting up in sync with the audio:

- Top-Left: **Informational** (Magnifying Glass) -> `"Is GTA 6 coming?"`

- Top-Right: **Navigational** (Compass) -> `"Rockstar Games"`

- Bottom-Left: **Commercial** (Comparison Scales) -> `"Best monitors for GTA 6"`

- Bottom-Right: **Transactional** (Cart) -> `"Pre-order GTA 6"`

#### Beat 3.3 (Scenes 68–74): Agency Page Intent Mapping (`00:04:50 – 00:05:23`)

- **Asset Type**: `MG`

- **Timecode**: `00:04.50 – 00:05.23` | Frames `8700 – 9690`

- **Voiceover**: *"For your website, map out your pages based on what visitors want..."*

- **Visual Action**: Website tree connects:

- `/blog` -> Informational

- `/services/web-design` -> Commercial

- `/contact` -> Transactional

---

### PHASE 4: Step 2 — Keyword Research & Semrush Walkthrough (`00:05:23 – 00:08:07`)

*Frame Budget: `9690 – 14610` (164.0s) | Subtitle Beats: 75 – 115*

#### Beat 4.1 (Scenes 75–79): Head Terms vs. Long-Tail Specifics (`00:05:23 – 00:05:56`)

- **Asset Type**: `MG` (Scale Balance)

- **Timecode**: `00:05.23 – 00:05.56` | Frames `9690 – 10680`

- **Voiceover**: *"Some searches are very broad, like 'GTA 6', while others are specific, like 'storyline of GTA 6'... If you offer web design, don't try to rank for just 'web design'..."*

- **Visual Action**: A balance scale showing `"Web Design"` (impossible difficulty) vs. `"Web design for AI startups"` (targeted, high conversion).

#### Beat 4.2 (Scenes 80–115): Semrush Keyword Magic Live Workflow (`00:05:57 – 00:08:07`)

- **Asset Type**: `SR-06` (Semrush Screen Recording) + `MG` Pointer Overlays

- **Timecode**: `00:05.57 – 00:08.07` | Frames `10710 – 14610`

- **Voiceover**: *"When evaluating keywords, look at four things: Relevance, Intent match, Monthly search volume, and Keyword Difficulty... filter KD to Easy..."*

- **Visual Action**:

- Full-screen `SR-06` of Semrush Keyword Magic Tool typing "web design".

- Pointer overlays highlight columns: Volume (`14.8K`), Intent badge (`C`), KD% (`89% Red`).

- Cursor clicks KD% filter dropdown, sets filter to **"Easy (0–29%)"**.

- Overlays zoom into low-competition gems: `"minimalist web design portfolio"`.

---

### PHASE 5: Step 3 — On-Page SEO Optimization (`00:08:08 – 00:10:26`)

*Frame Budget: `14640 – 18780` (138.0s) | Subtitle Beats: 116 – 147*

#### Beat 5.1 (Scenes 116–140): Webpage Anatomy Breakdown (`00:08:08 – 00:09:53`)

- **Asset Type**: `MG` + `SS-02` (Interactive Document Wireframe)

- **Timecode**: `00:08.08 – 00:09.53` | Frames `14640 – 17790`

- **Voiceover**: *"Now optimize the pages themselves. Title Tag, Meta Description, clean URLs, clear headings: H1, H2, and H3, image alt text..."*

- **Visual Action**: A high-fidelity dark browser wireframe highlights elements sequentially:

1. ``<title>`` Tag & Meta snippet preview in Google SERP format.

2. URL bar displaying clean slug `/seo-automation-guide` vs. ugly ID slug.

3. Heading tree hierarchy: `[H1]` Main Title -> `[H2]` Subheading -> `[H3]` Bullet point.

4. Image inspector showing `alt="Looker Studio SEO Dashboard"`.

#### Beat 5.2 (Scenes 141–147): The Internal Linking Funnel (`00:09:54 – 00:10:26`)

- **Asset Type**: `MG`

- **Timecode**: `00:09.54 – 00:10.26` | Frames `17820 – 18780`

- **Voiceover**: *"Connect related pages with internal links. A blog post links to your service page, which links to your contact page..."*

- **Visual Action**: 3 interconnected cards: `Blog Post` ➔ `Service Page` ➔ `Contact Form`. Animated pulse travels along connecting paths, filling an SEO completion bar to **80%**.

---

### PHASE 6: Step 4 — Off-Page SEO & Distribution (`00:10:27 – 00:11:55`)

*Frame Budget: `18810 – 21450` (88.0s) | Subtitle Beats: 148 – 168*

#### Beat 6.1 (Scenes 148–158): Community Ecosystem Orbit (`00:10:27 – 00:11:27`)

- **Asset Type**: `MG` + `UI` Mockups

- **Timecode**: `00:10.27 – 00:11.27` | Frames `18810 – 20610`

- **Voiceover**: *"Share useful posts related to your service where your target audience spends their time: Reddit, LinkedIn, Twitter, industry platforms..."*

- **Visual Action**: Center website hub. Floating orbit cards represent LinkedIn case study post, Reddit community answer, and GitHub repo, streaming referral signals and backlinks into the central domain.

#### Beat 6.2 (Scenes 159–168): Value Contributions vs. Spam Penalties (`00:11:28 – 00:11:55`)

- **Asset Type**: `MG` (Side-by-Side Comparison)

- **Timecode**: `00:11.28 – 00:11.55` | Frames `20640 – 21450`

- **Voiceover**: *"Promotion doesn't mean spamming links everywhere. It means contributing value, answering real questions, and sharing case studies..."*

- **Visual Action**: Side-by-side comparison:

- Left: "Spamming naked links" (Strikethrough, account banned warning).

- Right: "Detailed case study with actionable breakdown" (High upvotes, natural profile clicks).

---

### PHASE 7: Monitoring Results, Analytics & Outro (`00:11:56 – 00:14:01`)

*Frame Budget: `21480 – 25248` (125.6s) | Subtitle Beats: 169 – 204*

#### Beat 7.1 (Scenes 169–181): GSC Performance Deep-Dive (`00:11:56 – 00:12:54`)

- **Asset Type**: `SR-07` (GSC Performance Screen Recording) + `MG` Callouts

- **Timecode**: `00:11.56 – 00:12.54` | Frames `21480 – 23220`

- **Voiceover**: *"And finally, tracking and measurement... How many impressions are your pages getting? How many clicks? What is your average ranking position?"*

- **Visual Action**: `SR-07` showing the GSC Performance chart. Pointer callout boxes zoom into Total Clicks, Total Impressions, CTR, and the Queries table revealing real user search queries.

#### Beat 7.2 (Scenes 182–193): GA4 Conversion Funnel & Page Diagnostics (`00:12:54 – 00:13:34`)

- **Asset Type**: `SS-03` / `MG`

- **Timecode**: `00:12.54 – 00:13.34` | Frames `23220 – 24420`

- **Voiceover**: *"If you also have Google Analytics set up, look at how visitors behave once they arrive: time on site, pages visited, conversion actions..."*

- **Visual Action**: Clean dark analytics dashboard showing visitor journey: Sessions ➔ Average Engagement Time (3m 24s) ➔ Goal Conversions (Form Submitted).

#### Beat 7.3 (Scenes 194–204): The Compounding SEO Flywheel & Outro (`00:13:34 – 00:14:01.6`)

- **Asset Type**: `MG` (Circular Flywheel + Bento Summary)

- **Timecode**: `00:13.34 – 00:14.01.6` | Frames `24420 – 25248`

- **Voiceover**: *"SEO is not a one-time setup. It is a continuous loop: audit your site, optimize on-page, promote where your audience is, and measure the results. That is how your website goes from invisible to discovered."*

- **Visual Action**:

- Compounding exponential growth curve over 6 months.

- A circular rotating flywheel: `[Audit ➔ Keywords ➔ Optimize ➔ Promote ➔ Measure]`.

- Resolves into a Bento Grid cheat sheet summary and your closing personal badge:

- **"Ayush Thapa · Automation & SEO"**

- Seamless fade to black at frame `25,248`.

---

## 6. How the Engine Layers SR, SS, and MG

Our motion graphics pipeline (`motion.js`, Playwright, and FFmpeg) integrates real assets directly into the canvas without breaking the strict monochrome dark aesthetic:

1. **Screen Recordings (`.mp4`)**:

- Placed in `motion/inputs/screen_recordings/`.

- Loaded into video elements inside transparent browser mockup frames (``<video src="..." autoplay muted loop>``).

- The engine overlays custom spring cursors (`#cursor`), pointer callout bounding boxes (`#2A2A2A` hairline borders), and kinetic spotlight zooms directly on top of the live video playback.

2. **Screenshots (`.jpg` / `.png`)**:

- Placed in `motion/inputs/screenshots/`.

- Scaled and framed inside high-fidelity mockups with crisp 1px borders and 10px radii.

3. **Pure Motion Graphics (`.html`)**:

- Generated dynamically with `M.track` and `M.vis` for instant frame-accurate rendering, guaranteed 0.0ms drift, and complete typography consistency.

---

## 7. Next Step

1. **Review this updated blueprint**: You can inspect or tweak any timecode, pointer word, or visual beat above.

2. **Screen Recording Intake**: Whenever you record any of the 7 clips from the checklist, drop them into `motion/inputs/screen_recordings/`.

3. **Confirmation Gate**: Remember, **no new code or renders will execute** until you review the plan and explicitly send the keyword **`CONFIRM`**.
