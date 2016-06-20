'use strict';
const Base = require('../base');

module.exports = Base.extend({
  constructor: function srcContrsuctor() {
    Base.apply(this, arguments);
  },

  writing: {
    templates: function srcTemplates() {
      this.fs.copy(this.templatePath('.sublimelinterrc'), this.destinationPath('.sublimelinterrc'));
    },
  },
});
