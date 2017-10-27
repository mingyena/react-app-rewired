const path = require('path');

const babelLoaderMatcher = function(rule) {
  return rule.loader && rule.loader.indexOf(`babel-loader${path.sep}`) != -1;
};

const getLoader = function(rules, matcher) {
  var loader;

  rules.some(rule => {
    return (loader = matcher(rule)
      ? rule
      : getLoader(rule.use || rule.oneOf || [], matcher));
  });

  return loader;
};

const getBabelLoader = function(rules) {
  return getLoader(rules, babelLoaderMatcher);
};

const injectBabelPlugin = function(pluginName, config) {
  const loader = getBabelLoader(config.module.rules);
  if (!loader) {
    console.log('babel-loader not found');
    return config;
  }
  const plugins = Array.isArray(pluginName) ? pluginName : [pluginName];
  // Older versions of webpack have `plugins` on `loader.query` instead of `loader.options`.
  const options = loader.options || loader.query;
  options.plugins = plugins.concat(options.plugins || []);
  return config;
};

const compose = function(...funcs) {
  if (funcs.length === 0) {
    return config => config;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (config, env) => a(b(config, env), env));
};

module.exports = { getLoader, getBabelLoader, injectBabelPlugin, compose };
