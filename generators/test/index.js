'use strict';
const path = require('path');
const toCase = require('to-case');
const relative = require('relative');

const Base = require('../base');

module.exports = Base.extend({
  constructor: function testConstructor() {
    Base.apply(this, arguments);

    this.option('src', {
      type: String,
      required: false,
      defaults: 'lib/',
      desc: 'Source code folder (relative to the project root)',
    });

    this.option('test', {
      type: String,
      required: false,
      defaults: 'test/',
      desc: 'Source code folder for the tests (relative to the project root)',
    });

    this.option('coverage', {
      type: Boolean,
      required: false,
      defaults: false,
      desc: 'Include code coverage script?',
    });
  },

  writing: {
    pkg: function testPkg() {
      const pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
      const defaultCoverageCmd = 'nyc npm test && nyc report --reporter=text-lcov > coverage.lcov && codecov';
      pkg.scripts = pkg.scripts || {};

      // force the inclusion of these scripts
      // this is because initially "test": "echo no tests"
      pkg.scripts.test = 'ava';
      pkg.scripts['test:watch'] = 'npm test -- --watch';
      if (this.options.coverage) {
        // note that this will only be run on a CI server
        pkg.scripts.coverage = pkg.scripts.coverage || defaultCoverageCmd;
      }

      // ava configuration
      // pkg.ava = pkg.ava || {};

      this.fs.writeJSON('package.json', pkg);
    },

    pkgDevDeps: function testPkgDevDeps() {
      return this._saveDeps(['ava', // eslint-disable-line no-underscore-dangle
        'babel-eslint',
        'eslint',
        'eslint-plugin-ava',
        'nyc',
      ]);
    },

    gitignore: function testGitignore() {
      if (this.options.coverage) {
        return this._gitignore(['coverage', '.nyc_output']); // eslint-disable-line no-underscore-dangle
      }
      return null;
    },

    templates: function testTemplates() {
      const pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
      const testPath = path.join(this.options.test, 'index.js');
      const srcPath = path.join(this.options.src, 'index.js');

      let relativePath = relative(testPath, srcPath);
      if (relativePath[0] !== '.') {
        relativePath = `./${relativePath}`;
      }

      this.fs.copyTpl(
        this.templatePath('test.tpl'),
        this.destinationPath(testPath), {
          camelName: toCase.camel(pkg.name || this.appname),
          // computes the relative from `test` to `index`
          // e.g.   from test/ to src/index.js = ../src/index.js
          indexPath: relativePath,
        }
      );
      this.fs.copy(this.templatePath('.eslintrc'), this.destinationPath(path.join(this.options.test, '.eslintrc')));
    },
  },

  default: function testDefault() {},

  install: function testInstall() {
    if (!this.options['skip-install']) {
      this.npmInstall();
    }
  },
});
