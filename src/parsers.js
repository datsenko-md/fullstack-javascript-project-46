import yaml from 'js-yaml';

const jsonParser = (data) => JSON.parse(data);
const ymlParser = (data) => yaml.load(data) ?? {};

export {
  jsonParser,
  ymlParser,
};
