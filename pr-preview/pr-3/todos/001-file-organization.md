# File Organization

Currently all project files are at the top level, making the repository cluttered and hard to navigate.

## Proposed Structure

```
dragon-quest-solitaire/
├── src/                    # Source code
│   ├── index.html
│   ├── index.js
│   ├── cards.js
│   ├── card-builders.js
│   ├── dungeon-cards.js
│   └── styles.css
├── docs/                   # Documentation
│   ├── GAME_RULES.md
│   ├── CODE_STRUCTURE_ANALYSIS.md
│   ├── DEPLOYMENT.md
│   └── TESTING_STRATEGY.md
├── todos/                  # Task tracking
├── test/                   # Tests (already exists)
├── .github/                # GitHub workflows
├── AGENTS.md               # AI agent notes (MUST stay at root)
├── README.md
├── package.json
├── package-lock.json
├── vitest.config.js
└── .pr-preview.json
```

## What needs updating

- Create `src/` and `docs/` directories
- Move source files to `src/`: index.html, index.js, cards.js, card-builders.js, dungeon-cards.js, styles.css
- Move docs to `docs/`: GAME_RULES.md, CODE_STRUCTURE_ANALYSIS.md, DEPLOYMENT.md, TESTING_STRATEGY.md
- Keep AGENTS.md at root (required location)
- Update vitest.config.js paths
- Update .github workflows paths
- Update README links
- Test that app still works
