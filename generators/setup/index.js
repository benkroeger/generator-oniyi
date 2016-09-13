'use strict';
const Base = require('../base');

module.exports = Base.extend({
  constructor: function srcContrsuctor(...args) {
    Base.apply(this, args);
  },

  writing: {
    templates: function srcTemplates() {
      ['sublimelinterrc', 'jsbeautifyrc'].forEach(fileName =>
        this.fs.copy(this.templatePath(fileName), this.destinationPath(`.${fileName}`))
      );
    },
  },
});
