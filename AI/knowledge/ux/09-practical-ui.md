---
title: Practical UI Guidelines for Coding Agents
description: A condensed, implementation-oriented UI/UX and frontend guide derived from Practical UI, 2nd edition by Adham Dannaway.
version: 1.0
intended_for:
  - coding agents
  - frontend developers
  - UX/UI designers
  - design-system contributors
source:
  title: Practical UI, 2nd edition
  author: Adham Dannaway
  copyright: Copyright 2024 Adham Dannaway
usage_note: This is a transformed summary and agent instruction set, not a reproduction or replacement for the original book.
---

# Practical UI Guidelines for Coding Agents

## Purpose

Use this document when designing, reviewing, or implementing product interfaces.

The objective is not to make an interface look impressive in isolation. The objective is to create an interface that is:

- Easy to understand
- Efficient to use
- Accessible
- Visually coherent
- Consistent with the existing product
- Robust across screen sizes, content lengths, and interaction states

Treat these rules as defaults. Deviate only when product requirements, user research, platform conventions, or an established design system provide a stronger reason.

---

# 1. Agent operating principles

## 1.1 Begin with the user task

Before changing layout or styling, identify:

1. What is the user trying to accomplish?
2. What information do they need first?
3. What action is most important?
4. What can be delayed, hidden, combined, or removed?
5. What can fail, overflow, wrap, or become inaccessible?

Do not begin with decorative treatment.

## 1.2 Every detail needs a reason

Do not add a visual or interactive element merely because it looks polished.

For every element, be able to explain its purpose:

- Communicates hierarchy
- Groups related content
- Indicates status
- Affords interaction
- Provides feedback
- Improves readability
- Prevents error
- Supports accessibility
- Reinforces product identity

Remove details that have no clear function.

## 1.3 Prefer familiar patterns

Use conventional interface patterns unless there is evidence that a custom pattern improves the experience.

Prefer:

- Standard buttons
- Standard text inputs
- Familiar navigation
- Recognizable icons with labels when meaning is not obvious
- Expected keyboard behavior
- Platform-appropriate dialogs, menus, tabs, and form controls

Novelty increases usability risk.

## 1.4 Reduce interaction cost

Minimize the work required to complete a task.

Reduce:

- Number of clicks or taps
- Pointer travel
- Repeated data entry
- Unnecessary confirmation
- Context switching
- Scrolling without useful information
- Steps that do not change the outcome

Do not optimize only for the happy path. Include loading, empty, error, partial, success, and permission-denied states.

## 1.5 Reduce cognitive load

Do not force users to remember information that the interface can show.

Prefer:

- Recognition over recall
- Clear labels over ambiguous icons
- Small groups over long undifferentiated lists
- Sensible defaults
- Contextual help
- Progressive disclosure
- Consistent vocabulary and behavior

## 1.6 Prioritize the common case

Use the 80/20 principle:

- Make frequent and important tasks obvious.
- Keep uncommon actions available but visually quieter.
- Do not give every action equal visual weight.
- Do not let rare edge cases dominate the primary interface.

## 1.7 Reuse the design system

Before creating a new style or component:

1. Search for an existing component.
2. Check existing variants and tokens.
3. Extend an existing primitive when appropriate.
4. Add a new component only when its behavior or structure is meaningfully different.

Avoid one-off values and duplicated component logic.

---

# 2. Simplicity and information density

## 2.1 Remove unnecessary information

Include information only when it helps the user:

- Understand the current state
- Make a decision
- Complete the task
- Avoid an error
- Build necessary trust

Remove repeated labels, redundant descriptions, decorative metadata, and low-value status details.

## 2.2 Remove unnecessary styling

Avoid decoration that competes with content.

Use restraint with:

- Borders
- Shadows
- Background fills
- Gradients
- Multiple accent colors
- Excessive rounding
- Decorative icons
- Animation
- Glass, blur, and novelty effects

Do not stack multiple grouping techniques unless needed. A card usually does not need a border, strong shadow, tinted background, and divider at the same time.

## 2.3 Do not confuse minimalism with simplicity

A visually sparse interface can still be difficult to use.

Do not remove:

- Labels required to understand controls
- Context needed to make a decision
- Visible focus indicators
- Validation guidance
- Important actions
- Status information
- Error recovery

