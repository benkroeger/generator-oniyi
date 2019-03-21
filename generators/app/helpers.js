'use strict';

// node core
const path = require('path');

// 3rd party
const _ = require('lodash');
const askName = require('inquirer-npm-name');
const parseAuthor = require('parse-author');
const githubUsername = require('github-username');

// internal

const getModuleNameParts = (name, props) => {
  const moduleName = {
    name,
    repositoryName: props.repositoryName,
  };

  if (moduleName.name.startsWith('@')) {
    const nameParts = moduleName.name.slice(1).split('/');

    Object.assign(moduleName, {
      scopeName: nameParts[0],
      localName: nameParts[1],
    });
  } else {
    moduleName.localName = moduleName.name;
  }

  if (!moduleName.repositoryName) {
    moduleName.repositoryName = moduleName.localName;
  }

  return moduleName;
};

const extractAuthorDetails = author => {
  if (_.isObject(author)) {
    const { name: authorName, email: authorEmail, url: authorUrl } = author;

    return { authorName, authorEmail, authorUrl };
  }

  if (_.isString(author)) {
    const {
      name: authorName,
      email: authorEmail,
      url: authorUrl,
    } = parseAuthor(author);

    return { authorName, authorEmail, authorUrl };
  }

  // TODO do we need some error handling here?
  return {};
};

const makePropmts = generatorInstance => {
  const { props, options } = generatorInstance;

  return {
    askForModuleName: () => {
      let askedName;

      if (props.name) {
        askedName = Promise.resolve({
          name: props.name,
        });
      } else {
        askedName = askName(
          {
            name: 'name',
            default: path.basename(process.cwd()),
          },
          generatorInstance,
        );
      }

      return askedName.then(answer => {
        const moduleNameParts = getModuleNameParts(answer.name, props);

        Object.assign(props, moduleNameParts);
      });
    },

    askForTravis: () => {
      const prompts = [
        {
          name: 'node',
          message: 'Enter Node versions (comma separated)',
          default: 'v10,v8',
          when: options.travis,
        },
      ];

      return generatorInstance
        .prompt(prompts)
        .then(({ node }) => Object.assign(props, { node }));
    },

    askForGithubAccount: () => {
      if (options.githubAccount) {
        props.githubAccount = options.githubAccount;
        return Promise.resolve();
      }

      let usernamePromise;
      if (props.scopeName) {
        usernamePromise = Promise.resolve(props.scopeName);
      } else {
        usernamePromise = githubUsername(props.authorEmail).then(
          username => username,
          () => '',
        );
      }

      return usernamePromise.then(username => {
        return generatorInstance
          .prompt({
            name: 'githubAccount',
            message: 'GitHub username or organization',
            default: username,
          })
          .then(({ githubAccount }) => Object.assign(props, { githubAccount }));
      });
    },

    askFor: () => {
      const prompts = [
        {
          name: 'description',
          message: 'Description',
          when: !props.description,
        },
        {
          name: 'homepage',
          message: 'Project homepage url',
          when: !props.homepage,
        },
        {
          name: 'authorName',
          message: "Author's Name",
          when: !props.authorName,
          default: generatorInstance.user.git.name(),
          store: true,
        },
        {
          name: 'authorEmail',
          message: "Author's Email",
          when: !props.authorEmail,
          default: generatorInstance.user.git.email(),
          store: true,
        },
        {
          name: 'authorUrl',
          message: "Author's Homepage",
          when: !props.authorUrl,
          store: true,
        },
        {
          name: 'keywords',
          message: 'Package keywords (comma to split)',
          when: !generatorInstance.pkg.keywords,
          filter(words) {
            return words.split(/\s*,\s*/g);
          },
        },
        {
          name: 'includeCoveralls',
          type: 'confirm',
          message: 'Send coverage reports to coveralls',
          when: !options.coveralls,
        },
      ];

      return generatorInstance.prompt(prompts).then(answers => {
        Object.assign(props, answers);
      });
    },
  };
};

module.exports = { extractAuthorDetails, makePropmts };
