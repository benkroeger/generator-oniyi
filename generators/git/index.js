'use strict';

// node core

// 3rd party
const Generator = require('yeoman-generator');
const originUrl = require('git-remote-origin-url');

// internal

const readPkg = generatorInstance =>
  generatorInstance.fs.readJSON(
    generatorInstance.destinationPath(
      generatorInstance.options.generateInto,
      'package.json',
    ),
    {},
  );

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('generateInto', {
      type: String,
      required: false,
      defaults: '',
      desc: 'Relocate the location of the generated files.',
    });

    this.option('githubAccount', {
      type: String,
      required: true,
      desc: 'GitHub username or organization',
    });

    this.option('repositoryName', {
      type: String,
      required: true,
      desc: 'Name of the GitHub repository',
    });
  }

  initializing() {
    const generatorInstance = this;
    this.fs.copy(
      this.templatePath('gitattributes'),
      this.destinationPath(this.options.generateInto, '.gitattributes'),
    );

    this.fs.copy(
      this.templatePath('gitignore'),
      this.destinationPath(this.options.generateInto, '.gitignore'),
    );

    return originUrl(this.destinationPath(this.options.generateInto)).then(
      url => {
        generatorInstance.originUrl = url;
      },
      () => {
        generatorInstance.originUrl = '';
      },
    );
  }

  writing() {
    const pkg = readPkg(this);

    const { githubAccount, repositoryName } = this.options;
    let repository;
    if (this.originUrl) {
      repository = this.originUrl;
    } else if (githubAccount && repositoryName) {
      repository = `${githubAccount}/${repositoryName}`;
    }

    pkg.repository = pkg.repository || repository;

    this.fs.writeJSON(
      this.destinationPath(this.options.generateInto, 'package.json'),
      pkg,
    );
  }

  end() {
    const pkg = readPkg(this);

    this.spawnCommandSync('git', ['init', '--quiet'], {
      cwd: this.destinationPath(this.options.generateInto),
    });

    if (pkg.repository && !this.originUrl) {
      let repoSSH = pkg.repository;
      if (pkg.repository && pkg.repository.indexOf('.git') === -1) {
        repoSSH = `git@github.com:${pkg.repository}.git`;
      }

      this.spawnCommandSync('git', ['remote', 'add', 'origin', repoSSH], {
        cwd: this.destinationPath(this.options.generateInto),
      });
    }
  }
};
