'use strict';

// node core
const path = require('path');

// 3rd party
const _ = require('lodash');
const chalk = require('chalk');
const Generator = require('yeoman-generator');
const validatePackageName = require('validate-npm-package-name');

// internal
const generatorOptions = require('./options');
const { extractAuthorDetails, makePropmts } = require('./helpers');

const includeGit = ({ git }) => !!git;
const includeBoilerplate = ({ boilerplate }) => !!boilerplate;
const includeLicense = ({ license }) => !!license;

const includeCoveralls = ({ git, coveralls }) => {
  if (!git) {
    return false;
  }

  return !!coveralls;
};

const includeTravis = ({ git, travis }) => {
  if (!git) {
    return false;
  }

  return !!travis;
};

module.exports = class extends Generator {
  constructor(args, options) {
    super(args, options);

    _.forEach(generatorOptions, (config, name) => {
      this.option(name, config);
    });
  }

  initializing() {
    const { name: nameFromOptions } = this.options;

    if (nameFromOptions) {
      const packageNameValidity = validatePackageName(nameFromOptions);

      if (!packageNameValidity.validForNewPackages) {
        this.emit(
          'error',
          new Error(
            packageNameValidity.errors[0] ||
              'The name option is not a valid npm package name.',
          ),
        );
      }
    }

    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    const {
      name: nameFromPackage,
      description,
      version,
      homepage,
      author,
    } = this.pkg;

    // Pre set the default props from the information we have at this point
    this.props = {
      name: nameFromOptions || nameFromPackage,
      description,
      version,
      homepage,
      includeBoilerplate: includeBoilerplate(this.options),
      includeGit: includeGit(this.options),
      includeCoveralls: includeCoveralls(this.options),
      includeTravis: includeTravis(this.options),
      includeLicense: includeLicense(this.options),
    };

    Object.assign(this.props, extractAuthorDetails(author));
  }

  prompting() {
    const {
      askForPackageDetails,
      askForGithubDetails,
      askForTravis,
    } = makePropmts(this);

    return askForPackageDetails()
      .then(askForGithubDetails)
      .then(askForTravis);
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
        version: this.props.version || '0.0.0',
        description: this.props.description,
        homepage: this.props.homepage,
        author: {
          name: this.props.authorName,
          email: this.props.authorEmail,
          url: this.props.authorUrl,
        },
        files: [`/${this.options['project-root']}`],
        main: path
          .join(this.options['project-root'], 'index.js')
          .replace(/\\/g, '/'),
        devDependencies: {},
        engines: {
          node: `>= ${process.version}`,
          // TODO span command to read npm version as well
        },
      },
      currentPkg,
    );

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
    if (this.props.includeGit) {
      this.composeWith(require.resolve('../git'), {
        originUrl: this.props.originUrl,
        repositoryUrl: this.props.repositoryUrl,
      });
    }

    if (this.props.includeBoilerplate) {
      this.composeWith(require.resolve('../boilerplate'), {
        name: this.props.localName,
        sourceRoot: this.options['project-root'],
      });
    }

    if (this.props.includeTravis) {
      const travisOptions = { config: {} };

      if (this.props.nodeVersions) {
        // eslint-disable-next-line camelcase
        travisOptions.config.node_js = this.props.nodeVersions.split(',');
      }

      if (this.props.includeCoveralls) {
        // eslint-disable-next-line camelcase
        travisOptions.config.after_script =
          'cat ./coverage/lcov.info | coveralls';
      }

      this.composeWith(
        require.resolve('generator-travis/generators/app'),
        travisOptions,
      );
    }

    if (this.props.includeLicense && !this.pkg.license) {
      this.composeWith(require.resolve('generator-license/app'), {
        name: this.props.authorName,
        email: this.props.authorEmail,
        website: this.props.authorUrl,
        defaultLicense: 'Apache-2.0',
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
      });
    }
  }

  installing() {
    this.npmInstall();
  }

  end() {
    this.log('Thanks for using Yeoman.');

    if (this.props.includeTravis) {
      const travisUrl = chalk.cyan(
        `https://travis-ci.com/profile/${this.props.githubAccount}`,
      );
      this.log(`- Enable Travis integration at ${travisUrl}`);
    }

    if (this.props.includeCoveralls) {
      const coverallsUrl = chalk.cyan('https://coveralls.io/repos/new');
      this.log(`- Enable Coveralls integration at ${coverallsUrl}`);
    }
  }
};
