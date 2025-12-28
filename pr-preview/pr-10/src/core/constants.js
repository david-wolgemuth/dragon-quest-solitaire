/**
 * Game Constants
 *
 * Core constants that define game dimensions and limits.
 */

/** @const {number} Maximum width of the dungeon grid */
export const MAX_WIDTH = 7;

/** @const {number} Maximum height of the dungeon grid */
export const MAX_HEIGHT = 5;

// Make globally available for browser backwards compatibility
if (typeof window !== 'undefined') {
  window.MAX_WIDTH = MAX_WIDTH;
  window.MAX_HEIGHT = MAX_HEIGHT;
}
