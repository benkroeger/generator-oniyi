'use strict';

// node core

// third-party
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

// internal

describe('node:eslint', () => {
  it('fill package.json', () => {
    return helpers.run(require.resolve('../generators/eslint')).then(() => {
      assert.fileContent('package.json', /"eslint-config-airbnb-base":/);
      assert.jsonFileContent('package.json', {
        scripts: {
          pretest: 'eslint .',
        },
      });
      assert.file('.eslintignore');
      assert.file('.eslintrc.js');
      assert.fileContent('.eslintrc.js', "plugins: ['prettier'],");
      assert.fileContent(
        '.eslintrc.js',
        "extends: ['airbnb-base', 'prettier']",
      );
      assert.fileContent('.eslintrc.js', "'prettier/prettier': 'error',");
    });
  });

  it('respect --generate-into option as the root of the scaffolding', () => {
    return helpers
      .run(require.resolve('../generators/eslint'))
      .withOptions({ generateInto: 'other/' })
      .then(() => {
        assert.fileContent(
          'other/package.json',
          /"eslint-config-airbnb-base":/,
        );
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
        assert.fileContent(
          'other/.eslintrc.js',
          "'prettier/prettier': 'error',",
        );
      });
  });
});
