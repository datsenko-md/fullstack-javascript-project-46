/* eslint no-restricted-syntax: off */

import path from 'path';
import process from 'process';
import fs from 'fs';
import _ from 'lodash';
import getFormatter from '../formatters/index.js';
import getParser from './parsers.js';

const normalizePath = (filepath = '') => {
  const cwd = process.cwd();
  return path.isAbsolute(filepath) ? path.resolve(filepath) : path.resolve(cwd, filepath);
};

const readFile = (filepath) => fs.readFileSync(normalizePath(filepath));

const getType = (filename) => {
  const extension = path.extname(filename).slice(1);
  const extMap = {
    json: 'json',
    yaml: 'yml',
    yml: 'yml',
  };
  if (!Object.keys(extMap).includes(extension)) {
    throw new Error(`Files with extension .${extension} is not allowed`);
  }
  return extMap[extension];
};

const getState = (obj1, obj2, key) => {
  if (!Object.hasOwn(obj1, key)) {
    return 'added';
  } if (!Object.hasOwn(obj2, key)) {
    return 'removed';
  } if ((obj1[key] === obj2[key]) || (_.isObject(obj1[key]) && _.isObject(obj2[key]))) {
    return 'unchanged';
  }
  return 'changed';
};

const getValue = (obj1, obj2, key, state) => {
  switch (state) {
    case 'added':
      return [obj2[key]];
    case 'removed':
      return [obj1[key]];
    case 'changed':
      return [obj1[key], obj2[key]];
    default:
      return [obj1[key]];
  }
};

const getDiff = (obj1, obj2) => {
  const keys = _.union(Object.keys(obj1), Object.keys(obj2));
  const sorted = _.sortBy(keys);
  const diff = sorted.map((key) => {
    const children = _.isObject(obj1[key]) && _.isObject(obj2[key])
      ? getDiff(obj1[key], obj2[key]) : [];
    const state = getState(obj1, obj2, key);
    const value = children.length > 0 ? [] : getValue(obj1, obj2, key, state);
    return {
      key, state, value, children,
    };
  });
  return diff;
};

const genDiff = (filepath1, filepath2, formatName = 'stylish') => {
  const format = getFormatter(formatName);
  const parse = getParser(getType(filepath1));
  const data1 = readFile(filepath1);
  const data2 = readFile(filepath2);
  const obj1 = parse(data1);
  const obj2 = parse(data2);
  const diff = getDiff(obj1, obj2);
  const formatted = format(diff);
  return formatted;
};

export {
  normalizePath,
  getState,
  getType,
  getDiff,
  getValue,
};
export default genDiff;
