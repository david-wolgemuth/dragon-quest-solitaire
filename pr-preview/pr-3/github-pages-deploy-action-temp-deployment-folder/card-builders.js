
function buildPitTrapCard({ hidden, damage }) {
  if (hidden) {
    return {
      name: `Hidden Pit Trap (${damage} damage)`,

      description: `You fall into a hidden pit.
        Take ${damage} damage to resolve this tile, mandatory.
        If you have gems, they will reduce the damage taken
      `,
      resolver: function (game) {
        game.loseHealth(this, damage, { gems: true });
        return true;
      },
    };
  } else {
    return {
      name: `Visible Pit Trap (${damage} damage)`,
      description: `Take ${damage} damage to cross the pit trap, optional.
        If you have gems, they w reduce the damage taken`,
      resolver: function (game) {
        game.loseHealth(this, damage);
        return true;
      },
    };
  }
}

function buildPassageCard(suit, value) {
  const oppositeSuit = suit === CLUBS ? SPADES : CLUBS;

  return {
    name: `Passage (${value})`,
    description: `Impassable until you have found
      the other end of the passage (${value} of ${oppositeSuit}})`,
    resolver: function (game) {
      return game.foundPassage(this, suit, value);
    },
  };
}

function buildEnemyCard({
    name,
    minFateToDefeat,
    damageTakenIfUnsuccessful,
    resolveCriticalSuccess,
    resolveCriticalSuccessDescription,
  }) {
  return {
    name,
    description: `Fight Enemy "${name}".
      Pull a card from the Fate Deck (5 cards, 6-10 of Hearts),
      If you pull a card with a value of ${minFateToDefeat} or higher,
        the enemy will be defeated and you will take no damage.

      If you pull a perfect 10 of Hearts (Critical Success),
        ${resolveCriticalSuccessDescription}

      If you fail to defeat the enemy,
        you lose you will take ${damageTakenIfUnsuccessful} damage.
        Game over if you lose all your health.
    `,
    resolver: function (game) {
      const value = game.fateCheck();
      if (value < minFateToDefeat) {
        game.loseHealth(this, damageTakenIfUnsuccessful);
      } else if (value === 10) {
        this.resolveCriticalSuccess(game);
      }
      return true;  // always resolve, even if you lose
    },
    resolveCriticalSuccess,
    resolveCriticalSuccessDescription,
  };
}

