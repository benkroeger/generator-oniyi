'use strict';

// node core

// 3rd party

// internal

module.exports = 'app boilerplate test eslint git readme'.split(' ').reduce(
  (result, generator) =>
    Object.assign(result, {
      [generator]: require.resolve(`./generators/${generator}`),
    }),
  {},
);
