/**
 * Dynamic Style Generation
 *
 * Generates CSS rules dynamically for card display based on suits and values.
 */

import { allCards } from './card-utils.js';
import { HEARTS, DIAMONDS, CLUBS, SPADES, BLACK, RED } from '../cards/suits.js';

/**
 * Create dynamic stylesheet for card display
 * Generates CSS rules for each card's color and content
 */
export function createStyleSheet() {
  const styleElement = document.createElement("style");
  document.head.appendChild(styleElement);

  for (let card of allCards()) {
    const className = `card-${card.suit.code}${card.value.code}`;

    let color;
    switch (card.suit.key) {
      case HEARTS:
      case DIAMONDS:
      case RED:
        color = "red";
        break;
      case CLUBS:
      case SPADES:
      case BLACK:
        color = "black";
        break;
    }

    styleElement.sheet.insertRule(
      `
      .${className} {
        color: ${color};
      }
      `,
      styleElement.sheet.cssRules.length
    );
    styleElement.sheet.insertRule(
      `
      .${className}::after {
        content: "${card.value.display} ${card.suit.display}";
      }
      `,
      styleElement.sheet.cssRules.length
    );
  }
}

// Make globally available for browser backwards compatibility
if (typeof window !== 'undefined') {
  window.createStyleSheet = createStyleSheet;
}
