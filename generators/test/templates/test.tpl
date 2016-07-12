'use strict';

import test from 'ava';
import <%= camelName %> from '<%= indexPath %>';

test('awesome:test', t => {
  const message = 'everything is awesome';
  t.is(<%= camelName %>('awesome'), message, message);
});
