'use strict';

// node core
const path = require('path');

// 3rd party
const _ = require('lodash');
const askName = require('inquirer-npm-name');
const parseAuthor = require('parse-author');
const githubUsername = require('github-username');
const getRemoteOriginUrl = require('git-remote-origin-url');

// internal

const getModuleNameParts = (name) => {
  const moduleName = { name, localName: name };

  if (moduleName.name.startsWith('@')) {
    const nameParts = moduleName.name.slice(1).split('/');

    Object.assign(moduleName, {
      scopeName: nameParts[0],
      localName: nameParts[1],
    });
  }

  return moduleName;
};

const extractAuthorDetails = (author) => {
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

const readPkg = (generatorInstance) =>
  generatorInstance.fs.readJSON(
    generatorInstance.destinationPath(
      generatorInstance.options['project-root'],
      'package.json',
    ),
    {},
  );

const remoteOriginUrl = (generatorInstance) => {
  const { options } = generatorInstance;
  return getRemoteOriginUrl(
    generatorInstance.destinationPath(options['project-root']),
  ).then(
    (originUrl) => originUrl,
    () => undefined,
  );
};

const extracktRepositoryUrl = ({ repository }) => {
  if (!repository) {
    return null;
  }
  if (_.isString(repository)) {
    return repository;
  }
  return _.get(repository, 'url', null);
};

const makePropmts = (generatorInstance) => {
  const { props, options } = generatorInstance;

  return {
    askForPackageDetails: () =>
      new Promise((resolve) => {
        if (props.name) {
          resolve({ name: props.name });
          return;
        }

        resolve(
          askName(
            {
              name: 'name',
              default: path.basename(process.cwd()),
            },
            generatorInstance,
          ),
        );
      })
        .then(({ name: resolvedName }) => {
          const { name, scopeName, localName } = getModuleNameParts(
            resolvedName,
          );

          Object.assign(props, { name, scopeName, localName });
        })
        .then(() => {
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
              filter: (words) => words.split(/\s*,\s*/g),
            },
          ];

          return generatorInstance.prompt(prompts).then((answers) => {
            Object.assign(props, answers);
          });
        }),

    askForGithubDetails: () =>
      new Promise((resolve) => {
        if (options.githubAccount) {
          resolve(options.githubAccount);
          return;
        }
        if (props.scopeName) {
          resolve(props.scopeName);
          return;
        }
        if (props.authorEmail) {
          resolve(
            githubUsername(props.authorEmail).then(
              (username) => username,
              () => '',
            ),
          );
          return;
        }

        resolve('');
      }).then((username) => {
        return generatorInstance
          .prompt([
            {
              name: 'githubAccount',
              message: 'GitHub username or organization',
              default: username,
              when: !options.githubAccount,
            },
            {
              name: 'repositoryName',
              message: 'GitHub repository name',
              // provide module's localName (`@scope/localName`) as default repository name
              default: props.localName,
              when: !options.repositoryName,
            },
          ])
          .then(
            ({
              githubAccount = options.githubAccount,
              repositoryName = options.repositoryName,
            }) =>
              remoteOriginUrl(generatorInstance).then((originUrl) => {
                Object.assign(props, {
                  githubAccount,
                  repositoryName,
                  originUrl,
                });

                const pkgRepositoryUrl = extracktRepositoryUrl(
                  readPkg(generatorInstance),
                );

                return generatorInstance
                  .prompt([
                    {
                      name: 'repositoryUrl',
                      message: 'Git repository url',
                      default:
                        originUrl ||
                        pkgRepositoryUrl ||
                        `github:${githubAccount}/${repositoryName}`,
                      // when: !originUrl,
                    },
                  ])
                  .then(({ repositoryUrl }) => {
                    Object.assign(props, { repositoryUrl });
                  });
              }),
          );
      }),

    askForTravis: () => {
      const prompts = [
        {
          name: 'nodeVersions',
          message: 'Enter Node versions for Travis(comma separated)',
          when: options.travis,
        },
      ];

      return generatorInstance
        .prompt(prompts)
        .then(({ nodeVersions }) => Object.assign(props, { nodeVersions }));
    },
  };
};

module.exports = { extractAuthorDetails, makePropmts };
