# Design System Document

## 1. Overview & Creative North Star: "The Ink & Void"
This design system is a digital interpretation of Zen philosophy and the visceral artistry of Takehiko Inoue’s *Vagabond*. It moves away from the "templated" web by embracing the tension between the raw energy of a brush stroke and the silent precision of a minimalist grid. 

**Creative North Star: The Ink & Void**
The system is built on the concept of *Ma* (negative space)—the intentional void that gives meaning to the objects within it. We reject traditional UI boxiness in favor of asymmetric balance, high-contrast monochrome values, and sophisticated tonal layering. This is a professional, high-end editorial experience that feels both ancient and cutting-edge.

---

## 2. Colors: Monochrome Depth
The palette is strictly monochrome, utilizing a range of grays and blacks to create focus without the distraction of hue.

| Token | Value | Role |
| :--- | :--- | :--- |
| `background` | #F9F9F9 | The "Paper" - subtle off-white to reduce eye strain. |
| `primary` | #000000 | The "Ink" - for high-contrast headlines and CTAs. |
| `secondary` | #5F5E5E | Tonal mid-point for secondary information. |
| `surface-container` | #EEEEEE | Subtle nesting for grouped content. |
| `outline-variant` | #CFC4C5 | Low-opacity "Ghost" lines only when necessary. |

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined through:
1.  **Background Shifts:** Transitioning from `surface` (#F9F9F9) to `surface-container-low` (#F3F3F3).
2.  **Negative Space:** Using the spacing scale to create distinct visual islands.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of fine Washi paper. To create depth, use the `surface-container` tiers:
*   **Layer 0 (Base):** `surface` (#F9F9F9)
*   **Layer 1 (Cards/Sections):** `surface-container-lowest` (#FFFFFF) to create a subtle "lift" against the off-white background.
*   **Layer 2 (Inner Elements):** `surface-container-high` (#E8E8E8) for nested data or input fields.

### Signature Textures & Gradients
While the palette is flat, use a **Linear Gradient** (`primary` #000000 to `primary-container` #1B1B1B) on large CTA buttons or hero sections. This mimics the way ink pools on paper, providing a "soul" that pure hex codes cannot.

---

## 3. Typography: The Calligrapher’s Contrast
The system pairs the raw, elegant authority of a serif with the invisible utility of a modern sans-serif.

*   **Display & Headlines (Noto Serif):** These are your "Brush Strokes." Use `display-lg` (3.5rem) with generous letter-spacing to command attention. They should feel like traditional calligraphy—authoritative and intentional.
*   **Body & Labels (Inter):** These are your "Functional Notes." Inter provides a clean, neutral counter-balance to the expressive serif.

**Hierarchy as Identity:**
- **Display/Headline:** Always `#000000` (on_surface). Use for philosophical or high-level statements.
- **Title/Body:** Use `#1A1C1C` for readability. 
- **Labels:** Use `#4C4546` (on_surface_variant) for metadata to ensure they recede into the background.

---

## 4. Elevation & Depth: Tonal Layering
We do not use drop shadows to mimic physical height. We use "Tonal Layering" to mimic atmospheric depth.

*   **The Layering Principle:** Place a `surface-container-lowest` (#FFFFFF) card on a `surface` (#F9F9F9) background. The 4% difference in brightness provides a "soft lift" that feels premium and integrated.
*   **Ambient Shadows:** If a floating element (like a Modal) is required, use a shadow with a 40px blur, 0px offset, and 4% opacity of the `on-surface` color. It should feel like a soft glow rather than a shadow.
*   **The Ghost Border:** If accessibility requires a container boundary, use the `outline-variant` token at **15% opacity**. It should be barely perceptible.
*   **Glassmorphism:** For navigation bars, use `surface` at 80% opacity with a `backdrop-filter: blur(20px)`. This allows the "ink" of the content to bleed through as the user scrolls, maintaining a sense of continuity.

---

## 5. Components: Minimalist Primitives

### Buttons
*   **Primary:** Solid `primary` (#000000) with `on-primary` (#FFFFFF) text. **Radius: 0px**. The sharp corners emphasize a "sword-like" precision.
*   **Secondary:** Ghost style. No background, 10% opacity `primary` border, serif typography.
*   **Hover State:** Transition to a subtle brush-stroke texture overlay or a slight shift to `primary_container`.

### Input Fields
*   **Styling:** No four-sided boxes. Use a single bottom border (0.5px) using `outline`.
*   **Focus:** The bottom border transforms into a 2px `primary` line. Labels should use `label-sm` in all-caps for a professional, architectural feel.

### Cards & Lists
*   **Forbid Dividers:** Never use a horizontal line to separate list items. Use 24px–32px of vertical padding (`spacing-md`) to allow the eye to distinguish rows.
*   **Visual Anchor:** Use a vertical "Ink Bar" (a 4px wide solid black line) on the left side of an active list item or a featured card to denote importance.

### Signature Component: The "Scroll Progress Brush"
Instead of a standard loading bar, use a horizontal stroke that looks like a widening ink trail at the top of the page to indicate scroll depth.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** embrace asymmetry. Center a headline but align the body text to the far left to create a dynamic "editorial" layout.
*   **Do** use extreme whitespace. If you think there is enough space, double it.
*   **Do** use `0px` border radius everywhere. Sharp edges equate to precision and professional rigor.

### Don’t:
*   **Don’t** use pure #000000 for body text; use #1A1C1C to maintain a "printed" look that is softer on the eyes.
*   **Don’t** use icons unless absolutely necessary. Rely on typography and spacing first.
*   **Don’t** use "Pop" colors. If an error occurs, use the `error` (#BA1A1A) token sparingly, and treat it like a red wax seal on a document—intentional and grave.

### Accessibility Note:
While we use high-contrast monochrome, ensure that all text against background shifts maintains a minimum 4.5:1 contrast ratio. The "Ghost Border" should never be the only indicator of a functional area; use typography (underlines or weight shifts) to assist.