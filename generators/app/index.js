'use strict';

const toCase = require('to-case');
const isUrl = require('is-url');
const normalizeUrl = require('normalize-url');
const mkdirp = require('mkdirp');

const BaseWithHelpers = require('../base-with-helpers');

const checkEmpty = (message) => (v) => {
    if (!v.length) {
      return message;
    }
    return true;
  };

const checkUrl = (urlMessage) => (v) => {
    if (v.length && !isUrl(normalizeUrl(v))) {
      return urlMessage;
    }
    return true;
  };

module.exports = class extends BaseWithHelpers {
  constructor (args, opts) {
    super(args, opts);

    this.argument('name', {
      type: String,
      required: false,
      desc: [
        'module name',
        'If provided the module will be created inside ./my-module/',
        'otherwise it will be created in the current directory',
        '',
        'Examples:',
        '',
        '   $ yo oniyi',
        '   $ yo oniyi my-module',
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
  }

  async initializing() {
    this.savedAnswers = this.config.getAll().promptValues || {};
    this.shouldSkipAll = this.options.yes;
    this.shouldAskAll = this.options.all;

    const defaults = Object.assign({ githubUsername }, this.savedAnswers, {
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

    this.composeWith(require.resolve('generator-git-init'), {});

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
  }

  async prompting () {
    const self = this;

    const prompts = [
      // user info
    {
      name: 'name',
      message: 'Your name:',
      when: self.shouldAskUserInfo('name'),
      validate: checkEmpty('Your name is required'),
      store: true,
    }, {
      name: 'email',
      message: 'Your email:',
      when: self.shouldAskUserInfo('email'),
      validate: checkEmpty('Your email is required'),
      store: true,
    }, {
      name: 'website',
      message: 'Your website:',
      when: self.shouldAskUserInfo('website'),
      validate: checkUrl('The input is not a valid url'),
      filter: (v) => {
        if (v.indexOf('.') === -1) {
          return v;
        }
        return normalizeUrl(v);
      },
      required: false,
      store: true,
    },

    // github account info
    {
      name: 'githubUsername',
      message: 'Your github username:',
      when: self.shouldAskUserInfo('githubUsername'),
      store: true,
    },
  ];

    this.answers = await this.prompt(prompts)
      .then(answers => {
        if (answers.website) {
          return Object.assign({}, answers, { website: normalizeUlr(answers.website)});
        }
        return answers;
      });
    }


    },

    moduleInfo() {
      const self = this;
      const prompts = [{
        name: 'moduleName',
        message: 'Module name:',
        default: self.props.moduleName,
        validate: checkEmpty('Module name is required'),
        when: !self.shouldSkipAll,
        filter: v => toCase.slug(v || ''),
      }, {
        name: 'moduleDescription',
        message: 'Module description:',
        validate: checkEmpty('Module description is required'),
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
      self.fs.extendJSON(self.destinationPath('package.json'), pkg);
    },

    gitignore() {
      this._gitignore(['.DS_Store', 'node_modules']);
    },
  },
};
