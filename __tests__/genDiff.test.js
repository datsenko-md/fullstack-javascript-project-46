import process from 'process';
import path from 'path';
import genDiff,
{
  normalizePath,
  getState,
  getEntry,
} from '../src/genDiff.js';

test('genDiff', () => {
  const filename1 = 'file1.json';
  const filename2 = 'file2.json';
  const cwd = process.cwd();
  const filepath1 = path.resolve(cwd, filename1);
  const filepath2 = path.resolve(filename2);
  const expected = `{
  - follow: false
    host: hexlet.io
  - proxy: 123.234.53.22
  - timeout: 50
  + timeout: 20
  + verbose: true
}`;

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

test('getEntry', () => {
  const obj1 = {
    a: 'value',
    b: 'value2',
    d: 'value5',
  };
  const obj2 = {
    b: 'value3',
    c: 'value4',
    d: 'value5',
  };

  const expected1 = ['- a: value'];
  const expected2 = ['- b: value2', '+ b: value3'];
  const expected3 = ['+ c: value4'];
  const expected4 = ['  d: value5'];

  expect(getEntry(obj1, obj2, 'a', 'removed')).toEqual(expected1);
  expect(getEntry(obj1, obj2, 'b', 'changed')).toEqual(expected2);
  expect(getEntry(obj1, obj2, 'c', 'added')).toEqual(expected3);
  expect(getEntry(obj1, obj2, 'd', 'unchenged')).toEqual(expected4);
});
