import _ from 'lodash';

const stringify = (data) => {
  if (_.isObject(data)) {
    return '[complex value]';
  } if (_.isNull(data) || _.isBoolean(data) || _.isNumber(data)) {
    return `${data}`;
  }
  return `'${data}'`;
};

const plain = (diff) => {
  const iter = (currentValue, breadcrumbs) => {
    const lines = currentValue
      .map(({
        key, state, value, children,
      }) => {
        const currentPath = [...breadcrumbs, key].join('.');
        switch (state) {
          case 'added':
            return `Property '${currentPath}' was added with value: ${stringify(...value)}`;
          case 'removed':
            return `Property '${currentPath}' was removed`;
          case 'changed':
            return `Property '${currentPath}' was updated. From ${stringify(value[0])} to ${stringify(value[1])}`;
          default:
            return children.length > 0 ? iter(children, [...breadcrumbs, key]) : '';
        }
      })
      .filter((line) => line !== '');
    return lines.join('\n');
  };

  return iter(diff, []);
};

export default plain;
export { stringify };
