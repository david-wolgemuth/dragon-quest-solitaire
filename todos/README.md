# Dragon Quest Solitaire - Todo List

This directory contains all task tracking for the project. Each todo is a separate markdown file with details about the task.

**T-shirt sizes**: XS (trivial) | S (small) | M (medium) | L (large) | XL (very large)

**Priorities**: P0 (critical/game-breaking) | P1 (high/major UX) | P2 (medium/nice-to-have) | P3 (low/polish)

---

## 🔥 Critical (P0) - Game-Breaking or Essential Features

These are blocking issues that prevent core gameplay or make the game feel incomplete:

- [x] P0 | M  | [#AAH](AAH-hidden-pit-trap-gem-reduction.md) | Hidden pit trap gem reduction - Completed
- [ ] P0 | L  | [#AAO](AAO-gem-damage-reduction-feature.md) | Gem damage reduction feature (UI + user input) ⚠️ **Core mechanic**
- [ ] P0 | XL | [#AAF](AAF-item-usage-logic.md) | Item usage logic (King/Queen/Jack/Jokers) ⚠️ **Core mechanic**
- [ ] P0 | M  | [#ABI](ABI-victory-defeat-screen-improvements.md) | Victory and defeat screen improvements ⚠️ **Essential UX**

---

## 💡 High Priority (P1) - Major UX Improvements

These significantly improve the user experience and should be addressed soon:

### User Onboarding & Guidance

- [ ] P1 | S  | [#ABJ](ABJ-initial-game-state-tutorial.md) | Initial tutorial/welcome modal for new players
- [ ] P1 | S  | [#ABK](ABK-visual-affordances-clickable-indicators.md) | Visual affordances for clickable elements
- [ ] P1 | S  | [#ABL](ABL-game-state-indicator.md) | Game state indicator (show current objective)
- [ ] P1 | S  | [#ABE](ABE-hover-preview-enhancement.md) | Hover preview tooltips for cards

### Gameplay Feedback

- [ ] P1 | M  | [#ABB](ABB-post-resolution-feedback.md) | Post-resolution feedback modals (show results after actions)
- [ ] P1 | M  | [#AAQ](AAQ-render-after-fate-check.md) | Show fate card during combat (essential feedback)

### Platform Support

- [ ] P1 | M  | Mobile-first responsive display ⚠️ **Large user base**

---

## 📋 Medium Priority (P2) - Nice-to-Have

These improve the experience but aren't critical for core gameplay:

### Confirmation System Enhancements

The confirmation modal system (#AAZ) is complete, but these enhancements add polish:

- [ ] P2 | S  | [#ABA](ABA-auto-resolve-metadata.md) | Add auto-resolve metadata to distinguish forced vs optional actions
- [ ] P2 | L  | [#ABC](ABC-user-preferences-system.md) | User preferences system with "don't show again" options
- [ ] P2 | M  | [#ABD](ABD-preferences-settings-ui.md) | Settings UI to manage and reset preferences
- [ ] P2 | M  | [#ABG](ABG-card-description-audit.md) | Audit and standardize card descriptions

### Quality of Life

- [ ] P2 | S  | [#ABM](ABM-undo-last-action.md) | Undo last action (Ctrl+Z)
- [ ] P2 | S  | [#AAX](AAX-remove-test-code-from-production.md) | Remove test debug code from production
- [ ] P2 | M  | [#AAY](AAY-rules-modal-with-html-card-descriptions.md) | Rules/about modal with HTML card descriptions
- [ ] P2 | M  | [#AAN](AAN-async-callback-resolution-timing.md) | Async callback resolution timing for Merchant/Wizard
- [ ] P2 | M  | [#AAP](AAP-dungeon-depletion-handling.md) | Handle dungeon deck depletion (27 cards)
- [ ] P2 | S  | [#AAR](AAR-empty-inventory-selection-ux.md) | Better UX when inventory is full
- [ ] P2 | S  | [#AAS](AAS-modal-click-race-condition.md) | Modal click-anywhere-to-close race condition
- [ ] P2 | S  | [#AAT](AAT-context-loss-in-callbacks.md) | Context loss in callbacks - fix `this` reference
- [ ] P2 | XS | [#AAU](AAU-health-maximum-enforcement.md) | Review max health implementation

### Advanced Features

- [ ] P2 | M  | Implement dungeon progression (Aces / next level)
- [ ] P2 | L  | Progressive web app download
- [ ] P2 | M  | Tutorial mode with step-by-step guidance

---

## 🎨 Low Priority (P3) - Polish & Enhancement

Nice visual and feature enhancements that can wait:

- [ ] P3 | XL | [#AAG](AAG-visual-sprites-and-tiles.md) | Visual sprites and tiled backgrounds
- [ ] P3 | M  | Local high scores
- [ ] P3 | L  | Online high scores (server/database)
- [ ] P3 | M  | Dark mode / style picker / deck picker
- [ ] P3 | S  | Card flip animations
- [ ] P3 | S  | Dungeon wipe/reset animations
- [ ] P3 | S  | Sound effects and background music
- [ ] P3 | M  | Keyboard navigation for all actions

---

## ✅ Completed

- [x] [#AAH](AAH-hidden-pit-trap-gem-reduction.md) | Hidden pit trap automatic gem reduction - Completed
- [x] [#AAZ](AAZ-confirmation-modal-system.md) | Re-enable and enhance confirmation modal system - Completed
- [x] [#ABF](ABF-place-card-confirmation-message.md) | Replace placeholder "place card" confirmation message - Completed
- [x] [#AAA](AAA-file-organization.md) | Reorganize files into src/ and docs/ - Completed in #5
- [x] [#AAD](AAD-critical-missing-game-functions.md) | Missing defeatDragonQueen() and resetDungeon() - Completed in #16
- [x] [#AAM](AAM-typos-fix.md) | Fix typos in card descriptions - Completed in #17
- [x] [#AAB](AAB-critical-user-input-buttons.md) | User input buttons not rendered - Completed
- [x] [#AAC](AAC-critical-game-over-detection.md) | No game over detection - add health check - Completed in #6
- [x] [#AAE](AAE-critical-fate-deck-duplication.md) | Fate deck duplication - Already fixed
- [x] [#AAI](AAI-generous-wizard-costs-gem.md) | Generous Wizard costs gem - Completed
- [x] [#AAJ](AAJ-young-dragon-wrong-gem-amount.md) | Young Dragon gives 3 gems on critical - Fixed
- [x] [#AAK](AAK-passage-resolver-wrong-parameters.md) | Passage resolver wrong parameters - Fixed in #12
- [x] [#AAL](AAL-passages-match-resolved-cards.md) | Passages match resolved cards - Documented
- [x] [#AAV](AAV-store-state-in-url.md) | Store game state in URL for QA/testing - Completed in #4
- [x] [#AAW](AAW-refactor-fixture-code-duplication.md) | Extract shared fixture reconstruction logic - Completed in #5
- [x] Dungeon grid rendering (7 wide × 5 high)
- [x] Tile placement logic and dungeon expansion
- [x] Inventory section rendering
- [x] Fate deck rendering
- [x] Game loop with reset functionality
- [x] Resource card logic (gems, treasure chest, healing fountain)
- [x] Enemy logic (slimes, skeletons, trolls, dragons)
- [x] Fate check system

---

## 📊 Priority Rationale

### What Makes P0 Critical?

Items are P0 if they:
- Break core game mechanics (gems, items)
- Make the game feel incomplete (victory/defeat screens)
- Prevent players from experiencing the full game

### What Makes P1 High Priority?

Items are P1 if they:
- Significantly improve UX for all players
- Remove major friction points (confusion, unclear interactions)
- Support major platforms (mobile)
- Provide essential feedback (combat results, game state)

### What Makes P2 Medium Priority?

Items are P2 if they:
- Add polish to existing features
- Improve edge cases or advanced scenarios
- Enhance but don't fundamentally change the experience

### What Makes P3 Low Priority?

Items are P3 if they:
- Are purely cosmetic/aesthetic
- Add "nice-to-have" features
- Target niche use cases or preferences

---

## 🎯 Recommended Implementation Order

For new contributors, consider this order to maximize impact:

### Phase 1: Core Mechanics (P0)
1. **AAH** - Hidden pit trap gem reduction (enables gem mechanic)
2. **AAO** - Gem damage reduction UI (completes gem mechanic)
3. **AAF** - Item usage logic (enables inventory mechanic)
4. **ABI** - Victory/defeat screens (completes game loop)

### Phase 2: Onboarding (P1)
5. **ABJ** - Initial tutorial (helps new players)
6. **ABK** - Visual affordances (makes UI clear)
7. **ABL** - Game state indicator (guides players)

### Phase 3: Feedback (P1)
8. **ABB** - Post-resolution feedback (shows what happened)
9. **AAQ** - Show fate card during combat (essential combat feedback)
10. **ABE** - Hover tooltips (preview card effects)

### Phase 4: Platform Support (P1)
11. **Mobile responsive** - Support mobile users

### Phase 5: Polish (P2)
12. Everything else based on interest and impact

---

## 📝 Contributing

See **[CONTRIBUTING.md](../CONTRIBUTING.md)** for detailed guidelines on:
- Picking a task
- Writing tests first
- Creating fixtures for QA
- Submitting PRs

---

## 🏷️ Legend

- ⚠️ **Core mechanic** - Essential gameplay feature
- ⚠️ **Essential UX** - Critical user experience element
- ⚠️ **Large user base** - Affects many users (e.g., mobile)
