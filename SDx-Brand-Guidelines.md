# SDx Brand Guidelines

**Version:** 1.1 | **Updated:** March 2026

---

## Brand Essentials

### Identity

**SDx** — San Diego's builder-first technology community. The name combines "SD" (San Diego) with "x" (a variable — the unknown, the next thing to be built). A community of 3,000+ builders, founders, engineers, and students shipping at the cutting edge of AI and emerging tech.

**Tagline:** "San Diego's builder-first technology community."

**Hero headline:** "Build here."

**Footer tagline:** "Build here.|" (with blinking cursor — always this exact phrasing)

### "SDx" Name Treatment

**CRITICAL:** The "SDx" name must always follow these rules:

```
Font: Tiposka Regular (weight 400)
Capitalization: Always "SDx" — never "SDX", "sdx", or "Sdx"

On Dark Backgrounds: #FFFFFF (White)
On Light Backgrounds: #000000 (Black)
```

- Never use any other font for "SDx"
- Never alter the colors beyond these two options
- The "x" may be used alone as a lettermark — it must also be set in Tiposka

### Design Philosophy

Dark-first, builder-focused, technically precise. A black canvas with prismatic light — the aesthetic of a terminal pushed to its limits. Clean type hierarchy, glowing edges, and motion that feels alive but never decorative. The brand is for people who build.

### Community Platforms

```
Events:     https://lu.ma/sdx
Discord:    https://discord.gg/Rkgyzx2ykV
Twitter:    https://twitter.com/SDxCommunity
LinkedIn:   https://linkedin.com/company/sdxcommunity
Instagram:  https://instagram.com/sdxcommunity
Email:      community@sdx.community
```

### Named Programs

Official SDx event brands — always use these exact names:

```
Paper Club            — Deep dives into fundamental ML research
AI Coffee             — Open discussion on the latest in AI
Hack Days             — Show up, build something real, demo what you made
Hackathons            — Full-day build events with sponsor credits and prizes
Executive Roundtables — Peer-level AI implementation exchange for senior leaders
```

### Chapter Naming

Chapters follow the pattern: "SDx" + university abbreviation. In digital contexts, the abbreviation uses the text-outline effect (stroke-only) while "SDx" remains filled.

```
SDxUCSD — University of California, San Diego (Active)
SDxSDSU — San Diego State University (Active)
SDxUSD  — University of San Diego (Planned)
```

### Partners

Current partners in the site marquee. When co-branding, "SDx" always appears in Tiposka alongside partner logos.

```
Cadre, Anthropic, ElevenLabs, Hugging Face, OpenAI, Qualcomm,
Replit, Vercel, UCSD, Groq, Modal, Y Combinator
```

---

## Logo

### Wordmark

The primary logo is "SDx" set in Tiposka Regular.

```
Primary Wordmark: SDx
Lettermark Variant: x
Font: Tiposka Regular
Download: sdx-logo-white.svg (in /public/)
```

### Color Treatment

```
Primary (Default):   White (#FFFFFF) on Black (#000000)
Inverted:            Black (#000000) on White (#FFFFFF) or any light surface
```

No other colors are approved for the logo.

### Clear Space

Maintain clear space equal to the height of the "x" letterform on all four sides.

### Logo Hover (Digital Only)

Letters transition from filled to outlined with a staggered delay:

```
Default:  Filled white letterforms
Hover:    Outlined (-webkit-text-stroke: 1px rgba(255,255,255,0.8))
Delay:    S = 0ms, D = 80ms, x = 160ms
Scale:    1.05 max (spring, stiffness 400, damping 25) — navigation only
```

### Do's and Don'ts

**Do:**
- Always render "SDx" in Tiposka
- Use the full wordmark as the primary logo
- Maintain clear space around the logo
- Use white-on-black as the default treatment
- Set body text in Space Mono

**Don't:**
- Render "SDx" in any font other than Tiposka
- Stretch, rotate, or distort the wordmark
- Use brand palette colors as a fill on the logo
- Place the logo on busy or low-contrast backgrounds
- Add effects beyond the prismatic glow

---

## Colors

### Core

```
White    #FFFFFF    HSL: 0 0% 100%
Black    #000000    HSL: 0 0% 0%
```

### Brand Palette — The Prismatic Six

