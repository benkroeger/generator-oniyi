'use strict';

// node core

// third-party
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

// internal

describe('node:readme', () => {
  beforeEach(() => {
    return helpers
      .run(require.resolve('../generators/readme'))
      .withOptions({
        name: 'my-project',
        description: 'a cool project',
        githubAccount: 'oniyi',
        authorName: 'The Oniyi Team',
        authorUrl: 'http://oniyi.io',
        coveralls: true,
      })
      .on('ready', gen => {
        gen.fs.writeJSON(gen.destinationPath('package.json'), {
          license: 'Apache 2.0',
        });
      });
  });

  it('creates and fill contents in README.md', () => {
    assert.file('README.md');
    assert.fileContent('README.md', "const myProject = require('my-project');");
    assert.fileContent('README.md', '> a cool project');
    assert.fileContent('README.md', 'npm install --save my-project');
    assert.fileContent(
      'README.md',
      'Apache 2.0 © [The Oniyi Team](http://oniyi.io)',
    );
    assert.fileContent(
      'README.md',
      '[travis-image]: https://travis-ci.com/oniyi/my-project.svg?branch=master',
    );
    assert.fileContent('README.md', 'coveralls');
  });
});

describe('node:readme --content', () => {
  beforeEach(() => {
    return helpers
      .run(require.resolve('../generators/readme'))
      .withOptions({
        name: 'my-project',
        description: 'a cool project',
        githubAccount: 'oniyi',
        authorName: 'The Oniyi Team',
        authorUrl: 'http://oniyi.io',
        coveralls: true,
        content: 'My custom content',
      })
      .on('ready', gen => {
        gen.fs.writeJSON(gen.destinationPath('package.json'), {
          license: 'Apache 2.0',
        });
      });
  });

  it('fill custom contents in README.md', () => {
    assert.file('README.md');
    assert.fileContent('README.md', 'My custom content');
    assert.fileContent(
      'README.md',
      'Apache 2.0 © [The Oniyi Team](http://oniyi.io)',
    );
    assert.fileContent(
      'README.md',
      '[travis-image]: https://travis-ci.com/oniyi/my-project.svg?branch=master',
    );
    assert.fileContent('README.md', 'coveralls');
  });
});

describe('node:readme --no-coveralls', () => {
  beforeEach(() => {
    return helpers
      .run(require.resolve('../generators/readme'))
      .withOptions({
        name: 'my-project',
        description: 'a cool project',
        githubAccount: 'oniyi',
        authorName: 'The Oniyi Team',
        authorUrl: 'http://oniyi.io',
        coveralls: false,
      })
      .on('ready', gen => {
        gen.fs.writeJSON(gen.destinationPath('package.json'), {
          license: 'Apache 2.0',
        });
      });
  });

  it('does not include coveralls badge README.md', () => {
    assert.noFileContent('README.md', 'coveralls');
  });
});

describe('node:readme --generate-into', () => {
  beforeEach(() => {
    return helpers
      .run(require.resolve('../generators/readme'))
      .withOptions({
        name: 'my-project',
        description: 'a cool project',
        githubAccount: 'oniyi',
        authorName: 'The Oniyi Team',
        authorUrl: 'http://oniyi.io',
        coveralls: true,
        generateInto: 'other/',
      })
      .on('ready', gen => {
        gen.fs.writeJSON(gen.destinationPath('other/package.json'), {
          license: 'Apache 2.0',
        });
      });
  });

  it('creates and fill contents in README.md', () => {
    assert.file('other/README.md');
    assert.fileContent(
      'other/README.md',
      "const myProject = require('my-project');",
    );
    assert.fileContent('other/README.md', '> a cool project');
    assert.fileContent('other/README.md', 'npm install --save my-project');
    assert.fileContent(
      'other/README.md',
      'Apache 2.0 © [The Oniyi Team](http://oniyi.io)',
    );
    assert.fileContent(
      'other/README.md',
      '[travis-image]: https://travis-ci.com/oniyi/my-project.svg?branch=master',
    );
    assert.fileContent('other/README.md', 'coveralls');
  });
});

describe('node:readme --content and --generate-into', () => {
  beforeEach(() => {
    return helpers
      .run(require.resolve('../generators/readme'))
      .withOptions({
        name: 'my-project',
        description: 'a cool project',
        githubAccount: 'oniyi',
        authorName: 'The Oniyi Team',
        authorUrl: 'http://oniyi.io',
        coveralls: true,
        content: 'My custom content',
        generateInto: 'other/',
      })
      .on('ready', gen => {
        gen.fs.writeJSON(gen.destinationPath('other/package.json'), {
          license: 'Apache 2.0',
        });
      });
  });

  it('fill custom contents in README.md', () => {
    assert.file('other/README.md');
    assert.fileContent('other/README.md', 'My custom content');
    assert.fileContent(
      'other/README.md',
      'Apache 2.0 © [The Oniyi Team](http://oniyi.io)',
    );
    assert.fileContent(
      'other/README.md',
      '[travis-image]: https://travis-ci.com/oniyi/my-project.svg?branch=master',
    );
    assert.fileContent('other/README.md', 'coveralls');
  });
});

describe('node:readme --no-coveralls and --generate-into', () => {
  beforeEach(() => {
    return helpers
      .run(require.resolve('../generators/readme'))
      .withOptions({
        name: 'my-project',
        description: 'a cool project',
        githubAccount: 'oniyi',
        authorName: 'The Oniyi Team',
        authorUrl: 'https://oniyi.io',
        coveralls: false,
        generateInto: 'other/',
      })
      .on('ready', gen => {
        gen.fs.writeJSON(gen.destinationPath('other/package.json'), {
          license: 'Apache 2.0',
        });
      });
  });

  it('does not include coveralls badge README.md', () => {
    assert.noFileContent('other/README.md', 'coveralls');
  });
});
