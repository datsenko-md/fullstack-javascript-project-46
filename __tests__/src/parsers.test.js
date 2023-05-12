import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import getParser from '../../src/parsers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getFixturePath = (filename) => path.join(__dirname, '../..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

test('parse', () => {
  const parse1 = getParser('json');
  const parse2 = getParser('yml');
  const data1 = readFile('file1.json');
  const data2 = readFile('file1.yaml');
  const expected = JSON.parse(readFile('correct.json'));
  expect(parse1(data1)).toEqual(expected);
  expect(parse2(data2)).toEqual(expected);
});

test('parse empty data', () => {
  const parse1 = getParser('json');
  const parse2 = getParser('yml');
  const data1 = '{}';
  const data2 = '';
  const expected = {};
  expect(parse1(data1)).toEqual(expected);
  expect(parse2(data2, 'yml')).toEqual(expected);
});

test('parse wrong type', () => {
  expect(() => getParser('json2')).toThrow(Error);
});