These six colors form the SDx prismatic identity. **Use them sparingly and intentionally.** The default brand expression is restraint — black, white, and the opacity scale. Prismatic color is the accent, not the norm.

```
Red      #D92C2D
Orange   #FC5715
Yellow   #FAC205
Green    #03C661
Cyan     #11BBCD
Blue     #035593
```

### How the Prismatic Six Are Used

**The core principle:** Each individual element gets a single, solid color from the palette. Multiple single-colored elements are then juxtaposed to create the prismatic effect. The impression of a spectrum emerges from many individually-colored pieces — not from a gradient applied to a single element.

**Correct usage (how the site does it):**
- A red `@` sign next to an orange `{` next to a yellow `*` — each character one solid color
- A canvas of individually-colored ASCII characters creating a fire effect
- Procedural color regions flowing across a shader, each area dominated by one color

**Incorrect usage:**
- A single button with a rainbow gradient fill
- A headline with a gradient flowing through all six colors
- A card background with a flat multi-color gradient

**The only exception** is when producing explicit iridescent/prismatic accent effects at very low opacity (e.g., the PrismaticCanvas shader behind a CTA section). These are intentional, atmospheric, and always subtle.

### UI System Colors

```
Page Background     hsl(0 0% 0%)    #000000    Pure black
Card Background     hsl(0 0% 4%)    ~#0A0A0A   Cards, popovers
Secondary/Muted     hsl(0 0% 8%)    ~#141414   Secondary surfaces
Border              hsl(0 0% 12%)   ~#1E1E1E   System borders
Muted Foreground    hsl(0 0% 55%)   ~#8C8C8C   Disabled/placeholder text
```

### Text Opacity Scale

All text is white at varying opacity on the black canvas:

```
100%  text-white       Primary headings, brand name, high-contrast UI
 90%  text-white/90    Metric values, strong secondary elements
 70%  text-white/70    Hero subheading, footer description, prominent body
 60%  text-white/60    Navigation links, social icons, footer section labels
 50%  text-white/50    Body copy, CTA descriptions
 40%  text-white/40    Card descriptions, partner labels, fine detail
 30%  text-white/30    Section labels ("WHAT WE DO"), palette headers
```

### UI Indicator Colors

Three colors from the accent palette are used as small status dot indicators throughout the UI:

```
Teal   HSL: 175 70% 40%   Active chapter dots, brand page "Do" indicators
Amber  HSL: 35 85% 55%    Executive bio bullet points
Blue   HSL: 220 75% 55%   Secondary chapter dots
```

### Borders

```
Section divider:  border-white/5       rgba(255,255,255,0.05)
Card border:      border-white/[0.06]  rgba(255,255,255,0.06)
Card hover:       border-white/[0.15]  rgba(255,255,255,0.15)
Nav separator:    gradient from-transparent via-white/10 to-transparent
```

---

## Typography

### Font Families

```
Display: Tiposka Regular
  Type: Custom local font (TTF)
  File: /public/fonts/tiposka/Tiposka-Regular.ttf
  CSS Variable: --font-display
  Usage: ALL headings, logo, section titles, display text
  Rule: EXCLUSIVE to display — never use for body copy

Body: Space Mono
  Type: Google Font
  Weights: 400 (Regular), 700 (Bold)
  CSS Variable: --font-mono
  Download: https://fonts.google.com/specimen/Space+Mono
  Usage: All body text, buttons, UI labels, badges, navigation, metadata
  Rule: The ONLY approved body font
```

### Base Settings

```
Base Font Size:   18px (set on html element)
Base Line Height: 1.5 (leading-relaxed)
Font Features:    "rlig" 1, "calt" 1
Text Selection:   background white, color black
```

### Type Scale

**Display (Tiposka):**

| Name | Class | ~Size | Tracking | Usage |
|------|-------|-------|----------|-------|
| Hero XL | text-9xl | 162px | tight | Hero headline (lg+) |
| Hero L | text-8xl | 144px | tight | Hero headline (md) |
| Hero M | text-6xl | 108px | tight | Hero headline (base), Section header (lg+) |
| Section L | text-5xl | 90px | tight | Section header (md) |
| Section M | text-4xl | 72px | tight | Section header (base), Nav logo, Final CTA |
| Sub L | text-3xl | 54px | tight | Subsection headings |
| Sub M | text-2xl | 36px | tight | Card headings, footer brand |

