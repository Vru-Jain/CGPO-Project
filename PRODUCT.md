# Product

## Register

brand

## Users

Final-year CS/engineering peers, academic supervisors and external examiners, technical recruiters, and open-source contributors. They arrive either to evaluate the research (examiners, supervisors) or to assess the engineering quality (recruiters, contributors). They are technically literate and will read code, not just copy.

The dashboard (`/dashboard`) is a product surface used by the same audience to run live optimizations and explore results. Design there serves the tool; design on the landing page (`/`) is the product itself.

## Product Purpose

CGPO is a final-year research project that combines Graph Neural Networks and Reinforcement Learning to build, optimize, and benchmark financial portfolios against global indices in real-time. The landing page exists to communicate the technical sophistication and research rigor of the system. The dashboard exists to let users actually run the AI and see it work.

Success on the landing: an examiner or recruiter immediately understands what the system does and why it is technically interesting, with no marketing copy required. Success on the dashboard: a user can run an optimization end-to-end without friction.

## Brand Personality

Precise, intelligent, credible.

Voice is direct and specific. No superlatives, no adjectives that require trust ("powerful", "seamless", "state-of-the-art"). Describe what the system literally does. Numbers and system names over abstractions.

## Anti-references

- **Generic AI SaaS** (cream/white bg, blue hero, icon+heading+text feature cards in a 3-col grid, "metric theater" stat blocks). The Vercel/Linear aesthetic pushed into startup-template territory.
- **Academic paper / university site** (white bg, no visual hierarchy, wall-of-text sections, no typographic craft).
- **Crypto/Web3 hype** (neon accents, glitch effects, aggressive scroll animations, urgency-bait copy).
- **Generic dark SaaS** (AI-purple glows, glassmorphism used decoratively everywhere, identical stat cards, gradient text on headings, animated number counters as section openers).

## Design Principles

1. **Credibility through specificity.** The system is described by what it literally does (A2C agent, Sharpe ratio, T4 GPU) not by what it promises ("intelligent", "powerful"). Specific technical language is the brand voice.
2. **Show the system, don't narrate it.** The graph visualization, benchmark comparison chart, and execution log are more persuasive than any copy. Surface the actual output wherever possible.
3. **Dark as a reasoned choice, not a trend.** Dark theme is appropriate because this is a data-visualization-heavy tool viewed under focused conditions. The darkness should feel calibrated, not fashionable.
4. **Precision in every detail.** Spacing, typography, data formatting, icon stroke weight, and border opacity should all feel considered and exact. Sloppiness in the UI signals sloppiness in the research.
5. **Restraint earns trust.** Remove anything that does not serve comprehension. Decoration that cannot be justified by function should be cut.

## Accessibility & Inclusion

WCAG AA minimum. Body text must hit 4.5:1 contrast against background. All interactive elements keyboard-navigable. Reduced motion honored for all animations. Color never the only signal.
