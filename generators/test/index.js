'use strict';
const path = require('path');
const toCase = require('to-case');
const relative = require('relative');

const Base = require('../base');

module.exports = Base.extend({
  constructor: function testConstructor(...args) {
    Base.apply(this, args);

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
    pkgScripts: function testPkgScripts() {
      const pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

      const npmScripts = [
        // run ava when calling `npm test`
        { name: 'test', cmd: 'ava --verbose' },

        // also add "watch" mode to ava
        { name: 'test:watch', cmd: 'npm test -- --watch' },
      ];

      if (this.options.coverage) {
        npmScripts.push({ name: 'coverage', cmd: 'nyc npm test && nyc report --reporter=text-lcov > coverage.lcov' });

        // instead of runnning this on prepublish which doesn't work as expecte on
        // npm@3 run it on preversion, this is because it's highly unlikely to do
        // something after `npm version`
        npmScripts.push({ name: 'preversion', cmd: 'npm run lint && npm run coverage' });

        const { nyc: pkgNyc = {} } = pkg;
        if (!Array.isArray(pkgNyc.exclude) || pkgNyc.exclude.length < 1) {
          pkgNyc.exclude = ['node_modules/**'];
        } else if (pkgNyc.exclude.indexOf('node_modules/**') < 0) {
          pkgNyc.exclude.push('node_modules/**');
        }
        Object.assign(pkg, {
          nyc: pkgNyc,
        });
      } else {
        npmScripts.push({ name: 'preversion', cmd: 'npm run lint && npm run test' });
      }

      pkg.scripts = npmScripts.reduce((result, script) => {
        if (!result[script.name]) {
          result[script.name] = script.cmd; // eslint-disable-line no-param-reassign
        }
        return result;
      }, pkg.scripts || {});

      this.fs.writeJSON(this.destinationPath('package.json'), pkg);
    },

    pkgDevDeps: function testPkgDevDeps() {
      const devDeps = [
        'ava@0.16.0',
        'babel-eslint@6.1.2',
        'eslint@3.5.0',
        'eslint-plugin-ava@3.0.0',
      ];

      if (this.options.coverage) {
        devDeps.push('nyc@8.1.0');
      }

      return this._saveDeps(devDeps); // eslint-disable-line no-underscore-dangle
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
