'use strict';

const toCase = require('to-case');
const extend = require('extend');
const parseAuthor = require('parse-author');

const Base = require('../base');

module.exports = Base.extend({
  constructor: function readmeConstructor(...args) {
    Base.apply(this, args);

    this.option('codecov', {
      type: Boolean,
      required: false,
      default: false,
      desc: 'Include the codecov badge',
    });
  },

  initializing: function readmeInitializing() {
    this.shouldSkipAll = this.options.yes;
    this.props = {
      badges: ['npm', this.options.codecov && 'codecov'].filter(Boolean),
    };
  },

  prompting: {
    badges: function readmeBadges() {
      const self = this;
      const prompts = [{
        type: 'checkbox',
        name: 'badges',
        message: 'Select the badges that you want in your README',
        choices: [
          { name: 'npm' },
          { name: 'codecov' },
          { name: 'downloads' },
        ],
        default: this.props.badges,
        when: !this.shouldSkipAll,
      }];

      return this.prompt(prompts).then((answers) => {
        extend(self.props, answers);
      });
    },
  },

  writing: function readmeWriting() {
    const pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    let authorInfo;
    if (pkg.author && typeof pkg.author === 'object') {
      authorInfo = pkg.author;
    } else if (typeof pkg.author === 'string') {
      authorInfo = parseAuthor(pkg.author);
    } else {
      authorInfo = {};
    }

    // get githubUsername from repository field
    // assume for simplicity that the field has the form
    //
    //    githubUsername/moduleName
    //
    const githubUsername = (pkg.repository || '').split('/')[0];

    extend(this.props, {
      githubUsername,
      name: authorInfo.name || '',
      email: authorInfo.email || '',
      website: authorInfo.url || '',
      moduleName: (pkg.name || this.appname),
      moduleDescription: pkg.description || '',
      moduleLicense: pkg.license || '',
    });
    this.props.camelModuleName = toCase.camel(this.props.moduleName);
    this.fs.copyTpl(
      this.templatePath('README.tpl'),
      this.destinationPath('README.md'),
      this.props
    );
  },
});
