'use strict';

// node core

// 3rd party

// internal

module.exports = {
  git: {
    type: Boolean,
    required: false,
    default: true,
    desc: 'Execute git sub-generator',
  },

  boilerplate: {
    type: Boolean,
    required: false,
    default: true,
    desc: 'Execute boilerplate sub-generator',
  },

  license: {
    type: Boolean,
    required: false,
    default: true,
    desc: 'Execute license sub-generator',
  },

  readme: {
    type: String,
    required: false,
    default: true,
    desc: 'Execute readme sub-generator',
  },

  travis: {
    type: Boolean,
    required: false,
    default: true,
    desc: 'Execute travis sub-generator',
  },

  coveralls: {
    type: Boolean,
    required: false,
    default: true,
    desc: 'Execute coveralls sub-generator',
  },

  'project-root': {
    type: String,
    required: false,
    default: 'lib',
    desc:
      'Relative path to the project code root (folder in repo where code resides)',
  },

  name: {
    type: String,
    required: false,
    desc: 'The name for this module',
  },

  'github-account': {
    type: String,
    required: false,
    desc: 'The name of the account on Github that hosts your repository',
  },

  'repository-name': {
    type: String,
    required: false,
    desc: 'The name of your repository on Github',
  },
};
