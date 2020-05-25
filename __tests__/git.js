'use strict';

// node core

// third-party
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

// internal

describe('node:git', () => {
  it('creates the git config files and init the repository', () => {
    return helpers
      .run(require.resolve('../generators/git'))
      .withOptions({
        repositoryUrl: 'github:oniyi/generator-oniyi',
      })
      .then(() => {
        assert.file('.gitignore');
        assert.file('.gitattributes');
        assert.file('.git');

        assert.file('package.json');
        assert.jsonFileContent('package.json', {
          repository: {
            type: 'git',
            url: 'github:oniyi/generator-oniyi',
          },
        });

        assert.fileContent(
          '.git/config',
          '[remote "origin"]\n	url = git@github.com:oniyi/generator-oniyi.git',
        );
      });
  });

  it('respects --generate-into option', () => {
    return helpers
      .run(require.resolve('../generators/git'))
      .withOptions({
        repositoryUrl: 'github:other-account/other-name',
        generateInto: 'other/',
      })
      .then(() => {
        assert.file('other/.gitignore');
        assert.file('other/.gitattributes');
        assert.file('other/.git');

        assert.file('other/package.json');
        assert.jsonFileContent('other/package.json', {
          repository: {
            type: 'git',
            url: 'github:other-account/other-name',
          },
        });

        assert.fileContent(
          'other/.git/config',
          '[remote "origin"]\n	url = git@github.com:other-account/other-name.git',
        );
      });
  });

  it("adds remote `origin` from `package.json#repository` when `originUrl` and `repositoryUrl` aren't passed", () => {
    const pkg = {
      name: 'some-name',
      version: '1.0.0',
      description: 'lots of fun',
      repository: 'some-account/some-name',
    };

    return helpers
      .run(require.resolve('../generators/git'))
      .on('ready', (generatorInstance) => {
        generatorInstance.fs.writeJSON(
          generatorInstance.destinationPath('package.json'),
          pkg,
        );
      })
      .then(() => {
        assert.file('.gitignore');
        assert.file('.gitattributes');
        assert.file('.git');
        assert.file('package.json');

        assert.fileContent(
          '.git/config',
          '[remote "origin"]\n	url = git@github.com:some-account/some-name.git',
        );
      });
  });

  it("doesn't add remote `origin` when `originUrl` and `repositoryUrl` aren't passed and `package.json#repository` is empty", () => {
    const pkg = {
      name: 'some-name',
      version: '1.0.0',
      description: 'lots of fun',
    };

    return helpers
      .run(require.resolve('../generators/git'))
      .on('ready', (generatorInstance) => {
        generatorInstance.fs.writeJSON(
          generatorInstance.destinationPath('package.json'),
          pkg,
        );
      })
      .then(() => {
        assert.file('.gitignore');
        assert.file('.gitattributes');
        assert.file('.git');
        assert.file('package.json');

        assert.noFileContent('package.json', '"repository"');
        assert.noFileContent('.git/config', '[remote "origin"]');
      });
  });
});
