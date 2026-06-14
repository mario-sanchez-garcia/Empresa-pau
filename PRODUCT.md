# Product

## Register
product

## Users
Spanish high school students (17-18) preparing for the PAU (university entrance exam). Used daily as a study habit tool, primarily during at-home study sessions. Parents are secondary users who track progress via a shared link.

## Product Purpose
Pausia generates daily study missions, provides AI corrections for exercises, and runs full PAU exam simulations. Goal: make PAU preparation structured, trackable, and habit-forming.

## Brand Personality
Calm, structured, trustworthy. "Compañero de estudio serio." Not a gamified edtech toy — closer to Linear than Duolingo.

## Anti-references
- Generic SaaS cream + AI-purple gradients
- Busy dashboards with too much color variation
- Apps that feel academic or bureaucratic (portals, learning management systems)
- Heavy illustration and hand-drawn SVG style

## Design Principles
1. Disappear into the task — the tool should never distract from studying
2. Earned familiarity — feel like a serious productivity tool, not a school portal
3. State communicates clearly — every component tells users exactly what is happening
4. Motion is informative — only animates to convey state change or feedback
5. Consistent vocabulary — same button shape, same card radius, same spacing throughout

## Typography
One family: Geist Sans. Fixed rem scale, not fluid. Tight ratio (~1.2). No display fonts in UI labels.

## Color
One accent: blue-600 (#2563eb). Used identically across all surfaces. Semantic greens for success, ambers for warning, reds for error. No accent color on inactive or decorative elements.

## Corner Radius System
- Buttons (full action): pill (9999px) via `.campus-primary`
- Interactive cards, modals: 16px (--r-lg)
- Inputs, small chips: 8px (--r-md)
- Badge pills, tags: 9999px (--r-pill)

## Motion Budget
150–250ms for UI feedback. 300–500ms for larger containers. State-only: only animate on state change or user action. No decorative motion.

## Accessibility
WCAG AA minimum. `prefers-reduced-motion` mandatory. High contrast body text (≥4.5:1 on all backgrounds).
