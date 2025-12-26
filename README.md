# [WIP] Dragon Quest Solitaire

A solitaire card game inspired by Dragon Quest, built with vanilla JavaScript.

## 📋 Task List

For detailed task tracking, see [todos/README.md](todos/README.md)

### Critical (P0) - Must Fix 🔴
- [#001 - File Organization](todos/001-file-organization.md) - Reorganize project structure
- [#002 - User Input Buttons Not Rendered](todos/002-critical-user-input-buttons.md) - Fix Merchant/Wizard selection
- [#003 - Game Over Detection](todos/003-critical-game-over-detection.md) - Implement game over when health reaches 0
- [#004 - Missing Game Functions](todos/004-critical-missing-game-functions.md) - Implement victory and dungeon reset
- [#005 - Fate Deck Duplication](todos/005-critical-fate-deck-duplication.md) - Fix fate deck card duplication bug

### High Priority (P1) - Should Fix 🟡
- [#006 - Item Usage Logic](todos/006-item-usage-logic.md) - Implement King/Queen/Jack/Joker usage
- [#008 - Hidden Pit Trap Gem Reduction](todos/008-hidden-pit-trap-gem-reduction.md) - Implement automatic gem usage
- [#009 - Generous Wizard Costs Gem](todos/009-generous-wizard-costs-gem.md) - Remove incorrect gem cost
- [#010 - Young Dragon Wrong Gem Amount](todos/010-young-dragon-wrong-gem-amount.md) - Give 3 gems instead of 1
- [#011 - Passage Resolver Wrong Parameters](todos/011-passage-resolver-wrong-parameters.md) - Fix passage parameter bug
- [#012 - Passages Match Resolved Cards](todos/012-passages-match-resolved-cards.md) - Only match face-up passages
- [#015 - Gem Damage Reduction Feature](todos/015-gem-damage-reduction-feature.md) - Let players use gems to reduce damage
- Implement dungeon progression (Aces)

### Medium Priority (P2) - Nice to Have 🟢
- [#007 - Visual Sprites and Tiles](todos/007-visual-sprites-and-tiles.md) - Replace cards with Dragon Quest sprites
- [#013 - Typos Fix](todos/013-typos-fix.md) - Fix typos in card descriptions
- [#014 - Async Callback Resolution Timing](todos/014-async-callback-resolution-timing.md) - Fix Merchant/Wizard timing
- [#016 - Dungeon Depletion Handling](todos/016-dungeon-depletion-handling.md) - Handle all 27 cards placed
- [#017 - Render After Fate Check](todos/017-render-after-fate-check.md) - Show fate card during combat
- Progressive web app download
- Tutorial mode with confirmation prompts
- Mobile-first responsive display

### Low Priority (P3) - Future 🔵
- [#018 - Empty Inventory Selection UX](todos/018-empty-inventory-selection-ux.md) - Better UX when inventory full
- [#019 - Modal Click Race Condition](todos/019-modal-click-race-condition.md) - Investigate event bubbling
- [#020 - Context Loss in Callbacks](todos/020-context-loss-in-callbacks.md) - Fix `this` in callbacks
- [#021 - Health Maximum Enforcement](todos/021-health-maximum-enforcement.md) - Review max health logic
- Credits/about page
- Printable rules
- Local high scores
- Online high scores
- Store state in URL
- Dark mode / style picker / deck picker
- Card flip animations
- Dungeon reset animations

### ✅ Completed
- Dungeon grid rendering (7 wide × 5 high)
- Tile placement logic
- Inventory rendering
- Fate deck rendering
- Game loop with reset
- Resource card logic (gems, treasure, healing)
- Enemy logic (slimes, skeletons, trolls, dragons)
- Fate check system

## 📚 Documentation

- [Game Rules](GAME_RULES.md) - How to play
- [Code Structure](CODE_STRUCTURE_ANALYSIS.md) - Technical analysis
- [Testing Strategy](TESTING_STRATEGY.md) - Test coverage
- [Bug Report](BUG_REPORT.md) - Known issues (to be migrated to todos)
- [Deployment](DEPLOYMENT.md) - Deployment setup
- [Agents](AGENTS.md) - AI agent notes
