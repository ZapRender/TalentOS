# Design System Document: SGRH (Sistema de Gestión de Recursos Humanos)

## 1. Overview & Creative North Star: "The Architectural Curator"
This design system moves away from the cluttered, "spreadsheet" aesthetic common in legacy HR software. Our Creative North Star is **The Architectural Curator**. 

The system treats information as a curated exhibit. We achieve a "High-End Editorial" feel by replacing rigid, grid-locked boxes with breathable layouts, intentional white space, and a sophisticated layering of surfaces. By prioritizing structural depth over visual noise (like heavy borders), we communicate **Trust** through stability and **Efficiency** through clarity.

### The Editorial Shift
*   **Asymmetry:** Use wide margins on the right for contextual actions, breaking the centered-column habit.
*   **Tonal Authority:** Instead of using colors to decorate, we use them to command attention. 
*   **Atmospheric Depth:** The UI should feel like a physical space—a series of stacked, high-quality papers and glass panes.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in the authority of Deep Navy, balanced by a sophisticated range of grays that define the spatial logic of the application.

### The "No-Line" Rule
**Standard 1px solid borders are prohibited for sectioning.** To separate the "Sidebar" from the "Dashboard" or a "List" from a "Profile," use background shifts. 
*   *Example:* A container using `surface_container_low` (#f3f3f3) sitting on a `background` (#f9f9f9) creates a natural, sophisticated boundary without the visual "stutter" of a line.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack. The deeper the content, the "higher" the container tier.
1.  **Level 0 (Base):** `background` (#f9f9f9) - The canvas.
2.  **Level 1 (Sections):** `surface_container_low` (#f3f3f3) - For large layout blocks.
3.  **Level 2 (Cards/Modules):** `surface_container_lowest` (#ffffff) - For primary interaction areas. This creates a "lifted" feel against the gray background.
4.  **Level 3 (Popovers/Overlays):** `surface_bright` with 80% opacity and a 12px backdrop-blur.

### The "Glass & Signature" Rule
*   **Glassmorphism:** Use for floating elements (e.g., sticky headers during scroll). Apply `surface_container_lowest` with 70% opacity and `backdrop-filter: blur(10px)`.
*   **Signature Gradients:** For high-impact CTAs (e.g., "Contratar Nuevo Empleado"), use a subtle linear gradient: `primary` (#00375e) to `primary_container` (#1f4e79) at 135 degrees.

---

## 3. Typography: The Voice of Authority
We utilize **Inter** exclusively. It is a workhorse typeface that, when scaled correctly, transforms from a functional label to a bold editorial statement.

*   **Display (Editorial Impact):** Use `display-md` for empty states or dashboard greetings (e.g., "Bienvenido, Administrador"). This establishes an immediate sense of modern premium design.
*   **Headline & Title (Hierarchy):** `headline-sm` should be used for section titles (e.g., "Expediente del Empleado"). Use `on_surface_variant` (#42474f) for these to keep the interface feeling "soft" rather than harsh black-on-white.
*   **Body & Labels (Utility):** `body-md` is our standard for all data. `label-sm` is reserved for metadata and micro-copy, always in All-Caps with +0.05em letter spacing to ensure readability.

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to create "pop"; we use them to create "atmosphere."

*   **The Layering Principle:** Depth is achieved by "stacking" surface tokens. Place a `surface_container_lowest` card on a `surface_container_low` section. This provides a soft, natural lift.
*   **Ambient Shadows:** If a shadow is required for a floating Modal or Dropdown, use: `box-shadow: 0 12px 32px -4px rgba(0, 55, 94, 0.08)`. Note the use of a Navy tint (`primary`) in the shadow rather than pure black—this mimics natural light in a branded environment.
*   **Ghost Borders:** For form inputs where a boundary is functional, use a "Ghost Border": `outline_variant` (#c2c7d0) at 30% opacity. It should be barely felt, only seen when looked for.

---

## 5. Components: Enterprise Refined

### Sidebar (The Anchor)
*   **Width:** Fixed 220px.
*   **Color:** `primary_container` (#1f4e79).
*   **Active State:** Do not use a box. Use a 4px vertical pill of `inverse_primary` (#a0cafc) on the far left of the item, with the text shifting to `on_primary` (#ffffff).

### Buttons
*   **Primary:** Gradient of `primary` to `primary_container`. Roundedness: `md` (0.375rem).
*   **Secondary:** No background. `Ghost Border` (20% opacity `outline`). Text in `primary`.
*   **Tertiary:** Text-only. Use `on_primary_fixed_variant` (#184974) for a sophisticated "Deep Navy" link look.

### Input Fields
*   **Base:** `surface_container_lowest` (#ffffff).
*   **Border:** `outline_variant` at 20% opacity.
*   **Focus:** Border increases to 100% opacity `primary_fixed_dim` (#a0cafc) with a 3px soft outer glow.

### Cards & Data Tables
*   **No Dividers:** Forbid the use of horizontal lines between list items. Use **Vertical White Space** (Spacing `5` or `6`) to separate rows.
*   **Alternating Surfaces:** For large data sets, use `surface_container_low` for even rows and `surface_container_lowest` for odd rows.

### Signature Component: The "Status Orb"
Instead of standard colored badges, use a 8px "Orb" (circular div) with a soft glow of the same color (e.g., `error` for "Baja Laboral") next to the text. This is cleaner and more "executive" than bulky pill-shaped tags.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `Spacing 10` (2.25rem) between major sections to let the UI breathe.
*   **Do** use Spanish terminology that is professional (e.g., "Nómina" instead of "Pagos", "Colaboradores" instead of "Usuarios").
*   **Do** align all text to a strict baseline grid to maintain the editorial feel.

### Don'ts
*   **Don't** use 100% black (#000000). Use `on_surface` (#1a1c1c) for high-contrast text.
*   **Don't** use "Alert Red" for everything. Use the `tertiary` (Amber/Gold) tones for "Pending" or "Warning" actions to maintain a high-end corporate warmth.
*   **Don't** use rounded-full (pills) for buttons; keep them to `md` or `lg` to maintain an "Architectural" (structural) feel.