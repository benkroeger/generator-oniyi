'use strict';

// node core

// 3rd party

// internal

module.exports = 'app src test readme setup'.split(' ').reduce((result, generator) =>
  Object.assign(result, { [generator]: require.resolve(`./generators/${generator}`) }), {});
