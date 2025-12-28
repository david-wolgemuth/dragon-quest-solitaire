# Dragon Quest Solitaire - Todo List

This directory contains all task tracking for the project. Each todo is a separate markdown file with details about the task.

**T-shirt sizes**: XS (trivial) | S (small) | M (medium) | L (large) | XL (very large)

**Priorities**: P0 (critical/game-breaking) | P1 (high/major bugs) | P2 (medium/nice-to-have) | P3 (low/polish)

## On Deck

Quick wins and critical fixes - sorted by impact and ease of implementation:

- [ ] P0 | XS | [#E](E-critical-fate-deck-duplication.md) | Fate deck duplication - add 1 line to clear array
- [ ] P0 | XS | [#B](B-critical-user-input-buttons.md) | User input buttons not rendered - add appendChild
- [ ] P1 | XS | [#I](I-generous-wizard-costs-gem.md) | Generous Wizard costs gem - remove 1 line
- [ ] P1 | XS | [#J](J-young-dragon-wrong-gem-amount.md) | Young Dragon gives 1 gem instead of 3 - change parameter
- [ ] P1 | XS | [#K](K-passage-resolver-wrong-parameters.md) | Passage resolver wrong parameters - remove `this`
- [ ] P2 | XS | [#M](M-typos-fix.md) | Fix typos in card descriptions
- [ ] P1 | S  | [#L](L-passages-match-resolved-cards.md) | Passages match resolved cards - add face-up check
- [ ] P0 | M  | [#D](D-critical-missing-game-functions.md) | Missing defeatDragonQueen() and resetDungeon()
- [ ] P1 | M  | [#H](H-hidden-pit-trap-gem-reduction.md) | Hidden pit trap gem reduction not implemented

## Backlog

Everything else - larger features, design decisions needed, or lower priority:

- [ ] P2 | S  | [#X](X-remove-test-code-from-production.md) | Remove test debug code from production
- [ ] P2 | M  | [#N](N-async-callback-resolution-timing.md) | Async callback resolution timing for Merchant/Wizard
- [ ] P2 | M  | [#P](P-dungeon-depletion-handling.md) | Handle dungeon deck depletion (27 cards)
- [ ] P2 | M  | [#Q](Q-render-after-fate-check.md) | Show fate card during combat
- [ ] P2 | S  | [#R](R-empty-inventory-selection-ux.md) | Better UX when inventory is full
- [ ] P2 | S  | [#S](S-modal-click-race-condition.md) | Modal click-anywhere-to-close race condition
- [ ] P2 | S  | [#T](T-context-loss-in-callbacks.md) | Context loss in callbacks - fix `this` reference
- [ ] P2 | XS | [#U](U-health-maximum-enforcement.md) | Review max health implementation
- [ ] P1 | L  | [#O](O-gem-damage-reduction-feature.md) | Gem damage reduction feature (UI + user input)
- [ ] P1 | XL | [#F](F-item-usage-logic.md) | Item usage logic (King/Queen/Jack/Jokers)
- [ ] P2 | XL | [#G](G-visual-sprites-and-tiles.md) | Visual sprites and tiled backgrounds
- [ ] P1 | M  | Implement dungeon progression (Aces / next level)
- [ ] P2 | L  | Progressive web app download
- [ ] P2 | M  | Tutorial mode with confirmation prompts
- [ ] P2 | M  | Mobile-first responsive display
- [ ] P3 | M  | Credits/about page
- [ ] P3 | S  | Printable version of rules
- [ ] P3 | M  | Local high scores
- [ ] P3 | L  | Online high scores (server/database)
- [ ] P3 | M  | Dark mode / style picker / deck picker
- [ ] P3 | S  | Card flip animations
- [ ] P3 | S  | Dungeon wipe/reset animations

## Completed

- [x] [#A](A-file-organization.md) | Reorganize files into src/ and docs/ - Completed in #5
- [x] [#C](C-critical-game-over-detection.md) | No game over detection - add health check - Completed in #6
- [x] [#V](V-store-state-in-url.md) | Store game state in URL for QA/testing/agents - Completed in #4
- [x] [#W](W-refactor-fixture-code-duplication.md) | Extract shared fixture reconstruction logic - Completed in #5
- [x] Dungeon grid rendering (7 wide × 5 high)
- [x] Tile placement logic and dungeon expansion
- [x] Inventory section rendering
- [x] Fate deck rendering
- [x] Game loop with reset functionality
- [x] Resource card logic (gems, treasure chest, healing fountain)
- [x] Enemy logic (slimes, skeletons, trolls, dragons)
- [x] Fate check system
