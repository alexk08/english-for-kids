// import {ieFix} from './utils/ie-fix';

// Utils
// ---------------------------------

// ieFix();

// Modules
// ---------------------------------

import { CATEGORIES } from './modules/categories';
import { Game } from './modules/Game';

new Game(CATEGORIES, document.body).init();