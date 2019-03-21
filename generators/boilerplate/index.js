'use strict';

// node core

// 3rd party
const _ = require('lodash');
const Generator = require('yeoman-generator');

// internal

module.exports = class extends Generator {
  constructor(args, options) {
    super(args, options);

    this.option('generateInto', {
      type: String,
      required: false,
      default: '',
      desc: 'Relocate the location of the generated files.',
    });

    this.option('sourceRoot', {
      type: String,
      required: false,
      default: 'lib',
      desc: 'Location of source files within the repository',
    });

    this.option('name', {
      type: String,
      required: true,
      desc: 'The new module name.',
    });
  }

  // "@roarr/middleware-serialize-error": "1.0.0",
  // "@roarr/cli": "1.3.1",
  writing() {
    this.fs.copyTpl(
      this.templatePath('index.js'),
      this.destinationPath(
        this.options.generateInto,
        this.options.sourceRoot,
        'index.js',
      ),
    );

    this.fs.copy(
      this.templatePath('npmrc'),
      this.destinationPath(this.options.generateInto, '.npmrc'),
    );

    // https://medium.com/@jdxcode/for-the-love-of-god-dont-use-npmignore-f93c08909d8d
    this.fs.copy(
      this.templatePath('npmignore'),
      this.destinationPath(this.options.generateInto, '.npmignore'),
    );

    this.composeWith(require.resolve('generator-jest/generators/test'), {
      arguments: [
        this.destinationPath(
          this.options.generateInto,
          this.options.sourceRoot,
          'index.js',
        ),
      ],
      componentName: _.camelCase(this.options.name),
    });
  }
};
