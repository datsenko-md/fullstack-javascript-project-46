import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import genDiff,
{
  normalizePath,
  getValue,
  getState,
  getType,
  getDiff,
} from '../../src/genDiff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '../..', '__fixtures__', filename);
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

test('getType wrong type', () => {
  const filename = 'file3.yml2';
  expect(() => getType(filename)).toThrow(Error);
});

test('getDiff', () => {
  const expected = JSON.parse(readFile('diff_correct.json'));
  const data1 = JSON.parse(readFile('file1.json'));
  const data2 = JSON.parse(readFile('file2.json'));
  expect(getDiff(data1, data2)).toEqual(expected);
});

test('getValue', () => {
  const obj1 = {
    key1: 'value1',
    key2: 'value2',
    key3: 'value3',
  };
  const obj2 = {
    key0: 'value0',
    key2: 'value2',
    key3: 'value4',
  };
  expect(getValue(obj1, obj2, 'key0', 'added')).toEqual(['value0']);
  expect(getValue(obj1, obj2, 'key1', 'removed')).toEqual(['value1']);
  expect(getValue(obj1, obj2, 'key2', 'unchanged')).toEqual(['value2']);
  expect(getValue(obj1, obj2, 'key3', 'changed')).toEqual(['value3', 'value4']);
});
