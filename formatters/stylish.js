import _ from 'lodash';

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
      .flatMap(({
        key, state, value, children,
      }) => {
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

export default stylish;
export { stringify };
