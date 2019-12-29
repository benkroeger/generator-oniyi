'use strict';

// node core

// 3rd party

// internal

module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['lib/**/*.js', '!lib/**/{constants,logger}.js'],
  coverageReporters: ['lcov', 'text', 'text-summary'],
};
