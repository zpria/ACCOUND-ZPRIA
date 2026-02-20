# FloatingInput Component

<cite>
**Referenced Files in This Document**
- [FloatingInput.tsx](file://components/FloatingInput.tsx)
- [SignupPage.tsx](file://pages/SignupPage.tsx)
- [SigninPage.tsx](file://pages/SigninPage.tsx)
</cite>

## Update Summary
**Changes Made**
- Enhanced mobile responsiveness with reduced height (h-[64px] vs h-[74px]) for "DPI reduction" feel
- Improved invalid state styling with enhanced visual feedback system
- Added comprehensive error message display system with dedicated errorMessage prop
- Updated prop interface to include error handling capabilities

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
FloatingInput is a reusable form field component that implements a modern floating label animation. It supports both input and select modes, manages focus and value states to drive the label position and styling, and integrates with Tailwind-based design tokens for responsive behavior across mobile and desktop. The component exposes a compact set of props for labeling, validation states, select mode, and standard input attributes, while providing a consistent visual language aligned with the application's design system.

**Updated** Enhanced with improved mobile responsiveness, advanced error handling, and refined visual feedback systems.

## Project Structure
FloatingInput is located under the components directory and is consumed by page-level forms such as the sign-up and sign-in flows.

```mermaid
graph TB
subgraph "Components"
FI["FloatingInput.tsx"]
end
subgraph "Pages"
SP["SignupPage.tsx"]
SI["SigninPage.tsx"]
end
SP --> FI
SI --> FI
```

**Diagram sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L1-L90)
- [SignupPage.tsx](file://pages/SignupPage.tsx#L175-L224)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L130-L195)

**Section sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L1-L90)

## Core Components
FloatingInput renders either an input or a select element depending on the isSelect prop. It maintains internal focus state and derives whether the label should float based on focus or presence of non-empty value. The component composes Tailwind classes to reflect focus, invalid, and disabled states, and applies a custom SVG arrow for select mode.

Key behaviors:
- Focus-driven label animation: label floats above the input when focused or when there is a non-empty value.
- Dual-mode rendering: input or select based on isSelect.
- Validation-aware styling: invalid state changes border and label color with enhanced visual feedback.
- Responsive sizing: reduced height on mobile versus desktop for a refined DPI feel.
- Select-specific UX: custom arrow indicator and transparent text when no selection is made.
- Error message display: dedicated errorMessage prop for comprehensive error handling.

**Updated** Enhanced error handling system with improved visual feedback and better mobile responsiveness.

**Section sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L11-L84)

## Architecture Overview
FloatingInput encapsulates state and styling logic internally, exposing a minimal prop interface. Consumers pass standard input attributes (including onChange, value, name, etc.), and FloatingInput augments them with focus handlers and computed classes.

```mermaid
sequenceDiagram
participant U as "User"
participant FI as "FloatingInput"
participant DOM as "DOM Element"
U->>FI : "Render with props"
FI->>DOM : "Mount input/select with focus handlers"
U->>DOM : "Focus"
DOM->>FI : "onFocus event"
FI->>FI : "Set isFocused=true"
FI->>DOM : "Apply floating label classes"
U->>DOM : "Change value"
DOM->>FI : "onChange updates props.value"
FI->>FI : "Compute hasValue and isFloating"
FI->>DOM : "Update label and container classes"
U->>DOM : "Blur"
DOM->>FI : "onBlur event"
FI->>FI : "Set isFocused=false"
FI->>DOM : "Restore label and container classes"
```

**Diagram sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L21-L23)
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L55-L69)

## Detailed Component Analysis

### Floating label animation system
The floating label is controlled by two state signals:
- Focus state: isFocused toggles when the element receives focus.
- Value presence: hasValue is derived from props.value and excludes sentinel zero-like placeholders.

The floating condition is isFloating = isFocused OR hasValue. The label's position and typography adjust accordingly, including top offset, font size, weight, and color.

```mermaid
flowchart TD
Start(["Render FloatingInput"]) --> GetProps["Read props.value<br/>and derive value string"]
GetProps --> ComputeHasValue["hasValue = (value length > 0)<br/>AND NOT sentinel zeros"]
ComputeHasValue --> ComputeFloating["isFloating = isFocused OR hasValue"]
ComputeFloating --> ApplyLabelClasses["Apply label classes:<br/>position, size, weight, color"]
ApplyLabelClasses --> End(["Render label"])
```

**Diagram sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L21-L23)
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L33-L40)

