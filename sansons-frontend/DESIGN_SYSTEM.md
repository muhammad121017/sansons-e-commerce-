# SANSONS - Enterprise Design System

Welcome to the central design repository for SANSONS. This document outlines the core tokens, components, and accessibility guidelines that make up the visual language of the platform.

**Every future feature must automatically inherit from this system.**

## 1. Design Tokens Architecture
The design system is powered by Tailwind CSS v4's new `@theme` API, centralized entirely within `src/app/globals.css`.

### Colors
We do not use arbitrary Tailwind colors (`bg-red-500`, `text-blue-200`). All UI must utilize our semantic layers:
- **Backgrounds**: `bg-background` (Page base), `bg-surface` (Cards/Modals)
- **Text**: `text-primary`, `text-secondary`, `text-muted`
- **Brand**: `brand-primary`, `brand-secondary`, `brand-accent`
- **Feedback**: `success`, `warning`, `danger`, `info`

### Typography
- **Font Stack**: Inter (Sans, standard UI) and Outfit (Display, headers).
- **Scale**: Custom line-heights and letter-spacing for premium readability (`--text-body-small`, `--text-h1`).

### Spacing & Layout
- **Gradients**: All spacing relies on the standard 4px scale.
- **Radii**: 
  - `--radius-sm` (4px): Inputs, Checkboxes
  - `--radius-md` (8px): Buttons, Selects
  - `--radius-xl` (16px): Dialogs
  - `--radius-3xl` (24px): Cards, Hero blocks

### Motion & Transitions
Never use raw durations like `duration-300`.
- `--animate-transition-duration-fast` (150ms)
- `--animate-transition-duration-normal` (250ms)
- `--animate-transition-duration-slow` (400ms)

## 2. Reusable Component Library
The UI library is located in `src/components/ui/`. Every component is strictly typed using TypeScript and utilizes `clsx`/`tailwind-merge` (`cn` utility) for scalable overriding.

### Key Components:
- **Button.tsx**: Single source of truth for actions (Primary, Secondary, Outline, Danger).
- **Input.tsx / Form**: Standardized focus rings (`focus:ring-2 focus:ring-brand-primary`) and ARIA labels.
- **Card.tsx**: Standardized surface containers.
- **PremiumImage.tsx**: Mandated wrapper for `next/image` providing skeleton loaders, fade-in animations, and preventing Layout Shifts (CLS).
- **Toast.tsx**: Centralized, accessible notifications.

## 3. Accessibility & Responsive Rules
- **Keyboard Navigation**: All interactive elements MUST have `focus:ring` states.
- **Reduced Motion**: The system globally suppresses animations via `prefers-reduced-motion` in `globals.css`. Do not override this.
- **ARIA Labels**: All icon-only buttons require `aria-label`.
- **Responsive**: Mobile-first architecture. Do not use desktop-first max-width breakpoints.

## 4. Development Workflow
Before submitting code, ensure:
1. No raw hex codes exist (`#FF0000`).
2. No raw pixel spacing (`margin: 15px`).
3. Component is added to `/design-system` page for visual QA.
4. `npm run lint` and `npm run build` pass without warnings.