Simple means easy to understand and operate, not merely empty.

## 2.4 Use progressive disclosure

Show the information and actions needed now. Reveal secondary complexity when requested.

Suitable patterns include:

- Expandable sections
- Advanced settings
- “Show more”
- Details drawers
- Multi-step flows
- Context menus
- Secondary dialogs

Do not hide critical information behind unexplained icons or undiscoverable gestures.

## 2.5 Reduce choice

When too many choices slow decision-making:

- Remove low-value options
- Group related options
- Recommend a default
- Split decisions into steps
- Use presets
- Order choices by relevance

Do not present every configuration possibility at once.

## 2.6 Design mobile-first, not mobile-only

Start with the smallest supported viewport to force clear prioritization.

Then adapt for larger screens by improving:

- Use of available width
- Reading measure
- Alignment
- Density
- Multi-column opportunities
- Persistent navigation or actions

Do not simply stretch mobile cards across desktop.

---

# 3. Accessibility requirements

Accessibility is part of usability and must be implemented, not added as a final audit.

## 3.1 Semantic structure

Use native HTML whenever possible:

- `<button>` for actions
- `<a>` for navigation
- `<input>`, `<select>`, and `<textarea>` for form controls
- Heading levels in logical order
- `<label>` associated with each input
- Lists for list content
- Tables only for tabular data

Do not simulate controls with generic `<div>` elements unless unavoidable.

## 3.2 Keyboard access

All interactive elements must be usable by keyboard.

Verify:

- Logical tab order
- Visible focus
- Enter and Space activation where expected
- Escape closes dismissible overlays
- Focus moves into dialogs and returns to the trigger
- No keyboard traps
- Menus, tabs, and composite widgets follow expected keyboard patterns

## 3.3 Focus visibility

Never remove focus outlines without providing a stronger replacement.

Focus indicators must be:

- Clearly visible
- Distinct from hover and selected states
- Visible against surrounding colors
- Applied consistently

Prefer `:focus-visible` for pointer-friendly behavior.

## 3.4 Contrast

Text, icons, controls, borders, and focus indicators must meet the project’s accessibility standard.

As a default, target WCAG AA:

- Normal text: at least 4.5:1
- Large text: at least 3:1
- Meaningful non-text UI boundaries and graphics: at least 3:1

Do not rely on automated contrast checks alone. Verify actual states and backgrounds.

## 3.5 Do not rely on color alone

Pair color with another signal:

- Icon
- Text label
- Pattern
- Shape
- Position
- Border treatment

Errors, warnings, success states, selected items, and chart series must remain understandable without color perception.

## 3.6 Touch targets

Interactive targets should normally be at least 44 × 44 CSS pixels on touch interfaces.

A visible icon may be smaller if the interactive hit area remains large enough.

Maintain adequate spacing between adjacent targets.

## 3.7 Motion

Respect `prefers-reduced-motion`.

Avoid motion that:

- Blocks interaction
- Delays task completion
- Causes layout instability
- Communicates information unavailable elsewhere
- Repeats indefinitely without purpose

Animation should explain change, maintain spatial context, or provide feedback.

## 3.8 Zoom and text resizing

Interfaces must remain usable at browser zoom and with increased text size.

Do not:

- Lock text to fixed-height containers
- Clip labels
- Hide overflow that contains meaningful text
- Depend on a single-line label
- Prevent page zoom

---

# 4. Color system

## 4.1 Establish hierarchy before adding color

Validate the interface in grayscale first.

Hierarchy should remain clear through:

- Size
- Weight
- Spacing
- Position
- Grouping
- Contrast
- Depth

Use color to reinforce meaning, not to rescue weak structure.

## 4.2 Use color purposefully

Reserve strong color for meaningful roles, such as:

- Primary interaction
- Selection
- Status
- Focus
- Data differentiation
- Brand expression

Do not spread the brand color across so many elements that it loses meaning.

## 4.3 Use semantic tokens

Do not assign raw colors directly to components when semantic tokens are available.

Prefer:

```css
--color-bg-canvas
--color-bg-surface
--color-bg-elevated

--color-text-primary
--color-text-secondary
--color-text-disabled
--color-text-inverse

--color-border-default
--color-border-strong
--color-border-focus

--color-action-primary
--color-action-primary-hover
--color-action-primary-active

--color-status-success
--color-status-warning
--color-status-danger
--color-status-info
```

