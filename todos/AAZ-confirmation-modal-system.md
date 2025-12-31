# Re-enable and Enhance Confirmation Modal System

## Overview

Currently, the tutorial modal system exists in the codebase (see `game-renderer.js:136-157`) but is disabled with a bypass (`onAccept(); return; // DISABLED FOR NOW !!`). This task re-enables it and makes it production-ready for action confirmations.

## Current State

- Tutorial modal HTML/CSS exists in `index.html:34-46` and `src/styles.css`
- `GameRenderer.addTutorialModal()` exists but immediately calls `onAccept()` without showing the modal
- Cards already have `description` and `descriptionHtml` fields that can be displayed

## Expected Behavior

When a player clicks a card (or available cell):
1. Show confirmation modal with:
   - Visual card representation
   - Card name
   - Card description (using `descriptionHtml` if available, otherwise `description`)
   - "Accept" button to proceed with action
   - "Dismiss" button to cancel
2. Only execute the action (place/resolve card) if user clicks "Accept"
3. Close modal on "Dismiss" without taking action

## Implementation Tasks

### 1. Remove the Bypass
- In `game-renderer.js:136-157`, remove lines 138-139 that bypass the modal
- Test that the modal properly shows and handles callbacks

### 2. Enhance Modal Content
- Ensure card visual is displayed correctly (already in place at line 61)
- Ensure `descriptionHtml` is used when available (already in place at line 63)
- Test with various card types

### 3. Handle Edge Cases
- Empty cell clicks (placing new dungeon card) - should show "Place card from dungeon?" message
- Different card types (enemies, traps, passages, resources)
- Modal visibility toggle works correctly

### 4. Test Click Handlers
- Verify "Accept" button executes the callback
- Verify "Dismiss" button closes modal without action
- Ensure modal overlay click behavior is correct

## Testing Checklist

- [ ] Modal appears when clicking face-up cards
- [ ] Modal appears when clicking empty available cells
- [ ] "Accept" button executes the intended action
- [ ] "Dismiss" button cancels and closes modal
- [ ] Card visuals render correctly in modal
- [ ] Card descriptions display properly (both `description` and `descriptionHtml`)
- [ ] Modal closes after action is taken
- [ ] No JavaScript errors in console

## Related Tasks

- See #ABA for auto-resolve vs user-initiated logic (some cards shouldn't show confirmation)
- See #ABB for post-resolution feedback
- See #ABC for "don't show again" preferences

## Notes

This is the foundation for the larger confirmation system. Keep it simple - just re-enable the existing modal and ensure it works correctly. Advanced features (preferences, auto-resolve) will be added in follow-up tasks.
