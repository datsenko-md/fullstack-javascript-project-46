import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import plain, { stringify } from '../../formatters/plain.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getFixturePath = (filename) => path.join(__dirname, '../..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

test('stringify', () => {
  expect(stringify('value')).toEqual("'value'");
  expect(stringify(null)).toEqual('null');
  expect(stringify(true)).toEqual('true');
  expect(stringify({ key: 'value' })).toEqual('[complex value]');
});

test('plain', () => {
  const diff = JSON.parse(readFile('diff_correct.json'));
  const expected = readFile('plain_correct.txt');
  expect(plain(diff)).toEqual(expected);
});