Component tokens may reference semantic tokens.

## 4.4 Keep the palette small

Start with a limited set of useful steps instead of creating a large palette preemptively.

Each color must have:

- A name
- A role
- Supported backgrounds
- Interaction-state guidance
- Light and dark mode behavior where applicable

## 4.5 Use consistent status colors

Use status colors according to product-wide meaning:

- Success: completion or positive result
- Warning: caution or attention
- Danger: error, destructive action, or critical condition
- Info: neutral system information

Do not use the same status color for unrelated meanings.

## 4.6 Avoid pure black for large amounts of text

Use a near-black neutral for primary text when the design system supports it.

Use lighter text only when contrast remains sufficient.

Do not use faint gray for essential information.

## 4.7 Build dark mode independently

Do not mechanically invert light mode.

For dark mode:

- Preserve semantic hierarchy
- Reduce glare
- Maintain contrast without excessive brightness
- Use lighter surfaces for higher elevation
- Retest shadows, borders, focus rings, status colors, and imagery
- Avoid pure white for all text

## 4.8 Interaction states

Define all relevant states:

- Default
- Hover
- Active or pressed
- Focus-visible
- Selected
- Disabled
- Loading
- Error

State changes should be perceivable without creating layout shift.

---

# 5. Layout, grouping, and spacing

## 5.1 Group related elements

Use one or more of these signals:

- Common container
- Proximity
- Similar appearance
- Alignment
- Shared heading
- Divider when needed

Proximity should usually be the first method. Add containers only when grouping remains unclear or the component needs a distinct surface.

## 5.2 Create a clear hierarchy

The interface should communicate, in order:

1. Where the user is
2. What this screen is for
3. What needs attention
4. What action is primary
5. What information is supporting
6. What actions are secondary

Do not make headings, body text, metadata, and actions visually equal.

## 5.3 Use the squint test

Blur or visually defocus the interface.

The primary areas and actions should remain distinguishable. If everything has equal emphasis, revise size, spacing, contrast, or grouping.

## 5.4 Use a spacing scale

Use a predefined spacing system. A 4 px base scale is a practical default.

Example:

```css
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

Do not introduce arbitrary spacing unless the design system documents an exception.

## 5.5 Space by relationship

Use smaller gaps for tightly related elements and larger gaps between groups.

Typical relationship:

```text
Label
4-8 px
Control

Control
12-16 px
Helper or error text

Field group
24-32 px
Next field group

Section
40-64 px
Next section
```

Exact values should follow the product’s density and token system.

## 5.6 Use whitespace intentionally

Whitespace improves comprehension and hierarchy.

Do not remove spacing merely to fit more information above the fold. First remove low-value content and improve grouping.

## 5.7 Use grid deliberately

For desktop application layouts, a 12-column grid is a useful default, but not a requirement for every component.

Use grid and container constraints to:

- Align major page regions
- Control readable line lengths
- Create predictable responsive changes
- Avoid arbitrary widths

## 5.8 Limit alignment schemes

Prefer a dominant alignment, usually left alignment for Latin-language interfaces.

Avoid mixing centered, left-aligned, and right-aligned content without a clear structural reason.

Right-align numeric table data when comparison benefits.

## 5.9 Keep actions near their object

Place actions close to the content they affect.

Examples:

- Card actions belong in or adjacent to the card.
- Form submit actions belong after the form.
- Table-row actions belong within the row or its overflow menu.
- Dialog actions belong in the dialog.

Do not make users search for the control that operates the current object.

## 5.10 Build unbreakable layouts

Test:

- Long names
- Long translated labels
- Missing images
- Large values
- Zero values
- Hundreds of rows
- One row
- No rows
- Validation messages
- Browser zoom
- Narrow screens
- Large screens
- Slow network
- Loading and stale data

Use flexible layout primitives:

```css
min-width: 0;
overflow-wrap: anywhere;
grid-template-columns: minmax(0, 1fr) auto;
max-width: 100%;
```

Avoid fixed heights for content containers.

---

# 6. Typography

## 6.1 Keep the type system small

For product UI, prefer:

- One highly legible sans-serif family
- Regular weight
- Bold or semibold weight
- A small predefined type scale

Use a second typeface only when brand expression clearly warrants the complexity.

## 6.2 Use semantic type tokens

Example:

```css
--font-family-sans: system-ui, sans-serif;

