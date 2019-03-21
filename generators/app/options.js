'use strict';

// node core

// 3rd party

// internal

module.exports = {
  name: {
    type: String,
    required: false,
    desc: 'Project name',
  },

  projectRoot: {
    type: String,
    required: false,
    default: 'lib',
    desc: 'Relative path to the project code root',
  },

  githubAccount: {
    type: String,
    required: false,
    desc: 'GitHub username or organization',
  },

  repositoryName: {
    type: String,
    required: false,
    desc: 'Name of the GitHub repository',
  },

  boilerplate: {
    type: Boolean,
    required: false,
    default: true,
    desc: 'Include boilerplate files',
  },

  license: {
    type: Boolean,
    required: false,
    default: true,
    desc: 'Include a license',
  },

  readme: {
    type: String,
    required: false,
    default: true,
    desc: 'Generate a README.md file',
  },

  travis: {
    type: Boolean,
    required: false,
    default: true,
    desc: 'Include travis config',
  },

  coveralls: {
    type: Boolean,
    required: false,
    default: true,
    desc: 'Include coveralls config',
  },
};
