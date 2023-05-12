import getFormatter from '../../formatters/index.js';
import plain from '../../formatters/plain.js';
import stylish from '../../formatters/stylish.js';

test('getFormatter', () => {
  expect(getFormatter('plain')).toBe(plain);
  expect(getFormatter('stylish')).toBe(stylish);
  expect(() => getFormatter('wrong')).toThrow(Error);
});
