# Todo #019: Modal Click-Anywhere-To-Close Race Condition

**Status**: Open
**Priority**: P3 - Low (Design Issue)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #20

## Problem

Messages have click-anywhere-to-close functionality, which might conflict with button clicks inside modals.

**Location**: `index.js:798-804`

## Current Code

```javascript
if (!disableClickAnywhereToClose) {
  messageElement.onclick = (() => {
    messageElement.classList.remove("visible");
    onAccept();
  });
}
```

## Potential Issue

- If buttons are placed inside the modal
- Clicking a button triggers BOTH:
  1. The button's onclick handler
  2. The modal's onclick handler (event bubbles up)
- Could cause double-execution or race conditions

## Current Status

May not be an actual bug if:
- Buttons properly stop event propagation
- Button handlers execute before modal handler
- Buttons are outside the messageElement

## Investigation Needed

- [ ] Check if buttons call `event.stopPropagation()`
- [ ] Test clicking buttons vs clicking modal background
- [ ] Verify no double-execution occurs

## Potential Fix

If this is a problem:

```javascript
messageElement.onclick = (event) => {
  // Only close if clicking the modal background, not children
  if (event.target === messageElement) {
    messageElement.classList.remove("visible");
    onAccept();
  }
};
```

Or ensure buttons stop propagation:

```javascript
button.onclick = (event) => {
  event.stopPropagation();
  // Handle button click
};
```

## Testing

1. Open a modal with buttons (e.g., Merchant selection)
2. Click a button
3. Verify only button action executes
4. Verify modal doesn't close unexpectedly
5. Click modal background (not button)
6. Verify modal closes correctly