**Body (Space Mono):**

| Name | Class | ~Size | Tracking | Usage |
|------|-------|-------|----------|-------|
| Body XL | text-xl | 22px | default | Metric values |
| Body L | text-lg | 20px | default | Hero subheading (md+) |
| Body | text-base | 18px | default | Standard body, card titles |
| Body S | text-sm | 16px | default | Card descriptions, footer links |
| Label | text-xs | 14px | widest | Nav links, button text, section labels (uppercase) |
| Badge | text-[10px] | 10px | widest | Small badges (uppercase) |

### Letter Spacing

```
Display headings:   tracking-tight   (~-0.025em)
Labels/nav/buttons: tracking-widest  (~0.1em) — always uppercase
Footer copyright:   tracking-wider   (~0.075em)
Body copy:          default          (0em)
```

---

## Visual Effects

Prismatic effects are the accent, not the default. Use sparingly. The brand's resting state is black, white, and opacity.

### Prismatic Glow

The signature text glow. Layered white drop-shadows applied to major headings.

```css
/* Standard — H1-level headings */
.prismatic-glow {
  filter:
    drop-shadow(0 0 15px rgba(255,255,255,0.30))
    drop-shadow(0 0 40px rgba(255,255,255,0.15))
    drop-shadow(0 0 80px rgba(255,255,255,0.08));
}

/* Small — H2-level subheadings */
.prismatic-glow-sm {
  filter:
    drop-shadow(0 0 10px rgba(255,255,255,0.25))
    drop-shadow(0 0 25px rgba(255,255,255,0.12))
    drop-shadow(0 0 50px rgba(255,255,255,0.06));
}
```

### Text Outline

Stroke-only letterforms. Used for the logo hover state and chapter university abbreviations.

```css
color: transparent;
-webkit-text-stroke: 1px rgba(255,255,255,0.8);

/* Thin variant */
-webkit-text-stroke: 0.5px rgba(255,255,255,0.7);
```

### Ghosted Letterform

Giant faint "SDx" placed behind sections as a depth element. Rotated 90/-90 degrees.

```css
color: transparent;
-webkit-text-stroke: 2px rgba(255,255,255,0.08);
line-height: 0.85;
user-select: none;
pointer-events: none;
/* Size: text-[40vw] (desktop) to text-[80vw] (mobile) */
```

### Frosted Glass (Backdrop Blur)

A core visual treatment for surfaces that sit above the canvas. Creates depth and separation.

```
Navigation:  bg-black/90 backdrop-blur-md — heavy blur for the fixed nav bar
Cards:       bg-white/[0.02] backdrop-blur-sm — subtle frosting for card surfaces
```

### ASCII Fire (Footer)

The footer renders an animated ASCII fire effect. Each character is drawn individually on a canvas, and each character gets exactly **one solid color** from the prismatic palette based on its density weight.

**Character set (sparse → dense):**
```
 .`-'_,^:;~=><+!?*/\)s(d{x}[S]D|X#%&@
```

Sparse characters (spaces, dots, dashes) appear in the cooler part of the flame. Dense characters (`#`, `%`, `&`, `@`) appear in the hotter, more intense regions.

**Color-to-density mapping:**

| Density | Characters | Color | Hex |
|---------|-----------|-------|-----|
| Sparse (coolest) | ` `` . `` ` - '` | Blue | #035593 |
| Light | `_ , ^ : ; ~ =` | Cyan | #11BBCD |
| Medium | `> < + ! ? * /` | Green | #03C661 |
| Heavy | `\ ) s ( d { x } [ S ]` | Yellow | #FAC205 |
| Dense (hottest) | `D \| X # % & @` | Orange | #FC5715 |

The fire effect works bottom-up: intensity is highest at the bottom (dense, hot, orange) and fades to sparse, cool blue at the top. The prismatic impression comes from thousands of individually-colored characters — never from a gradient on any single element.

### PrismaticCanvas (CTA Background)

A WebGL shader (ColorBends) that renders flowing, procedural color regions behind CTA sections. Uses the full prismatic six palette at low opacity (default: 0.45). Colors flow and interact but maintain distinct regions — each area is dominated by a single color from the palette.

