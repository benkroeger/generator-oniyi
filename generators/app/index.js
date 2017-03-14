'use strict';

const defined = require('defined');
const extend = require('extend');
const toCase = require('to-case');
const normalizeUrl = require('normalize-url');
const isUrl = require('is-url');
const mkdirp = require('mkdirp');

const Base = require('../base');

module.exports = Base.extend({
  constructor: function appConstructor(...args) {
    Base.apply(this, args);

    this.argument('name', {
      type: String,
      required: false,
      desc: [
        'module name',
        'If provided the module will be created inside ./myAwesomeModule/',
        'otherwise it will be created in the current directory',
        '',
        'Examples:',
        '',
        '   $ yo oniyi',
        '   $ yo oniyi myAwesomeModule',
        '',
      ].join('\n  '),
    });

    this.option('all', {
      type: Boolean,
      required: false,
      alias: 'a',
      default: false,
      desc: 'Ask all questions',
    });

    this.option('yes', {
      type: Boolean,
      required: false,
      alias: 'y',
      default: false,
      desc: 'Skip some questions, like $ npm init -y',
    });
  },

  initializing() {
    this.savedAnswers = this._globalConfig.getAll().promptValues || {}; // eslint-disable-line no-underscore-dangle
    this.shouldSkipAll = this.options.yes;
    this.shouldAskAll = this.options.all;
    const defaults = Object.assign({}, this.savedAnswers, {
      moduleName: toCase.slug(this.name || this.appname),
      moduleDescription: '',
      moduleKeywords: '',
      moduleLicense: 'UNLICENSED',
      modulePrivacy: true,
      coverage: true,
      // additional not configurable props
      src: 'lib/',
      test: 'test/',
    });
    this.props = Object.assign({}, defaults);
    if (this.shouldSkipAll && this.shouldAskAll) {
      this.log('You have chosen to ask both "all" and "minimum" questions!\n');
    }

    // git init
    this.composeWith(require.resolve('generator-git-init'), {});

    // src/index.js and test/index.js
    this.composeWith(require.resolve('../src'), {
      src: this.props.src,
    });

    this.composeWith(require.resolve('../test'), {
      src: this.props.src,
      test: this.props.test,
      coverage: this.props.coverage,
    });

    this.composeWith(require.resolve('../setup'), {});

    if (!this.fs.exists(this.destinationPath('README.md'))) {
      this.composeWith(require.resolve('../readme'), {
        githubUsername: this.props.githubUsername,
        codecov: this.props.coverage,
        yes: this.shouldSkipAll,
      });
    }
  },

  _checkEmpty(message) {
    return (v) => {
      if (!v.length) {
        return message;
      }
      return true;
    };
  },

  _checkUrl(urlMessage) {
    return (v) => {
      if (v.length && !isUrl(normalizeUrl(v))) {
        return urlMessage;
      }
      return true;
    };
  },

  _shouldAskUserInfo(prop) {
    return this.shouldAskAll || !defined(this.savedAnswers[prop]);
  },

  prompting: {
    userInfo() {
      const self = this;
      const prompts = [{
        name: 'name',
        message: 'Your name:',
        when: self._shouldAskUserInfo('name'), // eslint-disable-line no-underscore-dangle
        validate: self._checkEmpty('Your name is required'), // eslint-disable-line no-underscore-dangle
        store: true,
      }, {
        name: 'email',
        message: 'Your email:',
        when: self._shouldAskUserInfo('email'), // eslint-disable-line no-underscore-dangle
        validate: self._checkEmpty('Your email is required'), // eslint-disable-line no-underscore-dangle
        store: true,
      }, {
        name: 'website',
        message: 'Your website:',
        when: self._shouldAskUserInfo('website'), // eslint-disable-line no-underscore-dangle
        validate: self._checkUrl('The input is not a valid url'), // eslint-disable-line no-underscore-dangle
        filter: (v) => {
          if (v.indexOf('.') === -1) {
            return v;
          }
          return normalizeUrl(v);
        },
        required: false,
        store: true,
      }];

      return self.prompt(prompts)
        .then((answers) => {
          Object.assign(self.props, answers);
          if (self.props.website) {
            self.props.website = normalizeUrl(self.props.website);
          }
        });
    },

    askForGithubAccount() {
      const self = this;
      // this uses self.user.git.email() as input for `github-username`, which might be different from
      // `self.props.email`
      return self.user.github.username()
        .then(username => Object.assign(self.props, { githubUsername: username }),
          () => self.prompt({
            name: 'githubUsername',
            message: 'Your github username:',
            when: self._shouldAskUserInfo('githubUsername'), // eslint-disable-line no-underscore-dangle
            store: true,
          }).then(answers => Object.assign(self.props, answers))
        );
    },

    moduleInfo() {
      const self = this;
      const prompts = [{
        name: 'moduleName',
        message: 'Module name:',
        default: self.props.moduleName,
        validate: self._checkEmpty('Module name is required'), // eslint-disable-line no-underscore-dangle
        when: !self.shouldSkipAll,
        filter: v => toCase.slug(v || ''),
      }, {
        name: 'moduleDescription',
        message: 'Module description:',
        validate: self._checkEmpty('Module description is required'), // eslint-disable-line no-underscore-dangle
        when: !self.shouldSkipAll,
      }, {
        name: 'moduleKeywords',
        message: 'Module keywords (comma to split):',
        when: !self.shouldSkipAll,
        filter: value => (value || '').split(',')
          .map(el => el.trim())
          .filter(Boolean),
      }, {
        name: 'moduleLicense',
        message: 'License:',
        default: self.props.moduleLicense,
        when: !self.shouldSkipAll,
      }, {
        name: 'modulePrivacy',
        type: 'confirm',
        message: 'Is this a private module?',
        default: self.props.modulePrivacy,
        when: !self.shouldSkipAll,
      }];
      return self.prompt(prompts).then(answers =>
        Object.assign(self.props, answers)
      );
    },

    addOns() {
      const self = this;
      const prompts = [{
        type: 'confirm',
        name: 'coverage',
        message: 'Do you need code coverage?',
        when: !this.shouldSkipAll,
        default: this.props.coverage,
      }];
      return self.prompt(prompts).then(answers =>
        Object.assign(self.props, answers)
      );
    },
  },

  writing: {
    pkg() {
      const self = this;
      if (self.name) {
        // if the argument `name` is given create the project inside it
        mkdirp(self.props.moduleName);
        self.destinationRoot(self.destinationPath(self.props.moduleName));
      }

      // check if there's an existing package.json
      const currentPkg = self.fs.readJSON(self.destinationPath('package.json'), {});
      const pkg = {
        name: self.props.moduleName,
        version: '1.0.0',
        description: self.props.moduleDescription,
        license: self.props.moduleLicense,
        private: self.props.modulePrivacy,
        author: `${self.props.name} <${self.props.email}> (${this.props.website})`,
        main: `${self.props.src}index.js`,
        keywords: self.props.moduleKeywords,
        repository: {
          type: 'git',
          url: `git+https://github.com/${self.props.githubUsername}/${this.props.moduleName}.git`,
        },
        scripts: {},
        engines: {
          node: `>=${process.version}`,
        },
      };

      // Let's extend package.json so we're not overwriting user previous fields
      self.fs.writeJSON('package.json', extend(true, pkg, currentPkg));
    },

    gitignore() {
      this._gitignore(['.DS_Store', 'node_modules']); // eslint-disable-line no-underscore-dangle
    },
  },
});
