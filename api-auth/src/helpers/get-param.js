module.exports = (params, name, defaultValue = null) => {
  if (typeof params !== 'object') params = {};

  let value = defaultValue;

  if (typeof params[name] !== 'undefined') {
    value = params[name];
  }

  return value;
}
