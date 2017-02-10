'use strict';

const Base = require('../base');

module.exports = Base.extend({
  constructor: function srcContrsuctor(...args) {
    Base.apply(this, args);
  },

  writing: {
    templates: function srcTemplates() {
      this.fs.copy(this.templatePath('.jsbeautifyrc'), this.destinationPath('.jsbeautifyrc'));
    },
  },
});
