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

const extracktRepositoryUrl = ({ repository }) => {
  if (!repository) {
    return null;
  }
  if (_.isString(repository)) {
    return repository;
  }

  return _.get(repository, 'url', null);
};

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('generateInto', {
      type: String,
      defaults: '',
      desc: 'Relocate the location of the generated files.',
    });

    this.option('repositoryUrl', {
      type: String,
      desc: 'Repository url to be used in `package.json`',
    });

    this.option('originUrl', {
      type: String,
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
  }

  writing() {
    const { repositoryUrl } = this.options;

    // only write repository data in to package.json if it doesn't exist yet
    const { repository } = readPkg(this);
    if (!repository && repositoryUrl) {
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

    // need to do this here so that git init is done before installing dependencies
    // (required for `husky` to setup git hooks)
    this.spawnCommandSync('git', ['init', '--quiet'], {
      cwd: this.destinationPath(this.options.generateInto),
    });
  }

  end() {
    // need to do this here again, so that unit tests will be able to find the `.git`
    // folder even in `generateInto/`. For some reason (most likely the in-memory filesystem),
    // `git init` doesn't work there in any other [priority group](https://yeoman.io/authoring/running-context.html)
    // (before `conflicts`)
    this.spawnCommandSync('git', ['init', '--quiet'], {
      cwd: this.destinationPath(this.options.generateInto),
    });

    const pkg = readPkg(this);

    const repositoryUrlFromPackage = extracktRepositoryUrl(pkg);
    if (repositoryUrlFromPackage && !this.options.originUrl) {
      const parsedUrl = parseGithubUrl(repositoryUrlFromPackage);
      const repoSSH = `git@github.com:${parsedUrl.repository}.git`;

      this.spawnCommandSync('git', ['remote', 'add', 'origin', repoSSH], {
        cwd: this.destinationPath(this.options.generateInto),
      });
    }
  }
};
