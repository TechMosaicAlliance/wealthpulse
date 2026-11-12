# Design Brief: WealthPulse

## Direction
WealthPulse — Premium fintech portfolio tracker with glassmorphic dark 2026 aesthetic, real-time net worth tracking, and AI-powered trade detection.

## Tone
Refined, trustworthy premium fintech. Glass cards on near-black with minimal visual noise. Blue for primary actions, orange for warnings, green for gains, red for losses. Mobile-first.

## Differentiation
Account type switcher (glass pill buttons) + mini volatility heatmap for risk balance + email-scan schedule in Settings create an accessible yet sophisticated portfolio dashboard.

## Color Palette
| Token | OKLCH | Role |
|-------|-------|------|
| background | 0.065 0 0 | Near-black foundation |
| foreground | 0.96 0 0 | High-contrast text |
| card | 0.1 0 0 | Glass base with 10% white overlay + 8px blur |
| primary | 0.58 0.22 264 | Stocks, Fortress, primary actions |
| accent | 0.72 0.19 50 | Warnings, volatility growth assets |
| success | 0.68 0.18 155 | Gains, positive indicators |
| destructive | 0.58 0.22 25 | Losses, negative indicators |

## Typography
- Display: Space Grotesk 600 — hero numbers, page titles
- Body: Inter 400/500 — content, labels, descriptions
- Scale: hero 28px, h2 20px, label 14px, body 14px, caption 12px

## Elevation & Depth
Glassmorphic cards (glass, glass-sm, glass-strong) with backdrop blur create layered depth. No flat backgrounds. Every card sits above the near-black base.

## Structural Zones
| Zone | Background | Border | Notes |
|------|------------|--------|-------|
| Header | glass-strong (12% white, 16px blur) | white/10% | Fixed 60px, NGN/USD toggle top-right |
| Content | 0.065 0 0 (near-black) | — | Scrollable 16px gutters, glass cards stacked |
| BottomNav | glass (7% white, 8px blur) | white/10% | Fixed 56px, 4 tabs: Home / Summary / Accounts / Growth |
| Hero Card | glass-strong | white/15% | Net Worth tappable, shadows lifted |
| Mini Section | glass | white/8% | Heatmap, Performance charts |

## Spacing & Rhythm
16px gutters, 12px/16px/24px section gaps. Glass cards stack vertically with 8px gap on mobile. Touch targets minimum 44px.

## Component Patterns
- Hero card: Net Worth (tappable → Accounts page), Liquid Cash, Performance section stacked
- Account switcher: Glass pill buttons (All / Crypto / Stocks / Bonds / Funds), single-select
- Mini heatmap: 4x4 grid, steady blue Fortress / pulsating orange Growth
- Trade badge: Stock / Crypto / Bond / Mutual Fund labels, compact cards
- Settings: Toggle (auto-scan) + dropdown (1h / 3h / daily / weekly intervals)

## Motion
- Tab switch: 200ms fade
- Volatility pulse: 1.5s cycle (opacity 1.0 → 0.6 → 1.0, scale 1.0 → 0.96)
- Transition default: 0.3s cubic-bezier(0.4, 0, 0.2, 1)

## Constraints
- Mobile-first 360–480px, responsive to 768px tablet
- Glassmorphic cards only, no flat panels
- All colors via OKLCH tokens, no hardcoded hex
- Dark mode only (no light theme)
- NGN primary display currency with USD toggle
- Email scan intervals: custom (1h / 3h / daily / weekly)

## Signature Detail
Account type switcher as glass pill buttons (All / individual accounts) enables instant view filtering without page navigation — keeping complex portfolio data scannable on mobile. Combined with mini heatmap, users see risk balance at a glance.
