import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import genDiff,
{
  normalizePath,
  getState,
  getType,
  parseData,
  stringify,
  getDiff,
  stylish,
  plain,
} from '../src/genDiff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

test('genDiff', () => {
  const filepath1 = getFixturePath('file1.json');
  const filepath2 = getFixturePath('file2.json');
  const expected = readFile('correct.txt');

  expect(genDiff(filepath1, filepath2)).toEqual(expected);
});

test('genDiffYAML', () => {
  const filepath1 = getFixturePath('file1.yaml');
  const filepath2 = getFixturePath('file2.yml');
  const expected = readFile('correct.txt');

  expect(genDiff(filepath1, filepath2)).toEqual(expected);
});

test('normalizePath', () => {
  const filepath1 = '/usr/bin/../test';
  const expected1 = '/usr/test';
  expect(normalizePath(filepath1)).toEqual(expected1);

  const cwd = process.cwd();
  const filepath2 = 'usr/bin';
  const expected2 = [cwd, 'usr', 'bin'].join('/');
  expect(normalizePath(filepath2)).toEqual(expected2);

  const expected3 = cwd;
  expect(normalizePath()).toEqual(expected3);
});

test('getState', () => {
  const obj1 = {
    a: 'value',
    b: 'value2',
    d: 'value5',
  };
  const obj2 = {
    b: 'valu3',
    c: 'value4',
    d: 'value5',
  };
  expect(getState(obj1, obj2, 'a')).toEqual('removed');
  expect(getState(obj1, obj2, 'b')).toEqual('changed');
  expect(getState(obj1, obj2, 'c')).toEqual('added');
  expect(getState(obj1, obj2, 'd')).toEqual('unchanged');
});

test('getType', () => {
  const filename1 = 'file1.json';
  const filename2 = 'file2.yaml';
  const filename3 = 'file3.yml';

  expect(getType(filename1)).toEqual('json');
  expect(getType(filename2)).toEqual('yml');
  expect(getType(filename3)).toEqual('yml');
});

test('parseData', () => {
  const data1 = readFile('file1.json');
  const data2 = readFile('file1.yaml');
  const expected = JSON.parse(readFile('correct.json'));

  expect(parseData(data1, 'json')).toEqual(expected);
  expect(parseData(data2, 'yml')).toEqual(expected);
});

test('parseData empty data', () => {
  const data1 = '{}';
  const data2 = '';
  const expected = {};

  expect(parseData(data1, 'json')).toEqual(expected);
  expect(parseData(data2, 'yml')).toEqual(expected);
});

test('stringify plain', () => {
  expect(stringify('value')).toEqual('value');
  expect(stringify(5)).toEqual('5');
  expect(stringify(null)).toEqual('null');
  expect(stringify(1.25)).toEqual('1.25');
});

test('stringify nested', () => {
  const [expected1, expected2, expected3] = readFile('nested.txt').split('\n\n\n');
  const data = {
    string: 'value',
    boolean: true,
    number: 5,
    float: 1.25,
    object: {
      5: 'number',
      1.25: 'float',
      null: null,
      true: 'boolean',
      value: 'string',
      nested: {
        boolean: true,
        float: 1.25,
        string: 'value',
        number: 5,
        null: null,
      },
    },
  };
  expect(stringify(data, 1, ' ', 1)).toEqual(expected1);
  expect(stringify(data, 1, '->', 1)).toEqual(expected2);
  expect(stringify(data, 1, '<-', 2)).toEqual(expected3);
});

test('getDiff', () => {
  const expected = JSON.parse(readFile('diff_correct.json'));
  const data1 = JSON.parse(readFile('file1.json'));
  const data2 = JSON.parse(readFile('file2.json'));
  expect(getDiff(data1, data2)).toEqual(expected);
});

test('stylish', () => {
  const diff = JSON.parse(readFile('diff_correct.json'));
  const expected = readFile('correct.txt');
  expect(stylish(diff)).toEqual(expected);
});

test('plain', () => {
  const diff = JSON.parse(readFile('diff_correct.json'));
  const expected = readFile('plain_correct.txt');
  expect(plain(diff)).toEqual(expected);
});
