'use strict';

// node core

// third-party
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

// internal

describe('node:boilerplate', () => {
  beforeEach(() => {
    return helpers
      .run(require.resolve('../generators/boilerplate'))
      .withOptions({ name: 'my-module' });
  });

  it('creates boilerplate files', () => {
    assert.file('lib/index.js');
    assert.file('lib/__tests__/myModule.test.js');
    assert.fileContent('lib/index.js', 'module.exports = {};');
    assert.fileContent('lib/__tests__/myModule.test.js', 'const myModule');
    assert.fileContent('lib/__tests__/myModule.test.js', "describe('myModule'");
  });

  it('fill package.json', () => {
    assert.fileContent('package.json', /"eslint-config-airbnb-base":/);
    assert.jsonFileContent('package.json', {
      scripts: {
        pretest: 'eslint .',
      },
    });
    assert.file('.eslintignore');
    assert.file('.eslintrc.js');
    assert.fileContent('.eslintrc.js', "plugins: ['prettier'],");
    assert.fileContent('.eslintrc.js', "extends: ['airbnb-base', 'prettier']");
    assert.fileContent('.eslintrc.js', "'prettier/prettier': 'error',");
  });
});

describe('node:boilerplate', () => {
  beforeEach(() => {
    return helpers
      .run(require.resolve('../generators/boilerplate'))
      .withOptions({ name: 'my-module', generateInto: 'other/' });
  });

  it('creates boilerplate files using another path', () => {
    assert.file('other/lib/index.js');
    assert.file('other/lib/__tests__/myModule.test.js');
    assert.fileContent('other/lib/index.js', 'module.exports = {};');
    assert.fileContent(
      'other/lib/__tests__/myModule.test.js',
      'const myModule',
    );
    assert.fileContent(
      'other/lib/__tests__/myModule.test.js',
      "describe('myModule'",
    );
  });

  it('respect --generate-into option as the root of the scaffolding', () => {
    assert.fileContent('other/package.json', /"eslint-config-airbnb-base":/);
    assert.jsonFileContent('other/package.json', {
      scripts: {
        pretest: 'eslint .',
      },
    });
    assert.file('other/.eslintignore');
    assert.file('other/.eslintrc.js');
    assert.fileContent('other/.eslintrc.js', "plugins: ['prettier'],");
    assert.fileContent(
      'other/.eslintrc.js',
      "extends: ['airbnb-base', 'prettier']",
    );
    assert.fileContent('other/.eslintrc.js', "'prettier/prettier': 'error',");
  });
});
