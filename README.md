# generator-oniyi

An opinionated generator for node.js projects.

Coveralls
Travis
Jest
ESLint (Airbnb/base)
Prettier
husky
lint-staged

- when `git` option is set to false, `coveralls` and `travis` are false / disabled automatically
- the `git` sub-generator will not overwrite any existing `repository` data in `package.json`  
  it will however attempt to register a ssh url version of `package.json#repository[.url]` as git remote `origin` if no `origin` exists yet

## what options should one have

- add testing? (jest)
  - add jest dependency
  - jest config file
  - add jest to `npm test` script
  - add `**/__tests__/**`, `**/__mocks__/**`, `**/?(*.)+(spec|test).[jt]s?(x)` to `.npmignore` (see [jest docs](https://jestjs.io/docs/en/configuration#testmatch-array-string))
  - boilerplate test file? generator-jest
- report coverage to coveralls? (only available when adding test framework)
  - configure jest to collect coverage data and generate report
  - add coveralls dependency
  - modify test script to pipe results to coveralls
  - configure travis after_script to publish coverage to coveralls
- linting?
  - add dev dependencies
    - eslint
    - eslint-config-airbnb-base
    - eslint-config-prettier
    - eslint-plugin-import
    - eslint-plugin-prettier
    - prettier
  - add `eslint .` to `npm pretest` script
  - add `.eslintrc.js` and `.eslintignore` files
- git?
  - add `.gitignore` and `.gitattributes` files
  - prompt repo owner / org (try extract from package name)
  - prompt repo name (try extract from package name)
  - prompt github username (try find by email address)
  - generate repo data for package.json
  - add remote origin
  - if linting was selected, want automatic git hook setup?
    - add husky and lint-staged
    - add `.huskyrc.js` and `lint-staged.config.js`
- travis?
  - invoke generator-travis
  - prompt node versions to run travis on?
- license?
  - invoke generator-license
  - default to Apache-2.0

Mostly based on [generator-node](https://github.com/yeoman/generator-node), so thanks to the [team](https://github.com/yeoman/generator-node/graphs/contributors) over there.