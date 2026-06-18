/**
 * loader.js - Snappy Preloader for Sugandh Ink
 * Immediately removes the is-loading class, runs reveals, and avoids any crashing.
 */

import { initReveals } from './utils.js';

document.addEventListener('DOMContentLoaded', initReveals);
