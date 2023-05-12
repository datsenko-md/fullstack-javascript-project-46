/* eslint no-restricted-syntax: off */

import path from 'path';
import process from 'process';
import fs from 'fs';
import _ from 'lodash';
import { jsonParser, ymlParser } from './parsers.js';

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

  return extMap[extension];
};

const parseData = (data, type = 'json') => {
  const parse = {
    json: jsonParser,
    yml: ymlParser,
  };
  return parse[type](data);
};

const getState = (obj1, obj2, key) => {
  let state;
  if (!Object.hasOwn(obj1, key)) {
    state = 'added';
  } else if (!Object.hasOwn(obj2, key)) {
    state = 'removed';
  } else if ((obj1[key] === obj2[key]) || (_.isObject(obj1[key]) && _.isObject(obj2[key]))) {
    state = 'unchanged';
  } else {
    state = 'changed';
  }
  return state;
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
    return [key, state, value, children];
  });
  return diff;
};

const stylishReplacer = ' ';
const stylishSpacesCount = 4;

const stringify = (
  currentValue,
  depth = 1,
  replacer = stylishReplacer,
  spacesCount = stylishSpacesCount,
) => {
  if (!_.isObject(currentValue) || currentValue === null) {
    return `${currentValue}`;
  }

  const indentSize = depth * spacesCount;
  const currentIndent = replacer.repeat(indentSize);
  const bracketIndent = replacer.repeat(indentSize - spacesCount);
  const lines = Object
    .entries(currentValue)
    .map(([key, value]) => `${currentIndent}${key}: ${stringify(value, depth + 1, replacer, spacesCount)}`);

  return [
    '{',
    ...lines,
    `${bracketIndent}}`,
  ].join('\n');
};

const stylish = (data, replacer = stylishReplacer, spacesCount = stylishSpacesCount) => {
  const iter = (currentValue, depth) => {
    if (!_.isArray(currentValue) || currentValue === null) {
      return `${currentValue}`;
    }

    const indentSize = depth * spacesCount - 2;
    const currentIndent = replacer.repeat(indentSize);
    const bracketIndent = replacer.repeat(indentSize + 2 - spacesCount);
    const lines = currentValue
      .flatMap(([key, state, value, children]) => {
        switch (state) {
          case 'added':
            return [`${currentIndent}+ ${key}: ${stringify(...value, depth + 1)}`];
          case 'removed':
            return [`${currentIndent}- ${key}: ${stringify(...value, depth + 1)}`];
          case 'changed':
            return [
              `${currentIndent}- ${key}: ${stringify(value[0], depth + 1)}`,
              `${currentIndent}+ ${key}: ${stringify(value[1], depth + 1)}`,
            ];
          default:
            return children.length > 0 ? `${currentIndent}  ${key}: ${iter(children, depth + 1)}`
              : `${currentIndent}  ${key}: ${stringify(...value, depth + 1)}`;
        }
      });

    return [
      '{',
      ...lines,
      `${bracketIndent}}`,
    ].join('\n');
  };

  return iter(data, 1);
};

const format = (diff, formatter) => formatter(diff);

const genDiff = (filepath1, filepath2, formatter = stylish) => {
  const data1 = readFile(filepath1);
  const data2 = readFile(filepath2);
  const type1 = getType(filepath1);
  const type2 = getType(filepath2);
  const obj1 = parseData(data1, type1);
  const obj2 = parseData(data2, type2);
  const diff = getDiff(obj1, obj2);
  const formatted = format(diff, formatter);
  return formatted;
};

export {
  normalizePath,
  getState,
  getType,
  parseData,
  stringify,
  getDiff,
  stylish,
};
export default genDiff;
