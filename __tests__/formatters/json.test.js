import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import json from '../../formatters/json.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getFixturePath = (filename) => path.join(__dirname, '../..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

test('json', () => {
  const diff = JSON.parse(readFile('diff_correct.json'));
  const expected = readFile('json_correct.json');
  expect(json(diff)).toEqual(expected);
});
