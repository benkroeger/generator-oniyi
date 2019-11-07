'use strict';

// node core

// third-party
const _ = require('lodash');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

// internal

jest.mock('npm-name', () => {
  return () => Promise.resolve(true);
});

jest.mock('github-username', () => {
  return () => Promise.resolve('unicornUser');
});

// jest.mock('generator-license/app', () => {
//   /**
//    * due to babel-plugin-jest-hoist not allowing to access out-of-scope
//    * variables in `jest.mock`, we'll need to double-require `yeoman-test`
//    * here
//    */

//   // eslint-disable-next-line global-require
//   const scopedTestHelpers = require('yeoman-test');
//   return scopedTestHelpers.createDummyGenerator();
// });

describe('node:app', () => {
  describe('running on new project', () => {
    it('scaffold a full project', () => {
      const answers = {
        name: 'generator-oniyi',
        description: 'An opinionated node generator',
        homepage: 'https://oniyi.io',
        authorName: 'The Oniyi Team',
        authorEmail: 'hi@oniyi.io',
        authorUrl: 'https://oniyi.io',
        keywords: ['oniyi', 'generator'],
        githubAccount: 'oniyi',
        repositoryName: 'generator-oniyi',
        repositoryUrl: 'github:oniyi/generator-oniyi',
        nodeVersions: 'v10.4.1,v10',
        license: 'Apache-2.0',
      };

      return helpers
        .run(require.resolve('../generators/app'))
        .withPrompts(answers)
        .then(() => {
          assert.file([
            '.eslintignore',
            '.eslintrc.js',
            '.gitattributes',
            '.gitignore',
            '.huskyrc.js',
            '.npmignore',
            '.npmrc',
            'jest.config.js',
            'lib/__tests__/generatorOniyi.test.js',
            'lib/index.js',
            'LICENSE',
            'lint-staged.config.js',
            'prettier.config.js',
          ]);

          assert.file('package.json');
          assert.jsonFileContent('package.json', {
            name: answers.name,
            version: '0.0.0',
            description: answers.description,
            homepage: answers.homepage,
            repository: {
              type: 'git',
              url: answers.repositoryUrl,
            },
            author: {
              name: answers.authorName,
              email: answers.authorEmail,
              url: answers.authorUrl,
            },
            files: ['/lib'],
            keywords: answers.keywords,
            main: 'lib/index.js',
            license: answers.license,
          });

          assert.file('README.md');
          assert.fileContent(
            'README.md',
            `const generatorOniyi = require('${answers.name}');`,
          );
          assert.fileContent('README.md', `> ${answers.description}`);
          assert.fileContent('README.md', `npm install --save ${answers.name}`);
          assert.fileContent(
            'README.md',
            `© [${answers.authorName}](${answers.authorUrl})`,
          );
          assert.fileContent(
            'README.md',
            `[travis-image]: https://travis-ci.com/${answers.githubAccount}/${answers.name}.svg?branch=master`,
          );
          assert.fileContent('README.md', 'coveralls');

          assert.file('.travis.yml');
          assert.fileContent('.travis.yml', '| coveralls');
          assert.fileContent('.travis.yml', '- v10.4.1');
          assert.fileContent('.travis.yml', '- v10');
        });
    });
  });

  describe('running on existing project', () => {
    it('Keeps current Readme and extend package.json fields', () => {
      const pkg = {
        version: '1.0.34',
        description: 'lots of fun',
        homepage: 'https://oniyi.io',
        repository: 'oniyi/generator-oniyi',
        author: 'The Oniyi Team',
        files: ['/lib'],
        keywords: ['bar'],
      };

      return helpers
        .run(require.resolve('../generators/app'))
        .withPrompts({ name: 'generator-oniyi' })
        .on('ready', gen => {
          gen.fs.writeJSON(gen.destinationPath('package.json'), pkg);
          gen.fs.write(gen.destinationPath('README.md'), 'foo');
        })
        .then(() => {
          const newPkg = _.extend({ name: 'generator-oniyi' }, pkg);
          assert.jsonFileContent('package.json', newPkg);
          assert.fileContent('README.md', 'foo');
          assert.fileContent(
            '.git/config',
            `[remote "origin"]\n	url = git@github.com:${pkg.repository}.git`,
          );
        });
    });
  });

  describe('--name', () => {
    it('allows scopes in names', () => {
      return helpers
        .run(require.resolve('../generators/app'))
        .withOptions({
          name: '@some-scope/generator-oniyi',
          githubAccount: 'oniyi',
        })
        .then(() => {
          assert.file('lib/__tests__/generatorOniyi.test.js');

          assert.file('package.json');
          assert.jsonFileContent('package.json', {
            name: '@some-scope/generator-oniyi',
            repository: {
              type: 'git',
              url: 'github:oniyi/generator-oniyi',
            },
          });

          assert.file('README.md');
          assert.fileContent(
            'README.md',
            "const someScopeGeneratorOniyi = require('@some-scope/generator-oniyi');",
          );
          assert.fileContent(
            'README.md',
            'npm install --save @some-scope/generator-oniyi',
          );
          assert.fileContent(
            'README.md',
            '[travis-image]: https://travis-ci.com/oniyi/generator-oniyi.svg?branch=master',
          );
          assert.fileContent(
            '.git/config',
            '[remote "origin"]\n	url = git@github.com:oniyi/generator-oniyi.git',
          );
        });
    });

    it('uses scope as githubAccount when not provided separately', () =>
      helpers
        .run(require.resolve('../generators/app'))
        .withOptions({
          name: '@some-scope/generator-oniyi',
        })
        .then(() => {
          assert.file('lib/__tests__/generatorOniyi.test.js');

          assert.file('package.json');
          assert.jsonFileContent('package.json', {
            name: '@some-scope/generator-oniyi',
            repository: {
              type: 'git',
              url: 'github:some-scope/generator-oniyi',
            },
          });

          assert.file('README.md');
          assert.fileContent(
            'README.md',
            "const someScopeGeneratorOniyi = require('@some-scope/generator-oniyi');",
          );
          assert.fileContent(
            'README.md',
            'npm install --save @some-scope/generator-oniyi',
          );
          assert.fileContent(
            'README.md',
            '[travis-image]: https://travis-ci.com/some-scope/generator-oniyi.svg?branch=master',
          );
          assert.fileContent(
            '.git/config',
            '[remote "origin"]\n	url = git@github.com:some-scope/generator-oniyi.git',
          );
        }));

    it('throws when an invalid name is supplied', () => {
      ['@/invalid-name', 'invalid@name'].forEach(async name => {
        await expect(
          helpers.run(require.resolve('../generators/app')).withOptions({
            name,
          }),
        ).rejects.toMatchInlineSnapshot(
          `[Error: name can only contain URL-friendly characters]`,
        );
      });
    });
  });

  describe('--repository-name', () => {
    it('can be set separately from --name', () => {
      return helpers
        .run(require.resolve('../generators/app'))
        .withOptions({
          name: 'generator-oniyi',
          githubAccount: 'oniyi',
          repositoryName: 'not-generator-oniyi',
        })
        .then(() => {
          assert.file('package.json');
          assert.jsonFileContent('package.json', {
            repository: {
              url: 'github:oniyi/not-generator-oniyi',
            },
          });

          assert.file('README.md');
          assert.fileContent(
            'README.md',
            '[travis-image]: https://travis-ci.com/oniyi/not-generator-oniyi.svg?branch=master',
          );
          assert.fileContent(
            '.git/config',
            '[remote "origin"]\n	url = git@github.com:oniyi/not-generator-oniyi.git',
          );
        });
    });
  });

  describe('--no-travis', () => {
    it('skip .travis.yml', () => {
      return helpers
        .run(require.resolve('../generators/app'))
        .withOptions({ travis: false })
        .then(() => assert.noFile('.travis.yml'));
    });
  });

  describe('--no-coveralls', () => {
    beforeEach(() => {
      const answers = {
        name: '@oniyi/generator-oniyi',
      };

      return helpers
        .run(require.resolve('../generators/app'))
        .withOptions({ coveralls: false })
        .withPrompts(answers);
    });

    it("doesn't add after_script to .travis.yml", () => {
      assert.noFileContent('.travis.yml', 'coveralls');
    });
  });

  describe('--no-git', () => {
    beforeEach(() =>
      helpers
        .run(require.resolve('../generators/app'))
        .withOptions({ git: false }),
    );

    it('skips .travis.yml and coveralls', () => {
      assert.noFile('.travis.yml');
      assert.noFileContent('README.md', 'coveralls');
    });

    it('does not add repository to package.json', () => {
      assert.noJsonFileContent('package.json', {
        repository: 1,
      });
    });

    it('does not setup git repo', () => {
      assert.noFile('.git');
    });
  });

  describe('--no-boilerplate', () => {
    beforeEach(() => {
      const answers = {
        name: '@oniyi/generator-oniyi',
      };

      return helpers
        .run(require.resolve('../generators/app'))
        .withOptions({ boilerplate: false })
        .withPrompts(answers)
        .on('ready', generatorInstance => {
          generatorInstance.fs.writeJSON(
            generatorInstance.destinationPath('package.json'),
            {
              scripts: {},
            },
          );
        });
    });

    it('skips creating files from boilerplate/templates', () => {
      assert.noFile([
        '.eslintignore',
        '.eslintrc.js',
        '.huskyrc.js',
        '.npmignore',
        '.npmrc',
        'jest.config.js',
        'lib/__tests__/generatorOniyi.test.js',
        'lib/index.js',
        'lint-staged.config.js',
        'prettier.config.js',
      ]);
    });

    it("doesn't define devDependencies", () => {
      [
        'coveralls', // TODO only include when coveralls is selected
        'eslint',
        'eslint-config-airbnb-base',
        'eslint-config-prettier',
        'eslint-plugin-import',
        'eslint-plugin-prettier',
        'husky',
        'jest',
        'lint-staged',
        'prettier',
      ].forEach(devDependency =>
        assert.noJsonFileContent('package.json', {
          devDependencies: { [devDependency]: 1 },
        }),
      );
    });

    it("doesn't define scripts", () => {
      ['pretest', 'test', 'lint', 'format'].forEach(scriptName =>
        assert.noJsonFileContent('package.json', {
          scripts: { [scriptName]: 1 },
        }),
      );
    });
  });

  describe('--no-license', () => {
    beforeEach(() => {
      const answers = {
        name: '@oniyi/generator-oniyi',
      };

      return helpers
        .run(require.resolve('../generators/app'))
        .withOptions({ license: false })
        .withPrompts(answers);
    });

    it('skips creating LICENSE file', () => {
      assert.noFile(['LICENSE']);
    });

    it("doesn't define license prop in package.json", () => {
      assert.noJsonFileContent('package.json', {
        license: 1,
      });
    });
  });

  describe('--project-root', () => {
    it('include the raw files', () => {
      return helpers
        .run(require.resolve('../generators/app'))
        .withOptions({ 'project-root': 'generators' })
        .then(() => {
          assert.jsonFileContent('package.json', {
            files: ['/generators'],
            main: 'generators/index.js',
          });
        });
    });
  });
});
