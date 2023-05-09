/* eslint no-restricted-syntax: off */

import path from 'path';
import process from 'process';
import fs from 'fs';
import _ from 'lodash';
import yaml from 'js-yaml';

const normalizePath = (filepath = '') => {
  const cwd = process.cwd();
  return path.isAbsolute(filepath) ? path.resolve(filepath) : path.resolve(cwd, filepath);
};

const getState = (obj1, obj2, key) => {
  let state;
  if (!Object.hasOwn(obj1, key)) {
    state = 'added';
  } else if (!Object.hasOwn(obj2, key)) {
    state = 'removed';
  } else if (obj1[key] === obj2[key]) {
    state = 'unchanged';
  } else {
    state = 'changed';
  }
  return state;
};

const getEntry = (obj1, obj2, key, state) => {
  const result = [];
  switch (state) {
    case 'removed':
      result.push(`- ${key}: ${obj1[key]}`);
      break;
    case 'added':
      result.push(`+ ${key}: ${obj2[key]}`);
      break;
    case 'changed':
      result.push(`- ${key}: ${obj1[key]}`);
      result.push(`+ ${key}: ${obj2[key]}`);
      break;
    default:
      result.push(`  ${key}: ${obj1[key]}`);
  }

  return result;
};

const getType = (filename) => {
  const extension = path.extname(filename).slice(1);
  const extMap = {
    json: 'json',
    yaml: 'yml',
    yml: 'yml',
  };

  return extMap[extension];
};

const parseData = (data, type = 'json') => {
  const parse = {
    json: (content) => JSON.parse(content),
    yml: (content) => yaml.load(content),
  };
  return parse[type](data);
};

const genDiff = (filepath1, filepath2) => {
  const type = getType(filepath1);
  const data1 = fs.readFileSync(normalizePath(filepath1));
  const data2 = fs.readFileSync(normalizePath(filepath2));
  const obj1 = parseData(data1, type);
  const obj2 = parseData(data2, type);
  const keys = _.union(Object.keys(obj1), Object.keys(obj2));
  const sorted = _.sortBy(keys);
  const states = sorted.map((key) => [key, getState(obj1, obj2, key)]);
  const entries = states.flatMap(([key, state]) => getEntry(obj1, obj2, key, state));
  const result = `{\n${entries.map((item) => `  ${item}`).join('\n')}\n}`;
  return result;
};

export {
  normalizePath,
  getState,
  getEntry,
  getType,
  parseData,
};
export default genDiff;
