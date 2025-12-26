# User Input Card Selection Buttons Not Rendered

Card buttons in `renderUserInputCardSelection` are created but never appended to the DOM.

**Location**: `index.js:737-753`

**Impact**: Merchant (Ace of Clubs) and Generous Wizard (Black Joker) are completely broken. Players cannot select inventory items.

## Current Code

```javascript
for (let card of cards) {
  const cardButton = document.createElement("button");
  cardButton.classList.add(`card-${card.suit.code}${card.value.code}`);
  cardButton.onclick = (() => {
    callback(card);
    messageElement.classList.remove("visible");
    messageTextElement.innerHTML = "";
  });
  // MISSING: messageTextElement.appendChild(cardButton);
}
```

## Fix

Add `messageTextElement.appendChild(cardButton);` inside the loop.

## Testing

1. Play until finding Merchant (Ace of Clubs)
2. Click on Merchant
3. Verify card selection buttons appear
4. Verify selecting a card works correctly
5. Repeat for Generous Wizard (Black Joker)