**Section sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L21-L23)
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L33-L40)

### State management for focus and value detection
- Internal state: isFocused tracks focus events.
- Value detection: value is coerced to string; hasValue ignores sentinel placeholder values used for month/day/year and year fields in forms.
- Event handlers: onFocus and onBlur update isFocused and forward original handlers if provided.

```mermaid
flowchart TD
A["onFocus handler"] --> B["isFocused = true"]
B --> C["Forward original onFocus if present"]
D["onBlur handler"] --> E["isFocused = false"]
E --> F["Forward original onBlur if present"]
G["onChange updates props.value"] --> H["Recompute hasValue and isFloating"]
```

**Diagram sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L55-L56)
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L64-L65)
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L20-L23)

**Section sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L21-L23)
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L52-L69)

### Dual-mode functionality: input and select
- Mode selection: isSelect determines whether to render an input or a select.
- Select customization: children are passed to the select; a custom SVG arrow is rendered for select mode.
- Transparent text for unselected select: when not floating, the select text appears transparent to hide placeholder text until a selection is made.

```mermaid
classDiagram
class FloatingInput {
+label : string
+isSelect? : boolean
+isInvalid? : boolean
+errorMessage? : string
+children? : ReactNode
+className? : string
+render() : JSX.Element
}
class InputMode {
+renderInput() : JSX.Element
}
class SelectMode {
+renderSelect() : JSX.Element
+renderArrow() : JSX.Element
}
FloatingInput --> InputMode : "renders when !isSelect"
FloatingInput --> SelectMode : "renders when isSelect"
```

**Diagram sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L52-L78)

**Section sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L52-L78)

### Sophisticated styling system with dynamic class switching
The component builds Tailwind-based class strings for:
- Container: border, rounded corners, background, hover/focus rings, disabled opacity, and invalid state highlighting.
- Label: position, typography, and color that adapt to floating state, focus, and invalid state.
- Input: padding, height, text size, and select-specific appearance and transparency.

Responsive behavior:
- Rounded corners: md:rounded for larger screens.
- Typography: md: variants for label and text sizes.
- Height: h-[64px] on mobile vs h-[74px] on desktop for a refined DPI feel.

Validation and disabled states:
- Invalid: red border, subtle red shadow, and label color change with enhanced visual feedback.
- Focus: blue border and ring.
- Disabled: reduced opacity and muted background.

**Updated** Enhanced invalid state styling with improved visual feedback and better error message display system.

**Section sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L25-L47)

### Responsive design implementation
- Mobile-first heights: input height is smaller on mobile to reduce perceived density and improve DPI feel.
- Desktop scaling: md: prefixes increase padding, text size, and label positioning.
- Rounded corners: md:rounded increases on larger screens for a more open feel.

**Updated** Reduced mobile height from h-[74px] to h-[64px] for better visual density and touch target ergonomics.

**Section sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L43-L47)

### Enhanced error handling and validation system
The component now includes comprehensive error handling capabilities:
- errorMessage prop: Dedicated property for displaying custom error messages below the input field.
- Conditional rendering: Error messages only appear when isInvalid is true and errorMessage is provided.
- Styling integration: Error messages use consistent red color scheme matching the invalid state styling.

```mermaid
flowchart TD
A["isInvalid prop"] --> B{"isInvalid = true?"}
B --> |Yes| C["Check errorMessage"]
B --> |No| D["Hide error message"]
C --> E{"errorMessage exists?"}
E --> |Yes| F["Display error message with red styling"]
E --> |No| G["Hide error message"]
F --> H["Enhanced visual feedback"]
```

**Diagram sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L82-L84)

**Section sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L8-L10)
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L82-L84)

### Prop documentation
- label: string — The floating label text.
- isSelect?: boolean — Enables select mode; defaults to false (input mode).
- isInvalid?: boolean — Applies invalid state styling (red border and label) with enhanced visual feedback.
- errorMessage?: string — Optional error message displayed below the input when validation fails.
- children?: ReactNode — Required in select mode to populate option elements.
- className?: string — Additional Tailwind classes appended to the container.
- Standard input attributes (e.g., name, value, onChange, onFocus, onBlur, disabled, required) are forwarded to the underlying input/select element.

Usage examples in the codebase:
- Input mode with label and standard attributes.
- Select mode with isSelect and children for options.
- Select mode with transparent text when no selection is made.
- Comprehensive error handling with errorMessage prop.

**Updated** Added errorMessage prop for enhanced error message display system.

