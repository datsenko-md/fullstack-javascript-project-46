import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import stylish, { stringify } from '../../formatters/stylish.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getFixturePath = (filename) => path.join(__dirname, '../..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

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

test('stylish', () => {
  const diff = JSON.parse(readFile('diff_correct.json'));
  const expected = readFile('correct.txt');
  expect(stylish(diff)).toEqual(expected);
});
