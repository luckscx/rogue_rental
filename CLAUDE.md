# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**租房大冒险 (Rogue Rental)** is a narrative-driven browser game built with Pixi.js that simulates the experience of renting an apartment in a Chinese city. Players navigate through story events, make choices, perform skill checks using a dice system, and face boss battles against difficult landlords and agents.

## How to Run

This is a vanilla HTML5/JavaScript game with no build process:

1. Open `index.html` directly in a browser, or
2. Serve via any HTTP server: `python -m http.server 8000` then visit `http://localhost:8000`

No installation or compilation required. The game runs entirely client-side.

## Architecture

### Core Files

- **index.html** - Entry point with minimal markup, loads Pixi.js and game scripts
- **js/data.js** - Game data layer containing all events, items, characters, and configuration
- **js/game.js** - Game engine implementing Pixi.js rendering, state management, and game loop
- **asset/pawn/** - Character portrait images (房东大妈, 中介小哥, etc.)

### Game Data Structure (js/data.js)

The `GAME_DATA` object contains:

- **events** - Event tree keyed by ID. Each event has:
  - `id`, `chapter`, `text`, `scene` - Basic metadata
  - `options[]` - Player choices, which may include:
    - `check` - Attribute to test (charisma/handy/energy/money/mood)
    - `difficulty` - Success threshold (0-100)
    - `success`/`fail` - Next event IDs based on dice roll
    - `next` - Direct transition without check
    - `needItem` - Required item ID
    - `effects` - Attribute modifications
  - `effects`, `gainItem`, `loseItem`, `addBuff` - Side effects when event triggers
  - Boss-specific flags: `isBoss`, `bossRound`, `bossSuccess`, etc.

- **items** - Item definitions with name, description, icon
- **characters** - Character definitions with name and image path
- **eventCharacters** - Mapping of event IDs to character keys for portrait display
- **sceneColors** - Background color schemes for each scene type
- **bossAgentRounds**, **bossLandlordChecks** - Boss battle progression sequences

### Game Engine (js/game.js)

Key systems:

1. **State Management** (line 197-267)
   - `gameState` object tracks attributes, items, buffs, boss progress
   - Helper functions: `getAttr()`, `modAttr()`, `hasItem()`, `addItem()`, etc.

2. **Rendering Layers** (line 270-276)
   - Four PIXI containers: `bg`, `scene`, `ui`, `overlay`
   - Layered to separate background, game content, status bar, and modal overlays

3. **Portrait System** (line 82-194)
   - Preloads character images into `portraitTextures`
   - `createPortraitDisplay()` creates sprite with name tag
   - `showPortraitAnimated()` handles character entry/exit with slide animation
   - Characters displayed on right side of screen (line 122-137)

4. **Event Flow** (line 694-991)
   - `showEvent(eventId)` is the core rendering function
   - Applies event effects, checks game over conditions, renders UI
   - `handleOptionClick()` processes player choices and triggers dice rolls or transitions
   - Boss triggers checked during transitions (line 977-986)

5. **Dice System** (line 515-692)
   - `showDiceRoll()` displays modal with dice UI
   - Success rate = (attribute value × 10) + buff bonuses
   - Special outcomes: critical success (≥95), critical fail (≥90)
   - Rolling animation with 20 frames at 60ms intervals

6. **Boss Battles** (line 993-1079)
   - **Agent Boss** (9001-9100): 5-round negotiation, need 3 successes to win
   - **Landlord Boss** (9200-9302): 3-stage inspection, lose if rage reaches 5
   - Boss state tracked in `gameState.currentBoss`, `bossRound`, `bossSuccessCount`, `bossRage`

## Event Design Patterns

### Event Chapters
- **finding** (1001-1020) - House hunting phase
- **signing** (2001-2014) - Contract negotiation
- **living** (3001-3027) - Daily life, triggers bosses after threshold events
- **boss_agent** (9001-9100) - Mid-game contract renewal boss
- **boss_landlord** (9200-9302) - End-game move-out inspection boss

### Skill Check Pattern
```javascript
{
  text: "An agent tries to trick you...",
  check: "charisma",      // Attribute to test
  difficulty: 60,         // Success threshold
  success: 2008,          // Next event if roll succeeds
  fail: 2009              // Next event if roll fails
}
```

### Item-Gated Options
```javascript
{
  text: "Use specialized tool",
  next: 3027,
  needItem: "bug_spray",  // Only shown if player has this item
  loseItem: "bug_spray"   // Consumed on use
}
```

## Adding Content

### New Event
1. Add event object to `GAME_DATA.events` in `js/data.js`
2. Include required fields: `id`, `chapter`, `text`, `scene`, `options`
3. If event has character, add mapping to `GAME_DATA.eventCharacters`
4. Link to/from existing events via `next`, `success`, or `fail` fields

### New Item
1. Add to `GAME_DATA.items` with `name`, `desc`, `icon`
2. Use `gainItem` in event to give to player
3. Reference in option's `needItem` to gate choices

### New Character Portrait
1. Add image to `asset/pawn/`
2. Add character definition to `GAME_DATA.characters` with `name` and `image` path
3. Map events to character in `GAME_DATA.eventCharacters`

## Technical Constraints

- No module system - all JavaScript is global scope wrapped in IIFE
- Pixi.js v7 loaded from CDN (`js/pixi.min.js`)
- Fixed canvas size: 480×854 (9:16 mobile aspect ratio)
- Text uses Chinese fonts: PingFang SC, Microsoft YaHei
- All game state is in-memory only (no persistence)

## Game Balance Parameters

Located in `js/data.js`:
- `bossAgentTriggerCount: 6` - Events before agent boss appears
- `bossLandlordTriggerCount: 12` - Events before landlord boss appears
- Boss victory conditions defined in event data (e.g., `bossSuccessNeed: 3`)

## Debugging

Key state inspection points:
- `gameState` object (line 197) - All player data
- `currentEventId` (line 696) - Currently displayed event
- Browser console - Pixi.js exposes `app` and all PIXI objects globally

## Design Philosophy

This game follows a narrative-first approach where:
- Every choice has meaningful consequences (attribute changes, item gains/losses, buffs)
- Dice rolls add tension but are influenced by player build (skill choices affect success rates)
- Boss battles are multi-round narrative challenges, not traditional combat
- Replayability comes from different story paths and skill check outcomes