**Section sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L4-L10)
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L11-L18)
- [SignupPage.tsx](file://pages/SignupPage.tsx#L260-L261)
- [SignupPage.tsx](file://pages/SignupPage.tsx#L265-L278)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L133-L138)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L158-L164)

### Usage examples
- Integration with forms:
  - Input fields for names and identifiers.
  - Select dropdowns for date-of-birth components and gender/country selection.
- Validation patterns:
  - Using isInvalid to reflect backend or client-side validation failures.
  - Combining with form-level validation to highlight invalid states.
  - Implementing real-time error messaging with errorMessage prop.
- Accessibility features:
  - Proper label association via the label element.
  - Focus management through onFocus/onBlur handlers.
  - Disabled state support for read-only or conditional fields.

**Updated** Enhanced with comprehensive error handling patterns and real-time validation examples.

**Section sources**
- [SignupPage.tsx](file://pages/SignupPage.tsx#L175-L224)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L130-L195)

### Custom SVG arrow for select elements
- A small arrow icon is rendered inside the container for select mode.
- Positioned absolutely at the trailing edge and vertically centered.
- Uses a simple path with stroke and fixed stroke width for consistent appearance.

**Section sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L72-L80)

### Design philosophy behind the floating label behavior
- Minimalist, clean input surfaces with floating labels that reduce cognitive load by keeping labels visible during interaction.
- Consistent motion: smooth transitions for label movement and container state changes.
- Responsive refinement: subtle adjustments in size and spacing to improve readability and touch target ergonomics on mobile devices.
- Validation clarity: explicit invalid state feedback without cluttering the layout.
- Enhanced error communication: clear, accessible error messaging that complements visual feedback.

**Updated** Enhanced with improved error communication and visual feedback systems.

**Section sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L33-L40)
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L25-L31)
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L43-L47)

## Dependency Analysis
FloatingInput depends on React for state and rendering. It does not import any external libraries; styling relies on Tailwind utility classes and the application's design tokens.

```mermaid
graph LR
React["React"] --> FI["FloatingInput.tsx"]
FI --> Tailwind["Tailwind Utility Classes"]
FI --> AppForms["Form Pages (SignupPage, SigninPage)"]
```

**Diagram sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L2-L2)
- [SignupPage.tsx](file://pages/SignupPage.tsx#L6)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L6)

**Section sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L2-L2)
- [SignupPage.tsx](file://pages/SignupPage.tsx#L6)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L6)

## Performance Considerations
- Rendering cost: The component computes classes on each render; keep re-renders minimal by lifting state to parent forms.
- Event handlers: onFocus/onBlur are lightweight; avoid unnecessary re-renders in consumers.
- Select mode: children are passed directly to select; ensure option lists are generated efficiently.
- Error handling: errorMessage prop evaluation is constant-time; minimal performance impact.

## Troubleshooting Guide
- Label not floating:
  - Ensure value is non-empty and not equal to sentinel placeholder values.
  - Confirm focus events are firing and not overridden by consumer handlers.
- Select shows placeholder text:
  - In select mode without a selection, text appears transparent; select an option to display it.
- Invalid state not visible:
  - Pass isInvalid to enable red border and label styling.
  - Ensure errorMessage is provided for comprehensive error messaging.
- Disabled state not applied:
  - Ensure disabled is passed to the component; confirm Tailwind utilities are available.
- Error message not displaying:
  - Verify both isInvalid and errorMessage props are set.
  - Check that errorMessage is a non-empty string.

**Updated** Added troubleshooting guidance for enhanced error handling system.

**Section sources**
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L20-L23)
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L27-L29)
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L46-L47)
- [FloatingInput.tsx](file://components/FloatingInput.tsx#L82-L84)

## Conclusion
FloatingInput delivers a cohesive, accessible, and visually consistent input experience across input and select modes. Its floating label animation, responsive sizing, and validation-aware styling integrate seamlessly with form flows, while its minimal prop surface keeps integration straightforward. The enhanced error handling system provides comprehensive validation feedback, and the improved mobile responsiveness ensures optimal user experience across all device sizes.

**Updated** Enhanced with improved error handling capabilities and refined mobile responsiveness for better user experience.

## Appendices
- Example usage patterns are demonstrated in the sign-up and sign-in pages, showcasing both input and select modes with realistic form data binding, validation, and comprehensive error messaging.
- The component now supports advanced validation scenarios with real-time error feedback and enhanced visual indicators.