--font-size-body-sm: 0.875rem;
--font-size-body: 1rem;
--font-size-body-lg: 1.125rem;
--font-size-title-sm: 1.25rem;
--font-size-title: 1.5rem;
--font-size-heading: 2rem;

--font-weight-regular: 400;
--font-weight-strong: 600;
--font-weight-bold: 700;
```

Do not select font sizes independently for each screen.

## 6.3 Body text

For general body copy:

- Use a readable size, commonly 16 px
- Use line-height around 1.5 for paragraphs
- Increase size for long-form reading
- Keep contrast strong
- Avoid very light font weights

Dense supporting text may be smaller only when the design system permits it and readability remains adequate.

## 6.4 Adjust line-height by size

As font size increases, proportional line-height can decrease.

Example direction:

```text
14 px text -> 20 px line-height
16 px text -> 24 px line-height
20 px text -> 28 px line-height
32 px text -> 40 px line-height
40 px text -> 48 px line-height
```

Avoid applying `line-height: 1.5` indiscriminately to large headings.

## 6.5 Control line length

Long-form text should generally remain around 40-80 characters per line.

Use:

```css
.prose {
  max-inline-size: 65ch;
}
```

Short labels, tables, and application controls are exceptions.

## 6.6 Left-align readable text

Left-align paragraphs and most interface copy in left-to-right languages.

Avoid centered paragraphs longer than a few lines.

## 6.7 Letter spacing

Use normal tracking for body text.

Large headings may use slightly tighter tracking. Uppercase labels may need slightly wider tracking but should be used sparingly.

## 6.8 Text over images

Do not place essential text directly over visually complex imagery without protection.

Use:

- A solid area
- A controlled gradient
- A scrim
- Image cropping
- Text shadow only as secondary support

Verify contrast across responsive crops.

---

# 7. Interface copy

## 7.1 Be concise

Remove words that do not change meaning.

Prefer short sentences, commonly under 20 words where practical.

Do not sacrifice necessary context merely to shorten text.

## 7.2 Use sentence case

Use sentence case for:

- Headings
- Buttons
- Tabs
- Menu items
- Form labels

Reserve title case for proper titles where the product style requires it.

Avoid uppercase for sentences and important instructions.

## 7.3 Use plain language

Prefer common, specific words.

Avoid:

- Jargon
- Slang
- Corporate filler
- Unexplained abbreviations
- Unnecessary technical terms

Write for the user, not the internal team.

## 7.4 Front-load information

Put the differentiating or important information first.

Prefer:

- “Payment failed: update your card”
- “3 messages need a response”
- “Delete this account?”

Avoid leading with generic text that forces scanning.

## 7.5 Use the inverted pyramid

Order content from most important to least important:

1. Result or key message
2. Required action
3. Supporting explanation
4. Additional details

## 7.6 Keep terminology consistent

Use one term for one concept.

Do not alternate between terms such as:

- Remove / delete
- Client / customer / member
- Message / chat / conversation
- Save / submit / finish

Follow established product vocabulary.

## 7.7 Use descriptive links

Link text must explain the destination or action.

Prefer:

- “View payment history”
- “Read accessibility settings”
- “Download invoice”

Avoid:

- “Click here”
- “Learn more” when multiple instances appear without context
- Raw URLs in interface copy

## 7.8 Write useful errors

An error message should explain:

1. What happened
2. Why, when known and useful
3. How to recover

Example:

> We could not save your changes because the connection was lost. Check your internet connection and try again.

Do not blame the user.

Place errors close to the affected field or component, and provide a summary when multiple errors occur.

---

# 8. Buttons and actions

## 8.1 Use three visual weights

Define a limited hierarchy:

- **Primary:** the most important action
- **Secondary:** important but not dominant
- **Tertiary:** low-emphasis action, often text or subtle treatment

Do not create many competing button styles.

## 8.2 Use one primary action per scope

A page, card, section, or dialog should normally have one visually dominant action.

Multiple primary buttons make prioritization unclear.

## 8.3 Label buttons with actions

Use verbs that describe the result:

- Save changes
- Send message
- Add payment
- Download report
- Delete account

Avoid vague labels:

- Continue, when the next result can be named
- Yes
- Submit
- OK

“Continue” and “Next” are acceptable in a clearly defined multi-step flow.

## 8.4 Avoid disabled buttons when possible

Disabled buttons can hide what is required and may be difficult to interpret.

Prefer an enabled action that:

- Validates on activation
- Explains what is missing
- Moves focus to the relevant field

Use disabled states when activation genuinely cannot be supported, but provide visible explanation.

## 8.5 Button placement

For left-aligned forms and content, left-aligned actions often improve scanning.

Follow platform conventions for dialogs and mobile sheets.

Keep related actions grouped. Separate destructive actions when accidental activation is costly.

## 8.6 Button targets

Maintain adequate height and hit area.

A common product UI default:

```css
.button {
  min-block-size: 44px;
  padding-inline: 16px;
}
```

Compact desktop controls may be smaller only when the product system supports them and keyboard access remains strong.

## 8.7 Icons in buttons

Use icons when they improve recognition, not as decoration.

Requirements:

- Icon and text should feel visually balanced.
- Icon direction must match locale where relevant.
- Icon-only buttons need an accessible name.
- Do not use an icon if its meaning is ambiguous.

## 8.8 Destructive actions

Add proportional friction.

For reversible, low-impact actions:

- Immediate action with Undo may be best.

For irreversible or high-impact actions:

- Use explicit confirmation
- Name the affected object
- Explain consequences
- Make the destructive action visually distinct
- Require stronger confirmation only when risk justifies it

Do not ask for confirmation on every minor action.

---

# 9. Forms

## 9.1 Prefer a single-column layout

Single-column forms maintain a clear downward path and reduce missed fields.

Use multiple columns only for tightly related short inputs, such as city, state, and postal code, and collapse them on small screens.

## 9.2 Minimize fields

Ask only for information required for the current task.

Do not collect information merely because it may be useful later.

Consider:

- Inferring values
- Reusing known data
- Deferring optional profile information
- Providing opt-ins
- Combining duplicate fields

## 9.3 Label required and optional fields clearly

Users should not have to infer whether a field is required.

Choose a consistent product-wide convention.

For example:

```text
Email
Required

