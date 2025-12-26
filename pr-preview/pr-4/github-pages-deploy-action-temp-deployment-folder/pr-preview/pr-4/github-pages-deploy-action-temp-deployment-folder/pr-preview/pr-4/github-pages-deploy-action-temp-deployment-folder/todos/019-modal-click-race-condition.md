# Modal Click-Anywhere-To-Close Race Condition

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

If buttons are placed inside the modal, clicking a button triggers BOTH:
1. The button's onclick handler
2. The modal's onclick handler (event bubbles up)

Could cause double-execution or race conditions.

## Investigation Needed

- Check if buttons call `event.stopPropagation()`
- Test clicking buttons vs clicking modal background
- Verify no double-execution occurs

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
