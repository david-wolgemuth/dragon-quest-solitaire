# [WIP] Dragon Quest Solitaire

## Backlog

rendering

- [x] render the dungeon squares that would be able to expand up to seven wide and five high
- [x] logic for tile placement tile placement dungeon expansion placement
- [x] inventory section rendered
- [x] the fate deck renderer
- [ ] tiled background and sprites for the various characters
- [ ] display message after fate check (either good or bad)

### game logic

- [x] game loop with reset
- [x] logic for gems, treasure chest, healing fountain
- [x] logic for slimes, skeletons, trolls, dragon
- [x] fate check

---

- [ ] logic for item usage
  - [ ] function `handleClickItem()` from the renderer
  - [ ] Ks - redo fate check
  - [ ] Qs - no damage for snare
    - [ ] then need a place to show / get user input, _after_ seeing card, _before_ receiving damage ??
    - [ ] ? add 1 to fate check ?
  - [ ] Js - take any secret passage / wildcard match any
    - [ ] click at any point, then highlight card to bypass
    - [ ] ? bypass ANY card - too OP ?
  - [ ] Jokers - input for which of above^ (will also need user input after seeing card, before taking taking damage)
- [ ] logic for passages
- [ ] logic for aces, dungeon next dungeon
- [ ] handle running out of hearts
- [ ] handle running out of valid spaces

infra

- [ ] auto deploy GitHub pages
- [ ] progressive web app download
- [ ] spritesheet to images (for now, just using deck api ...)

misc features

- [ ] a tutorial mode where any click would pop up with a confirmation beforehand, could toggle on or off globally.
- [ ] credits, about page
- [ ] printable version of the rules, possibly generated from dock notes, but that is an extra that doesn't need to be
- [ ] mobile first display
- [ ] high score , local
- [ ] high scores, saved all users
- [ ] store state in the URL, include current seed of deck shuffle
- [ ] dark mode, style picker, deck picker
- [ ] animation when cards flip
- [ ] animation when wiping, dungeon and resetting
