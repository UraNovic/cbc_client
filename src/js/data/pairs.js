/**
 * cbc trading default currency pairs.
 *
 * This list is a bit arbitrary, but it's basically the Majors [1] from forex
 * trading with some cbc pairs added.
 *
 * [1] http://en.wikipedia.org/wiki/Currency_pair#The_Majors
 */

var DEFAULT_PAIRS = [
  {name: 'cbc/USD.SnapSwap', last_used: 10}
  // {name: 'XAU (-0.5%pa)/cbc', last_used: 2},
  // {name: 'XAU (-0.5%pa)/USD', last_used: 2},
  // {name: 'BTC/cbc', last_used: 1},
  // {name: 'cbc/USD', last_used: 1},
  // {name: 'cbc/EUR', last_used: 1},
  // {name: 'cbc/JPY', last_used: 0},
  // {name: 'cbc/GBP', last_used: 0},
  // {name: 'cbc/AUD', last_used: 0},
  // {name: 'cbc/CHF', last_used: 0},
  // {name: 'cbc/CAD', last_used: 0},
  // {name: 'cbc/CNY', last_used: 0},
  // {name: 'cbc/MXN', last_used: 0},
  // {name: 'BTC/USD', last_used: 0},
  // {name: 'BTC/EUR', last_used: 0},
  // {name: 'EUR/USD', last_used: 0},
  // {name: 'USD/JPY', last_used: 0},
  // {name: 'GBP/USD', last_used: 0},
  // {name: 'AUD/USD', last_used: 0},
  // {name: 'USD/MXN', last_used: 0},
  // {name: 'USD/CHF', last_used: 0}
];

module.exports = DEFAULT_PAIRS;