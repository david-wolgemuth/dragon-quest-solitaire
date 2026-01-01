# Audit and Standardize Card Descriptions

## Overview

Audit all card descriptions to ensure consistency between confirmation messages (before action) and result messages (after action). Each card should have:
- **Before action** (confirmation): Clear explanation of what WILL happen
- **After action** (result): Focus on what DID happen and the actual results

## Problem

Current card descriptions may not follow a consistent pattern for:
1. Pre-action explanations (shown in confirmation modal)
2. Post-action results (to be shown in result modal - see #ABB)

We need to ensure clear, consistent messaging that helps players understand:
- What they're about to do (before)
- What just happened (after)

## Goals

### Confirmation Messages (Before Action)
Should answer: "What will happen if I proceed?"
- Use future tense ("You will...", "This will...")
- Explain the effect clearly
- Include any conditions or requirements
- Show potential outcomes (success/failure for enemies)

### Result Messages (After Action)
Should answer: "What just happened?"
- Use past tense ("You gained...", "You took...")
- State the actual result
- Show numbers/values
- Be concise, not explanatory

## Audit Checklist

For each card type, verify:
- [ ] Has clear `description` (plain text) for basic info
- [ ] Has `descriptionHtml` (HTML) for detailed confirmation modal
- [ ] Confirmation message explains what WILL happen
- [ ] Uses appropriate tense (future/conditional)
- [ ] After resolution, appropriate feedback is provided (see #ABB)

## Card Categories to Audit

### Resource Cards
- **Gem (7 of Spades)**: "Take 1 gem" → "Gained 1 gem"
- **Healing (8 of Spades)**: "Gain 2 health..." → "Restored 2 health"
- **Treasure Chest (9 of Spades)**: "Gain 1 item..." → "Gained [Item Name]"

### Enemy Cards
- **Before**: "Fight [Enemy]. Need [X]+ to succeed. Takes [Y] damage on failure."
- **After**: "Drew [fate value]. [Success/Failure]. [Took X damage / No damage]"
- Examples:
  - Slime (10 Spades)
  - Skeleton (Jack Spades)
  - Dragon Queen (Queen Spades)
  - Troll (King Spades)
  - Young Dragon (Queen Clubs)
  - Troll King (King Clubs)

### Trap Cards
- **Visible Pit Trap (3 Spades)**:
  - Before: "Take 1 damage from this trap"
  - After: "Took 1 damage from pit trap"
- **Hidden Pit Trap (2 Spades)**:
  - Auto-resolves (see #ABA)
  - After: "Hidden pit trap! Took 2 damage"

### Passage Cards
- **Before**: "Travel through this passage. [Explain matching mechanic]"
- **After**: "Traveled through passage [to destination]"

### Special Cards
- **Exit (Ace Spades)**: Win condition
- **Merchant (Ace Clubs)**: Purchase mechanic
- **Generous Wizard (Black Joker)**: Free item
- **Other special cards**: Verify clear messaging

## Implementation Tasks

### 1. Create Audit Spreadsheet
Document current vs. proposed descriptions:
```markdown
| Card | Current Confirmation | Current Result | Proposed Confirmation | Proposed Result |
|------|---------------------|----------------|----------------------|-----------------|
| Gem  | "Take 1 gem"        | (none)         | "Gain 1 gem"         | "Gained 1 gem"  |
```

### 2. Update Card Definitions
For each card in `src/cards/dungeon-cards.js`:
- Review `description` field
- Review `descriptionHtml` field
- Ensure clarity and consistency
- Follow the tense guidelines

### 3. Add Result Messages
This task prepares for #ABB (post-resolution feedback):
- Plan what result message each card should show
- Document in the spreadsheet
- Implement when #ABB is complete

### 4. Test Consistency
- Read through all cards in-game
- Verify messages make sense
- Check for typos and clarity
- Ensure HTML formatting is correct

## Tone Guidelines

### Voice
- **Active, not passive**: "Gain 2 health" not "2 health is gained"
- **Direct**: "Take 1 damage" not "You will experience damage"
- **Concise**: Avoid unnecessary words

### Tense
- **Confirmation (before)**: Future/imperative ("Gain", "Take", "Will")
- **Result (after)**: Past tense ("Gained", "Took", "Drew")

### Numbers
- Always show specific values: "Gain 2 health" not "Gain health"
- Show current state when relevant: "3 gems → 4 gems"

## Example Transformations

### Enemy Card (Skeleton)
**Before (current):**
```
Fight Skeleton. Need 8+ to succeed. Takes 1 damage on failure.
On critical (10): Gain 1 gem.
```

**After (proposed):**
```html
<h3>Skeleton</h3>
<p><strong>Combat:</strong> Draw from fate deck.</p>
<ul>
  <li><strong>Success (8+):</strong> No damage taken</li>
  <li><strong>Critical (10):</strong> Bonus: Gain 1 gem</li>
  <li><strong>Failure:</strong> Take 1 damage</li>
</ul>
```

**Result message (after resolving):**
```
Drew 8 from fate deck.
Success! Defeated Skeleton.
No damage taken.
```

### Resource Card (Gem)
**Before (current):**
```
Take 1 gem
```

**After (proposed confirmation):**
```html
<h3>Gem</h3>
<p>Gain <strong>1 gem</strong>.</p>
<p class="hint">Gems can reduce damage or purchase from merchants.</p>
```

**Result message (after resolving):**
```
Gained 1 gem.
Gems: 3 → 4
```

## Testing Checklist

- [ ] All cards have consistent confirmation messages
- [ ] All cards have planned result messages
- [ ] Tense is appropriate (future for confirmation, past for result)
- [ ] HTML formatting is correct and renders properly
- [ ] No typos or grammatical errors
- [ ] Messages are clear and understandable for new players
- [ ] Veteran players aren't overwhelmed with obvious info

## Related Tasks

- Works with #AAZ (confirmation modal shows these messages)
- Prepares for #ABB (result messages documented here)
- Independent of #ABC (preferences don't affect content quality)

## Notes

This is primarily a content/UX task, not a technical implementation. Focus on:
1. **Consistency** - Same patterns across similar cards
2. **Clarity** - Players understand what will happen
3. **Conciseness** - Don't over-explain simple actions

Consider creating a "voice and tone" guide for future card additions.

## Priority

**Priority**: P2 (UX improvement, not critical)
**Size**: M (medium - requires reviewing ~27 dungeon cards)

This improves the player experience but isn't blocking other features. Can be done incrementally - fix the most confusing cards first, then work through the rest.
