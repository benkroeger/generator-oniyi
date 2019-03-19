'use strict';

const Generator = require('yeoman-generator');
const sortedObject = require('sorted-object');
const depsObject = require('deps-object');

module.exports = class extends Generator {
  // constructor(args, opts) {
  //   super(args, opts);
  // }

  saveDepsToPkg(deps, target) {
    const pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    const targetProp = ['dependencies', 'devDependencies'].indexOf(target) > -1 ? target : 'devDependencies';
    const currentDeps = pkg[targetProp] || {};
    const mergedDeps = Object.assign({}, currentDeps, deps);
    const sortedDeps = sortedObject(mergedDeps);
    pkg[targetProp] = sortedDeps;
    this.fs.writeJSON(this.destinationPath('package.json'), pkg);
  }

  saveDeps(deps, target = 'devDependencies') {
    const self = this;
    return depsObject(deps)
      .then((devDependencies) => {
        self.saveDepsToPkg(devDependencies, target);
      })
      .catch((err) => { throw err; });
  }

  gitignore(ignores) {
    const gitignorePath = this.destinationPath('.gitignore');
    let file = this.fs.read(gitignorePath, { defaults: '' });
    ignores.forEach((v) => {
      if (file.indexOf(v) === -1) {
        file += `${v}\n`;
      }
    });
    this.fs.write(gitignorePath, file);
  }
};
