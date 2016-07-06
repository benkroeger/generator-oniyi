'use strict';
const path = require('path');

const Base = require('../base');

module.exports = Base.extend({
  constructor: function srcContrsuctor() {
    Base.apply(this, arguments);

    this.option('src', {
      type: String,
      required: false,
      defaults: 'lib/',
      desc: 'Source folder',
    });
  },

  writing: {
    pkgScripts: function srcPkgScripts() {
      const pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

      const npmScripts = [
        // run eslint when calling `npm run lint`
        { name: 'lint', cmd: 'eslint .' },
      ];

      pkg.scripts = npmScripts.reduce((result, script) => {
        result[script.name] = script.cmd; // eslint-disable-line no-param-reassign
        return result;
      }, pkg.scripts || {});

      this.fs.writeJSON(this.destinationPath('package.json'), pkg);
    },

    pkgFiles: function srcPkgFiles() {
      const pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
      pkg.files = pkg.files || [];

      const files = [this.options.src];
      files.forEach(file => {
        if (pkg.files.indexOf(file) === -1) {
          pkg.files.push(file);
        }
      });
      this.fs.writeJSON(this.destinationPath('package.json'), pkg);
    },

    pkgDevDeps: function srcPkgDevDeps() {
      return this._saveDeps([ // eslint-disable-line no-underscore-dangle
        'eslint',
        'eslint-config-oniyi',
      ], 'devDependencies');
    },

    pkgDeps: function srcPkgDeps() {
      return this._saveDeps(['oniyi-logger'], 'dependencies'); // eslint-disable-line no-underscore-dangle
    },

    templates: function srcTemplates() {
      const sourcePath = path.join(this.options.src, 'index.js');

      // copy template to this.options.src
      this.fs.copyTpl(
        this.templatePath('index.tpl'),
        this.destinationPath(sourcePath), {}
      );

      this.fs.copy(this.templatePath('.eslintrc'), this.destinationPath('.eslintrc'));
    },
  },

  default: function srcDefault() {},

  install: function srcInstall() {
    if (!this.options['skip-install']) {
      this.npmInstall();
    }
  },
});