Middle name
Optional
```

Do not rely only on an unexplained asterisk.

## 9.4 Match width to expected input

Field width communicates expected length.

Examples:

- Postal code: short
- State abbreviation: short
- Email address: medium or full
- Long description: multiline and wide

Responsive layouts may allow controls to fill available width while using a sensible `max-width`.

## 9.5 Use conventional fields

Controls must look interactive and retain visible boundaries.

Do not create overly minimal inputs that resemble plain text.

Show:

- Label
- Input boundary
- Current value
- Focus state
- Error state
- Disabled or read-only state when applicable

## 9.6 Never replace labels with placeholders

Placeholder text disappears and often has weak contrast.

Use a persistent visible label.

Place example formats or guidance in helper text when needed.

## 9.7 Place guidance before interaction

Put critical instructions above the field so users see them before entering data.

Use helper text below for secondary clarification.

## 9.8 Keep labels close to controls

The spacing between a label and its field should be smaller than the spacing between field groups.

## 9.9 Choose the correct control

Use:

- Radio buttons for a small visible set of mutually exclusive options
- Checkboxes for independent selections
- A switch for an immediate binary setting
- A checkbox for agreement or selection that is applied on submit
- Autocomplete for long searchable lists
- Select/dropdown for compact, familiar lists when seeing all options is not important
- Stepper or number input for bounded numeric adjustments
- Date input or date picker appropriate to the task and platform

Do not use dropdowns as the default answer to every selection problem.

## 9.10 Use positive checkbox language

Write labels that describe the selected state.

Prefer:

- “Send me product updates”
- “Remember this device”

Avoid confusing negatives:

- “Do not unsubscribe me”
- “Disable no notifications”

## 9.11 Break up long forms

Use multiple steps when grouping improves comprehension or reduces error.

Requirements:

- Show progress
- Use descriptive step names
- Preserve entered data
- Allow backward navigation
- Avoid unnecessary steps
- Provide a review step for high-impact submissions

Do not split a short form merely to make it feel sophisticated.

## 9.12 Group related fields

Use descriptive section headings.

Examples:

- Contact information
- Payment details
- Notification preferences

Avoid one large field list without structure.

## 9.13 Validation timing

Choose validation based on the field and task.

Recommended default:

- Validate format after blur or meaningful completion.
- Validate required fields on submit.
- Validate again on the server.
- Show errors near fields.
- Preserve user input.
- Focus or scroll to the first error after submit.
- Announce errors to assistive technology.

Avoid aggressive error messages while the user is still typing.

---

# 10. Responsive frontend implementation

## 10.1 Use content-driven breakpoints

Add a breakpoint when the layout no longer works, not because a device name demands it.

Prefer modern layout tools:

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
```

