import _ from 'lodash';
import yaml from 'js-yaml';

const getParser = (type) => {
  const parsers = {
    json: (data) => JSON.parse(data),
    yml: (data) => yaml.load(data) ?? {},
  };
  if (!_.has(parsers, type)) {
    throw new Error(`Unknown file type: ${type.toUpperCase()}`);
  }

  return parsers[type];
};

export default getParser;
