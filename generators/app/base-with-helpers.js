'use strict';

const defined = require('defined');

const Base = require('../base');

module.exports = class extends Base {
  shouldAskUserInfo(prop) {
    return this.shouldAskAll || !defined(this.savedAnswers[prop]);
  }

};