```css
display: flex;
flex-wrap: wrap;
gap: var(--space-4);
```

## 10.2 Preserve source order

DOM order should remain logical for:

- Screen readers
- Keyboard navigation
- Mobile layout
- Reading flow

Do not use CSS reordering to create a visual layout that conflicts with semantic order.

## 10.3 Avoid horizontal scrolling

Horizontal scrolling is acceptable for deliberate patterns such as data tables, code, or carousels.

It is not acceptable for the primary page layout.

## 10.4 Use container queries where component context matters

Components should adapt to their available space rather than assuming viewport width.

```css
.card-region {
  container-type: inline-size;
}

@container (min-width: 32rem) {
  .card {
    grid-template-columns: 10rem minmax(0, 1fr);
  }
}
```

## 10.5 Prevent layout shift

Reserve space for images and asynchronous content.

Use:

- Explicit dimensions
- `aspect-ratio`
- Skeletons matching final geometry
- Stable button labels
- Non-jumping validation placement

---

# 11. Component state requirements

Every interactive component should account for applicable states.

## Universal states

- Default
- Hover
- Focus-visible
- Active or pressed
- Disabled
- Loading

## Data states

- Initial
- Loading
- Loaded
- Empty
- Partial
- Error
- Offline
- Stale
- Permission denied

## Selection states

- Unselected
- Selected
- Indeterminate
- Current
- Expanded
- Collapsed

Do not ship only the ideal loaded state.

---

# 12. Agent workflow for UI implementation

## Step 1: Inspect before editing

Review:

- Existing components
- Design tokens
- Page layout conventions
- Typography styles
- Responsive patterns
- Accessibility utilities
- Test setup
- Product vocabulary

Do not introduce a parallel style system.

## Step 2: State the hierarchy

Before coding, identify:

```text
Page purpose:
Primary information:
Primary action:
Secondary actions:
Supporting information:
Exceptional states:
```

## Step 3: Simplify

Ask:

- Can any element be removed?
- Can choices be reduced?
- Can secondary detail be disclosed later?
- Is the primary action obvious?
- Is important information visible?

## Step 4: Build semantically

Use native HTML and logical DOM order before applying styling.

## Step 5: Apply tokens

Use existing semantic tokens for:

- Color
- Spacing
- Typography
- Radius
- Border
- Shadow
- Motion
- Z-index

Avoid raw values unless the project explicitly permits them.

## Step 6: Implement all states

Include relevant loading, empty, error, disabled, focus, hover, selected, and destructive states.

## Step 7: Test content stress

Test:

- Long text
- Short text
- Missing text
- Localization expansion
- Large datasets
- No data
- Error text
- 200% zoom
- Keyboard-only use
- Reduced motion
- Dark mode when supported

## Step 8: Review visual hierarchy

Use the squint test and verify that the primary task remains obvious.

## Step 9: Verify accessibility

At minimum:

- Semantic inspection
- Keyboard pass
- Focus pass
- Contrast check
- Accessible-name check
- Screen-reader spot check
- Automated accessibility test

## Step 10: Report decisions

When completing work, summarize:

- What changed
- Why it changed
- Components or tokens reused
- States implemented
- Accessibility considerations
- Known tradeoffs or remaining issues

---

# 13. UI review checklist

## Product and hierarchy

