/* eslint no-restricted-syntax: off */

import path from 'path';
import process from 'process';
import fs from 'fs';
import _ from 'lodash';

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

const genDiff = (filepath1, filepath2) => {
  const normalized1 = normalizePath(filepath1);
  const normalized2 = normalizePath(filepath2);
  const data1 = fs.readFileSync(normalized1);
  const data2 = fs.readFileSync(normalized2);
  const obj1 = JSON.parse(data1);
  const obj2 = JSON.parse(data2);
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
};
export default genDiff;
