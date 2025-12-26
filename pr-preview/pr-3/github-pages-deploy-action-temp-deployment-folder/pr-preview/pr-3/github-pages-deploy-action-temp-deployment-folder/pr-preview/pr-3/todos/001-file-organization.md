# Todo #001: File Organization

**Status**: Open
**Priority**: High
**Created**: 2025-12-26

## Problem

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
│   ├── AGENTS.md
│   ├── CODE_STRUCTURE_ANALYSIS.md
│   ├── DEPLOYMENT.md
│   └── TESTING_STRATEGY.md
├── todos/                  # Task tracking
│   ├── 001-file-organization.md
│   ├── 002-*.md
│   └── ...
├── test/                   # Tests (already exists)
├── .github/                # GitHub workflows (already exists)
├── README.md
├── package.json
├── package-lock.json
├── vitest.config.js
└── .pr-preview.json
```

## Tasks

- [ ] Create `src/` directory
- [ ] Move source files to `src/`: index.html, index.js, cards.js, card-builders.js, dungeon-cards.js, styles.css
- [ ] Create `docs/` directory
- [ ] Move documentation to `docs/`: GAME_RULES.md, AGENTS.md, CODE_STRUCTURE_ANALYSIS.md, DEPLOYMENT.md, TESTING_STRATEGY.md
- [ ] Remove BUG_REPORT.md (convert to todos instead)
- [ ] Update any references to moved files (vitest.config.js, .github workflows, etc.)
- [ ] Update README links to documentation
- [ ] Test that the app still works after reorganization

## Considerations

- Need to update build/deployment configs if they reference file paths
- GitHub Pages deployment may need path updates
- Test imports/paths still work
- Vitest config may need updated paths
