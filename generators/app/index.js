'use strict';

// node core
const path = require('path');

// 3rd party
const _ = require('lodash');
const chalk = require('chalk');
const validatePackageName = require('validate-npm-package-name');
const Generator = require('yeoman-generator');

// internal
const generatorOptions = require('./options');
const { extractAuthorDetails, makePropmts } = require('./helpers');
const pkgJson = require('../../package.json');

module.exports = class extends Generator {
  constructor(args, options) {
    super(args, options);

    _.forEach(generatorOptions, (config, name) => {
      this.option(name, config);
    });
  }

  initializing() {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    // check if this is a new package or we retrieved existing data
    this.isNewPackage = _.size(this.pkg) > 0;

    const { name, description, version, homepage, author } = this.pkg;
    const { repositoryName, name: optionsName } = this.options;

    // Pre set the default props from the information we have at this point
    this.props = {
      name,
      description,
      version,
      homepage,
      repositoryName,
    };

    if (optionsName) {
      const packageNameValidity = validatePackageName(optionsName);

      if (packageNameValidity.validForNewPackages) {
        this.props.name = optionsName;
      } else {
        const {
          errors = ['The name option is not a valid npm package name.'],
        } = packageNameValidity;
        this.emit('error', new Error(errors.join('\n')));
      }
    }

    Object.assign(this.props, extractAuthorDetails(author));
  }

  prompting() {
    const {
      askForModuleName,
      askFor,
      askForTravis,
      askForGithubAccount,
    } = makePropmts(this);

    return askForModuleName()
      .then(askFor)
      .then(askForTravis)
      .then(askForGithubAccount);
  }

  writing() {
    // Re-read the content at this point because a composed generator might modify it.
    const currentPkg = this.fs.readJSON(
      this.destinationPath('package.json'),
      {},
    );

    const pkg = _.merge(
      {
        name: this.props.name,
        version: this.props.version,
        description: this.props.description,
        homepage: this.props.homepage,
        author: {
          name: this.props.authorName,
          email: this.props.authorEmail,
          url: this.props.authorUrl,
        },
        files: [`/${this.options.projectRoot}`],
        main: path
          .join(this.options.projectRoot, 'index.js')
          .replace(/\\/g, '/'),
        devDependencies: {},
        engines: {
          node: `>= ${process.version}`,
          // npm: '>= 4.0.0',
        },
      },
      currentPkg,
    );

    if (this.props.includeCoveralls) {
      pkg.devDependencies.coveralls = pkgJson.devDependencies.coveralls;
    }

    // Combine the keywords
    if (this.props.keywords && this.props.keywords.length) {
      pkg.keywords = _.uniq(this.props.keywords.concat(pkg.keywords)).filter(
        Boolean,
      );
    }

    // Let's extend package.json so we're not overwriting user previous fields
    this.fs.writeJSON(this.destinationPath('package.json'), pkg);
  }

  default() {
    if (this.options.travis) {
      const options = { config: {} };

      if (this.props.node) {
        // eslint-disable-next-line camelcase
        options.config.node_js = this.props.node.split(',');
      }

      if (this.props.includeCoveralls) {
        // eslint-disable-next-line camelcase
        options.config.after_script = 'cat ./coverage/lcov.info | coveralls';
      }
      this.composeWith(
        require.resolve('generator-travis/generators/app'),
        options,
      );
    }

    this.composeWith(require.resolve('../eslint'));

    this.composeWith(require.resolve('../git'), {
      name: this.props.name,
      githubAccount: this.props.githubAccount,
      repositoryName: this.props.repositoryName,
    });

    // this.composeWith(require.resolve('generator-jest/generators/app'), {
    //   testEnvironment: 'node',
    //   coveralls: false,
    // });

    if (this.options.boilerplate) {
      this.composeWith(require.resolve('../boilerplate'), {
        name: this.props.localName,
        sourceRoot: this.options.projectRoot,
      });
    }

    if (this.options.license && !this.pkg.license) {
      this.composeWith(require.resolve('generator-license/app'), {
        name: this.props.authorName,
        email: this.props.authorEmail,
        website: this.props.authorUrl,
      });
    }

    if (!this.fs.exists(this.destinationPath('README.md'))) {
      this.composeWith(require.resolve('../readme'), {
        name: this.props.name,
        description: this.props.description,
        githubAccount: this.props.githubAccount,
        repositoryName: this.props.repositoryName,
        authorName: this.props.authorName,
        authorUrl: this.props.authorUrl,
        coveralls: this.props.includeCoveralls,
        content: this.options.readme,
      });
    }
  }

  installing() {
    this.npmInstall();
  }

  end() {
    this.log('Thanks for using Yeoman.');

    if (this.options.travis) {
      const travisUrl = chalk.cyan(
        `https://travis-ci.com/profile/${this.props.githubAccount || ''}`,
      );
      this.log(`- Enable Travis integration at ${travisUrl}`);
    }

    if (this.props.includeCoveralls) {
      const coverallsUrl = chalk.cyan('https://coveralls.io/repos/new');
      this.log(`- Enable Coveralls integration at ${coverallsUrl}`);
    }
  }
};