- [ ] The screen has one clear purpose.
- [ ] The primary action is obvious.
- [ ] Secondary actions are visually quieter.
- [ ] Important information appears before supporting detail.
- [ ] Low-value information has been removed or deferred.

## Simplicity

- [ ] Every visible element serves a purpose.
- [ ] Decorative styling does not compete with content.
- [ ] Progressive disclosure does not hide critical information.
- [ ] The number of choices is appropriate.
- [ ] Familiar patterns are used where possible.

## Accessibility

- [ ] Native semantic controls are used.
- [ ] All interactions work with keyboard.
- [ ] Focus is clearly visible.
- [ ] Text and UI contrast are sufficient.
- [ ] Meaning is not communicated by color alone.
- [ ] Touch targets are adequately sized.
- [ ] Text can resize without clipping.
- [ ] Reduced-motion preferences are respected.

## Layout

- [ ] Related elements are visibly grouped.
- [ ] Spacing follows the token scale.
- [ ] More related items are closer together.
- [ ] Alignment is consistent.
- [ ] Long content does not break the layout.
- [ ] The design works at the smallest supported width.
- [ ] Desktop layout uses space intentionally rather than stretching.

## Typography and copy

- [ ] Typography uses established tokens.
- [ ] Body text is readable.
- [ ] Long text has adequate line-height and line length.
- [ ] Text is predominantly left-aligned.
- [ ] Labels use sentence case.
- [ ] Copy is concise and plain.
- [ ] Terminology is consistent.
- [ ] Links and buttons describe their action.
- [ ] Errors explain recovery.

## Components and states

- [ ] One primary button exists per relevant scope.
- [ ] Destructive actions have proportional safeguards.
- [ ] Forms use appropriate controls.
- [ ] Labels remain visible.
- [ ] Validation timing is not disruptive.
- [ ] Loading, empty, error, and success states are implemented.
- [ ] Hover, focus, active, disabled, and selected states are defined.

---

# 14. Agent anti-patterns

Do not:

- Redesign unrelated areas while completing a focused task.
- Add a gradient, shadow, card, icon, or animation solely for visual polish.
- Create a new component when a suitable one already exists.
- Use arbitrary pixel values throughout the implementation.
- Make every action a filled primary button.
- Use color as the only state indicator.
- Hide essential labels in placeholders.
- Use icon-only controls without accessible names.
- center-align long interface copy.
- Force all content into a fixed-height card.
- Disable a button without explaining how to enable it.
- Show errors before users have had a reasonable chance to complete input.
- Use a dropdown when visible choices or autocomplete would work better.
- assume ideal content length.
- Treat accessibility as a separate phase.
- Claim completion without testing responsive and interaction states.

---

# 15. Default agent instruction block

Copy this section into a project agent file when a compact instruction set is needed.

```md
## UI/UX implementation rules

When creating or modifying frontend UI:

1. Identify the user task, primary information, and primary action before styling.
2. Keep the interface simple and familiar. Every element must have a functional reason.
3. Reduce interaction cost, cognitive load, and unnecessary choices.
4. Reuse existing components and semantic design tokens. Do not create one-off styles without justification.
5. Use native semantic HTML, full keyboard support, visible focus, sufficient contrast, and accessible names.
6. Do not rely on color alone to communicate meaning.
7. Establish hierarchy with spacing, size, position, and contrast before adding decorative color.
8. Use a small, consistent spacing and typography scale.
9. Group related elements by proximity and alignment before adding containers.
10. Use concise sentence-case copy, consistent terminology, descriptive actions, and recoverable error messages.
11. Use one primary action per page, section, card, or dialog scope.
12. Use persistent form labels and the control that best matches the task. Do not default to dropdowns.
13. Implement responsive behavior and all relevant loading, empty, error, focus, selected, disabled, and destructive states.
14. Test long content, small screens, keyboard interaction, zoom, reduced motion, and localization expansion.
15. Explain any deliberate deviation from the existing design system or these defaults.
```

---

# Attribution

This guide is a transformed, condensed implementation reference based on concepts from:

**Practical UI, 2nd edition**  
Written and designed by **Adham Dannaway**  
Copyright 2024 Adham Dannaway

It is intended to help coding agents apply the book’s principles during UX/UI and frontend work. It does not reproduce the complete text, visual examples, tutorials, or detailed rationale from the original publication.
