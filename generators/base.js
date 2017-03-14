'use strict';

const Generator = require('yeoman-generator');
const extend = require('extend');
const sortedObject = require('sorted-object');
const depsObject = require('deps-object');

module.exports = Generator.extend({
  _saveDepsToPkg: function saveDepsToPkg(deps, target) {
    const pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    const targetProp = ['dependencies', 'devDependencies'].indexOf(target) > -1 ? target : 'devDependencies';
    const currentDeps = pkg[targetProp] || {};
    const mergedDeps = extend({}, currentDeps, deps);
    const sortedDeps = sortedObject(mergedDeps);
    pkg[targetProp] = sortedDeps;
    this.fs.writeJSON(this.destinationPath('package.json'), pkg);
  },

  _saveDeps: function saveDeps(deps, target) {
    const self = this;
    const targetProp = target || 'devDependencies';
    return depsObject(deps)
      .then((devDependencies) => {
        self._saveDepsToPkg(devDependencies, targetProp); // eslint-disable-line no-underscore-dangle
      })
      .catch((err) => { throw err; });
  },

  _gitignore: function gitignore(ignores) {
    const giPath = this.destinationPath('.gitignore');
    let file = this.fs.read(giPath, { defaults: '' });
    ignores.forEach((v) => {
      if (file.indexOf(v) === -1) {
        file += `${v}\n`;
      }
    });
    this.fs.write(giPath, file);
  },
});