### Background Grid

Subtle 64px grid behind hero sections:

```css
background:
  linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
background-size: 64px 64px;
```

### Metaball Canvas

The hero background features animated blob/metaball effects — dark, very low opacity, subtle depth.

---

## Components

Components follow a minimal dark aesthetic. Here's how they look, not how to implement them.

### Buttons

**ASCII Button (Primary CTA)** — A white rectangle with animated ASCII characters shimmering across the surface in dark semi-transparent ink. Prismatic glow radiates from all edges. Used for the most important actions: "Start Building", "Join on Lu.ma", "Join".

**Outline Glow (Secondary CTA)** — Black background, white border with a soft white glow. Text is uppercase, small, widely tracked Space Mono. The glow intensifies on hover. Used for: "Executive Network →", "Join Discord", "Explore chapters →".

**White Solid (Utility)** — White background, black text, bold. Subtle white glow shadow. Used for download actions and tertiary CTAs.

### Cards

Frosted glass on a dark canvas. Nearly transparent (`bg-white/[0.02]`) with a subtle backdrop blur, the faintest border (`border-white/[0.06]`), and a soft glow on hover. Cards lift slightly on hover (-4px) with a spring animation. Content uses the standard text opacity scale.

### Navigation

Fixed at top. Black at 90% opacity with a medium backdrop blur — the page content scrolls underneath. "SDx" logo on the left (Tiposka, large), centered links (small uppercase monospace), and an ASCII "Join" button on the right. A thin gradient line separates the nav from content. On mobile, a sheet drawer slides in from the right.

### Footer

Full-width ASCII fire canvas as the background. Four-column grid with brand info, navigation links, community links, and social icons (Discord, Twitter, LinkedIn, Instagram). The bottom bar shows "© {year} SDx." followed by "Build here.|" rendered as a white-on-black pill with a blinking cursor.

### Section Header

A badge label (small, uppercase, bordered), a large Tiposka heading with prismatic glow, and an optional subtitle. Elements stagger in on scroll.

### Badges & Status

Small uppercase monospace labels with subtle borders. Status dots use the UI indicator colors (teal for active, blue for secondary, white/20 for planned). Metrics display as white-on-dark rounded pills.

### Icons

