/* eslint-disable quote-props */

import _ from 'lodash';
import stylish from './stylish.js';
import plain from './plain.js';
import json from './json.js';

const getFormatter = (formatName) => {
  const formatters = {
    'stylish': stylish,
    'plain': plain,
    'json': json,
  };
  if (!_.has(formatters, formatName)) {
    throw new Error(`Unknown format name: ${formatName}`);
  }

  return formatters[formatName];
};

export default getFormatter;
