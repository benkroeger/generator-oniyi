'use strict';

// node core

// 3rd party
const Generator = require('yeoman-generator');

// internal
const rootPkg = require('../../package.json');

const devDependenciesToCopy = [
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
];

module.exports = class extends Generator {
  constructor(args, options) {
    super(args, options);

    this.option('generateInto', {
      type: String,
      required: false,
      default: '',
      desc: 'Relocate the location of the generated files.',
    });
  }

  writing() {
    const pkgJson = {
      devDependencies: devDependenciesToCopy.reduce(
        (result, dependencyName) =>
          Object.assign(result, {
            [dependencyName]: rootPkg.devDependencies[dependencyName],
          }),
        {},
      ),
      scripts: ['pretest', 'test', 'lint', 'format'].reduce(
        (result, scriptName) =>
          Object.assign(result, {
            [scriptName]: rootPkg.scripts[scriptName],
          }),
        {},
      ),
    };

    this.fs.extendJSON(
      this.destinationPath(this.options.generateInto, 'package.json'),
      pkgJson,
    );

    this.fs.copy(
      this.templatePath('eslintignore'),
      this.destinationPath(this.options.generateInto, '.eslintignore'),
    );
    this.fs.copy(
      this.templatePath('eslintrc.js'),
      this.destinationPath(this.options.generateInto, '.eslintrc.js'),
    );
    this.fs.copy(
      this.templatePath('huskyrc.js'),
      this.destinationPath(this.options.generateInto, '.huskyrc.js'),
    );

    // TODO optionally remove coveralls from jest.config.js
    this.fs.copy(
      this.templatePath('jest.config.js'),
      this.destinationPath(this.options.generateInto, 'jest.config.js'),
    );
    this.fs.copy(
      this.templatePath('lint-staged.config.js'),
      this.destinationPath(this.options.generateInto, 'lint-staged.config.js'),
    );
    this.fs.copy(
      this.templatePath('prettier.config.js'),
      this.destinationPath(this.options.generateInto, 'prettier.config.js'),
    );
  }
};