Lucide React (https://lucide.dev). Stroke-based, 2px weight. Sizes: 12px (badges), 16px (inline), 20px (nav). Color inherits from text.

---

## Spacing & Layout

### Max Widths

```
max-w-7xl  (1280px)  Page wrapper, navigation, footer
max-w-6xl  (1152px)  Event grids, community proof sections
max-w-5xl  (1024px)  Hero text block
max-w-3xl  (768px)   Narrow text content, final CTA
max-w-xl   (576px)   Hero subheading paragraph
```

### Padding

```
Page horizontal:     px-4 sm:px-6 lg:px-8
Section vertical:    py-24 (96px)
Card:                p-6 (24px)
Nav height:          h-20 (80px)
Footer:              pt-16 pb-32
```

### Grids

```
2-col:   grid-cols-1 md:grid-cols-2, gap-4
3-col:   grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-4
3-wide:  grid-cols-1 md:grid-cols-3, gap-12
4-col:   grid-cols-1 md:grid-cols-4, gap-8 (footer)
```

### Responsive Breakpoints

```
< 640px   Mobile portrait (base)
  640px   sm — mobile landscape
  768px   md — tablet, desktop nav appears, grids expand
 1024px   lg — full font sizes, max content width
 1280px   xl — large containers
 1536px   2xl — maximum widths
```

**Responsive typography:**
```
Hero:     text-6xl → md:text-8xl → lg:text-9xl
Section:  text-4xl → md:text-5xl → lg:text-6xl
Body:     text-base → md:text-lg
```

Mobile: Navigation becomes sheet drawer. All grids collapse to 1 column. Ghosted letterforms scale from text-[40vw] (desktop) to text-[80vw] (mobile).

---

## Motion & Animation

### Motion Language

All motion should feel intentional, smooth, and slightly elastic. The primary easing curve across the brand is:

```
cubic-bezier(0.16, 1, 0.3, 1)
```

This is a soft expo-out — fast start, gentle deceleration, no bounce. Use this as the default for all custom animations and transitions. The only exception is hover interactions, which use spring physics for responsiveness.

### Easing

```
Primary (Soft Expo Out):   cubic-bezier(0.16, 1, 0.3, 1)   — All entrances, page transitions
Elastic Overshoot:         cubic-bezier(1, 0, 0.31, 1.39)   — Cursor blink
```

### Transitions

```
appear:       1.0s, Soft Expo Out        Standard entry
heroEntrance: 1.2s, Soft Expo Out        Hero elements
hover:        spring (stiff 400, damp 25) Cards, elements
buttonHover:  spring (stiff 500, damp 30) Buttons
stagger:      0.08s per child, 0.15s initial delay
```

### Variants

```
fadeUp:    opacity 0→1, y: 24→0
fadeLeft:  opacity 0→1, x: -24→0
scaleIn:   opacity 0→1, scale: 0.95→1
```

### Named Animations

| Name | Effect | Duration | Usage |
|------|--------|----------|-------|
| marquee | translateX(0→-50%) | 20s linear | Partner carousel |
| glow-pulse | opacity(0.4→0.8→0.4) | 3s ease-in-out | Glow breathing |
| float | translateY(0→-20px→0) | 8s ease-in-out | Floating elements |
| fade-in-up | opacity(0→1) y(16→0) | 0.6s ease-out | Scroll entry |
| blink | opacity(1→0→1) | 1.2s overshoot | Footer cursor |

### Reduced Motion

When `prefers-reduced-motion: reduce` is active, all animations freeze and transition durations drop to 0.01ms.

---

## Accessibility

```
Focus rings:       ring-1 ring-white/50 (all interactive elements)
Text contrast:     White on black exceeds WCAG AAA (21:1)
Opacity text:      text-white/40 on black ≈ 4.6:1 (meets AA for large text)
Selection:         background: white, color: black
Reduced motion:    All animations disabled
Screen readers:    Decorative elements marked aria-hidden="true"
Keyboard nav:      All elements focusable, sheet drawer keyboard-accessible
```

---

## Voice & Tone

### Brand Voice

**Direct.** No hedging, no fluff. Say what you mean.

**Action-oriented.** Every headline is a call to do something, not a description.

**Builder-first.** Respect for the craft. We talk to people who ship things.

**Inclusive.** Anyone who wants to learn can join. No gatekeeping.

**Practitioner-level.** Technical content is precise. Don't dumb it down.

### Writing Principles

**Lead with action:**
```
OK  "Build here."
OK  "Come build."
OK  "Show up, build something real, demo what you made."
NO  "SDx is a community for technology enthusiasts."
```

**Be specific, not generic:**
```
OK  "Deep dives into fundamental ML research. Come prepared to debate."
OK  "Peer-level AI implementation exchange for senior leaders."
NO  "Learn about AI with other professionals."
```

**Short sentences. Full stop.**
```
OK  "You don't need to know how to code to join SDx. You need to want to learn."
NO  "SDx is welcoming to all skill levels, whether you're a beginner or experienced."
```

### Content Formulas

| Type | Formula | Example |
|------|---------|---------|
| Headlines | Imperative verb + destination | "Build here." / "Come build." / "Where builders build." |
| Events | What happens + what's expected | "Show up, build something real, demo what you made." |
| Proof | Specific claim + brevity | "3000+ builders" / "Connected to the organizations that matter." |
| CTAs | Action verb + value | "Start Building" / "Join Discord" / "Explore chapters →" |

**Never:** "Click here", "Submit", or "Learn more" (last resort only, with →)

### Audience Segments

| Segment | Tone | Example |
|---------|------|---------|
| Builders | Peer-to-peer, technical, assume competence | "Practitioner-level signal." |
| Students | Welcoming, low-barrier, emphasize access | "You need to want to learn." |
| Executives | Senior, precise, peer-to-peer (never talk down) | "Peer-level AI implementation exchange." |

---

## Print & Export

### Logo

```
Minimum print size:  1 inch wide
Clear space:         Height of "x" on all sides
Formats:             SVG (primary), PDF/EPS (print), PNG at 2x+ (digital)
Colors:              White on dark, Black on light — no exceptions
```

### Typography for Print

```
Display:   Tiposka Regular (48pt–96pt)
Subheads:  Space Mono Bold (24pt–36pt)
Body:      Space Mono Regular (10pt–12pt)
Fallback:  Courier New (body), geometric sans-serif (display)
```

### Color Conversions

**CMYK (approximate):**
```
Black:             0, 0, 0, 100
Red (#D92C2D):     0, 80, 80, 15
Orange (#FC5715):  0, 65, 91, 1
Yellow (#FAC205):  0, 20, 98, 2
Green (#03C661):   98, 0, 61, 22
Cyan (#11BBCD):    91, 7, 0, 20
Blue (#035593):    99, 41, 0, 42
```

**Pantone (approximate):**
```
Black C | Red: 186 C | Orange: 021 C | Yellow: 109 C
Green: 354 C | Cyan: 313 C | Blue: 295 C
```

### Presentations

**Dark (default):**
```
Background: #000000
Title: Tiposka 48–60pt, #FFFFFF, prismatic glow
Body: Space Mono 18–20pt, rgba(255,255,255,0.7)
Labels: Space Mono 10–12pt, uppercase, tracking 0.1em, rgba(255,255,255,0.4)
Logo: "SDx" Tiposka white, bottom corner
```

**Light (limited — only when required by partner context):**
```
Background: #FFFFFF
Title: Tiposka 48–60pt, #000000
Body: Space Mono 18–20pt, #333333
Logo: "SDx" Tiposka black
```

### Merchandise

```
Dark apparel:  "SDx" in White, Tiposka, min 1 inch, left chest or centered
Light apparel: "SDx" in Black, Tiposka
Colors:        Black and White only — no brand palette colors as solids
```

### OG Images

Generated with the ASCII fire effect as background (same palette/density system as footer). Overlay gradient from transparent to black. "SDx" wordmark in Tiposka, white.

---

## Quick Reference

```
IDENTITY
Name: SDx (always this capitalization)
Tagline: "San Diego's builder-first technology community."
Hero: "Build here."

COLORS
Background: #000000 | Card: hsl(0 0% 4%) | Text: #FFFFFF
Opacity scale: 100/90/70/60/50/40/30%
Palette (prismatic, use sparingly):
  #D92C2D → #FC5715 → #FAC205 → #03C661 → #11BBCD → #035593
Rule: Individual elements get one solid color each — never a gradient on one element

TYPOGRAPHY
Display: Tiposka Regular (--font-display) | Body: Space Mono 400/700 (--font-mono)
Base: 18px, line-height 1.5
Hero: text-6xl→8xl→9xl | Section: text-4xl→5xl→6xl | Body: text-base→lg
Labels: text-xs uppercase tracking-widest

SPACING
Section: py-24 | Cards: p-6 | Nav: h-20 | Container: max-w-7xl px-4/6/8

EFFECTS
Prismatic glow: 3-layer white drop-shadow (15/40/80px blur)
Frosted glass: bg-white/[0.02] backdrop-blur-sm (cards), bg-black/90 backdrop-blur-md (nav)
Cards: border-white/[0.06] → hover border-white/[0.15]

MOTION
Primary easing: cubic-bezier(0.16, 1, 0.3, 1)
Entry: 1.0s | Hover: spring(400,25) | Button: spring(500,30)
```

---

## Brand Assets Checklist

- [ ] "SDx" rendered in Tiposka Regular — White on dark, Black on light
- [ ] Brand palette colors used as individual solid-color elements, never as gradients on single elements
- [ ] Prismatic effects used sparingly — default is black, white, opacity
- [ ] Body text uses Space Mono, not Tiposka
- [ ] Background is black or near-black by default
- [ ] Text hierarchy follows the white opacity scale
- [ ] Major headings have prismatic glow
- [ ] Buttons: ASCII (primary) / Outline Glow (secondary)
- [ ] CTAs use action verbs — no "click here" or "submit"
- [ ] Copy is direct and builder-focused
- [ ] Logo has clear space equal to "x" height on all sides
- [ ] All motion uses cubic-bezier(0.16, 1, 0.3, 1) as primary easing
- [ ] Motion respects prefers-reduced-motion
- [ ] Digital exports at 2x (retina), print at 300 DPI CMYK
- [ ] Capitalization is always "SDx"

---

**Version 1.1** | March 2026 | SDx — San Diego's builder-first technology community
