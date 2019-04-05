# generator-oniyi [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

An opinionated generator for node.js projects.

Mostly based on [generator-node](https://github.com/yeoman/generator-node), so thanks to the [team](https://github.com/yeoman/generator-node/graphs/contributors) over there.

It creates a boilerplate project setup composed from multiple sub-generators and finally installs dependencies via `npm`.

## options

All `boolean` options can be set to false with `--no-<option>` (e.g. `--no-git`)

- **git**; (default: `true`) - Execute git sub-generator
- **boilerplate**; (default: `true`) - Execute boilerplate sub-generator
- **license**; (default: `true`) - Execute license sub-generator
- **readme**; (default: `true`) - Execute readme sub-generator
- **travis**; (default: `true`) - Execute travis sub-generator
- **coveralls**; (default: `true`) - Include coveralls configuration
- **project-root**; (default: `'lib'`) - Relative path to the project code root (folder in repo where code resides)
- [**name**]: (default: `dirname`) - The name for this module
- [**github-account**]; (default: `@<scope>` from `name` or resolved from `authorEmail`) - The name of the account on Github that hosts your repository
- [**repository-name**]; (default: `name` of the module; `repository` from `package.json` or from `git remote origin`) - The name of your repository on Github

## boilerplate generator

- copies `devDependencies` and `scripts` from the generator's `package.json` into your project's `package.json`
- creates `.npmrc` and `.npmignore` files
- creates `lib/index.js` and `lib/__tests__/<module-name>.test.js`
- creates `eslint` config files (combines rules from `airbnb-base` and `prettier`)
- creates `jest.config.js`
- creates `prettier.config.js`
- creates config files for git hook tooling `huskyrc.js` and `lint-staged.config.js`

## git generator

This sub-generator will not overwrite any existing `repository` data in `package.json`.  
It will however attempt to register a ssh url version of `package.json#repository[.url]` as git remote `origin` if no `origin` exists yet.

- when `git` option is set to false, `coveralls` and `travis` are false / disabled automatically
- add `.gitignore` and `.gitattributes` files
- prompts for github account (see option `github-account`)
- prompts repository name (see option `repository-name`)
- adds `repository` information to `package.json`
- adds git remote origin if none exists

## readme generator

- generates boilerplate readme if none exists alreads
- composes readme info from propmts collected upfront (user, lincese, badges)

## external sub-generators

- invokes [generator-travis](https://github.com/iamstarkov/generator-travis) when `travis` option is `true`. When `coveralls` option is also `true`, will add `after_script` in travis config to publish coverage report data to coveralls.
- invokes [generator-license](https://github.com/jozefizso/generator-license) and default to `Apache-2.0` license.

## License

Apache-2.0 © [Benjamin Kroeger](https://github.com/benkroeger)

[npm-image]: https://badge.fury.io/js/generator-oniyi.svg
[npm-url]: https://npmjs.org/package/generator-oniyi
[travis-image]: https://travis-ci.com/benkroeger/generator-oniyi.svg?branch=master
[travis-url]: https://travis-ci.com/benkroeger/generator-oniyi
[daviddm-image]: https://david-dm.org/benkroeger/generator-oniyi.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/benkroeger/generator-oniyi
[coveralls-image]: https://coveralls.io/repos/benkroeger/generator-oniyi/badge.svg
[coveralls-url]: https://coveralls.io/r/benkroeger/generator-oniyi