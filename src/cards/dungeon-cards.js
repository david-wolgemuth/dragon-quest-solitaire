/**
 * Dungeon Card Definitions
 *
 * Complete collection of all cards found in the dungeon deck.
 * Cards are organized by suit (SPADES, CLUBS, BLACK) and value.
 */

import { SPADES, CLUBS, BLACK } from './suits.js';
import { ACE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, JACK, QUEEN, KING, JOKER } from './values.js';
import { buildPitTrapCard, buildPassageCard, buildEnemyCard } from './card-builders.js';

/**
 * All dungeon cards organized by suit and value
 * @type {Object.<string, Object.<string, Object>>}
 */
export const DUNGEON_CARDS = {
  [SPADES]: {
    [ACE]: {
      name: "Exit",
      symbol: "⇧",
      description: `Exit to the next level of the dungeon,
        will reset all dungeon cards back to the deck but keep your current stats.

        If you have defeated the Dragon Queen (Queen of Spades) will end the game - you have won.
      `,
      descriptionHtml: `
        <p>Exit to the <strong>next level of the dungeon</strong>.</p>
        <p><strong>Effect:</strong> All dungeon cards are reset back to the deck, but you keep your current stats (health, gems, inventory).</p>
        <p><strong>Victory condition:</strong> If you have defeated the Dragon Queen (Queen of Spades), exiting will end the game - <strong>you win!</strong></p>
      `,
      resolver: function (game) {
        return game.resetDungeon();
      },
    },
    [TWO]: buildPitTrapCard({ hidden: true, damage: 2 }),
    [THREE]: buildPitTrapCard({ hidden: false, damage: 1 }),
    [FOUR]: buildPassageCard(SPADES, FOUR),
    [FIVE]: buildPassageCard(SPADES, FIVE),
    [SIX]: buildPassageCard(SPADES, SIX),
    [SEVEN]: {
      name: 'Gem',
      description: 'Take 1 gem',
      descriptionHtml: `
        <p><strong>Effect:</strong> Gain <strong>1 gem</strong>.</p>
        <p>Gems can be used to reduce damage from traps and enemies, or to purchase items from the Merchant.</p>
      `,
      resolver: function (game) {
        game.gainGem(this);
        return true;
      }
    },
    [EIGHT]: {
      name: 'Healing',
      description: 'Gain 2 Health, up to your max health',
      descriptionHtml: `
        <p><strong>Effect:</strong> Restore <strong>2 health</strong> (up to your maximum of 5).</p>
      `,
      resolver: function (game) {
        game.gainHealth(this, 2);
        return true;
      },
    },
    [NINE]: {
      name: 'Treasure Chest',
      description: 'Gain 1 item from the treasure chest',
      descriptionHtml: `
        <p><strong>Effect:</strong> Gain <strong>1 random item</strong> from the treasure chest.</p>
        <p>Items can include: Jack (weapon), Queen (shield), King (armor), or Red Joker (special).</p>
      `,
      resolver: function (game) {
        game.gainInventory(this);
        return true;
      },
    },
    [TEN]: buildEnemyCard({
      name: "Slime",
      minFateToDefeat: 7,
      damageTakenIfUnsuccessful: 1,
      resolveCriticalSuccess: function (game) {
        game.gainHealth(this);
      },
      resolveCriticalSuccessDescription: "You will heal 1 health.",
    }),
    [JACK]: buildEnemyCard({
      name: "Skeleton",
      minFateToDefeat: 8,
      damageTakenIfUnsuccessful: 1,
      resolveCriticalSuccess: function (game) {
        game.gainGem(this);
      },
      resolveCriticalSuccessDescription: "You will gain 1 gem.",
    }),
    [QUEEN]: buildEnemyCard({
      name: "Dragon Queen",
      minFateToDefeat: 9,
      damageTakenIfUnsuccessful: 3,
      resolveCriticalSuccess: function (game) {
        game.defeatDragonQueen();
      },
      resolveCriticalSuccessDescription: `You will defeat the Dragon Queen
        and win the game upon exiting the dungeon.
      `,
    }),
    [KING]: buildEnemyCard({
      name: "Troll",
      minFateToDefeat: 9,
      damageTakenIfUnsuccessful: 2,
      resolveCriticalSuccess: function (game) {
        game.gainInventory(this);
      },
      resolveCriticalSuccessDescription: "You will gain 1 item from the treasure chest.",
    }),
  },

  [CLUBS]: {
    [ACE]: {
      name: "Merchant",
      description: `Wildcard: Treasure, Healing, Gem, or Exit. Costs 1 one gem.`,
      descriptionHtml: `
        <p>A <strong>merchant</strong> offers you a choice of items.</p>
        <p><strong>Cost:</strong> 1 gem</p>
        <p><strong>Effect:</strong> Choose one item to gain:</p>
        <ul>
          <li>Treasure (random inventory item)</li>
          <li>Healing (2 health)</li>
          <li>Gem (1 gem)</li>
          <li>Exit (advance to next level)</li>
        </ul>
      `,
      /**
       * @param {Game} game
       * @returns {boolean}
       */
      resolver: function (game) {
        if (game.gems.available.length < 1) {
          game.displayMessage("You need at least 1 gem to use this card.");
          return false;
        }
        game.getUserInputInventoryCardSelection(
          "Purchase an inventory item: Treasure, Healing, Gem, or Exit",
          (card) => {
            game.inventory.stock = game.inventory.stock.filter((c) => {
              return c.suitKey !== card.suitKey && c.valueKey !== card.valueKey;
            });
            game.inventory.available.push(card);
            game.render();
            game.loseGem(this);
          },
        )
        // TODO - does not handle the case where the user does not select a card...
        //  should return a promise or callback to handle this case
        return true
      },
    },
    [TWO]: buildPitTrapCard({ damage: 2, hidden: false }),
    [THREE]: buildPitTrapCard({ damage: 3, hidden: false }),
    [FOUR]: buildPassageCard(CLUBS, FOUR),
    [FIVE]: buildPassageCard(CLUBS, FIVE),
    [SIX]: buildPassageCard(CLUBS, SIX),
    // [SEVEN] through [JACK] are copied from SPADES below
    [QUEEN]: buildEnemyCard({
      name: "Young Dragon",
      minFateToDefeat: 10,
      damageTakenIfUnsuccessful: 1,
      resolveCriticalSuccess: function (game) {
        game.gainGem(this, 3);
      },
      resolveCriticalSuccessDescription: "You will gain 3 gems",
    }),
    [KING]: buildEnemyCard({
      name: "Troll King",
      minFateToDefeat: 9,
      damageTakenIfUnsuccessful: 3,
      resolveCriticalSuccess: function (game) {
        game.gainGem(this);
        game.gainInventory(this);
        game.gainHealth(this);
      },
      resolveCriticalSuccessDescription: "You will gain 1 gem, 1 item from the treasure chest, and 1 health.",
    }),
  },

  [BLACK]: {
    [JOKER]: {
      name: "Generous Wizard",
      description: `
        A generous wizard offers you a choice of 4 cards.
          Treasure, Healing, Gem, or Exit
        `,
      descriptionHtml: `
        <p>A <strong>generous wizard</strong> offers you a gift.</p>
        <p><strong>Cost:</strong> Free!</p>
        <p><strong>Effect:</strong> Choose one item to gain:</p>
        <ul>
          <li>Treasure (random inventory item)</li>
          <li>Healing (2 health)</li>
          <li>Gem (1 gem)</li>
          <li>Exit (advance to next level)</li>
        </ul>
      `,
      resolver: function (game) {
        game.getUserInputInventoryCardSelection(
          "Choose an inventory item to gain: Treasure, Healing, Gem, or Exit",
          (card) => {
            game.inventory.stock = game.inventory.stock.filter((c) => {
              return c.suitKey !== card.suitKey && c.valueKey !== card.valueKey;
            });
            game.inventory.available.push(card);
            game.render();
          },
        )
        // TODO - does not handle the case where the user does not select a card...
        //  should return a promise or callback to handle this case
        return true
      },
    },
  }
}

// Copy resource and basic enemy cards from SPADES to CLUBS
DUNGEON_CARDS[CLUBS][SEVEN] = DUNGEON_CARDS[SPADES][SEVEN];  // Gem
DUNGEON_CARDS[CLUBS][EIGHT] = DUNGEON_CARDS[SPADES][EIGHT];  // Healing
DUNGEON_CARDS[CLUBS][NINE] = DUNGEON_CARDS[SPADES][NINE];  // Treasure Chest
DUNGEON_CARDS[CLUBS][TEN] = DUNGEON_CARDS[SPADES][TEN];  // Slime
DUNGEON_CARDS[CLUBS][JACK] = DUNGEON_CARDS[SPADES][JACK];  // Skeleton

// Make globally available for browser backwards compatibility
if (typeof window !== 'undefined') {
  window.DUNGEON_CARDS = DUNGEON_CARDS;
}
