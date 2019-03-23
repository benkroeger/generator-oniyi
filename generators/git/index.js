'use strict';

// node core

// 3rd party
const _ = require('lodash');
const Generator = require('yeoman-generator');
const parseGithubUrl = require('parse-github-url');

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

    this.option('repositoryUrl', {
      type: String,
      required: true,
      desc: 'Repository url to be used in `package.json`',
    });

    this.option('originUrl', {
      type: String,
      required: false,
      desc: 'Existing `origin` remote url for git repository',
    });
  }

  initializing() {
    this.fs.copy(
      this.templatePath('gitattributes'),
      this.destinationPath(this.options.generateInto, '.gitattributes'),
    );

    this.fs.copy(
      this.templatePath('gitignore'),
      this.destinationPath(this.options.generateInto, '.gitignore'),
    );

    // need to do this here so that git init is done before installing dependencies
    // (required for `husky` to setup git hooks)
    this.spawnCommandSync('git', ['init', '--quiet'], {
      cwd: this.destinationPath(this.options.generateInto),
    });
  }

  writing() {
    const { repositoryUrl } = this.options;

    this.fs.extendJSON(
      this.destinationPath(this.options.generateInto, 'package.json'),
      {
        repository: {
          type: 'git',
          url: repositoryUrl,
        },
      },
    );
  }

  end() {
    const pkg = readPkg(this);

    if (_.has(pkg, 'repository.url') && !this.options.originUrl) {
      const repositoryUrl = _.get(pkg, 'repository.url');
      if (!repositoryUrl) {
        // this.log('warn', 'something went wrong with the repository url. it\'s not supposed to be empty'):
        // this.emit('error');
        return;
      }
      const parsedUrl = parseGithubUrl(repositoryUrl);
      const repoSSH = `git@github.com:${parsedUrl.repository}.git`;

      this.spawnCommandSync('git', ['remote', 'add', 'origin', repoSSH], {
        cwd: this.destinationPath(this.options.generateInto),
      });
    }
  }
};
